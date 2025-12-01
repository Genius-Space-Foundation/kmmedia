import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get student metrics and analytics
async function getStudentMetrics(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    const [
      totalStudents,
      activeStudents,
      averageProgress,
      averageEngagement,
      completionRate,
      atRiskStudents,
    ] = await Promise.all([
      // Total students across all courses
      prisma.enrollment.count({
        where: {
          course: { instructorId },
        },
      }),

      // Active students (enrolled and not completed)
      prisma.enrollment.count({
        where: {
          course: { instructorId },
          status: "ACTIVE",
        },
      }),

      // Average progress across all enrollments
      prisma.enrollment.aggregate({
        where: {
          course: { instructorId },
        },
        _avg: {
          progress: true,
        },
      }),

      // Average engagement (based on time spent and activity)
      prisma.enrollment.aggregate({
        where: {
          course: { instructorId },
        },
        _avg: {
          timeSpent: true,
        },
      }),

      // Completion rate (completed enrollments / total enrollments)
      prisma.enrollment.count({
        where: {
          course: { instructorId },
          status: "COMPLETED",
        },
      }),

      // At-risk students (low progress or engagement)
      prisma.enrollment.count({
        where: {
          course: { instructorId },
          OR: [
            { progress: { lt: 30 } },
            { timeSpent: { lt: 60 } }, // Less than 1 hour total time
          ],
        },
      }),
    ]);

    const totalEnrollments = await prisma.enrollment.count({
      where: { course: { instructorId } },
    });

    const metrics = {
      totalStudents,
      activeStudents,
      averageProgress: Math.round(averageProgress._avg.progress || 0),
      averageEngagement: Math.round(
        (averageEngagement._avg.timeSpent || 0) / 60
      ), // Convert to hours
      completionRate:
        totalEnrollments > 0
          ? Math.round((completionRate / totalEnrollments) * 100)
          : 0,
      atRiskStudents,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Get student metrics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch student metrics" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getStudentMetrics);

