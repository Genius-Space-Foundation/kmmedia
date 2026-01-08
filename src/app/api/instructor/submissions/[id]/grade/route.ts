import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { gradeSubmission } from "@/lib/assessments/assessment-manager";
import { z } from "zod";
import { createAuditLog, AuditAction, ResourceType } from "@/lib/audit-log";

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

    // Log assignment grading
    await createAuditLog({
      userId: instructorId,
      action: AuditAction.ASSIGNMENT_GRADE,
      resourceType: ResourceType.ASSIGNMENT, // Or SUBMISSION resource type if added
      // Ideally we track the submission ID, but resourceType might refer to the assignment it belongs to, or a new SUBMISSION type
      // Using generic ASSIGNMENT for now or existing enum
      resourceId: submissionId,
      metadata: {
        score,
        feedback,
      },
      req,
    });

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
