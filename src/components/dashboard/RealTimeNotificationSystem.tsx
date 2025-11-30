"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Settings,
  Filter,
  X,
  Check,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Vibrate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotificationContext } from "@/components/ui/notification-provider";
import { cn } from "@/lib/utils";
import type {
  Notification,
  NotificationType,
  NotificationPriority,
} from "@/types/dashboard";

interface RealTimeNotificationSystemProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
  maxVisible?: number;
  className?: string;
}

interface NotificationPreferences {
  sound: boolean;
  vibration: boolean;
  types: Record<NotificationType, boolean>;
  priorities: Record<NotificationPriority, boolean>;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  sound: true,
  vibration: true,
  types: {
    assignment: true,
    grade: true,
    deadline: true,
    message: true,
    achievement: true,
    system: true,
  },
  priorities: {
    low: true,
    medium: true,
    high: true,
    urgent: true,
  },
};

export function RealTimeNotificationSystem({
  userId,
  onNotificationClick,
  maxVisible = 5,
  className,
}: RealTimeNotificationSystemProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotificationContext();

  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showPreferences, setShowPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem(
      `notification-preferences-${userId}`
    );
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    }
  }, [userId]);

  // Save preferences to localStorage
  const savePreferences = useCallback(
    (newPreferences: NotificationPreferences) => {
      setPreferences(newPreferences);
      localStorage.setItem(
        `notification-preferences-${userId}`,
        JSON.stringify(newPreferences)
      );
    },
    [userId]
  );

  // Filter notifications based on preferences and filters
  useEffect(() => {
    let filtered = notifications;

    // Filter by tab (all or unread)
    if (activeTab === "unread") {
      filtered = filtered.filter((n) => !n.read);
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((n) => n.type === selectedType);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter((n) => n.priority === selectedPriority);
    }

    // Filter by preferences
    filtered = filtered.filter(
      (n) =>
        preferences.types[n.type as NotificationType] &&
        preferences.priorities[n.priority as NotificationPriority]
    );

    setFilteredNotifications(filtered);
  }, [
    notifications,
    activeTab,
    selectedType,
    selectedPriority,
    preferences.types,
    preferences.priorities,
  ]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (preferences.sound && typeof window !== "undefined") {
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch((error) => {
          console.error("Error playing notification sound:", error);
        });
      } catch (error) {
        console.error("Error creating audio:", error);
      }
    }
  }, [preferences.sound]);

  // Trigger vibration
  const triggerVibration = useCallback(() => {
    if (
      preferences.vibration &&
      typeof window !== "undefined" &&
      "vibrate" in navigator
    ) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (error) {
        console.error("Error triggering vibration:", error);
      }
    }
  }, [preferences.vibration]);

  // Handle new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (!latestNotification.read) {
        playNotificationSound();
        triggerVibration();
      }
    }
  }, [notifications, playNotificationSound, triggerVibration]);

  // Handle notification click
  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Mark as read if not already
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      // Call custom handler if provided
      if (onNotificationClick) {
        onNotificationClick(notification);
      }

      // Navigate to action URL if provided
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    },
    [markAsRead, onNotificationClick]
  );

  // Handle notification dismiss
  const handleDismiss = useCallback(
    async (notificationId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      await deleteNotification(notificationId);
    },
    [deleteNotification]
  );

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    async (notificationId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      await markAsRead(notificationId);
    },
    [markAsRead]
  );

  // Get priority color
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "low":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Get type color
  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "assignment":
        return "bg-green-100 text-green-800";
      case "grade":
        return "bg-blue-100 text-blue-800";
      case "deadline":
        return "bg-red-100 text-red-800";
      case "message":
        return "bg-purple-100 text-purple-800";
      case "achievement":
        return "bg-yellow-100 text-yellow-800";
      case "system":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNotifications}
              disabled={loading}
            >
              Refresh
            </Button>

            <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Notification Preferences</DialogTitle>
                  <DialogDescription>
                    Customize how you receive notifications
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Sound and Vibration */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Alerts</h4>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="sound">Sound</Label>
                      </div>
                      <Switch
                        id="sound"
                        checked={preferences.sound}
                        onCheckedChange={(checked) =>
                          savePreferences({ ...preferences, sound: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Vibrate className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="vibration">Vibration</Label>
                      </div>
                      <Switch
                        id="vibration"
                        checked={preferences.vibration}
                        onCheckedChange={(checked) =>
                          savePreferences({
                            ...preferences,
                            vibration: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>

                    {Object.entries(preferences.types).map(
                      ([type, enabled]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <Label
                            htmlFor={`type-${type}`}
                            className="capitalize"
                          >
                            {type}
                          </Label>
                          <Switch
                            id={`type-${type}`}
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              savePreferences({
                                ...preferences,
                                types: {
                                  ...preferences.types,
                                  [type]: checked,
                                },
                              })
                            }
                          />
                        </div>
                      )
                    )}
                  </div>

                  {/* Priority Levels */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Priority Levels</h4>

                    {Object.entries(preferences.priorities).map(
                      ([priority, enabled]) => (
                        <div
                          key={priority}
                          className="flex items-center justify-between"
                        >
                          <Label
                            htmlFor={`priority-${priority}`}
                            className="capitalize"
                          >
                            {priority}
                          </Label>
                          <Switch
                            id={`priority-${priority}`}
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              savePreferences({
                                ...preferences,
                                priorities: {
                                  ...preferences.priorities,
                                  [priority]: checked,
                                },
                              })
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="flex flex-col gap-3 mt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="grade">Grade</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="message">Message</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedPriority}
              onValueChange={setSelectedPriority}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="ml-auto"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {activeTab === "unread"
              ? "No unread notifications"
              : selectedType !== "all" || selectedPriority !== "all"
              ? "No notifications match your filters"
              : "No notifications yet"}
          </div>
        ) : (
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredNotifications.slice(0, maxVisible).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                  !notification.read && "bg-blue-50/30"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3
                        className={cn(
                          "text-sm font-medium truncate",
                          !notification.read && "font-semibold"
                        )}
                      >
                        {notification.title}
                      </h3>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0.5",
                          getTypeColor(notification.type as NotificationType)
                        )}
                      >
                        {notification.type}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0.5",
                          getPriorityColor(
                            notification.priority as NotificationPriority
                          )
                        )}
                      >
                        {notification.priority}
                      </Badge>

                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </span>

                      <div className="flex items-center gap-1">
                        {notification.actionText && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                          >
                            {notification.actionText}
                          </Button>
                        )}

                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                          onClick={(e) => handleDismiss(notification.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length > maxVisible && (
              <div className="p-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/notifications")}
                >
                  View all {filteredNotifications.length} notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
