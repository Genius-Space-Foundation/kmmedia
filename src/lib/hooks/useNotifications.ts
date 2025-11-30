"use client";

import { useState, useEffect, useCallback } from "react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  read: boolean;
  readAt: Date | null;
  actionUrl?: string;
  actionText?: string;
  createdAt: Date;
}

interface UseNotificationsOptions {
  userId: string;
  pollInterval?: number; // in milliseconds
  limit?: number;
}

export function useNotifications({
  userId,
  pollInterval = 30000, // 30 seconds
  limit = 20,
}: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    // Don't fetch if no userId
    if (!userId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const hasTokens =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("refreshToken");
      if (!hasTokens) {
        return;
      }

      const response = await makeAuthenticatedRequest(
        `/api/notifications?userId=${encodeURIComponent(userId)}&limit=${limit}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        throw new Error(
          (payload?.error as string) ||
            (payload?.message as string) ||
            "Failed to fetch notifications"
        );
      }

      const data = payload?.data ?? payload ?? {};
      const notificationsData = Array.isArray(data.notifications)
        ? (data.notifications as Notification[])
        : [];
      const unreadValue = Number(data.unreadCount);

      setNotifications(notificationsData);
      setUnreadCount(Number.isFinite(unreadValue) ? unreadValue : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const hasTokens =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("refreshToken");
      if (!hasTokens) {
        throw new Error("No authentication token");
      }

      const response = await makeAuthenticatedRequest(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          (payload?.error as string) ||
            (payload?.message as string) ||
            "Failed to mark notification as read"
        );
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const hasTokens =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("refreshToken");
      if (!hasTokens) {
        throw new Error("No authentication token");
      }

      const response = await makeAuthenticatedRequest(
        "/api/notifications/mark-all-read",
        {
          method: "PATCH",
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          (payload?.error as string) ||
            (payload?.message as string) ||
            "Failed to mark all notifications as read"
        );
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date(),
        }))
      );

      setUnreadCount(0);

      return true;
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      return false;
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const hasTokens =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("refreshToken");
        if (!hasTokens) {
          throw new Error("No authentication token");
        }

        const response = await makeAuthenticatedRequest(
          `/api/notifications/${notificationId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(
            (payload?.error as string) ||
              (payload?.message as string) ||
              "Failed to delete notification"
          );
        }

        // Update local state
        const deletedNotification = notifications.find(
          (n) => n.id === notificationId
        );
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        return true;
      } catch (err) {
        console.error("Error deleting notification:", err);
        return false;
      }
    },
    [notifications]
  );

  // Create notification (for admins/instructors)
  const createNotification = useCallback(
    async (notificationData: {
      userId: string;
      title: string;
      content: string;
      type?: string;
      priority?: string;
      actionUrl?: string;
      actionText?: string;
    }) => {
      try {
        const hasTokens =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("refreshToken");
        if (!hasTokens) {
          throw new Error("No authentication token");
        }

        const response = await makeAuthenticatedRequest("/api/notifications", {
          method: "POST",
          body: JSON.stringify(notificationData),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(
            (payload?.error as string) ||
              (payload?.message as string) ||
              "Failed to create notification"
          );
        }

        const newNotification = await response.json();

        // If creating for current user, update local state
        if (notificationData.userId === userId) {
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }

        return newNotification;
      } catch (err) {
        console.error("Error creating notification:", err);
        throw err;
      }
    },
    [userId]
  );

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: string) => {
      return notifications.filter(
        (n) => n.type.toLowerCase() === type.toLowerCase()
      );
    },
    [notifications]
  );

  // Get notifications by priority
  const getNotificationsByPriority = useCallback(
    (priority: string) => {
      return notifications.filter(
        (n) => n.priority.toLowerCase() === priority.toLowerCase()
      );
    },
    [notifications]
  );

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => !n.read);
  }, [notifications]);

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return notifications.filter((n) => new Date(n.createdAt) > yesterday);
  }, [notifications]);

  // Initial fetch - only if userId is provided
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [fetchNotifications, userId]);

  // Set up polling - only if userId is provided
  useEffect(() => {
    if (pollInterval > 0 && userId) {
      const interval = setInterval(fetchNotifications, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, pollInterval, userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    // Getters
    getNotificationsByType,
    getNotificationsByPriority,
    getUnreadNotifications,
    getRecentNotifications,
  };
}

// Hook for real-time notifications using Server-Sent Events
export function useRealTimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    // Create EventSource for real-time notifications
    // Note: EventSource doesn't support custom headers, so we pass the token as a query parameter
    const eventSource = new EventSource(
      `/api/notifications/stream?userId=${encodeURIComponent(
        userId
      )}&token=${encodeURIComponent(token)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications((prev) => [notification, ...prev]);
      } catch (err) {
        console.error("Error parsing notification:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  return notifications;
}
