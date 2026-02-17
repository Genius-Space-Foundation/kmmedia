import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get all applications for admin with enhanced filtering
async function getAdminApplications(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { course: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              price: true,
              applicationFee: true,
              instructor: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          payments: {
            where: { type: "APPLICATION_FEE" },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
              reference: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Transform data to include virtual 'name' fields for the UI
    const transformedApplications = applications.map((app: any) => ({
      ...app,
      user: {
        ...app.user,
        name: `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim() || app.user.email,
      },
      course: {
        ...app.course,
        instructor: {
          ...app.course.instructor,
          name: `${app.course.instructor.firstName || ""} ${app.course.instructor.lastName || ""}`.trim() || app.course.instructor.email,
        },
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        applications: transformedApplications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get admin applications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getAdminApplications);

