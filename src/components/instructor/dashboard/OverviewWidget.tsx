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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react";
import AssignmentManagementWidget from "./AssignmentManagementWidget";
import PendingGradingNotifications from "./PendingGradingNotifications";
import AssignmentAnalyticsSummary from "./AssignmentAnalyticsSummary";

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
      const [statsRes, activityRes, deadlinesRes] = await Promise.all([
        fetch("/api/instructor/stats", { credentials: "include" }),
        fetch("/api/instructor/activity", { credentials: "include" }),
        fetch("/api/instructor/deadlines", { credentials: "include" }),
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
        return "bg-red-50 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      id: "new-course",
      label: "Create Course",
      icon: Plus,
      color: "bg-brand-primary hover:bg-brand-primary/90",
      href: "/instructor/courses/new",
    },
    {
      id: "new-assignment",
      label: "New Assignment",
      icon: FileText,
      color: "bg-success hover:bg-success/90",
      href: "/instructor/assignments/new",
    },
    {
      id: "send-announcement",
      label: "Send Announcement",
      icon: MessageSquare,
      color: "bg-info hover:bg-info/90",
      href: "/instructor/announcements/new",
    },
    {
      id: "schedule-session",
      label: "Schedule Session",
      icon: Calendar,
      color: "bg-warning hover:bg-warning/90",
      href: "/instructor/sessions/new",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Actions Panel */}
      <Card className="bg-white border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-neutral-900">
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <Button
                  className={`w-full h-24 flex flex-col items-center justify-center space-y-2 ${action.color} text-white transition-all duration-200`}
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AssignmentManagementWidget />
        <PendingGradingNotifications />
      </div>

      {/* Assignment Analytics */}
      <div className="grid grid-cols-1 gap-8">
        <AssignmentAnalyticsSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-white border-neutral-200 shadow-sm">
          <CardHeader className="bg-neutral-50 rounded-t-lg border-b border-neutral-200">
            <CardTitle className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription className="text-neutral-600">
              Latest updates from your courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">
                No recent activity
              </p>
            ) : (
              recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 pb-3 border-b border-neutral-100 last:border-0 last:pb-0"
                >
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="bg-white border-neutral-200 shadow-sm">
          <CardHeader className="bg-neutral-50 rounded-t-lg border-b border-neutral-200">
            <CardTitle className="text-xl font-bold text-neutral-900 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-brand-primary" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
            <CardDescription className="text-neutral-600">
              Important dates and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">
                No upcoming deadlines
              </p>
            ) : (
              upcomingDeadlines.slice(0, 5).map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {deadline.title}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {deadline.courseTitle}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
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

      {/* At-a-Glance Stats */}
      <Card className="bg-white border-neutral-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-neutral-900">
            Performance Overview
          </CardTitle>
          <CardDescription>Your teaching metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-brand-primary" />
              </div>
              <div className="text-3xl font-bold text-neutral-900">
                {stats.totalCourses}
              </div>
              <div className="text-sm text-neutral-600 mt-1">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-success" />
              </div>
              <div className="text-3xl font-bold text-neutral-900">
                {stats.activeStudents}
              </div>
              <div className="text-sm text-neutral-600 mt-1">Active Students</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-8 w-8 text-warning" />
              </div>
              <div className="text-3xl font-bold text-neutral-900">
                {stats.pendingAssessments}
              </div>
              <div className="text-sm text-neutral-600 mt-1">
                Pending Assessments
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-info" />
              </div>
              <div className="text-3xl font-bold text-neutral-900">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-neutral-600 mt-1">
                Completion Rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
