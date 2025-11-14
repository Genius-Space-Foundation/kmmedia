import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { DeadlineReminderService } from "@/lib/notifications/deadline-reminder-service";

// GET /api/users/[id]/reminder-preferences - Get user reminder preferences
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;

    // Users can only access their own preferences, unless they're admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const preferences =
      await DeadlineReminderService.getUserReminderPreferences(userId);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching reminder preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/reminder-preferences - Update user reminder preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;

    // Users can only update their own preferences, unless they're admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { enabled, reminderTime, emailEnabled } = body;

    // Validate reminder time format (HH:MM)
    if (
      reminderTime &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(reminderTime)
    ) {
      return NextResponse.json(
        { error: "Invalid reminder time format. Use HH:MM format." },
        { status: 400 }
      );
    }

    await DeadlineReminderService.updateReminderPreferences(userId, {
      enabled,
      reminderTime,
      emailEnabled,
    });

    return NextResponse.json({
      message: "Reminder preferences updated successfully",
      userId,
    });
  } catch (error) {
    console.error("Error updating reminder preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
