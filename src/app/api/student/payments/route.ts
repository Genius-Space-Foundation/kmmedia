import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const GET = withStudentAuth(async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        { status: 401 }
      );
    }

    const userId = request.user.userId;

    // Fetch payment transactions for the user
    const transactions = await prisma.payment.findMany({
      where: {
        userId: userId,
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
                id: true,
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
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate summary statistics
    const totalPaid = transactions
      .filter((t) => t.status === "COMPLETED")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPending = transactions
      .filter((t) => t.status === "PENDING")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunded = transactions
      .filter(
        (t) => t.status === "REFUNDED" || t.status === "PARTIALLY_REFUNDED"
      )
      .reduce((sum, t) => sum + (t.refundAmount || t.amount), 0);

    const completedCount = transactions.filter(
      (t) => t.status === "COMPLETED"
    ).length;
    const pendingCount = transactions.filter(
      (t) => t.status === "PENDING"
    ).length;
    const failedCount = transactions.filter(
      (t) => t.status === "FAILED"
    ).length;

    const summary = {
      totalPaid,
      totalPending,
      totalRefunded,
      completedCount,
      pendingCount,
      failedCount,
      totalTransactions: transactions.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching student payment transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment transactions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

export const POST = withStudentAuth(async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, type, description, courseId, installmentPlanId } = body;
    const userId = request.user.userId;

    if (!amount || !type) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Create a new payment transaction
    const transaction = await prisma.payment.create({
      data: {
        userId,
        type,
        amount: parseFloat(amount),
        currency: "GHS",
        status: "PENDING",
        paymentMethod: "CARD", // Default payment method
        description: description || `${type.replace("_", " ")} payment`,
        reference: `PAY-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        courseId: courseId || null,
        installmentPlanId: installmentPlanId || null,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        installmentPlan: {
          select: {
            id: true,
            name: true,
            installmentNumber: true,
            totalInstallments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { transaction },
      message: "Payment transaction created successfully",
    });
  } catch (error) {
    console.error("Error creating payment transaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment transaction",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
