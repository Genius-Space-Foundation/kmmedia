"use client";

import React from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Document } from "@/components/ui/document-manager";

interface DocumentPreviewProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (document: Document) => void;
}

export function DocumentPreview({
  document,
  isOpen,
  onClose,
  onDownload,
}: DocumentPreviewProps) {
  if (!document) return null;

  const isImage = document.type.startsWith("image/");
  const isPdf = document.type === "application/pdf";
  const isVideo = document.type.startsWith("video/");

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
          <img
            src={document.url}
            alt={document.name}
            className="max-w-full max-h-96 object-contain rounded"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <iframe
            src={`${document.url}#toolbar=0`}
            className="w-full h-96 border-0 rounded"
            title={document.name}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <video
            controls
            className="w-full max-h-96 rounded"
            preload="metadata"
          >
            <source src={document.url} type={document.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // For other file types, show a message
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Preview not available
        </h3>
        <p className="text-gray-600 mb-4">
          This file type cannot be previewed in the browser.
        </p>
        <Button
          onClick={() => onDownload?.(document)}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download to view</span>
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1 min-w-0">
            <DialogTitle className="truncate">{document.name}</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              {document.type} • {Math.round(document.size / 1024)} KB
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload?.(document)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
