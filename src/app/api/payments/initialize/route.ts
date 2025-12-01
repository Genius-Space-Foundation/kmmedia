import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
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

const initializePaymentSchema = z.object({
  type: z.enum(["APPLICATION_FEE", "TUITION", "INSTALLMENT"]),
  courseId: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { type, courseId, amount } = initializePaymentSchema.parse(body);
    const userId = req.user!.userId;

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate unique reference
    const reference = generatePaymentReference();

    // Initialize payment with Paystack
    const paystackResponse = await initializePayment({
      email: user.email,
      amount: convertToPesewas(amount),
      reference,
      metadata: {
        userId,
        type,
        courseId: courseId || null,
      },
    });

    if (!paystackResponse.status) {
      return NextResponse.json(
        { success: false, message: paystackResponse.message },
        { status: 400 }
      );
    }

    // Create payment record in database
    await createPaymentRecord({
      userId,
      type: type as PaymentType,
      amount,
      reference,
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        reference,
        accessCode: paystackResponse.data.access_code,
      },
      message: "Payment initialized successfully",
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

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
            : "Payment initialization failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
