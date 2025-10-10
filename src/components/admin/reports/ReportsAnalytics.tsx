"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Calendar as CalendarIcon,
  Filter,
  PieChart,
  LineChart,
} from "lucide-react";
import { format } from "date-fns";

interface ReportData {
  totalRevenue: number;
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  revenueGrowth: number;
  userGrowth: number;
  courseGrowth: number;
  enrollmentGrowth: number;
}

export default function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [reportType, setReportType] = useState<string>("overview");
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  const [loading, setLoading] = useState(false);

  const reportData: ReportData = {
    totalRevenue: 485000,
    totalUsers: 1245,
    totalCourses: 45,
    totalEnrollments: 3567,
    revenueGrowth: 12.5,
    userGrowth: 8.3,
    courseGrowth: 5.7,
    enrollmentGrowth: 15.2,
  };

  const handleExportReport = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual export functionality
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Report exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // TODO: Implement report generation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Reports & Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Generate comprehensive reports and analyze system performance
          </p>
        </div>
        <Button onClick={handleExportReport} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="users">User Analytics</SelectItem>
                  <SelectItem value="courses">Course Performance</SelectItem>
                  <SelectItem value="enrollments">Enrollment Report</SelectItem>
                  <SelectItem value="applications">
                    Application Report
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, "PP")} -{" "}
                    {format(dateRange.to, "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range: any) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                className="w-full"
                disabled={loading}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  GH₵{reportData.totalRevenue.toLocaleString()}
                </p>
                <Badge
                  variant="outline"
                  className="mt-1 bg-green-100 text-green-800"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {reportData.revenueGrowth}%
                </Badge>
              </div>
              <DollarSign className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">
                  {reportData.totalUsers.toLocaleString()}
                </p>
                <Badge
                  variant="outline"
                  className="mt-1 bg-blue-100 text-blue-800"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {reportData.userGrowth}%
                </Badge>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">
                  {reportData.totalCourses.toLocaleString()}
                </p>
                <Badge
                  variant="outline"
                  className="mt-1 bg-purple-100 text-purple-800"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {reportData.courseGrowth}%
                </Badge>
              </div>
              <BookOpen className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold">
                  {reportData.totalEnrollments.toLocaleString()}
                </p>
                <Badge
                  variant="outline"
                  className="mt-1 bg-orange-100 text-orange-800"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {reportData.enrollmentGrowth}%
                </Badge>
              </div>
              <FileText className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Revenue chart visualization</p>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">User growth chart visualization</p>
            </div>
          </CardContent>
        </Card>

        {/* Course Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Course Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Course distribution chart</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Film Production Fundamentals",
                  enrollments: 245,
                  revenue: 122500,
                },
                {
                  name: "Video Editing Mastery",
                  enrollments: 198,
                  revenue: 99000,
                },
                {
                  name: "Cinematography Techniques",
                  enrollments: 176,
                  revenue: 88000,
                },
                {
                  name: "Sound Design for Film",
                  enrollments: 145,
                  revenue: 72500,
                },
              ].map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-gray-600">
                      {course.enrollments} enrollments
                    </p>
                  </div>
                  <p className="font-bold text-green-600">
                    GH₵{course.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4">
              <FileText className="h-8 w-8 mb-2" />
              <span>Monthly Report</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <DollarSign className="h-8 w-8 mb-2" />
              <span>Financial Summary</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <Users className="h-8 w-8 mb-2" />
              <span>User Activity</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <BookOpen className="h-8 w-8 mb-2" />
              <span>Course Performance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
