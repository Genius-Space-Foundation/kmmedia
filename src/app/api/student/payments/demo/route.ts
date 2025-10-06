import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Create sample payments with different due dates
    const now = new Date();
    const samplePayments = [
      {
        userId: userId,
        type: "APPLICATION_FEE" as const,
        amount: 50,
        status: "PENDING" as const,
        method: "PAYSTACK" as const,
        reference: `DEMO-APP-${Date.now()}-1`,
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        description: "Application fee for Digital Marketing Course",
      },
      {
        userId: userId,
        type: "TUITION" as const,
        amount: 1200,
        status: "PENDING" as const,
        method: "PAYSTACK" as const,
        reference: `DEMO-TUITION-${Date.now()}-2`,
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (overdue)
        description: "Tuition payment for Photography Course - Semester 1",
      },
      {
        userId: userId,
        type: "INSTALLMENT" as const,
        amount: 300,
        status: "PENDING" as const,
        method: "PAYSTACK" as const,
        reference: `DEMO-INSTALLMENT-${Date.now()}-3`,
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        description:
          "Installment payment for Video Production Course - Month 2",
      },
    ];

    const createdPayments = [];
    for (const paymentData of samplePayments) {
      const payment = await prisma.payment.create({
        data: paymentData,
      });
      createdPayments.push(payment);
    }

    return NextResponse.json({
      success: true,
      data: {
        payments: createdPayments,
        message: "Sample payment data created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating demo payments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create demo payments",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

