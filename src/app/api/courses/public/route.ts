import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PUBLISHED";
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");

    // Build the where clause
    const where: any = {
      status: status as any,
    };

    if (category) {
      where.category = category;
    }

    // Fetch courses with instructor information
    const courses = await prisma.course.findMany({
      where,
      take: limit,
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map instructor name
    const coursesWithInstructorName = courses.map((course) => ({
      ...course,
      instructor: {
        ...course.instructor,
        name: `${course.instructor.firstName} ${course.instructor.lastName}`.trim(),
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        courses: coursesWithInstructorName,
        total: courses.length,
      },
    });
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courses",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
