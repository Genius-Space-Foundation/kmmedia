"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
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
} from "lucide-react";
import {
  MobileStatsWidget,
  MobileProgressWidget,
  MobileQuickAction,
  MobileActivityItem,
  MobileLearningStreak,
  MobileUpcomingDeadline,
  MobileShortcutGrid,
  MobileFloatingActionButton,
} from "./MobileWidgets";
import SwipeGestureHandler from "./SwipeGestureHandler";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface MobileStudentDashboardProps {
  user: any;
  enrollments: any[];
  applications: any[];
  courses: any[];
  upcomingDeadlines: any[];
  achievements: any[];
  learningStreak: any;
  learningStats: any;
  onContinueCourse: (courseId: string) => void;
  onViewDeadlines: () => void;
  onViewAchievements: () => void;
  onApplyForCourse: (courseId: string) => void;
}

export default function MobileStudentDashboard({
  user,
  enrollments = [],
  applications = [],
  courses = [],
  upcomingDeadlines = [],
  achievements = [],
  learningStreak,
  learningStats,
  onContinueCourse,
  onViewDeadlines,
  onViewAchievements,
  onApplyForCourse,
}: MobileStudentDashboardProps) {
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
      // Mock recent activity data
      const mockActivity = [
        {
          id: "1",
          title: "Completed Video Editing Lesson 3",
          description: "Advanced Color Grading Techniques",
          time: "2 hours ago",
          type: "course",
          status: "completed",
        },
        {
          id: "2",
          title: "Assignment Due Soon",
          description: "Photography Portfolio Project",
          time: "Tomorrow",
          type: "assignment",
          status: "pending",
        },
        {
          id: "3",
          title: "Achievement Unlocked",
          description: "Completed 5 lessons this week",
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

  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) /
            enrollments.length
        )
      : 0;

  const completedCourses = enrollments.filter(
    (e) => e.status === "COMPLETED"
  ).length;
  const activeCourses = enrollments.filter((e) => e.status === "ACTIVE").length;

  const statsWidgets = [
    {
      title: "Active Courses",
      value: activeCourses,
      change: "+2",
      trend: "up" as const,
      icon: BookOpen,
      color: "blue" as const,
      subtitle: "Currently enrolled",
      onClick: () => onContinueCourse(""),
    },
    {
      title: "Average Progress",
      value: `${averageProgress}%`,
      change: "+12%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "green" as const,
      subtitle: "Overall completion",
    },
    {
      title: "Applications",
      value: applications.length,
      change: "+1",
      trend: "up" as const,
      icon: Target,
      color: "purple" as const,
      subtitle: "Course applications",
    },
    {
      title: "Achievements",
      value: achievements.length,
      change: "+3",
      trend: "up" as const,
      icon: Award,
      color: "orange" as const,
      subtitle: "Badges earned",
      onClick: onViewAchievements,
    },
  ];

  const quickActions = [
    {
      title: "Continue Learning",
      description: "Resume your current course",
      icon: Play,
      color: "blue" as const,
      onClick: () => onContinueCourse(""),
      badge: activeCourses > 0 ? activeCourses : undefined,
    },
    {
      title: "Browse Courses",
      description: "Discover new courses",
      icon: BookOpen,
      color: "green" as const,
      onClick: () => {},
      badge: courses.length,
    },
    {
      title: "View Deadlines",
      description: "Check upcoming assignments",
      icon: Clock,
      color: "orange" as const,
      onClick: onViewDeadlines,
      badge: upcomingDeadlines.length,
    },
    {
      title: "My Achievements",
      description: "View badges and progress",
      icon: Award,
      color: "purple" as const,
      onClick: onViewAchievements,
      badge: achievements.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}!
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to continue your learning journey?
              </p>
              {learningStreak?.current > 0 && (
                <div className="flex items-center space-x-2 mt-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">
                    {learningStreak.current} day streak!
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
          <h2 className="text-lg font-bold text-gray-900">Your Progress</h2>
          <div className="flex space-x-1">
            {statsWidgets.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentWidgetIndex ? "bg-blue-600" : "bg-gray-300"
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

      {/* Learning Streak */}
      {learningStreak && (
        <MobileLearningStreak
          currentStreak={learningStreak.current}
          longestStreak={learningStreak.longest}
          lastActivity={learningStreak.lastActivity}
          weeklyGoal={
            learningStats?.weeklyGoal || {
              current: 0,
              target: 10,
              unit: "hours",
            }
          }
        />
      )}

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
              <X className="w-4 h-4" />
            </Button>
          </div>
          <MobileShortcutGrid
            shortcuts={[
              {
                id: "continue-learning",
                title: "Continue Learning",
                icon: Play,
                color: "from-blue-500 to-blue-600",
                count: activeCourses,
                onClick: () => onContinueCourse(""),
              },
              {
                id: "assignments",
                title: "Assignments",
                icon: Clock,
                color: "from-orange-500 to-orange-600",
                count: upcomingDeadlines.length,
                onClick: onViewDeadlines,
              },
              {
                id: "achievements",
                title: "Achievements",
                icon: Award,
                color: "from-purple-500 to-purple-600",
                count: achievements.length,
                onClick: onViewAchievements,
              },
              {
                id: "browse-courses",
                title: "Browse Courses",
                icon: BookOpen,
                color: "from-green-500 to-green-600",
                count: courses.length,
                onClick: () => {},
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

      {/* Course Progress */}
      {activeCourses > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Course Progress</h2>
          <div className="space-y-3">
            {enrollments
              .filter((e) => e.status === "ACTIVE")
              .slice(0, 3)
              .map((enrollment) => (
                <MobileProgressWidget
                  key={enrollment.id}
                  title={enrollment.course?.title || "Course"}
                  progress={enrollment.progress || 0}
                  subtitle={`${enrollment.progress || 0}% complete`}
                  onClick={() => onContinueCourse(enrollment.course?.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Upcoming Deadlines
            </h2>
            <Button variant="ghost" size="sm" onClick={onViewDeadlines}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 2).map((deadline) => (
              <MobileUpcomingDeadline
                key={deadline.id}
                title={deadline.title}
                course={deadline.course?.title || "Course"}
                dueDate={deadline.dueDate}
                priority={deadline.priority}
                type={deadline.type}
                estimatedTime={deadline.estimatedTime}
                onSetReminder={() => {}}
                onViewDetails={() => {}}
              />
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
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
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

      {/* Available Courses Preview */}
      {courses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Recommended Courses
            </h2>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {courses.slice(0, 2).map((course) => (
              <Card
                key={course.id}
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
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
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration} weeks</span>
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{course.rating}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onApplyForCourse(course.id)}
                        >
                          Apply
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

      {/* Floating Action Button for Continue Learning */}
      {activeCourses > 0 && (
        <MobileFloatingActionButton
          icon={Play}
          onClick={() => onContinueCourse("")}
          color="from-blue-500 to-blue-600"
          size="md"
          position="bottom-right"
        />
      )}
    </div>
  );
}
