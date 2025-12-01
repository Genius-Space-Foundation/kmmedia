import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Request validation schema
const updateSubmissionSchema = z.object({
  submissionText: z.string().optional(),
  files: z
    .array(
      z.object({
        id: z.string(),
        originalName: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        cloudinaryUrl: z.string(),
      })
    )
    .optional(),
  isDraft: z.boolean().optional(),
});

// Get submission by ID
async function handleGetSubmission(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  try {
    const pathSegments = req.nextUrl.pathname.split("/");
    const submissionId = pathSegments[pathSegments.length - 1];
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (!submissionId) {
      return NextResponse.json(
        { success: false, message: "Submission ID is required" },
        { status: 400 }
      );
    }

    // Get submission with related data
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
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
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess =
      submission.studentId === userId || // Student owns the submission
      submission.assignment.instructorId === userId || // Instructor owns the assignment
      userRole === "ADMIN"; // Admin has access to all

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Parse files JSON
    const parsedFiles = submission.files
      ? JSON.parse(submission.files as string)
      : [];

    // Calculate late penalty if applicable
    let latePenalty = 0;
    if (
      submission.isLate &&
      submission.assignment.latePenalty &&
      submission.daysLate > 0
    ) {
      latePenalty =
        (submission.assignment.latePenalty / 100) * submission.daysLate;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        assignmentTitle: submission.assignment.title,
        courseTitle: submission.assignment.course.title,
        courseId: submission.assignment.course.id,
        submissionText: submission.submissionText,
        files: parsedFiles,
        status: submission.status,
        isLate: submission.isLate,
        daysLate: submission.daysLate,
        latePenalty,
        submittedAt: submission.submittedAt,
        grade: submission.grade,
        originalScore: submission.originalScore,
        finalScore: submission.finalScore,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt,
        gradedBy: submission.gradedBy,
        resubmissionCount: submission.resubmissionCount,
        lastResubmittedAt: submission.lastResubmittedAt,
        student: submission.student,
        instructor: submission.assignment.instructor,
        assignment: {
          id: submission.assignment.id,
          title: submission.assignment.title,
          description: submission.assignment.description,
          instructions: submission.assignment.instructions,
          dueDate: submission.assignment.dueDate,
          totalPoints: submission.assignment.totalPoints,
          allowLateSubmission: submission.assignment.allowLateSubmission,
          latePenalty: submission.assignment.latePenalty,
          maxFileSize: submission.assignment.maxFileSize,
          allowedFormats: submission.assignment.allowedFormats,
          maxFiles: submission.assignment.maxFiles,
        },
      },
    });
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

// Update submission
async function handleUpdateSubmission(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  try {
    const pathSegments = req.nextUrl.pathname.split("/");
    const submissionId = pathSegments[pathSegments.length - 1];
    const userId = req.user!.userId;
    const body = await req.json();
    const validatedData = updateSubmissionSchema.parse(body);

    if (!submissionId) {
      return NextResponse.json(
        { success: false, message: "Submission ID is required" },
        { status: 400 }
      );
    }

    // Get existing submission
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // Check if user owns the submission
    if (existingSubmission.studentId !== userId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Check if submission can be updated
    if (existingSubmission.status === "GRADED") {
      return NextResponse.json(
        { success: false, message: "Cannot update a graded submission" },
        { status: 400 }
      );
    }

    // Check deadline for non-draft updates
    const now = new Date();
    const dueDate = new Date(existingSubmission.assignment.dueDate);
    const isOverdue = now > dueDate;

    if (
      !validatedData.isDraft &&
      isOverdue &&
      !existingSubmission.assignment.allowLateSubmission
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Assignment deadline has passed and late submissions are not allowed",
        },
        { status: 400 }
      );
    }

    // Calculate late penalty if applicable
    let daysLate = existingSubmission.daysLate;
    let isLate = existingSubmission.isLate;

    if (!validatedData.isDraft && isOverdue) {
      isLate = true;
      daysLate = Math.ceil(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Prepare update data
    const updateData: any = {
      submissionText:
        validatedData.submissionText !== undefined
          ? validatedData.submissionText
          : existingSubmission.submissionText,
      files: validatedData.files
        ? JSON.stringify(validatedData.files)
        : existingSubmission.files,
      status:
        validatedData.isDraft !== undefined
          ? validatedData.isDraft
            ? "DRAFT"
            : "SUBMITTED"
          : existingSubmission.status,
      isLate,
      daysLate,
    };

    // Update submission timestamp if changing from draft to submitted
    if (
      existingSubmission.status === "DRAFT" &&
      updateData.status === "SUBMITTED"
    ) {
      updateData.submittedAt = now;
      updateData.resubmissionCount = existingSubmission.resubmissionCount + 1;
      updateData.lastResubmittedAt = now;
    }

    // Update submission
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: updateData,
      include: {
        assignment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
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

    // Update assignment submission count if status changed from draft to submitted
    if (
      existingSubmission.status === "DRAFT" &&
      updateData.status === "SUBMITTED"
    ) {
      await prisma.assignment.update({
        where: { id: existingSubmission.assignmentId },
        data: {
          submissionCount: {
            increment: 1,
          },
        },
      });
    }

    // Parse files JSON for response
    const parsedFiles = updatedSubmission.files
      ? JSON.parse(updatedSubmission.files as string)
      : [];

    return NextResponse.json({
      success: true,
      data: {
        id: updatedSubmission.id,
        assignmentId: updatedSubmission.assignmentId,
        assignmentTitle: updatedSubmission.assignment.title,
        courseTitle: updatedSubmission.assignment.course.title,
        submissionText: updatedSubmission.submissionText,
        files: parsedFiles,
        status: updatedSubmission.status,
        isLate: updatedSubmission.isLate,
        daysLate: updatedSubmission.daysLate,
        submittedAt: updatedSubmission.submittedAt,
        grade: updatedSubmission.grade,
        feedback: updatedSubmission.feedback,
        gradedAt: updatedSubmission.gradedAt,
        resubmissionCount: updatedSubmission.resubmissionCount,
        lastResubmittedAt: updatedSubmission.lastResubmittedAt,
        student: updatedSubmission.student,
        instructor: updatedSubmission.assignment.instructor,
      },
      message: validatedData.isDraft
        ? "Draft updated successfully"
        : "Submission updated successfully",
    });
  } catch (error) {
    console.error("Update submission error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid submission data",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update submission" },
      { status: 500 }
    );
  }
}

// Delete submission (only drafts can be deleted)
async function handleDeleteSubmission(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  try {
    const pathSegments = req.nextUrl.pathname.split("/");
    const submissionId = pathSegments[pathSegments.length - 1];
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (!submissionId) {
      return NextResponse.json(
        { success: false, message: "Submission ID is required" },
        { status: 400 }
      );
    }

    // Get existing submission
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const hasAccess =
      existingSubmission.studentId === userId || userRole === "ADMIN";

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Only allow deletion of draft submissions
    if (existingSubmission.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, message: "Only draft submissions can be deleted" },
        { status: 400 }
      );
    }

    // Delete submission
    await prisma.assignmentSubmission.delete({
      where: { id: submissionId },
    });

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Delete submission error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete submission" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGetSubmission);
export const PUT = withAuth(handleUpdateSubmission);
export const DELETE = withAuth(handleDeleteSubmission);
