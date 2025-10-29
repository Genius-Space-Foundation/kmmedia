import { NextRequest, NextResponse } from "next/server";
import {
  withInstructorAuth,
  withAuth,
  AuthenticatedRequest,
} from "@/lib/middleware";
import { AssignmentService } from "@/lib/assignments/assignment-service";
import { UserRole } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: {
    id: string;
  };
}

// Get assignment by ID
async function getAssignment(
  req: AuthenticatedRequest,
  { params }: RouteParams
) {
  try {
    const assignmentId = params.id;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let assignment;

    if (userRole === UserRole.INSTRUCTOR || userRole === UserRole.ADMIN) {
      // For instructors, get full assignment details
      assignment = await AssignmentService.getAssignmentById(
        assignmentId,
        userId
      );
    } else if (userRole === UserRole.STUDENT) {
      // For students, get assignment with submission status
      assignment = await AssignmentService.getAssignmentForStudent(
        assignmentId,
        userId
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch assignment",
      },
      { status: 500 }
    );
  }
}

// Update assignment
async function updateAssignment(
  req: AuthenticatedRequest,
  { params }: RouteParams
) {
  try {
    const assignmentId = params.id;
    const instructorId = req.user!.userId;
    const body = await req.json();

    // Convert dueDate string to Date object if provided
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate);
    }

    const assignment = await AssignmentService.updateAssignment(
      assignmentId,
      body,
      instructorId
    );

    return NextResponse.json({
      success: true,
      data: assignment,
      message: "Assignment updated successfully",
    });
  } catch (error) {
    console.error("Update assignment error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Assignment update failed",
      },
      { status: 500 }
    );
  }
}

// Delete assignment
async function deleteAssignment(
  req: AuthenticatedRequest,
  { params }: RouteParams
) {
  try {
    const assignmentId = params.id;
    const instructorId = req.user!.userId;

    await AssignmentService.deleteAssignment(assignmentId, instructorId);

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Assignment deletion failed",
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAssignment);
export const PUT = withInstructorAuth(updateAssignment);
export const DELETE = withInstructorAuth(deleteAssignment);
