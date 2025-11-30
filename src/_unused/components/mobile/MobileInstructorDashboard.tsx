"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  Clock,
  Award,
  Target,
  TrendingUp,
  Calendar,
  Play,
  ChevronRight,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
} from "lucide-react";
import {
  MobileStatsWidget,
  MobileProgressWidget,
  MobileQuickAction,
  MobileActivityItem,
  MobileShortcutGrid,
  MobileFloatingActionButton,
} from "./MobileWidgets";
import SwipeGestureHandler from "./SwipeGestureHandler";
import { makeAuthenticatedRequest } from "@/lib/token-utils";
import { getCurrentBreakpoint } from "@/lib/mobile-utils";

interface MobileInstructorDashboardProps {
  user: any;
  courses: any[];
  students: any[];
  assignments: any[];
  analytics: any;
  pendingTasks: any[];
  onCreateCourse: () => void;
  onViewCourse: (courseId: string) => void;
  onGradeAssignment: (assignmentId: string) => void;
  onViewStudents: () => void;
  onViewAnalytics: () => void;
}

export default function MobileInstructorDashboard({
  user,
  courses = [],
  students = [],
  assignments = [],
  analytics,
  pendingTasks = [],
  onCreateCourse,
  onViewCourse,
  onGradeAssignment,
  onViewStudents,
  onViewAnalytics,
}: MobileInstructorDashboardProps) {
  const [currentWidgetIndex, setCurrentWidgetIndex] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    fetchRecentActivity();

    // Check for compact mode based on screen size
    const checkCompactMode = () => {
      const breakpoint = getCurrentBreakpoint();
      setCompactMode(
        breakpoint === "xs" || (breakpoint === "sm" && window.innerHeight < 700)
      );
    };

    checkCompactMode();
    window.addEventListener("resize", checkCompactMode);
    return () => window.removeEventListener("resize", checkCompactMode);
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      // Mock recent activity data for instructor
      const mockActivity = [
        {
          id: "1",
          title: "New Student Enrolled",
          description: "John Doe enrolled in Video Production Course",
          time: "1 hour ago",
          type: "student",
          status: "completed",
        },
        {
          id: "2",
          title: "Assignment Submitted",
          description: "Photography Portfolio - 5 new submissions",
          time: "2 hours ago",
          type: "assignment",
          status: "pending",
        },
        {
          id: "3",
          title: "Course Milestone",
          description: "Digital Marketing course reached 100 students",
          time: "Yesterday",
          type: "achievement",
          status: "completed",
        },
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeStats = (direction: "left" | "right") => {
    const statsCount = 4; // Number of stat widgets
    if (direction === "left" && currentWidgetIndex < statsCount - 1) {
      setCurrentWidgetIndex(currentWidgetIndex + 1);
    } else if (direction === "right" && currentWidgetIndex > 0) {
      setCurrentWidgetIndex(currentWidgetIndex - 1);
    }
  };

  const activeCourses = courses.filter((c) => c.status === "ACTIVE").length;
  const totalStudents = students.length;
  const pendingGrading = assignments.filter(
    (a) => a.status === "SUBMITTED"
  ).length;
  const completionRate = analytics?.averageCompletionRate || 0;

  const statsWidgets = [
    {
      title: "Active Courses",
      value: activeCourses,
      change: "+1",
      trend: "up" as const,
      icon: BookOpen,
      color: "blue" as const,
      subtitle: "Currently teaching",
      onClick: () => onViewCourse(""),
    },
    {
      title: "Total Students",
      value: totalStudents,
      change: "+12",
      trend: "up" as const,
      icon: Users,
      color: "green" as const,
      subtitle: "Enrolled students",
      onClick: onViewStudents,
    },
    {
      title: "Pending Grading",
      value: pendingGrading,
      change: "+3",
      trend: "up" as const,
      icon: Clock,
      color: "orange" as const,
      subtitle: "Assignments to grade",
      onClick: () => onGradeAssignment(""),
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      change: "+5%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "purple" as const,
      subtitle: "Average completion",
      onClick: onViewAnalytics,
    },
  ];

  const quickActions = [
    {
      title: "Create Course",
      description: "Start building a new course",
      icon: Plus,
      color: "blue" as const,
      onClick: onCreateCourse,
    },
    {
      title: "Grade Assignments",
      description: "Review student submissions",
      icon: Edit,
      color: "orange" as const,
      onClick: () => onGradeAssignment(""),
      badge: pendingGrading > 0 ? pendingGrading : undefined,
    },
    {
      title: "View Students",
      description: "Manage student progress",
      icon: Users,
      color: "green" as const,
      onClick: onViewStudents,
      badge: totalStudents,
    },
    {
      title: "Analytics",
      description: "View course performance",
      icon: BarChart3,
      color: "purple" as const,
      onClick: onViewAnalytics,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "I"}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "Instructor"}!
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to inspire and educate your students?
              </p>
              {pendingTasks.length > 0 && (
                <div className="flex items-center space-x-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">
                    {pendingTasks.length} pending tasks
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Widgets - Swipeable */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Your Impact</h2>
          <div className="flex space-x-1">
            {statsWidgets.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentWidgetIndex ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <SwipeGestureHandler
          onSwipeLeft={() => handleSwipeStats("left")}
          onSwipeRight={() => handleSwipeStats("right")}
        >
          <div className="grid grid-cols-2 gap-4">
            {statsWidgets
              .slice(currentWidgetIndex, currentWidgetIndex + 2)
              .map((widget, index) => (
                <MobileStatsWidget
                  key={currentWidgetIndex + index}
                  {...widget}
                />
              ))}
          </div>
        </SwipeGestureHandler>
      </div>

      {/* Mobile Shortcuts */}
      {showShortcuts && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Quick Access</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(false)}
              className="text-gray-500"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <MobileShortcutGrid
            shortcuts={[
              {
                id: "create-course",
                title: "Create Course",
                icon: Plus,
                color: "from-blue-500 to-blue-600",
                onClick: onCreateCourse,
              },
              {
                id: "grade-assignments",
                title: "Grade Work",
                icon: Edit,
                color: "from-orange-500 to-orange-600",
                count: pendingGrading,
                onClick: () => onGradeAssignment(""),
              },
              {
                id: "view-students",
                title: "Students",
                icon: Users,
                color: "from-green-500 to-green-600",
                count: totalStudents,
                onClick: onViewStudents,
              },
              {
                id: "analytics",
                title: "Analytics",
                icon: BarChart3,
                color: "from-purple-500 to-purple-600",
                onClick: onViewAnalytics,
              },
            ]}
            columns={compactMode ? 2 : 4}
          />
        </div>
      )}

      {/* Quick Actions */}
      {!compactMode && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action, index) => (
              <MobileQuickAction key={index} {...action} />
            ))}
          </div>
        </div>
      )}

      {/* Course Overview */}
      {activeCourses > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Active Courses</h2>
          <div className="space-y-3">
            {courses
              .filter((c) => c.status === "ACTIVE")
              .slice(0, 3)
              .map((course) => (
                <Card
                  key={course.id}
                  className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => onViewCourse(course.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{course.enrolledCount || 0} students</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{course.rating || 0}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        <Card className="bg-white shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity) => (
                  <MobileActivityItem
                    key={activity.id}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    type={activity.type}
                    status={activity.status}
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button for Create Course */}
      <MobileFloatingActionButton
        icon={Plus}
        onClick={onCreateCourse}
        color="from-indigo-500 to-purple-600"
        size="md"
        position="bottom-right"
      />
    </div>
  );
}
