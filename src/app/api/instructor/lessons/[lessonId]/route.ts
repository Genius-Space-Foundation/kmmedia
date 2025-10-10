import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Update a lesson
async function updateLesson(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const { lessonId } = params;
    const body = await req.json();

    // Verify instructor owns the lesson
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        course: {
          instructorId,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        duration: body.duration,
        isRequired: body.isRequired,
        content: body.content,
        objectives: body.objectives,
        prerequisites: body.prerequisites,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lesson updated successfully",
      data: updatedLesson,
    });
  } catch (error) {
    console.error("Update lesson error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// Delete a lesson
async function deleteLesson(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const { lessonId } = params;

    // Verify instructor owns the lesson
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        course: {
          instructorId,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}

export const PUT = withInstructorAuth(updateLesson);
export const DELETE = withInstructorAuth(deleteLesson);
