import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function attemptAssessment(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = request.user!.userId;
    const assessmentId = params.id;
    const body = await request.json();
    const { answers, timeSpent } = body; // answers is an object { questionId: answer }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, message: "Invalid answers format" },
        { status: 400 }
      );
    }

    // Fetch assessment with questions and correct answers
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    // Calculate score
    let totalScore = 0;
    const answerRecords = [];

    for (const question of assessment.questions) {
      const studentAnswer = answers[question.id];
      let isCorrect = false;

      if (studentAnswer !== undefined && studentAnswer !== null) {
        // Check if answer is correct based on question type
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
          isCorrect = studentAnswer === question.correctAnswer;
        } else if (question.type === 'MULTIPLE_SELECT') {
          // For multiple select, compare arrays
          const correctAnswers = JSON.parse(question.correctAnswer || '[]');
          const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [];
          isCorrect = 
            correctAnswers.length === studentAnswers.length &&
            correctAnswers.every((ans: string) => studentAnswers.includes(ans));
        }
        // For SHORT_ANSWER and ESSAY, we can't auto-grade, so isCorrect remains false
        // These will need manual grading

        if (isCorrect) {
          totalScore += question.points;
        }

        answerRecords.push({
          questionId: question.id,
          answer: studentAnswer,
          timeSpent: 0, // You can track per-question time if needed
        });
      }
    }

    const percentage = (totalScore / assessment.totalPoints) * 100;
    const passed = percentage >= assessment.passingScore;

    // Create submission
    const submission = await prisma.assessmentSubmission.create({
      data: {
        studentId,
        assessmentId,
        score: totalScore,
        percentage,
        passed,
        timeSpent: timeSpent || 0,
        status: assessment.questions.some(q => 
          q.type === 'SHORT_ANSWER' || q.type === 'ESSAY'
        ) ? 'PENDING' : 'GRADED', // Pending if needs manual grading
      },
    });

    // Create answer records
    await prisma.answer.createMany({
      data: answerRecords.map(record => ({
        submissionId: submission.id,
        questionId: record.questionId,
        answer: record.answer,
        timeSpent: record.timeSpent,
      })),
    });

    // Create dashboard activity
    await prisma.dashboardActivity.create({
      data: {
        userId: studentId,
        type: "assessment_completed",
        title: "Assessment Completed",
        description: `Completed assessment: ${assessment.title}`,
        courseId: assessment.courseId,
        metadata: {
          assessmentId,
          submissionId: submission.id,
          score: totalScore,
          percentage,
          passed,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assessment submitted successfully",
      data: {
        submissionId: submission.id,
        score: totalScore,
        totalPoints: assessment.totalPoints,
        percentage,
        passed,
        needsManualGrading: submission.status === 'PENDING',
      },
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(attemptAssessment);
