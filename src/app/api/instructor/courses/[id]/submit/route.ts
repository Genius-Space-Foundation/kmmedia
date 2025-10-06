import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { CourseStatus } from "@prisma/client";

// Submit course for approval (Instructor only)
async function submitForApproval(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const instructorId = req.user!.userId;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Check if instructor owns the course
    if (course.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if course is in draft status
    if (course.status !== CourseStatus.DRAFT) {
      return NextResponse.json(
        {
          success: false,
          message: "Only draft courses can be submitted for approval",
        },
        { status: 400 }
      );
    }

    // Validate course has minimum content
    if (!course.description || course.description.length < 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Course description must be at least 50 characters",
        },
        { status: 400 }
      );
    }

    if (course.lessons.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course must have at least one lesson" },
        { status: 400 }
      );
    }

    // Update course status
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        status: CourseStatus.PENDING_APPROVAL,
        submittedAt: new Date(),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
            enrollments: true,
            lessons: true,
          },
        },
      },
    });

    // TODO: Send notification to admin
    console.log(
      `Course submitted for approval: ${course.title} by ${course.instructorId}`
    );

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: "Course submitted for approval successfully",
    });
  } catch (error) {
    console.error("Submit course error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Course submission failed",
      },
      { status: 500 }
    );
  }
}

export const PUT = withInstructorAuth(submitForApproval);

