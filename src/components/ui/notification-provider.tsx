"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { NotificationToast, useNotificationToast } from "./notification-toast";
import { useNotifications } from "@/lib/hooks/useNotifications";

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  showToast: (
    title: string,
    message: string,
    type?: "info" | "success" | "warning" | "error"
  ) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Only initialize notifications when user is authenticated and loaded
  const shouldFetchNotifications = !authLoading && isAuthenticated && user?.userId;

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications({
    userId: shouldFetchNotifications ? user.userId : "",
    pollInterval: shouldFetchNotifications ? 30000 : 0, // Poll every 30 seconds when authenticated
    limit: 50,
  });

  const {
    notifications: toastNotifications,
    removeNotification: removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotificationToast();

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0 && unreadCount > lastNotificationCount) {
      const newNotifications = notifications.slice(
        0,
        unreadCount - lastNotificationCount
      );

      newNotifications.forEach((notification) => {
        // Only show toast for high priority notifications or assignment-related ones
        if (
          notification.priority === "high" ||
          notification.priority === "urgent" ||
          notification.type === "assignment" ||
          notification.type === "reminder"
        ) {
          const toastType =
            notification.priority === "urgent"
              ? "error"
              : notification.priority === "high"
              ? "warning"
              : notification.type === "assignment"
              ? "info"
              : "info";

          showToast(notification.title, notification.content, toastType);
        }
      });
    }

    setLastNotificationCount(unreadCount);
  }, [notifications, unreadCount, lastNotificationCount]);

  const showToast = (
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ) => {
    switch (type) {
      case "success":
        showSuccess(title, message);
        break;
      case "error":
        showError(title, message);
        break;
      case "warning":
        showWarning(title, message);
        break;
      case "info":
      default:
        showInfo(title, message);
        break;
    }
  };

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showToast,
    refreshNotifications: fetchNotifications,
  };

  // Show children even when not authenticated
  if (!shouldFetchNotifications) {
    return <>{children}</>;
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationToast
        notifications={toastNotifications}
        onDismiss={removeToast}
        position="top-right"
        maxVisible={3}
      />
    </NotificationContext.Provider>
  );
}
