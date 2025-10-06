import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
            name: true,
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

    return NextResponse.json({
      success: true,
      data: {
        courses,
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

