import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withCache, cacheKeys } from "@/lib/cache";
import { withErrorHandler } from "@/lib/error-handler";

async function getCachedCourses(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "APPROVED";
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");
  const page = parseInt(searchParams.get("page") || "1");
  const skip = (page - 1) * limit;

  // Create cache key based on filters
  const filters = JSON.stringify({ status, category, limit, page });
  const cacheKey = cacheKeys.courses(filters);

  return withCache(
    cacheKey,
    async () => {
      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (category) {
        where.category = category;
      }

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: {
                    avatar: true,
                  },
                },
              },
            },
            _count: {
              select: {
                enrollments: true,
                applications: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip,
        }),
        prisma.course.count({ where }),
      ]);

      return {
        courses,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    },
    300 // 5 minutes cache
  );
}

export const GET = withErrorHandler(getCachedCourses);

