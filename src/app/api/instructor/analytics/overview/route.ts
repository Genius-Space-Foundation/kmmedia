import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getAnalyticsOverview(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user.id;

    // Get basic counts
    const totalStudents = await prisma.enrollment.count({
      where: {
        course: {
          instructorId: instructorId,
        },
      },
    });

    const totalCourses = await prisma.course.count({
      where: {
        instructorId: instructorId,
      },
    });

    // Calculate revenue (mock calculation)
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        enrollment: {
          course: {
            instructorId: instructorId,
          },
        },
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate average rating
    const courseRatings = await prisma.course.findMany({
      where: {
        instructorId: instructorId,
      },
      select: {
        rating: true,
      },
    });

    const averageRating =
      courseRatings.length > 0
        ? courseRatings.reduce((sum, course) => sum + (course.rating || 0), 0) /
          courseRatings.length
        : 0;

    // Calculate completion rate
    const completedEnrollments = await prisma.enrollment.count({
      where: {
        course: {
          instructorId: instructorId,
        },
        status: "COMPLETED",
      },
    });

    const totalEnrollments = await prisma.enrollment.count({
      where: {
        course: {
          instructorId: instructorId,
        },
      },
    });

    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    // Calculate engagement rate (mock calculation)
    const engagementRate = Math.min(
      95,
      Math.max(60, completionRate + Math.random() * 20)
    );

    // Calculate retention rate (mock calculation)
    const retentionRate = Math.min(
      90,
      Math.max(70, completionRate + Math.random() * 10)
    );

    // Calculate growth rate (mock calculation)
    const growthRate = Math.round(Math.random() * 20 + 5);

    return NextResponse.json({
      totalStudents,
      totalCourses,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRating: Math.round(averageRating * 10) / 10,
      completionRate,
      engagementRate: Math.round(engagementRate),
      retentionRate: Math.round(retentionRate),
      growthRate,
    });
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics overview" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAnalyticsOverview);

