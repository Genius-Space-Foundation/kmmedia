import { NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { sendEmail } from "@/lib/notifications/email";
import { extendedEmailTemplates } from "@/lib/notifications/email-templates-extended";

const refundSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  amount: z.number().positive().optional(),
});

// Process refund (Admin only)
async function processRefund(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { reason, amount } = refundSchema.parse(body);
    const adminId = req.user!.userId;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollment: true,
        application: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      return NextResponse.json(
        { success: false, message: "Only completed payments can be refunded" },
        { status: 400 }
      );
    }

    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      return NextResponse.json(
        { success: false, message: "Refund amount cannot exceed payment amount" },
        { status: 400 }
      );
    }

    // Start transaction for refund process
    const result = await prisma.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.REFUNDED,
          metadata: {
            ...payment.metadata,
            refund: {
              amount: refundAmount,
              reason,
              processedBy: adminId,
              processedAt: new Date().toISOString(),
            },
          },
        },
      });

      // Create refund record
      const refundRecord = await tx.payment.create({
        data: {
          userId: payment.userId,
          type: payment.type,
          amount: -refundAmount, // Negative amount for refund
          status: PaymentStatus.COMPLETED,
          method: "MANUAL",
          reference: `REFUND_${payment.reference}`,
          description: `Refund for ${payment.reference}: ${reason}`,
          paidAt: new Date(),
          metadata: {
            originalPaymentId: payment.id,
            refundReason: reason,
            processedBy: adminId,
          },
        },
      });

      // Handle enrollment/application status changes
      if (payment.enrollment && payment.type === "TUITION") {
        await tx.enrollment.update({
          where: { id: payment.enrollment.id },
          data: {
            status: "SUSPENDED",
          },
        });
      }

      // Log the refund action
      await tx.activityLog.create({
        data: {
          action: "PAYMENT_REFUNDED",
          entity: "Payment",
          entityId: payment.id,
          details: {
            originalAmount: payment.amount,
            refundAmount,
            reason,
            userId: payment.userId,
          },
          userId: adminId,
        },
      });

      return { updatedPayment, refundRecord };
    });

    // Send refund notification email to user (async, don't block response)
    const courseName = payment.enrollment
      ? (await prisma.course.findUnique({
          where: { id: payment.enrollment.courseId },
          select: { title: true },
        }))?.title || "Course"
      : payment.application
      ? (await prisma.course.findUnique({
          where: { id: payment.application.courseId },
          select: { title: true },
        }))?.title || "Course"
      : "Course";

    sendEmail({
      to: payment.user.email,
      ...extendedEmailTemplates.refundProcessed({
        userName: payment.user.name || "User",
        courseName: courseName,
        amount: refundAmount,
        reason: reason,
      }),
    }).catch((error) => {
      console.error(`Failed to send refund email to ${payment.user.email}:`, error);
    });

    console.log(`Refund processed and email sent: ${refundAmount} for payment ${payment.reference}`);

    return NextResponse.json({
      success: true,
      data: result.updatedPayment,
      message: "Refund processed successfully",
    });
  } catch (error) {
    console.error("Refund processing error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Refund processing failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(processRefund);
