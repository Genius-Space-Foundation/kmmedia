import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Request validation schemas
const createSubmissionSchema = z.object({
  assignmentId: z.string().cuid(),
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
  isDraft: z.boolean().default(false),
});

// Create or update submission
async function handleCreateSubmission(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validatedData = createSubmissionSchema.parse(body);
    const userId = req.user!.userId;

    // Check if assignment exists and user has access
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: validatedData.assignmentId,
        course: {
          enrollments: {
            some: {
              userId: userId,
              status: "ACTIVE",
            },
          },
        },
      },
      include: {
        course: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found or access denied" },
        { status: 404 }
      );
    }

    // Check if assignment is published
    if (!assignment.isPublished) {
      return NextResponse.json(
        { success: false, message: "Assignment is not yet published" },
        { status: 400 }
      );
    }

    // Check deadline (unless it's a draft)
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;

    if (
      !validatedData.isDraft &&
      isOverdue &&
      !assignment.allowLateSubmission
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

    // Check for existing submission
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: validatedData.assignmentId,
          studentId: userId,
        },
      },
    });

    // If submission already exists and is submitted, don't allow new submission
    if (
      existingSubmission &&
      existingSubmission.status === "SUBMITTED" &&
      !validatedData.isDraft
    ) {
      return NextResponse.json(
        { success: false, message: "Assignment has already been submitted" },
        { status: 400 }
      );
    }

    // Calculate late penalty if applicable
    let daysLate = 0;
    let isLate = false;
    if (!validatedData.isDraft && isOverdue) {
      isLate = true;
      daysLate = Math.ceil(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Prepare submission data
    const submissionData = {
      assignmentId: validatedData.assignmentId,
      studentId: userId,
      files: validatedData.files ? JSON.stringify(validatedData.files) : undefined,
      submissionText: validatedData.submissionText || undefined,
      status: validatedData.isDraft ? "DRAFT" : "SUBMITTED",
      isLate,
      daysLate,
      submittedAt: validatedData.isDraft ? undefined : now,
    };

    let submission;
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.assignmentSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          ...submissionData,
          resubmissionCount:
            existingSubmission.resubmissionCount +
            (validatedData.isDraft ? 0 : 1),
          lastResubmittedAt: validatedData.isDraft
            ? existingSubmission.lastResubmittedAt
            : now,
        },
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
    } else {
      // Create new submission
      submission = await prisma.assignmentSubmission.create({
        data: submissionData,
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
    }

    // Update assignment submission count if this is a new submission (not draft)
    if (
      !validatedData.isDraft &&
      (!existingSubmission || existingSubmission.status === "DRAFT")
    ) {
      await prisma.assignment.update({
        where: { id: validatedData.assignmentId },
        data: {
          submissionCount: {
            increment: 1,
          },
        },
      });
    }

    // Parse files JSON for response
    const parsedFiles = submission.files
      ? JSON.parse(submission.files as string)
      : [];

    return NextResponse.json({
      success: true,
      data: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        assignmentTitle: submission.assignment.title,
        courseTitle: submission.assignment.course.title,
        submissionText: submission.submissionText,
        files: parsedFiles,
        status: submission.status,
        isLate: submission.isLate,
        daysLate: submission.daysLate,
        submittedAt: submission.submittedAt,
        grade: submission.grade,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt,
        resubmissionCount: submission.resubmissionCount,
        lastResubmittedAt: submission.lastResubmittedAt,
        student: submission.student,
        instructor: submission.assignment.instructor,
      },
      message: validatedData.isDraft
        ? "Draft saved successfully"
        : "Assignment submitted successfully",
    });
  } catch (error) {
    console.error("Create submission error:", error);

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
      { success: false, message: "Failed to create submission" },
      { status: 500 }
    );
  }
}

// Get user's submissions
async function handleGetSubmissions(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userId = req.user!.userId;

    // Build where clause
    const where: any = {
      studentId: userId,
    };

    if (assignmentId) {
      where.assignmentId = assignmentId;
    }

    if (courseId) {
      where.assignment = {
        courseId: courseId,
      };
    }

    if (status) {
      where.status = status;
    }

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      prisma.assignmentSubmission.findMany({
        where,
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
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.assignmentSubmission.count({ where }),
    ]);

    // Format submissions for response
    const formattedSubmissions = submissions.map((submission) => {
      const parsedFiles = submission.files
        ? JSON.parse(submission.files as string)
        : [];

      return {
        id: submission.id,
        assignmentId: submission.assignmentId,
        assignmentTitle: submission.assignment.title,
        courseTitle: submission.assignment.course.title,
        coursId: submission.assignment.course.id,
        submissionText: submission.submissionText,
        files: parsedFiles,
        status: submission.status,
        isLate: submission.isLate,
        daysLate: submission.daysLate,
        submittedAt: submission.submittedAt,
        grade: submission.grade,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt,
        resubmissionCount: submission.resubmissionCount,
        lastResubmittedAt: submission.lastResubmittedAt,
        assignment: {
          id: submission.assignment.id,
          title: submission.assignment.title,
          dueDate: submission.assignment.dueDate,
          totalPoints: submission.assignment.totalPoints,
          course: submission.assignment.course,
          instructor: submission.assignment.instructor,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        submissions: formattedSubmissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleCreateSubmission);
export const GET = withAuth(handleGetSubmissions);
