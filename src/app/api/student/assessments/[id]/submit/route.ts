import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { submitAssessment } from "@/lib/assessments/assessment-manager";
import { z } from "zod";

const submitAssessmentSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.union([z.string(), z.array(z.string())]),
        timeSpent: z.number().min(0),
      })
    )
    .min(1, "At least one answer is required"),
  timeSpent: z.number().min(0, "Time spent must be non-negative"),
});

// Submit assessment
async function submitAssessmentHandler(req: AuthenticatedRequest) {
  try {
    const { id } = req.nextUrl.pathname.split("/").pop() as any;
    const body = await req.json();
    const data = submitAssessmentSchema.parse(body);
    const studentId = req.user!.userId;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Assessment ID is required" },
        { status: 400 }
      );
    }

    const submission = await submitAssessment({
      assessmentId: id,
      studentId,
      answers: data.answers,
      timeSpent: data.timeSpent,
    });

    return NextResponse.json({
      success: true,
      data: submission,
      message: "Assessment submitted successfully",
    });
  } catch (error) {
    console.error("Submit assessment error:", error);

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
          error instanceof Error
            ? error.message
            : "Failed to submit assessment",
      },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(submitAssessmentHandler);
