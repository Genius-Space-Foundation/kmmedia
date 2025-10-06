import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createLiveSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  scheduledAt: z.string().datetime("Invalid date format"),
  duration: z.number().positive("Duration must be positive"),
  maxParticipants: z
    .number()
    .positive("Max participants must be positive")
    .optional(),
  meetingUrl: z.string().url("Invalid meeting URL").optional(),
  meetingId: z.string().optional(),
  meetingPassword: z.string().optional(),
});

// Get instructor live sessions
async function getLiveSessions(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";

    const whereClause: any = {
      instructorId,
    };

    if (status !== "all") {
      whereClause.status = status;
    }

    const [sessions, total] = await Promise.all([
      prisma.liveSession.findMany({
        where: whereClause,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { scheduledAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.liveSession.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get live sessions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch live sessions" },
      { status: 500 }
    );
  }
}

// Create new live session
async function createLiveSession(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const sessionData = createLiveSessionSchema.parse(body);
    const instructorId = req.user!.userId;

    // Verify the course belongs to the instructor
    const course = await prisma.course.findFirst({
      where: {
        id: sessionData.courseId,
        instructorId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found or access denied" },
        { status: 404 }
      );
    }

    const session = await prisma.liveSession.create({
      data: {
        title: sessionData.title,
        description: sessionData.description,
        courseId: sessionData.courseId,
        instructorId,
        scheduledAt: new Date(sessionData.scheduledAt),
        duration: sessionData.duration,
        maxParticipants: sessionData.maxParticipants,
        meetingUrl: sessionData.meetingUrl,
        meetingId: sessionData.meetingId,
        meetingPassword: sessionData.meetingPassword,
        status: "SCHEDULED",
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Create live session error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create live session" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getLiveSessions);
export const POST = withInstructorAuth(createLiveSession);

