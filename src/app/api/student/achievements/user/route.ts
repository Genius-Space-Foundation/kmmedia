import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: AuthenticatedRequest) {
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

    // Get user's enrollment and activity data
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            lessons: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
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
            title: true,
          },
        },
      },
    });

    // Define achievement definitions
    const achievementDefinitions = [
      {
        id: "first_lesson",
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "🎓",
        category: "milestone",
        points: 10,
        rarity: "common",
        requirements: [
          {
            type: "lesson_completion",
            target: 1,
            current: Math.min(
              1,
              enrollments.reduce(
                (sum, e) => sum + e.lessonCompletions.length,
                0
              )
            ),
            description: "Complete 1 lesson",
          },
        ],
      },
      {
        id: "course_starter",
        title: "Course Starter",
        description: "Complete 5 lessons",
        icon: "📚",
        category: "milestone",
        points: 25,
        rarity: "common",
        requirements: [
          {
            type: "lesson_completion",
            target: 5,
            current: Math.min(
              5,
              enrollments.reduce(
                (sum, e) => sum + e.lessonCompletions.length,
                0
              )
            ),
            description: "Complete 5 lessons",
          },
        ],
      },
      {
        id: "quiz_master",
        title: "Quiz Master",
        description: "Score 90% or higher on 3 quizzes",
        icon: "🧠",
        category: "skill",
        points: 50,
        rarity: "rare",
        requirements: [
          {
            type: "high_score_quiz",
            target: 3,
            current: assessmentSubmissions.filter((sub) => {
              const percentage = (sub.score / sub.assessment.totalPoints) * 100;
              return percentage >= 90;
            }).length,
            description: "Score 90% or higher on 3 quizzes",
          },
        ],
      },
      {
        id: "week_warrior",
        title: "Week Warrior",
        description: "Maintain a 7-day learning streak",
        icon: "🔥",
        category: "streak",
        points: 75,
        rarity: "rare",
        requirements: [
          {
            type: "streak_days",
            target: 7,
            current: 5, // Mock current streak
            description: "Maintain a 7-day learning streak",
          },
        ],
      },
      {
        id: "course_completer",
        title: "Course Completer",
        description: "Complete your first course",
        icon: "🏆",
        category: "completion",
        points: 100,
        rarity: "epic",
        requirements: [
          {
            type: "course_completion",
            target: 1,
            current: enrollments.filter((e) => e.progress === 100).length,
            description: "Complete 1 course",
          },
        ],
      },
      {
        id: "social_learner",
        title: "Social Learner",
        description: "Participate in 10 discussions",
        icon: "💬",
        category: "social",
        points: 30,
        rarity: "common",
        requirements: [
          {
            type: "discussion_posts",
            target: 10,
            current: 3, // Mock data
            description: "Participate in 10 discussions",
          },
        ],
      },
      {
        id: "skill_builder",
        title: "Skill Builder",
        description: "Complete lessons in 3 different skill areas",
        icon: "💪",
        category: "skill",
        points: 60,
        rarity: "rare",
        requirements: [
          {
            type: "skill_areas",
            target: 3,
            current: Math.min(
              3,
              new Set(enrollments.map((e) => e.course.title.split(" ")[0])).size
            ),
            description: "Complete lessons in 3 different skill areas",
          },
        ],
      },
      {
        id: "dedicated_learner",
        title: "Dedicated Learner",
        description: "Spend 50 hours learning",
        icon: "⏰",
        category: "engagement",
        points: 80,
        rarity: "epic",
        requirements: [
          {
            type: "learning_hours",
            target: 50,
            current: Math.floor(
              enrollments.reduce((sum, e) => sum + (e.timeSpent || 0), 0) / 60
            ),
            description: "Spend 50 hours learning",
          },
        ],
      },
      {
        id: "perfect_score",
        title: "Perfect Score",
        description: "Get a perfect score on any assessment",
        icon: "💯",
        category: "skill",
        points: 40,
        rarity: "rare",
        requirements: [
          {
            type: "perfect_score",
            target: 1,
            current: assessmentSubmissions.some(
              (sub) => sub.score === sub.assessment.totalPoints
            )
              ? 1
              : 0,
            description: "Get a perfect score on any assessment",
          },
        ],
      },
      {
        id: "early_bird",
        title: "Early Bird",
        description: "Complete 5 lessons before their due dates",
        icon: "🌅",
        category: "engagement",
        points: 35,
        rarity: "common",
        requirements: [
          {
            type: "early_completion",
            target: 5,
            current: 2, // Mock data
            description: "Complete 5 lessons before their due dates",
          },
        ],
      },
    ];

    // Calculate achievements with progress
    const achievements = achievementDefinitions.map((achievement) => {
      const isUnlocked = achievement.requirements.every(
        (req) => req.current >= req.target
      );
      const progress = Math.round(
        (achievement.requirements.reduce((sum, req) => sum + req.current, 0) /
          achievement.requirements.reduce((sum, req) => sum + req.target, 0)) *
          100
      );

      return {
        ...achievement,
        isUnlocked,
        progress: Math.min(100, progress),
        unlockedAt: isUnlocked ? new Date().toISOString() : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        achievements,
      },
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch achievements",
      },
      { status: 500 }
    );
  }
}
