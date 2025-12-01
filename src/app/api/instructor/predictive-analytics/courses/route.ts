import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getCoursePredictions(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // Get all courses for the instructor
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        enrollments: {
          include: {
            student: true,
            lessonCompletions: true,
            assessmentSubmissions: true,
          },
        },
        lessons: true,
        assessments: true,
      },
    });

    // Generate predictions for each course
    const predictions = courses.map((course) => {
      const totalEnrollments = course.enrollments.length;
      const completedEnrollments = course.enrollments.filter(
        (enrollment) => enrollment.status === "COMPLETED"
      ).length;
      const completionRate =
        totalEnrollments > 0
          ? (completedEnrollments / totalEnrollments) * 100
          : 0;

      // Calculate average engagement
      const totalEngagement = course.enrollments.reduce((sum, enrollment) => {
        const totalLessons = course.lessons.length;
        const completedLessons = enrollment.lessonCompletions.length;
        const lessonEngagement =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        return sum + lessonEngagement;
      }, 0);
      const averageEngagement =
        totalEnrollments > 0 ? totalEngagement / totalEnrollments : 0;

      // Predict future completion rate based on current trends
      const predictedCompletion = Math.min(
        100,
        completionRate + (averageEngagement - completionRate) * 0.3
      );

      // Identify risk factors
      const riskFactors = [];
      if (completionRate < 50) riskFactors.push("Low completion rate");
      if (averageEngagement < 40) riskFactors.push("Low student engagement");
      if (course.lessons.length < 5) riskFactors.push("Insufficient content");
      if (course.assessments.length === 0) riskFactors.push("No assessments");

      // Generate improvement suggestions
      const improvementSuggestions = [];
      if (completionRate < 50)
        improvementSuggestions.push(
          "Add more interactive content and check-ins"
        );
      if (averageEngagement < 40)
        improvementSuggestions.push(
          "Implement gamification and progress tracking"
        );
      if (course.lessons.length < 5)
        improvementSuggestions.push(
          "Expand course content with additional lessons"
        );
      if (course.assessments.length === 0)
        improvementSuggestions.push("Add regular assessments and quizzes");
      if (averageEngagement < 40)
        improvementSuggestions.push(
          "Provide more hands-on activities and projects"
        );

      return {
        id: course.id,
        title: course.title,
        completionRate,
        averageEngagement,
        predictedCompletion,
        riskFactors,
        improvementSuggestions,
      };
    });

    return NextResponse.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error("Error fetching course predictions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course predictions",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getCoursePredictions);

