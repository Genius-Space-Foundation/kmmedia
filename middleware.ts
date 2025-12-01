import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, ratelimit, createRateLimitResponse } from "./src/lib/rate-limit";

// Allowed origins based on environment
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];
  
  // Production domain
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }
  
  // Add production domain explicitly
  origins.push('https://kmmediatraininginstitute.com');
  origins.push('https://www.kmmediatraininginstitute.com');
  
  // Development origins
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000');
    origins.push('http://localhost:3001');
    origins.push('http://127.0.0.1:3000');
  }
  
  return origins;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 204 });
    
    if (origin && allowedOrigins.includes(origin)) {
      preflightResponse.headers.set('Access-Control-Allow-Origin', origin);
      preflightResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    preflightResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    preflightResponse.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    );
    preflightResponse.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    
    return preflightResponse;
  }

  // Apply rate limiting based on route
  let rateLimitResult = null;

  if (pathname.startsWith("/api/auth/")) {
    rateLimitResult = await checkRateLimit(request, ratelimit.auth);
  } else if (pathname.startsWith("/api/upload")) {
    rateLimitResult = await checkRateLimit(request, ratelimit.sensitive);
  } else if (pathname.startsWith("/api/payments/")) {
    rateLimitResult = await checkRateLimit(request, ratelimit.sensitive);
  } else if (pathname.startsWith("/api/")) {
    rateLimitResult = await checkRateLimit(request, ratelimit.api);
  }

  if (rateLimitResult && !rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.reset);
  }

  // Create response
  const response = NextResponse.next();

  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set additional security headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Check if the user is trying to access dashboard routes
  if (pathname.startsWith("/dashboards/")) {
    // For dashboard routes, we'll let the client-side handle authentication
    // The dashboard will check for tokens in localStorage and redirect if needed
    return response;
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
    return response;
  }

  return response;
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
