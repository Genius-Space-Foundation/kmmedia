import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (use Redis in production)
const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest): NextResponse | null => {
    const identifier = getIdentifier(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Initialize or reset counter if window has expired
    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      return null; // Allow request
    }

    // Increment counter
    store[identifier].count++;

    // Check if limit exceeded
    if (store[identifier].count > config.max) {
      return NextResponse.json(
        {
          success: false,
          message:
            config.message || "Too many requests, please try again later",
          retryAfter: Math.ceil((store[identifier].resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (store[identifier].resetTime - now) / 1000
            ).toString(),
            "X-RateLimit-Limit": config.max.toString(),
            "X-RateLimit-Remaining": Math.max(
              0,
              config.max - store[identifier].count
            ).toString(),
            "X-RateLimit-Reset": new Date(
              store[identifier].resetTime
            ).toISOString(),
          },
        }
      );
    }

    return null; // Allow request
  };
}

function getIdentifier(req: NextRequest): string {
  // Use IP address as primary identifier
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown";

  // For authenticated requests, also include user ID if available
  const userId = req.headers.get("x-user-id");

  return userId ? `${userId}:${ip}` : ip;
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // General API rate limiting
  general: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // 100 requests per window
    message: "Too many requests, please try again later",
  },

  // Authentication endpoints (more restrictive)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: "Too many authentication attempts, please try again later",
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: "Upload limit exceeded, please try again later",
  },

  // Payment endpoints (very restrictive)
  payment: {
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 payment attempts per minute
    message: "Too many payment attempts, please try again later",
  },
};

// Helper function to apply rate limiting to API routes
export function withRateLimit(config: RateLimitConfig) {
  return function (handler: any) {
    return async function (req: NextRequest, ...args: any[]) {
      const rateLimitResponse = rateLimit(config)(req);

      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      return handler(req, ...args);
    };
  };
}
