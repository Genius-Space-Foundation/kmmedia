# Dashboard Library

This directory contains utility functions and services for the student dashboard enhancements.

## Notification Service

The notification service provides pure functions for notification content generation, message preview generation, notification state management, and notification filtering by user preferences.

### Features

- **Notification Content Generation** (Property 10): Generate notification content for graded assignments, new assignments, deadlines, messages, and achievements
- **Message Preview Generation** (Property 12): Generate message previews with ellipsis for long messages
- **Notification State Management** (Property 13): Mark notifications as read and dismiss notifications
- **Notification Preference Filtering** (Property 39): Filter notifications based on user preferences

### Usage Examples

#### Generate Grade Notification

```typescript
import { generateGradeNotification } from "@/lib/dashboard";

const notification = generateGradeNotification(
  "Final Project",
  85,
  100,
  "/assignments/123/feedback"
);

// Result:
// {
//   title: "Assignment Graded: Final Project",
//   message: "Your assignment \"Final Project\" has been graded. You scored 85/100 (85%). Click to view detailed feedback.",
//   actionUrl: "/assignments/123/feedback",
//   actionText: "View Feedback"
// }
```

#### Generate Message Preview

```typescript
import { generateMessagePreview } from "@/lib/dashboard";

const longMessage = "This is a very long message that needs to be truncated...";
const preview = generateMessagePreview(longMessage, 50);

// Result: "This is a very long message that needs to be tru..."
```

#### Mark Notification as Read

```typescript
import { markNotificationAsRead } from "@/lib/dashboard";

const notification = {
  id: "123",
  userId: "user-1",
  type: "grade",
  title: "Assignment Graded",
  message: "Your assignment has been graded",
  priority: "medium",
  read: false,
  createdAt: new Date(),
};

const updatedNotification = markNotificationAsRead(notification);
// updatedNotification.read === true
```

#### Filter Notifications by Preferences

```typescript
import { filterNotificationsByPreferences } from "@/lib/dashboard";

const notifications = [
  { id: "1", type: "assignment" /* ... */ },
  { id: "2", type: "grade" /* ... */ },
  { id: "3", type: "message" /* ... */ },
];

const preferences = {
  email: true,
  push: true,
  sms: false,
  assignments: true,
  grades: true,
  deadlines: true,
  messages: false, // User disabled message notifications
  achievements: true,
};

const filtered = filterNotificationsByPreferences(notifications, preferences);
// Only notifications with types that are enabled in preferences will be returned
// Message notification will be filtered out
```

### API Reference

#### Notification Content Generation

- `generateGradeNotification(assignmentTitle, grade, maxGrade, feedbackUrl)` - Generate notification for graded assignment
- `generateAssignmentNotification(assignmentTitle, courseName, dueDate, assignmentUrl)` - Generate notification for new assignment
- `generateDeadlineNotification(assignmentTitle, hoursRemaining, assignmentUrl)` - Generate notification for urgent deadline
- `generateMessageNotification(senderName, messageContent, messageUrl, previewLength?)` - Generate notification for new message
- `generateAchievementNotification(achievementTitle, achievementDescription, points, achievementUrl)` - Generate notification for achievement

#### Message Preview

- `generateMessagePreview(message, maxLength?)` - Generate preview of message with ellipsis if truncated

#### State Management

- `markNotificationAsRead(notification)` - Mark single notification as read
- `markNotificationsAsRead(notifications)` - Mark multiple notifications as read
- `dismissNotification(notifications, notificationId)` - Remove notification from list
- `dismissNotifications(notifications, notificationIds)` - Remove multiple notifications from list

#### Filtering and Querying

- `filterNotificationsByPreferences(notifications, preferences)` - Filter notifications based on user preferences
- `isNotificationTypeEnabled(type, preferences)` - Check if notification type is enabled
- `getUnreadCount(notifications)` - Get count of unread notifications
- `getNotificationsByType(notifications, type)` - Get notifications by type
- `getNotificationsByPriority(notifications, priority)` - Get notifications by priority
- `sortNotificationsByDate(notifications)` - Sort notifications by date (newest first)
- `getRecentNotifications(notifications, count?)` - Get recent notifications
- `isNotificationExpired(notification)` - Check if notification is expired
- `removeExpiredNotifications(notifications)` - Remove expired notifications

### Requirements Validation

This implementation validates the following requirements:

- **Requirement 3.2**: WHEN an assignment is graded THEN the system SHALL send a real-time notification with the grade and feedback link
- **Requirement 3.4**: WHEN a student receives a message from an instructor THEN the system SHALL display a notification with message preview
- **Requirement 3.5**: WHEN notifications are displayed THEN the system SHALL provide options to mark as read, dismiss, or navigate to related content
- **Requirement 15.4**: WHEN a student sets notification preferences THEN the system SHALL respect those preferences for all notification types

### Correctness Properties

This implementation supports the following correctness properties:

- **Property 10**: Notification Content Generation - For any graded assignment, the generated notification includes the assignment title, grade value, and valid URL
- **Property 12**: Message Preview Generation - For any message string, the preview contains the first N characters followed by "..." if truncated
- **Property 13**: Notification State Updates - Marking as read sets read property to true, dismissing removes from list
- **Property 39**: Notification Preference Filtering - Notifications are delivered only if user preferences allow that type and priority
