import { NextRequest, NextResponse } from "next/server";
import { DeadlineReminderService } from "@/lib/notifications/deadline-reminder-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/reminders/process - Process pending reminders (for cron job)
export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a cron job or authorized source
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process pending reminders
    await DeadlineReminderService.processPendingReminders();

    return NextResponse.json({
      message: "Reminders processed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/reminders/process - Get reminder processing status (for monitoring)
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pending reminders count
    const { prisma } = await import("@/lib/db");

    const pendingCount = await prisma.assignmentReminder.count({
      where: {
        processed: false,
        scheduledFor: {
          lte: new Date(),
        },
      },
    });

    const upcomingCount = await prisma.assignmentReminder.count({
      where: {
        processed: false,
        scheduledFor: {
          gt: new Date(),
        },
      },
    });

    return NextResponse.json({
      pendingReminders: pendingCount,
      upcomingReminders: upcomingCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting reminder status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
