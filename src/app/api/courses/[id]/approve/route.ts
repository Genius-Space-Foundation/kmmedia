import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { CourseStatus } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, AuditAction, ResourceType } from "@/lib/audit-log";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const approveCourseSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

async function approveCourse(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Course approval request:", {
      courseId: params.id,
      user: req.user,
    });
    const body = await req.json();
    const { action, notes } = approveCourseSchema.parse(body);
    const courseId = (await params).id;
    const adminId = req.user!.userId;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.status !== CourseStatus.PENDING_APPROVAL) {
      return NextResponse.json(
        { success: false, message: "Course is not pending approval" },
        { status: 400 }
      );
    }

    const newStatus =
      action === "approve" ? CourseStatus.APPROVED : CourseStatus.REJECTED;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: newStatus,
        approvedAt: action === "approve" ? new Date() : null,
        approvedBy: adminId,
      },
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

    // Log course approval/rejection
    await createAuditLog({
      userId: adminId,
      action: action === "approve" ? AuditAction.COURSE_APPROVE : AuditAction.COURSE_REJECT,
      resourceType: ResourceType.COURSE,
      resourceId: courseId,
      metadata: {
        previousStatus: course.status,
        newStatus: updatedCourse.status,
        notes,
        instructorId: course.instructorId,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: `Course ${action}d successfully`,
    });
  } catch (error) {
    console.error("Approve course error:", error);

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
          error instanceof Error ? error.message : "Course approval failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(approveCourse);

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
