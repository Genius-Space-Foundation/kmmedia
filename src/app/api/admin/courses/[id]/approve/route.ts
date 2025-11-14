import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { CourseStatus } from "@prisma/client";
import {
  notifyCourseApproved,
  notifyCourseRejected,
} from "@/lib/notifications/notification-triggers";
import { z } from "zod";

const approvalSchema = z.object({
  action: z.enum(["approve", "reject"]),
  comments: z.string().optional(),
});

// Approve or reject course (Admin only)
async function approveCourse(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, comments } = approvalSchema.parse(body);

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        { success: false, message: "Course is not pending approval" },
        { status: 400 }
      );
    }

    const newStatus =
      action === "approve" ? CourseStatus.APPROVED : CourseStatus.REJECTED;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        status: newStatus,
        approvalComments: comments,
        approvedAt: action === "approve" ? new Date() : null,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
            enrollments: true,
            lessons: true,
          },
        },
      },
    });

    // Send notification to instructor
    if (action === "approve") {
      await notifyCourseApproved(id).catch((error) =>
        console.error("Failed to send approval notification:", error)
      );
    } else {
      await notifyCourseRejected(id).catch((error) =>
        console.error("Failed to send rejection notification:", error)
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: `Course ${action}d successfully`,
    });
  } catch (error) {
    console.error("Course approval error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Course approval failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(approveCourse);

