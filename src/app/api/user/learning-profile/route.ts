import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check for JWT token in Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    const learningProfile = await prisma.learningProfile.findUnique({
      where: { userId },
    });

    if (!learningProfile) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: learningProfile,
    });
  } catch (error) {
    console.error("Error fetching learning profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check for JWT token in Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = payload.userId;
    const body = await request.json();

    // Update or create learning profile
    const learningProfile = await prisma.learningProfile.upsert({
      where: { userId },
      create: {
        userId,
        interests: body.interests || [],
        skillLevel: body.skillLevel || "beginner",
        learningStyle: body.learningStyle || "visual",
        goals: body.goals || [],
        timeCommitment: body.timeCommitment || 5,
        experience: body.experience || "",
        careerGoals: body.careerGoals || "",
        onboardingCompleted: body.onboardingCompleted || false,
      },
      update: {
        interests: body.interests || [],
        skillLevel: body.skillLevel || "beginner",
        learningStyle: body.learningStyle || "visual",
        goals: body.goals || [],
        timeCommitment: body.timeCommitment || 5,
        experience: body.experience || "",
        careerGoals: body.careerGoals || "",
        onboardingCompleted: body.onboardingCompleted || false,
      },
    });

    return NextResponse.json({
      success: true,
      data: learningProfile,
      message: "Learning profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating learning profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


