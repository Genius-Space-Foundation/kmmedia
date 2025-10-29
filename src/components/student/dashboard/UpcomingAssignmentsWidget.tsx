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
  FileText,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Play,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  course: {
    id: string;
    title: string;
    color?: string;
  };
  submission?: {
    id: string;
    status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
    submittedAt: string;
    grade?: number;
  };
  isOverdue: boolean;
  daysUntilDue: number;
  estimatedTime: number; // in minutes
}

export default function UpcomingAssignmentsWidget() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingAssignments();
  }, []);

  const fetchUpcomingAssignments = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/student/assignments/upcoming"
      );
      const result = await response.json();

      if (result.success) {
        setAssignments(result.data.assignments || []);
      }
    } catch (error) {
      console.error("Error fetching upcoming assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submission) {
      switch (assignment.submission.status) {
        case "GRADED":
          return <Badge variant="default">Graded</Badge>;
        case "SUBMITTED":
          return <Badge variant="secondary">Submitted</Badge>;
        case "DRAFT":
          return <Badge variant="outline">Draft</Badge>;
        case "RETURNED":
          return <Badge variant="destructive">Returned</Badge>;
      }
    }

    if (assignment.isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }

    if (assignment.daysUntilDue <= 1) {
      return <Badge variant="destructive">Due Soon</Badge>;
    }

    if (assignment.daysUntilDue <= 3) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          Due This Week
        </Badge>
      );
    }

    return <Badge variant="outline">Upcoming</Badge>;
  };

  const getUrgencyColor = (assignment: Assignment) => {
    if (assignment.isOverdue) return "border-l-red-500 bg-red-50";
    if (assignment.daysUntilDue <= 1) return "border-l-orange-500 bg-orange-50";
    if (assignment.daysUntilDue <= 3) return "border-l-yellow-500 bg-yellow-50";
    return "border-l-blue-500 bg-blue-50";
  };

  const formatDueDate = (dateString: string, daysUntilDue: number) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (daysUntilDue === 0) {
      return "Due Today";
    } else if (daysUntilDue === 1) {
      return "Due Tomorrow";
    } else if (daysUntilDue < 0) {
      return `Overdue by ${Math.abs(daysUntilDue)} day${
        Math.abs(daysUntilDue) !== 1 ? "s" : ""
      }`;
    } else if (daysUntilDue <= 7) {
      return `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`;
    } else {
      return `Due ${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })}`;
    }
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getActionButton = (assignment: Assignment) => {
    if (assignment.submission?.status === "GRADED") {
      return (
        <Link href={`/assignments/${assignment.id}/results`}>
          <Button size="sm" variant="outline">
            <CheckCircle className="w-3 h-3 mr-1" />
            View Results
          </Button>
        </Link>
      );
    }

    if (assignment.submission?.status === "SUBMITTED") {
      return (
        <Link href={`/assignments/${assignment.id}/submission`}>
          <Button size="sm" variant="outline">
            <FileText className="w-3 h-3 mr-1" />
            View Submission
          </Button>
        </Link>
      );
    }

    if (assignment.submission?.status === "DRAFT") {
      return (
        <Link href={`/assignments/${assignment.id}/submit`}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-3 h-3 mr-1" />
            Continue
          </Button>
        </Link>
      );
    }

    return (
      <Link href={`/assignments/${assignment.id}`}>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Play className="w-3 h-3 mr-1" />
          Start Assignment
        </Button>
      </Link>
    );
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
              <FileText className="w-5 h-5 text-blue-600" />
              Upcoming Assignments
              {assignments.filter(
                (a) => !a.submission || a.submission.status === "DRAFT"
              ).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {
                    assignments.filter(
                      (a) => !a.submission || a.submission.status === "DRAFT"
                    ).length
                  }
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Assignments due soon and in progress
            </CardDescription>
          </div>
          <Link href="/assignments">
            <Button size="sm" variant="outline">
              View All
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">All caught up!</p>
            <p className="text-sm text-gray-400">
              No upcoming assignments at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {assignments.slice(0, 5).map((assignment) => (
              <div
                key={assignment.id}
                className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(
                  assignment
                )} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {assignment.title}
                      </h4>
                      {getStatusBadge(assignment)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {assignment.course.title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDueDate(
                          assignment.dueDate,
                          assignment.daysUntilDue
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatEstimatedTime(assignment.estimatedTime)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {assignment.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {assignment.totalPoints} points
                        </span>
                        {assignment.submission?.grade !== undefined && (
                          <span className="text-xs font-medium text-green-600">
                            Score: {assignment.submission.grade}/
                            {assignment.totalPoints}
                          </span>
                        )}
                      </div>
                      {getActionButton(assignment)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {assignments.length > 5 && (
          <div className="pt-4 border-t">
            <Link href="/assignments">
              <Button variant="outline" className="w-full">
                View All Assignments ({assignments.length})
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
