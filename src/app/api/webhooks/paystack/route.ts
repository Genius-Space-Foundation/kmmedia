import { NextRequest, NextResponse } from "next/server";
import { verifyPayment, updatePaymentStatus, convertFromKobo } from "@/lib/payments/paystack";
import { prisma } from "@/lib/db";
import { PaymentStatus, ApplicationStatus, EnrollmentStatus } from "@prisma/client";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

// Verify Paystack webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

// Handle Paystack webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, message: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(event.data);
        break;
      case "charge.failed":
        await handleFailedPayment(event.data);
        break;
      case "transfer.success":
        await handleSuccessfulTransfer(event.data);
        break;
      case "transfer.failed":
        await handleFailedTransfer(event.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const reference = data.reference;
    const amount = convertFromKobo(data.amount);
    const metadata = data.metadata;

    // Update payment status in database
    const payment = await prisma.payment.update({
      where: { reference },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(data.paid_at),
        metadata: data,
      },
      include: {
        user: true,
        application: true,
        enrollment: true,
      },
    });

    // Handle different payment types
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

    // Send confirmation email/SMS
    console.log(`Payment successful: ${reference} - ${amount} for user ${payment.user.email}`);
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleFailedPayment(data: any) {
  try {
    const reference = data.reference;

    await prisma.payment.update({
      where: { reference },
      data: {
        status: PaymentStatus.FAILED,
        metadata: data,
      },
    });

    console.log(`Payment failed: ${reference}`);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

async function handleApplicationFeePayment(payment: any) {
  // Application fee payment successful - no additional action needed
  // The application can now be submitted by the student
  console.log(`Application fee paid for course: ${payment.metadata?.courseId}`);
}

async function handleTuitionPayment(payment: any) {
  if (payment.enrollment) {
    // Activate enrollment
    await prisma.enrollment.update({
      where: { id: payment.enrollment.id },
      data: {
        status: EnrollmentStatus.ACTIVE,
      },
    });

    console.log(`Tuition paid - enrollment activated: ${payment.enrollment.id}`);
  }
}

async function handleInstallmentPayment(payment: any) {
  // Handle installment payment
  if (payment.enrollment) {
    // Check if all installments are paid
    const allPayments = await prisma.payment.findMany({
      where: {
        enrollmentId: payment.enrollment.id,
        type: "INSTALLMENT",
      },
    });

    const allPaid = allPayments.every(p => p.status === PaymentStatus.COMPLETED);

    if (allPaid) {
      // All installments paid - activate enrollment
      await prisma.enrollment.update({
        where: { id: payment.enrollment.id },
        data: {
          status: EnrollmentStatus.ACTIVE,
        },
      });

      console.log(`All installments paid - enrollment activated: ${payment.enrollment.id}`);
    }
  }
}

async function handleSuccessfulTransfer(data: any) {
  // Handle successful transfer (for refunds, instructor payments, etc.)
  console.log(`Transfer successful: ${data.reference}`);
}

async function handleFailedTransfer(data: any) {
  // Handle failed transfer
  console.log(`Transfer failed: ${data.reference}`);
}

