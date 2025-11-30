/**
 * Fast-check Configuration for Property-Based Testing
 *
 * This file provides configuration and custom arbitraries for property-based
 * testing using fast-check library. It includes common generators for the
 * student dashboard domain.
 */

import * as fc from "fast-check";

/**
 * Default configuration for property-based tests
 *
 * - numRuns: 100 - Run each property test 100 times with different inputs
 * - verbose: true - Show detailed output on failures
 * - seed: Can be set for reproducible test runs
 */
export const defaultPropertyTestConfig = {
  numRuns: 100,
  verbose: true,
};

/**
 * Custom arbitraries for domain-specific data generation
 */

/**
 * Generate a valid user ID (UUID format)
 */
export const arbUserId = (): fc.Arbitrary<string> => fc.uuid();

/**
 * Generate a valid course ID
 */
export const arbCourseId = (): fc.Arbitrary<string> => fc.uuid();

/**
 * Generate a valid enrollment ID
 */
export const arbEnrollmentId = (): fc.Arbitrary<string> => fc.uuid();

/**
 * Generate a progress percentage (0-100)
 */
export const arbProgress = (): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: 100 });

/**
 * Generate time spent in minutes (0-10000)
 */
export const arbTimeSpent = (): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: 10000 });

/**
 * Generate a grade score (0-100)
 */
export const arbGrade = (): fc.Arbitrary<number> =>
  fc.float({ min: 0, max: 100, noNaN: true });

/**
 * Generate a learning streak count (0-365)
 */
export const arbStreak = (): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: 365 });

/**
 * Generate a date within the last year
 */
export const arbRecentDate = (): fc.Arbitrary<Date> =>
  fc.date({
    min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    max: new Date(),
  });

/**
 * Generate a future date (for deadlines)
 */
export const arbFutureDate = (): fc.Arbitrary<Date> =>
  fc.date({
    min: new Date(),
    max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

/**
 * Generate a past date (for activities)
 */
export const arbPastDate = (): fc.Arbitrary<Date> =>
  fc.date({
    min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    max: new Date(),
  });

/**
 * Generate a course status
 */
export const arbCourseStatus = (): fc.Arbitrary<
  "ACTIVE" | "COMPLETED" | "SUSPENDED"
> => fc.constantFrom("ACTIVE", "COMPLETED", "SUSPENDED");

/**
 * Generate a deadline status
 */
export const arbDeadlineStatus = (): fc.Arbitrary<
  "pending" | "submitted" | "overdue" | "completed"
> => fc.constantFrom("pending", "submitted", "overdue", "completed");

/**
 * Generate a priority level
 */
export const arbPriority = (): fc.Arbitrary<"low" | "medium" | "high"> =>
  fc.constantFrom("low", "medium", "high");

/**
 * Generate a notification type
 */
export const arbNotificationType = (): fc.Arbitrary<
  "assignment" | "grade" | "deadline" | "message" | "achievement" | "system"
> =>
  fc.constantFrom(
    "assignment",
    "grade",
    "deadline",
    "message",
    "achievement",
    "system"
  );

/**
 * Generate an activity type
 */
export const arbActivityType = (): fc.Arbitrary<
  | "lesson_completed"
  | "assignment_submitted"
  | "quiz_taken"
  | "course_enrolled"
  | "achievement_earned"
> =>
  fc.constantFrom(
    "lesson_completed",
    "assignment_submitted",
    "quiz_taken",
    "course_enrolled",
    "achievement_earned"
  );

/**
 * Generate a non-empty string (for names, titles, etc.)
 */
export const arbNonEmptyString = (): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength: 100 });

/**
 * Generate a whitespace-only string (for testing validation)
 */
export const arbWhitespaceString = (): fc.Arbitrary<string> =>
  fc
    .array(fc.constantFrom(" ", "\t", "\n", "\r"), {
      minLength: 1,
      maxLength: 20,
    })
    .map((arr) => arr.join(""));

/**
 * Generate an array of interests
 */
export const arbInterests = (): fc.Arbitrary<string[]> =>
  fc.array(
    fc.constantFrom(
      "Web Development",
      "Data Science",
      "Mobile Development",
      "Machine Learning",
      "Cloud Computing",
      "Cybersecurity",
      "UI/UX Design",
      "DevOps"
    ),
    { minLength: 1, maxLength: 5 }
  );

/**
 * Generate a skill level
 */
export const arbSkillLevel = (): fc.Arbitrary<
  "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
> => fc.constantFrom("BEGINNER", "INTERMEDIATE", "ADVANCED");

/**
 * Generate a time of day (0-23 hours)
 */
export const arbHourOfDay = (): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: 23 });

/**
 * Generate a relevance score (0-100)
 */
export const arbRelevanceScore = (): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: 100 });

/**
 * Generate achievement points
 */
export const arbAchievementPoints = (): fc.Arbitrary<number> =>
  fc.integer({ min: 10, max: 1000 });

/**
 * Generate a rarity level
 */
export const arbRarity = (): fc.Arbitrary<
  "common" | "rare" | "epic" | "legendary"
> => fc.constantFrom("common", "rare", "epic", "legendary");

/**
 * Helper function to run a property test with default configuration
 *
 * @param property - The property to test
 * @param config - Optional configuration overrides
 */
export function runPropertyTest<T>(
  property: fc.IProperty<T>,
  config: Partial<typeof defaultPropertyTestConfig> = {}
): void {
  fc.assert(property, { ...defaultPropertyTestConfig, ...config });
}
