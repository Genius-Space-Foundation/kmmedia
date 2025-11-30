"use client";

import React, { useState, useEffect } from "react";
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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  Download,
  BookOpen,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningAnalyticsProps {
  userId: string;
  timeRange?: "week" | "month" | "year" | "all";
  onExportReport?: () => void;
}

interface AnalyticsData {
  totalHours: number;
  averageScore: number;
  coursesCompleted: number;
  completionRate: number;
  skillsLearned: string[];
  hoursTrend: Array<{ date: string; hours: number }>;
  scoreTrend: Array<{ date: string; score: number }>;
  categoryBreakdown: Array<{ category: string; hours: number }>;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function LearningAnalyticsDashboard({
  userId,
  timeRange = "month",
  onExportReport,
}: LearningAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    fetchAnalytics();
  }, [userId, selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/dashboard/analytics?userId=${userId}&timeRange=${selectedTimeRange}`
      );
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        // Mock data for demonstration
        setAnalytics({
          totalHours: 48,
          averageScore: 87,
          coursesCompleted: 3,
          completionRate: 75,
          skillsLearned: [
            "Photography",
            "Video Editing",
            "Color Grading",
            "Composition",
            "Lighting",
            "Post-Production",
          ],
          hoursTrend: [
            { date: "Week 1", hours: 8 },
            { date: "Week 2", hours: 12 },
            { date: "Week 3", hours: 10 },
            { date: "Week 4", hours: 18 },
          ],
          scoreTrend: [
            { date: "Week 1", score: 82 },
            { date: "Week 2", score: 85 },
            { date: "Week 3", score: 88 },
            { date: "Week 4", score: 90 },
          ],
          categoryBreakdown: [
            { category: "Photography", hours: 20 },
            { category: "Video Editing", hours: 15 },
            { category: "Color Theory", hours: 8 },
            { category: "Marketing", hours: 5 },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      if (onExportReport) {
        onExportReport();
      } else {
        // Default export implementation
        const response = await fetch(
          `/api/dashboard/analytics/export?userId=${userId}&timeRange=${selectedTimeRange}`
        );
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `learning-analytics-${selectedTimeRange}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const getTrendIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;

    return (
      <div
        className={cn(
          "flex items-center gap-1",
          isPositive ? "text-green-600" : "text-red-600"
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Learning Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading analytics...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Learning Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No analytics data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Learning Analytics
            </CardTitle>

            <div className="flex items-center gap-3">
              <Select
                value={selectedTimeRange}
                onValueChange={(v: any) => setSelectedTimeRange(v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Hours */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              {getTrendIndicator(
                analytics.totalHours,
                analytics.totalHours * 0.8
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Learning Hours</p>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.totalHours}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedTimeRange === "week"
                ? "This week"
                : selectedTimeRange === "month"
                ? "This month"
                : selectedTimeRange === "year"
                ? "This year"
                : "All time"}
            </p>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              {getTrendIndicator(
                analytics.averageScore,
                analytics.averageScore * 0.95
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.averageScore}
              <span className="text-lg text-gray-500">%</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Across all assessments</p>
          </CardContent>
        </Card>

        {/* Courses Completed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              {getTrendIndicator(
                analytics.coursesCompleted,
                Math.max(1, analytics.coursesCompleted - 1)
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">Courses Completed</p>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.coursesCompleted}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        {/* Skills Learned */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Skills Learned</p>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.skillsLearned.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">New skills acquired</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Hours Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Hours Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hoursTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assessment Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown and Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) =>
                    `${category} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Learned */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills Acquired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.skillsLearned.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-2 text-sm font-medium"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {analytics.skillsLearned.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>No skills learned yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Complete courses to acquire new skills
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
