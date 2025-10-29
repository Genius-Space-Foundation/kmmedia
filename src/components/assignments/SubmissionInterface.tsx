"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MultiFileUpload, UploadFile } from "./MultiFileUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Eye,
  Download,
  Save,
  Send,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Types
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
}

interface ExistingSubmission {
  id: string;
  submissionText?: string;
  files: Array<{
    id: string;
    originalName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    cloudinaryUrl: string;
    uploadedAt: Date;
  }>;
  status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED" | "RESUBMITTED";
  submittedAt?: Date;
  lastModifiedAt: Date;
}

interface SubmissionData {
  assignmentId: string;
  submissionText?: string;
  files: Array<{
    id: string;
    originalName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    cloudinaryUrl: string;
  }>;
}

interface SubmissionInterfaceProps {
  assignment: Assignment;
  existingSubmission?: ExistingSubmission;
  onSubmissionComplete: (submission: any) => void;
  onSaveDraft?: (submissionData: SubmissionData) => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function SubmissionInterface({
  assignment,
  existingSubmission,
  onSubmissionComplete,
  onSaveDraft,
  onBack,
  isLoading = false,
  className,
}: SubmissionInterfaceProps) {
  // State management
  const [submissionText, setSubmissionText] = useState(
    existingSubmission?.submissionText || ""
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize existing files
  useEffect(() => {
    if (existingSubmission?.files) {
      const existingFiles: UploadFile[] = existingSubmission.files.map(
        (file) => ({
          id: file.id,
          file: new File([], file.originalName), // Placeholder file object
          name: file.originalName,
          size: file.fileSize,
          type: file.fileType,
          url: file.cloudinaryUrl,
          uploadProgress: 100,
          status: "completed" as const,
        })
      );
      setUploadedFiles(existingFiles);
    }
  }, [existingSubmission]);

  // Track unsaved changes
  useEffect(() => {
    const hasTextChanges =
      submissionText !== (existingSubmission?.submissionText || "");
    const hasFileChanges =
      uploadedFiles.length !== (existingSubmission?.files?.length || 0);
    setHasUnsavedChanges(hasTextChanges || hasFileChanges);
  }, [submissionText, uploadedFiles, existingSubmission]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !onSaveDraft) return;

    const autoSaveTimer = setTimeout(async () => {
      await handleSaveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [submissionText, uploadedFiles, hasUnsavedChanges]);

  // File upload handler
  const handleFileUpload = useCallback(
    async (files: File[]): Promise<string[]> => {
      setIsUploading(true);
      setUploadProgress(0);
      setErrors([]);

      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        // Add upload options
        const uploadOptions = {
          assignmentId: assignment.id,
          allowedFormats: assignment.allowedFormats,
          maxFileSize: assignment.maxFileSize * 1024 * 1024, // Convert MB to bytes
          maxFiles: assignment.maxFiles,
        };
        formData.append("options", JSON.stringify(uploadOptions));

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Upload failed");
        }

        const result = await response.json();

        if (!result.success) {
          if (result.errors) {
            const errorMessages = result.errors.map(
              (error: any) => `${error.fileName}: ${error.error}`
            );
            setErrors(errorMessages);
          }
          throw new Error(result.message || "Upload failed");
        }

        // Return URLs for successful uploads
        return result.files.map((file: any) => file.url);
      } catch (error) {
        console.error("Upload error:", error);
        setErrors([error instanceof Error ? error.message : "Upload failed"]);
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [assignment]
  );

  // Save draft handler
  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      const submissionData: SubmissionData = {
        assignmentId: assignment.id,
        submissionText: submissionText.trim() || undefined,
        files: uploadedFiles
          .filter((file) => file.status === "completed" && file.url)
          .map((file) => ({
            id: file.id,
            originalName: file.name,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            cloudinaryUrl: file.url!,
          })),
      };

      await onSaveDraft(submissionData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Save draft error:", error);
      setErrors(["Failed to save draft"]);
    } finally {
      setIsSaving(false);
    }
  }, [assignment.id, submissionText, uploadedFiles, onSaveDraft]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Validate submission
      const completedFiles = uploadedFiles.filter(
        (file) => file.status === "completed"
      );

      if (completedFiles.length === 0 && !submissionText.trim()) {
        setErrors(["Please add files or text to your submission"]);
        return;
      }

      // Prepare submission data
      const submissionData = {
        assignmentId: assignment.id,
        submissionText: submissionText.trim() || undefined,
        files: completedFiles.map((file) => ({
          id: file.id,
          originalName: file.name,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          cloudinaryUrl: file.url!,
        })),
        submittedAt: new Date(),
        status: "SUBMITTED" as const,
      };

      // Call submission handler
      await onSubmissionComplete(submissionData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors([error instanceof Error ? error.message : "Submission failed"]);
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  }, [assignment.id, submissionText, uploadedFiles, onSubmissionComplete]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Check if submission is valid
  const isSubmissionValid = () => {
    const hasFiles = uploadedFiles.some((file) => file.status === "completed");
    const hasText = submissionText.trim().length > 0;
    const hasFailedUploads = uploadedFiles.some(
      (file) => file.status === "error"
    );

    return (hasFiles || hasText) && !hasFailedUploads && !isUploading;
  };

  // Get submission status
  const getSubmissionStatus = () => {
    if (assignment.isOverdue && !assignment.allowLateSubmission) {
      return {
        canSubmit: false,
        message: "Assignment is overdue and late submissions are not allowed",
        variant: "destructive" as const,
      };
    }

    if (assignment.isOverdue && assignment.allowLateSubmission) {
      return {
        canSubmit: true,
        message: `Late submission will incur a ${assignment.latePenalty}% penalty per day`,
        variant: "warning" as const,
      };
    }

    return {
      canSubmit: true,
      message: "Ready to submit",
      variant: "default" as const,
    };
  };

  const submissionStatus = getSubmissionStatus();

  if (isLoading) {
    return (
      <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignment
          </Button>
        )}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          {existingSubmission?.status === "DRAFT" && (
            <Badge variant="secondary">Draft</Badge>
          )}
        </div>
      </div>

      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Submit: {assignment.title}</span>
            <Badge variant="outline">{assignment.totalPoints} points</Badge>
          </CardTitle>
          <div className="text-sm text-gray-600">
            Due: {format(new Date(assignment.effectiveDueDate), "PPP 'at' p")}
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Alert */}
          {!submissionStatus.canSubmit && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submissionStatus.message}</AlertDescription>
            </Alert>
          )}

          {assignment.isOverdue &&
            assignment.allowLateSubmission &&
            submissionStatus.canSubmit && (
              <Alert className="mb-4" variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submissionStatus.message}</AlertDescription>
              </Alert>
            )}

          {/* Submission Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">File Formats</h4>
              <div className="flex flex-wrap gap-1">
                {assignment.allowedFormats.map((format) => (
                  <Badge key={format} variant="outline" className="text-xs">
                    {format.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">File Limits</h4>
              <div className="text-sm text-gray-600">
                <div>Max files: {assignment.maxFiles}</div>
                <div>Max size: {assignment.maxFileSize}MB each</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <div className="flex items-center gap-2">
                {submissionStatus.canSubmit ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {submissionStatus.canSubmit ? "Ready" : "Cannot Submit"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiFileUpload
            accept={assignment.allowedFormats.map((f) => `.${f}`).join(",")}
            maxSize={assignment.maxFileSize}
            maxFiles={assignment.maxFiles}
            multiple={assignment.maxFiles > 1}
            onFilesChange={setUploadedFiles}
            onUpload={handleFileUpload}
            disabled={!submissionStatus.canSubmit}
            label="Upload your assignment files"
            description="Drag and drop files here or click to browse"
            allowRetry={true}
            showPreview={true}
            autoUpload={true}
            uploadConcurrency={2}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading files...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text Submission Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Comments (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any additional comments, explanations, or notes about your submission..."
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            disabled={!submissionStatus.canSubmit}
            rows={6}
            className="resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {submissionText.length} characters
            </span>
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600">
                Auto-save in progress...
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {onSaveDraft && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!hasUnsavedChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!isSubmissionValid()}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>

        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!isSubmissionValid() || !submissionStatus.canSubmit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Assignment
        </Button>
      </div>

      {/* Submission Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your assignment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Submission Summary:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  Files:{" "}
                  {uploadedFiles.filter((f) => f.status === "completed").length}{" "}
                  of {assignment.maxFiles} allowed
                </div>
                <div>Text: {submissionText.trim() ? "Included" : "None"}</div>
                {assignment.isOverdue && assignment.allowLateSubmission && (
                  <div className="text-orange-600 font-medium">
                    Late penalty: {assignment.latePenalty}% per day
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Preview</DialogTitle>
            <DialogDescription>
              Review your submission before submitting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Files Preview */}
            {uploadedFiles.filter((f) => f.status === "completed").length >
              0 && (
              <div>
                <h4 className="font-medium mb-3">Files to Submit:</h4>
                <div className="space-y-2">
                  {uploadedFiles
                    .filter((f) => f.status === "completed")
                    .map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm font-medium">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        {file.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.url, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Text Preview */}
            {submissionText.trim() && (
              <div>
                <h4 className="font-medium mb-3">Additional Comments:</h4>
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {submissionText}
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {uploadedFiles.filter((f) => f.status === "completed").length ===
              0 &&
              !submissionText.trim() && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content to preview</p>
                </div>
              )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
