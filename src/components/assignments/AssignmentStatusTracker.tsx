"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Star,
  FileText,
  Upload,
  Eye,
} from "lucide-react";
import { format, isAfter, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";

// Assignment status types
export type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded"
  | "overdue"
  | "late_submitted";

export type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "GRADED"
  | "RETURNED"
  | "RESUBMITTED";

interface AssignmentStatusInfo {
  status: AssignmentStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
  progress: number;
}

interface AssignmentForStatusTracking {
  id: string;
  title: string;
  dueDate: Date;
  effectiveDueDate: Date;
  hasSubmitted: boolean;
  isOverdue: boolean;
  submission?: {
    id: string;
    submittedAt: Date;
    status: SubmissionStatus;
    grade?: number;
  };
  extension?: {
    newDueDate: Date;
    reason: string;
  };
}

interface AssignmentStatusTrackerProps {
  assignment: AssignmentForStatusTracking;
  showProgress?: boolean;
  showDescription?: boolean;
  compact?: boolean;
  className?: string;
}

interface StatusIndicatorProps {
  status: AssignmentStatusInfo;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

interface ProgressTrackerProps {
  assignment: AssignmentForStatusTracking;
  className?: string;
}

// Get comprehensive assignment status
export function getAssignmentStatus(
  assignment: AssignmentForStatusTracking
): AssignmentStatusInfo {
  const now = new Date();
  const dueDate = new Date(assignment.effectiveDueDate);
  const isOverdue = isAfter(now, dueDate);

  // Graded status
  if (assignment.submission?.grade !== undefined) {
    return {
      status: "graded",
      label: "Graded",
      description: "Your submission has been graded and feedback is available",
      icon: Star,
      variant: "default",
      color: "text-green-600 bg-green-50 border-green-200",
      progress: 100,
    };
  }

  // Late submitted
  if (assignment.hasSubmitted && assignment.submission) {
    const submittedAt = new Date(assignment.submission.submittedAt);
    const originalDueDate = new Date(assignment.dueDate);

    if (isAfter(submittedAt, originalDueDate) && !assignment.extension) {
      return {
        status: "late_submitted",
        label: "Late Submitted",
        description: "Submitted after the due date - late penalty may apply",
        icon: CheckCircle,
        variant: "secondary",
        color: "text-orange-600 bg-orange-50 border-orange-200",
        progress: 90,
      };
    }
  }

  // Submitted (on time)
  if (assignment.hasSubmitted) {
    return {
      status: "submitted",
      label: "Submitted",
      description: "Waiting for instructor review and grading",
      icon: CheckCircle,
      variant: "secondary",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      progress: 80,
    };
  }

  // Overdue
  if (isOverdue) {
    return {
      status: "overdue",
      label: "Overdue",
      description: "This assignment is past due and needs immediate attention",
      icon: AlertCircle,
      variant: "destructive",
      color: "text-red-600 bg-red-50 border-red-200",
      progress: 0,
    };
  }

  // In progress (due within 48 hours)
  const hoursUntilDue = differenceInHours(dueDate, now);
  if (hoursUntilDue <= 48) {
    return {
      status: "in_progress",
      label: "In Progress",
      description: "Due soon - time to work on this assignment",
      icon: Clock,
      variant: "outline",
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      progress: 30,
    };
  }

  // Not started
  return {
    status: "not_started",
    label: "Not Started",
    description: "Assignment is available and ready to begin",
    icon: Circle,
    variant: "outline",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    progress: 0,
  };
}

// Status indicator component
export function StatusIndicator({
  status,
  showLabel = true,
  size = "md",
}: StatusIndicatorProps) {
  const Icon = status.icon;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={status.variant} className="flex items-center gap-1">
        <Icon className={sizeClasses[size]} />
        {showLabel && status.label}
      </Badge>
    </div>
  );
}

// Progress tracker component
export function ProgressTracker({
  assignment,
  className,
}: ProgressTrackerProps) {
  const status = getAssignmentStatus(assignment);

  const steps = [
    { label: "Available", completed: true },
    { label: "In Progress", completed: status.progress >= 30 },
    { label: "Submitted", completed: status.progress >= 80 },
    { label: "Graded", completed: status.progress >= 100 },
  ];

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Assignment Progress</h4>
            <StatusIndicator status={status} size="sm" />
          </div>

          <Progress value={status.progress} className="h-2" />

          <div className="flex justify-between text-xs text-gray-500">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className={cn(
                  "flex flex-col items-center",
                  step.completed ? "text-green-600" : "text-gray-400"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mb-1",
                    step.completed ? "bg-green-600" : "bg-gray-300"
                  )}
                />
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main status tracker component
export function AssignmentStatusTracker({
  assignment,
  showProgress = false,
  showDescription = true,
  compact = false,
  className,
}: AssignmentStatusTrackerProps) {
  const status = getAssignmentStatus(assignment);
  const Icon = status.icon;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <StatusIndicator status={status} showLabel={false} size="sm" />
        <span className="text-sm text-gray-600">{status.label}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Status Header */}
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border",
          status.color
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <div>
            <div className="font-medium">{status.label}</div>
            {showDescription && (
              <div className="text-sm opacity-90">{status.description}</div>
            )}
          </div>
        </div>

        {/* Additional Status Info */}
        <div className="text-right text-sm">
          {assignment.submission?.grade !== undefined && (
            <div className="font-medium">
              Grade: {assignment.submission.grade}
            </div>
          )}
          {assignment.hasSubmitted && assignment.submission && (
            <div className="text-xs opacity-75">
              Submitted{" "}
              {format(new Date(assignment.submission.submittedAt), "MMM d")}
            </div>
          )}
          {assignment.extension && (
            <div className="text-xs opacity-75">
              Extended to{" "}
              {format(new Date(assignment.extension.newDueDate), "MMM d")}
            </div>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      {showProgress && <ProgressTracker assignment={assignment} />}

      {/* Submission Details */}
      {assignment.submission && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Submission Details</span>
              </div>
              <div className="text-xs text-gray-500">
                {format(
                  new Date(assignment.submission.submittedAt),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </div>
            </div>

            {assignment.submission.grade !== undefined && (
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Grade Received</span>
                  <span className="font-medium text-green-900">
                    {assignment.submission.grade} points
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overdue Warning */}
      {status.status === "overdue" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Action Required</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              This assignment is overdue. Contact your instructor if you need an
              extension.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Deadline Warning */}
      {status.status === "in_progress" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Due Soon</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Due{" "}
              {format(
                new Date(assignment.effectiveDueDate),
                "EEEE 'at' h:mm a"
              )}{" "}
              - Don't forget to submit your work!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Utility function to get status summary for multiple assignments
export function getAssignmentsSummary(
  assignments: AssignmentForStatusTracking[]
) {
  const summary = assignments.reduce((acc, assignment) => {
    const status = getAssignmentStatus(assignment);
    acc[status.status] = (acc[status.status] || 0) + 1;
    return acc;
  }, {} as Record<AssignmentStatus, number>);

  return {
    total: assignments.length,
    notStarted: summary.not_started || 0,
    inProgress: summary.in_progress || 0,
    submitted: summary.submitted || 0,
    graded: summary.graded || 0,
    overdue: summary.overdue || 0,
    lateSubmitted: summary.late_submitted || 0,
  };
}

// Bulk status display component
interface AssignmentsSummaryProps {
  assignments: AssignmentForStatusTracking[];
  className?: string;
}

export function AssignmentsSummary({
  assignments,
  className,
}: AssignmentsSummaryProps) {
  const summary = getAssignmentsSummary(assignments);

  const statusItems = [
    { label: "Not Started", count: summary.notStarted, color: "text-gray-600" },
    {
      label: "In Progress",
      count: summary.inProgress,
      color: "text-yellow-600",
    },
    { label: "Submitted", count: summary.submitted, color: "text-blue-600" },
    { label: "Graded", count: summary.graded, color: "text-green-600" },
    { label: "Overdue", count: summary.overdue, color: "text-red-600" },
  ];

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">Assignment Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statusItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className={cn("text-2xl font-bold", item.color)}>
                {item.count}
              </div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
          <span className="text-sm text-gray-600">
            Total: {summary.total} assignments
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
