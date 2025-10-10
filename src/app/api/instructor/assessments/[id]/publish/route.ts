import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Toggle assessment publish status
async function togglePublish(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const { id } = params;
    const { isPublished } = await req.json();

    // Verify instructor owns the assessment
    const assessment = await prisma.assessment.findFirst({
      where: {
        id,
        course: {
          instructorId,
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: { isPublished },
    });

    return NextResponse.json({
      success: true,
      message: `Assessment ${
        isPublished ? "published" : "unpublished"
      } successfully`,
      data: updatedAssessment,
    });
  } catch (error) {
    console.error("Toggle publish error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update assessment status" },
      { status: 500 }
    );
  }
}

export const PATCH = withInstructorAuth(togglePublish);

