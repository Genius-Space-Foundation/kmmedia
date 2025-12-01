import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { uploadImage as uploadToCloudinary } from "@/lib/storage/cloudinary";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Upload profile or cover image
async function uploadImage(req: NextRequest) {
  try {
    const instructorId = req.user!.userId;
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const type = formData.get("type") as string; // 'profile' or 'cover'

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "File must be an image" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const imageBuffer = await imageFile.arrayBuffer();
    const folder =
      type === "profile"
        ? `instructors/profiles/${instructorId}`
        : `instructors/covers/${instructorId}`;

    const width = type === "profile" ? 400 : 1200;
    const height = type === "profile" ? 400 : 400;

    const uploadResult = await uploadToCloudinary(Buffer.from(imageBuffer), {
      folder,
      width,
      height,
    });

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error("Upload image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(uploadImage);
