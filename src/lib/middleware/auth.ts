import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
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
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }

      // Check if user is admin
      if (session.user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Admin access required" },
          { status: 403 }
        );
      }

      // Create authenticated request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: session.user.id,
        email: session.user.email!,
        role: session.user.role as UserRole,
        status: session.user.status,
      };

      // Call the handler
      return handler(authenticatedReq, ...args);
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
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>,
  allowedRoles: UserRole[]
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(session.user.role as UserRole)) {
        return NextResponse.json(
          { success: false, message: "Insufficient permissions" },
          { status: 403 }
        );
      }

      // Create authenticated request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: session.user.id,
        email: session.user.email!,
        role: session.user.role as UserRole,
        status: session.user.status,
      };

      return handler(authenticatedReq, ...args);
    } catch (error) {
      console.error("Role auth error:", error);
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}
