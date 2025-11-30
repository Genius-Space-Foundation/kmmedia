"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
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
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  description: string;
  type: "dashboard" | "analytics" | "financial" | "operational" | "custom";
  status: "draft" | "published" | "scheduled";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  schedule?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly";
    time: string;
    recipients: string[];
  };
  data: {
    metrics: string[];
    dateRange: {
      start: string;
      end: string;
    };
    filters: Record<string, any>;
    visualizations: {
      type: "chart" | "table" | "metric";
      config: any;
    }[];
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
}

interface ReportData {
  metric: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  period: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "1",
    name: "Executive Summary",
    description: "High-level overview of key business metrics",
    category: "Executive",
    icon: <BarChart3 className="h-4 w-4" />,
    metrics: [
      "total_revenue",
      "user_growth",
      "course_completions",
      "satisfaction_score",
    ],
    visualizations: ["metric_cards", "trend_chart", "kpi_table"],
  },
  {
    id: "2",
    name: "Financial Report",
    description: "Detailed financial performance and revenue analysis",
    category: "Financial",
    icon: <DollarSign className="h-4 w-4" />,
    metrics: ["revenue", "payments", "refunds", "profit_margin"],
    visualizations: ["revenue_chart", "payment_breakdown", "financial_table"],
  },
  {
    id: "3",
    name: "User Analytics",
    description: "User behavior, engagement, and growth metrics",
    category: "Analytics",
    icon: <Users className="h-4 w-4" />,
    metrics: [
      "active_users",
      "user_retention",
      "engagement_rate",
      "conversion_rate",
    ],
    visualizations: [
      "user_growth_chart",
      "retention_curve",
      "engagement_heatmap",
    ],
  },
  {
    id: "4",
    name: "Course Performance",
    description: "Course completion rates, ratings, and feedback analysis",
    category: "Operational",
    icon: <BookOpen className="h-4 w-4" />,
    metrics: [
      "course_completions",
      "average_rating",
      "completion_rate",
      "feedback_score",
    ],
    visualizations: [
      "completion_chart",
      "rating_distribution",
      "feedback_analysis",
    ],
  },
  {
    id: "5",
    name: "Payment Analysis",
    description: "Payment processing, success rates, and transaction analysis",
    category: "Financial",
    icon: <CreditCard className="h-4 w-4" />,
    metrics: [
      "payment_success_rate",
      "transaction_volume",
      "refund_rate",
      "processing_time",
    ],
    visualizations: ["payment_flow", "success_rate_chart", "transaction_table"],
  },
];

const statusColors = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
};

const typeIcons = {
  dashboard: <BarChart3 className="h-4 w-4" />,
  analytics: <PieChart className="h-4 w-4" />,
  financial: <DollarSign className="h-4 w-4" />,
  operational: <Activity className="h-4 w-4" />,
  custom: <FileText className="h-4 w-4" />,
};

export default function ReportBuilder() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [newReport, setNewReport] = useState<Partial<Report>>({
    name: "",
    description: "",
    type: "custom",
    data: {
      metrics: [],
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
      filters: {},
      visualizations: [],
    },
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
    fetchReportData();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Mock reports data
      const mockReports: Report[] = [
        {
          id: "1",
          name: "Monthly Executive Summary",
          description:
            "Comprehensive overview of business performance for the month",
          type: "dashboard",
          status: "published",
          createdAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdBy: "Admin User",
          schedule: {
            frequency: "monthly",
            time: "09:00",
            recipients: ["admin@kmmedia.com", "ceo@kmmedia.com"],
          },
          data: {
            metrics: ["total_revenue", "user_growth", "course_completions"],
            dateRange: {
              start: "2024-01-01",
              end: "2024-01-31",
            },
            filters: {},
            visualizations: [
              { type: "metric", config: { metric: "total_revenue" } },
              {
                type: "chart",
                config: { type: "line", metric: "user_growth" },
              },
            ],
          },
        },
        {
          id: "2",
          name: "Weekly User Analytics",
          description: "User engagement and behavior analysis",
          type: "analytics",
          status: "scheduled",
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdBy: "Analytics Team",
          schedule: {
            frequency: "weekly",
            time: "08:00",
            recipients: ["analytics@kmmedia.com"],
          },
          data: {
            metrics: ["active_users", "engagement_rate", "conversion_rate"],
            dateRange: {
              start: "2024-01-15",
              end: "2024-01-21",
            },
            filters: {},
            visualizations: [
              {
                type: "chart",
                config: { type: "bar", metric: "active_users" },
              },
              {
                type: "table",
                config: { metrics: ["engagement_rate", "conversion_rate"] },
              },
            ],
          },
        },
        {
          id: "3",
          name: "Course Performance Report",
          description: "Detailed analysis of course completion and feedback",
          type: "operational",
          status: "draft",
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdBy: "Course Manager",
          data: {
            metrics: [
              "course_completions",
              "average_rating",
              "completion_rate",
            ],
            dateRange: {
              start: "2024-01-01",
              end: "2024-01-31",
            },
            filters: {},
            visualizations: [
              {
                type: "chart",
                config: { type: "pie", metric: "course_completions" },
              },
              { type: "metric", config: { metric: "average_rating" } },
            ],
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

  const fetchReportData = async () => {
    try {
      // Mock report data
      const mockData: ReportData[] = [
        {
          metric: "total_revenue",
          value: 125000,
          change: 12.5,
          trend: "up",
          period: "month",
        },
        {
          metric: "user_growth",
          value: 1250,
          change: 8.3,
          trend: "up",
          period: "month",
        },
        {
          metric: "course_completions",
          value: 89,
          change: -2.1,
          trend: "down",
          period: "month",
        },
        {
          metric: "satisfaction_score",
          value: 4.7,
          change: 0.3,
          trend: "up",
          period: "month",
        },
      ];

      setReportData(mockData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const createReport = async () => {
    try {
      const report: Report = {
        id: Date.now().toString(),
        name: newReport.name || "Untitled Report",
        description: newReport.description || "",
        type: newReport.type || "custom",
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "Current User",
        data: newReport.data || {
          metrics: [],
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            end: new Date().toISOString().split("T")[0],
          },
          filters: {},
          visualizations: [],
        },
      };

      setReports([...reports, report]);
      setShowCreateDialog(false);
      setNewReport({
        name: "",
        description: "",
        type: "custom",
        data: {
          metrics: [],
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            end: new Date().toISOString().split("T")[0],
          },
          filters: {},
          visualizations: [],
        },
      });
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      setReports(reports.filter((report) => report.id !== reportId));
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const publishReport = async (reportId: string) => {
    try {
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "published" as const,
                updatedAt: new Date().toISOString(),
              }
            : report
        )
      );
    } catch (error) {
      console.error("Error publishing report:", error);
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

  const getMetricValue = (metric: string) => {
    const data = reportData.find((d) => d.metric === metric);
    return data || { value: 0, change: 0, trend: "stable" as const };
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
          <h1 className="text-2xl font-bold text-gray-900">Report Builder</h1>
          <p className="text-gray-600">
            Create, manage, and schedule comprehensive reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Choose a template or create a custom report from scratch.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    value={newReport.name}
                    onChange={(e) =>
                      setNewReport({ ...newReport, name: e.target.value })
                    }
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <Label htmlFor="report-description">Description</Label>
                  <Textarea
                    id="report-description"
                    value={newReport.description}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter report description"
                  />
                </div>
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select
                    value={newReport.type}
                    onValueChange={(value) =>
                      setNewReport({ ...newReport, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newReport.data?.dateRange.start}
                        onChange={(e) =>
                          setNewReport({
                            ...newReport,
                            data: {
                              ...newReport.data!,
                              dateRange: {
                                ...newReport.data!.dateRange,
                                start: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newReport.data?.dateRange.end}
                        onChange={(e) =>
                          setNewReport({
                            ...newReport,
                            data: {
                              ...newReport.data!,
                              dateRange: {
                                ...newReport.data!.dateRange,
                                end: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createReport}>Create Report</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Report Templates */}
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setNewReport({
                    ...newReport,
                    name: template.name,
                    description: template.description,
                    type: template.category.toLowerCase() as any,
                  });
                  setShowCreateDialog(true);
                }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {template.icon}
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {template.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {template.metrics.length} metrics
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">
                      Scheduled
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {reports.filter((r) => r.status === "draft").length}
                    </p>
                    <p className="text-xs text-gray-500">In progress</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Edit className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
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
                          {report.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created by {report.createdBy} •{" "}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {report.type}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Metrics</p>
                      <p className="font-semibold text-gray-900">
                        {report.data.metrics.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Date Range</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(
                          report.data.dateRange.start
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          report.data.dateRange.end
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {report.status === "draft" && (
                    <div className="mt-4 flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => publishReport(report.id)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                    </div>
                  )}
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
                        <p className="font-semibold text-gray-900">Tomorrow</p>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Metrics</span>
                      <span className="text-sm font-medium text-gray-900">
                        {template.metrics.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Visualizations
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {template.visualizations.length}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end space-x-2">
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


