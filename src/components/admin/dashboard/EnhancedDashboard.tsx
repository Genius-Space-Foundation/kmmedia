"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StatsWidget from "./widgets/StatsWidget";
import ChartWidget from "./widgets/ChartWidget";
import RecentActivityWidget from "./widgets/RecentActivityWidget";
import AIInsights from "../ai/AIInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalInstructors: number;
  totalStudents: number;
  totalCourses: number;
  pendingApplications: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

interface ActivityItem {
  id: string;
  type: "user" | "course" | "application" | "payment";
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  user?: {
    name: string;
    email: string;
  };
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
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // Mock activities data - replace with actual API call
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
          type: "course",
          title: "Course published",
          description: "Digital Marketing Fundamentals is now live",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: "success",
        },
        {
          id: "3",
          type: "application",
          title: "Application submitted",
          description: "Sarah Wilson applied for Media Production course",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          status: "warning",
        },
        {
          id: "4",
          type: "payment",
          title: "Payment completed",
          description: "GH₵50,000 payment received from Mike Johnson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: "success",
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
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsWidget
          type="users"
          value={stats.totalUsers}
          trend={{
            value: 12,
            label: "vs last month",
          }}
          subtitle={`${stats.totalInstructors} instructors, ${stats.totalStudents} students`}
        />

        <StatsWidget
          type="courses"
          value={stats.totalCourses}
          trend={{
            value: 8,
            label: "vs last month",
          }}
          subtitle="Active courses"
        />

        <StatsWidget
          type="revenue"
          value={stats.totalRevenue}
          trend={{
            value: 15,
            label: "vs last month",
          }}
          subtitle={`GH₵${stats.monthlyRevenue.toLocaleString()} this month`}
        />

        <StatsWidget
          type="applications"
          value={stats.pendingApplications}
          trend={{
            value: -5,
            label: "vs last week",
          }}
          subtitle="Awaiting review"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Revenue Trend"
          subtitle="Monthly revenue over the last 6 months"
          onRefresh={handleRefresh}
          onExport={() => console.log("Export revenue data")}
        >
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-600">
                Revenue chart will be implemented here
              </p>
              <p className="text-sm text-gray-500">
                Integration with Chart.js or similar
              </p>
            </div>
          </div>
        </ChartWidget>

        <ChartWidget
          title="User Growth"
          subtitle="New user registrations by month"
          onRefresh={handleRefresh}
        >
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Users className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">
                User growth chart will be implemented here
              </p>
              <p className="text-sm text-gray-500">
                Integration with Chart.js or similar
              </p>
            </div>
          </div>
        </ChartWidget>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 gap-6">
        <AIInsights />
      </div>

      {/* Recent Activity and Quick Actions */}
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
                onClick={() => handleViewAll("users")}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleViewAll("courses")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Review Courses
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleViewAll("applications")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Process Applications
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleViewAll("payments")}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                View Payments
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
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
                <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
