import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Save application draft
export async function POST(request: AuthenticatedRequest) {
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

    const body = await request.json();
    const { courseId, step, data } = body;
    const userId = request.user.userId;

    // Check if draft exists
    let draft = await prisma.applicationDraft.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (draft) {
      // Update existing draft
      draft = await prisma.applicationDraft.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          currentStep: step,
          formData: data,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new draft
      draft = await prisma.applicationDraft.create({
        data: {
          userId,
          courseId,
          currentStep: step,
          formData: data,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: draft,
      message: "Draft saved successfully",
    });
  } catch (error) {
    console.error("Save draft error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save draft",
      },
      { status: 500 }
    );
  }
}

// Get application draft
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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const userId = request.user.userId;

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    const draft = await prisma.applicationDraft.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error("Get draft error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch draft",
      },
      { status: 500 }
    );
  }
}
