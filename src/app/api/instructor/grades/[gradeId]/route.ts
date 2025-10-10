import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Update a grade
async function updateGrade(
  req: NextRequest,
  { params }: { params: { gradeId: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const { gradeId } = params;
    const body = await req.json();

    // Verify instructor owns the grade
    const grade = await prisma.grade.findFirst({
      where: {
        id: gradeId,
        course: {
          instructorId,
        },
      },
    });

    if (!grade) {
      return NextResponse.json(
        { success: false, message: "Grade not found" },
        { status: 404 }
      );
    }

    const updatedGrade = await prisma.grade.update({
      where: { id: gradeId },
      data: {
        score: body.score,
        maxScore: body.maxScore,
        percentage: body.percentage,
        letterGrade: body.letterGrade,
        feedback: body.feedback,
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Grade updated successfully",
      data: updatedGrade,
    });
  } catch (error) {
    console.error("Update grade error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update grade" },
      { status: 500 }
    );
  }
}

// Delete a grade
async function deleteGrade(
  req: NextRequest,
  { params }: { params: { gradeId: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const { gradeId } = params;

    // Verify instructor owns the grade
    const grade = await prisma.grade.findFirst({
      where: {
        id: gradeId,
        course: {
          instructorId,
        },
      },
    });

    if (!grade) {
      return NextResponse.json(
        { success: false, message: "Grade not found" },
        { status: 404 }
      );
    }

    await prisma.grade.delete({
      where: { id: gradeId },
    });

    return NextResponse.json({
      success: true,
      message: "Grade deleted successfully",
    });
  } catch (error) {
    console.error("Delete grade error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete grade" },
      { status: 500 }
    );
  }
}

export const PUT = withInstructorAuth(updateGrade);
export const DELETE = withInstructorAuth(deleteGrade);
