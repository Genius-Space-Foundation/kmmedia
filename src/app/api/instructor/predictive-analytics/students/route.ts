import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

async function getStudentPredictions(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // Get all students enrolled in instructor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: { instructorId },
      },
      include: {
        student: true,
        course: true,
        assessmentSubmissions: {
          include: {
            assessment: true,
          },
        },
        lessonCompletions: {
          include: {
            lesson: true,
          },
        },
      },
    });

    // Generate predictions for each student
    const predictions = enrollments.map((enrollment) => {
      const student = enrollment.student;
      const course = enrollment.course;

      // Calculate engagement score based on various factors
      const totalLessons = course.lessons?.length || 1;
      const completedLessons = enrollment.lessonCompletions.length;
      const lessonEngagement = (completedLessons / totalLessons) * 100;

      // Calculate assessment performance
      const totalAssessments = enrollment.assessmentSubmissions.length;
      const passedAssessments = enrollment.assessmentSubmissions.filter(
        (sub) => sub.status === "GRADED" && sub.score && sub.score >= 70
      ).length;
      const assessmentPerformance =
        totalAssessments > 0 ? (passedAssessments / totalAssessments) * 100 : 0;

      // Calculate overall engagement
      const engagementScore = (lessonEngagement + assessmentPerformance) / 2;

      // Calculate progress rate
      const progressRate = enrollment.progress || 0;

      // Predict success probability based on engagement and progress
      const successProbability = Math.min(
        100,
        engagementScore * 0.6 + progressRate * 0.4
      );

      // Determine risk level
      let riskLevel: "LOW" | "MEDIUM" | "HIGH";
      if (successProbability >= 80) riskLevel = "LOW";
      else if (successProbability >= 60) riskLevel = "MEDIUM";
      else riskLevel = "HIGH";

      // Determine predicted outcome
      let predictedOutcome: "SUCCESS" | "AT_RISK" | "LIKELY_FAIL";
      if (successProbability >= 75) predictedOutcome = "SUCCESS";
      else if (successProbability >= 50) predictedOutcome = "AT_RISK";
      else predictedOutcome = "LIKELY_FAIL";

      // Generate key factors
      const keyFactors = [];
      if (engagementScore < 50) keyFactors.push("Low engagement");
      if (progressRate < 30) keyFactors.push("Slow progress");
      if (assessmentPerformance < 60)
        keyFactors.push("Poor assessment performance");
      if (enrollment.lessonCompletions.length === 0)
        keyFactors.push("No lesson completions");

      // Generate recommendations
      const recommendations = [];
      if (engagementScore < 50)
        recommendations.push("Send engagement reminder and check-in");
      if (progressRate < 30)
        recommendations.push("Provide additional support and resources");
      if (assessmentPerformance < 60)
        recommendations.push("Offer assessment retake or tutoring");
      if (enrollment.lessonCompletions.length === 0)
        recommendations.push("Reach out to understand barriers");

      return {
        id: enrollment.id,
        name: student.firstName + " " + student.lastName,
        email: student.email,
        course: course.title,
        riskLevel,
        successProbability,
        engagementScore,
        progressRate,
        lastActivity: enrollment.updatedAt.toISOString(),
        predictedOutcome,
        keyFactors,
        recommendations,
        interventionNeeded:
          riskLevel === "HIGH" || predictedOutcome === "LIKELY_FAIL",
      };
    });

    return NextResponse.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error("Error fetching student predictions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch student predictions",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getStudentPredictions);

