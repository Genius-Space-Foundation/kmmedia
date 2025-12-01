import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch user data with profile and learning profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        learningProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Calculate profile completion
    const completionData = calculateProfileCompletion(user);

    return NextResponse.json({
      success: true,
      data: completionData,
    });
  } catch (error) {
    console.error("Error fetching profile completion:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile completion" },
      { status: 500 }
    );
  }
}

function calculateProfileCompletion(user: any) {
  const requiredFields = [
    // Basic user fields
    { field: "name", value: user.name, weight: 10 },
    { field: "email", value: user.email, weight: 10 },
    { field: "phone", value: user.phone, weight: 5 },

    // Profile fields
    { field: "profileImage", value: user.profileImage, weight: 10 },
    { field: "bio", value: user.bio, weight: 15 },
    { field: "location", value: user.location, weight: 5 },

    // Learning profile fields (if student)
    ...(user.role === "STUDENT"
      ? [
          {
            field: "interests",
            value: user.learningProfile?.interests,
            weight: 15,
          },
          {
            field: "skillLevel",
            value: user.learningProfile?.skillLevel,
            weight: 10,
          },
          {
            field: "learningStyle",
            value: user.learningProfile?.learningStyle,
            weight: 10,
          },
          { field: "goals", value: user.learningProfile?.goals, weight: 15 },
          {
            field: "timeCommitment",
            value: user.learningProfile?.timeCommitment,
            weight: 5,
          },
          {
            field: "experience",
            value: user.learningProfile?.experience,
            weight: 10,
          },
          {
            field: "careerGoals",
            value: user.learningProfile?.careerGoals,
            weight: 5,
          },
        ]
      : []),

    // Instructor specific fields
    ...(user.role === "INSTRUCTOR"
      ? [
          { field: "title", value: user.title, weight: 10 },
          { field: "specialization", value: user.specialization, weight: 15 },
          { field: "qualifications", value: user.qualifications, weight: 15 },
          { field: "experience", value: user.experience, weight: 10 },
        ]
      : []),
  ];

  const completedFields: string[] = [];
  const missingFields: string[] = [];
  let totalWeight = 0;
  let completedWeight = 0;

  requiredFields.forEach(({ field, value, weight }) => {
    totalWeight += weight;

    const isCompleted = isFieldCompleted(value);
    if (isCompleted) {
      completedFields.push(field);
      completedWeight += weight;
    } else {
      missingFields.push(field);
    }
  });

  const completionPercentage =
    totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  // Generate recommended actions
  const recommendedActions = generateRecommendedActions(
    missingFields,
    user.role
  );

  return {
    completionPercentage,
    completedFields,
    missingFields,
    benefits: getBenefitsForCompletion(completionPercentage),
    recommendedActions,
  };
}

function isFieldCompleted(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  if (typeof value === "boolean") return true; // Booleans are always considered complete
  return false;
}

function generateRecommendedActions(
  missingFields: string[],
  role: string
): string[] {
  const actions: string[] = [];

  // Priority actions based on missing fields
  if (missingFields.includes("profileImage")) {
    actions.push("Add a profile picture to help others recognize you");
  }

  if (missingFields.includes("bio")) {
    actions.push("Write a brief bio to introduce yourself to the community");
  }

  if (role === "STUDENT") {
    if (missingFields.includes("interests")) {
      actions.push(
        "Select your learning interests for better course recommendations"
      );
    }
    if (missingFields.includes("goals")) {
      actions.push("Define your learning goals to track progress effectively");
    }
    if (missingFields.includes("experience")) {
      actions.push(
        "Describe your background to get appropriate course suggestions"
      );
    }
  }

  if (role === "INSTRUCTOR") {
    if (missingFields.includes("specialization")) {
      actions.push("Add your areas of expertise to attract the right students");
    }
    if (missingFields.includes("qualifications")) {
      actions.push("List your qualifications to build credibility");
    }
  }

  if (missingFields.includes("location")) {
    actions.push("Add your location to connect with local opportunities");
  }

  return actions.slice(0, 3); // Return top 3 recommendations
}

function getBenefitsForCompletion(percentage: number): string[] {
  const benefits: string[] = [];

  if (percentage >= 25) {
    benefits.push("Basic course recommendations unlocked");
  }

  if (percentage >= 50) {
    benefits.push("Personalized learning paths available");
  }

  if (percentage >= 75) {
    benefits.push("Access to exclusive content and early previews");
  }

  if (percentage >= 100) {
    benefits.push("Premium support and career guidance");
  }

  return benefits;
}
