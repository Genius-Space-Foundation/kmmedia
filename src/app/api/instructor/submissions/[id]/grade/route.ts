import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { gradeSubmission } from "@/lib/assessments/assessment-manager";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const gradeSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

async function gradeSubmissionHandler(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const submissionId = params.id;
    const body = await req.json();
    
    const { score, feedback } = gradeSchema.parse(body);

    const updatedSubmission = await gradeSubmission(
      submissionId,
      instructorId,
      feedback,
      score
    );

    return NextResponse.json({
      success: true,
      data: updatedSubmission,
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
      { success: false, message: "Failed to grade submission" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(gradeSubmissionHandler);
