import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get student progress for a course
async function getStudentProgress(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const { id: courseId } = params;

    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId,
      },
      include: {
        _count: {
          select: {
            lessons: true,
            assessments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Get all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: "ACTIVE",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        completedLessons: {
          select: {
            lessonId: true,
            completedAt: true,
          },
        },
      },
    });

    // Get assessment data for each student
    const studentsProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get assessment submissions
        const submissions = await prisma.assessmentSubmission.findMany({
          where: {
            studentId: enrollment.studentId,
            assessment: {
              courseId,
            },
          },
          include: {
            assessment: true,
          },
        });

        // Calculate average score
        const completedSubmissions = submissions.filter(
          (s) => s.score !== null
        );
        const averageScore =
          completedSubmissions.length > 0
            ? completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
              completedSubmissions.length
            : 0;

        // Get lesson completions
        const completedLessons = enrollment.completedLessons.length;
        const totalLessons = course._count.lessons;
        const lessonProgress =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        // Get assessment completions
        const completedAssessments = completedSubmissions.length;
        const totalAssessments = course._count.assessments;
        const assessmentProgress =
          totalAssessments > 0
            ? (completedAssessments / totalAssessments) * 100
            : 0;

        // Calculate overall progress (weighted average)
        const overallProgress = lessonProgress * 0.6 + assessmentProgress * 0.4;

        // Get last activity
        const lastActivity =
          enrollment.completedLessons.length > 0
            ? enrollment.completedLessons.sort(
                (a, b) =>
                  new Date(b.completedAt).getTime() -
                  new Date(a.completedAt).getTime()
              )[0].completedAt
            : enrollment.enrolledAt;

        // Calculate engagement score
        const daysSinceEnrollment = Math.floor(
          (Date.now() - new Date(enrollment.enrolledAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const expectedProgress = Math.min(
          (daysSinceEnrollment / (course.duration * 7)) * 100,
          100
        );
        const engagementScore = Math.min(
          (overallProgress / expectedProgress) * 100,
          100
        );

        // Determine status
        let status: "ON_TRACK" | "AT_RISK" | "NEEDS_ATTENTION" | "EXCELLING";
        if (overallProgress >= 90 && averageScore >= 85) {
          status = "EXCELLING";
        } else if (overallProgress < expectedProgress - 20) {
          status = "NEEDS_ATTENTION";
        } else if (
          overallProgress < expectedProgress - 10 ||
          averageScore < 70
        ) {
          status = "AT_RISK";
        } else {
          status = "ON_TRACK";
        }

        // Generate strengths and improvements
        const strengths: string[] = [];
        const improvements: string[] = [];

        if (averageScore >= 85) {
          strengths.push("Excellent assessment performance");
        }
        if (lessonProgress >= 80) {
          strengths.push("Consistent lesson completion");
        }
        if (engagementScore >= 80) {
          strengths.push("High engagement with course materials");
        }

        if (averageScore < 70) {
          improvements.push("Assessment scores below passing threshold");
        }
        if (lessonProgress < 50) {
          improvements.push("Needs to complete more lessons");
        }
        if (
          new Date(lastActivity).getTime() <
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ) {
          improvements.push("Low recent activity - may need encouragement");
        }

        // Get recent activities
        const recentActivities = [
          ...enrollment.completedLessons.slice(-5).map((completion: any) => ({
            id: completion.lessonId,
            type: "LESSON" as const,
            title: "Lesson Completed",
            description: "Completed a course lesson",
            date: completion.completedAt.toISOString(),
            status: "COMPLETED" as const,
          })),
          ...submissions.slice(-5).map((submission) => ({
            id: submission.id,
            type: "ASSESSMENT" as const,
            title: submission.assessment.title,
            description: `Submitted ${submission.assessment.type}`,
            date: submission.submittedAt.toISOString(),
            score: submission.score,
            status: "COMPLETED" as const,
          })),
        ]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 10);

        return {
          id: enrollment.id,
          studentId: enrollment.studentId,
          studentName: enrollment.student.name,
          studentEmail: enrollment.student.email,
          courseId,
          courseTitle: course.title,
          enrollmentDate: enrollment.enrolledAt.toISOString(),
          lastActivity: new Date(lastActivity).toISOString(),
          overallProgress: Math.round(overallProgress),
          completedLessons,
          totalLessons,
          completedAssessments,
          totalAssessments,
          averageScore: Math.round(averageScore),
          timeSpent: Math.round(
            (completedLessons * 30 + completedAssessments * 60) / 60
          ), // Estimated hours
          attendance: 100, // Placeholder
          engagementScore: Math.round(engagementScore),
          status,
          milestones: [],
          recentActivities,
          strengths,
          improvements,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: studentsProgress,
    });
  } catch (error) {
    console.error("Get student progress error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch student progress" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getStudentProgress);
