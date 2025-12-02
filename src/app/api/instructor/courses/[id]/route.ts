import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function deleteCourse(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const courseId = params.id;

    // 1. Check if course exists and belongs to instructor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // 2. Prevent deletion if there are active enrollments
    // (Optional: you might allow soft delete or archiving instead)
    if (course._count.enrollments > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete course with active enrollments",
        },
        { status: 400 }
      );
    }

    // 3. Delete course
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 }
    );
  }
}

export const DELETE = withInstructorAuth(deleteCourse);
