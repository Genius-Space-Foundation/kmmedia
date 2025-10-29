"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { DocumentManager, Document } from "@/components/ui/document-manager";
import { DocumentPreview } from "@/components/ui/document-preview";
import { useDocumentUpload } from "@/lib/hooks/useDocumentUpload";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TestDocumentUploadPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "John_Doe_Resume.pdf",
      type: "application/pdf",
      size: 245760,
      url: "/uploads/documents/sample-resume.pdf",
      uploadedAt: new Date("2024-01-15"),
      category: "resume",
      status: "active",
      description: "Updated resume with latest experience",
      tags: ["resume", "cv", "professional"],
    },
    {
      id: "2",
      name: "Cover_Letter_KM_Media.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 156432,
      url: "/uploads/documents/sample-cover-letter.docx",
      uploadedAt: new Date("2024-01-14"),
      category: "cover-letter",
      status: "active",
      description: "Cover letter for KM Media Training Institute application",
    },
    {
      id: "3",
      name: "Portfolio_Showcase.pdf",
      type: "application/pdf",
      size: 2048576,
      url: "/uploads/documents/sample-portfolio.pdf",
      uploadedAt: new Date("2024-01-13"),
      category: "portfolio",
      status: "active",
      description: "Collection of my best work and projects",
    },
  ]);

  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { uploadFiles, isUploading, error, clearError } = useDocumentUpload({
    onUploadSuccess: (files) => {
      console.log("Upload successful:", files);
      // Add uploaded files to documents list
      const newDocuments: Document[] = files.map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        url: file.url,
        uploadedAt: new Date(),
        category: "other",
        status: "active",
      }));
      setDocuments((prev) => [...prev, ...newDocuments]);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
    },
  });

  const getFileType = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "mp4":
        return "video/mp4";
      case "mov":
        return "video/quicktime";
      default:
        return "application/octet-stream";
    }
  };

  const handleUpload = (files: UploadedFile[]) => {
    console.log("Files to upload:", files);
  };

  const handleDelete = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const handleDownload = (document: Document) => {
    // Create a temporary link to download the file
    const link = document.createElement("a");
    link.href = document.url;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
    setIsPreviewOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Document Upload System Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the enhanced document upload system with drag-and-drop
            functionality, file validation, upload progress indicators, and
            document management interface.
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">File Upload</TabsTrigger>
            <TabsTrigger value="manager">Document Manager</TabsTrigger>
            <TabsTrigger value="application">Application Form</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic File Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  maxFiles={5}
                  maxSize={10}
                  onFilesChange={handleUpload}
                  onUpload={uploadFiles}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov"
                  label="Upload Documents"
                  description="Drag and drop your files here or click to browse"
                  disabled={isUploading}
                />
                {error && (
                  <div className="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearError}
                      className="ml-2"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialized Upload Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Resume/CV Upload</h3>
                  <FileUpload
                    maxFiles={1}
                    maxSize={5}
                    multiple={false}
                    accept=".pdf,.doc,.docx"
                    onFilesChange={handleUpload}
                    onUpload={uploadFiles}
                    label="Upload Resume"
                    description="PDF, DOC, or DOCX files only (max 5MB)"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Portfolio Upload</h3>
                  <FileUpload
                    maxFiles={3}
                    maxSize={10}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov"
                    onFilesChange={handleUpload}
                    onUpload={uploadFiles}
                    label="Upload Portfolio"
                    description="Images, videos, or PDF files (max 10MB each)"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manager" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Management Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentManager
                  documents={documents}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                  allowUpload={true}
                  allowDelete={true}
                  maxFiles={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Form Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  The document upload system has been integrated into the
                  ApplicationForm component. You can test it by navigating to a
                  course application page.
                </p>
                <Button asChild>
                  <a href="/courses">View Courses</a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Preview Modal */}
        <DocumentPreview
          document={previewDocument}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewDocument(null);
          }}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}
