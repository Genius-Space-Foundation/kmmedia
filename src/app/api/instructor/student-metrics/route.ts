import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getStudentMetrics(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // Get all enrollments for instructor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: { instructorId },
      },
      include: {
        lessonCompletions: true,
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const totalStudents = enrollments.length;
    const activeStudents = enrollments.filter(e => e.status === "ACTIVE").length;
    const completedStudents = enrollments.filter(e => e.status === "COMPLETED").length;

    // Calculate averages
    let totalProgress = 0;
    let totalEngagement = 0;
    let atRiskCount = 0;

    enrollments.forEach(enrollment => {
      totalProgress += enrollment.progress || 0;
      
      // Calculate engagement
      const totalLessons = enrollment.course.lessons.length || 1;
      const completedLessons = enrollment.lessonCompletions.length;
      const engagement = (completedLessons / totalLessons) * 100;
      totalEngagement += engagement;

      // Identify at-risk
      if (engagement < 30 || (enrollment.progress || 0) < 20) {
        atRiskCount++;
      }
    });

    const averageProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;
    const averageEngagement = totalStudents > 0 ? Math.round(totalEngagement / totalStudents) : 0;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        averageProgress,
        averageEngagement,
        completionRate,
        atRiskStudents: atRiskCount,
      },
    });
  } catch (error) {
    console.error("Error fetching student metrics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch student metrics" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getStudentMetrics);
