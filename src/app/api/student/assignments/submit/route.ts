import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

async function submitAssignment(request: AuthenticatedRequest) {
  try {
    const studentId = request.user!.userId;
    const body = await request.json();
    const { assignmentId, files, submissionText } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: "Assignment ID is required" },
        { status: 400 }
      );
    }

    if ((!files || files.length === 0) && !submissionText) {
      return NextResponse.json(
        { success: false, message: "Submission must contain files or text" },
        { status: 400 }
      );
    }

    // Check if assignment exists and is active
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        extensions: {
          where: { studentId },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check due date and late submission policy
    const extension = assignment.extensions[0];
    const effectiveDueDate = extension?.newDueDate || assignment.dueDate;
    const now = new Date();
    const isLate = now > effectiveDueDate;

    if (isLate && !assignment.allowLateSubmission) {
      return NextResponse.json(
        { success: false, message: "Late submissions are not allowed" },
        { status: 400 }
      );
    }

    // Calculate days late
    let daysLate = 0;
    if (isLate) {
      const diffTime = Math.abs(now.getTime() - effectiveDueDate.getTime());
      daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Create or update submission
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: {
        files,
        submissionText,
        submittedAt: now,
        status: "SUBMITTED",
        isLate,
        daysLate,
        resubmissionCount: {
          increment: 1,
        },
        lastResubmittedAt: now,
      },
      create: {
        assignmentId,
        studentId,
        files,
        submissionText,
        submittedAt: now,
        status: "SUBMITTED",
        isLate,
        daysLate,
      },
    });

    // Create dashboard activity
    await prisma.dashboardActivity.create({
      data: {
        userId: studentId,
        type: "assignment_submitted",
        title: "Assignment Submitted",
        description: `Submitted assignment: ${assignment.title}`,
        courseId: assignment.courseId,
        metadata: {
          assignmentId,
          submissionId: submission.id,
          isLate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment submitted successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(submitAssignment);
