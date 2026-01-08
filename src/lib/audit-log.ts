import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

/**
 * Audit log action types
 */
export enum AuditAction {
  // User actions
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_REGISTER = "USER_REGISTER",
  USER_CREATE = "USER_CREATE",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",
  USER_SUSPEND = "USER_SUSPEND",
  USER_ACTIVATE = "USER_ACTIVATE",
  USER_ROLE_CHANGE = "USER_ROLE_CHANGE",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PASSWORD_RESET = "PASSWORD_RESET",
  
  // Course actions
  COURSE_CREATE = "COURSE_CREATE",
  COURSE_UPDATE = "COURSE_UPDATE",
  COURSE_DELETE = "COURSE_DELETE",
  COURSE_APPROVE = "COURSE_APPROVE",
  COURSE_REJECT = "COURSE_REJECT",
  COURSE_PUBLISH = "COURSE_PUBLISH",
  COURSE_UNPUBLISH = "COURSE_UNPUBLISH",
  
  // Application actions
  APPLICATION_CREATE = "APPLICATION_CREATE",
  APPLICATION_UPDATE = "APPLICATION_UPDATE",
  APPLICATION_APPROVE = "APPLICATION_APPROVE",
  APPLICATION_REJECT = "APPLICATION_REJECT",
  
  // Payment actions
  PAYMENT_CREATE = "PAYMENT_CREATE",
  PAYMENT_REFUND = "PAYMENT_REFUND",
  PAYMENT_VERIFY = "PAYMENT_VERIFY",
  PAYMENT_VERIFY_FAILED = "PAYMENT_VERIFY_FAILED",
  
  // Assignment actions
  ASSIGNMENT_CREATE = "ASSIGNMENT_CREATE",
  ASSIGNMENT_UPDATE = "ASSIGNMENT_UPDATE",
  ASSIGNMENT_DELETE = "ASSIGNMENT_DELETE",
  ASSIGNMENT_GRADE = "ASSIGNMENT_GRADE",
  ASSIGNMENT_EXTENSION = "ASSIGNMENT_EXTENSION",
  
  // Enrollment actions
  ENROLLMENT_CREATE = "ENROLLMENT_CREATE",
  ENROLLMENT_UPDATE = "ENROLLMENT_UPDATE",
  ENROLLMENT_COMPLETE = "ENROLLMENT_COMPLETE",
  
  // Data export actions
  DATA_EXPORT = "DATA_EXPORT",
  USER_DATA_EXPORT = "USER_DATA_EXPORT",
  COURSE_DATA_EXPORT = "COURSE_DATA_EXPORT",
  PAYMENT_DATA_EXPORT = "PAYMENT_DATA_EXPORT",
  
  // Bulk actions
  BULK_USER_CREATE = "BULK_USER_CREATE",
  BULK_USER_UPDATE = "BULK_USER_UPDATE",
  BULK_USER_DELETE = "BULK_USER_DELETE",
  BULK_USER_ACTIVATE = "BULK_USER_ACTIVATE",
  BULK_USER_SUSPEND = "BULK_USER_SUSPEND",
  BULK_COURSE_APPROVE = "BULK_COURSE_APPROVE",
  BULK_COURSE_DELETE = "BULK_COURSE_DELETE",
  BULK_APPLICATION_APPROVE = "BULK_APPLICATION_APPROVE",
  BULK_APPLICATION_REJECT = "BULK_APPLICATION_REJECT",
  BULK_GRADE = "BULK_GRADE",
  
  // Admin actions
  ADMIN_BULK_ACTION = "ADMIN_BULK_ACTION",
  ADMIN_SETTINGS_CHANGE = "ADMIN_SETTINGS_CHANGE",
}

/**
 * Resource types for audit logging
 */
export enum ResourceType {
  USER = "USER",
  COURSE = "COURSE",
  APPLICATION = "APPLICATION",
  PAYMENT = "PAYMENT",
  ASSIGNMENT = "ASSIGNMENT",
  ENROLLMENT = "ENROLLMENT",
  SUBMISSION = "SUBMISSION",
  SETTINGS = "SETTINGS",
}

/**
 * Extract client information from request
 */
function getClientInfo(req?: NextRequest | Request) {
  if (!req) {
    return { ipAddress: null, userAgent: null };
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const userAgent = req.headers.get("user-agent");

  const ipAddress = forwardedFor?.split(",")[0].trim() || realIp || null;

  return { ipAddress, userAgent };
}

/**
 * Create an audit log entry
 */
export async function createAuditLog({
  userId,
  action,
  resourceType,
  resourceId,
  metadata,
  req,
}: {
  userId: string;
  action: AuditAction | string;
  resourceType: ResourceType | string;
  resourceId?: string;
  metadata?: Record<string, any>;
  req?: NextRequest | Request;
}): Promise<void> {
  try {
    const { ipAddress, userAgent } = getClientInfo(req);

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    // Don't throw errors for audit logging failures
    // Just log them to avoid breaking the main operation
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Log authentication attempts (both successful and failed)
 */
export async function logAuthAttempt({
  email,
  success,
  userId,
  req,
}: {
  email: string;
  success: boolean;
  userId?: string;
  req?: NextRequest | Request;
}): Promise<void> {
  try {
    const { ipAddress } = getClientInfo(req);

    // If login failed, we don't have a userId, so we'll create a special log
    if (!success || !userId) {
      // For failed attempts, log to a separate table or use a system user ID
      console.warn(`Failed login attempt for ${email} from ${ipAddress}`);
      return;
    }

    await createAuditLog({
      userId,
      action: AuditAction.USER_LOGIN,
      resourceType: ResourceType.USER,
      resourceId: userId,
      metadata: { email, success },
      req,
    });
  } catch (error) {
    console.error("Failed to log auth attempt:", error);
  }
}

/**
 * Log admin actions with additional context
 */
export async function logAdminAction({
  userId,
  action,
  resourceType,
  resourceId,
  details,
  req,
}: {
  userId: string;
  action: AuditAction | string;
  resourceType: ResourceType | string;
  resourceId?: string;
  details?: Record<string, any>;
  req?: NextRequest | Request;
}): Promise<void> {
  await createAuditLog({
    userId,
    action,
    resourceType,
    resourceId,
    metadata: {
      ...details,
      isAdminAction: true,
      timestamp: new Date().toISOString(),
    },
    req,
  });
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: string;
    resourceType?: string;
  }
) {
  const { limit = 50, offset = 0, action, resourceType } = options || {};

  return prisma.auditLog.findMany({
    where: {
      userId,
      ...(action && { action }),
      ...(resourceType && { resourceType }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: ResourceType | string,
  resourceId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  const { limit = 50, offset = 0 } = options || {};

  return prisma.auditLog.findMany({
    where: {
      resourceType,
      resourceId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Get recent audit logs (for admin dashboard)
 */
export async function getRecentAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: string;
  userId?: string;
}) {
  const { limit = 100, offset = 0, action, userId } = options || {};

  return prisma.auditLog.findMany({
    where: {
      ...(action && { action }),
      ...(userId && { userId }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Log bulk operations with affected resource IDs
 */
export async function logBulkAction({
  userId,
  action,
  resourceType,
  resourceIds,
  metadata,
  req,
}: {
  userId: string;
  action: AuditAction | string;
  resourceType: ResourceType | string;
  resourceIds: string[];
  metadata?: Record<string, any>;
  req?: NextRequest | Request;
}): Promise<void> {
  await createAuditLog({
    userId,
    action,
    resourceType,
    metadata: {
      ...metadata,
      resourceIds,
      count: resourceIds.length,
      isBulkAction: true,
    },
    req,
  });
}

/**
 * Log state changes with before/after values
 */
export async function logStateChange({
  userId,
  action,
  resourceType,
  resourceId,
  before,
  after,
  req,
}: {
  userId: string;
  action: AuditAction | string;
  resourceType: ResourceType | string;
  resourceId: string;
  before: Record<string, any>;
  after: Record<string, any>;
  req?: NextRequest | Request;
}): Promise<void> {
  // Calculate changed fields
  const changes = Object.keys(after).filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])
  );

  await createAuditLog({
    userId,
    action,
    resourceType,
    resourceId,
    metadata: {
      before,
      after,
      changes,
      timestamp: new Date().toISOString(),
    },
    req,
  });
}

/**
 * Log failed operations for security monitoring
 */
export async function logFailedOperation({
  userId,
  action,
  resourceType,
  resourceId,
  reason,
  req,
}: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  reason: string;
  req?: NextRequest | Request;
}): Promise<void> {
  await createAuditLog({
    userId,
    action: `${action}_FAILED`,
    resourceType,
    resourceId,
    metadata: {
      failed: true,
      reason,
      timestamp: new Date().toISOString(),
    },
    req,
  });
}
