import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withStudentAuth } from "@/lib/middleware";

/**
 * GET /api/student/attendance
 * Get student's own attendance records
 */
async function handleGet(req: NextRequest, userId: string) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const where: any = {
      userId,
      completed: true,
      completedAt: { not: null },
    };

    if (courseId) {
      where.lesson = {
        courseId,
      };
    }

    const attendanceRecords = await db.lessonCompletion.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
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
        completedAt: "desc",
      },
    });

    // Group by course for summary
    const summaryByCourse: Record<
      string,
      {
        courseId: string;
        courseTitle: string;
        totalLessons: number;
        completedLessons: number;
        attendanceRate: number;
      }
    > = {};

    // Get total lessons per course
    const courseIds = [
      ...new Set(attendanceRecords.map((r) => r.lesson.course.id)),
    ];
    
    for (const cId of courseIds) {
      const totalLessons = await db.lesson.count({
        where: { courseId: cId, published: true },
      });

      const completedCount = attendanceRecords.filter(
        (r) => r.lesson.course.id === cId
      ).length;

      const courseRecord = attendanceRecords.find(
        (r) => r.lesson.course.id === cId
      );

      summaryByCourse[cId] = {
        courseId: cId,
        courseTitle: courseRecord?.lesson.course.title || "Unknown",
        totalLessons,
        completedLessons: completedCount,
        attendanceRate:
          totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        records: attendanceRecords.map((r) => ({
          id: r.id,
          lessonId: r.lessonId,
          lessonTitle: r.lesson.title,
          lessonType: r.lesson.type,
          courseId: r.lesson.course.id,
          courseTitle: r.lesson.course.title,
          completedAt: r.completedAt,
          timeSpent: r.timeSpent,
          notes: r.notes,
        })),
        summary: Object.values(summaryByCourse),
        totalAttended: attendanceRecords.length,
      },
    });
  } catch (error) {
    console.error("Get student attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(handleGet);
