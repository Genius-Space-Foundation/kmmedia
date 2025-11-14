import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
}

// Singleton Redis client
let redisClient: Redis | null = null;

/**
 * Initialize Redis client
 */
function getRedisClient(): Redis | null {
  // Skip Redis in development if not configured
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.REDIS_URL &&
    !process.env.UPSTASH_REDIS_REST_URL
  ) {
    console.warn(
      "⚠️ Redis not configured. Using in-memory rate limiting (not recommended for production)."
    );
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    // Check for Upstash Redis (recommended for serverless)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      redisClient = new Redis(process.env.UPSTASH_REDIS_REST_URL);
      console.log("✅ Connected to Upstash Redis");
    }
    // Standard Redis connection
    else if (process.env.REDIS_URL) {
      redisClient = new Redis(process.env.REDIS_URL);
      console.log("✅ Connected to Redis");
    }

    // Handle connection errors
    redisClient?.on("error", (err) => {
      console.error("Redis connection error:", err);
      redisClient = null;
    });

    return redisClient;
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
    return null;
  }
}

/**
 * Redis-based rate limiter with sliding window algorithm
 */
export function rateLimitRedis(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const redis = getRedisClient();

    // Fallback to in-memory if Redis not available
    if (!redis) {
      return null; // Let the in-memory rate limiter handle it
    }

    const identifier = getIdentifier(req);
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Use Redis sorted set for sliding window
      // Remove old entries outside the time window
      await redis.zremrangebyscore(key, 0, windowStart);

      // Count requests in current window
      const requestCount = await redis.zcard(key);

      // Check if limit exceeded
      if (requestCount >= config.max) {
        // Get oldest request timestamp for retry-after calculation
        const oldestRequests = await redis.zrange(key, 0, 0, "WITHSCORES");
        const oldestTimestamp =
          oldestRequests.length > 1 ? parseInt(oldestRequests[1]) : now;
        const retryAfter = Math.ceil(
          (oldestTimestamp + config.windowMs - now) / 1000
        );

        return NextResponse.json(
          {
            success: false,
            message:
              config.message || "Too many requests, please try again later",
            retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": retryAfter.toString(),
              "X-RateLimit-Limit": config.max.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": new Date(
                oldestTimestamp + config.windowMs
              ).toISOString(),
            },
          }
        );
      }

      // Add current request to sorted set
      await redis.zadd(key, now, `${now}-${Math.random()}`);

      // Set expiry on the key
      await redis.expire(key, Math.ceil(config.windowMs / 1000));

      // Allow request
      return null;
    } catch (error) {
      console.error("Rate limit Redis error:", error);
      // Fail open - allow request if Redis fails
      return null;
    }
  };
}

/**
 * Get identifier for rate limiting (IP address + user agent hash)
 */
function getIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip =
    forwardedFor?.split(",")[0].trim() ||
    realIp ||
    req.ip ||
    "unknown";

  // Add user agent for additional uniqueness
  const userAgent = req.headers.get("user-agent") || "";
  const uaHash = simpleHash(userAgent);

  return `${ip}-${uaHash}`;
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigsRedis = {
  // Authentication routes - strict limit
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },

  // Upload routes - moderate limit
  upload: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: "Too many upload attempts. Please try again in 5 minutes.",
  },

  // Payment routes - strict limit
  payment: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: "Too many payment requests. Please try again in 5 minutes.",
  },

  // General API routes - generous limit
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many API requests. Please try again in 15 minutes.",
  },

  // Strict limit for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: "Too many attempts. Please try again in 1 hour.",
  },
};

/**
 * Close Redis connection (for cleanup)
 */
export function closeRedisConnection() {
  if (redisClient) {
    redisClient.disconnect();
    redisClient = null;
  }
}
