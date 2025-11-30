# RealTimeNotificationSystem - Quick Start Guide

## 5-Minute Integration

### Step 1: Import the Component

```tsx
import { RealTimeNotificationSystem } from "@/components/dashboard";
import { NotificationProvider } from "@/components/ui/notification-provider";
```

### Step 2: Wrap Your App with NotificationProvider

```tsx
function App() {
  return <NotificationProvider>{/* Your app content */}</NotificationProvider>;
}
```

### Step 3: Add the Notification System

```tsx
function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <RealTimeNotificationSystem userId={user.userId} maxVisible={10} />
    </div>
  );
}
```

## Common Use Cases

### 1. Sidebar Notification Panel

```tsx
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2">{/* Main content */}</div>
  <div className="col-span-1">
    <RealTimeNotificationSystem userId={userId} maxVisible={8} />
  </div>
</div>
```

### 2. Compact Widget

```tsx
<RealTimeNotificationSystem
  userId={userId}
  maxVisible={3}
  className="max-w-sm"
/>
```

### 3. With Custom Click Handler

```tsx
<RealTimeNotificationSystem
  userId={userId}
  onNotificationClick={(notification) => {
    // Custom logic
    console.log("Clicked:", notification);

    // Navigate
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  }}
/>
```

## Features at a Glance

| Feature              | Description                       |
| -------------------- | --------------------------------- |
| 🔔 Real-time Updates | Auto-refreshes every 30 seconds   |
| 🔍 Filtering         | Filter by type and priority       |
| ✅ Actions           | Mark read, dismiss, navigate      |
| ⚙️ Preferences       | Customize sound, vibration, types |
| 📱 Responsive        | Works on all screen sizes         |
| 🎨 Themed            | Matches your app's design         |

## Customization

### Change Max Visible Notifications

```tsx
<RealTimeNotificationSystem
  userId={userId}
  maxVisible={20} // Default is 5
/>
```

### Add Custom Styling

```tsx
<RealTimeNotificationSystem userId={userId} className="shadow-lg rounded-xl" />
```

### Handle Notification Clicks

```tsx
<RealTimeNotificationSystem
  userId={userId}
  onNotificationClick={(notification) => {
    // Your custom logic here
    switch (notification.type) {
      case "assignment":
        router.push(`/assignments/${notification.metadata?.assignmentId}`);
        break;
      case "grade":
        router.push("/grades");
        break;
      // ... more cases
    }
  }}
/>
```

## Preferences

Users can customize:

- 🔊 Sound notifications
- 📳 Vibration alerts
- 📋 Notification types (assignment, grade, deadline, etc.)
- ⚡ Priority levels (urgent, high, medium, low)

Preferences are automatically saved per user in localStorage.

## Testing

Visit `/test-notifications` to see the component in action with all features.

## Troubleshooting

### Notifications not showing?

- Ensure `NotificationProvider` wraps your component
- Check that `userId` is valid
- Verify API endpoints are working

### Sound not playing?

- Check browser permissions
- Ensure `/sounds/notification.mp3` exists
- Verify sound is enabled in preferences

### Vibration not working?

- Only works on mobile devices
- Check browser support
- Verify vibration is enabled in preferences

## API Reference

### Props

```typescript
interface RealTimeNotificationSystemProps {
  userId: string; // Required
  onNotificationClick?: (notification: Notification) => void;
  maxVisible?: number; // Default: 5
  className?: string;
}
```

### Notification Type

```typescript
interface Notification {
  id: string;
  userId: string;
  type:
    | "assignment"
    | "grade"
    | "deadline"
    | "message"
    | "achievement"
    | "system";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  expiresAt?: Date;
}
```

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 💡 Check [NotificationSystemExample.tsx](./NotificationSystemExample.tsx) for more examples
- 🧪 Test at `/test-notifications`
