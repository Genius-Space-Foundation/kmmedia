import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db";

// Configure Cloudinary if not already configured
if (!cloudinary.config().cloud_name) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  scanStatus: "pending" | "clean" | "infected";
  scanResult?: ScanResult;
}

export interface UploadedFile extends FileMetadata {
  uploadProgress: number;
  uploadStatus: "uploading" | "completed" | "failed";
  errorMessage?: string;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ScanResult {
  isClean: boolean;
  threats?: string[];
  scanDate: Date;
}

export interface FileUploadOptions {
  assignmentId?: string;
  submissionId?: string;
  userId: string;
  folder?: string;
  allowedFormats: string[];
  maxFileSize: number;
  maxFiles?: number;
}

// Supported file formats for assignments
export const ASSIGNMENT_FILE_FORMATS = {
  DOCUMENTS: ["pdf", "doc", "docx"],
  VIDEOS: ["mp4", "mov", "avi"],
  IMAGES: ["jpg", "jpeg", "png", "gif"],
  ALL: ["pdf", "doc", "docx", "mp4", "mov", "avi", "jpg", "jpeg", "png", "gif"],
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  DOCUMENTS: 50 * 1024 * 1024, // 50MB
  VIDEOS: 500 * 1024 * 1024, // 500MB
  IMAGES: 10 * 1024 * 1024, // 10MB
};

export class FileUploadError extends Error {
  constructor(
    message: string,
    public code: FileUploadErrorCode,
    public fileName?: string
  ) {
    super(message);
    this.name = "FileUploadError";
  }
}

export enum FileUploadErrorCode {
  INVALID_FORMAT = "INVALID_FORMAT",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  TOO_MANY_FILES = "TOO_MANY_FILES",
  VIRUS_DETECTED = "VIRUS_DETECTED",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
}

export class FileService {
  /**
   * Upload a file to Cloudinary with validation and security scanning
   */
  async uploadFile(
    file: Buffer | File,
    metadata: {
      originalName: string;
      userId: string;
      assignmentId?: string;
      submissionId?: string;
    },
    options: FileUploadOptions
  ): Promise<FileMetadata> {
    try {
      // Convert File to Buffer if needed
      const fileBuffer =
        file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
      const fileName = metadata.originalName;

      // Validate file
      const validation = await this.validateFile(fileBuffer, fileName, options);
      if (!validation.isValid) {
        throw new FileUploadError(
          validation.errors.join(", "),
          FileUploadErrorCode.INVALID_FORMAT,
          fileName
        );
      }

      // Generate unique filename
      const uniqueFileName = this.generateUniqueFilename(fileName);
      const folder = this.getFolderPath(options);

      // Determine resource type
      const resourceType = this.getResourceType(fileName);

      // Upload to Cloudinary
      const uploadResult = await this.uploadToCloudinary(fileBuffer, {
        folder,
        public_id: uniqueFileName,
        resource_type: resourceType,
      });

      // Perform security scan
      const scanResult = await this.scanFile(uploadResult.secure_url);

      if (!scanResult.isClean) {
        // Delete the uploaded file if infected
        await this.deleteFromCloudinary(uploadResult.public_id);
        throw new FileUploadError(
          "File failed security scan",
          FileUploadErrorCode.VIRUS_DETECTED,
          fileName
        );
      }

      // Generate preview URLs if applicable
      const previewUrl = await this.generatePreviewUrl(
        uploadResult.secure_url,
        fileName
      );
      const thumbnailUrl = await this.generateThumbnailUrl(
        uploadResult.secure_url,
        fileName
      );

      // Create file metadata
      const fileMetadata: FileMetadata = {
        id: this.generateFileId(),
        originalName: fileName,
        fileName: uniqueFileName,
        fileType: this.getFileExtension(fileName),
        fileSize: uploadResult.bytes,
        uploadedAt: new Date(),
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        previewUrl,
        thumbnailUrl,
        scanStatus: "clean",
        scanResult,
      };

      return fileMetadata;
    } catch (error) {
      if (error instanceof FileUploadError) {
        throw error;
      }
      throw new FileUploadError(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        FileUploadErrorCode.UPLOAD_FAILED,
        metadata.originalName
      );
    }
  }

  /**
   * Validate file format, size, and basic security checks
   */
  async validateFile(
    file: Buffer | File,
    fileName: string,
    options: FileUploadOptions
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      const fileSize = file instanceof File ? file.size : file.length;
      const fileExtension = this.getFileExtension(fileName).toLowerCase();

      // Check file format
      if (!options.allowedFormats.includes(fileExtension)) {
        errors.push(
          `File format '${fileExtension}' is not allowed. Allowed formats: ${options.allowedFormats.join(
            ", "
          )}`
        );
      }

      // Check file size
      if (fileSize > options.maxFileSize) {
        const maxSizeMB = Math.round(options.maxFileSize / (1024 * 1024));
        const fileSizeMB = Math.round(fileSize / (1024 * 1024));
        errors.push(
          `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
        );
      }

      // Check file content type (basic validation)
      const contentType = await this.detectContentType(
        file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
      );
      if (!this.isValidContentType(contentType, fileExtension)) {
        errors.push(`File content does not match the file extension`);
      }

      // Check for potentially malicious files
      if (this.isPotentiallyMalicious(fileName)) {
        errors.push(`File name contains potentially dangerous characters`);
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(
        `Validation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return {
        isValid: false,
        errors,
      };
    }
  }

  /**
   * Delete a file from Cloudinary and cleanup metadata
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      // Note: In a real implementation, you would fetch file metadata from database
      // For now, we'll assume the fileId contains the Cloudinary public_id
      await this.deleteFromCloudinary(fileId);
      return true;
    } catch (error) {
      console.error("Delete file error:", error);
      return false;
    }
  }

  /**
   * Generate preview URL for documents and images
   */
  async generatePreviewUrl(
    fileUrl: string,
    fileName: string
  ): Promise<string | undefined> {
    const fileExtension = this.getFileExtension(fileName).toLowerCase();

    try {
      if (["pdf"].includes(fileExtension)) {
        // Generate PDF preview using Cloudinary transformations
        const publicId = this.extractPublicIdFromUrl(fileUrl);
        return cloudinary.url(publicId, {
          resource_type: "image",
          format: "jpg",
          page: 1, // First page
          width: 800,
          height: 600,
          crop: "fit",
          quality: "auto",
        });
      }

      if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
        // Generate image preview
        const publicId = this.extractPublicIdFromUrl(fileUrl);
        return cloudinary.url(publicId, {
          width: 800,
          height: 600,
          crop: "fit",
          quality: "auto",
          format: "auto",
        });
      }

      if (["mp4", "mov", "avi"].includes(fileExtension)) {
        // Generate video thumbnail
        const publicId = this.extractPublicIdFromUrl(fileUrl);
        return cloudinary.url(publicId, {
          resource_type: "video",
          format: "jpg",
          width: 800,
          height: 450,
          crop: "fit",
          quality: "auto",
        });
      }

      return undefined;
    } catch (error) {
      console.error("Preview generation error:", error);
      return undefined;
    }
  }

  /**
   * Generate thumbnail URL for files
   */
  async generateThumbnailUrl(
    fileUrl: string,
    fileName: string
  ): Promise<string | undefined> {
    const fileExtension = this.getFileExtension(fileName).toLowerCase();

    try {
      if (
        ["pdf", "jpg", "jpeg", "png", "gif", "mp4", "mov", "avi"].includes(
          fileExtension
        )
      ) {
        const publicId = this.extractPublicIdFromUrl(fileUrl);
        const resourceType = ["mp4", "mov", "avi"].includes(fileExtension)
          ? "video"
          : ["pdf"].includes(fileExtension)
          ? "image"
          : "image";

        return cloudinary.url(publicId, {
          resource_type: resourceType,
          format: "jpg",
          width: 200,
          height: 150,
          crop: "fit",
          quality: "auto",
          ...(fileExtension === "pdf" && { page: 1 }),
        });
      }

      return undefined;
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      return undefined;
    }
  }

  // Private helper methods

  private async uploadToCloudinary(
    file: Buffer,
    options: {
      folder: string;
      public_id: string;
      resource_type: "image" | "video" | "raw" | "auto";
    }
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: options.folder,
            public_id: options.public_id,
            resource_type: options.resource_type,
            quality: "auto",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as UploadResult);
            }
          }
        )
        .end(file);
    });
  }

  private async deleteFromCloudinary(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private async scanFile(fileUrl: string): Promise<ScanResult> {
    // Basic security scan implementation
    // In a production environment, you would integrate with a proper virus scanning service
    try {
      // Simulate basic security checks
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate scan time

      return {
        isClean: true,
        scanDate: new Date(),
      };
    } catch (error) {
      return {
        isClean: false,
        threats: ["Scan failed"],
        scanDate: new Date(),
      };
    }
  }

  private async detectContentType(file: Buffer): Promise<string> {
    // Basic MIME type detection based on file headers
    const header = file.slice(0, 8);

    // PDF
    if (
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46
    ) {
      return "application/pdf";
    }

    // JPEG
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return "image/jpeg";
    }

    // PNG
    if (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47
    ) {
      return "image/png";
    }

    // GIF
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
      return "image/gif";
    }

    // MP4
    if (
      header[4] === 0x66 &&
      header[5] === 0x74 &&
      header[6] === 0x79 &&
      header[7] === 0x70
    ) {
      return "video/mp4";
    }

    // DOC/DOCX (Office documents start with PK for ZIP-based formats)
    if (header[0] === 0x50 && header[1] === 0x4b) {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    // Legacy DOC
    if (
      header[0] === 0xd0 &&
      header[1] === 0xcf &&
      header[2] === 0x11 &&
      header[3] === 0xe0
    ) {
      return "application/msword";
    }

    return "application/octet-stream";
  }

  private isValidContentType(
    contentType: string,
    fileExtension: string
  ): boolean {
    const validMappings: Record<string, string[]> = {
      pdf: ["application/pdf"],
      doc: ["application/msword"],
      docx: [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      jpg: ["image/jpeg"],
      jpeg: ["image/jpeg"],
      png: ["image/png"],
      gif: ["image/gif"],
      mp4: ["video/mp4"],
      mov: ["video/quicktime"],
      avi: ["video/x-msvideo", "video/avi"],
    };

    const allowedTypes = validMappings[fileExtension.toLowerCase()] || [];
    return (
      allowedTypes.includes(contentType) ||
      contentType === "application/octet-stream"
    );
  }

  private isPotentiallyMalicious(fileName: string): boolean {
    const dangerousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com)$/i,
      /[<>:"|?*]/,
      /\.\./,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,
    ];

    return dangerousPatterns.some((pattern) => pattern.test(fileName));
  }

  private getFileExtension(fileName: string): string {
    return fileName.split(".").pop()?.toLowerCase() || "";
  }

  private getResourceType(
    fileName: string
  ): "image" | "video" | "raw" | "auto" {
    const extension = this.getFileExtension(fileName);

    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return "image";
    }

    if (["mp4", "mov", "avi"].includes(extension)) {
      return "video";
    }

    return "raw";
  }

  private getFolderPath(options: FileUploadOptions): string {
    const baseFolder = "kmmedia/assignments";

    if (options.assignmentId) {
      return `${baseFolder}/${options.assignmentId}`;
    }

    if (options.submissionId) {
      return `${baseFolder}/submissions/${options.submissionId}`;
    }

    return `${baseFolder}/general`;
  }

  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = this.getFileExtension(originalName);
    const baseName = originalName.replace(/\.[^/.]+$/, "").substring(0, 50); // Limit base name length

    return `${timestamp}_${random}_${baseName}.${extension}`;
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private extractPublicIdFromUrl(url: string): string {
    // Extract public_id from Cloudinary URL
    const matches = url.match(/\/v\d+\/(.+)\.[^.]+$/);
    return matches ? matches[1] : url;
  }
}

// Export singleton instance
export const fileService = new FileService();
