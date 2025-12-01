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
  installmentEnabled: z.boolean().default(false),
  installmentPlan: z
    .object({
      upfront: z.number().min(0).max(100),
      midCourse: z.number().min(0).max(100),
      completion: z.number().min(0).max(100),
    })
    .optional(),
});

// Create course (Instructor only)
async function createCourse(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const courseData = createCourseSchema.parse(body);
    const instructorId = req.user!.userId;

    // Validate installment plan if enabled
    if (courseData.installmentEnabled && courseData.installmentPlan) {
      const { upfront, midCourse, completion } = courseData.installmentPlan;
      if (upfront + midCourse + completion !== 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Installment plan percentages must sum to 100%",
          },
          { status: 400 }
        );
      }
    }

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        duration: courseData.duration,
        price: courseData.price,
        mode: courseData.mode as CourseMode[],
        applicationFee: courseData.applicationFee,
        installmentEnabled: courseData.installmentEnabled,
        installmentPlan: courseData.installmentPlan,
        status: CourseStatus.DRAFT,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: course,
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

// Get courses (with filtering)
async function getCourses(req: NextRequest) {
  try {
    console.log("API: getCourses called");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const instructorId = searchParams.get("instructorId");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("API: Parameters:", {
      status,
      category,
      instructorId,
      featured,
      page,
      limit,
    });

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    console.log("API: Where clause:", where);

    console.log("API: Starting Prisma queries...");

    // For featured courses, get courses with highest enrollments
    const orderBy =
      featured === "true"
        ? [{ enrollments: { _count: "desc" } }, { createdAt: "desc" }]
        : { createdAt: "desc" };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
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
              assignments: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    console.log("API: Found courses:", courses.length, "Total:", total);

    // Add rating calculation for featured courses
    const coursesWithRating = courses.map((course) => ({
      ...course,
      rating: 4.8, // Default rating - could be calculated from reviews
    }));

    return NextResponse.json({
      success: true,
      data: {
        courses: coursesWithRating,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(createCourse);
export const GET = getCourses;
