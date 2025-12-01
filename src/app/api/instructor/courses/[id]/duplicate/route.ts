import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { CourseStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Duplicate course (Instructor only)
async function duplicateCourse(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id  } = await params;
    const instructorId = req.user!.userId;

    // Get the original course
    const originalCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          include: {
            resources: true,
          },
        },
      },
    });

    if (!originalCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Check if instructor owns the course
    if (originalCourse.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create duplicate course
    const duplicatedCourse = await prisma.course.create({
      data: {
        title: `${originalCourse.title} (Copy)`,
        description: originalCourse.description,
        category: originalCourse.category,
        duration: originalCourse.duration,
        price: originalCourse.price,
        mode: originalCourse.mode,
        applicationFee: originalCourse.applicationFee,
        prerequisites: originalCourse.prerequisites,
        learningObjectives: originalCourse.learningObjectives,
        status: CourseStatus.DRAFT,
        instructorId,
        lessons: {
          create: originalCourse.lessons.map((lesson, index) => ({
            title: lesson.title,
            description: lesson.description,
            type: lesson.type,
            content: lesson.content,
            duration: lesson.duration,
            order: lesson.order,
            isPublished: false, // Reset to unpublished
            resources: {
              create: lesson.resources.map((resource) => ({
                name: resource.name,
                type: resource.type,
                url: resource.url,
                size: resource.size,
              })),
            },
          })),
        },
      },
      include: {
        _count: {
          select: {
            applications: true,
            enrollments: true,
            lessons: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: duplicatedCourse,
      message: "Course duplicated successfully",
    });
  } catch (error) {
    console.error("Duplicate course error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Course duplication failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(duplicateCourse);


export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
