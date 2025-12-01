import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getInterventionAlerts(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // Get all enrollments for instructor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: { instructorId },
      },
      include: {
        student: true,
        course: true,
        lessonCompletions: {
          include: {
            lesson: true,
          },
        },
        assessmentSubmissions: {
          include: {
            assessment: true,
          },
        },
      },
    });

    const alerts = [];

    // Generate alerts for each enrollment
    for (const enrollment of enrollments) {
      const student = enrollment.student;
      const course = enrollment.course;

      // Check for engagement issues
      const totalLessons = course.lessons?.length || 1;
      const completedLessons = enrollment.lessonCompletions.length;
      const lessonEngagement = (completedLessons / totalLessons) * 100;

      if (lessonEngagement < 30) {
        alerts.push({
          id: `engagement-${enrollment.id}`,
          type: "ENGAGEMENT",
          priority: lessonEngagement < 15 ? "CRITICAL" : "HIGH",
          student: `${student.firstName} ${student.lastName}`,
          course: course.title,
          description: `Student has only completed ${completedLessons} out of ${totalLessons} lessons (${Math.round(
            lessonEngagement
          )}% engagement)`,
          suggestedAction:
            "Send personalized check-in message and offer additional support resources",
          timeframe: "Within 24 hours",
          status: "NEW",
          createdAt: new Date().toISOString(),
        });
      }

      // Check for progress issues
      const progressRate = enrollment.progress || 0;
      if (progressRate < 25) {
        alerts.push({
          id: `progress-${enrollment.id}`,
          type: "PROGRESS",
          priority: progressRate < 10 ? "CRITICAL" : "HIGH",
          student: `${student.firstName} ${student.lastName}`,
          course: course.title,
          description: `Student progress is only ${Math.round(
            progressRate
          )}% - significantly behind expected pace`,
          suggestedAction:
            "Schedule one-on-one meeting to identify barriers and create support plan",
          timeframe: "Within 48 hours",
          status: "NEW",
          createdAt: new Date().toISOString(),
        });
      }

      // Check for assessment issues
      const totalAssessments = enrollment.assessmentSubmissions.length;
      const failedAssessments = enrollment.assessmentSubmissions.filter(
        (sub) => sub.status === "GRADED" && sub.score && sub.score < 50
      ).length;

      if (totalAssessments > 0 && failedAssessments > totalAssessments * 0.5) {
        alerts.push({
          id: `assessment-${enrollment.id}`,
          type: "ASSESSMENT",
          priority: "HIGH",
          student: `${student.firstName} ${student.lastName}`,
          course: course.title,
          description: `Student has failed ${failedAssessments} out of ${totalAssessments} assessments`,
          suggestedAction:
            "Offer assessment retake, provide study materials, and consider tutoring support",
          timeframe: "Within 72 hours",
          status: "NEW",
          createdAt: new Date().toISOString(),
        });
      }

      // Check for attendance issues (based on recent activity)
      const lastActivity = enrollment.updatedAt;
      const daysSinceActivity = Math.floor(
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceActivity > 7) {
        alerts.push({
          id: `attendance-${enrollment.id}`,
          type: "ATTENDANCE",
          priority: daysSinceActivity > 14 ? "CRITICAL" : "MEDIUM",
          student: `${student.firstName} ${student.lastName}`,
          course: course.title,
          description: `No activity for ${daysSinceActivity} days - student may have disengaged`,
          suggestedAction:
            "Send re-engagement email and check if student needs technical support",
          timeframe: "Within 24 hours",
          status: "NEW",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Sort alerts by priority and creation date
    const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    alerts.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching intervention alerts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch intervention alerts",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getInterventionAlerts);

