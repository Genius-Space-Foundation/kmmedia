import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

    // Get enrollment data
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            duration: true,
            lessons: {
              select: {
                id: true,
                duration: true,
              },
            },
          },
        },
        lessonCompletions: {
          select: {
            completedAt: true,
            timeSpent: true,
          },
        },
      },
    });

    // Calculate overall progress
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(
      (e) => e.progress === 100
    ).length;
    const inProgressCourses = enrollments.filter(
      (e) => e.progress > 0 && e.progress < 100
    ).length;
    const averageProgress =
      totalCourses > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses
          )
        : 0;

    const totalTimeSpent = enrollments.reduce(
      (sum, e) => sum + (e.timeSpent || 0),
      0
    );
    const estimatedTimeRemaining = enrollments.reduce((sum, e) => {
      const totalCourseTime = e.course.lessons.reduce(
        (lessonSum, lesson) => lessonSum + lesson.duration,
        0
      );
      const completedTime = e.lessonCompletions.reduce(
        (compSum, comp) => compSum + (comp.timeSpent || 0),
        0
      );
      return sum + Math.max(0, totalCourseTime - completedTime);
    }, 0);

    // Get weekly activity (last 8 weeks)
    const weeklyActivity = [];
    for (let i = 7; i >= 0; i--) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 7 + 6));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - i * 7);

      const weekCompletions = await prisma.lessonCompletion.findMany({
        where: {
          userId,
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          timeSpent: true,
        },
      });

      const weekAssessments = await prisma.assessmentSubmission.findMany({
        where: {
          studentId: userId,
          submittedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
        },
      });

      const hoursSpent =
        weekCompletions.reduce((sum, comp) => sum + (comp.timeSpent || 0), 0) /
        60;
      const lessonsCompleted = weekCompletions.length;
      const assessmentsTaken = weekAssessments.length;

      weeklyActivity.push({
        week: `Week ${8 - i}`,
        hoursSpent: Math.round(hoursSpent * 10) / 10,
        lessonsCompleted,
        assessmentsTaken,
      });
    }

    // Get skill progression (mock data for now)
    const skillProgression = [
      {
        skill: "Photography",
        level: 3,
        progress: 75,
        lessonsCompleted: 12,
        nextMilestone: "Advanced lighting techniques",
      },
      {
        skill: "Video Editing",
        level: 2,
        progress: 45,
        lessonsCompleted: 8,
        nextMilestone: "Color grading basics",
      },
      {
        skill: "Digital Marketing",
        level: 1,
        progress: 25,
        lessonsCompleted: 3,
        nextMilestone: "Social media strategy",
      },
    ];

    // Get performance metrics
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

    const totalAssignments = await prisma.assessment.count({
      where: {
        course: {
          enrollments: {
            some: { userId },
          },
        },
      },
    });

    const averageQuizScore =
      assessmentSubmissions.length > 0
        ? Math.round(
            assessmentSubmissions.reduce((sum, sub) => {
              const percentage = (sub.score / sub.assessment.totalPoints) * 100;
              return sum + percentage;
            }, 0) / assessmentSubmissions.length
          )
        : 0;

    const assignmentCompletionRate =
      totalAssignments > 0
        ? Math.round((assessmentSubmissions.length / totalAssignments) * 100)
        : 0;

    // Mock data for attendance and participation
    const attendanceRate = 85;
    const participationScore = 78;

    // Get achievements (mock data)
    const achievements = [
      {
        id: "first_lesson",
        title: "First Steps",
        description: "Completed your first lesson",
        icon: "🎓",
        type: "milestone",
        earnedAt: new Date().toISOString(),
      },
      {
        id: "week_streak",
        title: "Week Warrior",
        description: "Maintained a 7-day learning streak",
        icon: "🔥",
        type: "streak",
        earnedAt: new Date().toISOString(),
      },
      {
        id: "quiz_master",
        title: "Quiz Master",
        description: "Scored 90% or higher on 5 quizzes",
        icon: "🧠",
        type: "skill",
        earnedAt: new Date().toISOString(),
      },
    ];

    // Get learning streak
    const lastActivity = await prisma.lessonCompletion.findFirst({
      where: { userId },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    });

    const currentStreak = 5; // Mock data
    const longestStreak = 12; // Mock data

    // Get recommendations (mock data)
    const recommendations = [
      {
        type: "course",
        title: "Advanced Photography Techniques",
        description:
          "Based on your interest in photography, we recommend this advanced course to build on your current skills.",
        priority: "high",
        actionUrl: "/courses/advanced-photography",
      },
      {
        type: "practice",
        title: "Practice Color Grading",
        description:
          "Spend 30 minutes practicing color grading to improve your video editing skills.",
        priority: "medium",
      },
      {
        type: "review",
        title: "Review Previous Lessons",
        description:
          "Review the last 3 lessons to reinforce your understanding.",
        priority: "low",
      },
    ];

    const analytics = {
      overallProgress: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        averageProgress,
        totalTimeSpent,
        estimatedTimeRemaining,
      },
      weeklyActivity,
      skillProgression,
      performanceMetrics: {
        averageQuizScore,
        assignmentCompletionRate,
        attendanceRate,
        participationScore,
      },
      achievements,
      learningStreak: {
        currentStreak,
        longestStreak,
        lastActivityDate:
          lastActivity?.completedAt?.toISOString() || new Date().toISOString(),
      },
      recommendations,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}
