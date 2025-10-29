import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for bulk grading
const bulkGradeSchema = z.object({
  grades: z
    .array(
      z.object({
        submissionId: z.string().cuid(),
        grade: z.number().min(0).max(1000),
        feedback: z.string().optional(),
      })
    )
    .min(1, "At least one grade is required"),
  returnToStudents: z.boolean().optional().default(false),
});

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

    const assignmentId = params.id;
    const body = await request.json();

    // Validate input
    const validationResult = bulkGradeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { grades, returnToStudents } = validationResult.data;

    // Verify assignment exists and instructor has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const hasAccess =
      assignment.instructorId === session.user.id ||
      session.user.role === "ADMIN";

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Access denied. You don't have permission to grade this assignment.",
        },
        { status: 403 }
      );
    }

    // Get all submissions for validation
    const submissionIds = grades.map((g) => g.submissionId);
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        id: { in: submissionIds },
        assignmentId: assignmentId,
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
    });

    // Validate all submissions exist and belong to this assignment
    if (submissions.length !== grades.length) {
      return NextResponse.json(
        {
          error:
            "Some submissions not found or don't belong to this assignment",
        },
        { status: 400 }
      );
    }

    // Validate grades don't exceed assignment total points
    const invalidGrades = grades.filter(
      (g) => g.grade > assignment.totalPoints
    );
    if (invalidGrades.length > 0) {
      return NextResponse.json(
        {
          error: `Some grades exceed the maximum of ${assignment.totalPoints} points`,
        },
        { status: 400 }
      );
    }

    const results = [];
    const notifications = [];
    let newlyGradedCount = 0;

    // Process each grade in a transaction
    await prisma.$transaction(async (tx) => {
      for (const gradeData of grades) {
        const submission = submissions.find(
          (s) => s.id === gradeData.submissionId
        );
        if (!submission) continue;

        // Calculate late penalty if applicable
        let originalScore = gradeData.grade;
        let finalScore = gradeData.grade;
        let latePenaltyApplied = 0;

        if (
          submission.isLate &&
          assignment.latePenalty &&
          submission.daysLate > 0
        ) {
          latePenaltyApplied =
            (assignment.latePenalty / 100) * submission.daysLate;
          const penaltyAmount = originalScore * latePenaltyApplied;
          finalScore = Math.max(0, originalScore - penaltyAmount);
        }

        // Update submission
        const updatedSubmission = await tx.assignmentSubmission.update({
          where: { id: gradeData.submissionId },
          data: {
            grade: finalScore,
            originalScore: submission.isLate ? originalScore : null,
            finalScore: submission.isLate ? finalScore : null,
            feedback: gradeData.feedback || null,
            status: returnToStudents ? "RETURNED" : "GRADED",
            gradedAt: new Date(),
            gradedBy: session.user.id,
          },
        });

        // Track if this is a newly graded submission
        if (submission.status !== "GRADED") {
          newlyGradedCount++;
        }

        results.push({
          submissionId: gradeData.submissionId,
          studentName: submission.student.name,
          originalGrade: originalScore,
          finalGrade: finalScore,
          latePenaltyApplied,
          success: true,
        });

        // Prepare notification
        notifications.push({
          userId: submission.studentId,
          title: `Assignment Graded: ${assignment.title}`,
          content: `Your submission for "${assignment.title}" has been graded. Score: ${finalScore}/${assignment.totalPoints}`,
          type: "assignment",
          actionUrl: `/assignments/${assignmentId}`,
          actionText: "View Assignment",
        });
      }

      // Update assignment graded count
      if (newlyGradedCount > 0) {
        await tx.assignment.update({
          where: { id: assignmentId },
          data: {
            gradedCount: {
              increment: newlyGradedCount,
            },
          },
        });
      }

      // Create notifications
      if (notifications.length > 0) {
        await tx.notification.createMany({
          data: notifications,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully graded ${results.length} submissions`,
      results,
      stats: {
        totalGraded: results.length,
        newlyGraded: newlyGradedCount,
        withLatePenalty: results.filter((r) => r.latePenaltyApplied > 0).length,
      },
    });
  } catch (error) {
    console.error("Error bulk grading submissions:", error);
    return NextResponse.json(
      { error: "Failed to grade submissions" },
      { status: 500 }
    );
  }
}

// Get bulk grading template/export
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

    const assignmentId = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json"; // json or csv

    // Verify assignment exists and instructor has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const hasAccess =
      assignment.instructorId === session.user.id ||
      session.user.role === "ADMIN";

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all submissions for this assignment
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignmentId,
        status: { in: ["SUBMITTED", "RESUBMITTED", "GRADED", "RETURNED"] },
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
        student: {
          name: "asc",
        },
      },
    });

    if (format === "csv") {
      // Generate CSV for bulk grading template
      const csvHeaders = [
        "Submission ID",
        "Student Name",
        "Student Email",
        "Current Grade",
        "New Grade",
        "Feedback",
        "Status",
        "Submitted At",
        "Is Late",
        "Days Late",
      ];

      const csvRows = submissions.map((submission) => [
        submission.id,
        submission.student.name,
        submission.student.email,
        submission.grade || "",
        "", // New grade to be filled
        submission.feedback || "",
        submission.status,
        submission.submittedAt.toISOString(),
        submission.isLate ? "Yes" : "No",
        submission.daysLate.toString(),
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="bulk-grading-${assignment.title.replace(
            /[^a-zA-Z0-9]/g,
            "-"
          )}.csv"`,
        },
      });
    }

    // Return JSON format
    const gradingData = submissions.map((submission) => ({
      submissionId: submission.id,
      student: {
        id: submission.student.id,
        name: submission.student.name,
        email: submission.student.email,
      },
      currentGrade: submission.grade,
      feedback: submission.feedback,
      status: submission.status,
      submittedAt: submission.submittedAt,
      isLate: submission.isLate,
      daysLate: submission.daysLate,
      maxPoints: assignment.totalPoints,
    }));

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        totalPoints: assignment.totalPoints,
        latePenalty: assignment.latePenalty,
      },
      submissions: gradingData,
      stats: {
        total: submissions.length,
        graded: submissions.filter((s) => s.status === "GRADED").length,
        pending: submissions.filter(
          (s) => s.status === "SUBMITTED" || s.status === "RESUBMITTED"
        ).length,
        late: submissions.filter((s) => s.isLate).length,
      },
    });
  } catch (error) {
    console.error("Error fetching bulk grading data:", error);
    return NextResponse.json(
      { error: "Failed to fetch grading data" },
      { status: 500 }
    );
  }
}
