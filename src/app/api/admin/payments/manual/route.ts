import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { PaymentStatus, PaymentType, PaymentMethod } from "@prisma/client";
import { generatePaymentReference } from "@/lib/payments/paystack";
import { z } from "zod";

const manualPaymentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  courseId: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["APPLICATION_FEE", "TUITION", "INSTALLMENT"]),
  method: z.enum(["MANUAL", "BANK_TRANSFER"]),
  description: z.string().optional(),
  reference: z.string().optional(),
});

// Record manual payment (Admin only)
async function recordManualPayment(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const paymentData = manualPaymentSchema.parse(body);
    const adminId = req.user!.userId;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: paymentData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Verify course exists if courseId provided
    let course = null;
    if (paymentData.courseId) {
      course = await prisma.course.findUnique({
        where: { id: paymentData.courseId },
      });

      if (!course) {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        );
      }
    }

    // Generate reference if not provided
    const reference = paymentData.reference || generatePaymentReference();

    // Find related application or enrollment
    let applicationId = null;
    let enrollmentId = null;

    if (paymentData.courseId) {
      if (paymentData.type === "APPLICATION_FEE") {
        const application = await prisma.application.findUnique({
          where: {
            userId_courseId: {
              userId: paymentData.userId,
              courseId: paymentData.courseId,
            },
          },
        });
        applicationId = application?.id;
      } else {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: paymentData.userId,
              courseId: paymentData.courseId,
            },
          },
        });
        enrollmentId = enrollment?.id;
      }
    }

    // Create manual payment record
    const payment = await prisma.payment.create({
      data: {
        userId: paymentData.userId,
        type: paymentData.type as PaymentType,
        amount: paymentData.amount,
        status: PaymentStatus.COMPLETED, // Manual payments are immediately completed
        method: paymentData.method as PaymentMethod,
        reference,
        description: paymentData.description || `Manual ${paymentData.type.toLowerCase()} payment`,
        paidAt: new Date(),
        applicationId,
        enrollmentId,
        metadata: {
          recordedBy: adminId,
          recordedAt: new Date().toISOString(),
          method: paymentData.method,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        application: {
          select: {
            id: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        enrollment: {
          select: {
            id: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Handle post-payment actions
    if (paymentData.type === "TUITION" && enrollmentId) {
      // Activate enrollment for tuition payments
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: EnrollmentStatus.ACTIVE,
        },
      });
    }

    // Log the manual payment action
    await prisma.activityLog.create({
      data: {
        action: "MANUAL_PAYMENT_RECORDED",
        entity: "Payment",
        entityId: payment.id,
        details: {
          amount: paymentData.amount,
          type: paymentData.type,
          method: paymentData.method,
          userId: paymentData.userId,
          courseId: paymentData.courseId,
        },
        userId: adminId,
      },
    });

    return NextResponse.json({
      success: true,
      data: payment,
      message: "Manual payment recorded successfully",
    });
  } catch (error) {
    console.error("Manual payment error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Manual payment failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(recordManualPayment);

