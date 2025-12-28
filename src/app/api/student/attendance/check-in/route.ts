import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";

/**
 * POST /api/student/attendance/check-in
 * Create a new attendance record for today
 */
async function handlePost(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;
    const body = await req.json();
    const { courseId, notes, status = "PRESENT" } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // 1. Verify that student is enrolled in this course
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId,
        courseId,
        status: "ACTIVE",
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled in this course to check in." },
        { status: 403 }
      );
    }

    // 2. Normalize date to YYYY-MM-DD for uniqueness check
    const today = new Date();
    const dayString = today.toISOString().split('T')[0];

    // 2.5 Check if student has already checked in for ANY course today
    // if the requirement is once per day total.
    const existingCheckIn = await db.attendance.findFirst({
      where: {
        userId,
        day: dayString,
      },
      include: {
        course: { select: { title: true } }
      }
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { error: `You have already checked in today for ${existingCheckIn.course.title}. Students can only check in once per day.` },
        { status: 409 }
      );
    }

    // 3. Create attendance record
    // The database unique constraint @@unique([userId, courseId, day]) 
    // will handle duplicate prevention automatically
    const attendance = await db.attendance.create({
      data: {
        userId,
        courseId,
        day: dayString,
        date: today,
        status,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Checked in successfully",
      data: attendance
    });

  } catch (error: any) {
    // Handle Prisma P2002 (Unique constraint violation)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "You have already checked in for this course today." },
        { status: 409 }
      );
    }

    console.error("Attendance check-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(handlePost);
