import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get grades for a course
async function getGrades(
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

    const grades = await prisma.grade.findMany({
      where: {
        courseId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            totalPoints: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        rubricScores: {
          include: {
            rubricCriterion: {
              select: {
                name: true,
                description: true,
                maxPoints: true,
              },
            },
          },
        },
      },
      orderBy: {
        gradedAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedGrades = grades.map((grade) => ({
      id: grade.id,
      studentId: grade.student.id,
      studentName: grade.student.name,
      studentEmail: grade.student.email,
      assessmentId: grade.assessment.id,
      assessmentTitle: grade.assessment.title,
      courseId: grade.course.id,
      courseTitle: grade.course.title,
      score: grade.score,
      maxScore: grade.maxScore,
      percentage: grade.percentage,
      letterGrade: grade.letterGrade,
      status: grade.status,
      feedback: grade.feedback,
      gradedBy: grade.gradedBy,
      gradedAt: grade.gradedAt.toISOString(),
      submittedAt: grade.submittedAt.toISOString(),
      attempts: grade.attempts,
      timeSpent: grade.timeSpent,
      rubricScores: grade.rubricScores.map((rs) => ({
        id: rs.id,
        criterion: rs.rubricCriterion.name,
        description: rs.rubricCriterion.description,
        points: rs.points,
        maxPoints: rs.rubricCriterion.maxPoints,
        feedback: rs.feedback,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: transformedGrades,
    });
  } catch (error) {
    console.error("Get grades error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getGrades);
