"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  BookOpen,
  User,
  Settings,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import {
  isMobile,
  getCurrentBreakpoint,
  isTouchDevice,
} from "@/lib/mobile-utils";

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "student" | "instructor" | "admin";
  user?: any;
  notifications?: any[];
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortLabel: string;
}

const getTabsForRole = (role: string): TabConfig[] => {
  const commonTabs = [
    { id: "overview", label: "Overview", icon: Home, shortLabel: "Home" },
    { id: "profile", label: "Profile", icon: User, shortLabel: "Profile" },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      shortLabel: "Alerts",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      shortLabel: "Settings",
    },
  ];

  switch (role) {
    case "student":
      return [
        ...commonTabs.slice(0, 1),
        {
          id: "courses",
          label: "Courses",
          icon: BookOpen,
          shortLabel: "Courses",
        },
        {
          id: "learning",
          label: "Learning",
          icon: BarChart3,
          shortLabel: "Progress",
        },
        {
          id: "deadlines",
          label: "Deadlines",
          icon: MessageSquare,
          shortLabel: "Tasks",
        },
        ...commonTabs.slice(1),
      ];
    case "instructor":
      return [
        ...commonTabs.slice(0, 1),
        {
          id: "courses",
          label: "Course Management",
          icon: BookOpen,
          shortLabel: "Courses",
        },
        {
          id: "students",
          label: "Students",
          icon: User,
          shortLabel: "Students",
        },
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
          shortLabel: "Analytics",
        },
        ...commonTabs.slice(1),
      ];
    case "admin":
      return [
        ...commonTabs.slice(0, 1),
        { id: "users", label: "Users", icon: User, shortLabel: "Users" },
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
          shortLabel: "Analytics",
        },
        {
          id: "reports",
          label: "Reports",
          icon: MessageSquare,
          shortLabel: "Reports",
        },
        ...commonTabs.slice(1),
      ];
    default:
      return commonTabs;
  }
};

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

const getQuickActionsForRole = (role: string): QuickAction[] => {
  const commonActions = [
    {
      id: "search",
      label: "Search",
      icon: Search,
      onClick: () => console.log("Search clicked"),
    },
    {
      id: "notifications",
      label: "Alerts",
      icon: Bell,
      onClick: () => console.log("Notifications clicked"),
    },
  ];

  switch (role) {
    case "student":
      return [
        {
          id: "continue-learning",
          label: "Continue",
          icon: BookOpen,
          onClick: () => console.log("Continue learning clicked"),
        },
        {
          id: "assignments",
          label: "Tasks",
          icon: MessageSquare,
          onClick: () => console.log("Assignments clicked"),
        },
        ...commonActions,
      ];
    case "instructor":
      return [
        {
          id: "create-course",
          label: "Create",
          icon: BookOpen,
          onClick: () => console.log("Create course clicked"),
        },
        {
          id: "grade-assignments",
          label: "Grade",
          icon: BarChart3,
          onClick: () => console.log("Grade assignments clicked"),
        },
        ...commonActions,
      ];
    case "admin":
      return [
        {
          id: "user-management",
          label: "Users",
          icon: User,
          onClick: () => console.log("User management clicked"),
        },
        {
          id: "system-health",
          label: "System",
          icon: BarChart3,
          onClick: () => console.log("System health clicked"),
        },
        ...commonActions,
      ];
    default:
      return commonActions;
  }
};

export default function MobileDashboardLayout({
  children,
  activeTab,
  onTabChange,
  userRole,
  user,
  notifications = [],
}: MobileDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = getTabsForRole(userRole);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    setCurrentTabIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [activeTab, tabs]);

  useEffect(() => {
    setIsSwipeEnabled(isTouchDevice() && isMobile());
    // Check if device is in compact mode (small screens)
    const checkCompactMode = () => {
      const breakpoint = getCurrentBreakpoint();
      setIsCompactMode(
        breakpoint === "xs" || (breakpoint === "sm" && window.innerHeight < 700)
      );
    };

    checkCompactMode();
    window.addEventListener("resize", checkCompactMode);
    return () => window.removeEventListener("resize", checkCompactMode);
  }, []);

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSwipeEnabled) return;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeEnabled) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isSwipeEnabled) return;

    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && currentTabIndex < tabs.length - 1) {
        // Swipe left - next tab
        const nextTab = tabs[currentTabIndex + 1];
        onTabChange(nextTab.id);
      } else if (swipeDistance < 0 && currentTabIndex > 0) {
        // Swipe right - previous tab
        const prevTab = tabs[currentTabIndex - 1];
        onTabChange(prevTab.id);
      }
    }
  };

  const handleTabNavigation = (direction: "prev" | "next") => {
    if (direction === "prev" && currentTabIndex > 0) {
      const prevTab = tabs[currentTabIndex - 1];
      onTabChange(prevTab.id);
    } else if (direction === "next" && currentTabIndex < tabs.length - 1) {
      const nextTab = tabs[currentTabIndex + 1];
      onTabChange(nextTab.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">KM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {userRole === "student"
                  ? "Student Hub"
                  : userRole === "instructor"
                  ? "Instructor Hub"
                  : "Admin Hub"}
              </h1>
              <p className="text-xs text-gray-600">
                {tabs.find((tab) => tab.id === activeTab)?.label || "Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="px-4 pb-4">
          {/* Quick Actions Toggle */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-2 text-blue-600"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabNavigation("prev")}
                disabled={currentTabIndex === 0}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1 mx-2">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {tabs
                    .slice(
                      Math.max(0, currentTabIndex - (isCompactMode ? 0 : 1)),
                      Math.min(
                        tabs.length,
                        currentTabIndex + (isCompactMode ? 2 : 3)
                      )
                    )
                    .map((tab) => {
                      const Icon = tab.icon;
                      const isActive = tab.id === activeTab;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => onTabChange(tab.id)}
                          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all duration-200 ${
                            isActive
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Icon
                            className={`${
                              isCompactMode ? "w-3 h-3" : "w-4 h-4"
                            } mb-1`}
                          />
                          <span
                            className={`${
                              isCompactMode ? "text-xs" : "text-xs"
                            } font-medium truncate`}
                          >
                            {isCompactMode
                              ? tab.shortLabel.slice(0, 4)
                              : tab.shortLabel}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabNavigation("next")}
                disabled={currentTabIndex === tabs.length - 1}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCompactMode(!isCompactMode)}
              className="p-2 text-gray-600"
              aria-label={isCompactMode ? "Expand view" : "Compact view"}
            >
              {isCompactMode ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions Panel */}
          {showQuickActions && (
            <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-4 gap-2">
                {getQuickActionsForRole(userRole).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/80 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Icon className="w-5 h-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-gray-700 text-center">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex space-x-1">
            {tabs.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  index === currentTabIndex
                    ? "bg-blue-600"
                    : index < currentTabIndex
                    ? "bg-blue-300"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">KM</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      KM Media
                    </h1>
                    <p className="text-sm text-gray-600">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}{" "}
                      Dashboard
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-gray-100/80 rounded-xl p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                        : "hover:bg-gray-100/80 hover:scale-105"
                    }`}
                    onClick={() => {
                      onTabChange(tab.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{tab.label}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Mobile Footer */}
            {user && (
              <div className="p-4 border-t border-gray-200/50">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/80">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {user.name || "User"}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {user.email || "user@example.com"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content with Swipe Support */}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="p-4">{children}</div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-40">
        <div className="flex items-center justify-around py-2">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.shortLabel}</span>
                {tab.id === "notifications" && unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
