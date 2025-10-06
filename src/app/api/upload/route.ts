import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import {
  uploadFile,
  uploadVideo,
  uploadImage,
  uploadDocument,
} from "@/lib/storage/cloudinary";
import { prisma } from "@/lib/db";
import { z } from "zod";

const uploadSchema = z.object({
  type: z.enum([
    "course_material",
    "profile_avatar",
    "application_document",
    "lesson_resource",
  ]),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
});

// Security configuration
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760"); // 10MB default
const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES?.split(",") || [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// File type validation
function validateFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType);
}

// File size validation
function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

// Handle file uploads
async function handleUpload(req: AuthenticatedRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const courseId = formData.get("courseId") as string;
    const lessonId = formData.get("lessonId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Security validations
    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds limit of ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
        { status: 400 }
      );
    }

    if (!validateFileType(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `File type ${
            file.type
          } is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Additional security checks
    if (
      file.name.includes("..") ||
      file.name.includes("/") ||
      file.name.includes("\\")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid file name" },
        { status: 400 }
      );
    }

    const validationData = uploadSchema.parse({ type, courseId, lessonId });
    const userId = req.user!.userId;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine upload folder and method based on type
    let folder = "kmmedia";
    let uploadResult;

    switch (validationData.type) {
      case "course_material":
        folder = `courses/${courseId}/materials`;
        break;
      case "profile_avatar":
        folder = `profiles/avatars`;
        break;
      case "application_document":
        folder = `applications/${userId}`;
        break;
      case "lesson_resource":
        folder = `courses/${courseId}/lessons/${lessonId}`;
        break;
    }

    // Upload based on file type
    const fileType = file.type;
    if (fileType.startsWith("image/")) {
      uploadResult = await uploadImage(buffer, {
        folder,
        public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`,
      });
    } else if (fileType.startsWith("video/")) {
      uploadResult = await uploadVideo(buffer, {
        folder,
        public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`,
      });
    } else {
      uploadResult = await uploadDocument(buffer, {
        folder,
        public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`,
      });
    }

    // Create resource record if for lesson
    if (validationData.type === "lesson_resource" && lessonId) {
      // Verify lesson ownership
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          course: true,
        },
      });

      if (!lesson) {
        return NextResponse.json(
          { success: false, message: "Lesson not found" },
          { status: 404 }
        );
      }

      if (lesson.course.instructorId !== userId) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }

      await prisma.resource.create({
        data: {
          name: file.name,
          type: getResourceType(fileType),
          url: uploadResult.secure_url,
          size: uploadResult.bytes,
          lessonId,
          downloadable: true,
        },
      });
    }

    // Log upload activity
    await prisma.activityLog.create({
      data: {
        action: "FILE_UPLOADED",
        entity: "File",
        entityId: uploadResult.public_id,
        details: {
          fileName: file.name,
          fileSize: uploadResult.bytes,
          fileType: fileType,
          uploadType: validationData.type,
          url: uploadResult.secure_url,
        },
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        size: uploadResult.bytes,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

function getResourceType(
  mimeType: string
): "PDF" | "VIDEO" | "IMAGE" | "AUDIO" | "DOCUMENT" {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (mimeType === "application/pdf") return "PDF";
  return "DOCUMENT";
}

export const POST = withAuth(handleUpload);
