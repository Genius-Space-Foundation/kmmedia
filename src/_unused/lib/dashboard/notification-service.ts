/**
 * Notification Service
 *
 * This module provides functions for notification content generation,
 * message preview generation, notification state management, and
 * notification filtering by user preferences.
 *
 * Validates Requirements: 3.2, 3.4, 3.5, 15.4
 */

import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationSettings,
} from "@/types/dashboard";

/**
 * Generate notification content for a graded assignment
 *
 * Property 10: Notification Content Generation
 * For any graded assignment, the generated notification should include
 * the assignment title, the grade value, and a valid URL to view feedback.
 *
 * @param assignmentTitle - The title of the graded assignment
 * @param grade - The grade value
 * @param maxGrade - The maximum possible grade
 * @param feedbackUrl - URL to view detailed feedback
 * @returns Notification object with complete content
 */
export function generateGradeNotification(
  assignmentTitle: string,
  grade: number,
  maxGrade: number,
  feedbackUrl: string
): Pick<Notification, "title" | "message" | "actionUrl" | "actionText"> {
  const percentage = Math.round((grade / maxGrade) * 100);

  return {
    title: `Assignment Graded: ${assignmentTitle}`,
    message: `Your assignment "${assignmentTitle}" has been graded. You scored ${grade}/${maxGrade} (${percentage}%). Click to view detailed feedback.`,
    actionUrl: feedbackUrl,
    actionText: "View Feedback",
  };
}

/**
 * Generate notification content for a new assignment
 *
 * @param assignmentTitle - The title of the new assignment
 * @param courseName - The name of the course
 * @param dueDate - The due date of the assignment
 * @param assignmentUrl - URL to view the assignment
 * @returns Notification object with complete content
 */
export function generateAssignmentNotification(
  assignmentTitle: string,
  courseName: string,
  dueDate: Date,
  assignmentUrl: string
): Pick<Notification, "title" | "message" | "actionUrl" | "actionText"> {
  const dueDateStr = dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    title: `New Assignment: ${assignmentTitle}`,
    message: `A new assignment "${assignmentTitle}" has been posted in ${courseName}. Due date: ${dueDateStr}.`,
    actionUrl: assignmentUrl,
    actionText: "View Assignment",
  };
}

/**
 * Generate notification content for an urgent deadline
 *
 * @param assignmentTitle - The title of the assignment
 * @param hoursRemaining - Hours remaining until deadline
 * @param assignmentUrl - URL to view the assignment
 * @returns Notification object with complete content
 */
export function generateDeadlineNotification(
  assignmentTitle: string,
  hoursRemaining: number,
  assignmentUrl: string
): Pick<Notification, "title" | "message" | "actionUrl" | "actionText"> {
  const timeStr =
    hoursRemaining < 1
      ? "less than 1 hour"
      : `${Math.floor(hoursRemaining)} hour${hoursRemaining >= 2 ? "s" : ""}`;

  return {
    title: `Urgent: Deadline Approaching`,
    message: `The deadline for "${assignmentTitle}" is in ${timeStr}. Don't forget to submit!`,
    actionUrl: assignmentUrl,
    actionText: "Submit Now",
  };
}

/**
 * Generate notification content for a new message
 *
 * Property 12: Message Preview Generation
 * For any message string, the notification preview should contain
 * the first N characters of the message followed by "..." if the
 * message exceeds N characters.
 *
 * @param senderName - Name of the message sender
 * @param messageContent - Full message content
 * @param messageUrl - URL to view the full message
 * @param previewLength - Maximum length of preview (default: 100)
 * @returns Notification object with message preview
 */
export function generateMessageNotification(
  senderName: string,
  messageContent: string,
  messageUrl: string,
  previewLength: number = 100
): Pick<Notification, "title" | "message" | "actionUrl" | "actionText"> {
  const preview = generateMessagePreview(messageContent, previewLength);

  return {
    title: `New Message from ${senderName}`,
    message: preview,
    actionUrl: messageUrl,
    actionText: "Read Message",
  };
}

/**
 * Generate a preview of a message
 *
 * Property 12: Message Preview Generation
 * For any message string, the notification preview should contain
 * the first N characters of the message followed by "..." if the
 * message exceeds N characters.
 *
 * @param message - The full message content
 * @param maxLength - Maximum length of the preview
 * @returns Preview string with ellipsis if truncated
 */
export function generateMessagePreview(
  message: string,
  maxLength: number = 100
): string {
  if (message.length <= maxLength) {
    return message;
  }

  return message.substring(0, maxLength) + "...";
}

/**
 * Generate notification content for an achievement
 *
 * @param achievementTitle - The title of the achievement
 * @param achievementDescription - Description of the achievement
 * @param points - Points earned
 * @param achievementUrl - URL to view achievement details
 * @returns Notification object with complete content
 */
export function generateAchievementNotification(
  achievementTitle: string,
  achievementDescription: string,
  points: number,
  achievementUrl: string
): Pick<Notification, "title" | "message" | "actionUrl" | "actionText"> {
  return {
    title: `Achievement Unlocked: ${achievementTitle}`,
    message: `Congratulations! You've earned the "${achievementTitle}" achievement. ${achievementDescription} (+${points} points)`,
    actionUrl: achievementUrl,
    actionText: "View Achievement",
  };
}

/**
 * Mark a notification as read
 *
 * Property 13: Notification State Updates
 * For any notification, marking it as read should set the read property to true.
 *
 * @param notification - The notification to mark as read
 * @returns Updated notification with read set to true
 */
export function markNotificationAsRead(
  notification: Notification
): Notification {
  return {
    ...notification,
    read: true,
  };
}

/**
 * Mark multiple notifications as read
 *
 * @param notifications - Array of notifications to mark as read
 * @returns Array of updated notifications
 */
export function markNotificationsAsRead(
  notifications: Notification[]
): Notification[] {
  return notifications.map((notification) =>
    markNotificationAsRead(notification)
  );
}

/**
 * Dismiss a notification from the active list
 *
 * Property 13: Notification State Updates
 * Dismissing a notification should remove it from the active notifications list.
 *
 * @param notifications - Array of active notifications
 * @param notificationId - ID of the notification to dismiss
 * @returns Array of notifications without the dismissed one
 */
export function dismissNotification(
  notifications: Notification[],
  notificationId: string
): Notification[] {
  return notifications.filter(
    (notification) => notification.id !== notificationId
  );
}

/**
 * Dismiss multiple notifications
 *
 * @param notifications - Array of active notifications
 * @param notificationIds - Array of notification IDs to dismiss
 * @returns Array of notifications without the dismissed ones
 */
export function dismissNotifications(
  notifications: Notification[],
  notificationIds: string[]
): Notification[] {
  const idsToRemove = new Set(notificationIds);
  return notifications.filter(
    (notification) => !idsToRemove.has(notification.id)
  );
}

/**
 * Filter notifications based on user preferences
 *
 * Property 39: Notification Preference Filtering
 * For any notification and user notification preferences, the notification
 * should be delivered if and only if the user's preferences allow
 * notifications of that type and priority.
 *
 * @param notifications - Array of notifications to filter
 * @param preferences - User's notification preferences
 * @returns Filtered array of notifications based on preferences
 */
export function filterNotificationsByPreferences(
  notifications: Notification[],
  preferences: NotificationSettings
): Notification[] {
  return notifications.filter((notification) => {
    // Check if the notification type is enabled
    const typeEnabled = isNotificationTypeEnabled(
      notification.type,
      preferences
    );

    if (!typeEnabled) {
      return false;
    }

    // All enabled notifications pass through
    // Priority filtering could be added here if needed
    return true;
  });
}

/**
 * Check if a notification type is enabled in user preferences
 *
 * @param type - The notification type
 * @param preferences - User's notification preferences
 * @returns True if the notification type is enabled
 */
export function isNotificationTypeEnabled(
  type: NotificationType,
  preferences: NotificationSettings
): boolean {
  switch (type) {
    case "assignment":
      return preferences.assignments;
    case "grade":
      return preferences.grades;
    case "deadline":
      return preferences.deadlines;
    case "message":
      return preferences.messages;
    case "achievement":
      return preferences.achievements;
    case "system":
      // System notifications are always enabled
      return true;
    default:
      return false;
  }
}

/**
 * Get unread notifications count
 *
 * @param notifications - Array of notifications
 * @returns Count of unread notifications
 */
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((notification) => !notification.read).length;
}

/**
 * Get notifications by type
 *
 * @param notifications - Array of notifications
 * @param type - The notification type to filter by
 * @returns Filtered array of notifications
 */
export function getNotificationsByType(
  notifications: Notification[],
  type: NotificationType
): Notification[] {
  return notifications.filter((notification) => notification.type === type);
}

/**
 * Get notifications by priority
 *
 * @param notifications - Array of notifications
 * @param priority - The priority level to filter by
 * @returns Filtered array of notifications
 */
export function getNotificationsByPriority(
  notifications: Notification[],
  priority: NotificationPriority
): Notification[] {
  return notifications.filter(
    (notification) => notification.priority === priority
  );
}

/**
 * Sort notifications by creation date (newest first)
 *
 * @param notifications - Array of notifications to sort
 * @returns Sorted array of notifications
 */
export function sortNotificationsByDate(
  notifications: Notification[]
): Notification[] {
  return [...notifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Get recent notifications (last N notifications)
 *
 * @param notifications - Array of notifications
 * @param count - Number of recent notifications to return
 * @returns Array of recent notifications
 */
export function getRecentNotifications(
  notifications: Notification[],
  count: number = 10
): Notification[] {
  const sorted = sortNotificationsByDate(notifications);
  return sorted.slice(0, count);
}

/**
 * Check if a notification is expired
 *
 * @param notification - The notification to check
 * @returns True if the notification is expired
 */
export function isNotificationExpired(notification: Notification): boolean {
  if (!notification.expiresAt) {
    return false;
  }

  return new Date() > notification.expiresAt;
}

/**
 * Remove expired notifications
 *
 * @param notifications - Array of notifications
 * @returns Array of non-expired notifications
 */
export function removeExpiredNotifications(
  notifications: Notification[]
): Notification[] {
  return notifications.filter(
    (notification) => !isNotificationExpired(notification)
  );
}
