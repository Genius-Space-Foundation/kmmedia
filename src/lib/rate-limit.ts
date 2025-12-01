import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Initialize Redis client for rate limiting
// Falls back to in-memory if Redis is not configured
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limit configurations using Upstash
export const ratelimit = {
  // Strict rate limiting for authentication endpoints
  // 5 requests per 15 minutes to prevent brute force attacks
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "@ratelimit/auth",
      })
    : null,

  // Moderate rate limiting for API endpoints
  // 100 requests per minute for general API usage
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "@ratelimit/api",
      })
    : null,

  // Lenient rate limiting for public endpoints
  // 1000 requests per hour for public data access
  public: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1000, "1 h"),
        analytics: true,
        prefix: "@ratelimit/public",
      })
    : null,

  // Strict rate limiting for sensitive operations
  // 10 requests per hour for operations like password reset, account deletion
  sensitive: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "@ratelimit/sensitive",
      })
    : null,
};

/**
 * Helper function to get client identifier
 * Uses IP address, falling back to a default if not available
 */
export function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Try Next.js IP
  const ip = req.ip;
  if (ip) {
    return ip;
  }
  
  // Fallback to a default (not ideal, but prevents crashes)
  return "unknown";
}

/**
 * Check rate limit and return result
 */
export async function checkRateLimit(
  req: NextRequest,
  limiter: typeof ratelimit.auth | typeof ratelimit.api | typeof ratelimit.public | typeof ratelimit.sensitive
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // If rate limiting is not configured (no Redis), allow all requests
  if (!limiter) {
    console.warn("Rate limiting is not configured. All requests will be allowed.");
    return { success: true };
  }

  const identifier = getClientIdentifier(req);
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return { success, limit, remaining, reset };
}

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(resetTime?: number) {
  const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
  
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": "Rate limit exceeded",
      },
    }
  );
}

/**
 * Higher-order function to wrap route handlers with rate limiting
 */
export function withRateLimit(
  limiter: typeof ratelimit.auth | typeof ratelimit.api | typeof ratelimit.public | typeof ratelimit.sensitive
) {
  return function <T extends (...args: any[]) => Promise<NextResponse>>(handler: T) {
    return async function (req: NextRequest, ...args: any[]): Promise<NextResponse> {
      const result = await checkRateLimit(req, limiter);
      
      if (!result.success) {
        return createRateLimitResponse(result.reset);
      }
      
      return handler(req, ...args);
    } as T;
  };
}

// Predefined rate limit configurations for backward compatibility
export const rateLimitConfigs = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later",
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Too many authentication attempts, please try again later",
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: "Upload limit exceeded, please try again later",
  },
  payment: {
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: "Too many payment attempts, please try again later",
  },
};
