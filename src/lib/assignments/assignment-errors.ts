// Assignment-specific error classes and handling

export class AssignmentError extends Error {
  constructor(
    message: string,
    public code: AssignmentErrorCode,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = "AssignmentError";
  }
}

export enum AssignmentErrorCode {
  // Validation errors
  INVALID_INPUT = "INVALID_INPUT",
  INVALID_DUE_DATE = "INVALID_DUE_DATE",
  INVALID_FILE_SETTINGS = "INVALID_FILE_SETTINGS",

  // Authorization errors
  ACCESS_DENIED = "ACCESS_DENIED",
  COURSE_ACCESS_DENIED = "COURSE_ACCESS_DENIED",
  STUDENT_NOT_ENROLLED = "STUDENT_NOT_ENROLLED",

  // Assignment state errors
  ASSIGNMENT_NOT_FOUND = "ASSIGNMENT_NOT_FOUND",
  ASSIGNMENT_NOT_PUBLISHED = "ASSIGNMENT_NOT_PUBLISHED",
  ASSIGNMENT_ALREADY_PUBLISHED = "ASSIGNMENT_ALREADY_PUBLISHED",

  // Submission errors
  DEADLINE_PASSED = "DEADLINE_PASSED",
  ALREADY_SUBMITTED = "ALREADY_SUBMITTED",
  LATE_SUBMISSION_NOT_ALLOWED = "LATE_SUBMISSION_NOT_ALLOWED",

  // Modification errors
  CANNOT_MODIFY_WITH_SUBMISSIONS = "CANNOT_MODIFY_WITH_SUBMISSIONS",
  CANNOT_DELETE_WITH_SUBMISSIONS = "CANNOT_DELETE_WITH_SUBMISSIONS",

  // Extension errors
  EXTENSION_AFTER_SUBMISSION = "EXTENSION_AFTER_SUBMISSION",
  INVALID_EXTENSION_DATE = "INVALID_EXTENSION_DATE",
  EXTENSION_TOO_LONG = "EXTENSION_TOO_LONG",

  // System errors
  DATABASE_ERROR = "DATABASE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export const AssignmentErrorMessages = {
  [AssignmentErrorCode.INVALID_INPUT]: "Invalid input provided",
  [AssignmentErrorCode.INVALID_DUE_DATE]:
    "Due date must be in the future and within course duration",
  [AssignmentErrorCode.INVALID_FILE_SETTINGS]:
    "Invalid file format or size settings",

  [AssignmentErrorCode.ACCESS_DENIED]:
    "You don't have permission to perform this action",
  [AssignmentErrorCode.COURSE_ACCESS_DENIED]:
    "You don't have access to this course",
  [AssignmentErrorCode.STUDENT_NOT_ENROLLED]:
    "Student is not enrolled in this course",

  [AssignmentErrorCode.ASSIGNMENT_NOT_FOUND]: "Assignment not found",
  [AssignmentErrorCode.ASSIGNMENT_NOT_PUBLISHED]: "Assignment is not published",
  [AssignmentErrorCode.ASSIGNMENT_ALREADY_PUBLISHED]:
    "Assignment is already published",

  [AssignmentErrorCode.DEADLINE_PASSED]: "Assignment deadline has passed",
  [AssignmentErrorCode.ALREADY_SUBMITTED]:
    "Assignment has already been submitted",
  [AssignmentErrorCode.LATE_SUBMISSION_NOT_ALLOWED]:
    "Late submissions are not allowed for this assignment",

  [AssignmentErrorCode.CANNOT_MODIFY_WITH_SUBMISSIONS]:
    "Cannot modify assignment settings after submissions have been made",
  [AssignmentErrorCode.CANNOT_DELETE_WITH_SUBMISSIONS]:
    "Cannot delete assignment with existing submissions",

  [AssignmentErrorCode.EXTENSION_AFTER_SUBMISSION]:
    "Cannot grant extension after submission has been made",
  [AssignmentErrorCode.INVALID_EXTENSION_DATE]:
    "Extension date must be after the original due date",
  [AssignmentErrorCode.EXTENSION_TOO_LONG]:
    "Extension cannot be more than 30 days from original due date",

  [AssignmentErrorCode.DATABASE_ERROR]: "Database operation failed",
  [AssignmentErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred",
};

export function createAssignmentError(
  code: AssignmentErrorCode,
  customMessage?: string,
  details?: any
): AssignmentError {
  const message = customMessage || AssignmentErrorMessages[code];

  let statusCode = 400;

  // Set appropriate HTTP status codes
  switch (code) {
    case AssignmentErrorCode.ACCESS_DENIED:
    case AssignmentErrorCode.COURSE_ACCESS_DENIED:
      statusCode = 403;
      break;
    case AssignmentErrorCode.ASSIGNMENT_NOT_FOUND:
      statusCode = 404;
      break;
    case AssignmentErrorCode.DATABASE_ERROR:
    case AssignmentErrorCode.UNKNOWN_ERROR:
      statusCode = 500;
      break;
    default:
      statusCode = 400;
  }

  return new AssignmentError(message, code, statusCode, details);
}

// Error handler for API routes
export function handleAssignmentError(error: unknown) {
  console.error("Assignment operation error:", error);

  if (error instanceof AssignmentError) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes("not found")) {
      return {
        success: false,
        message: error.message,
        code: AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
        statusCode: 404,
      };
    }

    if (
      error.message.includes("access denied") ||
      error.message.includes("permission")
    ) {
      return {
        success: false,
        message: error.message,
        code: AssignmentErrorCode.ACCESS_DENIED,
        statusCode: 403,
      };
    }

    return {
      success: false,
      message: error.message,
      code: AssignmentErrorCode.UNKNOWN_ERROR,
      statusCode: 500,
    };
  }

  return {
    success: false,
    message: "An unexpected error occurred",
    code: AssignmentErrorCode.UNKNOWN_ERROR,
    statusCode: 500,
  };
}

// Validation error formatter
export function formatValidationErrors(errors: any[]) {
  return errors.map((error) => ({
    field: error.path?.join(".") || "unknown",
    message: error.message,
    code: error.code,
  }));
}
