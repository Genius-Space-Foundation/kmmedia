import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function duplicateCourse(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const courseId = params.id;

    // 1. Fetch original course with lessons
    const originalCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId,
      },
      include: {
        lessons: true,
      },
    });

    if (!originalCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // 2. Create new course
    const newCourse = await prisma.course.create({
      data: {
        title: `Copy of ${originalCourse.title}`,
        description: originalCourse.description,
        category: originalCourse.category,
        duration: originalCourse.duration,
        price: originalCourse.price,
        mode: originalCourse.mode,
        applicationFee: originalCourse.applicationFee,
        prerequisites: originalCourse.prerequisites,
        learningObjectives: originalCourse.learningObjectives,
        status: "DRAFT", // Always draft
        instructorId,
        // Duplicate lessons
        lessons: {
          create: originalCourse.lessons.map((lesson) => ({
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            order: lesson.order,
            type: lesson.type,
            duration: lesson.duration,
            isPublished: false, // Reset publication status
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
        lessons: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newCourse,
      message: "Course duplicated successfully",
    });
  } catch (error) {
    console.error("Duplicate course error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to duplicate course" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(duplicateCourse);
