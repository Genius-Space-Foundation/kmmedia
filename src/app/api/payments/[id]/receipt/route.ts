import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { generateReceiptForPayment } from "@/lib/payments/receipt-generator";

/**
 * GET /api/payments/[id]/receipt
 * Generate or retrieve payment receipt
 */
async function handleGet(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentId = params.id;

    // Fetch payment with related data
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
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
        installment: {
          include: {
            paymentPlan: {
              select: {
                installmentCount: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check authorization (user can only view their own receipts, or admin)
    if (
      payment.userId !== userId &&
      req.user?.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if payment is completed
    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Receipt not available for incomplete payments" },
        { status: 400 }
      );
    }

    // Check if receipt already exists
    if (payment.receiptUrl) {
      return NextResponse.json({
        success: true,
        receiptUrl: payment.receiptUrl,
        message: "Receipt already generated",
      });
    }

    // Generate new receipt
    const receiptResult = await generateReceiptForPayment(
      {
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        reference: payment.reference || undefined,
        type: payment.type,
      },
      {
        name: payment.user.name || "Unknown",
        email: payment.user.email,
      },
      payment.course
        ? {
            title: payment.course.title,
          }
        : undefined,
      payment.installment
        ? {
            installmentNumber: payment.installment.installmentNumber,
            totalInstallments:
              payment.installment.paymentPlan.installmentCount,
          }
        : undefined
    );

    if (!receiptResult.success) {
      return NextResponse.json(
        { error: receiptResult.error || "Failed to generate receipt" },
        { status: 500 }
      );
    }

    // Update payment with receipt URL
    await db.payment.update({
      where: { id: paymentId },
      data: {
        receiptUrl: receiptResult.url,
      },
    });

    return NextResponse.json({
      success: true,
      receiptUrl: receiptResult.url,
      message: "Receipt generated successfully",
    });
  } catch (error) {
    console.error("Receipt generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGet);
