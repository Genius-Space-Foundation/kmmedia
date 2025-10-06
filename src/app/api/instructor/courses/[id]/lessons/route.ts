import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { LessonType } from "@prisma/client";
import { z } from "zod";

const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT", "LIVE_SESSION"]),
  content: z.string().optional(),
  duration: z.number().min(0, "Duration cannot be negative").default(0),
  order: z.number().optional(),
});

// Create lesson (Instructor only)
async function createLesson(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const instructorId = req.user!.userId;
    const body = await req.json();
    const lessonData = createLessonSchema.parse(body);

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the next order number if not provided
    let order = lessonData.order;
    if (order === undefined) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
      });
      order = (lastLesson?.order || 0) + 1;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: lessonData.title,
        description: lessonData.description,
        type: lessonData.type as LessonType,
        content: lessonData.content,
        duration: lessonData.duration,
        order,
        courseId,
        isPublished: false,
      },
      include: {
        resources: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: lesson,
      message: "Lesson created successfully",
    });
  } catch (error) {
    console.error("Create lesson error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Lesson creation failed",
      },
      { status: 500 }
    );
  }
}

// Get course lessons (Instructor only)
async function getCourseLessons(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const instructorId = req.user!.userId;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: {
        resources: true,
        _count: {
          select: {
            completions: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error("Get lessons error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(createLesson);
export const GET = withInstructorAuth(getCourseLessons);

