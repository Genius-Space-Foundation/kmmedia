import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getCourseAnalytics(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (timeRange === "7d") startDate.setDate(now.getDate() - 7);
    else if (timeRange === "90d") startDate.setDate(now.getDate() - 90);
    else if (timeRange === "1y") startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setDate(now.getDate() - 30);

    // Fetch instructor's courses with related data
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            reviews: true,
          }
        },
        enrollments: {
          where: {
            enrolledAt: { gte: startDate }
          },
          select: {
            progress: true,
            status: true,
            completedAt: true,
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
          }
        },
        lessons: {
          include: {
            completions: true,
          }
        },
        assessments: {
          include: {
            submissions: {
              select: {
                score: true,
                status: true,
              }
            }
          }
        }
      }
    });

    const analyticsData = courses.map(course => {
      // Basic Stats
      const enrolledStudents = course._count.enrollments;
      const activeStudents = course.enrollments.filter(e => e.status === 'ACTIVE').length;
      
      // Completion Rate
      const completedEnrollments = course.enrollments.filter(e => e.status === 'COMPLETED').length;
      const completionRate = enrolledStudents > 0 
        ? Math.round((completedEnrollments / enrolledStudents) * 100) 
        : 0;

      // Ratings
      const ratings = course.reviews.map(r => r.rating);
      const averageRating = ratings.length > 0 
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 0;

      // Progress
      const progressValues = course.enrollments.map(e => e.progress);
      const averageProgress = progressValues.length > 0
        ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
        : 0;

      // Performance Metrics
      const lessonCompletions = course.lessons.reduce((acc, lesson) => acc + lesson.completions.length, 0);
      const totalPossibleLessonCompletions = course.lessons.length * enrolledStudents;
      const lessonCompletionRate = totalPossibleLessonCompletions > 0
        ? Math.round((lessonCompletions / totalPossibleLessonCompletions) * 100)
        : 0;

      const quizScores = course.assessments.flatMap(a => a.submissions.map(s => s.score || 0));
      const quizAverageScore = quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : 0;

      // Content Analytics (Simplified)
      const lessonAnalytics = course.lessons.map(lesson => {
        const completionCount = lesson.completions.length;
        const rate = enrolledStudents > 0 ? Math.round((completionCount / enrolledStudents) * 100) : 0;
        return {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type.toLowerCase(),
          completionRate: rate,
          averageTimeSpent: lesson.duration || 15, // Fallback
          engagementScore: rate, // Simplified
          dropoffRate: 100 - rate,
        };
      });

      const mostEngagingLessons = [...lessonAnalytics]
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 3);

      const leastEngagingLessons = [...lessonAnalytics]
        .sort((a, b) => a.completionRate - b.completionRate)
        .slice(0, 3);

      // Feedback
      const comments = course.reviews
        .filter(r => r.comment)
        .map(r => r.comment as string);

      // Recommendations (Logic could be more complex)
      const recommendations = [];
      if (completionRate < 30) {
        recommendations.push({
          id: `rec-${course.id}-1`,
          type: "engagement",
          priority: "high",
          title: "Improve Completion Rate",
          description: "Completion rate is low. Consider sending reminders or simplifying content.",
          impact: "High",
          effort: "Medium"
        });
      }
      if (averageRating < 4.0 && ratings.length > 5) {
        recommendations.push({
          id: `rec-${course.id}-2`,
          type: "content",
          priority: "high",
          title: "Review Course Content",
          description: "Ratings are below average. Check feedback for specific issues.",
          impact: "High",
          effort: "High"
        });
      }

      return {
        id: course.id,
        title: course.title,
        category: course.category,
        enrolledStudents,
        activeStudents,
        completionRate,
        averageRating,
        totalRatings: course._count.reviews,
        averageProgress,
        totalTimeSpent: 0, // Placeholder
        engagementScore: Math.round((lessonCompletionRate + quizAverageScore) / 2),
        dropoutRate: 100 - completionRate, // Simplified
        revenueGenerated: enrolledStudents * course.price,
        performanceMetrics: {
          lessonCompletionRate,
          assignmentSubmissionRate: 0, // Placeholder
          quizAverageScore,
          discussionParticipation: 0, // Placeholder
          resourceAccessRate: 0, // Placeholder
        },
        contentAnalytics: {
          mostEngagingLessons,
          leastEngagingLessons,
          difficultTopics: [], // Placeholder
          popularResources: [], // Placeholder
        },
        studentFeedback: {
          positiveComments: comments.slice(0, 3), // Just taking first few for now
          improvementSuggestions: [],
          commonIssues: [],
        },
        trends: {
          enrollmentTrend: 0, // Placeholder
          completionTrend: 0,
          engagementTrend: 0,
          ratingTrend: 0,
        },
        recommendations: recommendations.length > 0 ? recommendations : [
          {
            id: `rec-${course.id}-default`,
            type: "engagement",
            priority: "medium",
            title: "Engage with Students",
            description: "Post an announcement to encourage student activity.",
            impact: "Medium",
            effort: "Low"
          }
        ],
      };
    });

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Get course analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course analytics" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getCourseAnalytics);
