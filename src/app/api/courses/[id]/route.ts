import { NextRequest, NextResponse } from "next/server";
import {
  withAuth,
  withAdminAuth,
  AuthenticatedRequest,
} from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { CourseStatus } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, logStateChange, AuditAction, ResourceType } from "@/lib/audit-log";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get single course
async function getCourse(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                bio: true,
              },
            },
          },
        },
        lessons: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            applications: true,
            enrollments: true,
            assignments: true,
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

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get course error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// Update course (Instructor - own courses only)
async function updateCourse(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id: courseId } = await params;
    const userId = req.user!.userId;

    // Check if course exists and belongs to the instructor
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (existingCourse.instructorId !== userId && req.user!.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this course" },
        { status: 403 }
      );
    }

    // Only allow updates if course is in DRAFT status
    if (
      existingCourse.status !== CourseStatus.DRAFT &&
      req.user!.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot update course that is not in draft status",
        },
        { status: 400 }
      );
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
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

    // Log course update
    await logStateChange({
      userId,
      action: AuditAction.COURSE_UPDATE,
      resourceType: ResourceType.COURSE,
      resourceId: courseId,
      before: existingCourse,
      after: course,
      req,
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Course update failed",
      },
      { status: 500 }
    );
  }
}

// Delete course (Instructor - own courses only, or Admin)
async function deleteCourse(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = req.user!.userId;

    // Check if course exists and belongs to the instructor
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (existingCourse.instructorId !== userId && req.user!.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this course" },
        { status: 403 }
      );
    }

    // Only allow deletion if course is in DRAFT status
    if (
      existingCourse.status !== CourseStatus.DRAFT &&
      req.user!.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete course that is not in draft status",
        },
        { status: 400 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    // Log course deletion
    await createAuditLog({
      userId,
      action: AuditAction.COURSE_DELETE,
      resourceType: ResourceType.COURSE,
      resourceId: courseId,
      metadata: {
        title: existingCourse.title,
        reason: "User initiated deletion",
        previousStatus: existingCourse.status,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Course deletion failed",
      },
      { status: 500 }
    );
  }
}

export const GET = getCourse;
export const PUT = withAuth(updateCourse);
export const DELETE = withAuth(deleteCourse);
