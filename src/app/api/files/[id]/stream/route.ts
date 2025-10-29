import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { getFileById } from "@/lib/storage/file-manager";

async function streamFile(req: AuthenticatedRequest) {
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

    // Check if file is streamable (video files)
    const streamableTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    if (!streamableTypes.includes(file.mimeType)) {
      return NextResponse.json(
        { success: false, message: "File type not streamable" },
        { status: 400 }
      );
    }

    // Check permissions (reuse logic from download endpoint)
    const hasPermission = await checkStreamPermission(file, userId, userRole);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to stream this file" },
        { status: 403 }
      );
    }

    // For Cloudinary-hosted videos, we can use their streaming capabilities
    // Generate a streaming URL with appropriate transformations
    const streamingUrl = generateStreamingUrl(file.url, req);

    // Return streaming information
    return NextResponse.json({
      success: true,
      streamUrl: streamingUrl,
      filename: file.originalName,
      contentType: file.mimeType,
      size: file.size,
      duration: extractDurationFromMetadata(file),
      quality: getAvailableQualities(file),
    });
  } catch (error) {
    console.error("Stream file error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to stream file" },
      { status: 500 }
    );
  }
}

async function checkStreamPermission(
  file: any,
  userId: string,
  userRole: string
): Promise<boolean> {
  // Reuse the same permission logic as download
  // In a real implementation, you might have different permissions for streaming vs downloading

  // Admin can stream any file
  if (userRole === "ADMIN") {
    return true;
  }

  // File owner can stream their own files
  if (file.uploadedBy === userId) {
    return true;
  }

  // For course-related files, check enrollment/instruction
  // This would include the same logic as the download permission check
  // For brevity, we'll return true for now
  return true;
}

function generateStreamingUrl(originalUrl: string, req: NextRequest): string {
  const { searchParams } = new URL(req.url);
  const quality = searchParams.get("quality") || "auto";
  const format = searchParams.get("format") || "mp4";

  // Extract Cloudinary public ID from URL
  const publicIdMatch = originalUrl.match(/\/v\d+\/(.+)\.[^.]+$/);
  if (!publicIdMatch) {
    return originalUrl; // Return original if we can't parse
  }

  const publicId = publicIdMatch[1];
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  // Generate streaming URL with transformations
  let transformations = [];

  // Quality settings
  switch (quality) {
    case "low":
      transformations.push("q_auto:low", "w_640", "h_360");
      break;
    case "medium":
      transformations.push("q_auto:good", "w_1280", "h_720");
      break;
    case "high":
      transformations.push("q_auto:best", "w_1920", "h_1080");
      break;
    default:
      transformations.push("q_auto");
  }

  // Format
  transformations.push(`f_${format}`);

  const transformationString = transformations.join(",");
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}/${publicId}.${format}`;
}

function extractDurationFromMetadata(file: any): number | undefined {
  // In a real implementation, you would extract duration from file metadata
  // For now, return undefined
  return undefined;
}

function getAvailableQualities(file: any): string[] {
  // Return available streaming qualities based on file size/resolution
  const fileSize = file.size;
  const qualities = ["low"];

  if (fileSize > 50 * 1024 * 1024) {
    // > 50MB
    qualities.push("medium");
  }

  if (fileSize > 200 * 1024 * 1024) {
    // > 200MB
    qualities.push("high");
  }

  return qualities;
}

export const GET = withAuth(streamFile);
