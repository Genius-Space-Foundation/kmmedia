import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../auth";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    status: string;
  };
}

/**
 * Middleware to protect admin routes
 */
export function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // First try to get user info from headers set by Next.js middleware
      let userId = req.headers.get("x-user-id");
      let userRole = req.headers.get("x-user-role") as UserRole;
      let userEmail = req.headers.get("x-user-email");

      // If not available from headers, try to verify JWT token directly
      if (!userId || !userRole || !userEmail) {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ")
          ? authHeader.substring(7)
          : null;

        if (!token) {
          return NextResponse.json(
            { success: false, message: "No authentication token provided" },
            { status: 401 }
          );
        }

        // Verify the JWT token
        const payload = verifyToken(token);

        if (!payload) {
          return NextResponse.json(
            { success: false, message: "Invalid token" },
            { status: 401 }
          );
        }

        userId = payload.userId;
        userRole = payload.role;
        userEmail = payload.email;
      }

      // Check if user is admin
      if (userRole !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Admin access required" },
          { status: 403 }
        );
      }

      // Create authenticated request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId,
        email: userEmail,
        role: userRole,
        status: "ACTIVE",
      };

      // Call the handler
      return handler(authenticatedReq);
    } catch (error) {
      console.error("Admin auth error:", error);
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to protect routes with specific roles
 */
export function withRoleAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  allowedRoles: UserRole[]
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

      if (!token) {
        return NextResponse.json(
          { success: false, message: "No authentication token provided" },
          { status: 401 }
        );
      }

      const payload = verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { success: false, message: "Invalid token" },
          { status: 401 }
        );
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.json(
          { success: false, message: "Insufficient permissions" },
          { status: 403 }
        );
      }

      // Create authenticated request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        status: "ACTIVE",
      };

      return handler(authenticatedReq);
    } catch (error) {
      console.error("Role auth error:", error);
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}
