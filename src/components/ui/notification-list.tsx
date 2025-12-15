"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface NotificationListProps {
  userId: string;
  className?: string;
}

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

interface NotificationFilters {
  type: string;
  priority: string;
  read: string;
  search: string;
}

export function NotificationList({ userId, className }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const [filters, setFilters] = useState<NotificationFilters>({
    type: "all",
    priority: "all",
    read: "all",
    search: "",
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/notifications?userId=${userId}&limit=50`
      );
      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter(
        (n) => n.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Filter by priority
    if (filters.priority !== "all") {
      filtered = filtered.filter(
        (n) => n.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }

    // Filter by read status
    if (filters.read !== "all") {
      filtered = filtered.filter((n) =>
        filters.read === "read" ? n.read : !n.read
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.content.toLowerCase().includes(searchLower)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filters]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true, readAt: new Date() }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark multiple notifications as read
  const markSelectedAsRead = async () => {
    try {
      const promises = Array.from(selectedNotifications).map((id) =>
        fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
      );

      await Promise.all(promises);

      setNotifications((prev) =>
        prev.map((notification) =>
          selectedNotifications.has(notification.id)
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      );

      setSelectedNotifications(new Set());
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setSelectedNotifications((prev) => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Delete selected notifications
  const deleteSelected = async () => {
    try {
      const promises = Array.from(selectedNotifications).map((id) =>
        fetch(`/api/notifications/${id}`, { method: "DELETE" })
      );

      await Promise.all(promises);

      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.has(n.id))
      );

      setSelectedNotifications(new Set());
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  // Toggle notification selection
  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  // Select all filtered notifications
  const selectAll = () => {
    const allIds = new Set(filteredNotifications.map((n) => n.id));
    setSelectedNotifications(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedNotifications(new Set());
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "course":
        return "bg-blue-100 text-blue-800";
      case "assignment":
        return "bg-green-100 text-green-800";
      case "payment":
        return "bg-yellow-100 text-yellow-800";
      case "reminder":
        return "bg-purple-100 text-purple-800";
      case "announcement":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const hasSelection = selectedNotifications.size > 0;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.type}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger className="w-[120px]">
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

          <Select
            value={filters.read}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, read: value }))
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        {hasSelection && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedNotifications.size} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={markSelectedAsRead}
              className="text-blue-700 hover:text-blue-800"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSelected}
              className="text-red-700 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-gray-700 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {filteredNotifications.length > 0 && !hasSelection && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="text-sm"
            >
              Select all
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filters.search ||
            filters.type !== "all" ||
            filters.priority !== "all" ||
            filters.read !== "all"
              ? "No notifications match your filters"
              : "No notifications yet"}
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-gray-50 transition-colors",
                  !notification.read && "bg-blue-50/30",
                  selectedNotifications.has(notification.id) && "bg-blue-100"
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="mt-1"
                  />

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
                          getTypeColor(notification.type)
                        )}
                      >
                        {notification.type}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0.5",
                          getPriorityColor(notification.priority)
                        )}
                      >
                        {notification.priority}
                      </Badge>

                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {notification.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(new Date(notification.createdAt))}
                        {notification.readAt && (
                          <span className="ml-2">
                            • Read{" "}
                            {formatTimeAgo(new Date(notification.readAt))}
                          </span>
                        )}
                      </span>

                      <div className="flex items-center gap-1">
                        {notification.actionUrl && notification.actionText && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                              window.location.href = notification.actionUrl!;
                            }}
                          >
                            {notification.actionText}
                          </Button>
                        )}

                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
