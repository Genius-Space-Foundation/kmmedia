import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import {
  getAssessmentById,
  getAssessmentSubmissions,
  getAssessmentStatistics,
} from "@/lib/assessments/assessment-manager";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get assessment details
async function getAssessmentHandler(req: AuthenticatedRequest) {
  try {
    const { id } = req.nextUrl.pathname.split("/").pop() as any;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Assessment ID is required" },
        { status: 400 }
      );
    }

    const assessment = await getAssessmentById(id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error("Get assessment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// Update assessment
async function updateAssessmentHandler(req: AuthenticatedRequest) {
  try {
    const { id } = req.nextUrl.pathname.split("/").pop() as any;
    const body = await req.json();
    const instructorId = req.user!.userId;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Check if assessment exists and belongs to instructor
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id,
        instructorId,
      },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        totalPoints: body.totalPoints,
        passingScore: body.passingScore,
        timeLimit: body.timeLimit,
        attempts: body.attempts,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAssessment,
      message: "Assessment updated successfully",
    });
  } catch (error) {
    console.error("Update assessment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

// Delete assessment
async function deleteAssessmentHandler(req: AuthenticatedRequest) {
  try {
    const { id } = req.nextUrl.pathname.split("/").pop() as any;
    const instructorId = req.user!.userId;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Check if assessment exists and belongs to instructor
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id,
        instructorId,
      },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.assessment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assessment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAssessmentHandler);
export const PUT = withInstructorAuth(updateAssessmentHandler);
export const DELETE = withInstructorAuth(deleteAssessmentHandler);
