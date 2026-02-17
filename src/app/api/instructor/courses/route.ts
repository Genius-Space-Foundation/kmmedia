import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { CourseStatus, CourseMode } from "@prisma/client";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  duration: z.number().positive("Duration must be positive"),
  price: z.number().positive("Price must be positive"),
  mode: z
    .array(z.enum(["ONLINE", "OFFLINE", "HYBRID"]))
    .min(1, "At least one mode is required"),
  applicationFee: z
    .number()
    .min(0, "Application fee cannot be negative")
    .default(0),
  prerequisites: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
});

// Create course (Instructor only)
async function createCourse(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const courseData = createCourseSchema.parse(body);
    const instructorId = req.user!.userId;

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        duration: courseData.duration,
        price: courseData.price,
        mode: courseData.mode as CourseMode[],
        applicationFee: courseData.applicationFee,
        prerequisites: courseData.prerequisites,
        learningObjectives: courseData.learningObjectives,
        status: CourseStatus.DRAFT,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    // Map instructor name
    const courseWithInstructorName = {
      ...course,
      instructor: {
        ...course.instructor,
        name: `${course.instructor.firstName} ${course.instructor.lastName}`.trim(),
      },
    };

    return NextResponse.json({
      success: true,
      data: courseWithInstructorName,
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("Create course error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Course creation failed",
      },
      { status: 500 }
    );
  }
}

// Get instructor's courses
async function getInstructorCourses(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { instructorId };

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          _count: {
            select: {
              applications: true,
              enrollments: true,
              lessons: true,
            },
          },
          lessons: {
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              order: true,
              isPublished: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get instructor courses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(createCourse);
export const GET = withInstructorAuth(getInstructorCourses);
