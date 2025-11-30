import { prisma } from "@/lib/db";
import { verifyPaystackPayment } from "./paystack";

export interface PaymentVerificationResult {
  success: boolean;
  payment: any;
  message: string;
}

export async function verifyAndUpdatePayment(
  reference: string
): Promise<PaymentVerificationResult> {
  try {
    // Get payment record from database
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: {
        user: true,
        course: true,
      },
    });

    if (!payment) {
      return {
        success: false,
        payment: null,
        message: "Payment record not found",
      };
    }

    if (payment.status === "PAID") {
      return {
        success: true,
        payment,
        message: "Payment already verified",
      };
    }

    // Verify with Paystack
    const paystackResult = await verifyPaystackPayment(reference);

    if (!paystackResult.success) {
      return {
        success: false,
        payment,
        message: paystackResult.message || "Payment verification failed",
      };
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paystackReference: paystackResult.data.reference,
        paystackTransactionId: paystackResult.data.id,
      },
    });

    // Handle post-payment actions based on payment type
    await handlePostPaymentActions(updatedPayment);

    return {
      success: true,
      payment: updatedPayment,
      message: "Payment verified successfully",
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      payment: null,
      message: "Payment verification failed",
    };
  }
}

async function handlePostPaymentActions(payment: any) {
  switch (payment.type) {
    case "APPLICATION_FEE":
      await handleApplicationFeePayment(payment);
      break;
    case "TUITION":
      await handleTuitionPayment(payment);
      break;
    case "INSTALLMENT":
      await handleInstallmentPayment(payment);
      break;
  }
}

async function handleApplicationFeePayment(payment: any) {
  // Update application status to "PAID"
  if (payment.courseId) {
    await prisma.application.updateMany({
      where: {
        userId: payment.userId,
        courseId: payment.courseId,
      },
      data: {
        status: "PAID",
      },
    });
  }
}

async function handleTuitionPayment(payment: any) {
  // Enroll student in course
  if (payment.courseId) {
    await prisma.enrollment.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: "ACTIVE",
        enrolledAt: new Date(),
      },
    });
  }
}

async function handleInstallmentPayment(payment: any) {
  // Check if all installments are paid
  const totalInstallments = await prisma.payment.count({
    where: {
      userId: payment.userId,
      courseId: payment.courseId,
      type: "INSTALLMENT",
    },
  });

  const paidInstallments = await prisma.payment.count({
    where: {
      userId: payment.userId,
      courseId: payment.courseId,
      type: "INSTALLMENT",
      status: "PAID",
    },
  });

  // If all installments are paid, enroll student
  if (totalInstallments === paidInstallments) {
    await prisma.enrollment.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: "ACTIVE",
        enrolledAt: new Date(),
      },
    });
  }
}

export async function getPaymentHistory(userId: string) {
  return await prisma.payment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPendingPayments(userId: string) {
  return await prisma.payment.findMany({
    where: {
      userId,
      status: "PENDING",
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });
}
