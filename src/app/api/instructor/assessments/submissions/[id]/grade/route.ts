import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { gradeSubmission } from "@/lib/assessments/assessment-manager";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const gradeSubmissionSchema = z.object({
  feedback: z.string().optional(),
  manualScore: z.number().positive().optional(),
});

// Grade assessment submission
async function gradeSubmissionHandler(req: AuthenticatedRequest) {
  try {
    const { id } = req.nextUrl.pathname.split("/").pop() as any;
    const body = await req.json();
    const data = gradeSubmissionSchema.parse(body);
    const instructorId = req.user!.userId;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Submission ID is required" },
        { status: 400 }
      );
    }

    const gradedSubmission = await gradeSubmission(
      id,
      instructorId,
      data.feedback,
      data.manualScore
    );

    return NextResponse.json({
      success: true,
      data: gradedSubmission,
      message: "Submission graded successfully",
    });
  } catch (error) {
    console.error("Grade submission error:", error);

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
          error instanceof Error ? error.message : "Failed to grade submission",
      },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(gradeSubmissionHandler);

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
