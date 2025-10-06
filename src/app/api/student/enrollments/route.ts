import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get student's enrollments
async function getStudentEnrollments(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { userId };

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [enrollments, total, assessmentSubmissions] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              duration: true,
              price: true,
              instructor: {
                select: {
                  id: true,
                  name: true,
                },
              },
              lessons: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                  duration: true,
                  order: true,
                  isPublished: true,
                },
                where: { isPublished: true },
                orderBy: { order: "asc" },
              },
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
        orderBy: { enrolledAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
      prisma.assessmentSubmission.findMany({
        where: { studentId: userId },
        include: {
          assessment: {
            select: {
              id: true,
              title: true,
              type: true,
              totalPoints: true,
              courseId: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    // Transform enrollments to match frontend interface
    const transformedEnrollments = enrollments.map((enrollment) => {
      const completedLessons = enrollment.lessonCompletions.length;
      const totalLessons = enrollment.course.lessons.length;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      // Calculate grades from assessment submissions for this course
      const courseAssessmentSubmissions = assessmentSubmissions.filter(
        (submission) => submission.assessment.courseId === enrollment.course.id
      );
      const grades = courseAssessmentSubmissions.map((submission) => ({
        id: submission.id,
        assessmentId: submission.assessmentId,
        assessmentTitle: submission.assessment.title,
        score: submission.score || 0,
        maxScore: submission.assessment.totalPoints,
        grade: submission.grade || "N/A",
        feedback: submission.feedback,
        submittedAt: submission.submittedAt.toISOString(),
      }));

      // Mark lessons as completed based on completions
      const lessonsWithCompletion = enrollment.course.lessons.map((lesson) => ({
        ...lesson,
        isCompleted: enrollment.lessonCompletions.some(
          (comp) => comp.lessonId === lesson.id
        ),
        resources: [], // TODO: Add resources when needed
      }));

      return {
        id: enrollment.id,
        course: {
          ...enrollment.course,
          syllabus: lessonsWithCompletion,
        },
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        completedAt: enrollment.completedAt?.toISOString(),
        progress,
        currentLesson: lessonsWithCompletion.find(
          (lesson) => !lesson.isCompleted
        )?.id,
        timeSpent: enrollment.timeSpent || 0,
        grades,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        enrollments: transformedEnrollments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get student enrollments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(getStudentEnrollments);
