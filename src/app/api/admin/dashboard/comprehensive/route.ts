import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get comprehensive admin dashboard data
async function getComprehensiveDashboard(req: AuthenticatedRequest) {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const firstDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
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
      lastMonthPayments,
      pendingPayments,
      activeUsers,
      suspendedUsers,
      newUsersThisMonth,
      lastMonthUsers,
      courseCompletions,
      totalEnrollments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      usersByRole,
    ] = await Promise.all([
      // Basic counts
      prisma.user.count(),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.course.count(),
      prisma.application.count({ where: { status: "PENDING" } }),

      // Payment statistics
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: firstDayOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),

      // User activity statistics
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth },
        },
      }),

      // Course and enrollment statistics
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.enrollment.count(),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.payment.count({ where: { status: "REFUNDED" } }),

      // User role breakdown
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
    ]);

    // Calculate growth rates
    const revenueGrowth = lastMonthPayments._sum.amount
      ? (((monthlyPayments._sum.amount || 0) -
          (lastMonthPayments._sum.amount || 0)) /
          (lastMonthPayments._sum.amount || 1)) *
        100
      : 0;

    const userGrowth = lastMonthUsers
      ? ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100
      : 0;

    const courseCompletionRate = totalEnrollments
      ? (courseCompletions / totalEnrollments) * 100
      : 0;

    const paymentSuccessRate =
      successfulPayments + failedPayments
        ? (successfulPayments / (successfulPayments + failedPayments)) * 100
        : 0;

    // Calculate average transaction value
    const averageTransactionValue = successfulPayments
      ? (totalPayments._sum.amount || 0) / successfulPayments
      : 0;

    // Process user role data
    const roleBreakdown = usersByRole.reduce((acc, role) => {
      acc[role.role.toLowerCase() + "s"] = role._count.role;
      return acc;
    }, {} as Record<string, number>);

    // Mock system metrics (in production, these would come from monitoring services)
    const systemMetrics = [
      {
        id: "1",
        name: "CPU Usage",
        value: Math.floor(Math.random() * 30) + 40, // 40-70%
        unit: "%",
        status: "healthy" as const,
        trend: "stable" as const,
      },
      {
        id: "2",
        name: "Memory Usage",
        value: Math.floor(Math.random() * 25) + 60, // 60-85%
        unit: "%",
        status:
          Math.random() > 0.7 ? ("warning" as const) : ("healthy" as const),
        trend: Math.random() > 0.5 ? ("up" as const) : ("stable" as const),
      },
      {
        id: "3",
        name: "Database Response",
        value: Math.floor(Math.random() * 20) + 5, // 5-25ms
        unit: "ms",
        status: "healthy" as const,
        trend: "down" as const,
      },
      {
        id: "4",
        name: "API Response Time",
        value: Math.floor(Math.random() * 100) + 100, // 100-200ms
        unit: "ms",
        status: "healthy" as const,
        trend: "stable" as const,
      },
    ];

    const stats = {
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      pendingApplications,
      totalRevenue: totalPayments._sum.amount || 0,
      monthlyRevenue: monthlyPayments._sum.amount || 0,
      pendingPayments,
      activeUsers,
      suspendedUsers,
      systemUptime: 99.8,
      criticalAlerts: Math.floor(Math.random() * 3), // 0-2 critical alerts
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      userGrowth: Math.round(userGrowth * 100) / 100,
      courseCompletionRate: Math.round(courseCompletionRate * 100) / 100,
      paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
    };

    const financial = {
      totalRevenue: totalPayments._sum.amount || 0,
      monthlyRevenue: monthlyPayments._sum.amount || 0,
      pendingPayments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
    };

    const users = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      suspendedUsers,
      usersByRole: {
        admins: roleBreakdown.admins || 0,
        instructors: roleBreakdown.instructors || 0,
        students: roleBreakdown.students || 0,
      },
      userGrowthRate: Math.round(userGrowth * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        financial,
        users,
        systemMetrics,
      },
    });
  } catch (error) {
    console.error("Get comprehensive dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch comprehensive dashboard data",
      },
      { status: 500 }
    );
  }
}

// Apply admin authentication middleware
export const GET = withAdminAuth(getComprehensiveDashboard);
