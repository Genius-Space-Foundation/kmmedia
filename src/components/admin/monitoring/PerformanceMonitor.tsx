"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Server,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: number;
  status: "good" | "warning" | "critical";
  category: "speed" | "reliability" | "usage" | "quality";
  description: string;
  threshold: {
    warning: number;
    critical: number;
  };
}

interface PagePerformance {
  id: string;
  page: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  bounceRate: number;
  conversionRate: number;
  visitors: number;
}

interface ApiPerformance {
  id: string;
  endpoint: string;
  method: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  successRate: number;
  lastUpdated: string;
}

interface UserExperience {
  device: string;
  browser: string;
  country: string;
  avgSessionDuration: number;
  pageViews: number;
  bounceRate: number;
  conversionRate: number;
  users: number;
}

const statusColors = {
  good: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

const categoryIcons = {
  speed: <Zap className="h-4 w-4" />,
  reliability: <CheckCircle className="h-4 w-4" />,
  usage: <Activity className="h-4 w-4" />,
  quality: <BarChart3 className="h-4 w-4" />,
};

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [pagePerformance, setPagePerformance] = useState<PagePerformance[]>([]);
  const [apiPerformance, setApiPerformance] = useState<ApiPerformance[]>([]);
  const [userExperience, setUserExperience] = useState<UserExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("24h");

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);

      // Mock performance data
      const mockMetrics: PerformanceMetric[] = [
        {
          id: "1",
          name: "Page Load Time",
          value: 1.2,
          unit: "s",
          trend: -15.2,
          status: "good",
          category: "speed",
          description: "Average time to load pages",
          threshold: { warning: 3, critical: 5 },
        },
        {
          id: "2",
          name: "First Contentful Paint",
          value: 0.8,
          unit: "s",
          trend: -8.5,
          status: "good",
          category: "speed",
          description: "Time to first contentful paint",
          threshold: { warning: 1.5, critical: 2.5 },
        },
        {
          id: "3",
          name: "Largest Contentful Paint",
          value: 1.5,
          unit: "s",
          trend: -12.3,
          status: "good",
          category: "speed",
          description: "Time to largest contentful paint",
          threshold: { warning: 2.5, critical: 4 },
        },
        {
          id: "4",
          name: "Cumulative Layout Shift",
          value: 0.05,
          unit: "",
          trend: -25.0,
          status: "good",
          category: "quality",
          description: "Visual stability score",
          threshold: { warning: 0.1, critical: 0.25 },
        },
        {
          id: "5",
          name: "First Input Delay",
          value: 45,
          unit: "ms",
          trend: -20.0,
          status: "good",
          category: "quality",
          description: "Time to first user interaction",
          threshold: { warning: 100, critical: 300 },
        },
        {
          id: "6",
          name: "Error Rate",
          value: 0.2,
          unit: "%",
          trend: -5.0,
          status: "good",
          category: "reliability",
          description: "Percentage of failed requests",
          threshold: { warning: 1, critical: 5 },
        },
        {
          id: "7",
          name: "Uptime",
          value: 99.9,
          unit: "%",
          trend: 0.1,
          status: "good",
          category: "reliability",
          description: "System availability",
          threshold: { warning: 99, critical: 95 },
        },
        {
          id: "8",
          name: "API Response Time",
          value: 145,
          unit: "ms",
          trend: -18.5,
          status: "good",
          category: "speed",
          description: "Average API response time",
          threshold: { warning: 500, critical: 1000 },
        },
      ];

      const mockPagePerformance: PagePerformance[] = [
        {
          id: "1",
          page: "/dashboard",
          loadTime: 1.2,
          firstContentfulPaint: 0.8,
          largestContentfulPaint: 1.5,
          cumulativeLayoutShift: 0.05,
          firstInputDelay: 45,
          bounceRate: 15.2,
          conversionRate: 8.5,
          visitors: 1250,
        },
        {
          id: "2",
          page: "/courses",
          loadTime: 0.9,
          firstContentfulPaint: 0.6,
          largestContentfulPaint: 1.1,
          cumulativeLayoutShift: 0.03,
          firstInputDelay: 35,
          bounceRate: 12.8,
          conversionRate: 12.3,
          visitors: 2100,
        },
        {
          id: "3",
          page: "/apply",
          loadTime: 2.1,
          firstContentfulPaint: 1.2,
          largestContentfulPaint: 2.0,
          cumulativeLayoutShift: 0.08,
          firstInputDelay: 65,
          bounceRate: 25.5,
          conversionRate: 5.2,
          visitors: 850,
        },
        {
          id: "4",
          page: "/login",
          loadTime: 0.7,
          firstContentfulPaint: 0.4,
          largestContentfulPaint: 0.8,
          cumulativeLayoutShift: 0.02,
          firstInputDelay: 25,
          bounceRate: 8.9,
          conversionRate: 18.7,
          visitors: 3200,
        },
      ];

      const mockApiPerformance: ApiPerformance[] = [
        {
          id: "1",
          endpoint: "/api/auth/login",
          method: "POST",
          avgResponseTime: 120,
          p95ResponseTime: 250,
          p99ResponseTime: 450,
          requestsPerMinute: 45,
          errorRate: 0.1,
          successRate: 99.9,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "2",
          endpoint: "/api/courses",
          method: "GET",
          avgResponseTime: 85,
          p95ResponseTime: 180,
          p99ResponseTime: 320,
          requestsPerMinute: 120,
          errorRate: 0.05,
          successRate: 99.95,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "3",
          endpoint: "/api/payments/verify",
          method: "POST",
          avgResponseTime: 350,
          p95ResponseTime: 800,
          p99ResponseTime: 1200,
          requestsPerMinute: 15,
          errorRate: 0.8,
          successRate: 99.2,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "4",
          endpoint: "/api/admin/stats",
          method: "GET",
          avgResponseTime: 200,
          p95ResponseTime: 400,
          p99ResponseTime: 650,
          requestsPerMinute: 8,
          errorRate: 0.2,
          successRate: 99.8,
          lastUpdated: new Date().toISOString(),
        },
      ];

      const mockUserExperience: UserExperience[] = [
        {
          device: "Desktop",
          browser: "Chrome",
          country: "Nigeria",
          avgSessionDuration: 8.5,
          pageViews: 4.2,
          bounceRate: 12.5,
          conversionRate: 8.3,
          users: 1250,
        },
        {
          device: "Mobile",
          browser: "Safari",
          country: "Nigeria",
          avgSessionDuration: 6.2,
          pageViews: 3.8,
          bounceRate: 18.7,
          conversionRate: 6.1,
          users: 2100,
        },
        {
          device: "Tablet",
          browser: "Chrome",
          country: "Ghana",
          avgSessionDuration: 7.8,
          pageViews: 4.5,
          bounceRate: 15.3,
          conversionRate: 7.2,
          users: 450,
        },
        {
          device: "Desktop",
          browser: "Firefox",
          country: "Kenya",
          avgSessionDuration: 9.1,
          pageViews: 5.1,
          bounceRate: 10.2,
          conversionRate: 9.8,
          users: 320,
        },
      ];

      setMetrics(mockMetrics);
      setPagePerformance(mockPagePerformance);
      setApiPerformance(mockApiPerformance);
      setUserExperience(mockUserExperience);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getPerformanceScore = (metric: PerformanceMetric) => {
    const { value, threshold } = metric;
    if (value <= threshold.warning) return 100;
    if (value <= threshold.critical) return 75;
    return 50;
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
            Performance Monitor
          </h1>
          <p className="text-gray-600">
            Real-time performance metrics and user experience insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchPerformanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Performance Score
                </p>
                <p className="text-2xl font-bold text-green-600">92</p>
                <p className="text-xs text-gray-500">Excellent</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Load Time
                </p>
                <p className="text-2xl font-bold text-gray-900">1.2s</p>
                <p className="text-xs text-gray-500">-15.2% from last week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">0.2%</p>
                <p className="text-xs text-gray-500">-5.0% from last week</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  User Satisfaction
                </p>
                <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                <p className="text-xs text-gray-500">
                  Based on 1,250 responses
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Analysis */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.slice(0, 5).map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {categoryIcons[metric.category]}
                        <span className="text-sm font-medium text-gray-600">
                          {metric.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-semibold ${getStatusColor(
                            metric.status
                          )}`}
                        >
                          {metric.value}
                          {metric.unit}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                    <Progress
                      value={getPerformanceScore(metric)}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Performance trends chart</p>
                    <p className="text-sm text-gray-500">
                      Chart.js integration needed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {pagePerformance.map((page) => (
              <Card
                key={page.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {page.page}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {page.visitors} visitors
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800">
                        {page.loadTime}s load time
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {page.conversionRate}% conversion
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Load Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {page.loadTime}s
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">FCP</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {page.firstContentfulPaint}s
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">LCP</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {page.largestContentfulPaint}s
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">CLS</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {page.cumulativeLayoutShift}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {apiPerformance.map((api) => (
              <Card
                key={api.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {api.endpoint}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {api.method} • {api.requestsPerMinute} req/min
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          api.errorRate > 1
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {api.errorRate}% error rate
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {api.successRate}% success
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Avg Response</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {api.avgResponseTime}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">P95</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {api.p95ResponseTime}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">P99</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {api.p99ResponseTime}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {api.successRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {userExperience.map((experience) => (
              <Card
                key={`${experience.device}-${experience.browser}-${experience.country}`}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {experience.device === "Mobile" ? (
                        <Smartphone className="h-5 w-5 text-gray-600" />
                      ) : experience.device === "Tablet" ? (
                        <Monitor className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Monitor className="h-5 w-5 text-gray-600" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {experience.device} • {experience.browser}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {experience.country} • {experience.users} users
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {experience.avgSessionDuration}min session
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {experience.conversionRate}% conversion
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Session Duration</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {experience.avgSessionDuration}min
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Page Views</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {experience.pageViews}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Bounce Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {experience.bounceRate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Conversion</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {experience.conversionRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      Good Performance
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your application is performing well with an average load
                    time of 1.2s, which is below the recommended 3s threshold.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      Optimization Opportunity
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    The /apply page has a higher bounce rate (25.5%) compared to
                    other pages. Consider optimizing the form or reducing the
                    number of fields.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Mobile Optimization
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Mobile users have a higher bounce rate (18.7%) than desktop
                    users (12.5%). Consider improving mobile responsiveness.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Optimize Images
                      </p>
                      <p className="text-sm text-gray-600">
                        Compress and use WebP format for better loading times
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Enable Caching
                      </p>
                      <p className="text-sm text-gray-600">
                        Implement browser caching for static assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Database Optimization
                      </p>
                      <p className="text-sm text-gray-600">
                        Add indexes to frequently queried columns
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        CDN Implementation
                      </p>
                      <p className="text-sm text-gray-600">
                        Use a CDN to serve static content from edge locations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


