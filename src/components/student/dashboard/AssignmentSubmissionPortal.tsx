"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmissionInterface } from "@/components/assignments/SubmissionInterface";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Search,
  Upload,
  Eye,
  ArrowRight,
  Filter,
  BookOpen
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  totalPoints: number;
  maxFileSize: number;
  allowedFormats: string[];
  maxFiles: number;
  allowLateSubmission: boolean;
  latePenalty?: number;
  course: {
    id: string;
    title: string;
  };
  instructor: {
    id: string;
    name: string;
  };
  effectiveDueDate: Date;
  isOverdue: boolean;
  submission?: {
    id: string;
    status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED" | "RESUBMITTED";
    submittedAt?: Date;
    grade?: number;
    feedback?: string;
  };
}

interface AssignmentSubmissionPortalProps {
  userId: string;
  className?: string;
}

export default function AssignmentSubmissionPortal({
  userId,
  className,
}: AssignmentSubmissionPortalProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // Fetch assignments
  useEffect(() => {
    fetchAssignments();
  }, [userId]);

  // Filter assignments
  useEffect(() => {
    let filtered = assignments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assignment.course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((assignment) => {
        switch (statusFilter) {
          case "pending":
            return !assignment.submission && !assignment.isOverdue;
          case "submitted":
            return assignment.submission?.status === "SUBMITTED";
          case "graded":
            return assignment.submission?.status === "GRADED";
          case "overdue":
            return assignment.isOverdue && !assignment.submission;
          case "draft":
            return assignment.submission?.status === "DRAFT";
          default:
            return true;
        }
      });
    }

    // Course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.course.id === courseFilter
      );
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchQuery, statusFilter, courseFilter]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/student/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      
      const data = await response.json();
      
      console.log("DEBUG: Frontend Assignments Response", data);

      if (data.success && data.data && Array.isArray(data.data.assignments)) {
        // Transform data to match our interface
        const transformedAssignments = data.data.assignments.map((a: any) => ({
          ...a,
          dueDate: new Date(a.dueDate),
          effectiveDueDate: new Date(a.effectiveDueDate || a.dueDate),
          isOverdue: isPast(new Date(a.dueDate)),
          submission: a.submission ? {
            ...a.submission,
            submittedAt: a.submission.submittedAt ? new Date(a.submission.submittedAt) : undefined,
          } : undefined,
        }));
        
        setAssignments(transformedAssignments);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmissionComplete = async (submissionData: any) => {
    try {
      const response = await fetch("/api/student/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error("Submission failed");

      const result = await response.json();
      
      // Refresh assignments
      await fetchAssignments();
      
      // Go back to list view
      setSelectedAssignment(null);
      
      // Show success message
      alert("Assignment submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      throw error;
    }
  };

  const handleSaveDraft = async (submissionData: any) => {
    try {
      const response = await fetch("/api/student/assignments/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error("Failed to save draft");
      
      console.log("Draft saved successfully");
    } catch (error) {
      console.error("Save draft error:", error);
      throw error;
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submission?.status === "GRADED") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Graded
        </Badge>
      );
    }

    if (assignment.submission?.status === "SUBMITTED") {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Submitted
        </Badge>
      );
    }

    if (assignment.submission?.status === "DRAFT") {
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
          <Clock className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
    }

    if (assignment.isOverdue) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-gray-600 bg-gray-50">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getUniqueCourses = () => {
    const courses = assignments.map((a) => a.course);
    const uniqueCourses = courses.filter(
      (course, index, self) =>
        index === self.findIndex((c) => c.id === course.id)
    );
    return uniqueCourses;
  };

  // If viewing a specific assignment
  if (selectedAssignment) {
    return (
      <div className={className}>
        <SubmissionInterface
          assignment={selectedAssignment}
          existingSubmission={selectedAssignment.submission as any}
          onSubmissionComplete={handleSubmissionComplete}
          onSaveDraft={handleSaveDraft}
          onBack={() => setSelectedAssignment(null)}
          isLoading={false}
        />
      </div>
    );
  }

  // Assignment list view
  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Assignments</h2>
          <p className="text-muted-foreground mt-1">
            Manage and submit your course assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {filteredAssignments.length} Active
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[200px]">
              <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {getUniqueCourses().map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignments List */}
      {!isLoading && filteredAssignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-lg border border-dashed">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assignments found
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {searchQuery || statusFilter !== "all" || courseFilter !== "all"
              ? "Try adjusting your filters to find what you're looking for."
              : "You don't have any assignments yet. Check back later!"}
          </p>
        </div>
      )}

      {!isLoading && filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {filteredAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="group hover:shadow-md transition-all duration-300 border-gray-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {assignment.title}
                          </h3>
                          {getStatusBadge(assignment)}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {assignment.course.title}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-2">
                      {assignment.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                        <Calendar className="h-4 w-4" />
                        <span>Due {format(assignment.dueDate, "MMM d, yyyy")}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                        <FileText className="h-4 w-4" />
                        <span>{assignment.totalPoints} Points</span>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                        <Clock className="h-4 w-4" />
                        <span className={cn(
                          assignment.isOverdue ? "text-red-600 font-medium" : ""
                        )}>
                          {assignment.isOverdue
                            ? "Overdue"
                            : formatDistanceToNow(assignment.dueDate, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Content / Actions */}
                  <div className="flex flex-col justify-between gap-4 min-w-[200px] border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                    {assignment.submission?.status === "GRADED" && assignment.submission.grade !== undefined ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
                        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Grade</span>
                        <div className="text-2xl font-bold text-emerald-700 mt-1">
                          {assignment.submission.grade}/{assignment.totalPoints}
                        </div>
                        <div className="text-sm text-emerald-600 mt-1 font-medium">
                          {Math.round((assignment.submission.grade / assignment.totalPoints) * 100)}%
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {assignment.submission ? "Submitted" : "Not Submitted"}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      {assignment.submission?.status === "GRADED" || assignment.submission?.status === "SUBMITTED" ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Submission
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => setSelectedAssignment(assignment)}
                          disabled={assignment.isOverdue && !assignment.allowLateSubmission}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {assignment.submission?.status === "DRAFT" ? "Continue Draft" : "Submit Work"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
