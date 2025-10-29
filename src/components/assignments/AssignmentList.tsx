"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Circle,
  Star,
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { InlineCountdown, CountdownBadge } from "./AssignmentCountdown";

// Types based on the assignment service
interface AssignmentForStudent {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  totalPoints: number;
  isPublished: boolean;
  course: {
    id: string;
    title: string;
  };
  instructor: {
    id: string;
    name: string;
  };
  submission?: {
    id: string;
    submittedAt: Date;
    status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED" | "RESUBMITTED";
    grade?: number;
  };
  extension?: {
    id: string;
    newDueDate: Date;
    reason: string;
  };
  hasSubmitted: boolean;
  isOverdue: boolean;
  effectiveDueDate: Date;
}

interface AssignmentListProps {
  assignments: AssignmentForStudent[];
  onAssignmentClick: (assignment: AssignmentForStudent) => void;
  isLoading?: boolean;
  courseId?: string;
  showCourseFilter?: boolean;
}

type SortOption = "dueDate" | "title" | "status" | "course";
type FilterOption = "all" | "pending" | "submitted" | "graded" | "overdue";

export function AssignmentList({
  assignments,
  onAssignmentClick,
  isLoading = false,
  courseId,
  showCourseFilter = true,
}: AssignmentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dueDate");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>(
    courseId || "all"
  );

  // Get unique courses for filtering
  const courses = useMemo(() => {
    const uniqueCourses = assignments.reduce((acc, assignment) => {
      if (!acc.find((c) => c.id === assignment.course.id)) {
        acc.push(assignment.course);
      }
      return acc;
    }, [] as Array<{ id: string; title: string }>);
    return uniqueCourses;
  }, [assignments]);

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    let filtered = assignments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.course.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.instructor.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply course filter
    if (selectedCourse !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.course.id === selectedCourse
      );
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter((assignment) => {
        switch (filterBy) {
          case "pending":
            return !assignment.hasSubmitted && !assignment.isOverdue;
          case "submitted":
            return assignment.hasSubmitted && !assignment.submission?.grade;
          case "graded":
            return assignment.submission?.grade !== undefined;
          case "overdue":
            return assignment.isOverdue;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return (
            new Date(a.effectiveDueDate).getTime() -
            new Date(b.effectiveDueDate).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "course":
          return a.course.title.localeCompare(b.course.title);
        case "status":
          // Sort by submission status priority
          const getStatusPriority = (assignment: AssignmentForStudent) => {
            if (assignment.isOverdue) return 0;
            if (!assignment.hasSubmitted) return 1;
            if (assignment.submission?.grade === undefined) return 2;
            return 3;
          };
          return getStatusPriority(a) - getStatusPriority(b);
        default:
          return 0;
      }
    });
  }, [assignments, searchTerm, sortBy, filterBy, selectedCourse]);

  // Get assignment status info
  const getAssignmentStatus = (assignment: AssignmentForStudent) => {
    if (assignment.isOverdue) {
      return {
        label: "Overdue",
        variant: "destructive" as const,
        icon: AlertCircle,
      };
    }

    if (assignment.submission?.grade !== undefined) {
      return {
        label: "Graded",
        variant: "default" as const,
        icon: Star,
      };
    }

    if (assignment.hasSubmitted) {
      return {
        label: "Submitted",
        variant: "secondary" as const,
        icon: CheckCircle,
      };
    }

    return {
      label: "Pending",
      variant: "outline" as const,
      icon: Circle,
    };
  };

  // Get urgency indicator
  const getUrgencyLevel = (assignment: AssignmentForStudent) => {
    const now = new Date();
    const dueDate = new Date(assignment.effectiveDueDate);
    const hoursUntilDue =
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (assignment.isOverdue) return "overdue";
    if (hoursUntilDue <= 24) return "urgent";
    if (hoursUntilDue <= 72) return "warning";
    return "normal";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      case "urgent":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assignments, courses, or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Course Filter */}
              {showCourseFilter && courses.length > 1 && (
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Status Filter */}
              <Select
                value={filterBy}
                onValueChange={(value: FilterOption) => setFilterBy(value)}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment List */}
      <div className="space-y-4">
        {filteredAndSortedAssignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assignments found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterBy !== "all" || selectedCourse !== "all"
                  ? "Try adjusting your search or filters"
                  : "No assignments have been created yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const urgency = getUrgencyLevel(assignment);
            const StatusIcon = status.icon;

            return (
              <Card
                key={assignment.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  getUrgencyColor(urgency)
                )}
                onClick={() => onAssignmentClick(assignment)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Assignment Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {assignment.description}
                          </p>
                        </div>
                        <Badge
                          variant={status.variant}
                          className="ml-4 flex items-center gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>

                      {/* Course and Instructor */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {assignment.course.title}
                        </span>
                        <span>Instructor: {assignment.instructor.name}</span>
                        <span>{assignment.totalPoints} points</span>
                      </div>
                    </div>

                    {/* Due Date and Actions */}
                    <div className="flex flex-col md:items-end gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span
                          className={cn(
                            urgency === "overdue" && "text-red-600 font-medium",
                            urgency === "urgent" &&
                              "text-orange-600 font-medium"
                          )}
                        >
                          Due{" "}
                          {format(
                            new Date(assignment.effectiveDueDate),
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>

                      {/* Countdown Timer */}
                      <div className="flex items-center gap-2">
                        <InlineCountdown
                          dueDate={new Date(assignment.effectiveDueDate)}
                          showIcon={false}
                          className="text-xs"
                        />
                        <CountdownBadge
                          dueDate={new Date(assignment.effectiveDueDate)}
                          className="text-xs"
                        />
                      </div>

                      {assignment.extension && (
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Extended from{" "}
                          {format(new Date(assignment.dueDate), "MMM d")}
                        </div>
                      )}

                      {assignment.submission?.grade !== undefined && (
                        <div className="text-sm font-medium text-green-600">
                          Grade: {assignment.submission.grade}/
                          {assignment.totalPoints}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:w-auto"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      {filteredAndSortedAssignments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span>
                Total: {filteredAndSortedAssignments.length} assignments
              </span>
              <span>
                Pending:{" "}
                {
                  filteredAndSortedAssignments.filter(
                    (a) => !a.hasSubmitted && !a.isOverdue
                  ).length
                }
              </span>
              <span>
                Submitted:{" "}
                {
                  filteredAndSortedAssignments.filter(
                    (a) => a.hasSubmitted && !a.submission?.grade
                  ).length
                }
              </span>
              <span>
                Graded:{" "}
                {
                  filteredAndSortedAssignments.filter(
                    (a) => a.submission?.grade !== undefined
                  ).length
                }
              </span>
              <span className="text-red-600">
                Overdue:{" "}
                {filteredAndSortedAssignments.filter((a) => a.isOverdue).length}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
