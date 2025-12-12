import { NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { verifyPayment } from "@/lib/payments/paystack";
import { prisma } from "@/lib/db";
import { PaymentStatus, EnrollmentStatus } from "@prisma/client";
import { sendEmail } from "@/lib/notifications/email";
import { extendedEmailTemplates } from "@/lib/notifications/email-templates-extended";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function handler(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminId = req.user!.userId;

    // 1. Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        application: {
          include: {
            course: true,
          },
        },
        enrollment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // 2. Verify payment with Paystack
    const verification = await verifyPayment(payment.reference);

    if (!verification.status) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
          details: verification.message,
        },
        { status: 400 }
      );
    }

    const paystackData = verification.data;

    // 3. Check Paystack payment status
    if (paystackData.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: `Payment status is ${paystackData.status}, not successful`,
        },
        { status: 400 }
      );
    }

    // 4. Update payment in database
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(paystackData.paid_at),
        metadata: paystackData,
      },
      include: {
        user: true,
        enrollment: {
          include: {
            course: true,
          },
        },
      },
    });

    // 5. Handle enrollment activation based on payment type
    if (payment.type === "TUITION" && payment.enrollmentId) {
      await prisma.enrollment.update({
        where: { id: payment.enrollmentId },
        data: { status: EnrollmentStatus.ACTIVE },
      });
    } else if (payment.type === "INSTALLMENT" && payment.enrollmentId) {
      // Check if all installments are paid
      const allPayments = await prisma.payment.findMany({
        where: {
          enrollmentId: payment.enrollmentId,
          type: "INSTALLMENT",
        },
      });

      const allPaid = allPayments.every(
        (p) => p.status === PaymentStatus.COMPLETED
      );

      if (allPaid) {
        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: { status: EnrollmentStatus.ACTIVE },
        });
      }
    }

    // 6. Send confirmation email
    const courseTitle = 
      payment.enrollment?.course?.title || 
      payment.application?.course?.title || 
      "Course";

    sendEmail({
      to: payment.user.email,
      ...extendedEmailTemplates.paymentConfirmation({
        studentName: payment.user.name || "Student",
        courseName: courseTitle,
        amount: payment.amount,
        paymentMethod: "Paystack",
        reference: payment.reference,
        receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/${payment.id}/receipt`,
      }),
    }).catch((error) => {
      console.error("Failed to send confirmation email:", error);
    });

    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "CONFIRM_PAYMENT",
        resourceType: "PAYMENT",
        resourceId: payment.id,
        metadata: {
          paymentReference: payment.reference,
          amount: payment.amount,
          studentId: payment.userId,
          verifiedManually: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully",
      data: {
        payment: updatedPayment,
        paystackStatus: paystackData.status,
        paidAt: paystackData.paid_at,
      },
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to confirm payment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(handler);
