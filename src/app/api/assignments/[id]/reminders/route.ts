import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { DeadlineReminderService } from "@/lib/notifications/deadline-reminder-service";
import { prisma } from "@/lib/db";

// GET /api/assignments/[id]/reminders - Get reminder status for assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignmentId = params.id;

    // Get assignment with reminders
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        reminders: {
          orderBy: { scheduledFor: "asc" },
        },
        course: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this assignment
    const hasAccess =
      assignment.instructorId === session.user.id ||
      session.user.role === "ADMIN" ||
      (session.user.role === "STUDENT" &&
        (await prisma.enrollment.findFirst({
          where: {
            userId: session.user.id,
            courseId: assignment.courseId,
          },
        })));

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      dueDate: assignment.dueDate,
      reminders: assignment.reminders.map((reminder) => ({
        id: reminder.id,
        type: reminder.reminderType,
        scheduledFor: reminder.scheduledFor,
        processed: reminder.processed,
      })),
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/assignments/[id]/reminders - Schedule reminders for assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignmentId = params.id;

    // Check if user is instructor or admin
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (
      assignment.instructorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Schedule reminders
    await DeadlineReminderService.scheduleReminders(assignmentId);

    return NextResponse.json({
      message: "Reminders scheduled successfully",
      assignmentId,
    });
  } catch (error) {
    console.error("Error scheduling reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/assignments/[id]/reminders - Cancel reminders for assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignmentId = params.id;

    // Check if user is instructor or admin
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (
      assignment.instructorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Cancel reminders
    await DeadlineReminderService.cancelReminders(assignmentId);

    return NextResponse.json({
      message: "Reminders cancelled successfully",
      assignmentId,
    });
  } catch (error) {
    console.error("Error cancelling reminders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
