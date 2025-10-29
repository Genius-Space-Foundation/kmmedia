import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schemas
export const gradeValidationSchema = z.object({
  grade: z
    .number()
    .min(0, "Grade cannot be negative")
    .max(1000, "Grade cannot exceed 1000 points"),
  feedback: z.string().optional(),
  returnToStudent: z.boolean().optional().default(false),
});

export const bulkGradeValidationSchema = z.object({
  submissionIds: z
    .array(z.string().cuid())
    .min(1, "At least one submission required"),
  grade: z
    .number()
    .min(0, "Grade cannot be negative")
    .max(1000, "Grade cannot exceed 1000 points"),
  feedback: z.string().optional(),
  returnToStudent: z.boolean().optional().default(false),
});

// Types
export interface GradeSubmissionData
  extends z.infer<typeof gradeValidationSchema> {}
export interface BulkGradeData
  extends z.infer<typeof bulkGradeValidationSchema> {}

export interface GradingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  calculatedGrade?: {
    originalScore: number;
    finalScore: number;
    latePenalty: number;
    penaltyAmount: number;
  };
}

export interface GradingHistoryEntry {
  id: string;
  submissionId: string;
  previousGrade?: number;
  newGrade: number;
  previousFeedback?: string;
  newFeedback?: string;
  gradedBy: string;
  gradedAt: Date;
  reason?: string;
}

export class GradingService {
  /**
   * Validate grade input and calculate late penalties
   */
  static async validateGrade(
    submissionId: string,
    gradeData: GradeSubmissionData,
    instructorId: string
  ): Promise<GradingValidationResult> {
    const result: GradingValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Validate input schema
      const validationResult = gradeValidationSchema.safeParse(gradeData);
      if (!validationResult.success) {
        result.isValid = false;
        result.errors = validationResult.error.errors.map((e) => e.message);
        return result;
      }

      // Get submission with assignment details
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              course: true,
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
        result.isValid = false;
        result.errors.push("Submission not found");
        return result;
      }

      // Verify instructor has access
      const hasAccess =
        submission.assignment.instructorId === instructorId ||
        submission.assignment.course.instructorId === instructorId;

      if (!hasAccess) {
        result.isValid = false;
        result.errors.push(
          "Access denied. You don't have permission to grade this submission."
        );
        return result;
      }

      // Validate grade is within assignment's total points
      if (gradeData.grade > submission.assignment.totalPoints) {
        result.isValid = false;
        result.errors.push(
          `Grade cannot exceed ${submission.assignment.totalPoints} points`
        );
        return result;
      }

      // Calculate late penalty if applicable
      let originalScore = gradeData.grade;
      let finalScore = gradeData.grade;
      let latePenalty = 0;
      let penaltyAmount = 0;

      if (
        submission.isLate &&
        submission.assignment.latePenalty &&
        submission.daysLate > 0
      ) {
        latePenalty =
          (submission.assignment.latePenalty / 100) * submission.daysLate;
        penaltyAmount = originalScore * latePenalty;
        finalScore = Math.max(0, originalScore - penaltyAmount);

        result.warnings.push(
          `Late penalty applied: ${
            submission.assignment.latePenalty
          }% per day × ${submission.daysLate} days = ${(
            latePenalty * 100
          ).toFixed(1)}% reduction`
        );
      }

      result.calculatedGrade = {
        originalScore,
        finalScore,
        latePenalty,
        penaltyAmount,
      };

      // Check for significant grade changes
      if (submission.grade !== null && submission.grade !== undefined) {
        const gradeDifference = Math.abs(
          finalScore - (submission.finalScore || submission.grade)
        );
        const percentageChange =
          (gradeDifference / submission.assignment.totalPoints) * 100;

        if (percentageChange > 20) {
          result.warnings.push(
            `Significant grade change detected: ${percentageChange.toFixed(
              1
            )}% change from previous grade`
          );
        }
      }

      // Validate feedback length
      if (gradeData.feedback && gradeData.feedback.length > 2000) {
        result.warnings.push(
          "Feedback is quite long. Consider being more concise."
        );
      }

      return result;
    } catch (error) {
      console.error("Error validating grade:", error);
      result.isValid = false;
      result.errors.push("Failed to validate grade");
      return result;
    }
  }

  /**
   * Grade a single submission with validation and history tracking
   */
  static async gradeSubmission(
    submissionId: string,
    gradeData: GradeSubmissionData,
    instructorId: string
  ): Promise<any> {
    // Validate the grade
    const validation = await this.validateGrade(
      submissionId,
      gradeData,
      instructorId
    );

    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const calculatedGrade = validation.calculatedGrade!;

    try {
      // Get current submission for history
      const currentSubmission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: true,
        },
      });

      if (!currentSubmission) {
        throw new Error("Submission not found");
      }

      // Update submission with grade
      const updatedSubmission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          grade: calculatedGrade.finalScore,
          originalScore: currentSubmission.isLate
            ? calculatedGrade.originalScore
            : null,
          finalScore: currentSubmission.isLate
            ? calculatedGrade.finalScore
            : null,
          feedback: gradeData.feedback || null,
          status: gradeData.returnToStudent ? "RETURNED" : "GRADED",
          gradedAt: new Date(),
          gradedBy: instructorId,
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

      // Create grading history entry (with error handling for missing table)
      try {
        await this.createGradingHistoryEntry({
          submissionId,
          previousGrade: currentSubmission.grade,
          newGrade: calculatedGrade.finalScore,
          previousFeedback: currentSubmission.feedback,
          newFeedback: gradeData.feedback,
          gradedBy: instructorId,
          gradedAt: new Date(),
          reason:
            validation.warnings.length > 0
              ? validation.warnings.join("; ")
              : undefined,
        });
      } catch (historyError) {
        console.warn("Could not create grading history entry:", historyError);
        // Continue without failing the grading process
      }

      // Update assignment graded count
      await prisma.assignment.update({
        where: { id: currentSubmission.assignmentId },
        data: {
          gradedCount: {
            increment: currentSubmission.status !== "GRADED" ? 1 : 0,
          },
        },
      });

      // Create notification for student
      await prisma.notification.create({
        data: {
          userId: currentSubmission.studentId,
          title: `Assignment Graded: ${currentSubmission.assignment.title}`,
          content: `Your submission for "${currentSubmission.assignment.title}" has been graded. Score: ${calculatedGrade.finalScore}/${currentSubmission.assignment.totalPoints}`,
          type: "assignment",
          actionUrl: `/assignments/${currentSubmission.assignmentId}`,
          actionText: "View Assignment",
        },
      });

      return {
        ...updatedSubmission,
        parsedFiles: updatedSubmission.files
          ? JSON.parse(updatedSubmission.files as string)
          : [],
        validation,
      };
    } catch (error) {
      console.error("Error grading submission:", error);
      throw new Error("Failed to grade submission");
    }
  }

  /**
   * Bulk grade multiple submissions
   */
  static async bulkGradeSubmissions(
    bulkGradeData: BulkGradeData,
    instructorId: string
  ): Promise<{
    successful: any[];
    failed: { submissionId: string; error: string }[];
  }> {
    const validationResult = bulkGradeValidationSchema.safeParse(bulkGradeData);
    if (!validationResult.success) {
      throw new Error("Invalid bulk grade data");
    }

    const results = {
      successful: [] as any[],
      failed: [] as { submissionId: string; error: string }[],
    };

    // Process each submission
    for (const submissionId of bulkGradeData.submissionIds) {
      try {
        const gradeData: GradeSubmissionData = {
          grade: bulkGradeData.grade,
          feedback: bulkGradeData.feedback,
          returnToStudent: bulkGradeData.returnToStudent,
        };

        const result = await this.gradeSubmission(
          submissionId,
          gradeData,
          instructorId
        );
        results.successful.push(result);
      } catch (error) {
        results.failed.push({
          submissionId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Get grading history for a submission
   */
  static async getGradingHistory(
    submissionId: string
  ): Promise<GradingHistoryEntry[]> {
    try {
      return await prisma.gradingHistory.findMany({
        where: { submissionId },
        include: {
          grader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { gradedAt: "desc" },
      });
    } catch (error) {
      console.warn("Could not fetch grading history:", error);
      // Return empty array if table doesn't exist yet
      return [];
    }
  }

  /**
   * Create grading history entry
   */
  private static async createGradingHistoryEntry(
    data: Omit<GradingHistoryEntry, "id">
  ): Promise<void> {
    try {
      await prisma.gradingHistory.create({
        data: {
          submissionId: data.submissionId,
          previousGrade: data.previousGrade,
          newGrade: data.newGrade,
          previousFeedback: data.previousFeedback,
          newFeedback: data.newFeedback,
          gradedBy: data.gradedBy,
          gradedAt: data.gradedAt,
          reason: data.reason,
        },
      });
    } catch (error) {
      console.error("Error creating grading history entry:", error);
      // Don't throw error as this is not critical for the grading process
    }
  }

  /**
   * Validate grade range for assignment
   */
  static validateGradeRange(grade: number, totalPoints: number): boolean {
    return grade >= 0 && grade <= totalPoints;
  }

  /**
   * Calculate grade statistics for an assignment
   */
  static async getAssignmentGradeStatistics(assignmentId: string): Promise<{
    totalSubmissions: number;
    gradedSubmissions: number;
    averageGrade: number;
    highestGrade: number;
    lowestGrade: number;
    gradeDistribution: { range: string; count: number }[];
  }> {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignmentId,
        status: "GRADED",
      },
      include: {
        assignment: {
          select: {
            totalPoints: true,
          },
        },
      },
    });

    const totalSubmissions = await prisma.assignmentSubmission.count({
      where: {
        assignmentId,
        status: { not: "DRAFT" },
      },
    });

    if (submissions.length === 0) {
      return {
        totalSubmissions,
        gradedSubmissions: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        gradeDistribution: [],
      };
    }

    const grades = submissions.map((s) => s.finalScore || s.grade || 0);
    const totalPoints = submissions[0].assignment.totalPoints;

    const averageGrade =
      grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const highestGrade = Math.max(...grades);
    const lowestGrade = Math.min(...grades);

    // Calculate grade distribution
    const ranges = [
      { min: 0, max: totalPoints * 0.6, label: "Below 60%" },
      { min: totalPoints * 0.6, max: totalPoints * 0.7, label: "60-70%" },
      { min: totalPoints * 0.7, max: totalPoints * 0.8, label: "70-80%" },
      { min: totalPoints * 0.8, max: totalPoints * 0.9, label: "80-90%" },
      { min: totalPoints * 0.9, max: totalPoints, label: "90-100%" },
    ];

    const gradeDistribution = ranges.map((range) => ({
      range: range.label,
      count: grades.filter((grade) => grade >= range.min && grade <= range.max)
        .length,
    }));

    return {
      totalSubmissions,
      gradedSubmissions: submissions.length,
      averageGrade,
      highestGrade,
      lowestGrade,
      gradeDistribution,
    };
  }
}
