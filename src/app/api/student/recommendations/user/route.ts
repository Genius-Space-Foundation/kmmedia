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

    // Get user's learning profile and enrollment data
    const [userProfile, enrollments, applications] = await Promise.all([
      prisma.learningProfile.findUnique({
        where: { userId },
      }),
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              category: true,
              difficulty: true,
              title: true,
            },
          },
        },
      }),
      prisma.application.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              category: true,
              difficulty: true,
              title: true,
            },
          },
        },
      }),
    ]);

    // Get all available courses
    const allCourses = await prisma.course.findMany({
      where: { status: "APPROVED" },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    // Filter out courses user has already applied for or enrolled in
    const appliedCourseIds = applications.map((app) => app.courseId);
    const enrolledCourseIds = enrollments.map((enroll) => enroll.courseId);
    const availableCourses = allCourses.filter(
      (course) =>
        !appliedCourseIds.includes(course.id) &&
        !enrolledCourseIds.includes(course.id)
    );

    const recommendations: any[] = [];

    // Skill-based recommendations
    if (userProfile?.interests && userProfile.interests.length > 0) {
      const skillBasedCourses = availableCourses
        .filter((course) =>
          userProfile.interests.some(
            (interest) =>
              course.category.toLowerCase().includes(interest.toLowerCase()) ||
              course.title.toLowerCase().includes(interest.toLowerCase())
          )
        )
        .map((course) => ({
          ...course,
          matchScore: calculateMatchScore(course, userProfile, "skill"),
          matchReason: `Matches your interest in ${
            userProfile.interests.find((interest) =>
              course.category.toLowerCase().includes(interest.toLowerCase())
            ) || "this field"
          }`,
        }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 3);

      if (skillBasedCourses.length > 0) {
        recommendations.push({
          type: "skill_based",
          title: "Based on Your Interests",
          description: `Courses that match your interests: ${userProfile.interests.join(
            ", "
          )}`,
          courses: skillBasedCourses,
        });
      }
    }

    // Difficulty progression recommendations
    if (enrollments.length > 0) {
      const completedCourses = enrollments.filter((e) => e.progress === 100);
      const inProgressCourses = enrollments.filter(
        (e) => e.progress > 0 && e.progress < 100
      );

      let difficultyLevel = "BEGINNER";
      if (completedCourses.length >= 2) {
        difficultyLevel = "INTERMEDIATE";
      }
      if (completedCourses.length >= 4) {
        difficultyLevel = "ADVANCED";
      }

      const progressionCourses = availableCourses
        .filter((course) => {
          if (difficultyLevel === "BEGINNER") {
            return (
              course.difficulty === "BEGINNER" ||
              course.difficulty === "INTERMEDIATE"
            );
          }
          if (difficultyLevel === "INTERMEDIATE") {
            return (
              course.difficulty === "INTERMEDIATE" ||
              course.difficulty === "ADVANCED"
            );
          }
          return course.difficulty === "ADVANCED";
        })
        .map((course) => ({
          ...course,
          matchScore: calculateMatchScore(course, userProfile, "difficulty"),
          matchReason: `Perfect next step for your ${difficultyLevel.toLowerCase()} level`,
        }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 3);

      if (progressionCourses.length > 0) {
        recommendations.push({
          type: "completion_based",
          title: "Next Steps in Your Learning Journey",
          description: `Continue your progress with courses that build on what you've learned`,
          courses: progressionCourses,
        });
      }
    }

    // Trending/popular courses
    const trendingCourses = availableCourses
      .filter((course) => course.reviews && course.reviews.length > 0)
      .map((course) => ({
        ...course,
        matchScore: Math.floor(Math.random() * 20) + 70, // Mock trending score
        matchReason: "Popular choice among students",
      }))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 3);

    if (trendingCourses.length > 0) {
      recommendations.push({
        type: "trending",
        title: "Trending Courses",
        description: "Popular courses that other students are taking",
        courses: trendingCourses,
      });
    }

    // Interest-based recommendations (fallback)
    if (recommendations.length === 0) {
      const interestBasedCourses = availableCourses
        .map((course) => ({
          ...course,
          matchScore: Math.floor(Math.random() * 30) + 60,
          matchReason: "Great course to start your learning journey",
        }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 6);

      if (interestBasedCourses.length > 0) {
        recommendations.push({
          type: "interest_based",
          title: "Featured Courses",
          description: "Handpicked courses to get you started",
          courses: interestBasedCourses,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        userProfile: {
          interests: userProfile?.interests || [],
          skillLevel: userProfile?.skillLevel || "beginner",
          goals: userProfile?.goals || [],
          experience: userProfile?.experience || "",
        },
      },
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recommendations",
      },
      { status: 500 }
    );
  }
}

function calculateMatchScore(
  course: any,
  userProfile: any,
  type: string
): number {
  let score = 50; // Base score

  if (type === "skill") {
    // Match based on interests
    if (userProfile?.interests) {
      const interestMatches = userProfile.interests.filter(
        (interest: string) =>
          course.category.toLowerCase().includes(interest.toLowerCase()) ||
          course.title.toLowerCase().includes(interest.toLowerCase())
      ).length;
      score += interestMatches * 15;
    }

    // Match based on skill level
    if (userProfile?.skillLevel) {
      const skillLevelMatch = {
        beginner:
          course.difficulty === "BEGINNER"
            ? 20
            : course.difficulty === "INTERMEDIATE"
            ? 10
            : 0,
        intermediate:
          course.difficulty === "INTERMEDIATE"
            ? 20
            : course.difficulty === "ADVANCED"
            ? 10
            : 5,
        advanced:
          course.difficulty === "ADVANCED"
            ? 20
            : course.difficulty === "INTERMEDIATE"
            ? 10
            : 0,
      };
      score +=
        skillLevelMatch[
          userProfile.skillLevel as keyof typeof skillLevelMatch
        ] || 0;
    }

    // Match based on goals
    if (userProfile?.goals) {
      const goalMatches = userProfile.goals.filter(
        (goal: string) =>
          course.title.toLowerCase().includes(goal.toLowerCase()) ||
          course.description.toLowerCase().includes(goal.toLowerCase())
      ).length;
      score += goalMatches * 10;
    }
  } else if (type === "difficulty") {
    // Difficulty-based scoring
    score = Math.floor(Math.random() * 20) + 70;
  }

  return Math.min(100, Math.max(0, score));
}
