# Dashboard Components

This directory contains all dashboard-related components for the student dashboard enhancement project.

## RealTimeNotificationSystem

A comprehensive notification system component that provides real-time notifications with filtering, preferences, and actions.

### Features

1. **Real-time Notification Display**

   - Displays notifications in a card-based layout
   - Shows unread count badge
   - Auto-refreshes notifications
   - Integrates with toast notifications for new alerts

2. **Notification List with Filtering**

   - Filter by notification type (assignment, grade, deadline, message, achievement, system)
   - Filter by priority level (urgent, high, medium, low)
   - Tab switching between "All" and "Unread" notifications
   - Displays up to a configurable number of notifications

3. **Notification Actions**

   - Mark individual notifications as read
   - Mark all notifications as read
   - Dismiss/delete notifications
   - Navigate to related content via action URLs
   - Click on notification to view details

4. **Notification Preferences UI**

   - Toggle sound notifications on/off
   - Toggle vibration on/off
   - Enable/disable specific notification types
   - Enable/disable specific priority levels
   - Preferences persist across sessions in localStorage

5. **Sound and Vibration Controls**
   - Plays notification sound for new notifications (if enabled)
   - Triggers device vibration for new notifications (if enabled)
   - Respects user preferences

### Usage

```tsx
import { RealTimeNotificationSystem } from "@/components/dashboard/RealTimeNotificationSystem";
import { NotificationProvider } from "@/components/ui/notification-provider";

function MyDashboard() {
  const { user } = useAuth();

  return (
    <NotificationProvider>
      <RealTimeNotificationSystem
        userId={user.userId}
        maxVisible={10}
        onNotificationClick={(notification) => {
          console.log("Notification clicked:", notification);
          // Handle notification click
        }}
      />
    </NotificationProvider>
  );
}
```

### Props

| Prop                  | Type                                   | Required | Default | Description                                |
| --------------------- | -------------------------------------- | -------- | ------- | ------------------------------------------ |
| `userId`              | `string`                               | Yes      | -       | The ID of the current user                 |
| `onNotificationClick` | `(notification: Notification) => void` | No       | -       | Callback when a notification is clicked    |
| `maxVisible`          | `number`                               | No       | `5`     | Maximum number of notifications to display |
| `className`           | `string`                               | No       | -       | Additional CSS classes                     |

### Requirements Validated

This component validates the following requirements from the design document:

- **Requirement 3.1**: Real-time notification display (via NotificationProvider integration)
- **Requirement 3.2**: Notification content generation (displays title, message, type, priority)
- **Requirement 3.3**: Urgent deadline detection (priority-based filtering and display)
- **Requirement 3.4**: Message preview (displays notification message)
- **Requirement 3.5**: Notification actions (mark read, dismiss, navigate)

### Architecture

The component integrates with the existing notification infrastructure:

1. **NotificationProvider**: Provides notification context and manages state
2. **useNotificationContext**: Hook to access notifications and actions
3. **NotificationToast**: Displays toast notifications for new alerts
4. **useNotifications**: Hook for fetching and managing notifications

### Preferences Storage

Notification preferences are stored in localStorage with the key:

```
notification-preferences-{userId}
```

The preferences object structure:

```typescript
{
  sound: boolean;
  vibration: boolean;
  types: {
    assignment: boolean;
    grade: boolean;
    deadline: boolean;
    message: boolean;
    achievement: boolean;
    system: boolean;
  }
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  }
}
```

### Styling

The component uses:

- Tailwind CSS for styling
- shadcn/ui components (Card, Button, Badge, Dialog, Switch, Select, Tabs)
- Lucide React icons
- Custom color schemes for notification types and priorities

### Accessibility

- Proper ARIA labels for interactive elements
- Keyboard navigation support via shadcn/ui components
- Focus indicators
- Screen reader friendly

### Testing

A test page is available at `/test-notifications` to verify all features:

- Notification display
- Filtering functionality
- Preferences management
- Sound and vibration controls
- Mark as read/dismiss actions

### Future Enhancements

Potential improvements for future iterations:

- WebSocket integration for true real-time updates
- Push notification support
- Notification grouping by type or date
- Search functionality
- Bulk actions (select multiple, delete multiple)
- Notification history with pagination
- Export notifications to CSV/PDF
