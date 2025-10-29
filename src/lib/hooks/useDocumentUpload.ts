"use client";

import { useState, useCallback } from "react";
import { UploadedFile } from "@/components/ui/file-upload";

interface UploadResponse {
  success: boolean;
  files?: { name: string; url: string; size: number }[];
  errors?: string[];
  message?: string;
}

interface UseDocumentUploadOptions {
  onUploadSuccess?: (
    files: { name: string; url: string; size: number }[]
  ) => void;
  onUploadError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export function useDocumentUpload(options: UseDocumentUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<string[]> => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        const result: UploadResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Upload failed");
        }

        if (result.errors && result.errors.length > 0) {
          console.warn("Some files had errors:", result.errors);
        }

        const urls = result.files?.map((file) => file.url) || [];

        if (result.files) {
          options.onUploadSuccess?.(result.files);
        }

        return urls;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setError(errorMessage);
        options.onUploadError?.(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [options]
  );

  const deleteFile = useCallback(async (filename: string): Promise<void> => {
    try {
      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Delete failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";
      setError(errorMessage);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadFiles,
    deleteFile,
    isUploading,
    uploadProgress,
    error,
    clearError,
  };
}
