import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withInstructorAuth } from "@/lib/middleware";
import { z } from "zod";

// Validation schemas
const recordAttendanceSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  studentIds: z.array(z.string()).min(1, "At least one student is required"),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

const getAttendanceSchema = z.object({
  lessonId: z.string().optional(),
  courseId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * POST /api/instructor/attendance
 * Record offline attendance for a lesson
 */
async function handlePost(req: NextRequest, userId: string) {
  try {
    const body = await req.json();
    const validatedData = recordAttendanceSchema.parse(body);

    const { lessonId, studentIds, date, notes } = validatedData;

    // Verify lesson belongs to instructor's course
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            instructorId: true,
            id: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.course.instructorId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to record attendance for this lesson" },
        { status: 403 }
      );
    }

    // Verify all students are enrolled in the course
    const enrollments = await db.enrollment.findMany({
      where: {
        courseId: lesson.course.id,
        userId: { in: studentIds },
        status: "ACTIVE",
      },
      select: { userId: true },
    });

    const enrolledStudentIds = enrollments.map((e) => e.userId);
    const invalidStudentIds = studentIds.filter(
      (id) => !enrolledStudentIds.includes(id)
    );

    if (invalidStudentIds.length > 0) {
      return NextResponse.json(
        {
          error: "Some students are not enrolled in this course",
          invalidStudentIds,
        },
        { status: 400 }
      );
    }

    // Record attendance for each student
    const attendanceDate = new Date(date);
    const attendanceRecords = await Promise.all(
      studentIds.map((studentId) =>
        db.lessonCompletion.upsert({
          where: {
            userId_lessonId: {
              userId: studentId,
              lessonId,
            },
          },
          update: {
            completed: true,
            completedAt: attendanceDate,
            notes,
          },
          create: {
            userId: studentId,
            lessonId,
            completed: true,
            completedAt: attendanceDate,
            notes,
          },
        })
      )
    );

    // Update course progress for each student
    await Promise.all(
      studentIds.map(async (studentId) => {
        const completedLessons = await db.lessonCompletion.count({
          where: {
            userId: studentId,
            lesson: {
              courseId: lesson.course.id,
            },
            completed: true,
          },
        });

        const totalLessons = await db.lesson.count({
          where: {
            courseId: lesson.course.id,
            published: true,
          },
        });

        const progress =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        await db.enrollment.updateMany({
          where: {
            userId: studentId,
            courseId: lesson.course.id,
          },
          data: {
            progress,
            lastActivityAt: new Date(),
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `Attendance recorded for ${attendanceRecords.length} student(s)`,
      data: {
        lessonId,
        studentsMarked: attendanceRecords.length,
        date: attendanceDate,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Record attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/instructor/attendance
 * Get attendance records
 */
async function handleGet(req: NextRequest, userId: string) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const courseId = searchParams.get("courseId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const where: any = {
      lesson: {
        course: {
          instructorId: userId,
        },
      },
      completed: true,
    };

    if (lessonId) {
      where.lessonId = lessonId;
    }

    if (courseId) {
      where.lesson.courseId = courseId;
    }

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) {
        where.completedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.completedAt.lte = new Date(endDate);
      }
    }

    const attendanceRecords = await db.lessonCompletion.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
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

    // Group by lesson for summary
    const summaryByLesson: Record<
      string,
      {
        lessonId: string;
        lessonTitle: string;
        courseTitle: string;
        totalPresent: number;
        students: Array<{
          id: string;
          name: string;
          email: string;
          attendedAt: Date | null;
        }>;
      }
    > = {};

    attendanceRecords.forEach((record) => {
      const key = record.lessonId;
      if (!summaryByLesson[key]) {
        summaryByLesson[key] = {
          lessonId: record.lesson.id,
          lessonTitle: record.lesson.title,
          courseTitle: record.lesson.course.title,
          totalPresent: 0,
          students: [],
        };
      }

      summaryByLesson[key].totalPresent += 1;
      summaryByLesson[key].students.push({
        id: record.user.id,
        name: record.user.name || "Unknown",
        email: record.user.email,
        attendedAt: record.completedAt,
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        records: attendanceRecords.map((r) => ({
          id: r.id,
          studentId: r.userId,
          studentName: r.user.name,
          studentEmail: r.user.email,
          lessonId: r.lessonId,
          lessonTitle: r.lesson.title,
          courseId: r.lesson.course.id,
          courseTitle: r.lesson.course.title,
          completedAt: r.completedAt,
          notes: r.notes,
        })),
        summary: Object.values(summaryByLesson),
        totalRecords: attendanceRecords.length,
      },
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(handlePost);
export const GET = withInstructorAuth(handleGet);
