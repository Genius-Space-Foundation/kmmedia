import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/student/attendance
 * Get student's own attendance records
 */
async function handleGet(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // 1. Fetch check-in records (The new attendance system)
    const checkInRecords = await db.attendance.findMany({
      where: {
        userId,
        ...(courseId ? { courseId } : {}),
      },
      include: {
        course: {
          select: { id: true, title: true }
        }
      },
      orderBy: { date: "desc" }
    });

    // 2. Fetch lesson completions (The academic progress system)
    const lessonRecords = await db.lessonCompletion.findMany({
      where: {
        userId,
        ...(courseId ? { lesson: { courseId } } : {}),
      },
      include: {
        lesson: {
          include: {
            course: true
          }
        }
      },
      orderBy: { completedAt: "desc" }
    });

    // 3. Generate summary per course
    // We'll base the "attendance rate" on lesson completions vs total lessons
    // as that's a more traditional academic metric, but we'll show check-ins in history.
    const enrolledCourses = await db.enrollment.findMany({
        where: { userId, status: "ACTIVE" },
        include: { 
            course: {
                include: {
                    _count: {
                        select: { lessons: { where: { isPublished: true } } }
                    }
                }
            }
        }
    });

    const summary = enrolledCourses.map((enrollment: any) => {
        const courseId = enrollment.courseId;
        const totalLessons = enrollment.course?._count?.lessons || 0;
        const completedLessons = lessonRecords.filter((r: any) => r.lesson?.course?.id === courseId).length;
        const checkInCount = checkInRecords.filter((r: any) => r.courseId === courseId).length;

        return {
            courseId,
            courseTitle: enrollment.course?.title || "Unknown",
            totalLessons,
            completedLessons,
            checkInCount,
            attendanceRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        };
    });

    return NextResponse.json({
      success: true,
      data: {
        checkIns: checkInRecords.map((r: any) => ({
          id: r.id,
          date: r.date,
          day: r.day,
          courseId: r.courseId,
          courseName: r.course?.title || "Unknown Course",
          status: r.status,
          notes: r.notes
        })),
        lessonCompletions: lessonRecords.map((r: any) => ({
          id: r.id,
          lessonId: r.lessonId,
          lessonTitle: r.lesson?.title,
          courseId: r.lesson?.course?.id,
          courseName: r.lesson?.course?.title,
          completedAt: r.completedAt,
        })),
        summary,
        totalCheckIns: checkInRecords.length,
        overallAttendanceRate: summary.length > 0 
            ? Math.round(summary.reduce((acc, curr) => acc + curr.attendanceRate, 0) / summary.length) 
            : 0
      },
    });
  } catch (error: any) {
    console.error("Get student attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(handleGet);
