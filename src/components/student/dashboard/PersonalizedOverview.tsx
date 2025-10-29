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
} from "lucide-react";
import UpcomingAssignmentsWidget from "./UpcomingAssignmentsWidget";
import AssignmentDeadlineReminders from "./AssignmentDeadlineReminders";
import RecentGradesWidget from "./RecentGradesWidget";
import AssignmentProgressWidget from "./AssignmentProgressWidget";

interface PersonalizedOverviewProps {
  user: any;
  enrollments: any[];
  upcomingDeadlines: any[];
  recentActivity: any[];
  achievements: any[];
  onContinueCourse: (courseId: string) => void;
  onViewDeadlines: () => void;
  onViewAchievements: () => void;
}

export default function PersonalizedOverview({
  user,
  enrollments,
  upcomingDeadlines,
  recentActivity,
  achievements,
  onContinueCourse,
  onViewDeadlines,
  onViewAchievements,
}: PersonalizedOverviewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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
      return "Ready to start your learning journey? Explore our course catalog!";
    }

    if (upcomingDeadlines.length > 0) {
      return `You have ${upcomingDeadlines.length} upcoming deadline${
        upcomingDeadlines.length > 1 ? "s" : ""
      }. Stay on track!`;
    }

    if (completedCourses.length > 0) {
      return `Great progress! You've completed ${
        completedCourses.length
      } course${completedCourses.length > 1 ? "s" : ""}. Keep it up!`;
    }

    return "Continue your learning journey. You're doing great!";
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

  const nextLesson = getNextLesson();
  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user?.name || "Student"}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {getPersonalizedMessage()}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{currentTime.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl">🎓</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.length}
                </p>
                <p className="text-sm text-gray-600">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {overallProgress}%
                </p>
                <p className="text-sm text-gray-600">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingDeadlines.length}
                </p>
                <p className="text-sm text-gray-600">Deadlines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {achievements.length}
                </p>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAssignmentsWidget />
        <AssignmentDeadlineReminders />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentGradesWidget />
        <AssignmentProgressWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-blue-600" />
              <span>Continue Learning</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextLesson ? (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    {nextLesson.course.title}
                  </h4>
                  <Badge className="bg-blue-100 text-blue-800">
                    In Progress
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Current: {nextLesson.currentLesson || "Getting Started"}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <Progress
                    value={nextLesson.progress || 0}
                    className="flex-1 mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {nextLesson.progress || 0}%
                  </span>
                </div>
                <Button
                  onClick={() => onContinueCourse(nextLesson.course.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Continue Learning
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">No active courses</p>
                <Button variant="outline">Browse Courses</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span>Upcoming Deadlines</span>
              </CardTitle>
              {upcomingDeadlines.length > 0 && (
                <Button variant="ghost" size="sm" onClick={onViewDeadlines}>
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {deadline.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {deadline.course.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {deadline.daysLeft} days left
                    </p>
                    <p className="text-xs text-gray-500">{deadline.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No upcoming deadlines</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span>Recent Achievements</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onViewAchievements}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.slice(0, 3).map((achievement, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-purple-600 mt-2">
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
