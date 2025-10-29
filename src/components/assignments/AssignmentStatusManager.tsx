"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Edit,
  Eye,
  Trash2,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  totalPoints: number;
  isPublished: boolean;
  submissionCount: number;
  gradedCount: number;
  course: {
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AssignmentStatusManagerProps {
  assignments: Assignment[];
  onEdit: (assignment: Assignment) => void;
  onPreview: (assignment: Assignment) => void;
  onPublish: (assignmentId: string) => Promise<void>;
  onDelete: (assignmentId: string) => Promise<void>;
  onViewSubmissions: (assignment: Assignment) => void;
  isLoading?: boolean;
}

export function AssignmentStatusManager({
  assignments,
  onEdit,
  onPreview,
  onPublish,
  onDelete,
  onViewSubmissions,
  isLoading = false,
}: AssignmentStatusManagerProps) {
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handlePublish = async (assignmentId: string) => {
    setPublishingId(assignmentId);
    try {
      await onPublish(assignmentId);
    } catch (error) {
      console.error("Error publishing assignment:", error);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    setDeletingId(assignmentId);
    try {
      await onDelete(assignmentId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting assignment:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.isPublished) {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Draft</span>
        </Badge>
      );
    }

    const now = new Date();
    const isPastDue = now > assignment.dueDate;

    if (isPastDue) {
      return (
        <Badge variant="destructive" className="flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>Past Due</span>
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center space-x-1">
        <CheckCircle className="h-3 w-3" />
        <span>Active</span>
      </Badge>
    );
  };

  const getGradingProgress = (assignment: Assignment) => {
    if (assignment.submissionCount === 0) return 0;
    return Math.round(
      (assignment.gradedCount / assignment.submissionCount) * 100
    );
  };

  const canDelete = (assignment: Assignment) => {
    return assignment.submissionCount === 0;
  };

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assignments yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first assignment to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <p className="text-sm text-gray-600">
                  {assignment.course.title}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(assignment)}
                <Badge variant="outline">{assignment.totalPoints} pts</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Assignment Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p className="text-gray-600">
                      {format(assignment.dueDate, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Submissions</p>
                    <p className="text-gray-600">
                      {assignment.submissionCount} submitted
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Grading Progress</p>
                    <p className="text-gray-600">
                      {assignment.gradedCount}/{assignment.submissionCount}{" "}
                      graded
                      {assignment.submissionCount > 0 && (
                        <span className="ml-1">
                          ({getGradingProgress(assignment)}%)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Preview */}
              <div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {assignment.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(assignment)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(assignment)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {assignment.submissionCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubmissions(assignment)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View Submissions
                    </Button>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!assignment.isPublished && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(assignment.id)}
                      disabled={publishingId === assignment.id}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {publishingId === assignment.id
                        ? "Publishing..."
                        : "Publish"}
                    </Button>
                  )}
                  {canDelete(assignment) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirmId(assignment.id)}
                      disabled={deletingId === assignment.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Messages */}
              {!assignment.isPublished && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Draft Assignment
                      </p>
                      <p className="text-sm text-yellow-700">
                        This assignment is not visible to students yet. Publish
                        it to make it available.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {assignment.isPublished && assignment.submissionCount === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Published Assignment
                      </p>
                      <p className="text-sm text-blue-700">
                        This assignment is live and visible to students. No
                        submissions yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deletingId === deleteConfirmId}
            >
              {deletingId === deleteConfirmId ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
