"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StatsWidget from "./widgets/StatsWidget";
import ChartWidget from "./widgets/ChartWidget";
import RecentActivityWidget from "./widgets/RecentActivityWidget";
import AIInsights from "../ai/AIInsights";
import SystemHealth from "../monitoring/SystemHealth";
import SystemHealthOverview from "./SystemHealthOverview";
import FinancialManagement from "../payments/FinancialManagement";
import FinancialReporting from "./FinancialReporting";
import UserManagement from "../users/UserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Activity,
  Server,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Shield,
  UserCheck,
  UserX,
  CreditCard,
  Wallet,
  TrendingDown,
  Eye,
  Settings,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/api-utils";

interface DashboardStats {
  totalUsers: number;
  totalInstructors: number;
  totalStudents: number;
  totalCourses: number;
  pendingApplications: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  activeUsers: number;
  suspendedUsers: number;
  systemUptime: number;
  criticalAlerts: number;
  revenueGrowth: number;
  userGrowth: number;
  courseCompletionRate: number;
  paymentSuccessRate: number;
}

interface ActivityItem {
  id: string;
  type: "user" | "course" | "application" | "payment" | "system";
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  user?: {
    name: string;
    email: string;
  };
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

interface FinancialSummary {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  revenueGrowth: number;
  averageTransactionValue: number;
}

interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  suspendedUsers: number;
  usersByRole: {
    admins: number;
    instructors: number;
    students: number;
  };
  userGrowthRate: number;
}

export default function EnhancedDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalCourses: 0,
    pendingApplications: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    systemUptime: 99.9,
    criticalAlerts: 0,
    revenueGrowth: 0,
    userGrowth: 0,
    courseCompletionRate: 0,
    paymentSuccessRate: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    revenueGrowth: 0,
    averageTransactionValue: 0,
  });
  const [userSummary, setUserSummary] = useState<UserSummary>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    suspendedUsers: 0,
    usersByRole: { admins: 0, instructors: 0, students: 0 },
    userGrowthRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch comprehensive dashboard stats and pending applications
      const [statsResponse, applicationsResponse] = await Promise.all([
        fetch("/api/admin/dashboard/comprehensive", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/admin/applications?status=PENDING&limit=5", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (statsResponse.ok) {
        const statsData = await safeJsonParse(statsResponse, {
          success: false,
          data: {},
        });
        if (statsData.success) {
          setStats(statsData.data.stats || stats);
          setFinancialSummary(statsData.data.financial || financialSummary);
          setUserSummary(statsData.data.users || userSummary);
          setSystemMetrics(statsData.data.systemMetrics || []);
        }
      }

      if (applicationsResponse.ok) {
        const appsData = await safeJsonParse(applicationsResponse, {
          success: false,
          data: { applications: [] },
        });
        if (appsData.success && appsData.data?.applications) {
          setPendingApplications(appsData.data.applications);
        }
      } else {
        // Mock comprehensive data for development
        const mockStats: DashboardStats = {
          totalUsers: 1247,
          totalInstructors: 45,
          totalStudents: 1180,
          totalCourses: 89,
          pendingApplications: 23,
          totalRevenue: 2450000,
          monthlyRevenue: 185000,
          pendingPayments: 12,
          activeUsers: 1156,
          suspendedUsers: 8,
          systemUptime: 99.8,
          criticalAlerts: 2,
          revenueGrowth: 15.2,
          userGrowth: 12.8,
          courseCompletionRate: 78.5,
          paymentSuccessRate: 96.2,
        };

        const mockFinancial: FinancialSummary = {
          totalRevenue: 2450000,
          monthlyRevenue: 185000,
          pendingPayments: 12,
          successfulPayments: 1834,
          failedPayments: 67,
          refundedPayments: 23,
          revenueGrowth: 15.2,
          averageTransactionValue: 1335,
        };

        const mockUserSummary: UserSummary = {
          totalUsers: 1247,
          activeUsers: 1156,
          newUsersThisMonth: 89,
          suspendedUsers: 8,
          usersByRole: { admins: 12, instructors: 45, students: 1180 },
          userGrowthRate: 12.8,
        };

        const mockSystemMetrics: SystemMetric[] = [
          {
            id: "1",
            name: "CPU Usage",
            value: 45,
            unit: "%",
            status: "healthy",
            trend: "stable",
          },
          {
            id: "2",
            name: "Memory Usage",
            value: 68,
            unit: "%",
            status: "warning",
            trend: "up",
          },
          {
            id: "3",
            name: "Database Response",
            value: 12,
            unit: "ms",
            status: "healthy",
            trend: "down",
          },
          {
            id: "4",
            name: "API Response Time",
            value: 145,
            unit: "ms",
            status: "healthy",
            trend: "stable",
          },
        ];

        setStats(mockStats);
        setFinancialSummary(mockFinancial);
        setUserSummary(mockUserSummary);
        setSystemMetrics(mockSystemMetrics);
      }

      // Enhanced activities data
      setActivities([
        {
          id: "1",
          type: "user",
          title: "New user registered",
          description: "John Doe registered as a student",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: "success",
          user: { name: "John Doe", email: "john@example.com" },
        },
        {
          id: "2",
          type: "system",
          title: "System alert resolved",
          description: "High memory usage alert has been resolved",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: "success",
        },
        {
          id: "3",
          type: "payment",
          title: "Payment failed",
          description: "Payment of GH₵3,500 failed for user Sarah Wilson",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: "error",
        },
        {
          id: "4",
          type: "course",
          title: "Course published",
          description: "Digital Marketing Fundamentals is now live",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: "success",
        },
        {
          id: "5",
          type: "application",
          title: "Bulk applications approved",
          description: "15 applications were approved in bulk action",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          status: "success",
        },
        {
          id: "6",
          type: "user",
          title: "User suspended",
          description: "User Mike Johnson was suspended for policy violation",
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          status: "warning",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleViewAll = (type: string) => {
    router.push(`/dashboards/admin?tab=${type}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    action: "APPROVE" | "REJECT"
  ) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          reviewNotes: "Quick action from dashboard",
          reviewedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(`Application ${action.toLowerCase()}d successfully`);
        fetchDashboardData();
      } else {
        const error = await safeJsonParse(response, {
          message: "Failed to update application",
        });
        toast.error(error.message);
      }
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive system overview with real-time monitoring and
            analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Comprehensive Metrics Overview */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {stats.totalUsers.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        +{stats.userGrowth}%
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      GH₵{(stats.totalRevenue / 1000).toFixed(0)}K
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        +{stats.revenueGrowth}%
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      System Uptime
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {stats.systemUptime}%
                    </p>
                    <div className="flex items-center mt-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        Healthy
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                    <Server className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">
                      Critical Alerts
                    </p>
                    <p className="text-3xl font-bold text-orange-900">
                      {stats.criticalAlerts}
                    </p>
                    <div className="flex items-center mt-2">
                      {stats.criticalAlerts > 0 ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
                          <span className="text-sm text-orange-600 font-medium">
                            Needs Attention
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-sm text-green-600 font-medium">
                            All Clear
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Applications & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Pending Applications
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboards/admin/applications")}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending applications
                    </div>
                  ) : (
                    pendingApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={app.user?.image || app.user?.profileImage} />
                            <AvatarFallback>
                              {app.user?.name?.slice(0, 2).toUpperCase() || "NA"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {app.user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {app.course?.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
                            onClick={() =>
                              handleApplicationAction(app.id, "APPROVE")
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleApplicationAction(app.id, "REJECT")
                            }
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        {metric.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-semibold ${getMetricColor(
                            metric.status
                          )}`}
                        >
                          {metric.value}
                          {metric.unit}
                        </span>
                        {getTrendIcon(metric.trend)}
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.activeUsers}
                    </p>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.totalCourses}
                    </p>
                    <p className="text-sm text-gray-600">Total Courses</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.courseCompletionRate}%
                    </p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.paymentSuccessRate}%
                    </p>
                    <p className="text-sm text-gray-600">Payment Success</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement onRefresh={fetchDashboardData} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialReporting />
          <FinancialManagement />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemHealthOverview />
          <SystemHealth />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics content will be implemented here */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity and Quick Actions - Only show on overview tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivityWidget
              activities={activities}
              onViewAll={() => handleViewAll("activity")}
            />
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setActiveTab("financial")}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financial Reports
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setActiveTab("system")}
                >
                  <Server className="h-4 w-4 mr-2" />
                  System Health
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* System Status Summary */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payments</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Service</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Warning
                  </Badge>
                </div>
                <div className="pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab("system")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="font-semibold text-green-600">
                    GH₵{financialSummary.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-blue-600">
                    {stats.paymentSuccessRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Pending Payments
                  </span>
                  <span className="font-semibold text-orange-600">
                    {financialSummary.pendingPayments}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab("financial")}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Financial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
