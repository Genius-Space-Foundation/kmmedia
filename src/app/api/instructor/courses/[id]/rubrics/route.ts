import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get rubrics for a course
async function getRubrics(
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

    const rubrics = await prisma.gradingRubric.findMany({
      where: {
        courseId,
      },
      include: {
        criteria: {
          include: {
            levels: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: rubrics,
    });
  } catch (error) {
    console.error("Get rubrics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rubrics" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getRubrics);
