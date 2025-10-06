import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import {
  createAssessment,
  getInstructorAssessments,
} from "@/lib/assessments/assessment-manager";
import { z } from "zod";

const createAssessmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["QUIZ", "EXAM", "ASSIGNMENT", "PROJECT"]),
  courseId: z.string().min(1, "Course ID is required"),
  totalPoints: z.number().positive("Total points must be positive"),
  passingScore: z.number().min(0, "Passing score must be non-negative"),
  timeLimit: z.number().positive().optional(),
  attempts: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  questions: z
    .array(
      z.object({
        text: z.string().min(1, "Question text is required"),
        type: z.enum([
          "MULTIPLE_CHOICE",
          "MULTIPLE_SELECT",
          "TRUE_FALSE",
          "SHORT_ANSWER",
          "ESSAY",
        ]),
        points: z.number().positive("Points must be positive"),
        options: z.array(z.string()).optional(),
        correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
        explanation: z.string().optional(),
        order: z.number().min(0),
      })
    )
    .min(1, "At least one question is required"),
});

// Create new assessment
async function createAssessmentHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const data = createAssessmentSchema.parse(body);
    const instructorId = req.user!.userId;

    const assessment = await createAssessment({
      ...data,
      instructorId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: assessment,
      message: "Assessment created successfully",
    });
  } catch (error) {
    console.error("Create assessment error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create assessment",
      },
      { status: 500 }
    );
  }
}

// Get instructor's assessments
async function getAssessmentsHandler(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const assessments = await getInstructorAssessments(instructorId);

    return NextResponse.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error("Get assessments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(createAssessmentHandler);
export const GET = withInstructorAuth(getAssessmentsHandler);
