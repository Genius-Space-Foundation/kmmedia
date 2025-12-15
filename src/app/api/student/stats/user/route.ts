import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const GET = withStudentAuth(async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        { status: 401 }
      );
    }

    const userId = request.user.userId;

    // Get user's enrollment data
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        lessonCompletions: {
          select: {
            completedAt: true,
          },
        },
      },
    });

    const assessmentSubmissions = await prisma.assessmentSubmission.findMany({
      where: { studentId: userId },
      select: {
        score: true,
        assessment: {
          select: {
            totalPoints: true,
          },
        },
      },
    });

    // Calculate total points from achievements (mock calculation)
    const totalPoints = Math.min(
      1000,
      enrollments.reduce((sum, e) => sum + e.lessonCompletions.length, 0) * 10 +
        assessmentSubmissions.length * 5 +
        enrollments.filter((e) => e.progress === 100).length * 100
    );

    // Count achievements (mock calculation)
    const totalAchievements = Math.min(
      10,
      Math.floor(
        enrollments.reduce((sum, e) => sum + e.lessonCompletions.length, 0) / 5
      ) +
        Math.floor(assessmentSubmissions.length / 3) +
        enrollments.filter((e) => e.progress === 100).length
    );

    // Calculate learning streak (mock data)
    const currentStreak = Math.min(30, Math.floor(Math.random() * 15) + 5);
    const longestStreak = Math.max(
      currentStreak,
      Math.floor(Math.random() * 20) + 10
    );

    // Calculate level based on points
    const levels = [
      { level: 1, points: 0, title: "Newcomer" },
      { level: 2, points: 100, title: "Explorer" },
      { level: 3, points: 250, title: "Learner" },
      { level: 4, points: 500, title: "Student" },
      { level: 5, points: 750, title: "Practitioner" },
      { level: 6, points: 1000, title: "Specialist" },
      { level: 7, points: 1500, title: "Expert" },
      { level: 8, points: 2000, title: "Master" },
      { level: 9, points: 3000, title: "Grandmaster" },
      { level: 10, points: 5000, title: "Legend" },
    ];

    const currentLevel =
      levels.find((level) => totalPoints >= level.points) || levels[0];
    const nextLevel = levels.find(
      (level) => level.level === currentLevel.level + 1
    );

    const levelProgress = nextLevel
      ? Math.round(
          ((totalPoints - currentLevel.points) /
            (nextLevel.points - currentLevel.points)) *
            100
        )
      : 100;

    // Calculate rank and percentile (mock data)
    const rank = Math.floor(Math.random() * 50) + 1;
    const percentile = Math.max(1, Math.floor(Math.random() * 30) + 70);

    const stats = {
      totalPoints,
      totalAchievements,
      currentStreak,
      longestStreak,
      level: currentLevel.level,
      levelProgress,
      nextLevelPoints: nextLevel ? nextLevel.points - totalPoints : 0,
      rank,
      percentile,
      // Expanded real stats
      totalHours: Math.floor(
        enrollments.reduce((sum, e) => sum + (e.timeSpent || 0), 0) / 60
      ), // Convert minutes to hours
      coursesCompleted: enrollments.filter(e => e.progress === 100).length,
      averageScore: assessmentSubmissions.length > 0 
        ? Math.round(assessmentSubmissions.reduce((sum, s) => sum + (s.score / (s.assessment.totalPoints || 1) * 100), 0) / assessmentSubmissions.length)
        : 0,
      skillsLearned: [], // Could be populated from Course.category or similar
      weeklyGoal: {
          target: 10, // Could fetch from LearningProfile
          current: 0, // Need logic to track weekly progress
          unit: "hours"
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
});
