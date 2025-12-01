import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { uploadCourseMaterial } from "@/lib/storage/file-manager";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function uploadFile(req: AuthenticatedRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const courseId = formData.get("courseId") as string;
    const lessonId = formData.get("lessonId") as string;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file
    const fileRecord = await uploadCourseMaterial(buffer, file.name, {
      userId: req.user!.userId,
      courseId: courseId || undefined,
      lessonId: lessonId || undefined,
      type: type as any,
    });

    return NextResponse.json({
      success: true,
      data: fileRecord,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(uploadFile);
