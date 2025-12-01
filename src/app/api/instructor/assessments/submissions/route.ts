import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get all assessment submissions for instructor's courses
async function getAssessmentSubmissions(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";
    const assessmentId = searchParams.get("assessmentId");

    const whereClause: any = {
      assessment: {
        course: {
          instructorId,
        },
      },
    };

    if (status !== "all") {
      whereClause.status = status;
    }

    if (assessmentId) {
      whereClause.assessmentId = assessmentId;
    }

    const [submissions, total] = await Promise.all([
      prisma.assessmentSubmission.findMany({
        where: whereClause,
        include: {
          student: {
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
          assessment: {
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.assessmentSubmission.count({ where: whereClause }),
    ]);

    // Calculate grading statistics
    const gradingStats = await prisma.assessmentSubmission.aggregate({
      where: {
        assessment: {
          course: {
            instructorId,
          },
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        score: true,
      },
    });

    const statusCounts = await prisma.assessmentSubmission.groupBy({
      by: ["status"],
      where: {
        assessment: {
          course: {
            instructorId,
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        statistics: {
          totalSubmissions: gradingStats._count.id,
          averageScore: gradingStats._avg.score,
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          }, {} as Record<string, number>),
        },
      },
    });
  } catch (error) {
    console.error("Get assessment submissions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assessment submissions" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAssessmentSubmissions);
