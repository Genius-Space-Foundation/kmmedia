import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get assessments for a course
async function getAssessments(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const { id: courseId } = params;

    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        courseId,
      },
      include: {
        _count: {
          select: {
            submissions: true,
            completions: true,
          },
        },
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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

// Create a new assessment
async function createAssessment(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const { id: courseId } = params;
    const body = await req.json();

    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        duration: body.duration,
        totalPoints: body.totalPoints,
        passingScore: body.passingScore,
        attempts: body.attempts,
        isTimed: body.isTimed,
        allowReview: body.allowReview,
        showCorrectAnswers: body.showCorrectAnswers,
        randomizeQuestions: body.randomizeQuestions,
        randomizeOptions: body.randomizeOptions,
        courseId,
      },
    });

    // Create questions if provided
    if (body.questions && body.questions.length > 0) {
      await prisma.question.createMany({
        data: body.questions.map((question: any) => ({
          type: question.type,
          question: question.question,
          points: question.points,
          order: question.order,
          isRequired: question.isRequired,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          timeLimit: question.timeLimit,
          assessmentId: assessment.id,
        })),
      });

      // Create question options for questions that have them
      const questionsWithOptions = body.questions.filter(
        (q: any) => q.options && q.options.length > 0
      );

      for (const question of questionsWithOptions) {
        const createdQuestion = await prisma.question.findFirst({
          where: {
            assessmentId: assessment.id,
            order: question.order,
          },
        });

        if (createdQuestion) {
          await prisma.questionOption.createMany({
            data: question.options.map((option: any) => ({
              text: option.text,
              isCorrect: option.isCorrect,
              order: option.order,
              questionId: createdQuestion.id,
            })),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Assessment created successfully",
      data: assessment,
    });
  } catch (error) {
    console.error("Create assessment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAssessments);
export const POST = withInstructorAuth(createAssessment);
