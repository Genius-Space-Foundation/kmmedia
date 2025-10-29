"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  Video,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress: number;
  status: "pending" | "uploading" | "completed" | "error" | "cancelled";
  error?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
}

interface UploadQueueItem extends UploadFile {
  retryCount: number;
  uploadStartTime?: number;
  uploadSpeed?: number; // bytes per second
  estimatedTimeRemaining?: number; // seconds
}

interface MultiFileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  onFilesChange?: (files: UploadFile[]) => void;
  onUpload?: (
    files: File[]
  ) => Promise<
    Array<{ url: string; previewUrl?: string; thumbnailUrl?: string }>
  >;
  onFileRemove?: (fileId: string) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
  allowRetry?: boolean;
  showPreview?: boolean;
  autoUpload?: boolean;
  uploadConcurrency?: number; // Number of concurrent uploads
}

const ALLOWED_TYPES = {
  "application/pdf": { icon: FileText, color: "text-red-500", name: "PDF" },
  "application/msword": { icon: FileText, color: "text-blue-500", name: "DOC" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    color: "text-blue-500",
    name: "DOCX",
  },
  "image/jpeg": { icon: Image, color: "text-green-500", name: "JPEG" },
  "image/png": { icon: Image, color: "text-green-500", name: "PNG" },
  "image/gif": { icon: Image, color: "text-green-500", name: "GIF" },
  "video/mp4": { icon: Video, color: "text-purple-500", name: "MP4" },
  "video/quicktime": { icon: Video, color: "text-purple-500", name: "MOV" },
  "video/x-msvideo": { icon: Video, color: "text-purple-500", name: "AVI" },
};

export function MultiFileUpload({
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi",
  maxSize = 10,
  maxFiles = 5,
  multiple = true,
  onFilesChange,
  onUpload,
  onFileRemove,
  className,
  disabled = false,
  label = "Upload Files",
  description = "Drag and drop files here or click to browse",
  allowRetry = true,
  showPreview = true,
  autoUpload = true,
  uploadConcurrency = 2,
}: MultiFileUploadProps) {
  const [files, setFiles] = useState<UploadQueueItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
  const [globalProgress, setGlobalProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortControllers = useRef<Map<string, AbortController>>(
    new Map()
  );

  // Calculate global progress
  useEffect(() => {
    if (files.length === 0) {
      setGlobalProgress(0);
      return;
    }

    const totalProgress = files.reduce(
      (sum, file) => sum + file.uploadProgress,
      0
    );
    const averageProgress = totalProgress / files.length;
    setGlobalProgress(averageProgress);
  }, [files]);

  // Process upload queue
  useEffect(() => {
    if (
      !onUpload ||
      uploadQueue.length === 0 ||
      activeUploads.size >= uploadConcurrency
    ) {
      return;
    }

    const nextFileId = uploadQueue[0];
    const file = files.find((f) => f.id === nextFileId);

    if (!file || file.status !== "pending") {
      setUploadQueue((prev) => prev.slice(1));
      return;
    }

    uploadFile(file);
  }, [uploadQueue, activeUploads, files, onUpload, uploadConcurrency]);

  // Update parent component when files change
  useEffect(() => {
    const uploadFiles = files.map((f) => ({
      id: f.id,
      file: f.file,
      name: f.name,
      size: f.size,
      type: f.type,
      url: f.url,
      uploadProgress: f.uploadProgress,
      status: f.status,
      error: f.error,
      previewUrl: f.previewUrl,
      thumbnailUrl: f.thumbnailUrl,
    }));
    onFilesChange?.(uploadFiles);
  }, [files, onFilesChange]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      acceptedTypes.includes(file.type) ||
      acceptedTypes.includes(fileExtension);

    if (!isValidType) {
      return `File type not supported. Accepted types: ${accept}`;
    }

    return null;
  };

  const generateFileId = () => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const uploadFile = async (file: UploadQueueItem) => {
    const abortController = new AbortController();
    uploadAbortControllers.current.set(file.id, abortController);

    setActiveUploads((prev) => new Set([...prev, file.id]));
    setIsUploading(true);

    // Update file status to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.id === file.id
          ? { ...f, status: "uploading" as const, uploadStartTime: Date.now() }
          : f
      )
    );

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id === file.id && f.status === "uploading") {
              const newProgress = Math.min(
                f.uploadProgress + Math.random() * 15,
                95
              );

              // Calculate upload speed and ETA
              const elapsed =
                (Date.now() - (f.uploadStartTime || Date.now())) / 1000;
              const uploadSpeed =
                elapsed > 0 ? (f.size * newProgress) / 100 / elapsed : 0;
              const remainingBytes = (f.size * (100 - newProgress)) / 100;
              const estimatedTimeRemaining =
                uploadSpeed > 0 ? remainingBytes / uploadSpeed : 0;

              return {
                ...f,
                uploadProgress: newProgress,
                uploadSpeed,
                estimatedTimeRemaining,
              };
            }
            return f;
          })
        );
      }, 200);

      // Actual upload
      const result = await onUpload!([file.file]);

      clearInterval(progressInterval);

      if (abortController.signal.aborted) {
        throw new Error("Upload cancelled");
      }

      // Update file with success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                status: "completed" as const,
                uploadProgress: 100,
                url: result[0]?.url,
                previewUrl: result[0]?.previewUrl,
                thumbnailUrl: result[0]?.thumbnailUrl,
                error: undefined,
              }
            : f
        )
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                status: "error" as const,
                error: errorMessage,
                retryCount: f.retryCount + 1,
              }
            : f
        )
      );
    } finally {
      uploadAbortControllers.current.delete(file.id);
      setActiveUploads((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });

      setUploadQueue((prev) => prev.filter((id) => id !== file.id));

      if (activeUploads.size <= 1) {
        setIsUploading(false);
      }
    }
  };

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Check max files limit
      if (files.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validFiles: UploadQueueItem[] = [];
      const invalidFiles: string[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          invalidFiles.push(`${file.name}: ${error}`);
        } else {
          validFiles.push({
            id: generateFileId(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadProgress: 0,
            status: "pending",
            retryCount: 0,
          });
        }
      });

      if (invalidFiles.length > 0) {
        alert("Some files were rejected:\n" + invalidFiles.join("\n"));
      }

      if (validFiles.length === 0) return;

      // Add files to state
      setFiles((prev) => [...prev, ...validFiles]);

      // Add to upload queue if auto-upload is enabled
      if (autoUpload && onUpload) {
        setUploadQueue((prev) => [...prev, ...validFiles.map((f) => f.id)]);
      }
    },
    [files, maxFiles, maxSize, accept, autoUpload, onUpload]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [disabled, handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleFiles(selectedFiles);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (fileId: string) => {
      // Cancel upload if in progress
      const abortController = uploadAbortControllers.current.get(fileId);
      if (abortController) {
        abortController.abort();
      }

      // Remove from queue and files
      setUploadQueue((prev) => prev.filter((id) => id !== fileId));
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      setActiveUploads((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });

      onFileRemove?.(fileId);
    },
    [onFileRemove]
  );

  const retryUpload = useCallback(
    (fileId: string) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "pending" as const,
                error: undefined,
                uploadProgress: 0,
              }
            : f
        )
      );

      if (autoUpload && onUpload) {
        setUploadQueue((prev) => [...prev, fileId]);
      }
    },
    [autoUpload, onUpload]
  );

  const startManualUpload = useCallback(() => {
    if (!onUpload) return;

    const pendingFiles = files.filter((f) => f.status === "pending");
    setUploadQueue((prev) => [...prev, ...pendingFiles.map((f) => f.id)]);
  }, [files, onUpload]);

  const cancelAllUploads = useCallback(() => {
    uploadAbortControllers.current.forEach((controller) => controller.abort());
    setUploadQueue([]);
    setActiveUploads(new Set());
    setIsUploading(false);

    setFiles((prev) =>
      prev.map((f) =>
        f.status === "uploading"
          ? { ...f, status: "cancelled" as const, error: "Upload cancelled" }
          : f
      )
    );
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getFileIcon = (fileType: string) => {
    const typeInfo = ALLOWED_TYPES[fileType as keyof typeof ALLOWED_TYPES];
    if (typeInfo) {
      const IconComponent = typeInfo.icon;
      return <IconComponent className={cn("h-4 w-4", typeInfo.color)} />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "uploading":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const completedFiles = files.filter((f) => f.status === "completed").length;
  const errorFiles = files.filter((f) => f.status === "error").length;
  const uploadingFiles = files.filter((f) => f.status === "uploading").length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || files.length >= maxFiles}
          >
            Choose Files
          </Button>
          <p className="text-xs text-gray-400">
            Max {maxFiles} files, {maxSize}MB each
          </p>
        </div>
      </div>

      {/* Global Progress */}
      {isUploading && files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Uploading {uploadingFiles} of {files.length} files...
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {Math.round(globalProgress)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelAllUploads}
                className="h-6 px-2"
              >
                Cancel All
              </Button>
            </div>
          </div>
          <Progress value={globalProgress} className="h-2" />
        </div>
      )}

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
            {completedFiles > 0 && (
              <Badge
                variant="secondary"
                className="text-green-700 bg-green-100"
              >
                {completedFiles} completed
              </Badge>
            )}
            {errorFiles > 0 && (
              <Badge variant="destructive">{errorFiles} failed</Badge>
            )}
            {uploadingFiles > 0 && (
              <Badge variant="outline" className="text-blue-700">
                {uploadingFiles} uploading
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!autoUpload && onUpload && (
              <Button
                variant="outline"
                size="sm"
                onClick={startManualUpload}
                disabled={
                  files.filter((f) => f.status === "pending").length === 0
                }
              >
                Upload All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {getFileIcon(file.type)}
                {getStatusIcon(file.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {file.status === "uploading" && (
                      <span className="text-xs text-blue-600">
                        {Math.round(file.uploadProgress)}%
                      </span>
                    )}
                    {file.uploadSpeed &&
                      file.estimatedTimeRemaining &&
                      file.status === "uploading" && (
                        <span className="text-xs text-gray-500">
                          {formatTime(file.estimatedTimeRemaining)} left
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.uploadSpeed && file.status === "uploading" && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.uploadSpeed)}/s
                    </p>
                  )}
                </div>

                {file.status === "uploading" && (
                  <div className="mt-1">
                    <Progress value={file.uploadProgress} className="h-1" />
                  </div>
                )}

                {file.error && (
                  <Alert className="mt-2" variant="destructive">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      {file.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {file.status === "completed" && file.url && showPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, "_blank")}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}

                {file.status === "error" &&
                  allowRetry &&
                  file.retryCount < 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => retryUpload(file.id)}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0"
                  disabled={file.status === "uploading"}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
