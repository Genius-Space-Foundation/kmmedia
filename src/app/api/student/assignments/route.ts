import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getStudentAssignments(request: AuthenticatedRequest) {
  try {
    const studentId = request.user!.userId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get student's active enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
        status: "ACTIVE",
      },
      select: {
        courseId: true,
      },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          assignments: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        },
      });
    }

    // Build where clause
    const where: any = {
      courseId: courseId ? courseId : { in: enrolledCourseIds },
      isPublished: true,
    };

    // Get assignments with student's submissions
    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              instructor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          submissions: {
            where: {
              studentId,
            },
            include: {
              gradingHistory: {
                orderBy: {
                  gradedAt: "desc",
                },
                take: 1,
              },
            },
          },
          extensions: {
            where: {
              studentId,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    // Transform assignments to include student-specific data
    const transformedAssignments = assignments.map((assignment) => {
      const submission = assignment.submissions[0];
      const extension = assignment.extensions[0];
      const effectiveDueDate = extension?.newDueDate || assignment.dueDate;
      const now = new Date();
      const isOverdue =
        !submission && new Date(effectiveDueDate) < now && assignment.allowLateSubmission === false;
      const isPending = !submission && new Date(effectiveDueDate) >= now;
      const isLate = submission?.isLate || false;

      // Filter by status if provided
      let shouldInclude = true;
      if (status) {
        switch (status) {
          case "pending":
            shouldInclude = isPending;
            break;
          case "submitted":
            shouldInclude = !!submission && submission.status === "SUBMITTED";
            break;
          case "graded":
            shouldInclude = !!submission && submission.status === "GRADED";
            break;
          case "overdue":
            shouldInclude = isOverdue;
            break;
          case "late":
            shouldInclude = isLate;
            break;
        }
      }

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: effectiveDueDate.toISOString(),
        originalDueDate: assignment.dueDate.toISOString(),
        hasExtension: !!extension,
        extensionGrantedBy: extension?.grantedBy,
        maxFileSize: assignment.maxFileSize,
        allowedFormats: assignment.allowedFormats,
        maxFiles: assignment.maxFiles,
        allowLateSubmission: assignment.allowLateSubmission,
        latePenalty: assignment.latePenalty,
        totalPoints: assignment.totalPoints,
        attachments: assignment.attachments,
        course: assignment.course,
        submission: submission
          ? {
              id: submission.id,
              submittedAt: submission.submittedAt.toISOString(),
              status: submission.status,
              grade: submission.grade,
              feedback: submission.feedback,
              isLate: submission.isLate,
              daysLate: submission.daysLate,
              files: submission.files,
              submissionText: submission.submissionText,
              gradedAt: submission.gradedAt?.toISOString(),
              gradedBy: submission.gradedBy,
              resubmissionCount: submission.resubmissionCount,
            }
          : null,
        status: submission?.status || (isOverdue ? "OVERDUE" : "PENDING"),
        isOverdue,
        isPending,
        shouldInclude,
      };
    });

    // Filter by status if provided
    const filteredAssignments = status
      ? transformedAssignments.filter((a) => a.shouldInclude)
      : transformedAssignments;

    // Remove the shouldInclude field from response
    const finalAssignments = filteredAssignments.map(
      ({ shouldInclude, ...assignment }) => assignment
    );

    return NextResponse.json({
      success: true,
      data: {
        assignments: finalAssignments,
        pagination: {
          page,
          limit,
          total: status ? finalAssignments.length : total,
          pages: Math.ceil((status ? finalAssignments.length : total) / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch assignments",
      },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(getStudentAssignments);
