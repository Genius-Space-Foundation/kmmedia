import { prisma } from "@/lib/db";
import { AssignmentSubmission, Assignment, User, Course } from "@prisma/client";

export interface SubmissionFile {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
}

export interface CreateSubmissionData {
  assignmentId: string;
  studentId: string;
  submissionText?: string;
  files?: SubmissionFile[];
  isDraft?: boolean;
}

export interface UpdateSubmissionData {
  submissionText?: string;
  files?: SubmissionFile[];
  isDraft?: boolean;
}

export interface SubmissionWithDetails extends AssignmentSubmission {
  assignment: Assignment & {
    course: Course;
    instructor: User;
  };
  student: User;
  parsedFiles: SubmissionFile[];
}

export interface SubmissionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SubmissionService {
  /**
   * Create a new submission
   */
  async createSubmission(
    data: CreateSubmissionData
  ): Promise<SubmissionWithDetails> {
    // Validate submission data
    const validation = await this.validateSubmission(data);
    if (!validation.isValid) {
      throw new Error(
        `Submission validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Get assignment details
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
      include: {
        course: true,
        instructor: true,
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: data.studentId,
        courseId: assignment.courseId,
        status: "ACTIVE",
      },
    });

    if (!enrollment) {
      throw new Error("Student is not enrolled in this course");
    }

    // Check for existing submission
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: data.assignmentId,
          studentId: data.studentId,
        },
      },
    });

    if (
      existingSubmission &&
      existingSubmission.status === "SUBMITTED" &&
      !data.isDraft
    ) {
      throw new Error("Assignment has already been submitted");
    }

    // Calculate late submission details
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;
    const isLate = !data.isDraft && isOverdue;
    const daysLate = isLate
      ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Check if late submission is allowed
    if (isLate && !assignment.allowLateSubmission) {
      throw new Error(
        "Assignment deadline has passed and late submissions are not allowed"
      );
    }

    // Prepare submission data
    const submissionData = {
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      files: data.files ? JSON.stringify(data.files) : null,
      submissionText: data.submissionText || null,
      status: data.isDraft ? "DRAFT" : "SUBMITTED",
      isLate,
      daysLate,
      submittedAt: data.isDraft ? null : now,
    };

    let submission;
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.assignmentSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          ...submissionData,
          resubmissionCount:
            existingSubmission.resubmissionCount + (data.isDraft ? 0 : 1),
          lastResubmittedAt: data.isDraft
            ? existingSubmission.lastResubmittedAt
            : now,
        },
        include: {
          assignment: {
            include: {
              course: true,
              instructor: true,
            },
          },
          student: true,
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
              instructor: true,
            },
          },
          student: true,
        },
      });
    }

    // Update assignment submission count if this is a new submission (not draft)
    if (
      !data.isDraft &&
      (!existingSubmission || existingSubmission.status === "DRAFT")
    ) {
      await prisma.assignment.update({
        where: { id: data.assignmentId },
        data: {
          submissionCount: {
            increment: 1,
          },
        },
      });
    }

    return this.formatSubmissionWithDetails(submission);
  }

  /**
   * Update an existing submission
   */
  async updateSubmission(
    submissionId: string,
    data: UpdateSubmissionData,
    userId: string
  ): Promise<SubmissionWithDetails> {
    // Get existing submission
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    });

    if (!existingSubmission) {
      throw new Error("Submission not found");
    }

    // Check ownership
    if (existingSubmission.studentId !== userId) {
      throw new Error("Access denied");
    }

    // Check if submission can be updated
    if (existingSubmission.status === "GRADED") {
      throw new Error("Cannot update a graded submission");
    }

    // Check deadline for non-draft updates
    const now = new Date();
    const dueDate = new Date(existingSubmission.assignment.dueDate);
    const isOverdue = now > dueDate;

    if (
      !data.isDraft &&
      isOverdue &&
      !existingSubmission.assignment.allowLateSubmission
    ) {
      throw new Error(
        "Assignment deadline has passed and late submissions are not allowed"
      );
    }

    // Calculate late submission details
    let daysLate = existingSubmission.daysLate;
    let isLate = existingSubmission.isLate;

    if (!data.isDraft && isOverdue) {
      isLate = true;
      daysLate = Math.ceil(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Prepare update data
    const updateData: any = {
      submissionText:
        data.submissionText !== undefined
          ? data.submissionText
          : existingSubmission.submissionText,
      files: data.files ? JSON.stringify(data.files) : existingSubmission.files,
      status:
        data.isDraft !== undefined
          ? data.isDraft
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
            course: true,
            instructor: true,
          },
        },
        student: true,
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

    return this.formatSubmissionWithDetails(updatedSubmission);
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(
    submissionId: string,
    userId: string,
    userRole: string
  ): Promise<SubmissionWithDetails | null> {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true,
            instructor: true,
          },
        },
        student: true,
      },
    });

    if (!submission) {
      return null;
    }

    // Check access permissions
    const hasAccess =
      submission.studentId === userId || // Student owns the submission
      submission.assignment.instructorId === userId || // Instructor owns the assignment
      userRole === "ADMIN"; // Admin has access to all

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    return this.formatSubmissionWithDetails(submission);
  }

  /**
   * Get submissions by assignment
   */
  async getSubmissionsByAssignment(
    assignmentId: string,
    userId: string,
    userRole: string
  ): Promise<SubmissionWithDetails[]> {
    // Check if user has access to view submissions for this assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const hasAccess =
      assignment.instructorId === userId || // Instructor owns the assignment
      userRole === "ADMIN"; // Admin has access to all

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        assignment: {
          include: {
            course: true,
            instructor: true,
          },
        },
        student: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return submissions.map((submission) =>
      this.formatSubmissionWithDetails(submission)
    );
  }

  /**
   * Get submissions by student
   */
  async getSubmissionsByStudent(
    studentId: string,
    filters?: {
      courseId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ submissions: SubmissionWithDetails[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    // Build where clause
    const where: any = {
      studentId,
    };

    if (filters?.courseId) {
      where.assignment = {
        courseId: filters.courseId,
      };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      prisma.assignmentSubmission.findMany({
        where,
        include: {
          assignment: {
            include: {
              course: true,
              instructor: true,
            },
          },
          student: true,
        },
        orderBy: {
          submittedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.assignmentSubmission.count({ where }),
    ]);

    return {
      submissions: submissions.map((submission) =>
        this.formatSubmissionWithDetails(submission)
      ),
      total,
    };
  }

  /**
   * Calculate late penalty for a submission
   */
  calculateLatePenalty(submission: SubmissionWithDetails): number {
    if (
      !submission.isLate ||
      !submission.assignment.latePenalty ||
      submission.daysLate <= 0
    ) {
      return 0;
    }

    return (submission.assignment.latePenalty / 100) * submission.daysLate;
  }

  /**
   * Validate submission data
   */
  private async validateSubmission(
    data: CreateSubmissionData
  ): Promise<SubmissionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
    });

    if (!assignment) {
      errors.push("Assignment not found");
      return { isValid: false, errors, warnings };
    }

    // Check if assignment is published
    if (!assignment.isPublished) {
      errors.push("Assignment is not yet published");
    }

    // Validate files if provided
    if (data.files && data.files.length > 0) {
      // Check file count
      if (data.files.length > assignment.maxFiles) {
        errors.push(`Too many files. Maximum allowed: ${assignment.maxFiles}`);
      }

      // Check file formats and sizes
      for (const file of data.files) {
        const fileExtension = file.fileType.toLowerCase();
        if (!assignment.allowedFormats.includes(fileExtension)) {
          errors.push(
            `File format '${fileExtension}' is not allowed for file '${file.originalName}'`
          );
        }

        const maxSizeBytes = assignment.maxFileSize * 1024 * 1024; // Convert MB to bytes
        if (file.fileSize > maxSizeBytes) {
          errors.push(
            `File '${file.originalName}' exceeds maximum size of ${assignment.maxFileSize}MB`
          );
        }
      }
    }

    // Check if submission has content (files or text)
    if (
      !data.isDraft &&
      (!data.files || data.files.length === 0) &&
      (!data.submissionText || data.submissionText.trim().length === 0)
    ) {
      errors.push("Submission must contain either files or text");
    }

    // Check deadline
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;

    if (!data.isDraft && isOverdue && !assignment.allowLateSubmission) {
      errors.push(
        "Assignment deadline has passed and late submissions are not allowed"
      );
    } else if (!data.isDraft && isOverdue && assignment.allowLateSubmission) {
      warnings.push(
        `This is a late submission. A penalty of ${assignment.latePenalty}% per day will be applied.`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Format submission with parsed files and additional details
   */
  private formatSubmissionWithDetails(submission: any): SubmissionWithDetails {
    const parsedFiles = submission.files ? JSON.parse(submission.files) : [];

    return {
      ...submission,
      parsedFiles,
    };
  }
}

// Export singleton instance
export const submissionService = new SubmissionService();
