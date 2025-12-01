import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const saveDraftSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  currentStep: z.number().min(1).max(10).default(1),
  formData: z.record(z.any()), // Form data as key-value pairs
});

const getDraftSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

// Save or update application draft
async function saveDraft(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { courseId, currentStep, formData } = saveDraftSchema.parse(body);
    const userId = req.user!.userId;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, status: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Course is not available for applications" },
        { status: 400 }
      );
    }

    // Check if user already has a submitted application for this course
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          message: "Application already submitted for this course",
        },
        { status: 400 }
      );
    }

    // Upsert the draft
    const draft = await prisma.applicationDraft.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        currentStep,
        formData,
        updatedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        currentStep,
        formData,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: draft,
      message: "Draft saved successfully",
    });
  } catch (error) {
    console.error("Save draft error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to save draft",
      },
      { status: 500 }
    );
  }
}

// Get application draft
async function getDraft(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    const userId = (req as any).user?.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const draft = await prisma.applicationDraft.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
    });

    if (!draft) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No draft found",
      });
    }

    return NextResponse.json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error("Get draft error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

// Delete application draft
async function deleteDraft(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    const userId = req.user!.userId;

    const deleted = await prisma.applicationDraft.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Draft deleted successfully",
    });
  } catch (error) {
    console.error("Delete draft error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete draft" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(saveDraft);
export const GET = withAuth(getDraft);
export const DELETE = withAuth(deleteDraft);
