"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";


interface AssignmentAnalytics {
  totalAssignments: number;
  publishedAssignments: number;
  averageScore: number;
  completionRate: number;
  onTimeSubmissionRate: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingGrading: number;
  scoreDistribution: {
    excellent: number; // 90-100%
    good: number; // 80-89%
    satisfactory: number; // 70-79%
    needsImprovement: number; // <70%
  };
  recentTrends: {
    submissionTrend: "up" | "down" | "stable";
    scoreTrend: "up" | "down" | "stable";
    completionTrend: "up" | "down" | "stable";
  };
  topPerformingAssignments: Array<{
    id: string;
    title: string;
    averageScore: number;
    completionRate: number;
    submissionCount: number;
  }>;
  strugglingStudents: Array<{
    id: string;
    name: string;
    averageScore: number;
    missedAssignments: number;
    lateSubmissions: number;
  }>;
}

export default function AssignmentAnalyticsSummary() {
  const [analytics, setAnalytics] = useState<AssignmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d"); // 7d, 30d, 90d

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/assignments/analytics?timeRange=${timeRange}`
      );
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error("Error fetching assignment analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return "bg-green-100 text-green-800";
    if (rate >= 75) return "bg-blue-100 text-blue-800";
    if (rate >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Unable to load analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Assignment Analytics
            </CardTitle>
            <CardDescription>
              Performance insights and trends for your assignments
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Link href="/assignments/analytics">
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Avg Score
              </span>
              {getTrendIcon(analytics.recentTrends.scoreTrend)}
            </div>
            <p
              className={`text-2xl font-bold ${getScoreColor(
                analytics.averageScore
              )}`}
            >
              {analytics.averageScore.toFixed(1)}%
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">
                Completion
              </span>
              {getTrendIcon(analytics.recentTrends.completionTrend)}
            </div>
            <p className="text-2xl font-bold text-green-900">
              {analytics.completionRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-900">
                On Time
              </span>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {analytics.onTimeSubmissionRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">
                Pending
              </span>
              <AlertCircle className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {analytics.pendingGrading}
            </p>
          </div>
        </div>

        {/* Score Distribution */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Score Distribution
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Excellent (90-100%)</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (analytics.scoreDistribution.excellent /
                          analytics.totalSubmissions) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {analytics.scoreDistribution.excellent}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Good (80-89%)</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (analytics.scoreDistribution.good /
                          analytics.totalSubmissions) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {analytics.scoreDistribution.good}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Satisfactory (70-79%)
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (analytics.scoreDistribution.satisfactory /
                          analytics.totalSubmissions) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {analytics.scoreDistribution.satisfactory}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Needs Improvement (&lt;70%)
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (analytics.scoreDistribution.needsImprovement /
                          analytics.totalSubmissions) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {analytics.scoreDistribution.needsImprovement}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Assignments */}
        {analytics.topPerformingAssignments.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Top Performing Assignments
            </h4>
            <div className="space-y-2">
              {analytics.topPerformingAssignments
                .slice(0, 3)
                .map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {assignment.submissionCount} submissions
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge
                        className={getCompletionRateColor(
                          assignment.completionRate
                        )}
                      >
                        {assignment.completionRate.toFixed(0)}% complete
                      </Badge>
                      <span
                        className={`text-sm font-medium ${getScoreColor(
                          assignment.averageScore
                        )}`}
                      >
                        {assignment.averageScore.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Students Needing Attention */}
        {analytics.strugglingStudents.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students Needing Attention
            </h4>
            <div className="space-y-2">
              {analytics.strugglingStudents.slice(0, 3).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {student.name}
                    </p>
                    <p className="text-sm text-red-600">
                      {student.missedAssignments} missed,{" "}
                      {student.lateSubmissions} late
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-medium text-red-700">
                      {student.averageScore.toFixed(1)}% avg
                    </span>
                    <Link href={`/students/${student.id}`}>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Quick Actions
            </span>
            <div className="flex gap-2">
              <Link href="/assignments/analytics">
                <Button size="sm" variant="outline">
                  Full Report
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
              <Link href="/assignments/create">
                <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90">
                  New Assignment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
