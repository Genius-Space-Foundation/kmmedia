import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Mark a lesson as complete
async function completeLessonHandler(
  req: AuthenticatedRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const lessonId = params.id;
    const studentId = req.user!.userId;
    const body = await req.json();
    const { timeSpent = 0, enrollmentId } = body;

    // Verify student is enrolled in the course containing this lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: studentId,
        courseId: lesson.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Create or update lesson completion
    const completion = await prisma.lessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId: studentId,
          lessonId: lessonId,
        },
      },
      update: {
        timeSpent: timeSpent,
      },
      create: {
        userId: studentId,
        lessonId: lessonId,
        enrollmentId: enrollment.id,
        timeSpent: timeSpent,
      },
    });

    // Update enrollment progress and time spent
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId, isPublished: true },
    });

    const completedLessons = await prisma.lessonCompletion.count({
      where: {
        userId: studentId,
        lesson: { courseId: lesson.courseId },
      },
    });

    const progress = totalLessons > 0 
      ? (completedLessons / totalLessons) * 100 
      : 0;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: progress,
        timeSpent: { increment: timeSpent },
        lastActivityAt: new Date(),
      },
    });

    // Create dashboard activity
    await prisma.dashboardActivity.create({
      data: {
        userId: studentId,
        type: "lesson_completed",
        title: "Lesson Completed",
        description: `Completed lesson: ${lesson.title}`,
        courseId: lesson.courseId,
        courseName: lesson.course.title,
        metadata: {
          lessonId,
          timeSpent,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        completion,
        progress: Math.round(progress),
        completedLessons,
        totalLessons,
      },
      message: "Lesson marked as complete",
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    return NextResponse.json(
      { success: false, message: "Failed to complete lesson" },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(completeLessonHandler);
