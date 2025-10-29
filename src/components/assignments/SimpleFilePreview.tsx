"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  ExternalLink,
} from "lucide-react";
import { DocumentViewer } from "./DocumentViewer";

interface SubmissionFile {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
}

interface SimpleFilePreviewProps {
  files: SubmissionFile[];
  className?: string;
}

export function SimpleFilePreview({
  files,
  className = "",
}: SimpleFilePreviewProps) {
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf") || type.includes("doc")) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (
      type.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "webp"].includes(type)
    ) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    }
    if (
      type.includes("video") ||
      ["mp4", "mov", "avi", "webm"].includes(type)
    ) {
      return <Video className="h-4 w-4 text-purple-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        No files submitted
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {files.map((file, index) => (
        <div key={index} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getFileIcon(file.fileType)}
              <span className="font-medium text-sm truncate">
                {file.originalName}
              </span>
              <Badge variant="outline" className="text-xs">
                {file.fileType.toUpperCase()}
              </Badge>
            </div>
            <span className="text-xs text-gray-500">
              {formatFileSize(file.fileSize)}
            </span>
          </div>

          {/* Quick preview for images */}
          {(file.fileType.toLowerCase().includes("image") ||
            ["jpg", "jpeg", "png", "gif", "webp"].includes(
              file.fileType.toLowerCase()
            )) && (
            <div className="mb-2">
              <img
                src={file.cloudinaryUrl}
                alt={file.originalName}
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(file.cloudinaryUrl, "_blank")}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement("a");
                link.href = file.cloudinaryUrl;
                link.download = file.originalName;
                link.click();
              }}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Enhanced file preview with full document viewer
interface EnhancedFilePreviewProps {
  files: SubmissionFile[];
  className?: string;
}

export function EnhancedFilePreview({
  files,
  className = "",
}: EnhancedFilePreviewProps) {
  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No files submitted
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {files.map((file, index) => (
        <DocumentViewer
          key={index}
          file={file}
          showDownload={true}
          showFullscreen={true}
        />
      ))}
    </div>
  );
}
