"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  FileText,
  Download,
  User,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Star,
  Upload,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { format, formatDistanceToNow, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { AssignmentCountdown } from "./AssignmentCountdown";

// Types based on the assignment service
interface AssignmentForStudent {
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
  attachments?: Array<{
    id: string;
    originalName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    cloudinaryUrl: string;
    uploadedAt: Date;
  }>;
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
    feedback?: string;
    files?: Array<{
      id: string;
      originalName: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      cloudinaryUrl: string;
    }>;
  };
  extension?: {
    id: string;
    newDueDate: Date;
    reason: string;
    grantedAt: Date;
  };
  hasSubmitted: boolean;
  isOverdue: boolean;
  effectiveDueDate: Date;
}

interface AssignmentDetailProps {
  assignment: AssignmentForStudent;
  onBack?: () => void;
  onStartSubmission?: (assignmentId: string) => void;
  onViewSubmission?: (submissionId: string) => void;
  onDownloadFile?: (fileUrl: string, fileName: string) => void;
  isLoading?: boolean;
}

export function AssignmentDetail({
  assignment,
  onBack,
  onStartSubmission,
  onViewSubmission,
  onDownloadFile,
  isLoading = false,
}: AssignmentDetailProps) {
  const [activeTab, setActiveTab] = useState<
    "details" | "submission" | "feedback"
  >("details");

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Get assignment status info
  const getAssignmentStatus = () => {
    if (assignment.isOverdue && !assignment.hasSubmitted) {
      return {
        label: "Overdue",
        variant: "destructive" as const,
        icon: AlertCircle,
        description: "This assignment is past due",
      };
    }

    if (assignment.submission?.grade !== undefined) {
      return {
        label: "Graded",
        variant: "default" as const,
        icon: Star,
        description: "Your submission has been graded",
      };
    }

    if (assignment.hasSubmitted) {
      return {
        label: "Submitted",
        variant: "secondary" as const,
        icon: CheckCircle,
        description: "Waiting for instructor review",
      };
    }

    return {
      label: "Pending",
      variant: "outline" as const,
      icon: Clock,
      description: "Not yet submitted",
    };
  };

  // Get time remaining info
  const getTimeRemaining = () => {
    const now = new Date();
    const dueDate = new Date(assignment.effectiveDueDate);

    if (isAfter(now, dueDate)) {
      return {
        text: `Overdue by ${formatDistanceToNow(dueDate)}`,
        urgent: true,
      };
    }

    const timeUntilDue = formatDistanceToNow(dueDate);
    const hoursUntilDue =
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      text: `Due in ${timeUntilDue}`,
      urgent: hoursUntilDue <= 24,
    };
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file download
  const handleFileDownload = async (fileUrl: string, fileName: string) => {
    if (onDownloadFile) {
      onDownloadFile(fileUrl, fileName);
    } else {
      // Default download behavior
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const status = getAssignmentStatus();
  const timeRemaining = getTimeRemaining();
  const StatusIcon = status.icon;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
        )}
      </div>

      {/* Assignment Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                {assignment.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {assignment.course.title}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {assignment.instructor.name}
                </span>
                <span>{assignment.totalPoints} points</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={status.variant}
                className="flex items-center gap-1"
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              <div
                className={cn(
                  "text-sm",
                  timeRemaining.urgent
                    ? "text-red-600 font-medium"
                    : "text-gray-600"
                )}
              >
                {timeRemaining.text}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Due Date Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">
                  Due:{" "}
                  {format(
                    new Date(assignment.effectiveDueDate),
                    "EEEE, MMMM d, yyyy 'at' h:mm a"
                  )}
                </div>
                {assignment.extension && (
                  <div className="text-sm text-blue-600">
                    Extended from{" "}
                    {format(new Date(assignment.dueDate), "MMM d, yyyy")} -{" "}
                    {assignment.extension.reason}
                  </div>
                )}
              </div>
            </div>

            {/* Status Alert */}
            <Alert
              className={cn(
                assignment.isOverdue &&
                  !assignment.hasSubmitted &&
                  "border-red-200 bg-red-50",
                assignment.submission?.grade !== undefined &&
                  "border-green-200 bg-green-50"
              )}
            >
              <StatusIcon className="h-4 w-4" />
              <AlertDescription>
                {status.description}
                {assignment.submission?.grade !== undefined && (
                  <span className="ml-2 font-medium">
                    Grade: {assignment.submission.grade}/
                    {assignment.totalPoints}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Countdown */}
      {!assignment.hasSubmitted && (
        <AssignmentCountdown
          dueDate={new Date(assignment.effectiveDueDate)}
          title={`${assignment.title} - Time Remaining`}
          showNotifications={true}
          onReminder={(type) => {
            // Handle reminder notifications
            const messages = {
              "48h":
                "Assignment due in 48 hours! Don't forget to submit your work.",
              "24h":
                "Assignment due in 24 hours! Time to finalize your submission.",
              "1h": "Assignment due in 1 hour! Submit now to avoid being late.",
            };

            // Show browser notification if permission granted
            if (Notification.permission === "granted") {
              new Notification(`Assignment Reminder: ${assignment.title}`, {
                body: messages[type],
                icon: "/favicon.ico",
                tag: `assignment-${assignment.id}-${type}`,
              });
            }
            // Fallback to console log for development
            console.log(`Reminder: ${messages[type]}`);
          }}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("details")}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
            activeTab === "details"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          Assignment Details
        </button>
        <button
          onClick={() => setActiveTab("submission")}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
            activeTab === "submission"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          My Submission
        </button>
        {assignment.submission?.feedback && (
          <button
            onClick={() => setActiveTab("feedback")}
            className={cn(
              "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
              activeTab === "feedback"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Feedback
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {assignment.description}
              </p>
            </CardContent>
          </Card>

          {/* Instructions */}
          {assignment.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {assignment.instructions}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    File Formats
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assignment.allowedFormats.map((format) => (
                      <Badge key={format} variant="outline">
                        {format.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    File Limits
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Maximum files: {assignment.maxFiles}</div>
                    <div>
                      Maximum size:{" "}
                      {formatFileSize(assignment.maxFileSize * 1024 * 1024)}
                    </div>
                  </div>
                </div>
              </div>

              {assignment.allowLateSubmission && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <strong>Late Submission Policy:</strong> Late submissions
                    are accepted with a {assignment.latePenalty}% penalty per
                    day.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructor Materials */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Instructor Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignment.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {file.originalName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(file.fileSize)} •{" "}
                            {file.fileType.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleFileDownload(
                            file.cloudinaryUrl,
                            file.originalName
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "submission" && (
        <Card>
          <CardHeader>
            <CardTitle>My Submission</CardTitle>
          </CardHeader>
          <CardContent>
            {assignment.hasSubmitted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">
                        Submission Completed
                      </div>
                      <div className="text-sm text-green-700">
                        Submitted on{" "}
                        {format(
                          new Date(assignment.submission!.submittedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </div>
                    </div>
                  </div>
                  {onViewSubmission && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onViewSubmission(assignment.submission!.id)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  )}
                </div>

                {assignment.submission?.files &&
                  assignment.submission.files.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Submitted Files
                      </h4>
                      <div className="space-y-2">
                        {assignment.submission.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="text-sm font-medium">
                                  {file.originalName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(file.fileSize)}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleFileDownload(
                                  file.cloudinaryUrl,
                                  file.originalName
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Submission Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven't submitted your work for this assignment yet.
                </p>
                {onStartSubmission && !assignment.isOverdue && (
                  <Button onClick={() => onStartSubmission(assignment.id)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Submission
                  </Button>
                )}
                {assignment.isOverdue && !assignment.allowLateSubmission && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This assignment is overdue and late submissions are not
                      allowed.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "feedback" && assignment.submission?.feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Instructor Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignment.submission.grade !== undefined && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">
                        Grade Received
                      </div>
                      <div className="text-sm text-blue-700">
                        {assignment.submission.grade}/{assignment.totalPoints}{" "}
                        points
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      (assignment.submission.grade / assignment.totalPoints) *
                        100
                    )}
                    %
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {assignment.submission.feedback}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
