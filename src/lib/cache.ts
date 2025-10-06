// Simple in-memory cache implementation
// For production, consider using Redis

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache utility functions
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache the result
  cache.set(key, data, ttlSeconds);

  return data;
}

// Cache keys for different data types
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  course: (id: string) => `course:${id}`,
  courses: (filters?: string) => `courses:${filters || "all"}`,
  application: (id: string) => `application:${id}`,
  enrollment: (userId: string, courseId: string) =>
    `enrollment:${userId}:${courseId}`,
  stats: (type: string) => `stats:${type}`,
  announcements: (limit: number) => `announcements:${limit}`,
} as const;

// Cache invalidation helpers
export function invalidateUserCache(userId: string): void {
  cache.delete(cacheKeys.user(userId));
}

export function invalidateCourseCache(courseId: string): void {
  cache.delete(cacheKeys.course(courseId));
  cache.delete(cacheKeys.courses("all"));
  cache.delete(cacheKeys.courses("published"));
}

export function invalidateApplicationCache(applicationId: string): void {
  cache.delete(cacheKeys.application(applicationId));
}

export function invalidateStatsCache(): void {
  // Clear all stats cache entries
  const keys = [
    "stats:dashboard",
    "stats:users",
    "stats:courses",
    "stats:payments",
  ];
  keys.forEach((key) => cache.delete(key));
}

// Graceful shutdown
process.on("beforeExit", () => {
  cache.destroy();
});
