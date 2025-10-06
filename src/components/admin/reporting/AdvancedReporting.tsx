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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Share,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Image,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Settings,
  Save,
  Send,
  Clock,
  User,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  DollarSign,
  Users,
  BookOpen,
  CreditCard,
  Mail,
  Bell,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

interface ReportData {
  id: string;
  name: string;
  type: "executive" | "financial" | "operational" | "analytical" | "custom";
  status: "draft" | "published" | "scheduled" | "archived";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastRun?: string;
  nextRun?: string;
  schedule?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly";
    time: string;
    recipients: string[];
    enabled: boolean;
  };
  metrics: {
    name: string;
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
    target?: number;
    unit: string;
  }[];
  visualizations: {
    id: string;
    type: "chart" | "table" | "metric" | "kpi";
    title: string;
    data: any;
    config: any;
  }[];
  filters: {
    dateRange: {
      start: string;
      end: string;
    };
    departments?: string[];
    users?: string[];
    courses?: string[];
    status?: string[];
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  metrics: string[];
  visualizations: string[];
  frequency: string;
  recipients: string[];
}

interface ReportInsight {
  id: string;
  type: "trend" | "anomaly" | "recommendation" | "alert";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  metric: string;
  value: number;
  change: number;
  timestamp: string;
  actionable: boolean;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "1",
    name: "Executive Dashboard",
    description: "High-level KPIs and business performance overview",
    category: "Executive",
    icon: <BarChart3 className="h-4 w-4" />,
    metrics: ["revenue", "users", "courses", "satisfaction"],
    visualizations: ["kpi_cards", "trend_charts", "performance_table"],
    frequency: "weekly",
    recipients: ["ceo@kmmedia.com", "cfo@kmmedia.com"],
  },
  {
    id: "2",
    name: "Financial Performance",
    description: "Revenue, payments, and financial health analysis",
    category: "Financial",
    icon: <DollarSign className="h-4 w-4" />,
    metrics: ["revenue", "payments", "refunds", "profit_margin"],
    visualizations: ["revenue_chart", "payment_breakdown", "financial_metrics"],
    frequency: "monthly",
    recipients: ["finance@kmmedia.com", "cfo@kmmedia.com"],
  },
  {
    id: "3",
    name: "User Engagement",
    description: "User behavior, retention, and engagement metrics",
    category: "Analytics",
    icon: <Users className="h-4 w-4" />,
    metrics: ["active_users", "retention", "engagement", "conversion"],
    visualizations: ["user_growth", "retention_curve", "engagement_heatmap"],
    frequency: "weekly",
    recipients: ["analytics@kmmedia.com", "product@kmmedia.com"],
  },
  {
    id: "4",
    name: "Course Performance",
    description: "Course completion, ratings, and learning outcomes",
    category: "Operational",
    icon: <BookOpen className="h-4 w-4" />,
    metrics: ["completions", "ratings", "feedback", "outcomes"],
    visualizations: [
      "completion_chart",
      "rating_distribution",
      "feedback_analysis",
    ],
    frequency: "monthly",
    recipients: ["academic@kmmedia.com", "instructors@kmmedia.com"],
  },
  {
    id: "5",
    name: "System Health",
    description: "Performance, uptime, and technical metrics",
    category: "Technical",
    icon: <Activity className="h-4 w-4" />,
    metrics: ["uptime", "performance", "errors", "capacity"],
    visualizations: ["system_metrics", "performance_chart", "error_analysis"],
    frequency: "daily",
    recipients: ["devops@kmmedia.com", "engineering@kmmedia.com"],
  },
];

const statusColors = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
};

const typeIcons = {
  executive: <BarChart3 className="h-4 w-4" />,
  financial: <DollarSign className="h-4 w-4" />,
  operational: <Activity className="h-4 w-4" />,
  analytical: <PieChart className="h-4 w-4" />,
  custom: <FileText className="h-4 w-4" />,
};

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function AdvancedReporting() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [insights, setInsights] = useState<ReportInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchReports();
    fetchInsights();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Mock reports data
      const mockReports: ReportData[] = [
        {
          id: "1",
          name: "Monthly Executive Summary",
          type: "executive",
          status: "published",
          createdAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdBy: "Admin User",
          lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: {
            frequency: "monthly",
            time: "09:00",
            recipients: ["admin@kmmedia.com", "ceo@kmmedia.com"],
            enabled: true,
          },
          metrics: [
            {
              name: "Total Revenue",
              value: 125000,
              change: 12.5,
              trend: "up",
              target: 100000,
              unit: "$",
            },
            {
              name: "Active Users",
              value: 1250,
              change: 8.3,
              trend: "up",
              target: 1000,
              unit: "",
            },
            {
              name: "Course Completions",
              value: 89,
              change: -2.1,
              trend: "down",
              target: 100,
              unit: "%",
            },
            {
              name: "Satisfaction Score",
              value: 4.7,
              change: 0.3,
              trend: "up",
              target: 4.5,
              unit: "/5",
            },
          ],
          visualizations: [
            {
              id: "1",
              type: "kpi",
              title: "Key Performance Indicators",
              data: {},
              config: {},
            },
            {
              id: "2",
              type: "chart",
              title: "Revenue Trend",
              data: {},
              config: { type: "line" },
            },
          ],
          filters: {
            dateRange: {
              start: "2024-01-01",
              end: "2024-01-31",
            },
          },
        },
        {
          id: "2",
          name: "Weekly User Analytics",
          type: "analytical",
          status: "scheduled",
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdBy: "Analytics Team",
          lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          schedule: {
            frequency: "weekly",
            time: "08:00",
            recipients: ["analytics@kmmedia.com"],
            enabled: true,
          },
          metrics: [
            {
              name: "New Users",
              value: 150,
              change: 15.2,
              trend: "up",
              unit: "",
            },
            {
              name: "User Retention",
              value: 78.5,
              change: 2.1,
              trend: "up",
              unit: "%",
            },
            {
              name: "Engagement Rate",
              value: 65.3,
              change: -1.2,
              trend: "down",
              unit: "%",
            },
            {
              name: "Conversion Rate",
              value: 12.8,
              change: 0.5,
              trend: "up",
              unit: "%",
            },
          ],
          visualizations: [
            {
              id: "1",
              type: "chart",
              title: "User Growth",
              data: {},
              config: { type: "bar" },
            },
            {
              id: "2",
              type: "table",
              title: "User Metrics",
              data: {},
              config: {},
            },
          ],
          filters: {
            dateRange: {
              start: "2024-01-15",
              end: "2024-01-21",
            },
          },
        },
        {
          id: "3",
          name: "Course Performance Report",
          type: "operational",
          status: "draft",
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdBy: "Course Manager",
          metrics: [
            {
              name: "Course Completions",
              value: 89,
              change: -2.1,
              trend: "down",
              unit: "%",
            },
            {
              name: "Average Rating",
              value: 4.6,
              change: 0.1,
              trend: "up",
              unit: "/5",
            },
            {
              name: "Completion Rate",
              value: 78.5,
              change: 1.2,
              trend: "up",
              unit: "%",
            },
            {
              name: "Feedback Score",
              value: 4.3,
              change: 0.2,
              trend: "up",
              unit: "/5",
            },
          ],
          visualizations: [
            {
              id: "1",
              type: "chart",
              title: "Course Completions",
              data: {},
              config: { type: "pie" },
            },
            {
              id: "2",
              type: "metric",
              title: "Average Rating",
              data: {},
              config: {},
            },
          ],
          filters: {
            dateRange: {
              start: "2024-01-01",
              end: "2024-01-31",
            },
          },
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      // Mock insights data
      const mockInsights: ReportInsight[] = [
        {
          id: "1",
          type: "trend",
          title: "Revenue Growth Trend",
          description:
            "Revenue has increased by 12.5% this month, exceeding the target of 10%",
          severity: "low",
          metric: "revenue",
          value: 125000,
          change: 12.5,
          timestamp: new Date().toISOString(),
          actionable: false,
        },
        {
          id: "2",
          type: "anomaly",
          title: "Unusual Drop in Course Completions",
          description:
            "Course completion rate dropped by 2.1% this month, which is unusual",
          severity: "medium",
          metric: "course_completions",
          value: 89,
          change: -2.1,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          actionable: true,
        },
        {
          id: "3",
          type: "recommendation",
          title: "User Engagement Optimization",
          description:
            "Consider implementing gamification features to improve user engagement",
          severity: "low",
          metric: "engagement",
          value: 65.3,
          change: -1.2,
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          actionable: true,
        },
        {
          id: "4",
          type: "alert",
          title: "High Error Rate Detected",
          description:
            "API error rate has increased to 2.5%, above the threshold of 1%",
          severity: "high",
          metric: "error_rate",
          value: 2.5,
          change: 1.2,
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          actionable: true,
        },
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error("Error fetching insights:", error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Bell className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">
            Advanced Reporting
          </h1>
          <p className="text-gray-600">
            Comprehensive reporting with AI-powered insights and automation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Choose a template or create a custom report with advanced
                  analytics.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      {template.icon}
                      <h3 className="font-medium text-gray-900">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800">
                        {template.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {template.frequency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length}
                </p>
                <p className="text-xs text-gray-500">All reports</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter((r) => r.status === "published").length}
                </p>
                <p className="text-xs text-gray-500">Active reports</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter((r) => r.status === "scheduled").length}
                </p>
                <p className="text-xs text-gray-500">Auto-generated</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insights</p>
                <p className="text-2xl font-bold text-purple-600">
                  {insights.length}
                </p>
                <p className="text-xs text-gray-500">AI-generated</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reporting */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Reports */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports.slice(0, 3).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {typeIcons[report.type]}
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(report.updatedAt).toLocaleDateString()} •{" "}
                          {report.createdBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[report.status]}>
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.slice(0, 3).map((insight) => (
                  <div
                    key={insight.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex-shrink-0">
                      {getSeverityIcon(insight.severity)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {insight.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {insight.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={severityColors[insight.severity]}>
                          {insight.severity}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(insight.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {typeIcons[report.type]}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {report.createdBy} •{" "}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[report.status]}>
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Metrics Preview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {report.metrics.slice(0, 4).map((metric, index) => (
                      <div key={index} className="text-center">
                        <p className="text-sm text-gray-500">{metric.name}</p>
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-lg font-semibold text-gray-900">
                            {metric.value}
                            {metric.unit}
                          </span>
                          {getTrendIcon(metric.trend)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {metric.change > 0 ? "+" : ""}
                          {metric.change}%
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Last updated:{" "}
                      {new Date(report.updatedAt).toLocaleDateString()}
                    </span>
                    <span>
                      {report.metrics.length} metrics •{" "}
                      {report.visualizations.length} visualizations
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {insights.map((insight) => (
              <Card
                key={insight.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(insight.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {insight.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={severityColors[insight.severity]}>
                            {insight.severity}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">
                            {insight.type}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Metric: {insight.metric}</span>
                          <span>Value: {insight.value}</span>
                          <span>
                            Change: {insight.change > 0 ? "+" : ""}
                            {insight.change}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {new Date(insight.timestamp).toLocaleDateString()}
                          </span>
                          {insight.actionable && (
                            <Button variant="outline" size="sm">
                              <Activity className="h-4 w-4 mr-2" />
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {reports
              .filter((r) => r.status === "scheduled")
              .map((report) => (
                <Card
                  key={report.id}
                  className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {report.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {report.schedule?.frequency}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Frequency</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {report.schedule?.frequency}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold text-gray-900">
                          {report.schedule?.time}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Recipients</p>
                        <p className="font-semibold text-gray-900">
                          {report.schedule?.recipients.length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Next Run</p>
                        <p className="font-semibold text-gray-900">
                          {report.nextRun
                            ? new Date(report.nextRun).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card
                key={template.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {template.icon}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Frequency</span>
                      <span className="text-sm font-medium text-gray-900">
                        {template.frequency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Metrics</span>
                      <span className="text-sm font-medium text-gray-900">
                        {template.metrics.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recipients</span>
                      <span className="text-sm font-medium text-gray-900">
                        {template.recipients.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


