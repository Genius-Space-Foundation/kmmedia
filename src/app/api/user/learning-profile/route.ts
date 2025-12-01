import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const learningProfileSchema = z.object({
  interests: z.array(z.string()).optional(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  learningStyle: z
    .enum(["visual", "auditory", "kinesthetic", "reading"])
    .optional(),
  goals: z.array(z.string()).optional(),
  timeCommitment: z.number().min(1).max(40).optional(),
  experience: z.string().optional(),
  careerGoals: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
});

// GET - Fetch user's learning profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const learningProfile = await prisma.learningProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      profile: learningProfile,
    });
  } catch (error) {
    console.error("Error fetching learning profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch learning profile" },
      { status: 500 }
    );
  }
}

// PUT - Create or update user's learning profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const profileData = learningProfileSchema.parse(body);

    // Check if profile exists
    const existingProfile = await prisma.learningProfile.findUnique({
      where: { userId: session.user.id },
    });

    let learningProfile;
    if (existingProfile) {
      // Update existing profile
      learningProfile = await prisma.learningProfile.update({
        where: { userId: session.user.id },
        data: {
          ...profileData,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new profile
      learningProfile = await prisma.learningProfile.create({
        data: {
          userId: session.user.id,
          interests: profileData.interests || [],
          skillLevel: profileData.skillLevel || "beginner",
          learningStyle: profileData.learningStyle || "visual",
          goals: profileData.goals || [],
          timeCommitment: profileData.timeCommitment || 5,
          experience: profileData.experience || "",
          careerGoals: profileData.careerGoals || "",
          onboardingCompleted: profileData.onboardingCompleted || false,
        },
      });
    }

    // Generate course recommendations based on profile
    const recommendations = await generateCourseRecommendations(
      learningProfile
    );

    return NextResponse.json({
      success: true,
      profile: learningProfile,
      recommendations,
      message: "Learning profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating learning profile:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update learning profile" },
      { status: 500 }
    );
  }
}

// Generate course recommendations based on learning profile
async function generateCourseRecommendations(profile: any) {
  try {
    const recommendations = await prisma.course.findMany({
      where: {
        AND: [
          { status: "PUBLISHED" },
          {
            OR: [
              // Match interests
              profile.interests.length > 0
                ? {
                    OR: profile.interests.map((interest: string) => ({
                      OR: [
                        { title: { contains: interest, mode: "insensitive" } },
                        {
                          description: {
                            contains: interest,
                            mode: "insensitive",
                          },
                        },
                        {
                          category: { contains: interest, mode: "insensitive" },
                        },
                      ],
                    })),
                  }
                : {},
              // Match skill level
              profile.skillLevel
                ? {
                    difficulty: profile.skillLevel.toUpperCase(),
                  }
                : {},
            ],
          },
        ],
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
      take: 10,
      orderBy: [{ enrollments: { _count: "desc" } }, { createdAt: "desc" }],
    });

    return recommendations.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      duration: course.duration,
      price: course.price,
      instructor: course.instructor,
      enrollmentCount: course._count.enrollments,
      reviewCount: course._count.reviews,
      matchReason: getMatchReason(course, profile),
    }));
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return [];
  }
}

function getMatchReason(course: any, profile: any): string {
  const reasons = [];

  // Check interest matches
  if (
    profile.interests.some(
      (interest: string) =>
        course.title.toLowerCase().includes(interest.toLowerCase()) ||
        course.description?.toLowerCase().includes(interest.toLowerCase()) ||
        course.category.toLowerCase().includes(interest.toLowerCase())
    )
  ) {
    reasons.push("matches your interests");
  }

  // Check skill level match
  if (course.difficulty.toLowerCase() === profile.skillLevel) {
    reasons.push(`perfect for ${profile.skillLevel} level`);
  }

  // Check if it's popular
  if (course._count.enrollments > 50) {
    reasons.push("popular choice");
  }

  return reasons.length > 0 ? reasons.join(", ") : "recommended for you";
}
