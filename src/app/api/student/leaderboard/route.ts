import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: AuthenticatedRequest) {
  try {
    // Get all students with their enrollment and activity data
    const users = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        enrollments: {
          select: {
            lessonCompletions: {
              select: {
                completedAt: true,
              },
            },
            progress: true,
          },
        },
        assessmentSubmissions: {
          select: {
            score: true,
            assessment: {
              select: {
                totalPoints: true,
              },
            },
          },
        },
      },
    });

    // Calculate leaderboard entries
    const leaderboard = users.map((user) => {
      const totalLessons = user.enrollments.reduce(
        (sum, e) => sum + e.lessonCompletions.length,
        0
      );

      const totalPoints = Math.min(
        2000,
        totalLessons * 10 +
          user.assessmentSubmissions.length * 5 +
          user.enrollments.filter((e) => e.progress === 100).length * 100 +
          Math.floor(Math.random() * 200) // Add some randomness for demo
      );

      const achievements = Math.min(
        15,
        Math.floor(totalLessons / 5) +
          Math.floor(user.assessmentSubmissions.length / 3) +
          user.enrollments.filter((e) => e.progress === 100).length +
          Math.floor(Math.random() * 5)
      );

      // Calculate streak (mock data)
      const streak = Math.min(50, Math.floor(Math.random() * 20) + 1);

      return {
        userId: user.id,
        name: user.name,
        totalPoints,
        achievements,
        streak,
      };
    });

    // Sort by total points and add ranks
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))
      .slice(0, 50); // Top 50

    return NextResponse.json({
      success: true,
      data: sortedLeaderboard,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch leaderboard",
      },
      { status: 500 }
    );
  }
}


