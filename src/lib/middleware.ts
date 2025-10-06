import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    status: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
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
        console.log(
          "Token verification result:",
          payload ? "Valid" : "Invalid"
        );
        if (!payload) {
          return NextResponse.json(
            { success: false, message: "Invalid token" },
            { status: 401 }
          );
        }

        userId = payload.userId;
        userRole = payload.role;
        userEmail = payload.email;
        console.log("User role:", userRole);
      }

      // Create user object
      const user = {
        userId,
        email: userEmail,
        role: userRole,
        status: "ACTIVE" as const, // Assuming active if token is valid
      };

      // Check role permissions
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { success: false, message: "Insufficient permissions" },
          { status: 403 }
        );
      }

      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

export function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(handler, [UserRole.ADMIN]);
}

export function withInstructorAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(handler, [UserRole.ADMIN, UserRole.INSTRUCTOR]);
}

export function withStudentAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(handler, [UserRole.ADMIN, UserRole.STUDENT]);
}
