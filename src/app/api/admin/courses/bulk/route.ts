import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { CourseStatus } from "@prisma/client";
import { z } from "zod";

const bulkCourseActionSchema = z.object({
  action: z.enum(["approve", "reject", "publish", "unpublish"]),
  courseIds: z.array(z.string()).min(1, "At least one course ID is required"),
  comments: z.string().optional(),
});

// Bulk course actions (Admin only)
async function bulkCourseActions(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { action, courseIds, comments } = bulkCourseActionSchema.parse(body);

    let updateData: any = {};
    let statusFilter: any = {};

    switch (action) {
      case "approve":
        updateData = {
          status: CourseStatus.APPROVED,
          approvalComments: comments,
          approvedAt: new Date(),
        };
        statusFilter = { status: "PENDING_APPROVAL" };
        break;
      case "reject":
        updateData = {
          status: CourseStatus.REJECTED,
          approvalComments: comments,
        };
        statusFilter = { status: "PENDING_APPROVAL" };
        break;
      case "publish":
        updateData = { status: CourseStatus.PUBLISHED };
        statusFilter = { status: "APPROVED" };
        break;
      case "unpublish":
        updateData = { status: CourseStatus.APPROVED };
        statusFilter = { status: "PUBLISHED" };
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    // Validate that all courses are in the correct status for the action
    const validCourses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
        ...statusFilter,
      },
      select: { id: true },
    });

    if (validCourses.length !== courseIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: `Some courses are not in the correct status for ${action}`,
        },
        { status: 400 }
      );
    }

    const result = await prisma.course.updateMany({
      where: {
        id: { in: courseIds },
      },
      data: updateData,
    });

    // Get updated courses for notification
    const updatedCourses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      include: {
        instructor: {
          select: { email: true, name: true },
        },
      },
    });

    // TODO: Send notification emails to instructors
    updatedCourses.forEach((course) => {
      console.log(
        `Course ${action}d: ${course.title} for instructor ${course.instructor.email}`
      );
    });

    return NextResponse.json({
      success: true,
      data: { updatedCount: result.count },
      message: `${result.count} courses ${action}d successfully`,
    });
  } catch (error) {
    console.error("Bulk course action error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Bulk action failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(bulkCourseActions);

