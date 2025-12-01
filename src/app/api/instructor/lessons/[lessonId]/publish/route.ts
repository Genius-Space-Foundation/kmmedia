import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Toggle lesson publish status
async function togglePublish(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const instructorId = req.user!.userId;
    const { lessonId  } = await params;
    const { isPublished } = await req.json();

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
      data: { isPublished },
    });

    return NextResponse.json({
      success: true,
      message: `Lesson ${
        isPublished ? "published" : "unpublished"
      } successfully`,
      data: updatedLesson,
    });
  } catch (error) {
    console.error("Toggle publish error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lesson status" },
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
