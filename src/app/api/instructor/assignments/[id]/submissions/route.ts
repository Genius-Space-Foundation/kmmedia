import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getAssignmentSubmissions(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = request.user!.userId;
    const assignmentId = params.id;

    // Fetch assignment and verify ownership
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.course.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch all submissions for this assignment
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        assignment: {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          totalPoints: assignment.totalPoints,
          dueDate: assignment.dueDate,
          courseId: assignment.courseId,
          course: {
            title: assignment.course.title,
          },
        },
        submissions: submissions.map((sub) => ({
          id: sub.id,
          student: sub.student,
          submittedAt: sub.submittedAt,
          files: sub.files || [],
          submissionText: sub.submissionText,
          grade: sub.grade,
          feedback: sub.feedback,
          status: sub.status,
          isLate: sub.isLate,
          daysLate: sub.daysLate,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAssignmentSubmissions);
