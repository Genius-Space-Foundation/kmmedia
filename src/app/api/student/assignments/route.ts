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

    console.log("DEBUG: Student Assignments Fetch", {
        studentId,
        enrolledCourseIds,
        whereClause: JSON.stringify(where)
    });

    const [assignments, assessments] = await Promise.all([
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
      }),
      prisma.assessment.findMany({
        where: {
          courseId: courseId ? courseId : { in: enrolledCourseIds },
          isPublished: true,
          type: "ASSIGNMENT",
        },
        include: {
          course: {
             select: {
              id: true,
              title: true,
              instructor: {
                 select: { id: true, name: true }
              }
             }
          },
          submissions: {
             where: { studentId }
          }
        },
        orderBy: { dueDate: "asc" }
      })
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
        // Helper for filtering
        shouldInclude: true,
        isAssessment: false
      };
    });

    // Transform Assessments to look like Assignments
    const transformedAssessments = assessments.map(assessment => {
        const submission = assessment.submissions[0];
        const effectiveDueDate = assessment.dueDate || new Date();
        const now = new Date();
        const isOverdue = !submission && new Date(effectiveDueDate) < now;
        const isPending = !submission && new Date(effectiveDueDate) >= now;

        return {
            id: assessment.id,
            title: assessment.title,
            description: assessment.description || "",
            instructions: assessment.instructions || "",
            dueDate: effectiveDueDate instanceof Date ? effectiveDueDate.toISOString() : new Date(effectiveDueDate).toISOString(),
            originalDueDate: effectiveDueDate instanceof Date ? effectiveDueDate.toISOString() : new Date(effectiveDueDate).toISOString(),
            hasExtension: false,
            extensionGrantedBy: null,
            maxFileSize: 10485760, // Default 10MB
            allowedFormats: [],
            maxFiles: 5,
            allowLateSubmission: true,
            latePenalty: 0,
            totalPoints: assessment.totalPoints,
            attachments: assessment.attachments,
            course: assessment.course,
            submission: submission ? {
                id: submission.id,
                submittedAt: submission.submittedAt.toISOString(),
                status: submission.status === "GRADED" ? "GRADED" : "SUBMITTED",
                grade: submission.score,
                feedback: submission.feedback,
                isLate: false,
                daysLate: 0,
                files: [], // AssessmentSubmission needs files field or mapped from answers
                submissionText: "",
                gradedAt: submission.gradedAt?.toISOString(),
                gradedBy: submission.gradedBy,
                resubmissionCount: 0
            } : null,
            status: submission ? (submission.status === "GRADED" ? "GRADED" : "SUBMITTED") : (isOverdue ? "OVERDUE" : "PENDING"),
            isOverdue,
            isPending,
            shouldInclude: true,
            isAssessment: true
        };
    });

    const allItems = [...transformedAssignments, ...transformedAssessments].sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    console.log("DEBUG: Fetched Items", {
        assignmentsCount: assignments.length,
        assessmentsCount: assessments.length,
        totalTransformed: allItems.length
    });

    // Filter by status if provided (using the merged list)
       const statusMappedItems = allItems.map(item => {
        let shouldInclude = true;
          if (status) {
            switch (status) {
              case "pending":
                shouldInclude = item.isPending;
                break;
              case "submitted":
                shouldInclude = item.submission?.status === "SUBMITTED";
                break;
              case "graded":
                shouldInclude = item.submission?.status === "GRADED";
                break;
              case "overdue":
                shouldInclude = item.isOverdue;
                break;
              case "late":
                shouldInclude = item.submission?.isLate || false;
                break;
            }
          }
          return { ...item, shouldInclude };
       });

    // Calculate priority and filter
    const finalItems = statusMappedItems.map(item => {
        const daysUntilDue = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        let priority = "LOW";
        if (daysUntilDue <= 3) priority = "HIGH";
        else if (daysUntilDue <= 7) priority = "MEDIUM";
        
        return {
            ...item,
            priority
        };
    });

    const filteredAssignments = finalItems.filter((a) => a.shouldInclude);

    // Remove the shouldInclude field from response
    const finalResponse = filteredAssignments.slice((page - 1) * limit, page * limit).map(
      ({ shouldInclude, ...assignment }) => assignment
    );

    return NextResponse.json({
      success: true,
      data: {
        assignments: finalResponse,
        pagination: {
          page,
          limit,
          total: filteredAssignments.length,
          pages: Math.ceil(filteredAssignments.length / limit),
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
