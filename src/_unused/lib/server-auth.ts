// Server-side authentication utilities
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";

export async function getServerAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  return {
    userId: session.user.id,
    userRole: session.user.role,
    userEmail: session.user.email,
    userStatus: session.user.status,
  };
}

export function withServerAuth(
  handler: (
    req: NextRequest,
    auth: {
      userId: string;
      userRole: string;
      userEmail: string;
      userStatus: string;
    }
  ) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const auth = await getServerAuth(req);

    if (!auth) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return handler(req, auth);
  };
}

