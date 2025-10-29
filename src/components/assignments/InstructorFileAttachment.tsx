"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Eye,
  Trash2,
  FileText,
  Image,
  Video,
  File,
  Upload,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstructorFileAttachmentProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

const FILE_TYPE_ICONS = {
  "application/pdf": { icon: FileText, color: "text-red-500", bg: "bg-red-50" },
  "application/msword": {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  "image/jpeg": { icon: Image, color: "text-green-500", bg: "bg-green-50" },
  "image/png": { icon: Image, color: "text-green-500", bg: "bg-green-50" },
  "image/gif": { icon: Image, color: "text-green-500", bg: "bg-green-50" },
  "video/mp4": { icon: Video, color: "text-purple-500", bg: "bg-purple-50" },
  "video/quicktime": {
    icon: Video,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  "video/x-msvideo": {
    icon: Video,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
};

export function InstructorFileAttachment({
  files,
  onFilesChange,
  onUpload,
  maxFiles = 10,
  maxFileSize = 50,
  className,
  disabled = false,
}: InstructorFileAttachmentProps) {
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const handleFilesUpload = useCallback(
    async (newFiles: UploadedFile[]) => {
      onFilesChange(newFiles);
    },
    [onFilesChange]
  );

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      const updatedFiles = files.filter((file) => file.id !== fileId);
      onFilesChange(updatedFiles);
    },
    [files, onFilesChange]
  );

  const handlePreviewFile = useCallback((file: UploadedFile) => {
    setPreviewFile(file);
  }, []);

  const handleDownloadFile = useCallback((file: UploadedFile) => {
    if (file.url) {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // If no URL, create blob URL from file
      const url = URL.createObjectURL(file.file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, []);

  const getFileIcon = (fileType: string) => {
    const typeInfo = FILE_TYPE_ICONS[fileType as keyof typeof FILE_TYPE_ICONS];
    if (typeInfo) {
      const IconComponent = typeInfo.icon;
      return {
        icon: <IconComponent className={cn("h-5 w-5", typeInfo.color)} />,
        bg: typeInfo.bg,
      };
    }
    return {
      icon: <File className="h-5 w-5 text-gray-500" />,
      bg: "bg-gray-50",
    };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImageFile = (fileType: string) => {
    return fileType.startsWith("image/");
  };

  const isVideoFile = (fileType: string) => {
    return fileType.startsWith("video/");
  };

  const isPDFFile = (fileType: string) => {
    return fileType === "application/pdf";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Instructor Materials</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload files that students will need to complete this assignment
            (optional)
          </p>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
            maxSize={maxFileSize}
            maxFiles={maxFiles}
            multiple={true}
            onFilesChange={handleFilesUpload}
            onUpload={onUpload}
            disabled={disabled}
            label="Upload Instructor Materials"
            description="Drag and drop files here or click to browse"
          />

          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Attached Files ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file) => {
                  const { icon, bg } = getFileIcon(file.type);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={cn("p-2 rounded-lg", bg)}>{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                            <Badge
                              variant={
                                file.status === "completed"
                                  ? "default"
                                  : file.status === "error"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {file.status === "completed" && "✓ Uploaded"}
                              {file.status === "uploading" && "Uploading..."}
                              {file.status === "error" && "Failed"}
                            </Badge>
                          </div>
                          {file.error && (
                            <div className="flex items-center space-x-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              <p className="text-xs text-red-600">
                                {file.error}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {(isImageFile(file.type) || isPDFFile(file.type)) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewFile(file)}
                            className="h-8 w-8 p-0"
                            title="Preview file"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                          className="h-8 w-8 p-0"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Remove file"
                          disabled={disabled}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

interface FilePreviewModalProps {
  file: UploadedFile;
  onClose: () => void;
}

function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  const fileUrl = file.url || URL.createObjectURL(file.file);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold truncate">{file.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {isImage && (
            <div className="flex justify-center">
              <img
                src={fileUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {isPDF && (
            <div className="w-full h-96">
              <iframe
                src={fileUrl}
                className="w-full h-full border-0"
                title={file.name}
              />
            </div>
          )}

          {!isImage && !isPDF && (
            <div className="text-center py-8">
              <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Preview not available for this file type
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = fileUrl;
                  link.download = file.name;
                  link.click();
                }}
                className="mt-4"
              >
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
