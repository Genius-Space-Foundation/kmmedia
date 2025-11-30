"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  TrendingUp,
  BookOpen,
  Target,
  Award,
  ChevronRight,
  Star,
  PlayCircle,
  Zap,
  X,
} from "lucide-react";
import {
  MobileStatsWidget,
  MobileProgressWidget,
  MobileShortcutGrid,
  MobileLearningStreak,
  MobileUpcomingDeadline,
} from "@/components/mobile/MobileWidgets";
import SwipeGestureHandler from "@/components/mobile/SwipeGestureHandler";
import { getCurrentBreakpoint, isMobile } from "@/lib/mobile-utils";

interface MobilePersonalizedOverviewProps {
  user: any;
  enrollments: any[];
  upcomingDeadlines: any[];
  recentActivity: any[];
  achievements: any[];
  learningStreak?: any;
  learningStats?: any;
  onContinueCourse: (courseId: string) => void;
  onViewDeadlines: () => void;
  onViewAchievements: () => void;
}

export default function MobilePersonalizedOverview({
  user,
  enrollments,
  upcomingDeadlines,
  recentActivity,
  achievements,
  learningStreak,
  learningStats,
  onContinueCourse,
  onViewDeadlines,
  onViewAchievements,
}: MobilePersonalizedOverviewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentWidgetIndex, setCurrentWidgetIndex] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getPersonalizedMessage = () => {
    const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
    const completedCourses = enrollments.filter(
      (e) => e.status === "COMPLETED"
    );

    if (activeEnrollments.length === 0) {
      return "Ready to start your learning journey?";
    }

    if (upcomingDeadlines.length > 0) {
      return `${upcomingDeadlines.length} deadline${
        upcomingDeadlines.length > 1 ? "s" : ""
      } coming up!`;
    }

    if (completedCourses.length > 0) {
      return `${completedCourses.length} course${
        completedCourses.length > 1 ? "s" : ""
      } completed!`;
    }

    return "Keep up the great work!";
  };

  const calculateOverallProgress = () => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce(
      (sum, enrollment) => sum + (enrollment.progress || 0),
      0
    );
    return Math.round(totalProgress / enrollments.length);
  };

  const getNextLesson = () => {
    const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
    if (activeEnrollments.length === 0) return null;

    // Find the course with the lowest progress that has a current lesson
    return activeEnrollments
      .filter((e) => e.currentLesson)
      .sort((a, b) => (a.progress || 0) - (b.progress || 0))[0];
  };

  const handleSwipeStats = (direction: "left" | "right") => {
    const statsCount = 4; // Number of stat widgets
    if (direction === "left" && currentWidgetIndex < statsCount - 1) {
      setCurrentWidgetIndex(currentWidgetIndex + 1);
    } else if (direction === "right" && currentWidgetIndex > 0) {
      setCurrentWidgetIndex(currentWidgetIndex - 1);
    }
  };

  const nextLesson = getNextLesson();
  const overallProgress = calculateOverallProgress();
  const activeCourses = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "COMPLETED"
  ).length;

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
      value: `${overallProgress}%`,
      change: "+12%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "green" as const,
      subtitle: "Overall completion",
    },
    {
      title: "Deadlines",
      value: upcomingDeadlines.length,
      change: "+1",
      trend: "up" as const,
      icon: Target,
      color: "orange" as const,
      subtitle: "Coming up",
      onClick: onViewDeadlines,
    },
    {
      title: "Achievements",
      value: achievements.length,
      change: "+3",
      trend: "up" as const,
      icon: Award,
      color: "purple" as const,
      subtitle: "Badges earned",
      onClick: onViewAchievements,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile Welcome Header - Compact */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardContent className={compactMode ? "p-4" : "p-6"}>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-xl md:text-2xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {getGreeting()}, {user?.name?.split(" ")[0] || "Student"}!
              </h1>
              <p className="text-sm md:text-base text-gray-600 truncate">
                {getPersonalizedMessage()}
              </p>
              {learningStreak?.current > 0 && (
                <div className="flex items-center space-x-2 mt-1 md:mt-2">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                  <span className="text-xs md:text-sm font-medium text-orange-600">
                    {learningStreak.current} day streak!
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swipeable Stats Widgets */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            Your Progress
          </h2>
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
          <div className="grid grid-cols-2 gap-3 md:gap-4">
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

      {/* Learning Streak - Mobile Optimized */}
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

      {/* Mobile Shortcuts Grid */}
      {showShortcuts && (
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Quick Access
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(false)}
              className="text-gray-500 h-8 w-8 p-0 md:h-10 md:w-10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <MobileShortcutGrid
            shortcuts={[
              {
                id: "continue-learning",
                title: "Continue",
                icon: PlayCircle,
                color: "from-blue-500 to-blue-600",
                count: activeCourses,
                onClick: () => onContinueCourse(""),
              },
              {
                id: "deadlines",
                title: "Deadlines",
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
                id: "courses",
                title: "Courses",
                icon: BookOpen,
                color: "from-green-500 to-green-600",
                count: enrollments.length,
                onClick: () => {},
              },
            ]}
            columns={compactMode ? 2 : 4}
          />
        </div>
      )}

      {/* Continue Learning - Mobile Optimized */}
      {nextLesson && (
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className={compactMode ? "pb-2 px-4 pt-4" : "pb-3"}>
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <PlayCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              <span>Continue Learning</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={compactMode ? "px-4 pb-4" : ""}>
            <div className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate flex-1">
                  {nextLesson.course.title}
                </h4>
                <Badge className="bg-blue-100 text-blue-800 text-xs ml-2">
                  In Progress
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 truncate">
                Current: {nextLesson.currentLesson || "Getting Started"}
              </p>
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <Progress
                  value={nextLesson.progress || 0}
                  className="flex-1 mr-3"
                />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  {nextLesson.progress || 0}%
                </span>
              </div>
              <Button
                onClick={() => onContinueCourse(nextLesson.course.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-11 md:h-12 text-sm md:text-base"
                style={{ minHeight: "44px" }}
              >
                Continue Learning
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Progress - Mobile Optimized */}
      {activeCourses > 0 && (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-bold text-gray-900 px-1">
            Course Progress
          </h2>
          <div className="space-y-2 md:space-y-3">
            {enrollments
              .filter((e) => e.status === "ACTIVE")
              .slice(0, compactMode ? 2 : 3)
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

      {/* Upcoming Deadlines - Mobile Optimized */}
      {upcomingDeadlines.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              Upcoming Deadlines
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDeadlines}
              className="h-8 md:h-10 text-xs md:text-sm"
            >
              View All
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-2 md:space-y-3">
            {upcomingDeadlines.slice(0, compactMode ? 2 : 3).map((deadline) => (
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

      {/* Recent Achievements - Mobile Optimized */}
      {achievements.length > 0 && (
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className={compactMode ? "pb-2 px-4 pt-4" : "pb-3"}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                <Award className="h-4 w-4 md:h-5 md:h-5 text-purple-600" />
                <span>Recent Achievements</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAchievements}
                className="h-8 md:h-10 text-xs md:text-sm"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className={compactMode ? "px-4 pb-4" : ""}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {achievements.slice(0, 3).map((achievement, index) => (
                <div
                  key={index}
                  className="text-center p-3 md:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <Star className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                    {achievement.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-purple-600 mt-1 md:mt-2">
                    {achievement.earnedDate}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
