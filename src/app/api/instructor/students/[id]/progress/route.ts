import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function getStudentProgress(
  req: AuthenticatedRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;  
    const instructorId = req.user!.userId;
    const studentId = params.id;

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, profileImage: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Fetch enrollments for courses taught by this instructor
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
        course: {
          instructorId: instructorId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            lessons: {
              select: { id: true }
            }
          },
        },
        lessonCompletions: {
          select: {
            lessonId: true,
            completedAt: true,
            timeSpent: true,
          },
        },
      },
    });

    // Calculate progress metrics
    const progressData = enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.lessonCompletions.length;
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;

      return {
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        lastActivityAt: enrollment.lastActivityAt,
        progress: progressPercentage,
        completedLessons,
        totalLessons,
        timeSpent: enrollment.timeSpent,
        recentActivity: enrollment.lessonCompletions
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
          .slice(0, 5),
      };
    });

    // Get overall stats
    const totalCourses = progressData.length;
    const averageProgress = totalCourses > 0
      ? Math.round(progressData.reduce((acc, curr) => acc + curr.progress, 0) / totalCourses)
      : 0;
    const totalTimeSpent = progressData.reduce((acc, curr) => acc + curr.timeSpent, 0);

    return NextResponse.json({
      success: true,
      data: {
        student,
        stats: {
          totalCourses,
          averageProgress,
          totalTimeSpent,
        },
        courses: progressData,
      },
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch student progress" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getStudentProgress);
