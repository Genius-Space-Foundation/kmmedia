import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { AssignmentService } from "@/lib/assignments/assignment-service";
import { z } from "zod";

interface RouteParams {
  params: {
    id: string;
  };
}

const grantExtensionSchema = z.object({
  studentId: z.string().cuid("Invalid student ID"),
  newDueDate: z.string().transform((str) => new Date(str)),
  reason: z.string().min(1, "Reason is required"),
});

// Grant extension to a student
async function grantExtension(
  req: AuthenticatedRequest,
  { params }: RouteParams
) {
  try {
    const assignmentId = params.id;
    const instructorId = req.user!.userId;
    const body = await req.json();

    // Validate input
    const { studentId, newDueDate, reason } = grantExtensionSchema.parse(body);

    const extension = await AssignmentService.grantExtension(
      assignmentId,
      studentId,
      { newDueDate, reason },
      instructorId
    );

    return NextResponse.json({
      success: true,
      data: extension,
      message: "Extension granted successfully",
    });
  } catch (error) {
    console.error("Grant extension error:", error);

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
          error instanceof Error ? error.message : "Extension grant failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(grantExtension);
