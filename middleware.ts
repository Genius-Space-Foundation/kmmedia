import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { rateLimit, rateLimitConfigs } from "./src/lib/rate-limit";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting based on route
  let rateLimitResponse: NextResponse | null = null;

  if (pathname.startsWith("/api/auth/")) {
    rateLimitResponse = rateLimit(rateLimitConfigs.auth)(request);
  } else if (pathname.startsWith("/api/upload")) {
    rateLimitResponse = rateLimit(rateLimitConfigs.upload)(request);
  } else if (pathname.startsWith("/api/payments/")) {
    rateLimitResponse = rateLimit(rateLimitConfigs.payment)(request);
  } else if (pathname.startsWith("/api/")) {
    rateLimitResponse = rateLimit(rateLimitConfigs.general)(request);
  }

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Check if the user is trying to access dashboard routes
  if (pathname.startsWith("/dashboards/")) {
    // For dashboard routes, we'll let the client-side handle authentication
    // The dashboard will check for tokens in localStorage and redirect if needed
    return NextResponse.next();
  }

  // Check if the user is trying to access protected API routes
  if (
    pathname.startsWith("/api/student/") ||
    pathname.startsWith("/api/instructor/") ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/user/")
  ) {
    // Check for JWT token in Authorization header
    const authHeader = request.headers.get("authorization");
    console.log("Middleware - Authorization header:", authHeader);
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      console.log("Middleware - No token found, returning 401");
      // Return 401 for API routes
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the JWT token
    console.log(
      "Middleware - Verifying token:",
      token.substring(0, 20) + "..."
    );
    let payload: any;
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as any;
      if (!payload) {
        console.log("Middleware - Token verification failed");
        return NextResponse.json(
          { success: false, message: "Invalid token" },
          { status: 401 }
        );
      }
    } catch (error) {
      console.log("Middleware - Token verification failed:", error);
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
    console.log(
      "Middleware - Token verified successfully for user:",
      payload.email
    );

    // Add user info to request headers for API routes to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-email", payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboards/:path*",
    "/api/student/:path*",
    "/api/instructor/:path*",
    "/api/admin/:path*",
    "/api/user/profile",
    "/api/user/:path*",
    "/api/auth/:path*",
    "/api/upload/:path*",
    "/api/payments/:path*",
    "/api/:path*",
  ],
};
