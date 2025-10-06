"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface QuickStats {
  totalCourses: number;
  activeStudents: number;
  pendingAssessments: number;
  recentAnnouncements: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type:
    | "COURSE_CREATED"
    | "STUDENT_ENROLLED"
    | "ASSESSMENT_SUBMITTED"
    | "ANNOUNCEMENT_SENT";
  title: string;
  description: string;
  timestamp: string;
  courseId?: string;
  studentId?: string;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  type: "ASSESSMENT_DUE" | "COURSE_DEADLINE" | "LIVE_SESSION";
  dueDate: string;
  courseId: string;
  courseTitle: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export default function OverviewWidget() {
  const [stats, setStats] = useState<QuickStats>({
    totalCourses: 0,
    activeStudents: 0,
    pendingAssessments: 0,
    recentAnnouncements: 0,
    completionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<
    UpcomingDeadline[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const [statsRes, activityRes, deadlinesRes] = await Promise.all([
        makeAuthenticatedRequest("/api/instructor/stats"),
        makeAuthenticatedRequest("/api/instructor/activity"),
        makeAuthenticatedRequest("/api/instructor/deadlines"),
      ]);

      const [statsData, activityData, deadlinesData] = await Promise.all([
        statsRes.json(),
        activityRes.json(),
        deadlinesRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (activityData.success) setRecentActivity(activityData.data);
      if (deadlinesData.success) setUpcomingDeadlines(deadlinesData.data);
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "COURSE_CREATED":
        return "📚";
      case "STUDENT_ENROLLED":
        return "👥";
      case "ASSESSMENT_SUBMITTED":
        return "📝";
      case "ANNOUNCEMENT_SENT":
        return "📢";
      default:
        return "📄";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800">
              Total Courses
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📚</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {stats.totalCourses}
            </div>
            <p className="text-sm text-blue-700 font-medium">
              {stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-800">
              Active Students
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👥</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {stats.activeStudents}
            </div>
            <p className="text-sm text-green-700 font-medium">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-orange-800">
              Pending Assessments
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {stats.pendingAssessments}
            </div>
            <p className="text-sm text-orange-700 font-medium">
              Awaiting grading
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span>📈</span>
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest updates from your courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <span className="text-lg">
                    {getActivityIcon(activity.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming deadlines
              </p>
            ) : (
              upcomingDeadlines.slice(0, 5).map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {deadline.courseTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(deadline.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(deadline.priority)}>
                    {deadline.priority}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
