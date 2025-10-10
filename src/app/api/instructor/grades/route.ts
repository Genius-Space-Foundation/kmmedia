import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Create a new grade
async function createGrade(req: NextRequest) {
  try {
    const instructorId = req.user!.userId;
    const body = await req.json();

    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: body.courseId,
        instructorId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Create grade
    const grade = await prisma.grade.create({
      data: {
        studentId: body.studentId,
        assessmentId: body.assessmentId,
        courseId: body.courseId,
        score: body.score,
        maxScore: body.maxScore,
        percentage: body.percentage,
        letterGrade: body.letterGrade,
        status: "GRADED",
        feedback: body.feedback,
        gradedBy: instructorId,
        attempts: body.attempts || 1,
        timeSpent: body.timeSpent || 0,
      },
    });

    // Create rubric scores if provided
    if (body.rubricScores && body.rubricScores.length > 0) {
      await prisma.rubricScore.createMany({
        data: body.rubricScores.map((rs: any) => ({
          gradeId: grade.id,
          rubricCriterionId: rs.criterionId,
          points: rs.points,
          feedback: rs.feedback,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Grade created successfully",
      data: grade,
    });
  } catch (error) {
    console.error("Create grade error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create grade" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(createGrade);
