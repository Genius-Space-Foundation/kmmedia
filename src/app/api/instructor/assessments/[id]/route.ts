import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const updateAssessmentSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  type: z.enum(["QUIZ", "EXAM", "ASSIGNMENT", "PROJECT"]).optional(),
  courseId: z.string().min(1, "Course ID is required").optional(),
  totalPoints: z.number().positive("Total points must be positive").optional(),
  passingScore: z.number().min(0, "Passing score must be non-negative").optional(),
  timeLimit: z.number().positive().optional(),
  attempts: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  attachments: z.array(z.string()).optional(),
  questions: z
    .array(
      z.object({
        id: z.string().optional(), // Optional for new questions
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
    .min(1, "At least one question is required")
    .optional(),
});

// GET single assessment
async function getAssessmentHandler(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (assessment.instructorId !== req.user!.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error("Get assessment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// DELETE assessment
async function deleteAssessmentHandler(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (assessment.instructorId !== req.user!.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.assessment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assessment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}

// UPDATE assessment
async function updateAssessmentHandler(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data = updateAssessmentSchema.parse(body);

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (assessment.instructorId !== req.user!.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update assessment
    const updatedAssessment = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const updated = await tx.assessment.update({
        where: { id: params.id },
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          courseId: data.courseId,
          totalPoints: data.totalPoints,
          passingScore: data.passingScore,
          timeLimit: data.timeLimit,
          attempts: data.attempts,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          attachments: data.attachments,
        },
      });

      // 2. Update questions if provided
      if (data.questions) {
        // Delete existing questions
        await tx.question.deleteMany({
          where: { assessmentId: params.id },
        });

        // Create new questions
        await tx.question.createMany({
          data: data.questions.map((q) => ({
            assessmentId: params.id,
            text: q.text,
            type: q.type,
            points: q.points,
            options: q.options,
            correctAnswer: q.correctAnswer as string, // Cast for simplicity, handle array in logic if needed
            explanation: q.explanation,
            order: q.order,
          })),
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: updatedAssessment,
      message: "Assessment updated successfully",
    });
  } catch (error) {
    console.error("Update assessment error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAssessmentHandler);
export const DELETE = withInstructorAuth(deleteAssessmentHandler);
export const PATCH = withInstructorAuth(updateAssessmentHandler);
