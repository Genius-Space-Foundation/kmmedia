/**
 * Dashboard Utility Functions
 *
 * Core utility functions for the student dashboard including:
 * - Time formatting (minutes to hours/minutes)
 * - Date utilities (days until, time ago, etc.)
 * - Greeting generation (time-based)
 * - Number formatting (percentages, currency)
 */

/**
 * Formats minutes into a human-readable time string
 * @param minutes - Total minutes to format
 * @returns Formatted string like "2h 30m" or "45m"
 *
 * Property 7: Time Formatting Consistency
 * For any positive integer representing minutes, the time formatter should return
 * a string in the format "Xh Ym" where X = minutes ÷ 60 (integer division) and
 * Y = minutes mod 60, or "Ym" if X = 0.
 */
export function formatMinutesToTime(minutes: number): string {
  if (minutes < 0) {
    throw new Error("Minutes must be non-negative");
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculates the number of days until a given date
 * @param targetDate - The target date
 * @param fromDate - The date to calculate from (defaults to now)
 * @returns Number of days until the target date (negative if in the past)
 */
export function daysUntil(
  targetDate: Date,
  fromDate: Date = new Date()
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const targetTime = targetDate.getTime();
  const fromTime = fromDate.getTime();
  const diffMs = targetTime - fromTime;

  return Math.ceil(diffMs / msPerDay);
}

/**
 * Formats a date as a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to format
 * @param fromDate - The date to calculate from (defaults to now)
 * @returns Relative time string
 */
export function timeAgo(date: Date, fromDate: Date = new Date()): string {
  const seconds = Math.floor((fromDate.getTime() - date.getTime()) / 1000);

  if (seconds < 0) {
    // Future date
    return timeUntil(date, fromDate);
  }

  if (seconds < 60) {
    return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/**
 * Formats a future date as a relative time string (e.g., "in 2 days", "in 3 hours")
 * @param date - The future date to format
 * @param fromDate - The date to calculate from (defaults to now)
 * @returns Relative time string
 */
export function timeUntil(date: Date, fromDate: Date = new Date()): string {
  const seconds = Math.floor((date.getTime() - fromDate.getTime()) / 1000);

  if (seconds < 0) {
    // Past date
    return timeAgo(date, fromDate);
  }

  if (seconds < 60) {
    return seconds === 1 ? "in 1 second" : `in ${seconds} seconds`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? "in 1 minute" : `in ${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? "in 1 hour" : `in ${hours} hours`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? "in 1 day" : `in ${days} days`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? "in 1 month" : `in ${months} months`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? "in 1 year" : `in ${years} years`;
}

/**
 * Generates a personalized greeting based on the time of day
 * @param name - The user's name
 * @param time - The time to base the greeting on (defaults to now)
 * @returns Personalized greeting string
 *
 * Property 1: Personalized Greeting Generation
 * For any user object and time of day, the greeting function should return a string
 * containing the user's name and a time-appropriate greeting ("Good morning",
 * "Good afternoon", or "Good evening").
 */
export function generatePersonalizedGreeting(
  name: string,
  time: Date = new Date()
): string {
  const hour = time.getHours();

  let greeting: string;
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  return `${greeting}, ${name}`;
}

/**
 * Formats a number as a percentage string
 * @param value - The value to format (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a number as currency (Ghanaian Cedis)
 * @param amount - The amount to format
 * @param includeSymbol - Whether to include the currency symbol (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  includeSymbol: boolean = true
): string {
  const formatted = new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return includeSymbol ? `GH₵${formatted}` : formatted;
}

/**
 * Formats a large number with thousand separators
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Formats a date to a localized string
 * @param date - The date to format
 * @param format - The format style ('short', 'medium', 'long', 'full')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  format: "short" | "medium" | "long" | "full" = "medium"
): string {
  const options: Intl.DateTimeFormatOptions = {
    short: { month: "numeric", day: "numeric", year: "2-digit" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    full: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  }[format];

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is within the next N days
 * @param date - The date to check
 * @param days - Number of days to check within
 * @returns True if the date is within the next N days
 */
export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date >= now && date <= futureDate;
}

/**
 * Gets the start of the day for a given date
 * @param date - The date
 * @returns Date object set to the start of the day (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the end of the day for a given date
 * @param date - The date
 * @returns Date object set to the end of the day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Dashboard Statistics Calculation Functions
 */

/**
 * Calculates the number of active courses from enrollments
 * @param enrollments - Array of course enrollments
 * @returns Number of active courses
 */
export function calculateActiveCourseCount(
  enrollments: Array<{ status: string }>
): number {
  return enrollments.filter((enrollment) => enrollment.status === "ACTIVE")
    .length;
}

/**
 * Calculates the average progress across all enrollments
 * @param enrollments - Array of course enrollments with progress
 * @returns Average progress percentage (0-100), or 0 if no enrollments
 */
export function calculateAverageProgress(
  enrollments: Array<{ progress: number }>
): number {
  if (enrollments.length === 0) {
    return 0;
  }

  const totalProgress = enrollments.reduce(
    (sum, enrollment) => sum + enrollment.progress,
    0
  );

  return totalProgress / enrollments.length;
}

/**
 * Counts the number of pending deadlines
 * @param deadlines - Array of deadlines
 * @returns Number of deadlines with status "pending"
 */
export function countPendingDeadlines(
  deadlines: Array<{ status: string }>
): number {
  return deadlines.filter((deadline) => deadline.status === "pending").length;
}

/**
 * Counts the total number of achievements earned
 * @param achievements - Array of achievements
 * @returns Total number of achievements
 */
export function countAchievements(achievements: Array<unknown>): number {
  return achievements.length;
}

/**
 * Calculates comprehensive dashboard statistics
 * @param enrollments - Array of course enrollments
 * @param deadlines - Array of deadlines
 * @param achievements - Array of achievements
 * @returns Dashboard statistics object
 *
 * Property 2: Dashboard Statistics Calculation
 * For any list of enrollments, the dashboard statistics should correctly calculate:
 * (1) active course count equals enrollments with status "ACTIVE",
 * (2) average progress equals sum of all progress values divided by enrollment count,
 * (3) deadline count equals number of deadlines with status "pending",
 * (4) achievement count equals total achievements earned.
 */
export function calculateDashboardStats(
  enrollments: Array<{ status: string; progress: number }>,
  deadlines: Array<{ status: string }>,
  achievements: Array<unknown>
): {
  activeCourses: number;
  averageProgress: number;
  upcomingDeadlines: number;
  achievementsEarned: number;
} {
  return {
    activeCourses: calculateActiveCourseCount(enrollments),
    averageProgress: calculateAverageProgress(enrollments),
    upcomingDeadlines: countPendingDeadlines(deadlines),
    achievementsEarned: countAchievements(achievements),
  };
}
