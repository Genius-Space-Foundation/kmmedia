import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function handler(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");

    // Build filter conditions
    const where: any = {
      status: "APPROVED", // Only approved courses
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }

    // 1. Get user's active cohorts (via applications or enrollments)
    // We want to exclude courses from cohorts the student is already in
    const [activeApplications, activeEnrollments] = await Promise.all([
      prisma.application.findMany({
        where: { userId },
        select: { course: { select: { cohort: true } } },
      }),
      prisma.enrollment.findMany({
        where: { userId },
        select: { course: { select: { cohort: true } } },
      }),
    ]);

    // Collect forbidden cohorts (non-null)
    const forbiddenCohorts = new Set<string>();
    
    activeApplications.forEach(app => {
      if (app.course?.cohort) forbiddenCohorts.add(app.course.cohort);
    });
    
    activeEnrollments.forEach(enrol => {
      if (enrol.course?.cohort) forbiddenCohorts.add(enrol.course.cohort);
    });

    // 2. Add cohort exclusion to query
    if (forbiddenCohorts.size > 0) {
      where.NOT = {
        cohort: { in: Array.from(forbiddenCohorts) }
      };
    }

    // 3. Fetch courses
    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 4. Map response (exclude sensitive data if any)
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      price: course.price,
      mode: course.mode,
      difficulty: course.difficulty,
      instructor: course.instructor,
      applicationFee: course.applicationFee,
      installmentEnabled: course.installmentEnabled,
      cohort: course.cohort,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    console.error("Fetch courses error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(handler);
