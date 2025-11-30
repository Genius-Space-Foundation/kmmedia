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
    // We'll let the individual route handlers verify authentication using getServerSession
    // This allows both session-based (cookies) and token-based auth to work if implemented in the handlers
    return NextResponse.next();
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
