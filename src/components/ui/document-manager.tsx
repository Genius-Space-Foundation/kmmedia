"use client";

import React, { useState } from "react";
import {
  File,
  Download,
  Eye,
  Trash2,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  FileText,
  Image,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  category: "resume" | "cover-letter" | "portfolio" | "certificate" | "other";
  status: "active" | "archived";
  description?: string;
  tags?: string[];
}

interface DocumentManagerProps {
  documents: Document[];
  onUpload?: (files: UploadedFile[]) => void;
  onDelete?: (documentId: string) => void;
  onDownload?: (document: Document) => void;
  onPreview?: (document: Document) => void;
  className?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  maxFiles?: number;
}

type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "size" | "type";
type FilterBy =
  | "all"
  | "resume"
  | "cover-letter"
  | "portfolio"
  | "certificate"
  | "other";

export function DocumentManager({
  documents,
  onUpload,
  onDelete,
  onDownload,
  onPreview,
  className,
  allowUpload = true,
  allowDelete = true,
  maxFiles = 10,
}: DocumentManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-5 w-5 text-green-500" />;
    } else if (fileType.startsWith("video/")) {
      return <Video className="h-5 w-5 text-purple-500" />;
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getCategoryColor = (category: Document["category"]) => {
    const colors = {
      resume: "bg-blue-100 text-blue-800",
      "cover-letter": "bg-green-100 text-green-800",
      portfolio: "bg-purple-100 text-purple-800",
      certificate: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category];
  };

  const filteredAndSortedDocuments = documents
    .filter((doc) => {
      // Filter by category
      if (filterBy !== "all" && doc.category !== filterBy) return false;

      // Filter by search query
      if (
        searchQuery &&
        !doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
        case "size":
          return b.size - a.size;
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const handleUpload = (files: UploadedFile[]) => {
    onUpload?.(files);
    setIsUploadDialogOpen(false);
  };

  const handleDelete = (documentId: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      onDelete?.(documentId);
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAndSortedDocuments.map((document) => (
        <Card key={document.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getFileIcon(document.type)}
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm truncate">
                    {document.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatFileSize(document.size)} •{" "}
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </div>
            <Badge
              className={cn(
                "w-fit text-xs",
                getCategoryColor(document.category)
              )}
            >
              {document.category.replace("-", " ")}
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            {document.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {document.description}
              </p>
            )}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview?.(document)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload?.(document)}
              >
                <Download className="h-3 w-3" />
              </Button>
              {allowDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(document.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredAndSortedDocuments.map((document) => (
        <div
          key={document.id}
          className="flex items-center space-x-4 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
        >
          {getFileIcon(document.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {document.name}
              </p>
              <Badge
                className={cn("text-xs", getCategoryColor(document.category))}
              >
                {document.category.replace("-", " ")}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {formatFileSize(document.size)} • Uploaded{" "}
              {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview?.(document)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload?.(document)}
            >
              <Download className="h-4 w-4" />
            </Button>
            {allowDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(document.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-600">
            {documents.length} document{documents.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {allowUpload && (
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Documents</DialogTitle>
                <DialogDescription>
                  Upload your documents. Supported formats: PDF, DOC, DOCX, JPG,
                  PNG, GIF, MP4, MOV
                </DialogDescription>
              </DialogHeader>
              <FileUpload
                maxFiles={maxFiles}
                onFilesChange={handleUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov"
                maxSize={10}
                label="Upload Documents"
                description="Drag and drop your documents here or click to browse"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={filterBy}
            onValueChange={(value: FilterBy) => setFilterBy(value)}
          >
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="resume">Resume</SelectItem>
              <SelectItem value="cover-letter">Cover Letter</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="certificate">Certificate</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: SortBy) => setSortBy(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document List */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterBy !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Upload your first document to get started"}
          </p>
          {allowUpload && (
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          )}
        </div>
      ) : (
        <div>{viewMode === "grid" ? renderGridView() : renderListView()}</div>
      )}
    </div>
  );
}
