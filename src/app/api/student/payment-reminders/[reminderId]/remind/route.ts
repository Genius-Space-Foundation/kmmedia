import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { smsService } from "@/lib/notifications/sms";

export async function POST(
  request: NextRequest,
  { params }: { params: { reminderId: string } }
) {
  try {
    const { reminderId } = params;
    const body = await request.json();
    const { userId, reminderMessage } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Extract payment ID from reminder ID (format: reminder-{paymentId})
    const paymentId = reminderId.replace("reminder-", "");

    // Find the payment
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: userId,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        application: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
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
      return NextResponse.json(
        { success: false, message: "Payment not found or already processed" },
        { status: 404 }
      );
    }

    // Calculate days until due
    const now = new Date();
    const dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
    const daysUntilDue = dueDate
      ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const isOverdue = daysUntilDue < 0;

    // Create custom reminder message
    const courseTitle =
      payment.application?.course?.title || payment.enrollment?.course?.title;
    const urgencyText = isOverdue
      ? `OVERDUE by ${Math.abs(daysUntilDue)} days`
      : daysUntilDue === 0
      ? "DUE TODAY"
      : daysUntilDue <= 3
      ? `Due in ${daysUntilDue} days (URGENT)`
      : `Due in ${daysUntilDue} days`;

    const defaultMessage = `🔔 Payment Reminder: Your ${payment.type
      .replace("_", " ")
      .toLowerCase()} payment of ₵${payment.amount.toLocaleString()} ${
      courseTitle ? `for "${courseTitle}"` : ""
    } is ${urgencyText}. Please make your payment to avoid any late fees or service interruptions.`;

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        type: "PAYMENT_REMINDER",
        title: `Payment Reminder - ${payment.type.replace("_", " ")}`,
        content: reminderMessage || defaultMessage,
        priority: isOverdue
          ? "high"
          : daysUntilDue <= 3
          ? "high"
          : daysUntilDue <= 7
          ? "medium"
          : "low",
      },
    });

    // Send SMS notification if user has phone number
    if (payment.user.phone) {
      try {
        await smsService.sendPaymentReminder(payment.user.phone, {
          amount: payment.amount,
          dueDate: payment.dueDate?.toISOString() || "",
          type: payment.type,
          description: payment.description || "",
          daysUntilDue: daysUntilDue,
          isOverdue: isOverdue,
        });
      } catch (smsError) {
        console.error("Failed to send SMS reminder:", smsError);
        // Don't fail the entire operation if SMS fails
      }
    }

    // In a real implementation, you would also:
    // 1. Send email notification
    // 2. Update reminder tracking table
    // 3. Log reminder activity

    return NextResponse.json({
      success: true,
      data: {
        notification,
        reminder: {
          id: reminderId,
          paymentId: payment.id,
          amount: payment.amount,
          dueDate: payment.dueDate?.toISOString(),
          daysUntilDue: daysUntilDue,
          isOverdue: isOverdue,
          urgency: isOverdue
            ? "critical"
            : daysUntilDue <= 3
            ? "high"
            : daysUntilDue <= 7
            ? "medium"
            : "low",
          content: reminderMessage || defaultMessage,
        },
      },
      message: "Payment reminder sent successfully",
    });
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send payment reminder",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
