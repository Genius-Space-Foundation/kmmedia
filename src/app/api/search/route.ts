import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    const searchTerm = query.trim();

    // Search courses
    const courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
      take: Math.min(limit, 6),
    });

    // Search instructors
    const instructors = await prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        status: "ACTIVE",
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            specialization: {
              hasSome: [searchTerm],
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        specialization: true,
      },
      take: Math.min(limit, 3),
    });

    // Get unique categories that match search
    const categories = await prisma.course.groupBy({
      by: ["category"],
      where: {
        status: "PUBLISHED",
        category: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      _count: {
        category: true,
      },
      take: Math.min(limit, 3),
    });

    // Format results
    const results = [
      // Course results
      ...courses.map((course) => ({
        id: course.id,
        title: course.title,
        type: "course" as const,
        category: course.category,
        instructor: course.instructor.name,
        url: `/courses/${course.id}`,
      })),

      // Instructor results
      ...instructors.map((instructor) => ({
        id: instructor.id,
        title: instructor.name,
        type: "instructor" as const,
        category: instructor.specialization?.join(", ") || "Instructor",
        url: `/instructors/${instructor.id}`,
      })),

      // Category results
      ...categories.map((category) => ({
        id: category.category,
        title: category.category,
        type: "category" as const,
        category: `${category._count.category} courses`,
        url: `/courses?category=${category.category
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
      })),
    ];

    // Limit total results
    const limitedResults = results.slice(0, limit);

    return NextResponse.json({
      success: true,
      results: limitedResults,
      total: results.length,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    return NextResponse.json({
      success: false,
      error: "Search failed",
      results: [],
    });
  }
}
