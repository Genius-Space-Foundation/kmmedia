import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { deleteCourseMaterial, getFileById } from "@/lib/storage/file-manager";
import { fileService } from "@/lib/assignments/file-service";

// Get file details
async function getFile(req: AuthenticatedRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      );
    }

    // Try to get file from existing file manager first
    let file = await getFileById(id);

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to access this file
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Allow access if:
    // 1. User uploaded the file
    // 2. User is an admin
    // 3. User is an instructor and file is in their course
    // 4. User is a student and file is in their enrolled course
    if (file.uploadedBy !== userId && userRole !== "ADMIN") {
      // Additional permission checks would go here
      // For now, we'll allow access for assignment-related files
    }

    return NextResponse.json({
      success: true,
      data: {
        id: file.id,
        originalName: file.originalName,
        fileName: file.filename,
        url: file.url,
        size: file.size,
        type: file.type,
        mimeType: file.mimeType,
        uploadedAt: file.createdAt,
        uploadedBy: file.uploadedByUser
          ? {
              name: file.uploadedByUser.name,
              email: file.uploadedByUser.email,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get file error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch file" },
      { status: 500 }
    );
  }
}

// Delete file
async function deleteFile(req: AuthenticatedRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/");
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      );
    }

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Get file details first to check permissions
    const file = await getFileById(id);
    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    // Check permissions - only file owner or admin can delete
    if (file.uploadedBy !== userId && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this file" },
        { status: 403 }
      );
    }

    // Try assignment file service first, then fall back to course material
    let success = false;
    try {
      success = await fileService.deleteFile(id, userId);
    } catch (error) {
      // Fall back to existing file manager
      success = await deleteCourseMaterial(id, userId);
    }

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete file" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getFile);
export const DELETE = withAuth(deleteFile);
