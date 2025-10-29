import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { AssignmentService } from "@/lib/assignments/assignment-service";

interface RouteParams {
  params: {
    id: string;
  };
}

// Publish assignment
async function publishAssignment(
  req: AuthenticatedRequest,
  { params }: RouteParams
) {
  try {
    const assignmentId = params.id;
    const instructorId = req.user!.userId;

    const assignment = await AssignmentService.publishAssignment(
      assignmentId,
      instructorId
    );

    return NextResponse.json({
      success: true,
      data: assignment,
      message: "Assignment published successfully",
    });
  } catch (error) {
    console.error("Publish assignment error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Assignment publishing failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(publishAssignment);
