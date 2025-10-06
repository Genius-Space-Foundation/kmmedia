"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "course" | "assignment" | "payment" | "general" | "reminder";
  priority: "low" | "medium" | "high";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  courseReminders: boolean;
  assignmentDeadlines: boolean;
  paymentReminders: boolean;
  generalUpdates: boolean;
  reminderTime: string;
}

interface NotificationSystemProps {
  userId: string;
}

export default function NotificationSystem({
  userId,
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    courseReminders: true,
    assignmentDeadlines: true,
    paymentReminders: true,
    generalUpdates: true,
    reminderTime: "09:00",
  });
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    fetchNotifications();
    checkNotificationPermission();
    requestNotificationPermission();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/student/notifications/${userId}`
      );
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationPermission = () => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setPermission(permission);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await makeAuthenticatedRequest(
        `/api/student/notifications/${notificationId}/read`,
        { method: "PUT" }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await makeAuthenticatedRequest(
        `/api/student/notifications/${userId}/read-all`,
        { method: "PUT" }
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      await makeAuthenticatedRequest(
        `/api/student/notifications/${userId}/settings`,
        {
          method: "PUT",
          body: JSON.stringify(updatedSettings),
        }
      );
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  };

  const sendTestNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification from KM Media Training",
        icon: "/favicon.ico",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course":
        return "📚";
      case "assignment":
        return "📝";
      case "payment":
        return "💳";
      case "reminder":
        return "⏰";
      default:
        return "🔔";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            Loading Notifications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">
            Stay updated with your learning progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notification Permission Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🔔</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Push Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  {permission === "granted"
                    ? "Notifications are enabled"
                    : permission === "denied"
                    ? "Notifications are blocked"
                    : "Click to enable notifications"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {permission === "granted" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={sendTestNotification}
                >
                  Test
                </Button>
              )}
              {permission !== "granted" && (
                <Button size="sm" onClick={requestNotificationPermission}>
                  Enable
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Customize how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Delivery Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">
                      Browser notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      updateSettings({ pushNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Email updates</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      updateSettings({ emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Text messages</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) =>
                      updateSettings({ smsNotifications: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Notification Types
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Course Reminders</p>
                    <p className="text-sm text-gray-600">
                      Lesson and session reminders
                    </p>
                  </div>
                  <Switch
                    checked={settings.courseReminders}
                    onCheckedChange={(checked) =>
                      updateSettings({ courseReminders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Assignment Deadlines</p>
                    <p className="text-sm text-gray-600">Due date reminders</p>
                  </div>
                  <Switch
                    checked={settings.assignmentDeadlines}
                    onCheckedChange={(checked) =>
                      updateSettings({ assignmentDeadlines: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-gray-600">
                      Payment due notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.paymentReminders}
                    onCheckedChange={(checked) =>
                      updateSettings({ paymentReminders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">General Updates</p>
                    <p className="text-sm text-gray-600">
                      Platform updates and news
                    </p>
                  </div>
                  <Switch
                    checked={settings.generalUpdates}
                    onCheckedChange={(checked) =>
                      updateSettings({ generalUpdates: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Reminder Time</p>
                <p className="text-sm text-gray-600">
                  When to send daily reminders
                </p>
              </div>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) =>
                  updateSettings({ reminderTime: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Your latest notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔔</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600">
                You'll receive notifications about your courses, assignments,
                and important updates here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    notification.read
                      ? "bg-gray-50 border-gray-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              notification.read
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <p
                            className={`text-sm mt-1 ${
                              notification.read
                                ? "text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge
                            className={getPriorityColor(notification.priority)}
                          >
                            {notification.priority}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      {notification.actionUrl && notification.actionText && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline">
                            {notification.actionText}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


