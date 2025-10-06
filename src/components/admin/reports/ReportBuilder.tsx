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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Calendar,
  Filter,
  Save,
  Eye,
  Edit,
  Trash2,
  Share,
  Clock,
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "financial" | "user" | "course" | "performance" | "custom";
  type: "chart" | "table" | "dashboard" | "summary";
  dataSource: string;
  fields: string[];
  filters: ReportFilter[];
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    time: string;
    recipients: string[];
  };
  createdAt: string;
  lastRun?: string;
  isPublic: boolean;
}

interface ReportFilter {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "between";
  value: any;
  label: string;
}

interface ReportData {
  id: string;
  name: string;
  data: any[];
  chartType?: string;
  generatedAt: string;
  status: "completed" | "generating" | "failed";
}

const reportCategories = [
  {
    value: "financial",
    label: "Financial",
    icon: BarChart3,
    color: "text-green-600",
  },
  {
    value: "user",
    label: "User Analytics",
    icon: PieChart,
    color: "text-blue-600",
  },
  {
    value: "course",
    label: "Course Performance",
    icon: LineChart,
    color: "text-purple-600",
  },
  {
    value: "performance",
    label: "System Performance",
    icon: Table,
    color: "text-orange-600",
  },
  {
    value: "custom",
    label: "Custom Reports",
    icon: FileText,
    color: "text-gray-600",
  },
];

const chartTypes = [
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "pie", label: "Pie Chart", icon: PieChart },
  { value: "table", label: "Data Table", icon: Table },
];

const dataSources = [
  {
    value: "users",
    label: "Users",
    description: "User registration and activity data",
  },
  {
    value: "courses",
    label: "Courses",
    description: "Course performance and enrollment data",
  },
  {
    value: "payments",
    label: "Payments",
    description: "Payment and revenue data",
  },
  {
    value: "applications",
    label: "Applications",
    description: "Application and enrollment data",
  },
  {
    value: "analytics",
    label: "Analytics",
    description: "Platform analytics and metrics",
  },
];

export default function ReportBuilder() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("templates");
  const [isCreating, setIsCreating] = useState(false);
  const [newReport, setNewReport] = useState<Partial<ReportTemplate>>({
    name: "",
    description: "",
    category: "custom",
    type: "chart",
    dataSource: "users",
    fields: [],
    filters: [],
    isPublic: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API calls
      const mockTemplates: ReportTemplate[] = [
        {
          id: "1",
          name: "Monthly Revenue Report",
          description: "Comprehensive monthly revenue analysis with trends",
          category: "financial",
          type: "chart",
          dataSource: "payments",
          fields: ["amount", "date", "status", "type"],
          filters: [
            {
              field: "date",
              operator: "between",
              value: { start: "2024-01-01", end: "2024-01-31" },
              label: "Date Range",
            },
            {
              field: "status",
              operator: "equals",
              value: "COMPLETED",
              label: "Status",
            },
          ],
          schedule: {
            frequency: "monthly",
            time: "09:00",
            recipients: ["admin@example.com"],
          },
          createdAt: "2024-01-15T10:00:00Z",
          lastRun: "2024-01-20T09:00:00Z",
          isPublic: true,
        },
        {
          id: "2",
          name: "User Growth Analysis",
          description: "User registration trends and growth patterns",
          category: "user",
          type: "dashboard",
          dataSource: "users",
          fields: ["createdAt", "role", "status", "lastLogin"],
          filters: [
            {
              field: "role",
              operator: "equals",
              value: "STUDENT",
              label: "User Role",
            },
          ],
          createdAt: "2024-01-10T14:30:00Z",
          isPublic: false,
        },
        {
          id: "3",
          name: "Course Performance Metrics",
          description: "Course completion rates and student engagement",
          category: "course",
          type: "table",
          dataSource: "courses",
          fields: ["title", "enrollments", "completionRate", "rating"],
          filters: [],
          createdAt: "2024-01-08T11:15:00Z",
          lastRun: "2024-01-19T08:00:00Z",
          isPublic: true,
        },
      ];

      const mockReports: ReportData[] = [
        {
          id: "1",
          name: "Revenue Report - January 2024",
          data: [],
          chartType: "line",
          generatedAt: "2024-01-20T09:00:00Z",
          status: "completed",
        },
        {
          id: "2",
          name: "User Growth - Q1 2024",
          data: [],
          chartType: "bar",
          generatedAt: "2024-01-19T14:30:00Z",
          status: "completed",
        },
        {
          id: "3",
          name: "Course Analytics - Weekly",
          data: [],
          chartType: "pie",
          generatedAt: "2024-01-18T16:45:00Z",
          status: "generating",
        },
      ];

      setTemplates(mockTemplates);
      setReports(mockReports);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    try {
      // Implement actual report creation
      console.log("Creating report:", newReport);
      setIsCreating(false);
      setNewReport({
        name: "",
        description: "",
        category: "custom",
        type: "chart",
        dataSource: "users",
        fields: [],
        filters: [],
        isPublic: false,
      });
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const generateReport = async (templateId: string) => {
    try {
      console.log(`Generating report for template ${templateId}`);
      // Implement actual report generation
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      setTemplates((prev) =>
        prev.filter((template) => template.id !== templateId)
      );
      console.log(`Deleted template ${templateId}`);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const getCategoryConfig = (category: string) => {
    return (
      reportCategories.find((cat) => cat.value === category) ||
      reportCategories[4]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "generating":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-2xl font-bold text-gray-900">Report Builder</h1>
          <p className="text-gray-600">
            Create and manage comprehensive reports and analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    value={newReport.name || ""}
                    onChange={(e) =>
                      setNewReport((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <Label htmlFor="report-description">Description</Label>
                  <Textarea
                    id="report-description"
                    value={newReport.description || ""}
                    onChange={(e) =>
                      setNewReport((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter report description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="report-category">Category</Label>
                    <Select
                      value={newReport.category}
                      onValueChange={(value) =>
                        setNewReport((prev) => ({
                          ...prev,
                          category: value as any,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="report-type">Type</Label>
                    <Select
                      value={newReport.type}
                      onValueChange={(value) =>
                        setNewReport((prev) => ({
                          ...prev,
                          type: value as any,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chartTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="report-datasource">Data Source</Label>
                  <Select
                    value={newReport.dataSource}
                    onValueChange={(value) =>
                      setNewReport((prev) => ({ ...prev, dataSource: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          <div>
                            <div className="font-medium">{source.label}</div>
                            <div className="text-sm text-gray-500">
                              {source.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public-report"
                    checked={newReport.isPublic}
                    onCheckedChange={(checked) =>
                      setNewReport((prev) => ({ ...prev, isPublic: !!checked }))
                    }
                  />
                  <Label htmlFor="public-report">Make this report public</Label>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createReport}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Templates
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.length}
                </p>
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
                  Generated Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Scheduled Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter((t) => t.schedule).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Public Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter((t) => t.isPublic).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Share className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Management */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templates.map((template) => {
            const categoryConfig = getCategoryConfig(template.category);
            const CategoryIcon = categoryConfig.icon;

            return (
              <Card
                key={template.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryConfig.color
                          .replace("text-", "bg-")
                          .replace("-600", "-100")}`}
                      >
                        <CategoryIcon
                          className={`h-6 w-6 ${categoryConfig.color}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {template.name}
                          </h3>
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge variant="secondary">{template.type}</Badge>
                          {template.isPublic && (
                            <Badge className="bg-green-100 text-green-800">
                              Public
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Data Source: {template.dataSource}</span>
                          <span>Fields: {template.fields.length}</span>
                          <span>
                            Created:{" "}
                            {new Date(template.createdAt).toLocaleDateString()}
                          </span>
                          {template.lastRun && (
                            <span>
                              Last Run:{" "}
                              {new Date(template.lastRun).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateReport(template.id)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Generated:{" "}
                          {new Date(report.generatedAt).toLocaleString()}
                        </span>
                        <span>Type: {report.chartType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {templates
            .filter((t) => t.schedule)
            .map((template) => (
              <Card
                key={template.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {template.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Frequency: {template.schedule?.frequency}</span>
                          <span>Time: {template.schedule?.time}</span>
                          <span>
                            Recipients: {template.schedule?.recipients.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}


