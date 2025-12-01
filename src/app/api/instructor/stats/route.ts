import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get instructor statistics
async function getInstructorStats(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    const [
      totalCourses,
      activeStudents,
      pendingAssessments,
      recentAnnouncements,
      totalRevenue,
      completionRate,
    ] = await Promise.all([
      // Total courses
      prisma.course.count({
        where: { instructorId },
      }),

      // Active students (enrolled in instructor's courses)
      prisma.enrollment.count({
        where: {
          course: { instructorId },
          status: "ACTIVE",
        },
      }),

      // Pending assessments (submissions awaiting grading)
      prisma.assessmentSubmission.count({
        where: {
          assessment: {
            course: { instructorId },
          },
          status: "SUBMITTED",
        },
      }),

      // Recent announcements (last 30 days)
      prisma.announcement.count({
        where: {
          instructorId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Total revenue from instructor's courses
      prisma.payment.aggregate({
        where: {
          enrollment: {
            course: { instructorId },
          },
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),

      // Average completion rate
      prisma.enrollment.aggregate({
        where: {
          course: { instructorId },
          status: "COMPLETED",
        },
        _avg: {
          progress: true,
        },
      }),
    ]);

    const stats = {
      totalCourses,
      activeStudents,
      pendingAssessments,
      recentAnnouncements,
      totalRevenue: totalRevenue._sum.amount || 0,
      completionRate: Math.round(completionRate._avg.progress || 0),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get instructor stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getInstructorStats);

