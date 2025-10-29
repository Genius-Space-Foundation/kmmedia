import { z } from "zod";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Enhanced validation schemas with business rules
export const assignmentValidationSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .refine(
      (title) => title.trim().length > 0,
      "Title cannot be empty or whitespace only"
    ),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),

  instructions: z
    .string()
    .max(10000, "Instructions must be less than 10000 characters")
    .optional(),

  dueDate: z
    .date()
    .refine((date) => date > new Date(), "Due date must be in the future")
    .refine((date) => {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      return date <= maxDate;
    }, "Due date cannot be more than 1 year in the future"),

  maxFileSize: z
    .number()
    .min(1024, "Minimum file size is 1KB") // 1KB
    .max(524288000, "Maximum file size is 500MB") // 500MB
    .default(52428800), // 50MB default

  allowedFormats: z
    .array(z.enum(["pdf", "doc", "docx", "mp4", "mov", "avi", "jpg", "png"]))
    .min(1, "At least one file format must be allowed")
    .max(8, "Too many file formats selected")
    .refine((formats) => {
      // Ensure reasonable combinations
      const documentFormats = ["pdf", "doc", "docx"];
      const videoFormats = ["mp4", "mov", "avi"];
      const imageFormats = ["jpg", "png"];

      const hasDocuments = formats.some((f) => documentFormats.includes(f));
      const hasVideos = formats.some((f) => videoFormats.includes(f));
      const hasImages = formats.some((f) => imageFormats.includes(f));

      // If videos are allowed, file size should be larger
      if (hasVideos && formats.length === 1) {
        return true; // Video-only assignments are valid
      }

      return true; // Allow all combinations for flexibility
    }, "Invalid file format combination"),

  maxFiles: z
    .number()
    .min(1, "Must allow at least 1 file")
    .max(10, "Cannot allow more than 10 files"),

  allowLateSubmission: z.boolean().default(false),

  latePenalty: z
    .number()
    .min(0, "Late penalty cannot be negative")
    .max(100, "Late penalty cannot exceed 100%")
    .optional()
    .refine((penalty, ctx) => {
      if (ctx.parent.allowLateSubmission && penalty === undefined) {
        return false;
      }
      return true;
    }, "Late penalty is required when late submissions are allowed"),

  totalPoints: z
    .number()
    .min(1, "Assignment must be worth at least 1 point")
    .max(1000, "Assignment cannot be worth more than 1000 points")
    .default(100),

  courseId: z.string().cuid("Invalid course ID"),
});

// Due date validation with business rules
export const dueDateValidationSchema = z
  .object({
    dueDate: z.date(),
    courseId: z.string().cuid(),
  })
  .refine(async (data) => {
    // Check if due date conflicts with course schedule
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { duration: true, createdAt: true },
    });

    if (!course) return false;

    // Due date should be within course duration
    const courseEndDate = new Date(course.createdAt);
    courseEndDate.setWeeks(courseEndDate.getWeeks() + course.duration);

    return data.dueDate <= courseEndDate;
  }, "Due date must be within course duration");

// Extension validation
export const extensionValidationSchema = z
  .object({
    assignmentId: z.string().cuid(),
    studentId: z.string().cuid(),
    newDueDate: z.date(),
    reason: z
      .string()
      .min(10, "Extension reason must be at least 10 characters")
      .max(500, "Reason too long"),
    instructorId: z.string().cuid(),
  })
  .refine(async (data) => {
    // Validate that new due date is reasonable
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
      select: { dueDate: true },
    });

    if (!assignment) return false;

    // Extension should not be more than 30 days
    const maxExtension = new Date(assignment.dueDate);
    maxExtension.setDate(maxExtension.getDate() + 30);

    return data.newDueDate <= maxExtension;
  }, "Extension cannot be more than 30 days from original due date");

// Authorization validation functions
export class AssignmentAuthorizationService {
  /**
   * Validate instructor access to course
   */
  static async validateInstructorCourseAccess(
    courseId: string,
    instructorId: string,
    userRole: UserRole
  ): Promise<{ isValid: boolean; message?: string }> {
    try {
      // Admins have access to all courses
      if (userRole === UserRole.ADMIN) {
        return { isValid: true };
      }

      // Check if instructor owns the course
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructorId,
        },
      });

      if (!course) {
        return {
          isValid: false,
          message: "Course not found or access denied",
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        message: "Failed to validate course access",
      };
    }
  }

  /**
   * Validate student enrollment in course
   */
  static async validateStudentEnrollment(
    courseId: string,
    studentId: string
  ): Promise<{ isValid: boolean; message?: string }> {
    try {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          courseId,
          userId: studentId,
          status: "ACTIVE",
        },
      });

      if (!enrollment) {
        return {
          isValid: false,
          message: "Student not enrolled in course or enrollment inactive",
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        message: "Failed to validate enrollment",
      };
    }
  }

  /**
   * Validate assignment submission eligibility
   */
  static async validateSubmissionEligibility(
    assignmentId: string,
    studentId: string
  ): Promise<{ isValid: boolean; message?: string; data?: any }> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          submissions: {
            where: { studentId },
          },
          extensions: {
            where: { studentId },
          },
        },
      });

      if (!assignment) {
        return {
          isValid: false,
          message: "Assignment not found",
        };
      }

      if (!assignment.isPublished) {
        return {
          isValid: false,
          message: "Assignment is not published",
        };
      }

      // Check if student already submitted
      const existingSubmission = assignment.submissions[0];
      if (existingSubmission) {
        return {
          isValid: false,
          message: "Assignment already submitted",
        };
      }

      // Check deadline
      const extension = assignment.extensions[0];
      const effectiveDueDate = extension?.newDueDate || assignment.dueDate;
      const now = new Date();

      if (now > effectiveDueDate && !assignment.allowLateSubmission) {
        return {
          isValid: false,
          message:
            "Assignment deadline has passed and late submissions are not allowed",
        };
      }

      // Validate course enrollment
      const enrollmentCheck = await this.validateStudentEnrollment(
        assignment.courseId,
        studentId
      );

      if (!enrollmentCheck.isValid) {
        return enrollmentCheck;
      }

      return {
        isValid: true,
        data: {
          assignment,
          effectiveDueDate,
          isLate: now > assignment.dueDate,
          extension,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        message: "Failed to validate submission eligibility",
      };
    }
  }

  /**
   * Validate assignment modification permissions
   */
  static async validateAssignmentModification(
    assignmentId: string,
    instructorId: string,
    userRole: UserRole,
    modificationType: "update" | "delete" | "publish"
  ): Promise<{ isValid: boolean; message?: string; data?: any }> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          _count: {
            select: {
              submissions: true,
            },
          },
        },
      });

      if (!assignment) {
        return {
          isValid: false,
          message: "Assignment not found",
        };
      }

      // Check ownership (admins can modify any assignment)
      if (
        userRole !== UserRole.ADMIN &&
        assignment.instructorId !== instructorId
      ) {
        return {
          isValid: false,
          message: "Access denied: You don't own this assignment",
        };
      }

      // Validate modification based on type and current state
      switch (modificationType) {
        case "delete":
          if (assignment._count.submissions > 0) {
            return {
              isValid: false,
              message: "Cannot delete assignment with existing submissions",
            };
          }
          break;

        case "publish":
          if (assignment.isPublished) {
            return {
              isValid: false,
              message: "Assignment is already published",
            };
          }

          // Validate assignment completeness
          if (
            !assignment.title ||
            !assignment.description ||
            !assignment.dueDate
          ) {
            return {
              isValid: false,
              message:
                "Assignment must have title, description, and due date to be published",
            };
          }
          break;

        case "update":
          // Some fields cannot be updated after submissions
          if (assignment._count.submissions > 0) {
            return {
              isValid: true,
              data: {
                hasSubmissions: true,
                restrictedFields: [
                  "allowedFormats",
                  "maxFileSize",
                  "maxFiles",
                  "totalPoints",
                ],
              },
            };
          }
          break;
      }

      return { isValid: true, data: { assignment } };
    } catch (error) {
      return {
        isValid: false,
        message: "Failed to validate assignment modification",
      };
    }
  }

  /**
   * Validate extension request
   */
  static async validateExtensionRequest(
    assignmentId: string,
    studentId: string,
    newDueDate: Date,
    instructorId: string
  ): Promise<{ isValid: boolean; message?: string }> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          submissions: {
            where: { studentId },
          },
        },
      });

      if (!assignment) {
        return {
          isValid: false,
          message: "Assignment not found",
        };
      }

      // Check instructor access
      const accessCheck = await this.validateInstructorCourseAccess(
        assignment.courseId,
        instructorId,
        UserRole.INSTRUCTOR
      );

      if (!accessCheck.isValid) {
        return accessCheck;
      }

      // Check if student already submitted
      if (assignment.submissions.length > 0) {
        return {
          isValid: false,
          message: "Cannot grant extension after submission has been made",
        };
      }

      // Validate new due date
      if (newDueDate <= assignment.dueDate) {
        return {
          isValid: false,
          message: "Extension due date must be after original due date",
        };
      }

      // Check if extension is reasonable (not more than 30 days)
      const maxExtension = new Date(assignment.dueDate);
      maxExtension.setDate(maxExtension.getDate() + 30);

      if (newDueDate > maxExtension) {
        return {
          isValid: false,
          message:
            "Extension cannot be more than 30 days from original due date",
        };
      }

      // Validate student enrollment
      const enrollmentCheck = await this.validateStudentEnrollment(
        assignment.courseId,
        studentId
      );

      return enrollmentCheck;
    } catch (error) {
      return {
        isValid: false,
        message: "Failed to validate extension request",
      };
    }
  }
}

// Utility function to add weeks to date (since it's not native)
declare global {
  interface Date {
    setWeeks(weeks: number): void;
    getWeeks(): number;
  }
}

Date.prototype.setWeeks = function (weeks: number) {
  this.setDate(this.getDate() + weeks * 7);
};

Date.prototype.getWeeks = function () {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(this.getTime() / oneWeek);
};
