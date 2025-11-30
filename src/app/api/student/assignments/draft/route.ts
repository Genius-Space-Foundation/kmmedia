import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

async function saveDraft(request: AuthenticatedRequest) {
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

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    // Create or update draft submission
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: {
        files: files || [],
        submissionText: submissionText || null,
        // Don't update submittedAt or status if it's already submitted
        // But if it's a draft, keep it as draft
      },
      create: {
        assignmentId,
        studentId,
        files: files || [],
        submissionText: submissionText || null,
        status: "DRAFT",
      },
    });

    // Only update status to DRAFT if it's not already SUBMITTED or GRADED
    if (submission.status !== "SUBMITTED" && submission.status !== "GRADED") {
      await prisma.assignmentSubmission.update({
        where: { id: submission.id },
        data: { status: "DRAFT" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Draft saved successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save draft" },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(saveDraft);
