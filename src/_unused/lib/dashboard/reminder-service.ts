/**
 * Reminder Service for Student Dashboard
 *
 * Provides utilities for:
 * - Reminder time calculation
 * - Reminder scheduling logic
 * - Reminder notification generation
 *
 * This service handles the dashboard-specific reminder functionality,
 * working alongside the deadline-reminder-service for assignment reminders.
 */

/**
 * Reminder offset types
 */
export type ReminderOffset =
  | "1_HOUR"
  | "3_HOURS"
  | "6_HOURS"
  | "12_HOURS"
  | "1_DAY"
  | "2_DAYS"
  | "3_DAYS"
  | "1_WEEK";

/**
 * Reminder configuration
 */
export interface ReminderConfig {
  deadlineId: string;
  dueDate: Date;
  offset: ReminderOffset;
  userId: string;
  title: string;
  courseId?: string;
  courseName?: string;
}

/**
 * Calculated reminder time
 */
export interface CalculatedReminder {
  deadlineId: string;
  reminderTime: Date;
  dueDate: Date;
  offset: ReminderOffset;
  offsetMs: number;
}

/**
 * Reminder notification data
 */
export interface ReminderNotification {
  userId: string;
  title: string;
  message: string;
  dueDate: Date;
  deadlineId: string;
  courseId?: string;
  courseName?: string;
  urgency: "low" | "medium" | "high" | "urgent";
}

/**
 * Converts a reminder offset to milliseconds
 * @param offset - The reminder offset type
 * @returns Number of milliseconds for the offset
 */
export function offsetToMilliseconds(offset: ReminderOffset): number {
  const MS_PER_HOUR = 60 * 60 * 1000;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  const offsetMap: Record<ReminderOffset, number> = {
    "1_HOUR": MS_PER_HOUR,
    "3_HOURS": 3 * MS_PER_HOUR,
    "6_HOURS": 6 * MS_PER_HOUR,
    "12_HOURS": 12 * MS_PER_HOUR,
    "1_DAY": MS_PER_DAY,
    "2_DAYS": 2 * MS_PER_DAY,
    "3_DAYS": 3 * MS_PER_DAY,
    "1_WEEK": 7 * MS_PER_DAY,
  };

  return offsetMap[offset];
}

/**
 * Calculates the reminder notification time based on due date and offset
 *
 * Property 15: Reminder Time Calculation
 * For any deadline with a due date and reminder offset (e.g., "1 day before"),
 * the reminder notification time should equal the due date minus the offset duration.
 *
 * @param dueDate - The deadline due date
 * @param offset - The reminder offset (e.g., "1_DAY")
 * @returns The calculated reminder time
 */
export function calculateReminderTime(
  dueDate: Date,
  offset: ReminderOffset
): Date {
  const offsetMs = offsetToMilliseconds(offset);
  const reminderTime = new Date(dueDate.getTime() - offsetMs);

  return reminderTime;
}

/**
 * Calculates reminder time with full details
 * @param config - Reminder configuration
 * @returns Calculated reminder with metadata
 */
export function calculateReminder(config: ReminderConfig): CalculatedReminder {
  const offsetMs = offsetToMilliseconds(config.offset);
  const reminderTime = calculateReminderTime(config.dueDate, config.offset);

  return {
    deadlineId: config.deadlineId,
    reminderTime,
    dueDate: config.dueDate,
    offset: config.offset,
    offsetMs,
  };
}

/**
 * Checks if a reminder time is in the future
 * @param reminderTime - The calculated reminder time
 * @param now - Current time (defaults to now)
 * @returns True if the reminder is schedulable (in the future)
 */
export function isReminderSchedulable(
  reminderTime: Date,
  now: Date = new Date()
): boolean {
  return reminderTime > now;
}

/**
 * Checks if a reminder should be triggered now
 * @param reminderTime - The scheduled reminder time
 * @param now - Current time (defaults to now)
 * @param toleranceMs - Tolerance window in milliseconds (default: 5 minutes)
 * @returns True if the reminder should be triggered
 */
export function shouldTriggerReminder(
  reminderTime: Date,
  now: Date = new Date(),
  toleranceMs: number = 5 * 60 * 1000
): boolean {
  const timeDiff = now.getTime() - reminderTime.getTime();
  return timeDiff >= 0 && timeDiff <= toleranceMs;
}

/**
 * Determines the urgency level based on time until due date
 * @param dueDate - The deadline due date
 * @param now - Current time (defaults to now)
 * @returns Urgency level
 */
export function determineUrgency(
  dueDate: Date,
  now: Date = new Date()
): "low" | "medium" | "high" | "urgent" {
  const msUntilDue = dueDate.getTime() - now.getTime();
  const hoursUntilDue = msUntilDue / (60 * 60 * 1000);

  if (hoursUntilDue <= 0) {
    return "urgent"; // Overdue
  } else if (hoursUntilDue <= 24) {
    return "urgent"; // Less than 24 hours
  } else if (hoursUntilDue <= 48) {
    return "high"; // 1-2 days
  } else if (hoursUntilDue <= 168) {
    return "medium"; // 2-7 days
  } else {
    return "low"; // More than a week
  }
}

/**
 * Formats the time remaining until a deadline
 * @param dueDate - The deadline due date
 * @param now - Current time (defaults to now)
 * @returns Formatted time remaining string
 */
export function formatTimeRemaining(
  dueDate: Date,
  now: Date = new Date()
): string {
  const msRemaining = dueDate.getTime() - now.getTime();

  if (msRemaining <= 0) {
    return "Overdue";
  }

  const hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000));
  const daysRemaining = Math.floor(hoursRemaining / 24);

  if (daysRemaining > 0) {
    return daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;
  } else if (hoursRemaining > 0) {
    return hoursRemaining === 1 ? "1 hour" : `${hoursRemaining} hours`;
  } else {
    const minutesRemaining = Math.floor(msRemaining / (60 * 1000));
    return minutesRemaining === 1 ? "1 minute" : `${minutesRemaining} minutes`;
  }
}

/**
 * Generates a reminder notification message
 * @param config - Reminder configuration
 * @param now - Current time (defaults to now)
 * @returns Reminder notification data
 */
export function generateReminderNotification(
  config: ReminderConfig,
  now: Date = new Date()
): ReminderNotification {
  const timeRemaining = formatTimeRemaining(config.dueDate, now);
  const urgency = determineUrgency(config.dueDate, now);

  // Generate appropriate message based on urgency
  let message: string;
  if (urgency === "urgent") {
    if (config.dueDate < now) {
      message = `"${config.title}" is overdue! Please submit as soon as possible.`;
    } else {
      message = `"${config.title}" is due in ${timeRemaining}! Don't forget to submit.`;
    }
  } else if (urgency === "high") {
    message = `Reminder: "${config.title}" is due in ${timeRemaining}.`;
  } else {
    message = `Upcoming: "${config.title}" is due in ${timeRemaining}.`;
  }

  // Add course context if available
  if (config.courseName) {
    message += ` (${config.courseName})`;
  }

  return {
    userId: config.userId,
    title: urgency === "urgent" ? "⏰ Urgent Deadline" : "📅 Deadline Reminder",
    message,
    dueDate: config.dueDate,
    deadlineId: config.deadlineId,
    courseId: config.courseId,
    courseName: config.courseName,
    urgency,
  };
}

/**
 * Schedules multiple reminders for a deadline
 * @param config - Base reminder configuration
 * @param offsets - Array of reminder offsets to schedule
 * @returns Array of calculated reminders
 */
export function scheduleMultipleReminders(
  config: Omit<ReminderConfig, "offset">,
  offsets: ReminderOffset[]
): CalculatedReminder[] {
  const now = new Date();
  const reminders: CalculatedReminder[] = [];

  for (const offset of offsets) {
    const reminder = calculateReminder({
      ...config,
      offset,
    });

    // Only include reminders that are schedulable (in the future)
    if (isReminderSchedulable(reminder.reminderTime, now)) {
      reminders.push(reminder);
    }
  }

  return reminders;
}

/**
 * Gets default reminder offsets based on time until due date
 * @param dueDate - The deadline due date
 * @param now - Current time (defaults to now)
 * @returns Array of recommended reminder offsets
 */
export function getDefaultReminderOffsets(
  dueDate: Date,
  now: Date = new Date()
): ReminderOffset[] {
  const msUntilDue = dueDate.getTime() - now.getTime();
  const daysUntilDue = msUntilDue / (24 * 60 * 60 * 1000);

  if (daysUntilDue <= 1) {
    // Less than 1 day: hourly reminders
    return ["6_HOURS", "3_HOURS", "1_HOUR"];
  } else if (daysUntilDue <= 3) {
    // 1-3 days: daily and hourly reminders
    return ["2_DAYS", "1_DAY", "6_HOURS"];
  } else if (daysUntilDue <= 7) {
    // 3-7 days: daily reminders
    return ["3_DAYS", "2_DAYS", "1_DAY"];
  } else {
    // More than a week: weekly and daily reminders
    return ["1_WEEK", "3_DAYS", "1_DAY"];
  }
}

/**
 * Validates a reminder configuration
 * @param config - Reminder configuration to validate
 * @returns Validation result with error message if invalid
 */
export function validateReminderConfig(config: ReminderConfig): {
  valid: boolean;
  error?: string;
} {
  // Check if due date is valid
  if (!(config.dueDate instanceof Date) || isNaN(config.dueDate.getTime())) {
    return { valid: false, error: "Invalid due date" };
  }

  // Check if deadline ID is provided
  if (!config.deadlineId || config.deadlineId.trim() === "") {
    return { valid: false, error: "Deadline ID is required" };
  }

  // Check if user ID is provided
  if (!config.userId || config.userId.trim() === "") {
    return { valid: false, error: "User ID is required" };
  }

  // Check if title is provided
  if (!config.title || config.title.trim() === "") {
    return { valid: false, error: "Title is required" };
  }

  // Check if offset is valid
  const validOffsets: ReminderOffset[] = [
    "1_HOUR",
    "3_HOURS",
    "6_HOURS",
    "12_HOURS",
    "1_DAY",
    "2_DAYS",
    "3_DAYS",
    "1_WEEK",
  ];
  if (!validOffsets.includes(config.offset)) {
    return { valid: false, error: "Invalid reminder offset" };
  }

  return { valid: true };
}

/**
 * Sorts reminders by reminder time (earliest first)
 * @param reminders - Array of calculated reminders
 * @returns Sorted array of reminders
 */
export function sortRemindersByTime(
  reminders: CalculatedReminder[]
): CalculatedReminder[] {
  return [...reminders].sort(
    (a, b) => a.reminderTime.getTime() - b.reminderTime.getTime()
  );
}

/**
 * Filters reminders that should be triggered now
 * @param reminders - Array of calculated reminders
 * @param now - Current time (defaults to now)
 * @param toleranceMs - Tolerance window in milliseconds
 * @returns Array of reminders that should be triggered
 */
export function filterTriggeredReminders(
  reminders: CalculatedReminder[],
  now: Date = new Date(),
  toleranceMs: number = 5 * 60 * 1000
): CalculatedReminder[] {
  return reminders.filter((reminder) =>
    shouldTriggerReminder(reminder.reminderTime, now, toleranceMs)
  );
}
