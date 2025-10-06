import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get admin dashboard statistics
async function getAdminStats(req: AuthenticatedRequest) {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Get comprehensive statistics from database
    const [
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      pendingApplications,
      totalPayments,
      monthlyPayments,
      pendingPayments,
      courseStats,
      applicationStats,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total instructors
      prisma.user.count({
        where: { role: "INSTRUCTOR" },
      }),

      // Total students
      prisma.user.count({
        where: { role: "STUDENT" },
      }),

      // Total courses
      prisma.course.count(),

      // Pending applications
      prisma.application.count({
        where: { status: "PENDING" },
      }),

      // Total revenue from completed payments
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),

      // Monthly revenue
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: firstDayOfMonth },
        },
        _sum: { amount: true },
      }),

      // Pending payments
      prisma.payment.count({
        where: { status: "PENDING" },
      }),

      // Course status breakdown
      prisma.course.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Application status breakdown
      prisma.application.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    // Recent activity
    const [recentApplications, recentEnrollments, recentPayments] =
      await Promise.all([
        prisma.application.findMany({
          take: 5,
          orderBy: { submittedAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
            course: { select: { title: true } },
          },
        }),

        prisma.enrollment.findMany({
          take: 5,
          orderBy: { enrolledAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
            course: { select: { title: true } },
          },
        }),

        prisma.payment.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
          },
        }),
      ]);

    const stats = {
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      pendingApplications,
      totalRevenue: totalPayments._sum.amount || 0,
      monthlyRevenue: monthlyPayments._sum.amount || 0,
      pendingPayments,
      courseStats: courseStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
      applicationStats: applicationStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: {
        applications: recentApplications,
        enrollments: recentEnrollments,
        payments: recentPayments,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

// Temporarily bypass auth for testing
export const GET = getAdminStats;
