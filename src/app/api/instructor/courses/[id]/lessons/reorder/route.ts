import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Reorder lessons in a course
async function reorderLessons(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const instructorId = req.user!.userId;
    const { id: courseId  } = await params;
    const { lessonIds } = await req.json();

    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Update lesson orders
    const updatePromises = lessonIds.map((lessonId: string, index: number) =>
      prisma.lesson.update({
        where: { id: lessonId },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Lessons reordered successfully",
    });
  } catch (error) {
    console.error("Reorder lessons error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reorder lessons" },
      { status: 500 }
    );
  }
}

export const PUT = withInstructorAuth(reorderLessons);

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
