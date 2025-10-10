import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Create a new grading rubric
async function createRubric(req: NextRequest) {
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

    // Create rubric
    const rubric = await prisma.gradingRubric.create({
      data: {
        name: body.name,
        description: body.description,
        totalPoints: body.totalPoints,
        courseId: body.courseId,
      },
    });

    // Create criteria
    if (body.criteria && body.criteria.length > 0) {
      for (const criterion of body.criteria) {
        const createdCriterion = await prisma.rubricCriterion.create({
          data: {
            name: criterion.name,
            description: criterion.description,
            maxPoints: criterion.maxPoints,
            rubricId: rubric.id,
          },
        });

        // Create levels for this criterion
        if (criterion.levels && criterion.levels.length > 0) {
          await prisma.rubricLevel.createMany({
            data: criterion.levels.map((level: any) => ({
              name: level.name,
              description: level.description,
              points: level.points,
              criterionId: createdCriterion.id,
            })),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Rubric created successfully",
      data: rubric,
    });
  } catch (error) {
    console.error("Create rubric error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create rubric" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(createRubric);
