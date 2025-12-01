import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Global search across all admin entities
async function globalSearch(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
        message: "Query too short",
      });
    }

    const searchTerm = query.trim();
    const results = [];

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      take: limit,
    });

    // Search courses
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        status: true,
        instructor: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
    });

    // Search applications
    const applications = await prisma.application.findMany({
      where: {
        OR: [
          { user: { name: { contains: searchTerm, mode: "insensitive" } } },
          { user: { email: { contains: searchTerm, mode: "insensitive" } } },
          { course: { title: { contains: searchTerm, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
      take: limit,
    });

    // Search payments
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { user: { name: { contains: searchTerm, mode: "insensitive" } } },
          { user: { email: { contains: searchTerm, mode: "insensitive" } } },
          { reference: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        amount: true,
        status: true,
        type: true,
        reference: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take: limit,
    });

    // Format results
    users.forEach((user) => {
      results.push({
        id: user.id,
        type: "user",
        title: user.name,
        subtitle: user.email,
        href: `/dashboards/admin?tab=users&userId=${user.id}`,
        status: user.status.toLowerCase(),
      });
    });

    courses.forEach((course) => {
      results.push({
        id: course.id,
        type: "course",
        title: course.title,
        subtitle: `by ${course.instructor.name}`,
        href: `/dashboards/admin?tab=courses&courseId=${course.id}`,
        status: course.status.toLowerCase(),
      });
    });

    applications.forEach((application) => {
      results.push({
        id: application.id,
        type: "application",
        title: `${application.user.name} - ${application.course.title}`,
        subtitle: application.user.email,
        href: `/dashboards/admin?tab=applications&applicationId=${application.id}`,
        status: application.status.toLowerCase(),
      });
    });

    payments.forEach((payment) => {
      results.push({
        id: payment.id,
        type: "payment",
        title: `${payment.user.name} - ${payment.type}`,
        subtitle: `GH₵${payment.amount.toLocaleString()} - ${
          payment.reference
        }`,
        href: `/dashboards/admin?tab=payments&paymentId=${payment.id}`,
        status: payment.status.toLowerCase(),
      });
    });

    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchTerm.toLowerCase());
      const bExact = b.title.toLowerCase().includes(searchTerm.toLowerCase());

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({
      success: true,
      results: results.slice(0, limit),
      total: results.length,
    });
  } catch (error) {
    console.error("Global search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(globalSearch);
