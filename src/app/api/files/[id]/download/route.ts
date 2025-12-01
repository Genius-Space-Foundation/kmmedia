import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { getFileById } from "@/lib/storage/file-manager";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function downloadFile(req: AuthenticatedRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/");
    const id = pathSegments[pathSegments.indexOf("files") + 1];

    if (!id) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      );
    }

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Get file details
    const file = await getFileById(id);
    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    // Check download permissions
    const hasPermission = await checkDownloadPermission(file, userId, userRole);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to download this file" },
        { status: 403 }
      );
    }

    // Log download activity
    await logFileAccess(id, userId, "DOWNLOAD");

    // For assignment files, we'll redirect to the Cloudinary URL
    // In a production environment, you might want to generate signed URLs
    // or stream the file through your server for additional security

    const { searchParams } = new URL(req.url);
    const inline = searchParams.get("inline") === "true";

    if (inline) {
      // Return file URL for inline viewing
      return NextResponse.json({
        success: true,
        url: file.url,
        filename: file.originalName,
        contentType: file.mimeType,
        size: file.size,
      });
    } else {
      // Redirect to file for download
      return NextResponse.redirect(file.url);
    }
  } catch (error) {
    console.error("Download file error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to download file" },
      { status: 500 }
    );
  }
}

async function checkDownloadPermission(
  file: any,
  userId: string,
  userRole: string
): Promise<boolean> {
  try {
    // Admin can download any file
    if (userRole === "ADMIN") {
      return true;
    }

    // File owner can download their own files
    if (file.uploadedBy === userId) {
      return true;
    }

    // For assignment-related files, check course enrollment/instruction
    if (file.courseId) {
      // Check if user is instructor of the course
      const isInstructor = await prisma.course.findFirst({
        where: {
          id: file.courseId,
          instructorId: userId,
        },
      });

      if (isInstructor) {
        return true;
      }

      // Check if user is enrolled in the course
      const isEnrolled = await prisma.enrollment.findFirst({
        where: {
          courseId: file.courseId,
          userId: userId,
          status: "ACTIVE",
        },
      });

      if (isEnrolled) {
        return true;
      }
    }

    // For assignment submissions, check if user is the instructor or the student
    if (file.type === "ASSIGNMENT") {
      // This would require additional logic to check assignment permissions
      // For now, we'll allow access if the user has any relation to assignments
      const hasAssignmentAccess = await prisma.assignment.findFirst({
        where: {
          OR: [
            { instructorId: userId },
            {
              submissions: {
                some: {
                  studentId: userId,
                },
              },
            },
          ],
        },
      });

      if (hasAssignmentAccess) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

async function logFileAccess(fileId: string, userId: string, action: string) {
  try {
    await prisma.activityLog.create({
      data: {
        action: `FILE_${action}`,
        entity: "File",
        entityId: fileId,
        userId: userId,
        details: {
          fileId,
          action,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Failed to log file access:", error);
    // Don't throw error, just log it
  }
}

export const GET = withAuth(downloadFile);
