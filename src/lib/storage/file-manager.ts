import { prisma } from "@/lib/db";
import { uploadFile, deleteFile, UploadResult } from "./cloudinary";

export interface FileUploadOptions {
  userId: string;
  courseId?: string;
  lessonId?: string;
  type:
    | "COURSE_MATERIAL"
    | "ASSIGNMENT"
    | "CERTIFICATE"
    | "PROFILE_IMAGE"
    | "APPLICATION_DOCUMENT";
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
}

export interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  publicId: string;
  size: number;
  type: string;
  mimeType: string;
  uploadedBy: string;
  courseId?: string;
  lessonId?: string;
  createdAt: Date;
}

const ALLOWED_FILE_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  VIDEO: ["video/mp4", "video/webm", "video/ogg", "video/avi"],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  AUDIO: ["audio/mp3", "audio/wav", "audio/ogg"],
  ARCHIVE: ["application/zip", "application/x-rar-compressed"],
};

const MAX_FILE_SIZES = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 500 * 1024 * 1024, // 500MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  AUDIO: 100 * 1024 * 1024, // 100MB
  ARCHIVE: 100 * 1024 * 1024, // 100MB
};

export async function uploadCourseMaterial(
  file: Buffer,
  filename: string,
  options: FileUploadOptions
): Promise<FileRecord> {
  // Validate file type and size
  const mimeType = await getMimeType(file);
  const fileSize = file.length;

  if (!isValidFileType(mimeType, options.type)) {
    throw new Error(`Invalid file type: ${mimeType}`);
  }

  if (!isValidFileSize(fileSize, mimeType)) {
    throw new Error(`File too large: ${fileSize} bytes`);
  }

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(filename);
  const folder = getFolderPath(options);

  // Upload to Cloudinary
  const uploadResult = await uploadFile(file, {
    folder,
    public_id: uniqueFilename,
    resource_type: getResourceType(mimeType),
  });

  // Save to database
  const fileRecord = await prisma.file.create({
    data: {
      filename: uniqueFilename,
      originalName: filename,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      size: fileSize,
      type: options.type,
      mimeType,
      uploadedBy: options.userId,
      courseId: options.courseId,
      lessonId: options.lessonId,
    },
  });

  return fileRecord;
}

export async function deleteCourseMaterial(
  fileId: string,
  userId: string
): Promise<boolean> {
  try {
    // Get file record
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Check permissions
    if (file.uploadedBy !== userId) {
      throw new Error("Unauthorized to delete this file");
    }

    // Delete from Cloudinary
    await deleteFile(file.publicId);

    // Delete from database
    await prisma.file.delete({
      where: { id: fileId },
    });

    return true;
  } catch (error) {
    console.error("Delete file error:", error);
    return false;
  }
}

export async function getCourseMaterials(courseId: string) {
  return await prisma.file.findMany({
    where: {
      courseId,
      type: "COURSE_MATERIAL",
    },
    include: {
      uploadedByUser: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getLessonMaterials(lessonId: string) {
  return await prisma.file.findMany({
    where: {
      lessonId,
      type: "COURSE_MATERIAL",
    },
    include: {
      uploadedByUser: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getApplicationDocuments(userId: string) {
  return await prisma.file.findMany({
    where: {
      uploadedBy: userId,
      type: "APPLICATION_DOCUMENT",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFileById(fileId: string) {
  return await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      uploadedByUser: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  });
}

// Helper functions
function isValidFileType(mimeType: string, fileType: string): boolean {
  const allowedTypes = getAllowedTypesForFileType(fileType);
  return allowedTypes.includes(mimeType);
}

function isValidFileSize(size: number, mimeType: string): boolean {
  const maxSize = getMaxSizeForMimeType(mimeType);
  return size <= maxSize;
}

function getAllowedTypesForFileType(fileType: string): string[] {
  switch (fileType) {
    case "COURSE_MATERIAL":
      return [
        ...ALLOWED_FILE_TYPES.IMAGE,
        ...ALLOWED_FILE_TYPES.VIDEO,
        ...ALLOWED_FILE_TYPES.DOCUMENT,
        ...ALLOWED_FILE_TYPES.AUDIO,
      ];
    case "ASSIGNMENT":
      return [
        ...ALLOWED_FILE_TYPES.DOCUMENT,
        ...ALLOWED_FILE_TYPES.IMAGE,
        ...ALLOWED_FILE_TYPES.ARCHIVE,
      ];
    case "CERTIFICATE":
      return ALLOWED_FILE_TYPES.DOCUMENT;
    case "PROFILE_IMAGE":
      return ALLOWED_FILE_TYPES.IMAGE;
    case "APPLICATION_DOCUMENT":
      return [...ALLOWED_FILE_TYPES.DOCUMENT, ...ALLOWED_FILE_TYPES.IMAGE];
    default:
      return [];
  }
}

function getMaxSizeForMimeType(mimeType: string): number {
  if (ALLOWED_FILE_TYPES.IMAGE.includes(mimeType)) return MAX_FILE_SIZES.IMAGE;
  if (ALLOWED_FILE_TYPES.VIDEO.includes(mimeType)) return MAX_FILE_SIZES.VIDEO;
  if (ALLOWED_FILE_TYPES.DOCUMENT.includes(mimeType))
    return MAX_FILE_SIZES.DOCUMENT;
  if (ALLOWED_FILE_TYPES.AUDIO.includes(mimeType)) return MAX_FILE_SIZES.AUDIO;
  if (ALLOWED_FILE_TYPES.ARCHIVE.includes(mimeType))
    return MAX_FILE_SIZES.ARCHIVE;
  return MAX_FILE_SIZES.DOCUMENT; // Default
}

function getResourceType(mimeType: string): "image" | "video" | "raw" | "auto" {
  if (ALLOWED_FILE_TYPES.IMAGE.includes(mimeType)) return "image";
  if (ALLOWED_FILE_TYPES.VIDEO.includes(mimeType)) return "video";
  return "raw";
}

function getFolderPath(options: FileUploadOptions): string {
  const baseFolder = "kmmedia";
  const typeFolder = options.type.toLowerCase();

  if (options.courseId) {
    return `${baseFolder}/${typeFolder}/courses/${options.courseId}`;
  }

  if (options.lessonId) {
    return `${baseFolder}/${typeFolder}/lessons/${options.lessonId}`;
  }

  return `${baseFolder}/${typeFolder}`;
}

function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  return `${timestamp}_${random}.${extension}`;
}

async function getMimeType(file: Buffer): Promise<string> {
  // Simple MIME type detection based on file headers
  const header = file.slice(0, 4);

  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    return "image/png";
  }

  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
    return "image/gif";
  }

  if (
    header[0] === 0x25 &&
    header[1] === 0x50 &&
    header[2] === 0x44 &&
    header[3] === 0x46
  ) {
    return "application/pdf";
  }

  // Default to binary
  return "application/octet-stream";
}
