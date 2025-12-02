"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Star,
  BookOpen,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  Filter,
  Calendar,
  PieChart,
  Activity,
  Zap,
  Brain,
  MessageSquare,
} from "lucide-react";

interface CourseAnalytics {
  id: string;
  title: string;
  category: string;
  enrolledStudents: number;
  activeStudents: number;
  completionRate: number;
  averageRating: number;
  totalRatings: number;
  averageProgress: number;
  totalTimeSpent: number; // in hours
  engagementScore: number;
  dropoutRate: number;
  revenueGenerated: number;
  performanceMetrics: {
    lessonCompletionRate: number;
    assignmentSubmissionRate: number;
    quizAverageScore: number;
    discussionParticipation: number;
    resourceAccessRate: number;
  };
  contentAnalytics: {
    mostEngagingLessons: LessonAnalytics[];
    leastEngagingLessons: LessonAnalytics[];
    difficultTopics: string[];
    popularResources: string[];
  };
  studentFeedback: {
    positiveComments: string[];
    improvementSuggestions: string[];
    commonIssues: string[];
  };
  trends: {
    enrollmentTrend: number;
    completionTrend: number;
    engagementTrend: number;
    ratingTrend: number;
  };
  recommendations: Recommendation[];
}

interface LessonAnalytics {
  id: string;
  title: string;
  type: string;
  completionRate: number;
  averageTimeSpent: number;
  engagementScore: number;
  dropoffRate: number;
}

interface Recommendation {
  id: string;
  type: "content" | "engagement" | "assessment" | "support";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  effort: string;
}

interface CourseAnalyticsInsightsProps {
  onViewCourse: (courseId: string) => void;
  onImplementRecommendation: (recommendationId: string) => void;
  onExportReport: (courseId: string) => void;
}

export default function CourseAnalyticsInsights({
  onViewCourse,
  onImplementRecommendation,
  onExportReport,
}: CourseAnalyticsInsightsProps) {
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  useEffect(() => {
    fetchCourseAnalytics();
  }, [timeRange]);

  const fetchCourseAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/courses/analytics?timeRange=${timeRange}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      
      if (data.success) {
        setCourseAnalytics(data.data);
        if (data.data.length > 0 && !selectedCourse) {
          setSelectedCourse(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching course analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-neutral-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "content":
        return <BookOpen className="h-4 w-4" />;
      case "engagement":
        return <Zap className="h-4 w-4" />;
      case "assessment":
        return <Target className="h-4 w-4" />;
      case "support":
        return <Users className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selection and Controls */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Course Analytics & Insights</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button
                variant={viewMode === "overview" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("overview")}
              >
                Overview
              </Button>
              <Button
                variant={viewMode === "detailed" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("detailed")}
              >
                Detailed
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {courseAnalytics.map((course) => (
              <Button
                key={course.id}
                variant={
                  selectedCourse?.id === course.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCourse(course)}
                className="flex items-center space-x-2"
              >
                <span>{course.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {course.enrolledStudents}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Enrolled Students
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {selectedCourse.enrolledStudents}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(selectedCourse.trends.enrollmentTrend)}
                      <span
                        className={`text-sm ${getTrendColor(
                          selectedCourse.trends.enrollmentTrend
                        )}`}
                      >
                        {selectedCourse.trends.enrollmentTrend > 0 ? "+" : ""}
                        {selectedCourse.trends.enrollmentTrend}%
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {selectedCourse.completionRate}%
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(selectedCourse.trends.completionTrend)}
                      <span
                        className={`text-sm ${getTrendColor(
                          selectedCourse.trends.completionTrend
                        )}`}
                      >
                        {selectedCourse.trends.completionTrend > 0 ? "+" : ""}
                        {selectedCourse.trends.completionTrend}%
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {selectedCourse.averageRating}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(selectedCourse.trends.ratingTrend)}
                      <span
                        className={`text-sm ${getTrendColor(
                          selectedCourse.trends.ratingTrend
                        )}`}
                      >
                        {selectedCourse.trends.ratingTrend > 0 ? "+" : ""}
                        {selectedCourse.trends.ratingTrend}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">
                      Engagement Score
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {selectedCourse.engagementScore}%
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(selectedCourse.trends.engagementTrend)}
                      <span
                        className={`text-sm ${getTrendColor(
                          selectedCourse.trends.engagementTrend
                        )}`}
                      >
                        {selectedCourse.trends.engagementTrend > 0 ? "+" : ""}
                        {selectedCourse.trends.engagementTrend}%
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Lesson Completion</span>
                      <span className="font-medium">
                        {selectedCourse.performanceMetrics.lessonCompletionRate}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        selectedCourse.performanceMetrics.lessonCompletionRate
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        Assignment Submission
                      </span>
                      <span className="font-medium">
                        {
                          selectedCourse.performanceMetrics
                            .assignmentSubmissionRate
                        }
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        selectedCourse.performanceMetrics
                          .assignmentSubmissionRate
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Quiz Average Score</span>
                      <span className="font-medium">
                        {selectedCourse.performanceMetrics.quizAverageScore}%
                      </span>
                    </div>
                    <Progress
                      value={selectedCourse.performanceMetrics.quizAverageScore}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        Discussion Participation
                      </span>
                      <span className="font-medium">
                        {
                          selectedCourse.performanceMetrics
                            .discussionParticipation
                        }
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        selectedCourse.performanceMetrics
                          .discussionParticipation
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Resource Access</span>
                      <span className="font-medium">
                        {selectedCourse.performanceMetrics.resourceAccessRate}%
                      </span>
                    </div>
                    <Progress
                      value={
                        selectedCourse.performanceMetrics.resourceAccessRate
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Analytics */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span>Content Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">
                    Most Engaging Lessons
                  </h4>
                  <div className="space-y-2">
                    {selectedCourse.contentAnalytics.mostEngagingLessons.map(
                      (lesson) => (
                        <div
                          key={lesson.id}
                          className="p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {lesson.title}
                            </span>
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              {lesson.engagementScore}% engagement
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {lesson.completionRate}% completion •{" "}
                            {lesson.averageTimeSpent}min avg time
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-red-700 mb-2">
                    Needs Improvement
                  </h4>
                  <div className="space-y-2">
                    {selectedCourse.contentAnalytics.leastEngagingLessons.map(
                      (lesson) => (
                        <div
                          key={lesson.id}
                          className="p-3 bg-red-50 rounded-lg border border-red-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {lesson.title}
                            </span>
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {lesson.dropoffRate}% dropoff
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {lesson.completionRate}% completion •{" "}
                            {lesson.averageTimeSpent}min avg time
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI-Powered Recommendations */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
                <Button
                  onClick={() => onExportReport(selectedCourse.id)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCourse.recommendations.map((recommendation) => (
                  <Card
                    key={recommendation.id}
                    className="border border-gray-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getRecommendationIcon(recommendation.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {recommendation.title}
                            </h4>
                            <Badge
                              className={getPriorityColor(
                                recommendation.priority
                              )}
                            >
                              {recommendation.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {recommendation.description}
                          </p>
                          <div className="space-y-1 text-xs text-gray-500 mb-3">
                            <div>Impact: {recommendation.impact}</div>
                            <div>Effort: {recommendation.effort}</div>
                          </div>
                          <Button
                            onClick={() =>
                              onImplementRecommendation(recommendation.id)
                            }
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Implement
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Feedback Summary */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Student Feedback Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-3 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Positive Feedback</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedCourse.studentFeedback.positiveComments.map(
                      (comment, index) => (
                        <div
                          key={index}
                          className="p-2 bg-green-50 rounded text-sm text-green-800"
                        >
                          "{comment}"
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-3 flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Improvement Suggestions</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedCourse.studentFeedback.improvementSuggestions.map(
                      (suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 bg-blue-50 rounded text-sm text-blue-800"
                        >
                          "{suggestion}"
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-orange-700 mb-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Common Issues</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedCourse.studentFeedback.commonIssues.map(
                      (issue, index) => (
                        <div
                          key={index}
                          className="p-2 bg-orange-50 rounded text-sm text-orange-800"
                        >
                          "{issue}"
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
