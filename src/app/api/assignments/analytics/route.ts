import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getAssignmentAnalytics(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (timeRange === "7d") startDate.setDate(now.getDate() - 7);
    else if (timeRange === "90d") startDate.setDate(now.getDate() - 90);
    else startDate.setDate(now.getDate() - 30);

    // Fetch submissions within range
    const submissions = await prisma.assessmentSubmission.findMany({
      where: {
        assessment: {
          course: { instructorId },
        },
        submittedAt: {
          gte: startDate,
        },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate metrics
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.status === "GRADED").length;
    const pendingGrading = submissions.filter(s => s.status === "SUBMITTED").length;

    // Scores
    const gradedScores = submissions
      .filter(s => s.status === "GRADED" && s.score !== null)
      .map(s => s.score as number);
    
    const averageScore = gradedScores.length > 0
      ? gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length
      : 0;

    // On-time rate
    const onTimeSubmissions = submissions.filter(s => {
      if (!s.assessment.dueDate) return true;
      return new Date(s.submittedAt) <= new Date(s.assessment.dueDate);
    }).length;

    const onTimeSubmissionRate = totalSubmissions > 0
      ? (onTimeSubmissions / totalSubmissions) * 100
      : 100;

    // Score distribution
    const scoreDistribution = {
      excellent: gradedScores.filter(s => s >= 90).length,
      good: gradedScores.filter(s => s >= 80 && s < 90).length,
      satisfactory: gradedScores.filter(s => s >= 70 && s < 80).length,
      needsImprovement: gradedScores.filter(s => s < 70).length,
    };

    // Top performing assignments
    // Group by assignment
    const assignmentMap = new Map();
    submissions.forEach(s => {
      if (!assignmentMap.has(s.assessment.id)) {
        assignmentMap.set(s.assessment.id, {
          id: s.assessment.id,
          title: s.assessment.title,
          scores: [],
          count: 0,
        });
      }
      const entry = assignmentMap.get(s.assessment.id);
      entry.count++;
      if (s.score !== null) entry.scores.push(s.score);
    });

    const topPerformingAssignments = Array.from(assignmentMap.values())
      .map(a => ({
        id: a.id,
        title: a.title,
        averageScore: a.scores.length > 0 ? a.scores.reduce((x: number, y: number) => x + y, 0) / a.scores.length : 0,
        completionRate: 100, // Placeholder
        submissionCount: a.count,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // Struggling students
    const studentMap = new Map();
    submissions.forEach(s => {
      if (!studentMap.has(s.student.id)) {
        studentMap.set(s.student.id, {
          id: s.student.id,
          name: s.student.name,
          scores: [],
          lateCount: 0,
          missedCount: 0, // Need enrollment data for this
        });
      }
      const entry = studentMap.get(s.student.id);
      if (s.score !== null) entry.scores.push(s.score);
      if (s.assessment.dueDate && new Date(s.submittedAt) > new Date(s.assessment.dueDate)) {
        entry.lateCount++;
      }
    });

    const strugglingStudents = Array.from(studentMap.values())
      .map(s => ({
        id: s.id,
        name: s.name,
        averageScore: s.scores.length > 0 ? s.scores.reduce((x: number, y: number) => x + y, 0) / s.scores.length : 0,
        missedAssignments: 0, // Placeholder
        lateSubmissions: s.lateCount,
      }))
      .filter(s => s.averageScore < 70)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalAssignments: 0, // Need total count
        publishedAssignments: 0,
        averageScore,
        completionRate: 0, // Placeholder
        onTimeSubmissionRate,
        totalSubmissions,
        gradedSubmissions,
        pendingGrading,
        scoreDistribution,
        recentTrends: {
          submissionTrend: "stable",
          scoreTrend: "stable",
          completionTrend: "stable",
        },
        topPerformingAssignments,
        strugglingStudents,
      },
    });
  } catch (error) {
    console.error("Get assignment analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assignment analytics" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAssignmentAnalytics);
