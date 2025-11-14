"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "low" | "medium" | "high" | "urgent";
  duration?: number; // in milliseconds, 0 means persistent
  actionUrl?: string;
  actionText?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

interface NotificationToastProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxVisible?: number;
}

export function NotificationToast({
  notifications,
  onDismiss,
  position = "top-right",
  maxVisible = 5,
}: NotificationToastProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<
    ToastNotification[]
  >([]);

  // Update visible notifications when notifications change
  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  // Auto-dismiss notifications with duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    visibleNotifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [visibleNotifications]);

  const handleDismiss = (id: string) => {
    const notification = visibleNotifications.find((n) => n.id === id);
    if (notification?.onDismiss) {
      notification.onDismiss();
    }
    onDismiss(id);
  };

  const handleAction = (notification: ToastNotification) => {
    if (notification.onAction) {
      notification.onAction();
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    handleDismiss(notification.id);
  };

  const getIcon = (type: ToastNotification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeStyles = (type: ToastNotification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "info":
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getPriorityStyles = (priority: ToastNotification["priority"]) => {
    switch (priority) {
      case "urgent":
        return "ring-2 ring-red-500 ring-opacity-50";
      case "high":
        return "ring-2 ring-orange-500 ring-opacity-50";
      case "medium":
        return "ring-1 ring-blue-500 ring-opacity-30";
      case "low":
      default:
        return "";
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "bottom-right":
        return "bottom-4 right-4";
      default:
        return "top-4 right-4";
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={cn("fixed z-50 space-y-2", getPositionStyles())}>
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={cn(
            "w-80 max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
            getTypeStyles(notification.type),
            getPriorityStyles(notification.priority),
            "animate-in slide-in-from-right-full"
          )}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h4>

                {notification.priority !== "low" && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-1.5 py-0.5",
                      notification.priority === "urgent" &&
                        "border-red-300 text-red-700 bg-red-50",
                      notification.priority === "high" &&
                        "border-orange-300 text-orange-700 bg-orange-50",
                      notification.priority === "medium" &&
                        "border-blue-300 text-blue-700 bg-blue-50"
                    )}
                  >
                    {notification.priority}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-3">
                {notification.message}
              </p>

              {(notification.actionText || notification.actionUrl) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => handleAction(notification)}
                  >
                    {notification.actionText || "View"}
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={() => handleDismiss(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar for timed notifications */}
          {notification.duration && notification.duration > 0 && (
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all ease-linear",
                  notification.type === "success" && "bg-green-500",
                  notification.type === "warning" && "bg-yellow-500",
                  notification.type === "error" && "bg-red-500",
                  notification.type === "info" && "bg-blue-500"
                )}
                style={{
                  animation: `shrink ${notification.duration}ms linear`,
                }}
              />
            </div>
          )}
        </div>
      ))}

      {notifications.length > maxVisible && (
        <div className="w-80 max-w-sm rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Bell className="h-4 w-4" />
            <span>
              +{notifications.length - maxVisible} more notification
              {notifications.length - maxVisible !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Hook for managing toast notifications
export function useNotificationToast() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = (notification: Omit<ToastNotification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // Default 5 seconds
    };

    setNotifications((prev) => [newNotification, ...prev]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (
    title: string,
    message: string,
    options?: Partial<ToastNotification>
  ) => {
    return addNotification({ ...options, title, message, type: "success" });
  };

  const showError = (
    title: string,
    message: string,
    options?: Partial<ToastNotification>
  ) => {
    return addNotification({
      ...options,
      title,
      message,
      type: "error",
      priority: "high",
    });
  };

  const showWarning = (
    title: string,
    message: string,
    options?: Partial<ToastNotification>
  ) => {
    return addNotification({
      ...options,
      title,
      message,
      type: "warning",
      priority: "medium",
    });
  };

  const showInfo = (
    title: string,
    message: string,
    options?: Partial<ToastNotification>
  ) => {
    return addNotification({
      ...options,
      title,
      message,
      type: "info",
      priority: "low",
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
