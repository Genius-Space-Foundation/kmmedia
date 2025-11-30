import { prisma } from "@/lib/db";
import { initiatePaystackRefund } from "./paystack";

export interface RefundRequest {
  paymentId: string;
  reason: string;
  amount?: number; // Partial refund amount
  adminNotes?: string;
}

export interface RefundResult {
  success: boolean;
  refund: any;
  message: string;
}

export async function processRefund(
  paymentId: string,
  reason: string,
  adminNotes?: string,
  partialAmount?: number
): Promise<RefundResult> {
  try {
    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        course: true,
      },
    });

    if (!payment) {
      return {
        success: false,
        refund: null,
        message: "Payment not found",
      };
    }

    if (payment.status !== "PAID") {
      return {
        success: false,
        refund: null,
        message: "Payment is not paid, cannot refund",
      };
    }

    if (payment.status === "REFUNDED") {
      return {
        success: false,
        refund: null,
        message: "Payment already refunded",
      };
    }

    const refundAmount = partialAmount || payment.amount;

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        paymentId,
        amount: refundAmount,
        reason,
        status: "PENDING",
        adminNotes,
        requestedAt: new Date(),
      },
    });

    // Initiate Paystack refund if payment was made via Paystack
    if (payment.paystackTransactionId) {
      try {
        const paystackRefund = await initiatePaystackRefund({
          transaction: payment.paystackTransactionId,
          amount: refundAmount * 100, // Convert to pesewas
          reason,
        });

        if (paystackRefund.status) {
          // Update refund with Paystack reference
          await prisma.refund.update({
            where: { id: refund.id },
            data: {
              status: "PROCESSING",
              paystackReference: paystackRefund.data.reference,
            },
          });
        } else {
          // Mark as failed
          await prisma.refund.update({
            where: { id: refund.id },
            data: {
              status: "FAILED",
              failureReason: paystackRefund.message,
            },
          });

          return {
            success: false,
            refund,
            message: paystackRefund.message || "Refund initiation failed",
          };
        }
      } catch (error) {
        console.error("Paystack refund error:", error);
        await prisma.refund.update({
          where: { id: refund.id },
          data: {
            status: "FAILED",
            failureReason: "Paystack refund initiation failed",
          },
        });

        return {
          success: false,
          refund,
          message: "Refund initiation failed",
        };
      }
    } else {
      // Manual refund for non-Paystack payments
      await prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: "MANUAL_REVIEW",
        },
      });
    }

    return {
      success: true,
      refund,
      message: "Refund initiated successfully",
    };
  } catch (error) {
    console.error("Refund processing error:", error);
    return {
      success: false,
      refund: null,
      message: "Refund processing failed",
    };
  }
}

export async function updateRefundStatus(
  refundId: string,
  status: "PROCESSING" | "COMPLETED" | "FAILED",
  paystackReference?: string
) {
  const updateData: any = { status };

  if (paystackReference) {
    updateData.paystackReference = paystackReference;
  }

  if (status === "COMPLETED") {
    updateData.completedAt = new Date();

    // Update payment status to refunded
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
    });

    if (refund) {
      await prisma.payment.update({
        where: { id: refund.paymentId },
        data: { status: "REFUNDED" },
      });
    }
  }

  return await prisma.refund.update({
    where: { id: refundId },
    data: updateData,
  });
}

export async function getRefundHistory(adminId?: string) {
  const whereClause = adminId ? { processedBy: adminId } : {};

  return await prisma.refund.findMany({
    where: whereClause,
    include: {
      payment: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      requestedAt: "desc",
    },
  });
}

export async function getPendingRefunds() {
  return await prisma.refund.findMany({
    where: {
      status: {
        in: ["PENDING", "PROCESSING", "MANUAL_REVIEW"],
      },
    },
    include: {
      payment: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      requestedAt: "asc",
    },
  });
}

export async function approveRefund(
  refundId: string,
  adminId: string,
  adminNotes?: string
) {
  return await prisma.refund.update({
    where: { id: refundId },
    data: {
      status: "APPROVED",
      processedBy: adminId,
      processedAt: new Date(),
      adminNotes,
    },
  });
}

export async function rejectRefund(
  refundId: string,
  adminId: string,
  reason: string
) {
  return await prisma.refund.update({
    where: { id: refundId },
    data: {
      status: "REJECTED",
      processedBy: adminId,
      processedAt: new Date(),
      rejectionReason: reason,
    },
  });
}
