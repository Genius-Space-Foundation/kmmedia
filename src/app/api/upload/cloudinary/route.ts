import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import {
  uploadAvatar,
  uploadCourseMaterial,
  uploadAssignmentFile,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.",
        },
        { status: 503 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file: File | null = formData.get("file") as unknown as File;
    const type = formData.get("type") as string; // avatar, course_material, assignment
    const relatedId = formData.get("relatedId") as string; // courseId or assignmentId

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type based on upload type
    if (type === "avatar" && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Avatar must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (10MB general limit, 5MB for avatars)
    const maxSize = type === "avatar" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload based on type
    let uploadResult;

    switch (type) {
      case "avatar":
        uploadResult = await uploadAvatar(buffer, userId);
        if (uploadResult.success && uploadResult.secureUrl) {
          // Update user's profile image
          await prisma.user.update({
            where: { id: userId },
            data: { profileImage: uploadResult.secureUrl },
          });
        }
        break;

      case "course_material":
        if (!relatedId) {
          return NextResponse.json(
            { success: false, message: "Course ID required" },
            { status: 400 }
          );
        }
        const materialType = file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("image/")
          ? "image"
          : "document";
        uploadResult = await uploadCourseMaterial(
          buffer,
          file.name,
          relatedId,
          materialType
        );
        break;

      case "assignment":
        if (!relatedId) {
          return NextResponse.json(
            { success: false, message: "Assignment ID required" },
            { status: 400 }
          );
        }
        uploadResult = await uploadAssignmentFile(
          buffer,
          file.name,
          relatedId,
          userId
        );
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid upload type" },
          { status: 400 }
        );
    }

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: uploadResult.error || "Upload failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: uploadResult.secureUrl || uploadResult.url,
        publicId: uploadResult.publicId,
        format: uploadResult.format,
        size: uploadResult.bytes,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
