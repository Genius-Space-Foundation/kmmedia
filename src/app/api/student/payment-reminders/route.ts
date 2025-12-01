import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch pending payments that need reminders
    const pendingPayments = await prisma.payment.findMany({
      where: {
        userId: userId,
        status: "PENDING",
        dueDate: {
          not: null,
        },
      },
      include: {
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
        dueDate: "asc",
      },
    });

    // Create reminder objects with calculated status
    const now = new Date();
    const reminders = pendingPayments.map((payment) => {
      const dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
      const isOverdue = dueDate ? dueDate < now : false;

      const courseTitle =
        payment.application?.course?.title || payment.enrollment?.course?.title;

      return {
        id: `reminder-${payment.id}`,
        paymentId: payment.id,
        type: payment.type,
        amount: payment.amount,
        dueDate: payment.dueDate?.toISOString() || "",
        status: isOverdue ? "OVERDUE" : "PENDING",
        description:
          payment.description || `${payment.type.replace("_", " ")} payment`,
        courseTitle: courseTitle || undefined,
        reminderSent: false, // This would be tracked in a separate table in a real implementation
        reminderCount: 0, // This would be tracked in a separate table
        lastReminderSent: undefined,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
      };
    });

    // Calculate summary statistics
    const overdueReminders = reminders.filter((r) => r.status === "OVERDUE");
    const upcomingReminders = reminders.filter((r) => {
      const dueDate = new Date(r.dueDate);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return r.status === "PENDING" && daysUntilDue <= 7 && daysUntilDue > 0;
    });

    const summary = {
      totalReminders: reminders.length,
      overdueCount: overdueReminders.length,
      upcomingCount: upcomingReminders.length,
      totalOverdue: overdueReminders.reduce((sum, r) => sum + r.amount, 0),
      totalUpcoming: upcomingReminders.reduce((sum, r) => sum + r.amount, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        reminders,
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching payment reminders:", error);
    return NextResponse.json(
      {
        success: false,
        content: "Failed to fetch payment reminders",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, paymentId, reminderType, customMessage } = body;

    if (!userId || !paymentId) {
      return NextResponse.json(
        { success: false, message: "User ID and Payment ID are required" },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: userId,
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
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Create a notification for the reminder
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        type: "PAYMENT_REMINDER",
        title: "Payment Reminder",
        content:
          customMessage ||
          `Reminder: Your ${payment.type
            .replace("_", " ")
            .toLowerCase()} payment of ₵${payment.amount} is due ${
            payment.dueDate
              ? `on ${payment.dueDate.toLocaleDateString()}`
              : "soon"
          }.`,
        metadata: {
          paymentId: payment.id,
          amount: payment.amount,
          dueDate: payment.dueDate?.toISOString(),
          reminderType: reminderType || "manual",
        },
      },
    });

    // In a real implementation, you would also:
    // 1. Send email/SMS notifications
    // 2. Update reminder tracking in a separate table
    // 3. Schedule automated reminders

    return NextResponse.json({
      success: true,
      data: {
        notification,
        content: "Payment reminder sent successfully",
      },
    });
  } catch (error) {
    console.error("Error creating payment reminder:", error);
    return NextResponse.json(
      {
        success: false,
        content: "Failed to create payment reminder",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
