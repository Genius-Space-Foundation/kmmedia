"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  FileText,
  Users,
  BookOpen,
  Target,
  Award,
  Clock,
  Eye,
  Share2,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface ReportData {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  period: string;
  status: string;
  size: string;
  format: string;
}

interface AnalyticsData {
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  completionRate: number;
  engagementRate: number;
  retentionRate: number;
  growthRate: number;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  filters: Record<string, any>;
  schedule: string;
  recipients: string[];
  lastGenerated: string;
  isActive: boolean;
}

export default function AdvancedReporting() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchReportingData();
  }, [dateRange]);

  const fetchReportingData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      setLoading(true);

      // Fetch analytics data
      const analyticsResponse = await makeAuthenticatedRequest(
        "/api/instructor/analytics/overview"
      );
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      // Fetch reports
      const reportsResponse = await makeAuthenticatedRequest(
        "/api/instructor/reports"
      );
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
      }

      // Fetch custom reports
      const customReportsResponse = await makeAuthenticatedRequest(
        "/api/instructor/reports/custom"
      );
      if (customReportsResponse.ok) {
        const customReportsData = await customReportsResponse.json();
        setCustomReports(customReportsData);
      }
    } catch (error) {
      console.error("Error fetching reporting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/instructor/reports/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, dateRange, metrics: selectedMetrics }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-report-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const handleExportData = async (format: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/instructor/export/${format}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dateRange, metrics: selectedMetrics }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-export-${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const toggleReportExpansion = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const availableMetrics = [
    { id: "students", label: "Student Metrics", icon: Users },
    { id: "courses", label: "Course Performance", icon: BookOpen },
    { id: "engagement", label: "Engagement", icon: Target },
    { id: "completion", label: "Completion Rates", icon: Award },
    { id: "retention", label: "Retention", icon: Clock },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Advanced Reporting
          </h2>
          <p className="text-gray-600">
            Comprehensive analytics and custom reporting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={fetchReportingData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold">
                  {analytics?.totalStudents || 0}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold">
                  {analytics?.completionRate || 0}%
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5% from last month
                </p>
              </div>
              <Award className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-3xl font-bold">
                  {analytics?.engagementRate || 0}%
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +3% from last month
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Metrics to Include</Label>
                <div className="space-y-2 mt-2">
                  {availableMetrics.map((metric) => (
                    <label
                      key={metric.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics([...selectedMetrics, metric.id]);
                          } else {
                            setSelectedMetrics(
                              selectedMetrics.filter((m) => m !== metric.id)
                            );
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{metric.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Export Format</Label>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("pdf")}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("excel")}
                  >
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("csv")}
                  >
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
              <CardDescription>
                Generate common reports instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => handleGenerateReport("student-performance")}
                >
                  <Users className="h-8 w-8" />
                  <span>Student Performance</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => handleGenerateReport("course-analytics")}
                >
                  <BookOpen className="h-8 w-8" />
                  <span>Course Analytics</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => handleGenerateReport("engagement-analysis")}
                >
                  <Target className="h-8 w-8" />
                  <span>Engagement Analysis</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => handleGenerateReport("completion-summary")}
                >
                  <Award className="h-8 w-8" />
                  <span>Completion Summary</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => handleGenerateReport("comprehensive")}
                >
                  <BarChart3 className="h-8 w-8" />
                  <span>Comprehensive Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                View and download previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{report.title}</h3>
                          <Badge variant="secondary">{report.type}</Badge>
                          <Badge
                            variant={
                              report.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Generated:{" "}
                          {new Date(report.generatedAt).toLocaleDateString()} •
                          Period: {report.period} • Size: {report.size} •
                          Format: {report.format}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReportExpansion(report.id)}
                        >
                          {expandedReports.has(report.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedReports.has(report.id) && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Report Type</p>
                            <p className="text-gray-600">{report.type}</p>
                          </div>
                          <div>
                            <p className="font-medium">Generated</p>
                            <p className="text-gray-600">
                              {new Date(report.generatedAt).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Period</p>
                            <p className="text-gray-600">{report.period}</p>
                          </div>
                          <div>
                            <p className="font-medium">Size</p>
                            <p className="text-gray-600">{report.size}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Reports</CardTitle>
                  <CardDescription>
                    Create and manage custom report templates
                  </CardDescription>
                </div>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Custom Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{report.name}</h3>
                          <Badge
                            variant={report.isActive ? "default" : "secondary"}
                          >
                            {report.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {report.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Last generated:{" "}
                          {new Date(report.lastGenerated).toLocaleDateString()}{" "}
                          • Schedule: {report.schedule}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export your data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => handleExportData("pdf")}
                >
                  <FileText className="h-8 w-8" />
                  <span>Export as PDF</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => handleExportData("excel")}
                >
                  <BarChart3 className="h-8 w-8" />
                  <span>Export as Excel</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center space-y-2"
                  onClick={() => handleExportData("csv")}
                >
                  <Download className="h-8 w-8" />
                  <span>Export as CSV</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
