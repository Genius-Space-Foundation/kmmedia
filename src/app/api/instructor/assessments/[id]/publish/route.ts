import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Toggle assessment publish status
async function togglePublish(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const instructorId = req.user!.userId;
    const { id  } = await params;
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





export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
