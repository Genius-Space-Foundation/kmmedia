import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { subDays, format, startOfDay } from "date-fns";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getDetailedAnalytics(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user.id;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    // Determine date range
    let days = 30;
    if (range === "7d") days = 7;
    if (range === "90d") days = 90;
    if (range === "year") days = 365;

    const startDate = subDays(new Date(), days);

    // 1. Overview Metrics
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            enrollments: true,
          }
        },
        enrollments: {
          select: {
            status: true,
          }
        }
      }
    });

    const totalStudents = courses.reduce((acc, c) => acc + c._count.enrollments, 0);
    const totalCourses = courses.length;
    
    let totalCompleted = 0;
    let totalPossible = 0;
    
    courses.forEach(c => {
      c.enrollments.forEach(e => {
        totalPossible++;
        if (e.status === 'COMPLETED') totalCompleted++;
      });
    });

    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    const avgRating = courses.length > 0 
      ? Math.round((courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length) * 10) / 10 
      : 0;

    // Revenue
    const payments = await prisma.payment.aggregate({
      where: {
        enrollment: {
          course: { instructorId }
        },
        status: "COMPLETED",
        createdAt: { gte: startDate }
      },
      _sum: { amount: true }
    });

    // 2. Enrollment Trends
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: { instructorId },
        enrolledAt: { gte: startDate }
      },
      select: {
        enrolledAt: true
      }
    });

    // Group by date
    const trendMap = new Map();
    for (let i = days; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), "MMM dd");
      trendMap.set(dateStr, 0);
    }

    enrollments.forEach(e => {
      const dateStr = format(e.enrolledAt, "MMM dd");
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, trendMap.get(dateStr) + 1);
      }
    });

    const enrollmentTrends = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    // 3. Course Performance
    const coursePerformance = courses.map(c => {
      const completedCount = c.enrollments.filter(e => e.status === 'COMPLETED').length;
      return {
        name: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
        students: c._count.enrollments,
        completion: c._count.enrollments > 0 ? Math.round((completedCount / c._count.enrollments) * 100) : 0
      };
    }).sort((a, b) => b.students - a.students).slice(0, 5);

    // 4. Assessment Stats
    const submissions = await prisma.assessmentSubmission.findMany({
      where: {
        assessment: {
          course: { instructorId }
        }
      },
      select: {
        score: true,
        percentage: true,
        passed: true,
      }
    });

    const avgScore = submissions.length > 0 
      ? Math.round(submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length)
      : 0;
    
    const passRate = submissions.length > 0
      ? Math.round((submissions.filter(s => s.passed).length / submissions.length) * 100)
      : 0;

    // Distribution
    const ranges = [
      { range: "90-100", min: 90, max: 100 },
      { range: "80-89", min: 80, max: 89 },
      { range: "70-79", min: 70, max: 79 },
      { range: "60-69", min: 60, max: 69 },
      { range: "Below 60", min: 0, max: 59 },
    ];

    const distribution = ranges.map(r => ({
      range: r.range,
      count: submissions.filter(s => (s.percentage || 0) >= r.min && (s.percentage || 0) <= r.max).length
    }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalCourses,
          completionRate,
          avgRating,
          totalRevenue: payments._sum.amount || 0,
        },
        enrollmentTrends,
        coursePerformance,
        assessmentStats: {
          avgScore,
          passRate,
          distribution
        }
      }
    });
  } catch (error) {
    console.error("Error fetching detailed analytics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch detailed analytics" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getDetailedAnalytics);
