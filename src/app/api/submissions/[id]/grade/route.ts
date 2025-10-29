import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { GradingService } from "@/lib/assignments/grading-service";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const submissionId = params.id;
    const body = await request.json();

    // Use the GradingService to handle validation and grading
    const result = await GradingService.gradeSubmission(
      submissionId,
      body,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error grading submission:", error);

    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to grade submission" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const submissionId = params.id;

    // Get submission with all details
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verify access permissions
    const hasAccess =
      submission.studentId === session.user.id || // Student owns the submission
      submission.assignment.instructorId === session.user.id || // Instructor owns the assignment
      session.user.role === "ADMIN"; // Admin has access to all

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Format response with parsed files
    const parsedFiles = submission.files
      ? JSON.parse(submission.files as string)
      : [];

    const responseSubmission = {
      ...submission,
      parsedFiles,
    };

    return NextResponse.json(responseSubmission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}
