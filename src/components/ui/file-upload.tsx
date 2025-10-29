"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, File, Image, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>; // Returns URLs
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

const ALLOWED_TYPES = {
  "application/pdf": { icon: FileText, color: "text-red-500" },
  "application/msword": { icon: FileText, color: "text-blue-500" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    color: "text-blue-500",
  },
  "image/jpeg": { icon: Image, color: "text-green-500" },
  "image/png": { icon: Image, color: "text-green-500" },
  "image/gif": { icon: Image, color: "text-green-500" },
  "video/mp4": { icon: Video, color: "text-purple-500" },
  "video/quicktime": { icon: Video, color: "text-purple-500" },
};

export function FileUpload({
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov",
  maxSize = 10, // 10MB default
  maxFiles = 5,
  multiple = true,
  onFilesChange,
  onUpload,
  className,
  disabled = false,
  label = "Upload Files",
  description = "Drag and drop files here or click to browse",
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Check max files limit
      if (files.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validFiles: UploadedFile[] = [];
      const invalidFiles: string[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          invalidFiles.push(`${file.name}: ${error}`);
        } else {
          validFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadProgress: 0,
            status: "uploading",
          });
        }
      });

      if (invalidFiles.length > 0) {
        alert("Some files were rejected:\n" + invalidFiles.join("\n"));
      }

      if (validFiles.length === 0) return;

      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      // Start upload process
      if (onUpload) {
        try {
          const filesToUpload = validFiles.map((f) => f.file);
          const urls = await onUpload(filesToUpload);

          // Update files with URLs and completion status
          setFiles((prevFiles) =>
            prevFiles.map((file, index) => {
              const validFileIndex = validFiles.findIndex(
                (vf) => vf.id === file.id
              );
              if (validFileIndex !== -1) {
                return {
                  ...file,
                  url: urls[validFileIndex],
                  uploadProgress: 100,
                  status: "completed" as const,
                };
              }
              return file;
            })
          );
        } catch (error) {
          // Mark files as error
          setFiles((prevFiles) =>
            prevFiles.map((file) => {
              if (validFiles.some((vf) => vf.id === file.id)) {
                return {
                  ...file,
                  status: "error" as const,
                  error: "Upload failed",
                };
              }
              return file;
            })
          );
        }
      } else {
        // If no upload function, mark as completed immediately
        setFiles((prevFiles) =>
          prevFiles.map((file) => {
            if (validFiles.some((vf) => vf.id === file.id)) {
              return {
                ...file,
                uploadProgress: 100,
                status: "completed" as const,
              };
            }
            return file;
          })
        );
      }
    },
    [files, maxFiles, maxSize, accept, onFilesChange, onUpload]
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
      const updatedFiles = files.filter((file) => file.id !== fileId);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    },
    [files, onFilesChange]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    const typeInfo = ALLOWED_TYPES[fileType as keyof typeof ALLOWED_TYPES];
    if (typeInfo) {
      const IconComponent = typeInfo.icon;
      return <IconComponent className={cn("h-4 w-4", typeInfo.color)} />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

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
            disabled={disabled}
          >
            Choose Files
          </Button>
          <p className="text-xs text-gray-400">
            Max {maxFiles} files, {maxSize}MB each
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.status === "uploading" && (
                    <div className="mt-1">
                      <Progress value={file.uploadProgress} className="h-1" />
                    </div>
                  )}
                  {file.status === "error" && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === "completed" && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Uploaded
                    </span>
                  )}
                  {file.status === "uploading" && (
                    <span className="text-xs text-blue-600 font-medium">
                      Uploading...
                    </span>
                  )}
                  {file.status === "error" && (
                    <span className="text-xs text-red-600 font-medium">
                      Failed
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
