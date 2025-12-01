import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  courseId: z.string().optional(),
  isScheduled: z.boolean().default(false),
  scheduledFor: z.string().optional(),
  recipients: z.array(z.string()).default([]),
});

// Create announcement (Instructor only)
async function createAnnouncement(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const announcementData = createAnnouncementSchema.parse(body);
    const instructorId = req.user!.userId;

    // If courseId is provided, verify ownership
    if (announcementData.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: announcementData.courseId },
      });

      if (!course) {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        );
      }

      if (course.instructorId !== instructorId) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: announcementData.title,
        content: announcementData.content,
        courseId: announcementData.courseId,
        instructorId,
        isScheduled: announcementData.isScheduled,
        scheduledFor: announcementData.scheduledFor
          ? new Date(announcementData.scheduledFor)
          : null,
        isPublished: !announcementData.isScheduled, // Auto-publish if not scheduled
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
      data: announcement,
      message: "Announcement created successfully",
    });
  } catch (error) {
    console.error("Create announcement error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Announcement creation failed",
      },
      { status: 500 }
    );
  }
}

// Get instructor's announcements
async function getInstructorAnnouncements(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { instructorId };

    if (courseId) {
      where.courseId = courseId;
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.announcement.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get instructor announcements error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(createAnnouncement);
export const GET = withInstructorAuth(getInstructorAnnouncements);

