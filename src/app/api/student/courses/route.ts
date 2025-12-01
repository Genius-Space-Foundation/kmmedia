import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get available courses for students
async function getStudentCourses(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      status: { in: ["APPROVED", "PUBLISHED"] }, // Show approved and published courses
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { instructor: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatar: true,
                  bio: true,
                },
              },
            },
          },
          lessons: {
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              order: true,
            },
            where: { isPublished: true },
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              enrollments: true,
              applications: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    // Transform courses to include calculated fields
    const transformedCourses = courses.map((course) => ({
      ...course,
      rating:
        course.reviews.length > 0
          ? course.reviews.reduce((acc, review) => acc + review.rating, 0) /
            course.reviews.length
          : 0,
      reviewCount: course.reviews.length,
      syllabus: course.lessons,
      instructor: {
        ...course.instructor,
        avatar: course.instructor.profile?.avatar,
        bio: course.instructor.profile?.bio,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        courses: transformedCourses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get student courses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(getStudentCourses);
