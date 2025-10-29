"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Upload,
  Users,
  Award,
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  isPublished: boolean;
  submissionCount: number;
  gradedCount: number;
  hasSubmitted?: boolean;
  isOverdue?: boolean;
  effectiveDueDate?: string;
  submission?: {
    id: string;
    submittedAt: string;
    status: string;
    grade?: number;
    feedback?: string;
  };
}

interface CourseAssignmentsTabProps {
  courseId: string;
  userRole: "instructor" | "student" | "admin";
  userId?: string;
}

export default function CourseAssignmentsTab({
  courseId,
  userRole,
  userId,
}: CourseAssignmentsTabProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [courseId, userRole, userId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = "";
      if (userRole === "instructor") {
        url = `/api/assignments?courseId=${courseId}`;
      } else {
        url = `/api/courses/${courseId}/assignments`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAssignments(data.data || []);
      } else {
        setError(data.message || "Failed to fetch assignments");
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (userRole === "instructor") {
      if (!assignment.isPublished) {
        return (
          <Badge variant="outline" className="border-gray-300 text-gray-600">
            Draft
          </Badge>
        );
      }
      if (assignment.gradedCount === assignment.submissionCount) {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Graded
          </Badge>
        );
      }
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    } else {
      if (assignment.hasSubmitted) {
        if (assignment.submission?.grade !== undefined) {
          return (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Graded
            </Badge>
          );
        }
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Upload className="w-3 h-3 mr-1" />
            Submitted
          </Badge>
        );
      }
      if (assignment.isOverdue) {
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="border-orange-300 text-orange-600">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      }`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Assignments
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAssignments} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Assignments Yet
          </h3>
          <p className="text-gray-600 mb-6">
            {userRole === "instructor"
              ? "Create your first assignment to get started with course assessments."
              : "Your instructor hasn't created any assignments yet. Check back later!"}
          </p>
          {userRole === "instructor" && (
            <Button asChild className="btn-brand-primary">
              <Link href={`/assignments/create?courseId=${courseId}`}>
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Course Assignments
          </h2>
          <p className="text-gray-600">
            {userRole === "instructor"
              ? "Manage and track assignment submissions"
              : "View and submit your course assignments"}
          </p>
        </div>
        {userRole === "instructor" && (
          <Button asChild className="btn-brand-primary">
            <Link href={`/assignments/create?courseId=${courseId}`}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Link>
          </Button>
        )}
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-lg text-gray-900">
                      {assignment.title}
                    </CardTitle>
                    {getStatusBadge(assignment)}
                  </div>
                  <CardDescription className="text-gray-600">
                    {assignment.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/assignments/${assignment.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  {userRole === "student" && !assignment.hasSubmitted && (
                    <Button asChild size="sm" className="btn-brand-primary">
                      <Link href={`/assignments/${assignment.id}/submit`}>
                        <Upload className="w-4 h-4 mr-1" />
                        Submit
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Due Date */}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDueDate(
                        assignment.effectiveDueDate || assignment.dueDate
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(
                        assignment.effectiveDueDate || assignment.dueDate
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.totalPoints} points
                    </div>
                    {assignment.submission?.grade !== undefined && (
                      <div className="text-xs text-green-600 font-medium">
                        Grade: {assignment.submission.grade}/
                        {assignment.totalPoints}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submissions (for instructors) */}
                {userRole === "instructor" && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.submissionCount} submissions
                      </div>
                      <div className="text-xs text-gray-500">
                        {assignment.gradedCount} graded
                      </div>
                    </div>
                  </div>
                )}

                {/* Submission Status (for students) */}
                {userRole === "student" && assignment.hasSubmitted && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Submitted
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(
                          assignment.submission!.submittedAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback (for students) */}
              {userRole === "student" && assignment.submission?.feedback && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Instructor Feedback
                  </h4>
                  <p className="text-sm text-blue-800">
                    {assignment.submission.feedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
