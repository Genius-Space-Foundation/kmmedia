/**
 * React Query Configuration
 *
 * This file sets up the React Query client with optimized defaults
 * for the student dashboard, including caching strategies, retry logic,
 * and stale time configurations.
 */

import { QueryClient, DefaultOptions } from "@tanstack/react-query";

/**
 * Default query options for React Query
 *
 * - staleTime: 5 minutes - Data is considered fresh for 5 minutes
 * - cacheTime: 10 minutes - Unused data is garbage collected after 10 minutes
 * - retry: 2 - Failed queries are retried twice with exponential backoff
 * - refetchOnWindowFocus: false - Don't refetch when window regains focus (can be enabled per-query)
 */
const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  },
  mutations: {
    retry: 1,
  },
};

/**
 * Create a new QueryClient instance with default configuration
 *
 * @returns Configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

/**
 * Query key factory for consistent query key generation
 *
 * This ensures all queries use consistent, predictable keys
 * which helps with cache invalidation and debugging.
 */
export const queryKeys = {
  // Dashboard queries
  dashboard: {
    all: ["dashboard"] as const,
    stats: (userId: string) => ["dashboard", "stats", userId] as const,
    overview: (userId: string) => ["dashboard", "overview", userId] as const,
  },

  // Enrollment queries
  enrollments: {
    all: ["enrollments"] as const,
    list: (userId: string) => ["enrollments", "list", userId] as const,
    detail: (enrollmentId: string) =>
      ["enrollments", "detail", enrollmentId] as const,
    progress: (userId: string) => ["enrollments", "progress", userId] as const,
  },

  // Deadline queries
  deadlines: {
    all: ["deadlines"] as const,
    list: (userId: string) => ["deadlines", "list", userId] as const,
    upcoming: (userId: string) => ["deadlines", "upcoming", userId] as const,
    urgent: (userId: string) => ["deadlines", "urgent", userId] as const,
  },

  // Achievement queries
  achievements: {
    all: ["achievements"] as const,
    list: (userId: string) => ["achievements", "list", userId] as const,
    recent: (userId: string) => ["achievements", "recent", userId] as const,
    streak: (userId: string) => ["achievements", "streak", userId] as const,
  },

  // Notification queries
  notifications: {
    all: ["notifications"] as const,
    list: (userId: string) => ["notifications", "list", userId] as const,
    unread: (userId: string) => ["notifications", "unread", userId] as const,
  },

  // Analytics queries
  analytics: {
    all: ["analytics"] as const,
    learning: (userId: string, timeRange: string) =>
      ["analytics", "learning", userId, timeRange] as const,
    performance: (userId: string) =>
      ["analytics", "performance", userId] as const,
  },

  // Recommendation queries
  recommendations: {
    all: ["recommendations"] as const,
    courses: (userId: string) =>
      ["recommendations", "courses", userId] as const,
    lessons: (userId: string) =>
      ["recommendations", "lessons", userId] as const,
  },

  // Activity queries
  activities: {
    all: ["activities"] as const,
    list: (userId: string) => ["activities", "list", userId] as const,
    recent: (userId: string) => ["activities", "recent", userId] as const,
  },

  // Bookmark queries
  bookmarks: {
    all: ["bookmarks"] as const,
    list: (userId: string) => ["bookmarks", "list", userId] as const,
  },

  // Preference queries
  preferences: {
    all: ["preferences"] as const,
    dashboard: (userId: string) =>
      ["preferences", "dashboard", userId] as const,
    notifications: (userId: string) =>
      ["preferences", "notifications", userId] as const,
  },
} as const;

/**
 * Singleton QueryClient instance
 * Use this in client components
 */
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    return createQueryClient();
  } else {
    // Browser: create query client if it doesn't exist
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }
    return browserQueryClient;
  }
}
