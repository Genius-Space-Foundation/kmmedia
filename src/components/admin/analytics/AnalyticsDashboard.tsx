"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueChart from "../charts/RevenueChart";
import UserGrowthChart from "../charts/UserGrowthChart";
import StatusDistributionChart from "../charts/StatusDistributionChart";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

interface AnalyticsData {
  revenue: {
    monthly: Array<{ month: string; amount: number }>;
    total: number;
    growth: number;
  };
  users: {
    monthly: Array<{ month: string; count: number }>;
    total: number;
    growth: number;
  };
  courses: {
    byStatus: Array<{ status: string; count: number }>;
    total: number;
  };
  applications: {
    byStatus: Array<{ status: string; count: number }>;
    total: number;
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("6months");

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        revenue: {
          monthly: [
            { month: "Jan", amount: 250000 },
            { month: "Feb", amount: 320000 },
            { month: "Mar", amount: 280000 },
            { month: "Apr", amount: 450000 },
            { month: "May", amount: 380000 },
            { month: "Jun", amount: 520000 },
          ],
          total: 2200000,
          growth: 15.2,
        },
        users: {
          monthly: [
            { month: "Jan", count: 45 },
            { month: "Feb", count: 62 },
            { month: "Mar", count: 58 },
            { month: "Apr", count: 78 },
            { month: "May", count: 85 },
            { month: "Jun", count: 92 },
          ],
          total: 420,
          growth: 8.5,
        },
        courses: {
          byStatus: [
            { status: "Published", count: 25 },
            { status: "Pending", count: 8 },
            { status: "Draft", count: 12 },
            { status: "Rejected", count: 3 },
          ],
          total: 48,
        },
        applications: {
          byStatus: [
            { status: "Approved", count: 156 },
            { status: "Pending", count: 23 },
            { status: "Under Review", count: 8 },
            { status: "Rejected", count: 12 },
          ],
          total: 199,
        },
      };

      setData(mockData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: string) => {
    console.log(`Exporting ${type} data...`);
    // Implement actual export functionality
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
        <Button onClick={handleRefresh} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const revenueChartData = {
    labels: data.revenue.monthly.map((item) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: data.revenue.monthly.map((item) => item.amount),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
      },
    ],
  };

  const userGrowthChartData = {
    labels: data.users.monthly.map((item) => item.month),
    datasets: [
      {
        label: "New Users",
        data: data.users.monthly.map((item) => item.count),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const courseStatusData = {
    labels: data.courses.byStatus.map((item) => item.status),
    datasets: [
      {
        label: "Courses",
        data: data.courses.byStatus.map((item) => item.count),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(251, 191, 36)",
          "rgb(59, 130, 246)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const applicationStatusData = {
    labels: data.applications.byStatus.map((item) => item.status),
    datasets: [
      {
        label: "Applications",
        data: data.applications.byStatus.map((item) => item.count),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(251, 191, 36)",
          "rgb(59, 130, 246)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into your platform performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("all")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  GH₵{data.revenue.total.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  {data.revenue.growth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      data.revenue.growth > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {data.revenue.growth > 0 ? "+" : ""}
                    {data.revenue.growth}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.users.total}
                </p>
                <div className="flex items-center mt-1">
                  {data.users.growth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      data.users.growth > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {data.users.growth > 0 ? "+" : ""}
                    {data.users.growth}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.courses.total}
                </p>
                <p className="text-sm text-gray-500 mt-1">Active courses</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.applications.total}
                </p>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={revenueChartData} />
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserGrowthChart data={userGrowthChartData} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Course Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart data={courseStatusData} />
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Application Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart data={applicationStatusData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Revenue Analytics
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("revenue")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Revenue Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueChartData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  User Analytics
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("users")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export User Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserGrowthChart data={userGrowthChartData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Course Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart data={courseStatusData} />
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Course Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.courses.byStatus.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{item.status}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
