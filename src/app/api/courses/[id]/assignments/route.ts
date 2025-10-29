import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { AssignmentService } from "@/lib/assignments/assignment-service";
import { handleAssignmentError } from "@/lib/assignments/assignment-errors";

// Get assignments for a course (for students)
async function getCourseAssignments(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Students get assignments with their submission status
    // Instructors and admins get all assignments for the course
    let assignments;

    if (userRole === "STUDENT") {
      assignments = await AssignmentService.getAssignmentsByCourse(
        courseId,
        userId
      );
    } else {
      // For instructors/admins, get assignments without student-specific data
      assignments = await AssignmentService.getAssignmentsByCourse(courseId);
    }

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

export const GET = withAuth(getCourseAssignments);
