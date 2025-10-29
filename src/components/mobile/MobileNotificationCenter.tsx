"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Bell,
  X,
  Settings,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  BookOpen,
  CreditCard,
  Award,
  ChevronDown,
  ChevronUp,
  Trash2,
  MoreVertical,
  Volume2,
  VolumeX,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";
import SwipeGestureHandler from "./SwipeGestureHandler";

interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "course"
    | "assignment"
    | "payment"
    | "achievement"
    | "general"
    | "reminder";
  priority: "low" | "medium" | "high";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  data?: any;
}

interface NotificationSettings {
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    course: boolean;
    assignment: boolean;
    payment: boolean;
    achievement: boolean;
    general: boolean;
    reminder: boolean;
  };
}

interface MobileNotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNotificationCenter({
  userId,
  isOpen,
  onClose,
}: MobileNotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
    categories: {
      course: true,
      assignment: true,
      payment: true,
      achievement: true,
      general: true,
      reminder: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">(
    "notifications"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "today">(
    "all"
  );
  const [expandedNotification, setExpandedNotification] = useState<
    string | null
  >(null);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showCompactView, setShowCompactView] = useState(false);
  const [swipeToDeleteEnabled, setSwipeToDeleteEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchSettings();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchQuery, filterType]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(
        `/api/student/notifications/${userId}`
      );
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/student/notifications/${userId}/settings`
      );
      const result = await response.json();

      if (result.success) {
        setSettings({ ...settings, ...result.data });
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (notification) =>
          notification.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case "unread":
        filtered = filtered.filter((notification) => !notification.read);
        break;
      case "today":
        const today = new Date().toDateString();
        filtered = filtered.filter(
          (notification) =>
            new Date(notification.createdAt).toDateString() === today
        );
        break;
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await makeAuthenticatedRequest(
        `/api/student/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
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
        {
          method: "PUT",
        }
      );

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await makeAuthenticatedRequest(
        `/api/student/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteSelectedNotifications = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map((id) =>
          makeAuthenticatedRequest(`/api/student/notifications/${id}`, {
            method: "DELETE",
          })
        )
      );

      setNotifications((prev) =>
        prev.filter(
          (notification) => !selectedNotifications.has(notification.id)
        )
      );
      setSelectedNotifications(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Error deleting selected notifications:", error);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course":
        return BookOpen;
      case "assignment":
        return Clock;
      case "payment":
        return CreditCard;
      case "achievement":
        return Award;
      case "reminder":
        return Bell;
      default:
        return MessageSquare;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "high") return "bg-red-100 text-red-600 border-red-200";

    switch (type) {
      case "course":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "assignment":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "payment":
        return "bg-green-100 text-green-600 border-green-200";
      case "achievement":
        return "bg-purple-100 text-purple-600 border-purple-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return null;
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
        <SwipeGestureHandler
          onSwipeRight={onClose}
          className="h-full flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6" />
                <div>
                  <h1 className="text-lg font-bold">Notifications</h1>
                  {unreadCount > 0 && (
                    <p className="text-sm opacity-90">{unreadCount} unread</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === "notifications"
                    ? "bg-white text-blue-600"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === "settings"
                    ? "bg-white text-blue-600"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "notifications" ? (
              <div className="h-full flex flex-col">
                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {["all", "unread", "today"].map((filter) => (
                        <Button
                          key={filter}
                          size="sm"
                          variant={
                            filterType === filter ? "default" : "outline"
                          }
                          onClick={() => setFilterType(filter as any)}
                          className="capitalize"
                        >
                          {filter}
                        </Button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowCompactView(!showCompactView)}
                        className="p-2"
                      >
                        {showCompactView ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </Button>
                      {isSelectionMode && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={deleteSelectedNotifications}
                          disabled={selectedNotifications.size === 0}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete ({selectedNotifications.size})
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                      >
                        {isSelectionMode ? "Cancel" : "Select"}
                      </Button>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={markAllAsRead}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark All as Read
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-600">
                          Loading notifications...
                        </p>
                      </div>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery || filterType !== "all"
                              ? "No matching notifications"
                              : "No notifications"}
                          </h3>
                          <p className="text-gray-600">
                            {searchQuery || filterType !== "all"
                              ? "Try adjusting your search or filter"
                              : "You're all caught up!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {filteredNotifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        const isExpanded =
                          expandedNotification === notification.id;
                        const isSelected = selectedNotifications.has(
                          notification.id
                        );

                        return (
                          <SwipeGestureHandler
                            key={notification.id}
                            onSwipeLeft={() =>
                              swipeToDeleteEnabled &&
                              deleteNotification(notification.id)
                            }
                            threshold={100}
                          >
                            <Card
                              className={`transition-all duration-200 cursor-pointer ${
                                notification.read
                                  ? "bg-gray-50 border-gray-200"
                                  : "bg-blue-50 border-blue-200 shadow-md"
                              } ${isSelected ? "ring-2 ring-blue-500" : ""} ${
                                showCompactView ? "mb-1" : "mb-2"
                              }`}
                            >
                              <CardContent
                                className={showCompactView ? "p-3" : "p-4"}
                              >
                                <div className="flex items-start space-x-3">
                                  {isSelectionMode && (
                                    <div className="flex-shrink-0 pt-1">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          toggleNotificationSelection(
                                            notification.id
                                          )
                                        }
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                      />
                                    </div>
                                  )}

                                  <div
                                    className={`${
                                      showCompactView ? "w-8 h-8" : "w-10 h-10"
                                    } ${getNotificationColor(
                                      notification.type,
                                      notification.priority
                                    )} rounded-lg flex items-center justify-center flex-shrink-0`}
                                  >
                                    <Icon
                                      className={`${
                                        showCompactView ? "w-4 h-4" : "w-5 h-5"
                                      }`}
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <h3
                                          className={`${
                                            showCompactView
                                              ? "text-sm"
                                              : "text-base"
                                          } font-semibold ${
                                            notification.read
                                              ? "text-gray-700"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {notification.title}
                                        </h3>
                                        {!showCompactView && (
                                          <p
                                            className={`text-sm mt-1 ${
                                              notification.read
                                                ? "text-gray-500"
                                                : "text-gray-700"
                                            } ${
                                              isExpanded ? "" : "line-clamp-2"
                                            }`}
                                          >
                                            {notification.message}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2 ml-2">
                                        {!showCompactView &&
                                          getPriorityBadge(
                                            notification.priority
                                          )}
                                        {!notification.read && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>
                                        {showCompactView
                                          ? new Date(
                                              notification.createdAt
                                            ).toLocaleDateString()
                                          : new Date(
                                              notification.createdAt
                                            ).toLocaleString()}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        {!showCompactView && (
                                          <button
                                            onClick={() =>
                                              setExpandedNotification(
                                                isExpanded
                                                  ? null
                                                  : notification.id
                                              )
                                            }
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            {isExpanded ? (
                                              <ChevronUp className="w-4 h-4" />
                                            ) : (
                                              <ChevronDown className="w-4 h-4" />
                                            )}
                                          </button>
                                        )}
                                        {!notification.read && (
                                          <button
                                            onClick={() =>
                                              markAsRead(notification.id)
                                            }
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {!showCompactView &&
                                      isExpanded &&
                                      notification.actionUrl &&
                                      notification.actionText && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <Button size="sm" className="w-full">
                                            {notification.actionText}
                                          </Button>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </SwipeGestureHandler>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Settings Tab */
              <div className="p-4 space-y-6 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Notification Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* General Settings */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">General</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Push Notifications</p>
                              <p className="text-sm text-gray-600">
                                Receive notifications in browser
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.pushEnabled}
                            onCheckedChange={(checked) =>
                              updateSettings({ pushEnabled: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {settings.soundEnabled ? (
                              <Volume2 className="w-5 h-5 text-gray-600" />
                            ) : (
                              <VolumeX className="w-5 h-5 text-gray-600" />
                            )}
                            <div>
                              <p className="font-medium">Sound</p>
                              <p className="text-sm text-gray-600">
                                Play sound for notifications
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.soundEnabled}
                            onCheckedChange={(checked) =>
                              updateSettings({ soundEnabled: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Quiet Hours
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Quiet Hours</p>
                            <p className="text-sm text-gray-600">
                              Silence notifications during specified hours
                            </p>
                          </div>
                          <Switch
                            checked={settings.quietHours.enabled}
                            onCheckedChange={(checked) =>
                              updateSettings({
                                quietHours: {
                                  ...settings.quietHours,
                                  enabled: checked,
                                },
                              })
                            }
                          />
                        </div>
                        {settings.quietHours.enabled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                              </label>
                              <Input
                                type="time"
                                value={settings.quietHours.start}
                                onChange={(e) =>
                                  updateSettings({
                                    quietHours: {
                                      ...settings.quietHours,
                                      start: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                              </label>
                              <Input
                                type="time"
                                value={settings.quietHours.end}
                                onChange={(e) =>
                                  updateSettings({
                                    quietHours: {
                                      ...settings.quietHours,
                                      end: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Notification Types
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(settings.categories).map(
                          ([category, enabled]) => {
                            const Icon = getNotificationIcon(category);
                            return (
                              <div
                                key={category}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-3">
                                  <Icon className="w-5 h-5 text-gray-600" />
                                  <div>
                                    <p className="font-medium capitalize">
                                      {category}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {category === "course" &&
                                        "Course updates and announcements"}
                                      {category === "assignment" &&
                                        "Assignment deadlines and reminders"}
                                      {category === "payment" &&
                                        "Payment confirmations and reminders"}
                                      {category === "achievement" &&
                                        "Badges and milestone celebrations"}
                                      {category === "general" &&
                                        "Platform updates and news"}
                                      {category === "reminder" &&
                                        "Custom reminders and alerts"}
                                    </p>
                                  </div>
                                </div>
                                <Switch
                                  checked={enabled}
                                  onCheckedChange={(checked) =>
                                    updateSettings({
                                      categories: {
                                        ...settings.categories,
                                        [category]: checked,
                                      },
                                    })
                                  }
                                />
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SwipeGestureHandler>
      </div>
    </div>
  );
}
