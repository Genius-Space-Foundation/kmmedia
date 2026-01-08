import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { AssignmentService } from "@/lib/assignments/assignment-service";
import {
  handleAssignmentError,
  formatValidationErrors,
} from "@/lib/assignments/assignment-errors";
import { z } from "zod";
import { createAuditLog, AuditAction, ResourceType } from "@/lib/audit-log";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Create assignment
async function createAssignment(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const instructorId = req.user!.userId;

    // Convert dueDate string to Date object
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate);
    }

    const assignment = await AssignmentService.createAssignment(
      body,
      instructorId
    );

    // Log assignment creation
    await createAuditLog({
      userId: instructorId,
      action: AuditAction.ASSIGNMENT_CREATE,
      resourceType: ResourceType.ASSIGNMENT,
      resourceId: assignment.id,
      metadata: {
        title: assignment.title,
        courseId: assignment.courseId,
        dueDate: assignment.dueDate,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      data: assignment,
      message: "Assignment created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: formatValidationErrors(error.issues),
        },
        { status: 400 }
      );
    }

    const errorResponse = handleAssignmentError(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

// Get assignments (for instructors)
async function getAssignments(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const assignments = await AssignmentService.getAssignmentsByInstructor(
      instructorId,
      courseId || undefined
    );

    return NextResponse.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    const errorResponse = handleAssignmentError(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

export const POST = withInstructorAuth(createAssignment);
export const GET = withInstructorAuth(getAssignments);
