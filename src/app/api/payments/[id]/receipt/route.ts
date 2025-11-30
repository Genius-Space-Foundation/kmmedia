import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { generateReceiptForPayment } from "@/lib/payments/receipt-generator";

/**
 * GET /api/payments/[id]/receipt
 * Generate and stream payment receipt PDF
 */
async function handleGet(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params for Next.js 15 compatibility
    const { id: paymentId } = await params;

    // Fetch payment with related data
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        amount: true,
        method: true, // ADD THIS - needed for receipt generation
        createdAt: true,
        reference: true,
        type: true,
        status: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        enrollment: {
          select: {
            course: {
              select: {
                title: true,
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

    // Fetch installment data if this is an installment payment
    let installmentData: { installmentNumber: number; totalInstallments: number } | undefined;
    if (payment.type === "INSTALLMENT") {
      const installment = await db.paymentInstallment.findFirst({
        where: { paymentId: payment.id },
        include: {
          paymentPlan: {
            select: {
              installmentCount: true,
            },
          },
        },
      });

      if (installment) {
        installmentData = {
          installmentNumber: installment.installmentNumber,
          totalInstallments: installment.paymentPlan.installmentCount,
        };
      }
    }

    // Generate receipt PDF buffer
    const pdfBuffer = await generateReceiptForPayment(
      {
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.method,
        createdAt: payment.createdAt,
        reference: payment.reference || undefined,
        type: payment.type,
      },
      {
        name: payment.user.name || "Unknown",
        email: payment.user.email,
      },
      payment.enrollment?.course
        ? {
            title: payment.enrollment.course.title,
          }
        : undefined,
      installmentData
    );

    // Return PDF stream (convert Buffer to Uint8Array for NextResponse compatibility)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${payment.reference || payment.id}.pdf"`,
      },
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
