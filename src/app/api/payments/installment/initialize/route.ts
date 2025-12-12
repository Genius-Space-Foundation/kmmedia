import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import {
  initializePayment,
  generatePaymentReference,
  convertToPesewas,
} from "@/lib/payments/paystack";
import { createPaymentRecord } from "@/lib/payments/paystack";
import { prisma } from "@/lib/db";
import { PaymentType } from "@prisma/client";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const initializeInstallmentSchema = z.object({
  applicationId: z.string().optional(),
  enrollmentId: z.string().optional(),
}).refine(data => data.applicationId || data.enrollmentId, {
  message: "Either applicationId or enrollmentId is required"
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { applicationId, enrollmentId } = initializeInstallmentSchema.parse(body);
    const userId = req.user!.userId;

    // 1. Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let courseData;
    let targetEnrollmentId;
    let targetApplicationId;

    // 2. Handle either application or enrollment based payment
    if (enrollmentId) {
      // Subsequent installment - student already enrolled
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              installmentEnabled: true,
              installmentPlan: true,
            }
          }
        }
      });

      if (!enrollment) {
        return NextResponse.json(
          { success: false, message: "Enrollment not found" },
          { status: 404 }
        );
      }

      if (enrollment.userId !== userId) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }

      courseData = enrollment.course;
      targetEnrollmentId = enrollment.id;
    } else if (applicationId) {
      // First installment - from approved application
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              installmentEnabled: true,
              installmentPlan: true,
            }
          }
        }
      });

      if (!application) {
        return NextResponse.json(
          { success: false, message: "Application not found" },
          { status: 404 }
        );
      }

      if (application.userId !== userId) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }

      if (application.status !== "APPROVED") {
        return NextResponse.json(
          { success: false, message: "Application is not approved yet" },
          { status: 400 }
        );
      }

      // Check if already enrolled (shouldn't happen for applicationId path)
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: application.courseId,
          },
        },
      });

      if (existingEnrollment) {
        return NextResponse.json(
          { success: false, message: "You are already enrolled in this course" },
          { status: 400 }
        );
      }

      courseData = application.course;
      targetApplicationId = application.id;
    }

    if (!courseData || !courseData.installmentEnabled || !courseData.installmentPlan) {
      return NextResponse.json(
        { success: false, message: "Installment payments are not enabled for this course" },
        { status: 400 }
      );
    }

    // 3. Calculate Installment Amount
    const plan = courseData.installmentPlan as any;
    const upfrontPercentage = plan.upfront || 0;
    
    if (upfrontPercentage <= 0) {
        return NextResponse.json(
            { success: false, message: "Invalid installment plan configuration" },
            { status: 500 }
        );
    }

    const installmentAmount = (courseData.price * upfrontPercentage) / 100;

    // 4. Initialize Payment
    const reference = generatePaymentReference();
    
    const paystackResponse = await initializePayment({
      email: user.email,
      amount: convertToPesewas(installmentAmount),
      reference,
      metadata: {
        userId,
        type: enrollmentId ? "INSTALLMENT" : "INSTALLMENT_INIT",
        applicationId: targetApplicationId,
        enrollmentId: targetEnrollmentId,
        courseId: courseData.id,
        custom_fields: [
          {
            display_name: "Payment Type",
            variable_name: "payment_type",
            value: `Installment Payment (${upfrontPercentage}%)`
          },
          {
            display_name: "Course",
            variable_name: "course_title",
            value: courseData.title
          }
        ]
      },
    });

    if (!paystackResponse.status) {
      return NextResponse.json(
        { success: false, message: paystackResponse.message },
        { status: 400 }
      );
    }

    // 5. Create Payment Record
    await createPaymentRecord({
      userId,
      type: "INSTALLMENT",
      amount: installmentAmount,
      reference,
    });
    
    await prisma.payment.update({
      where: { reference },
      data: { 
        applicationId: targetApplicationId,
        enrollmentId: targetEnrollmentId,
        description: `Installment payment (${upfrontPercentage}%) for ${courseData.title}`
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        reference,
        accessCode: paystackResponse.data.access_code,
      },
      message: "Installment payment initialized successfully",
    });

  } catch (error) {
    console.error("Installment initialization error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Payment initialization failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(handler);
