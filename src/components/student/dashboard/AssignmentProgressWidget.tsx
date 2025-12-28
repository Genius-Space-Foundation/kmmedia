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
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BookOpen,
  ArrowRight,
  Play,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface AssignmentProgress {
  id: string;
  assignment: {
    id: string;
    title: string;
    dueDate: string;
    totalPoints: number;
    course: {
      id: string;
      title: string;
    };
  };
  status: "not_started" | "in_progress" | "submitted" | "graded";
  progressPercentage: number;
  timeSpent: number; // in minutes
  estimatedTimeRemaining: number; // in minutes
  lastWorkedOn?: string;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }[];
}

interface ProgressStats {
  totalAssignments: number;
  completedAssignments: number;
  inProgressAssignments: number;
  overallProgress: number;
  averageCompletionTime: number; // in hours
  onTimeCompletionRate: number;
  weeklyGoal: {
    target: number; // assignments to complete
    current: number;
    unit: "assignments";
  };
}

export default function AssignmentProgressWidget() {
  const [assignmentProgress, setAssignmentProgress] = useState<
    AssignmentProgress[]
  >([]);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignmentProgress();
    fetchProgressStats();
  }, []);

  const fetchAssignmentProgress = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/student/assignments/progress"
      );
      const result = await response.json();

      if (result.success) {
        setAssignmentProgress(result.data.progress || []);
      }
    } catch (error) {
      console.error("Error fetching assignment progress:", error);
      setAssignmentProgress([]);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/student/assignments/stats"
      );
      const result = await response.json();

      if (result.success) {
        setProgressStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching progress stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "graded":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "submitted":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "not_started":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "border-l-green-500 bg-green-50";
      case "submitted":
        return "border-l-blue-500 bg-blue-50";
      case "in_progress":
        return "border-l-orange-500 bg-orange-50";
      case "not_started":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "graded":
        return <Badge variant="default">Graded</Badge>;
      case "submitted":
        return <Badge variant="secondary">Submitted</Badge>;
      case "in_progress":
        return <Badge variant="outline">In Progress</Badge>;
      case "not_started":
        return <Badge variant="destructive">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const formatLastWorkedOn = (dateString?: string) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getActionButton = (progress: AssignmentProgress) => {
    switch (progress.status) {
      case "graded":
        return (
          <Link href={`/assignments/${progress.assignment.id}/results`}>
            <Button size="sm" variant="outline">
              View Results
            </Button>
          </Link>
        );
      case "submitted":
        return (
          <Link href={`/assignments/${progress.assignment.id}/submission`}>
            <Button size="sm" variant="outline">
              View Submission
            </Button>
          </Link>
        );
      case "in_progress":
        return (
          <Link href={`/assignments/${progress.assignment.id}/work`}>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Play className="w-3 h-3 mr-1" />
              Continue
            </Button>
          </Link>
        );
      case "not_started":
        return (
          <Link href={`/assignments/${progress.assignment.id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
          </Link>
        );
      default:
        return null;
    }
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
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Assignment Progress
            </CardTitle>
            <CardDescription>
              Track your progress on current assignments
            </CardDescription>
          </div>
          <Link href="/assignments/progress">
            <Button size="sm" variant="outline">
              Detailed View
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Progress Statistics */}
        {progressStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Overall
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {progressStats.overallProgress.toFixed(0)}%
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Completed
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {progressStats.completedAssignments}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  In Progress
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {progressStats.inProgressAssignments}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  On Time
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {progressStats.onTimeCompletionRate.toFixed(0)}%
              </p>
            </div>
          </div>
        )}

        {/* Weekly Goal */}
        {progressStats?.weeklyGoal && (
          <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Weekly Goal
              </span>
              <span className="text-sm text-gray-600">
                {progressStats.weeklyGoal.current}/
                {progressStats.weeklyGoal.target} assignments
              </span>
            </div>
            <Progress
              value={
                (progressStats.weeklyGoal.current /
                  progressStats.weeklyGoal.target) *
                100
              }
              className="h-2"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {assignmentProgress.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No assignments in progress
            </p>
            <p className="text-sm text-gray-400">
              Start working on assignments to track your progress
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {assignmentProgress.slice(0, 5).map((progress) => (
              <div
                key={progress.id}
                className={`p-4 rounded-lg border-l-4 ${getStatusColor(
                  progress.status
                )} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(progress.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {progress.assignment.title}
                        </h4>
                        {getStatusBadge(progress.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {progress.assignment.course.title}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due{" "}
                          {new Date(
                            progress.assignment.dueDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            Progress: {progress.progressPercentage}%
                          </span>
                          <span className="text-xs text-gray-500">
                            Last worked:{" "}
                            {formatLastWorkedOn(progress.lastWorkedOn)}
                          </span>
                        </div>
                        <Progress
                          value={progress.progressPercentage}
                          className="h-2"
                        />
                      </div>

                      {/* Time Information */}
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                        <span>
                          Time spent: {formatTime(progress.timeSpent)}
                        </span>
                        {progress.estimatedTimeRemaining > 0 && (
                          <span>
                            Est. remaining:{" "}
                            {formatTime(progress.estimatedTimeRemaining)}
                          </span>
                        )}
                      </div>

                      {/* Milestones */}
                      {progress.milestones.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            Milestones:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {progress.milestones.map((milestone) => (
                              <Badge
                                key={milestone.id}
                                variant={
                                  milestone.completed ? "default" : "outline"
                                }
                                className="text-xs"
                              >
                                {milestone.completed && (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {milestone.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {getActionButton(progress)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {assignmentProgress.length > 5 && (
          <div className="pt-4 border-t">
            <Link href="/assignments/progress">
              <Button variant="outline" className="w-full">
                View All Progress ({assignmentProgress.length})
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Quick Actions
            </span>
            <div className="flex gap-2">
              <Link href="/assignments">
                <Button size="sm" variant="outline">
                  All Assignments
                </Button>
              </Link>
              <Link href="/assignments/calendar">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Calendar View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
