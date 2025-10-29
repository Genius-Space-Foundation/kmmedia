"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  BarChart3,
  AlertTriangle,
  DollarSign,
  Activity,
  Shield,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  MobileStatsWidget,
  MobileProgressWidget,
  MobileQuickAction,
  MobileActivityItem,
  MobileShortcutGrid,
  MobileFloatingActionButton,
} from "./MobileWidgets";
import SwipeGestureHandler from "./SwipeGestureHandler";
import { makeAuthenticatedRequest } from "@/lib/token-utils";
import { getCurrentBreakpoint } from "@/lib/mobile-utils";

interface MobileAdminDashboardProps {
  user: any;
  systemStats: any;
  users: any[];
  courses: any[];
  payments: any[];
  alerts: any[];
  onManageUsers: () => void;
  onManageCourses: () => void;
  onViewReports: () => void;
  onSystemSettings: () => void;
  onViewAlert: (alertId: string) => void;
}

export default function MobileAdminDashboard({
  user,
  systemStats,
  users = [],
  courses = [],
  payments = [],
  alerts = [],
  onManageUsers,
  onManageCourses,
  onViewReports,
  onSystemSettings,
  onViewAlert,
}: MobileAdminDashboardProps) {
  const [currentWidgetIndex, setCurrentWidgetIndex] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    fetchRecentActivity();

    const checkCompactMode = () => {
      const breakpoint = getCurrentBreakpoint();
      setCompactMode(
        breakpoint === "xs" || (breakpoint === "sm" && window.innerHeight < 700)
      );
    };

    checkCompactMode();
    window.addEventListener("resize", checkCompactMode);
    return () => window.removeEventListener("resize", checkCompactMode);
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const mockActivity = [
        {
          id: "1",
          title: "New User Registration",
          description: "5 new users registered in the last hour",
          time: "30 minutes ago",
          type: "general",
          status: "completed",
        },
        {
          id: "2",
          title: "Payment Alert",
          description: "Failed payment requires attention",
          time: "1 hour ago",
          type: "payment",
          status: "pending",
        },
        {
          id: "3",
          title: "System Update",
          description: "Database backup completed successfully",
          time: "2 hours ago",
          type: "general",
          status: "completed",
        },
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeStats = (direction: "left" | "right") => {
    const statsCount = 4;
    if (direction === "left" && currentWidgetIndex < statsCount - 1) {
      setCurrentWidgetIndex(currentWidgetIndex + 1);
    } else if (direction === "right" && currentWidgetIndex > 0) {
      setCurrentWidgetIndex(currentWidgetIndex - 1);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const totalCourses = courses.length;
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const criticalAlerts = alerts.filter((a) => a.priority === "high").length;

  const statsWidgets = [
    {
      title: "Total Users",
      value: totalUsers,
      change: "+15",
      trend: "up" as const,
      icon: Users,
      color: "blue" as const,
      subtitle: "Registered users",
      onClick: onManageUsers,
    },
    {
      title: "Active Users",
      value: activeUsers,
      change: "+8",
      trend: "up" as const,
      icon: Activity,
      color: "green" as const,
      subtitle: "Currently active",
      onClick: onManageUsers,
    },
    {
      title: "Total Courses",
      value: totalCourses,
      change: "+2",
      trend: "up" as const,
      icon: BookOpen,
      color: "purple" as const,
      subtitle: "Available courses",
      onClick: onManageCourses,
    },
    {
      title: "Revenue",
      value: `₵${totalRevenue.toLocaleString()}`,
      change: "+12%",
      trend: "up" as const,
      icon: DollarSign,
      color: "orange" as const,
      subtitle: "Total revenue",
      onClick: onViewReports,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage your platform
              </p>
              {criticalAlerts > 0 && (
                <div className="flex items-center space-x-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    {criticalAlerts} critical alerts
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Platform Overview</h2>
          <div className="flex space-x-1">
            {statsWidgets.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentWidgetIndex ? "bg-red-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <SwipeGestureHandler
          onSwipeLeft={() => handleSwipeStats("left")}
          onSwipeRight={() => handleSwipeStats("right")}
        >
          <div className="grid grid-cols-2 gap-4">
            {statsWidgets
              .slice(currentWidgetIndex, currentWidgetIndex + 2)
              .map((widget, index) => (
                <MobileStatsWidget
                  key={currentWidgetIndex + index}
                  {...widget}
                />
              ))}
          </div>
        </SwipeGestureHandler>
      </div>

      {showShortcuts && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Quick Access</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(false)}
              className="text-gray-500"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          <MobileShortcutGrid
            shortcuts={[
              {
                id: "manage-users",
                title: "Users",
                icon: Users,
                color: "from-blue-500 to-blue-600",
                count: totalUsers,
                onClick: onManageUsers,
              },
              {
                id: "manage-courses",
                title: "Courses",
                icon: BookOpen,
                color: "from-purple-500 to-purple-600",
                count: totalCourses,
                onClick: onManageCourses,
              },
              {
                id: "view-reports",
                title: "Reports",
                icon: BarChart3,
                color: "from-green-500 to-green-600",
                onClick: onViewReports,
              },
              {
                id: "system-settings",
                title: "Settings",
                icon: Settings,
                color: "from-orange-500 to-orange-600",
                onClick: onSystemSettings,
              },
            ]}
            columns={compactMode ? 2 : 4}
          />
        </div>
      )}

      <MobileFloatingActionButton
        icon={Settings}
        onClick={onSystemSettings}
        color="from-red-500 to-orange-600"
        size="md"
        position="bottom-right"
      />
    </div>
  );
}
