import { prisma } from "@/lib/db";
import {
  Assignment,
  AssignmentSubmission,
  AssignmentExtension,
  UserRole,
} from "@prisma/client";
import { z } from "zod";
import {
  assignmentValidationSchema,
  AssignmentAuthorizationService,
} from "./assignment-validation";

// Validation schemas
export const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required"),
  instructions: z.string().optional(),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
  maxFileSize: z.number().min(1024).max(524288000).default(52428800), // 1KB to 500MB, default 50MB
  allowedFormats: z
    .array(z.enum(["pdf", "doc", "docx", "mp4", "mov", "avi", "jpg", "png"]))
    .min(1, "At least one format required"),
  maxFiles: z.number().min(1).max(10).default(5),
  allowLateSubmission: z.boolean().default(false),
  latePenalty: z.number().min(0).max(100).optional(), // Percentage per day
  totalPoints: z.number().min(1).max(1000).default(100),
  attachments: z.any().optional(), // JSON for instructor files
  courseId: z.string().cuid(),
});

export const updateAssignmentSchema = createAssignmentSchema
  .partial()
  .omit({ courseId: true });

export const grantExtensionSchema = z.object({
  newDueDate: z.date(),
  reason: z.string().min(1, "Reason is required"),
});

// Types
export interface CreateAssignmentData
  extends z.infer<typeof createAssignmentSchema> {}
export interface UpdateAssignmentData
  extends z.infer<typeof updateAssignmentSchema> {}
export interface GrantExtensionData
  extends z.infer<typeof grantExtensionSchema> {}

export interface AssignmentWithDetails extends Assignment {
  course: {
    id: string;
    title: string;
    instructorId: string;
  };
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    submissions: number;
    extensions: number;
  };
}

export interface AssignmentForStudent extends Assignment {
  course: {
    id: string;
    title: string;
  };
  instructor: {
    id: string;
    name: string;
  };
  submission?: AssignmentSubmission;
  extension?: AssignmentExtension;
  hasSubmitted: boolean;
  isOverdue: boolean;
  effectiveDueDate: Date;
}

export class AssignmentService {
  /**
   * Create a new assignment
   */
  static async createAssignment(
    data: CreateAssignmentData,
    instructorId: string
  ): Promise<AssignmentWithDetails> {
    // Validate input with enhanced validation
    const validatedData = assignmentValidationSchema.parse(data);

    // Verify instructor has access to the course
    const courseAccessCheck =
      await AssignmentAuthorizationService.validateInstructorCourseAccess(
        validatedData.courseId,
        instructorId,
        UserRole.INSTRUCTOR
      );

    if (!courseAccessCheck.isValid) {
      throw new Error(courseAccessCheck.message || "Course access denied");
    }

    const assignment = await prisma.assignment.create({
      data: {
        ...validatedData,
        instructorId,
        isPublished: false, // Always start as draft
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            extensions: true,
          },
        },
      },
    });

    return assignment;
  }

  /**
   * Update an existing assignment
   */
  static async updateAssignment(
    assignmentId: string,
    data: UpdateAssignmentData,
    instructorId: string
  ): Promise<AssignmentWithDetails> {
    // Validate input
    const validatedData = updateAssignmentSchema.parse(data);

    // Validate assignment modification permissions
    const modificationCheck =
      await AssignmentAuthorizationService.validateAssignmentModification(
        assignmentId,
        instructorId,
        UserRole.INSTRUCTOR,
        "update"
      );

    if (!modificationCheck.isValid) {
      throw new Error(
        modificationCheck.message || "Assignment modification denied"
      );
    }

    const existingAssignment = modificationCheck.data?.assignment;
    const hasSubmissions = modificationCheck.data?.hasSubmissions;

    // Prevent certain changes if assignment has submissions
    if (hasSubmissions) {
      const restrictedFields = modificationCheck.data?.restrictedFields || [];
      const hasRestrictedChanges = restrictedFields.some(
        (field: string) =>
          validatedData[field as keyof UpdateAssignmentData] !== undefined
      );

      if (hasRestrictedChanges) {
        throw new Error(
          "Cannot modify file requirements or points after submissions have been made"
        );
      }

      // Only allow due date extension, not reduction
      if (
        validatedData.dueDate &&
        validatedData.dueDate < existingAssignment.dueDate
      ) {
        throw new Error(
          "Cannot move due date earlier after submissions have been made"
        );
      }
    }

    // Validate late penalty if late submission is being enabled
    if (
      validatedData.allowLateSubmission &&
      !validatedData.latePenalty &&
      !existingAssignment.latePenalty
    ) {
      throw new Error(
        "Late penalty is required when enabling late submissions"
      );
    }

    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: validatedData,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            extensions: true,
          },
        },
      },
    });

    return assignment;
  }

  /**
   * Delete an assignment
   */
  static async deleteAssignment(
    assignmentId: string,
    instructorId: string
  ): Promise<void> {
    // Verify assignment exists and instructor has access
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        instructorId,
      },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found or access denied");
    }

    // Prevent deletion if assignment has submissions
    if (assignment._count.submissions > 0) {
      throw new Error("Cannot delete assignment with existing submissions");
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });
  }

  /**
   * Get assignment by ID for instructor
   */
  static async getAssignmentById(
    assignmentId: string,
    instructorId: string
  ): Promise<AssignmentWithDetails | null> {
    return await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        instructorId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            extensions: true,
          },
        },
      },
    });
  }

  /**
   * Get assignments by instructor
   */
  static async getAssignmentsByInstructor(
    instructorId: string,
    courseId?: string
  ): Promise<AssignmentWithDetails[]> {
    const where: any = { instructorId };
    if (courseId) {
      where.courseId = courseId;
    }

    return await prisma.assignment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            extensions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get assignments by course for students
   */
  static async getAssignmentsByCourse(
    courseId: string,
    studentId?: string
  ): Promise<AssignmentForStudent[]> {
    // Verify course exists and is published
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: "PUBLISHED",
      },
    });

    if (!course) {
      throw new Error("Course not found or not published");
    }

    // If studentId provided, verify enrollment
    if (studentId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          courseId,
          userId: studentId,
          status: "ACTIVE",
        },
      });

      if (!enrollment) {
        throw new Error("Student not enrolled in course");
      }
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        courseId,
        isPublished: true,
      },
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
        ...(studentId && {
          submissions: {
            where: { studentId },
            take: 1,
          },
          extensions: {
            where: { studentId },
            take: 1,
          },
        }),
      },
      orderBy: { dueDate: "asc" },
    });

    return assignments.map((assignment) => {
      const submission = studentId ? assignment.submissions?.[0] : undefined;
      const extension = studentId ? assignment.extensions?.[0] : undefined;
      const effectiveDueDate = extension?.newDueDate || assignment.dueDate;
      const now = new Date();

      return {
        ...assignment,
        submission,
        extension,
        hasSubmitted: !!submission,
        isOverdue: now > effectiveDueDate && !submission,
        effectiveDueDate,
        submissions: undefined, // Remove from response
        extensions: undefined, // Remove from response
      } as AssignmentForStudent;
    });
  }

  /**
   * Get assignment for student view
   */
  static async getAssignmentForStudent(
    assignmentId: string,
    studentId: string
  ): Promise<AssignmentForStudent | null> {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        isPublished: true,
      },
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
        submissions: {
          where: { studentId },
          take: 1,
        },
        extensions: {
          where: { studentId },
          take: 1,
        },
      },
    });

    if (!assignment) {
      return null;
    }

    // Verify student enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: assignment.courseId,
        userId: studentId,
        status: "ACTIVE",
      },
    });

    if (!enrollment) {
      throw new Error("Student not enrolled in course");
    }

    const submission = assignment.submissions?.[0];
    const extension = assignment.extensions?.[0];
    const effectiveDueDate = extension?.newDueDate || assignment.dueDate;
    const now = new Date();

    return {
      ...assignment,
      submission,
      extension,
      hasSubmitted: !!submission,
      isOverdue: now > effectiveDueDate && !submission,
      effectiveDueDate,
      submissions: undefined,
      extensions: undefined,
    } as AssignmentForStudent;
  }

  /**
   * Publish an assignment
   */
  static async publishAssignment(
    assignmentId: string,
    instructorId: string
  ): Promise<AssignmentWithDetails> {
    // Verify assignment exists and instructor has access
    const assignment = await this.getAssignmentById(assignmentId, instructorId);

    if (!assignment) {
      throw new Error("Assignment not found or access denied");
    }

    if (assignment.isPublished) {
      throw new Error("Assignment is already published");
    }

    // Validate assignment is ready for publishing
    if (!assignment.title || !assignment.description || !assignment.dueDate) {
      throw new Error(
        "Assignment must have title, description, and due date to be published"
      );
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { isPublished: true },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            extensions: true,
          },
        },
      },
    });

    return updatedAssignment;
  }

  /**
   * Grant extension to a student
   */
  static async grantExtension(
    assignmentId: string,
    studentId: string,
    extensionData: GrantExtensionData,
    instructorId: string
  ): Promise<AssignmentExtension> {
    // Validate input
    const validatedData = grantExtensionSchema.parse(extensionData);

    // Validate extension request with comprehensive checks
    const extensionCheck =
      await AssignmentAuthorizationService.validateExtensionRequest(
        assignmentId,
        studentId,
        validatedData.newDueDate,
        instructorId
      );

    if (!extensionCheck.isValid) {
      throw new Error(extensionCheck.message || "Extension request denied");
    }

    // Create or update extension
    const extension = await prisma.assignmentExtension.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: {
        newDueDate: validatedData.newDueDate,
        reason: validatedData.reason,
        grantedBy: instructorId,
        grantedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId,
        newDueDate: validatedData.newDueDate,
        reason: validatedData.reason,
        grantedBy: instructorId,
      },
    });

    return extension;
  }

  /**
   * Validate instructor authorization for assignment operations
   */
  static async validateInstructorAccess(
    assignmentId: string,
    instructorId: string,
    userRole: UserRole
  ): Promise<boolean> {
    // Admins have access to all assignments
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Check if instructor owns the assignment
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        instructorId,
      },
    });

    return !!assignment;
  }

  /**
   * Validate student access to assignment
   */
  static async validateStudentAccess(
    assignmentId: string,
    studentId: string
  ): Promise<boolean> {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        isPublished: true,
      },
    });

    if (!assignment) {
      return false;
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: assignment.courseId,
        userId: studentId,
        status: "ACTIVE",
      },
    });

    return !!enrollment;
  }
}
