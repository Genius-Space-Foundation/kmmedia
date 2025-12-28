import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getAssessmentDetails(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = request.user!.userId;
    const assessmentId = params.id;

    // Fetch assessment with questions
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: studentId,
        courseId: assessment.courseId,
        status: {
          in: ['ACTIVE', 'COMPLETED'],
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Check if assessment is published
    if (!assessment.isPublished) {
      return NextResponse.json(
        { success: false, message: "This assessment is not yet available" },
        { status: 403 }
      );
    }

    // Check existing submissions
    const existingSubmission = await prisma.assessmentSubmission.findUnique({
      where: {
        studentId_assessmentId: {
          studentId,
          assessmentId,
        },
      },
    });

    // Check if student has attempts remaining
    if (existingSubmission && assessment.attempts > 0) {
      // For now, we'll allow only one attempt
      // You can extend this to support multiple attempts
      return NextResponse.json(
        { 
          success: false, 
          message: "You have already submitted this assessment",
          data: {
            hasSubmitted: true,
            submission: existingSubmission,
          },
        },
        { status: 400 }
      );
    }

    // Remove correct answers from questions before sending to client
    const questionsWithoutAnswers = assessment.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      points: q.points,
      order: q.order,
      // Don't send correctAnswer or explanation to client
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        totalPoints: assessment.totalPoints,
        passingScore: assessment.passingScore,
        timeLimit: assessment.timeLimit,
        attempts: assessment.attempts,
        instructions: assessment.instructions,
        questions: questionsWithoutAnswers,
        course: assessment.course,
      },
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(getAssessmentDetails);
