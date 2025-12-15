import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get course content for an enrolled student
async function getEnrollmentContent(
  req: AuthenticatedRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const enrollmentId = params.id;
    const studentId = req.user!.userId;

    // Verify enrollment belongs to student
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: studentId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                resources: true,
                completions: {
                  where: { userId: studentId },
                  select: {
                    id: true,
                    completedAt: true,
                    timeSpent: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Transform lessons to include completion status
    const lessons = enrollment.course.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      duration: lesson.duration,
      order: lesson.order,
      videoUrl: lesson.videoUrl,
      content: lesson.content,
      isPublished: lesson.isPublished,
      isCompleted: lesson.completions.length > 0,
      completedAt: lesson.completions[0]?.completedAt,
      timeSpent: lesson.completions[0]?.timeSpent,
      resources: lesson.resources.map((resource) => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        url: resource.url,
        size: resource.size,
        downloadable: resource.downloadable,
      })),
    }));

    // Calculate course statistics
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((l) => l.isCompleted).length;
    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    // Find next lesson to study
    const nextLesson = lessons.find((l) => !l.isCompleted && l.isPublished);

    return NextResponse.json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          progress: progressPercentage,
          timeSpent: enrollment.timeSpent,
        },
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          category: enrollment.course.category,
          difficulty: enrollment.course.difficulty,
          instructor: enrollment.course.instructor,
        },
        lessons,
        stats: {
          totalLessons,
          completedLessons,
          progressPercentage,
          timeSpent: enrollment.timeSpent,
        },
        nextLesson: nextLesson || null,
      },
    });
  } catch (error) {
    console.error("Error fetching enrollment content:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course content" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(getEnrollmentContent);
