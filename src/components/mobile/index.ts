// Mobile Dashboard Components
export { default as MobileDashboardLayout } from "./MobileDashboardLayout";
export { default as MobileStudentDashboard } from "./MobileStudentDashboard";
export { default as MobileInstructorDashboard } from "./MobileInstructorDashboard";
export { default as MobileAdminDashboard } from "./MobileAdminDashboard";
export { default as MobileDashboardIntegration } from "./MobileDashboardIntegration";

// Mobile Widgets
export {
  MobileStatsWidget,
  MobileProgressWidget,
  MobileQuickAction,
  MobileActivityItem,
  MobileLearningStreak,
  MobileUpcomingDeadline,
  MobileShortcutGrid,
  MobileFloatingActionButton,
} from "./MobileWidgets";

// Mobile Utilities
export {
  default as SwipeGestureHandler,
  useSwipeGesture,
} from "./SwipeGestureHandler";
export { default as MobileNotificationCenter } from "./MobileNotificationCenter";
export { default as NotificationSystem } from "./NotificationSystem";
export { default as OfflineSupport } from "./OfflineSupport";

// Types
export interface MobileDashboardProps {
  user: any;
  userRole: "student" | "instructor" | "admin";
  initialTab?: string;
}

export interface MobileWidgetProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "orange" | "red";
  onClick?: () => void;
}
