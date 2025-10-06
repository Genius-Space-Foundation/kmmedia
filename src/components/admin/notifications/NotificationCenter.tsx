"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Settings,
  Filter,
  CheckSquare,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "system" | "user" | "course" | "payment" | "application";
  read: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high" | "urgent";
  actions?: Array<{
    label: string;
    action: string;
    variant?: "default" | "destructive";
  }>;
}

const notificationTypes = {
  info: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-100" },
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  error: { icon: X, color: "text-red-600", bgColor: "bg-red-100" },
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Course Submission",
          message:
            "John Smith submitted a new course 'Advanced React Development' for review",
          type: "info",
          category: "course",
          read: false,
          createdAt: "2024-01-20T10:30:00Z",
          priority: "medium",
          actions: [
            { label: "Review Course", action: "review_course" },
            { label: "View Details", action: "view_details" },
          ],
        },
        {
          id: "2",
          title: "Payment Failed",
          message:
            "Payment of GH₵50,000 failed for user mike@example.com. Please investigate.",
          type: "error",
          category: "payment",
          read: false,
          createdAt: "2024-01-20T09:15:00Z",
          priority: "high",
          actions: [
            { label: "Retry Payment", action: "retry_payment" },
            { label: "Contact User", action: "contact_user" },
          ],
        },
        {
          id: "3",
          title: "System Maintenance Scheduled",
          message:
            "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM UTC",
          type: "warning",
          category: "system",
          read: true,
          createdAt: "2024-01-19T16:00:00Z",
          priority: "medium",
        },
        {
          id: "4",
          title: "User Registration Spike",
          message:
            "Unusual spike in user registrations detected. 25 new users in the last hour.",
          type: "info",
          category: "user",
          read: true,
          createdAt: "2024-01-19T14:45:00Z",
          priority: "low",
        },
        {
          id: "5",
          title: "Application Approved",
          message:
            "Application for 'Digital Marketing Course' has been automatically approved",
          type: "success",
          category: "application",
          read: false,
          createdAt: "2024-01-19T11:20:00Z",
          priority: "low",
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const handleNotificationAction = (notificationId: string, action: string) => {
    console.log(
      `Performing action ${action} for notification ${notificationId}`
    );
    // Implement actual action handling
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (activeTab !== "all") {
      filtered = filtered.filter(
        (notification) => notification.category === activeTab
      );
    }

    if (filter !== "all") {
      filtered = filtered.filter(
        (notification) => notification.priority === filter
      );
    }

    return filtered;
  };

  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.read).length;
  };

  const getCategoryCount = (category: string) => {
    return notifications.filter(
      (notification) => notification.category === category
    ).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notification Center
          </h1>
          <p className="text-gray-600">
            Stay updated with system alerts and important events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Unread Notifications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getUnreadCount()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCategoryCount("system")}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  User Activity
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCategoryCount("user")}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Urgent Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    notifications.filter(
                      (n) => n.priority === "urgent" && !n.read
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Filter by priority:
          </span>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notification List */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="system">
            System ({getCategoryCount("system")})
          </TabsTrigger>
          <TabsTrigger value="user">
            Users ({getCategoryCount("user")})
          </TabsTrigger>
          <TabsTrigger value="course">
            Courses ({getCategoryCount("course")})
          </TabsTrigger>
          <TabsTrigger value="payment">
            Payments ({getCategoryCount("payment")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {getFilteredNotifications().length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Notifications
                </h3>
                <p className="text-gray-600">
                  You're all caught up! No notifications to show.
                </p>
              </CardContent>
            </Card>
          ) : (
            getFilteredNotifications().map((notification) => {
              const typeConfig = notificationTypes[notification.type];
              const TypeIcon = typeConfig.icon;

              return (
                <Card
                  key={notification.id}
                  className={`bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl transition-all ${
                    !notification.read ? "ring-2 ring-blue-200" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.bgColor}`}
                      >
                        <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <Badge
                                className={
                                  priorityColors[notification.priority]
                                }
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </span>
                              </span>
                              <span className="capitalize">
                                {notification.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {notification.actions &&
                              notification.actions.length > 0 && (
                                <div className="flex space-x-2">
                                  {notification.actions.map((action, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleNotificationAction(
                                          notification.id,
                                          action.action
                                        )
                                      }
                                      className={
                                        action.variant === "destructive"
                                          ? "text-red-600"
                                          : ""
                                      }
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}

                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
