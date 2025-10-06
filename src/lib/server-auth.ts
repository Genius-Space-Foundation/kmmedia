// Server-side authentication utilities
import { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export function getServerAuth(request: NextRequest) {
  // Try to get user info from headers set by middleware
  let userId = request.headers.get("x-user-id");
  let userRole = request.headers.get("x-user-role");
  let userEmail = request.headers.get("x-user-email");

  // If not available from headers, try to verify JWT token directly
  if (!userId || !userRole || !userEmail) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return null;
    }

    // Verify the JWT token
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    userId = payload.userId;
    userRole = payload.role;
    userEmail = payload.email;
  }

  return {
    userId,
    userRole,
    userEmail,
  };
}

export function withServerAuth(
  handler: (
    req: NextRequest,
    auth: { userId: string; userRole: string; userEmail: string }
  ) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const auth = getServerAuth(req);

    if (!auth) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return handler(req, auth);
  };
}

