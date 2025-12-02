import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get upcoming deadlines for instructor
async function getInstructorDeadlines(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const daysAhead = parseInt(searchParams.get("daysAhead") || "30");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    // Get upcoming deadlines from various sources
    const [assessmentDeadlines, courseDeadlines, liveSessions] =
      await Promise.all([
        // Assessment deadlines
        prisma.assessment.findMany({
          where: {
            course: { instructorId },
            dueDate: {
              gte: new Date(),
              lte: futureDate,
            },
            isPublished: true,
          },
          select: {
            id: true,
            title: true,
            dueDate: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { dueDate: "asc" },
        }),

        // Course deadlines (if any)
        prisma.course.findMany({
          where: {
            instructorId,
            // Add course-specific deadline logic here if needed
          },
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        }),

        // Live sessions
        prisma.liveSession.findMany({
          where: {
            instructorId,
            scheduledAt: {
              gte: new Date(),
              lte: futureDate,
            },
          },
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        }),
      ]);

    // Transform deadlines
    const deadlines = [
      ...assessmentDeadlines.map((assessment) => ({
        id: `assessment-${assessment.id}`,
        title: assessment.title,
        type: "ASSESSMENT_DUE" as const,
        dueDate: assessment.dueDate!.toISOString(),
        courseId: assessment.course.id,
        courseTitle: assessment.course.title,
        priority: getPriority(assessment.dueDate!),
      })),

      ...liveSessions.map((session) => ({
        id: `session-${session.id}`,
        title: session.title,
        type: "LIVE_SESSION" as const,
        dueDate: session.scheduledAt.toISOString(),
        courseId: session.course.id,
        courseTitle: session.course.title,
        priority: getPriority(session.scheduledAt),
      })),
    ];

    // Sort by due date and limit
    const sortedDeadlines = deadlines
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: sortedDeadlines,
    });
  } catch (error) {
    console.error("Get instructor deadlines error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch deadlines" },
      { status: 500 }
    );
  }
}

function getPriority(date: Date): "HIGH" | "MEDIUM" | "LOW" {
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 1) return "HIGH";
  if (diffDays <= 7) return "MEDIUM";
  return "LOW";
}

export const GET = withInstructorAuth(getInstructorDeadlines);
