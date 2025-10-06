import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get instructor's students with progress tracking
async function getInstructorStudents(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      course: { instructorId },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  phone: true,
                },
              },
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          lessonCompletions: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                  duration: true,
                },
              },
            },
            orderBy: { completedAt: "desc" },
            take: 5, // Recent completions
          },
        },
        orderBy: { enrolledAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ]);

    // Transform data to match frontend interface
    const students = enrollments.map((enrollment) => ({
      id: enrollment.user.id,
      name: enrollment.user.name,
      email: enrollment.user.email,
      phone: enrollment.user.profile?.phone,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      progress: enrollment.progress,
      lastActivity:
        enrollment.lastActivityAt?.toISOString() ||
        enrollment.enrolledAt.toISOString(),
      status: enrollment.status,
      course: enrollment.course,
      recentCompletions: enrollment.lessonCompletions,
      recentSubmissions: enrollment.assessmentSubmissions,
      timeSpent: enrollment.timeSpent || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get instructor students error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getInstructorStudents);
