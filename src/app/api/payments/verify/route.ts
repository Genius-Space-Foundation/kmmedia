import { NextRequest, NextResponse } from "next/server";
import {
  verifyPayment,
  updatePaymentStatus,
  convertFromPesewas,
} from "@/lib/payments/paystack";
import { prisma } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { sendEmail } from "@/lib/notifications/email";
import { extendedEmailTemplates } from "@/lib/notifications/email-templates-extended";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const verifyPaymentSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = verifyPaymentSchema.parse(body);

    // Verify payment with Paystack
    const paystackResponse = await verifyPayment(reference);

    if (!paystackResponse.status) {
      return NextResponse.json(
        { success: false, message: paystackResponse.message },
        { status: 400 }
      );
    }

    const paymentData = paystackResponse.data;

    // Check if payment was successful
    if (paymentData.status === "success") {
      // Update payment status in database
      await updatePaymentStatus(
        reference,
        PaymentStatus.COMPLETED,
        paymentData
      );

      // Get payment details
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: {
          user: true,
          application: {
            include: {
              course: true, // ADD THIS - needed for line 220
            },
          },
          enrollment: {
            include: {
              course: true, // ADD THIS - needed for line 220
            },
          },
        },
      });

      if (!payment) {
        return NextResponse.json(
          { success: false, message: "Payment record not found" },
          { status: 404 }
        );
      }

      // Handle different payment types
      // Handle different payment types
      if (payment.type === "APPLICATION_FEE") {
        // If linked to an application (legacy flow or late linking), update status
        if (payment.application) {
          await prisma.application.update({
            where: { id: payment.application.id },
            data: { status: "UNDER_REVIEW" },
          });
        }
        // If not linked, do nothing. The application creation endpoint will find this payment.
      } else if (payment.type === "TUITION") {
        if (payment.enrollment) {
          // Update existing enrollment status
          await prisma.enrollment.update({
            where: { id: payment.enrollment.id },
            data: { status: "ACTIVE" },
          });
        } else if (payment.application) {
          // New Flow: Create Enrollment
          // Check if enrollment already exists to be safe
          const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: payment.userId,
                courseId: payment.application.courseId,
              },
            },
          });

          let enrollmentId = existingEnrollment?.id;

          if (!existingEnrollment) {
            const newEnrollment = await prisma.enrollment.create({
              data: {
                userId: payment.userId,
                courseId: payment.application.courseId,
                status: "ACTIVE",
              },
            });
            enrollmentId = newEnrollment.id;
          } else {
             // If it exists but wasn't linked (rare), update status
             await prisma.enrollment.update({
                where: { id: enrollmentId },
                data: { status: "ACTIVE" },
             });
          }

          // Link payment to enrollment
          await prisma.payment.update({
            where: { id: payment.id },
            data: { enrollmentId },
          });
        }
      } else if (payment.type === "INSTALLMENT" && paymentData.metadata?.type === "INSTALLMENT_INIT") {
          // Handle First Installment (Upfront)
          if (payment.application) {
             const course = await prisma.course.findUnique({
                where: { id: payment.application.courseId },
             });

             if (course && course.installmentPlan) {
                // 1. Create Enrollment
                const enrollment = await prisma.enrollment.create({
                   data: {
                      userId: payment.userId,
                      courseId: course.id,
                      status: "ACTIVE",
                   }
                });

                // 2. Create Payment Plan
                const planConfig = course.installmentPlan as any;
                const totalAmount = course.price;
                const installmentCount = 3; // Default to 3 (Upfront, Mid, Completion) - or derive from config
                const monthlyAmount = (totalAmount - payment.amount) / (installmentCount - 1); // Remaining divided by remaining installments

                const paymentPlan = await prisma.paymentPlan.create({
                   data: {
                      userId: payment.userId,
                      courseId: course.id,
                      totalAmount: totalAmount,
                      installmentCount: installmentCount,
                      monthlyAmount: monthlyAmount,
                      startDate: new Date(),
                      endDate: new Date(new Date().setMonth(new Date().getMonth() + installmentCount)), // Approx
                      status: "ACTIVE",
                      description: `Installment plan for ${course.title}`,
                   }
                });

                // 3. Create Installment Records
                // First one (Paid)
                await prisma.paymentInstallment.create({
                   data: {
                      paymentPlanId: paymentPlan.id,
                      installmentNumber: 1,
                      amount: payment.amount,
                      dueDate: new Date(),
                      status: "PAID",
                      paidAt: new Date(),
                      paymentId: payment.id
                   }
                });

                // Remaining installments
                // This is a simplified logic. In a real app, we'd parse the planConfig more carefully (e.g. 40%, 30%, 30%)
                // Assuming 3 parts for now based on PRD example
                // let remainingAmount = totalAmount - payment.amount;
                let nextDueDate = new Date();
                
                // Example: Mid-course (approx 1 month later)
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                const midAmount = (totalAmount * (planConfig.midCourse || 30)) / 100;
                
                await prisma.paymentInstallment.create({
                   data: {
                      paymentPlanId: paymentPlan.id,
                      installmentNumber: 2,
                      amount: midAmount,
                      dueDate: nextDueDate,
                      status: "PENDING",
                   }
                });

                // Example: Completion (approx 2 months later)
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                const completionAmount = (totalAmount * (planConfig.completion || 30)) / 100;

                await prisma.paymentInstallment.create({
                   data: {
                      paymentPlanId: paymentPlan.id,
                      installmentNumber: 3,
                      amount: completionAmount,
                      dueDate: nextDueDate,
                      status: "PENDING",
                   }
                });

                // Link payment to enrollment and plan
                await prisma.payment.update({
                   where: { id: payment.id },
                   data: { 
                      enrollmentId: enrollment.id,
                      // paymentPlanId is not directly on Payment model in schema provided, 
                      // but PaymentInstallment links back to Payment.
                      // If Payment has paymentPlanId (schema line 806 says PaymentInstallment[] on PaymentPlan, 
                      // but Payment model line 44 has paymentPlans PaymentPlan[]... wait.
                      // Let's check schema again.
                      // Payment model (line 525) does NOT have paymentPlanId. 
                      // But PaymentInstallment (line 811) has paymentId.
                      // So we linked it above in the first installment creation.
                   }
                });
             }
          }
      }

      // Send payment confirmation email (async)
      const courseTitle = payment.enrollment?.course?.title || payment.application?.course?.title || "Course";
      
      sendEmail({
        to: payment.user.email,
        ...extendedEmailTemplates.paymentConfirmation({
          studentName: payment.user.name || "Student",
          courseName: courseTitle,
          amount: convertFromPesewas(paymentData.amount),
          paymentMethod: "Paystack",
          reference: reference,
          receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/${payment.id}/receipt`,
        }),
      }).catch((error) => {
        console.error(`Failed to send payment confirmation email to ${payment.user.email}:`, error);
      });

      // Send enrollment confirmation email if enrollment is active (async)
      if (payment.type === "TUITION" || (payment.type === "INSTALLMENT" && paymentData.metadata?.type === "INSTALLMENT_INIT")) {
         // Re-fetch enrollment to get course details if needed, or use what we have
         // We need courseId to fetch course title for enrollment email if not already available
         const courseId = payment.enrollment?.courseId || payment.application?.courseId;
         
         if (courseId) {
            const course = await prisma.course.findUnique({
               where: { id: courseId },
               select: { title: true, id: true },
            });

            if (course) {
               sendEmail({
                  to: payment.user.email,
                  ...extendedEmailTemplates.enrollmentConfirmation({
                     studentName: payment.user.name || "Student",
                     courseName: course.title,
                     courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}/learn`,
                  }),
               }).catch((error) => {
                  console.error(`Failed to send enrollment confirmation email to ${payment.user.email}:`, error);
               });
            }
         }
      }

      return NextResponse.json({
        success: true,
        data: {
          reference,
          amount: convertFromPesewas(paymentData.amount),
          status: "success",
          paidAt: paymentData.paid_at,
          payment,
        },
        message: "Payment verified successfully",
      });
    } else {
      // Payment failed
      await updatePaymentStatus(reference, PaymentStatus.FAILED, paymentData);

      return NextResponse.json({
        success: false,
        data: {
          reference,
          status: paymentData.status,
          message: paymentData.gateway_response,
        },
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      { status: 500 }
    );
  }
}
