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
  Award,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Eye,
  ArrowRight,
  BookOpen,
  Calendar,
  Target,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface GradedAssignment {
  id: string;
  assignment: {
    id: string;
    title: string;
    totalPoints: number;
    course: {
      id: string;
      title: string;
      color?: string;
    };
  };
  grade: number;
  feedback?: string;
  gradedAt: string;
  isLate: boolean;
  originalScore?: number;
  finalScore: number;
  percentageScore: number;
  letterGrade: string;
  hasDetailedFeedback: boolean;
}

interface GradeStats {
  averageScore: number;
  totalAssignments: number;
  improvementTrend: "up" | "down" | "stable";
  bestPerformance: {
    score: number;
    assignmentTitle: string;
  };
  recentTrend: number; // percentage change from previous assignments
}

export default function RecentGradesWidget() {
  const [recentGrades, setRecentGrades] = useState<GradedAssignment[]>([]);
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentGrades();
    fetchGradeStats();
  }, []);

  const fetchRecentGrades = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/student/grades/recent"
      );
      const result = await response.json();

      if (result.success) {
        setRecentGrades(result.data.grades || []);
      }
    } catch (error) {
      console.error("Error fetching recent grades:", error);
      setRecentGrades([]);
    }
  };

  const fetchGradeStats = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/student/grades/stats"
      );
      const result = await response.json();

      if (result.success) {
        setGradeStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching grade stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default";
    if (percentage >= 80) return "secondary";
    if (percentage >= 70) return "outline";
    return "destructive";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const truncateFeedback = (feedback: string, maxLength: number = 100) => {
    if (feedback.length <= maxLength) return feedback;
    return feedback.substring(0, maxLength) + "...";
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

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Recent Grades & Feedback
            </CardTitle>
            <CardDescription>
              Your latest assignment results and instructor feedback
            </CardDescription>
          </div>
          <Link href="/grades">
            <Button size="sm" variant="outline">
              View All Grades
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Grade Statistics */}
        {gradeStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">
                  Average
                </span>
                {getTrendIcon(gradeStats.improvementTrend)}
              </div>
              <p
                className={`text-2xl font-bold ${getGradeColor(
                  gradeStats.averageScore
                )}`}
              >
                {gradeStats.averageScore.toFixed(1)}%
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {gradeStats.totalAssignments}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Best</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {gradeStats.bestPerformance.score}%
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Trend
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  gradeStats.recentTrend > 0
                    ? "text-green-900"
                    : gradeStats.recentTrend < 0
                    ? "text-red-900"
                    : "text-gray-900"
                }`}
              >
                {gradeStats.recentTrend > 0 ? "+" : ""}
                {gradeStats.recentTrend.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {recentGrades.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No grades yet</p>
            <p className="text-sm text-gray-400">
              Complete assignments to see your grades here
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentGrades.slice(0, 5).map((grade) => (
              <div
                key={grade.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {grade.assignment.title}
                      </h4>
                      <Badge
                        variant={getGradeBadgeVariant(grade.percentageScore)}
                      >
                        {grade.letterGrade}
                      </Badge>
                      {grade.isLate && (
                        <Badge variant="destructive" className="text-xs">
                          Late
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {grade.assignment.course.title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(grade.gradedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-lg font-bold ${getGradeColor(
                            grade.percentageScore
                          )}`}
                        >
                          {grade.finalScore}/{grade.assignment.totalPoints}
                        </span>
                        <span
                          className={`text-sm font-medium ${getGradeColor(
                            grade.percentageScore
                          )}`}
                        >
                          ({grade.percentageScore.toFixed(1)}%)
                        </span>
                        {grade.originalScore &&
                          grade.originalScore !== grade.finalScore && (
                            <span className="text-xs text-gray-500">
                              Original: {grade.originalScore}/
                              {grade.assignment.totalPoints}
                            </span>
                          )}
                      </div>
                    </div>

                    {grade.feedback && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-blue-900 font-medium mb-1">
                              Instructor Feedback
                            </p>
                            <p className="text-sm text-blue-800">
                              {truncateFeedback(grade.feedback)}
                            </p>
                            {grade.hasDetailedFeedback && (
                              <Link
                                href={`/assignments/${grade.assignment.id}/feedback`}
                                className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                              >
                                View detailed feedback
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/assignments/${grade.assignment.id}/results`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recentGrades.length > 5 && (
          <div className="pt-4 border-t">
            <Link href="/grades">
              <Button variant="outline" className="w-full">
                View All Grades ({recentGrades.length})
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {gradeStats && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Quick Actions
              </span>
              <div className="flex gap-2">
                <Link href="/assignments">
                  <Button size="sm" variant="outline">
                    View Assignments
                  </Button>
                </Link>
                <Link href="/grades/analytics">
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Grade Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
