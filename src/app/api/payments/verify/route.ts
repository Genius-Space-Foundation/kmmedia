import { NextRequest, NextResponse } from "next/server";
import {
  verifyPayment,
  updatePaymentStatus,
  convertFromKobo,
} from "@/lib/payments/paystack";
import { prisma } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

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
          application: true,
          enrollment: true,
        },
      });

      if (!payment) {
        return NextResponse.json(
          { success: false, message: "Payment record not found" },
          { status: 404 }
        );
      }

      // Handle different payment types
      if (payment.type === "APPLICATION_FEE" && payment.application) {
        // Update application status to allow form completion
        await prisma.application.update({
          where: { id: payment.application.id },
          data: { status: "UNDER_REVIEW" },
        });
      } else if (payment.type === "TUITION" && payment.enrollment) {
        // Update enrollment status
        await prisma.enrollment.update({
          where: { id: payment.enrollment.id },
          data: { status: "ACTIVE" },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          reference,
          amount: convertFromKobo(paymentData.amount),
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
        { success: false, message: "Invalid input", errors: error.errors },
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
