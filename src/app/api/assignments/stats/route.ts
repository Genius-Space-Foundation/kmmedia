import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getAssignmentStats(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    const [
      totalAssignments,
      publishedAssignments,
      pendingGrading,
      overdueSubmissions,
      scores,
      enrollments
    ] = await Promise.all([
      // Total assignments
      prisma.assignment.count({
        where: { instructorId },
      }),

      // Published assignments
      prisma.assignment.count({
        where: { 
          instructorId,
          isPublished: true 
        },
      }),

      // Pending grading (submissions that are submitted but not graded)
      prisma.assessmentSubmission.count({
        where: {
          assessment: {
            course: { instructorId },
          },
          status: "SUBMITTED",
        },
      }),

      // Overdue submissions (submitted after due date)
      prisma.assessmentSubmission.count({
        where: {
          assessment: {
            course: { instructorId },
          },
          submittedAt: {
            gt: prisma.assignment.fields.dueDate
          }
        },
      }),

      // Scores for average calculation
      prisma.assessmentSubmission.aggregate({
        where: {
          assessment: {
            course: { instructorId },
          },
          status: "GRADED",
        },
        _avg: {
          score: true,
        },
      }),

      // Enrollments for completion rate
      prisma.enrollment.count({
        where: {
          course: { instructorId },
          status: "ACTIVE",
        },
      }),
    ]);

    // Calculate completion rate (assignments submitted / (students * assignments))
    // This is a simplified approximation
    const completionRate = 0; // Placeholder for now as it requires complex calculation

    return NextResponse.json({
      success: true,
      data: {
        totalAssignments,
        publishedAssignments,
        pendingGrading,
        overdueSubmissions,
        averageScore: Math.round(scores._avg.score || 0),
        completionRate,
      },
    });
  } catch (error) {
    console.error("Get assignment stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assignment statistics" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAssignmentStats);
