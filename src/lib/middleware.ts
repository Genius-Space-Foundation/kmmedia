import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";
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
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Get session from NextAuth
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json(
          { success: false, message: "No authentication session" },
          { status: 401 }
        );
      }

      // Create user object with type assertions
      const user = {
        userId: session.user.id!,
        email: session.user.email!,
        role: session.user.role as UserRole,
        status: session.user.status,
      };

      // Check role permissions
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { success: false, message: "Insufficient permissions" },
          { status: 403 }
        );
      }

      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq, ...args);
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
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>
) {
  return withAuth(handler, [UserRole.ADMIN]);
}

export function withInstructorAuth(
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>
) {
  return withAuth(handler, [UserRole.ADMIN, UserRole.INSTRUCTOR]);
}

export function withStudentAuth(
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>
) {
  return withAuth(handler, [UserRole.ADMIN, UserRole.STUDENT]);
}
