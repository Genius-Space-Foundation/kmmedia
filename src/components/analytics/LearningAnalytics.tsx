"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface LearningAnalytics {
  overallProgress: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    averageProgress: number;
    totalTimeSpent: number;
    estimatedTimeRemaining: number;
  };
  weeklyActivity: {
    week: string;
    hoursSpent: number;
    lessonsCompleted: number;
    assessmentsTaken: number;
  }[];
  skillProgression: {
    skill: string;
    level: number;
    progress: number;
    lessonsCompleted: number;
    nextMilestone: string;
  }[];
  performanceMetrics: {
    averageQuizScore: number;
    assignmentCompletionRate: number;
    attendanceRate: number;
    participationScore: number;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    type: "milestone" | "skill" | "engagement" | "completion";
  }[];
  learningStreak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
  };
  recommendations: {
    type: "course" | "practice" | "review" | "skill";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    actionUrl?: string;
  }[];
}

interface LearningAnalyticsProps {
  userId: string;
}

export default function LearningAnalytics({ userId }: LearningAnalyticsProps) {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/student/analytics/${userId}`
      );
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
      } else {
        console.error("Failed to fetch analytics:", result.message);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥🔥🔥";
    if (streak >= 14) return "🔥🔥";
    if (streak >= 7) return "🔥";
    if (streak >= 3) return "💪";
    return "📚";
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            Loading Learning Analytics...
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Learning Analytics
          </h2>
          <p className="text-gray-600">Track your progress and performance</p>
        </div>
        <Button variant="outline" onClick={fetchAnalytics}>
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📊</span>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Overall Progress
                    </CardTitle>
                    <div className="text-2xl font-bold text-gray-900">
                      {analytics.overallProgress.averageProgress}%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress
                  value={analytics.overallProgress.averageProgress}
                  className="h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">🎓</span>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Courses Completed
                    </CardTitle>
                    <div className="text-2xl font-bold text-gray-900">
                      {analytics.overallProgress.completedCourses}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  of {analytics.overallProgress.totalCourses} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">⏱️</span>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Time Spent
                    </CardTitle>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        analytics.overallProgress.totalTimeSpent / 60
                      )}
                      h
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  {Math.round(
                    analytics.overallProgress.estimatedTimeRemaining / 60
                  )}
                  h remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-sm">
                      {getStreakEmoji(analytics.learningStreak.currentStreak)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Learning Streak
                    </CardTitle>
                    <div className="text-2xl font-bold text-gray-900">
                      {analytics.learningStreak.currentStreak}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  Best: {analytics.learningStreak.longestStreak} days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Your academic performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Quiz Average</span>
                  <span
                    className={`font-bold ${getPerformanceColor(
                      analytics.performanceMetrics.averageQuizScore
                    )}`}
                  >
                    {analytics.performanceMetrics.averageQuizScore}%
                  </span>
                </div>
                <Progress
                  value={analytics.performanceMetrics.averageQuizScore}
                  className="h-2"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Assignment Completion
                  </span>
                  <span
                    className={`font-bold ${getPerformanceColor(
                      analytics.performanceMetrics.assignmentCompletionRate
                    )}`}
                  >
                    {analytics.performanceMetrics.assignmentCompletionRate}%
                  </span>
                </div>
                <Progress
                  value={analytics.performanceMetrics.assignmentCompletionRate}
                  className="h-2"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <span
                    className={`font-bold ${getPerformanceColor(
                      analytics.performanceMetrics.attendanceRate
                    )}`}
                  >
                    {analytics.performanceMetrics.attendanceRate}%
                  </span>
                </div>
                <Progress
                  value={analytics.performanceMetrics.attendanceRate}
                  className="h-2"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Participation Score
                  </span>
                  <span
                    className={`font-bold ${getPerformanceColor(
                      analytics.performanceMetrics.participationScore
                    )}`}
                  >
                    {analytics.performanceMetrics.participationScore}%
                  </span>
                </div>
                <Progress
                  value={analytics.performanceMetrics.participationScore}
                  className="h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.achievements.slice(0, 5).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">
                          {achievement.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Earned{" "}
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {achievement.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>
                Your learning activity over the past weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weeklyActivity.map((week, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{week.week}</h4>
                      <p className="text-sm text-gray-600">
                        {week.lessonsCompleted} lessons •{" "}
                        {week.assessmentsTaken} assessments
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {week.hoursSpent}h
                      </div>
                      <p className="text-xs text-gray-500">time spent</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Progression</CardTitle>
              <CardDescription>
                Track your skill development across different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.skillProgression.map((skill, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{skill.skill}</h4>
                        <p className="text-sm text-gray-600">
                          Level {skill.level} • {skill.lessonsCompleted} lessons
                          completed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {skill.progress}%
                        </div>
                      </div>
                    </div>
                    <Progress value={skill.progress} className="h-3" />
                    <p className="text-sm text-blue-600">
                      Next: {skill.nextMilestone}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
              <CardDescription>
                Your complete achievement collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">
                          {achievement.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {achievement.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Earned{" "}
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions to improve your learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-lg">
                        {rec.type === "course"
                          ? "📚"
                          : rec.type === "practice"
                          ? "💪"
                          : rec.type === "review"
                          ? "🔄"
                          : "🎯"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {rec.description}
                      </p>
                      {rec.actionUrl && (
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


