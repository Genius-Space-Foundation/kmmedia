"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { UploadedFile } from "@/components/ui/file-upload";

interface AssignmentPreviewData {
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  totalPoints: number;
  maxFileSize: number;
  maxFiles: number;
  allowedFormats: string[];
  allowLateSubmission: boolean;
  latePenalty?: number;
  attachments?: UploadedFile[];
  courseId: string;
}

interface AssignmentPreviewProps {
  data: AssignmentPreviewData;
  isOpen: boolean;
  onClose: () => void;
  onPublish?: () => void;
  onEdit?: () => void;
  isPublishing?: boolean;
  courseName?: string;
}

const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF Documents",
  doc: "Word Documents (.doc)",
  docx: "Word Documents (.docx)",
  jpg: "JPEG Images",
  png: "PNG Images",
  mp4: "MP4 Videos",
  mov: "MOV Videos",
  avi: "AVI Videos",
};

export function AssignmentPreview({
  data,
  isOpen,
  onClose,
  onPublish,
  onEdit,
  isPublishing = false,
  courseName,
}: AssignmentPreviewProps) {
  const formatFileSize = (mb: number) => {
    return mb >= 1000 ? `${mb / 1000}GB` : `${mb}MB`;
  };

  const getTimeUntilDue = () => {
    const now = new Date();
    const timeDiff = data.dueDate.getTime() - now.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (days < 0) return "Past due";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  };

  const isValidForPublishing = () => {
    return (
      data.title &&
      data.description &&
      data.dueDate &&
      data.totalPoints > 0 &&
      data.allowedFormats.length > 0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Assignment Preview</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{data.title}</CardTitle>
                  {courseName && (
                    <p className="text-sm text-gray-600">
                      Course: {courseName}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {data.totalPoints} points
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-gray-600">
                      {format(data.dueDate, "PPP 'at' p")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Time Remaining</p>
                    <p className="text-sm text-gray-600">{getTimeUntilDue()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Submission Format</p>
                    <p className="text-sm text-gray-600">
                      {data.maxFiles} file{data.maxFiles > 1 ? "s" : ""} max
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{data.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          {data.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{data.instructions}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submission Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    File Formats Accepted
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.allowedFormats.map((format) => (
                      <Badge key={format} variant="secondary">
                        {FORMAT_LABELS[format] || format.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">File Limits</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Maximum files: {data.maxFiles}</p>
                    <p>
                      Maximum size per file: {formatFileSize(data.maxFileSize)}
                    </p>
                  </div>
                </div>
              </div>

              {data.allowLateSubmission && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Late Submission Policy
                      </p>
                      <p className="text-sm text-yellow-700">
                        Late submissions are accepted with a {data.latePenalty}%
                        penalty per day.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructor Materials */}
          {data.attachments && data.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructor Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Publishing Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Publishing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isValidForPublishing() ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Assignment is ready to publish
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Assignment needs completion before publishing
                    </span>
                  </div>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Title: {data.title ? "Complete" : "Missing"}</p>
                  <p>
                    ✓ Description: {data.description ? "Complete" : "Missing"}
                  </p>
                  <p>✓ Due Date: {data.dueDate ? "Set" : "Missing"}</p>
                  <p>✓ Points: {data.totalPoints > 0 ? "Set" : "Missing"}</p>
                  <p>
                    ✓ File Formats:{" "}
                    {data.allowedFormats.length > 0 ? "Set" : "Missing"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onEdit}>
              Edit Assignment
            </Button>
            <Button
              onClick={onPublish}
              disabled={!isValidForPublishing() || isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish Assignment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
