import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get grading queue statistics
async function getGradingQueue(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    const [pendingSubmissions, averageGradingTime, overdueSubmissions] =
      await Promise.all([
        // Pending submissions awaiting grading
        prisma.assessmentSubmission.count({
          where: {
            assessment: {
              course: { instructorId },
            },
            status: "SUBMITTED",
          },
        }),

        // Average grading time (mock calculation - would need to track actual grading times)
        prisma.assessmentSubmission.aggregate({
          where: {
            assessment: {
              course: { instructorId },
            },
            status: "GRADED",
            gradedAt: {
              not: null,
            },
          },
          _avg: {
            score: true,
          },
        }),

        // Overdue submissions (submitted more than 7 days ago and not graded)
        prisma.assessmentSubmission.count({
          where: {
            assessment: {
              course: { instructorId },
            },
            status: "SUBMITTED",
            submittedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    const queue = {
      pendingSubmissions,
      averageGradingTime: 45, // Mock value - would be calculated from actual data
      overdueSubmissions,
    };

    return NextResponse.json({
      success: true,
      data: queue,
    });
  } catch (error) {
    console.error("Get grading queue error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch grading queue" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getGradingQueue);
