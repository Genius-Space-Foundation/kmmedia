import { prisma } from "@/lib/db";
import { AssessmentType, QuestionType } from "@prisma/client";

export interface AssessmentData {
  title: string;
  description: string;
  type: AssessmentType;
  courseId: string;
  instructorId: string;
  totalPoints: number;
  passingScore: number;
  timeLimit?: number; // in minutes
  attempts?: number;
  dueDate?: Date;
  attachments?: string[]; // Array of file URLs
  questions: QuestionData[];
}

export interface QuestionData {
  text: string;
  type: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  order: number;
}

export interface AssessmentSubmission {
  assessmentId: string;
  studentId: string;
  answers: AnswerData[];
  timeSpent: number; // in minutes
}

export interface AnswerData {
  questionId: string;
  answer: string | string[];
  timeSpent: number; // in seconds
}

export async function createAssessment(data: AssessmentData) {
  return await prisma.assessment.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      courseId: data.courseId,
      instructorId: data.instructorId,
      totalPoints: data.totalPoints,
      passingScore: data.passingScore,
      timeLimit: data.timeLimit,
      attempts: data.attempts,
      dueDate: data.dueDate,
      attachments: data.attachments, // Save attachments
      questions: {
        create: data.questions.map((q) => ({
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: q.order,
        })),
      },
    },
    include: {
      questions: true,
      course: {
        select: {
          title: true,
        },
      },
    },
  });
}

export async function getAssessmentById(assessmentId: string) {
  return await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
      course: {
        select: {
          title: true,
        },
      },
      instructor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getCourseAssessments(courseId: string) {
  return await prisma.assessment.findMany({
    where: { courseId },
    include: {
      questions: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function submitAssessment(submission: AssessmentSubmission) {
  // Get assessment details
  const assessment = await prisma.assessment.findUnique({
    where: { id: submission.assessmentId },
    include: {
      questions: true,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  // Check if student has exceeded attempts
  if (assessment.attempts) {
    const existingSubmissions = await prisma.assessmentSubmission.count({
      where: {
        assessmentId: submission.assessmentId,
        studentId: submission.studentId,
      },
    });

    if (existingSubmissions >= assessment.attempts) {
      throw new Error("Maximum attempts exceeded");
    }
  }

  // Calculate score
  const score = calculateScore(assessment.questions, submission.answers);
  const percentage = (score / assessment.totalPoints) * 100;
  const passed = percentage >= assessment.passingScore;

  // Create submission record
  const assessmentSubmission = await prisma.assessmentSubmission.create({
    data: {
      assessmentId: submission.assessmentId,
      studentId: submission.studentId,
      score,
      percentage,
      passed,
      timeSpent: submission.timeSpent,
      submittedAt: new Date(),
      answers: {
        create: submission.answers.map((answer) => ({
          questionId: answer.questionId,
          answer: answer.answer,
          timeSpent: answer.timeSpent,
        })),
      },
    },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  return assessmentSubmission;
}

export async function getStudentSubmissions(
  studentId: string,
  courseId?: string
) {
  const where: any = { studentId };
  if (courseId) {
    where.assessment = { courseId };
  }

  return await prisma.assessmentSubmission.findMany({
    where,
    include: {
      assessment: {
        select: {
          title: true,
          type: true,
          totalPoints: true,
          passingScore: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function getAssessmentSubmissions(assessmentId: string) {
  return await prisma.assessmentSubmission.findMany({
    where: { assessmentId },
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function gradeSubmission(
  submissionId: string,
  instructorId: string,
  feedback?: string,
  manualScore?: number
) {
  const submission = await prisma.assessmentSubmission.findUnique({
    where: { id: submissionId },
    include: {
      assessment: true,
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const updateData: any = {
    gradedBy: instructorId,
    gradedAt: new Date(),
    status: "GRADED",
  };

  if (feedback) {
    updateData.feedback = feedback;
  }

  if (manualScore !== undefined) {
    updateData.manualScore = manualScore;
    updateData.finalScore = manualScore;
    updateData.finalPercentage =
      (manualScore / submission.assessment.totalPoints) * 100;
    updateData.passed =
      updateData.finalPercentage >= submission.assessment.passingScore;
  }

  return await prisma.assessmentSubmission.update({
    where: { id: submissionId },
    data: updateData,
  });
}

export async function getAssessmentStatistics(assessmentId: string) {
  const submissions = await prisma.assessmentSubmission.findMany({
    where: { assessmentId },
    select: {
      score: true,
      percentage: true,
      passed: true,
      timeSpent: true,
    },
  });

  if (submissions.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      averagePercentage: 0,
      passRate: 0,
      averageTimeSpent: 0,
    };
  }

  const totalSubmissions = submissions.length;
  const averageScore =
    submissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions;
  const averagePercentage =
    submissions.reduce((sum, s) => sum + s.percentage, 0) / totalSubmissions;
  const passRate =
    (submissions.filter((s) => s.passed).length / totalSubmissions) * 100;
  const averageTimeSpent =
    submissions.reduce((sum, s) => sum + s.timeSpent, 0) / totalSubmissions;

  return {
    totalSubmissions,
    averageScore: Math.round(averageScore * 100) / 100,
    averagePercentage: Math.round(averagePercentage * 100) / 100,
    passRate: Math.round(passRate * 100) / 100,
    averageTimeSpent: Math.round(averageTimeSpent),
  };
}

// Helper function to calculate score
function calculateScore(questions: any[], answers: AnswerData[]): number {
  let score = 0;

  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    if (!answer) continue;

    if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
      if (answer.answer === question.correctAnswer) {
        score += question.points;
      }
    } else if (question.type === "MULTIPLE_SELECT") {
      const correctAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const studentAnswers = Array.isArray(answer.answer)
        ? answer.answer
        : [answer.answer];

      const isCorrect =
        correctAnswers.length === studentAnswers.length &&
        correctAnswers.every((ca) => studentAnswers.includes(ca));

      if (isCorrect) {
        score += question.points;
      }
    } else if (question.type === "SHORT_ANSWER" || question.type === "ESSAY") {
      // For text-based questions, we'll need manual grading
      // For now, we'll set score to 0 and require manual grading
      score += 0;
    }
  }

  return score;
}

export async function getInstructorAssessments(instructorId: string) {
  const assessments = await prisma.assessment.findMany({
    where: { instructorId },
    include: {
      course: {
        select: {
          title: true,
        },
      },
      _count: {
        select: {
          submissions: true,
          questions: true,
        },
      },
      submissions: {
        select: {
          score: true,
          passed: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return assessments.map((assessment) => {
    const totalSubmissions = assessment.submissions.length;
    const averageScore =
      totalSubmissions > 0
        ? Math.round(
            assessment.submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
              totalSubmissions
          )
        : 0;
    
    // Calculate completion rate (passed / total submissions) * 100
    // Or if completion means "submitted", then it depends on enrollment count which we don't have here easily.
    // For now, let's assume completionRate is pass rate for the assessment.
    const passCount = assessment.submissions.filter(s => s.passed).length;
    const completionRate = totalSubmissions > 0 
      ? Math.round((passCount / totalSubmissions) * 100) 
      : 0;

    // Remove submissions array from result to keep payload small
    const { submissions, ...rest } = assessment;
    
    return {
      ...rest,
      averageScore,
      completionRate,
    };
  });
}
