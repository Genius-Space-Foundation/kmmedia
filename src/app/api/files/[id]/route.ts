import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { deleteCourseMaterial, getFileById } from "@/lib/storage/file-manager";

// Get file details
async function getFile(req: AuthenticatedRequest) {
  try {
    const { id } = (await req.nextUrl.pathname.split("/").pop()) as any;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      );
    }

    const file = await getFileById(id);

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: file,
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
    const { id } = (await req.nextUrl.pathname.split("/").pop()) as any;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "File ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteCourseMaterial(id, req.user!.userId);

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
