import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any;
  resourceType?: "image" | "video" | "raw" | "auto";
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  secureUrl?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    console.warn("⚠️ Cloudinary not configured. Skipping upload.");
    return {
      success: false,
      error: "Cloudinary not configured",
    };
  }

  try {
    const uploadOptions: any = {
      folder: options.folder || "kmmedia",
      resource_type: options.resourceType || "auto",
      overwrite: false,
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options.allowedFormats && options.allowedFormats.length > 0) {
      uploadOptions.allowed_formats = options.allowedFormats;
    }

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    return {
      success: true,
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Upload avatar image with optimization
 */
export async function uploadAvatar(
  fileBuffer: Buffer,
  userId: string
): Promise<UploadResult> {
  return uploadToCloudinary(fileBuffer, {
    folder: "kmmedia/avatars",
    publicId: `avatar-${userId}-${Date.now()}`,
    resourceType: "image",
    allowedFormats: ["jpg", "png", "jpeg", "webp"],
    transformation: {
      width: 400,
      height: 400,
      crop: "fill",
      gravity: "face",
      quality: "auto:good",
      fetch_format: "auto",
    },
  });
}

/**
 * Upload course material
 */
export async function uploadCourseMaterial(
  fileBuffer: Buffer,
  fileName: string,
  courseId: string,
  type: "video" | "document" | "image" = "document"
): Promise<UploadResult> {
  const resourceType = type === "video" ? "video" : type === "image" ? "image" : "raw";

  return uploadToCloudinary(fileBuffer, {
    folder: `kmmedia/courses/${courseId}`,
    publicId: `${type}-${Date.now()}`,
    resourceType,
  });
}

/**
 * Upload assignment submission
 */
export async function uploadAssignmentFile(
  fileBuffer: Buffer,
  fileName: string,
  assignmentId: string,
  studentId: string
): Promise<UploadResult> {
  return uploadToCloudinary(fileBuffer, {
    folder: `kmmedia/assignments/${assignmentId}/${studentId}`,
    publicId: `submission-${Date.now()}`,
    resourceType: "auto",
  });
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isCloudinaryConfigured()) {
    return { success: false, error: "Cloudinary not configured" };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      error: result.result !== "ok" ? "Failed to delete file" : undefined,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Generate signed upload URL for direct uploads
 */
export async function generateUploadSignature(
  options: {
    folder?: string;
    publicId?: string;
    transformation?: any;
  } = {}
): Promise<{
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder?: string;
}> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary not configured");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const params: any = {
    timestamp,
    folder: options.folder || "kmmedia",
  };

  if (options.publicId) {
    params.public_id = options.publicId;
  }

  if (options.transformation) {
    params.transformation = JSON.stringify(options.transformation);
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder: params.folder,
  };
}

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  if (!isCloudinaryConfigured()) {
    return "";
  }

  return cloudinary.url(publicId, {
    transformation: {
      width: options.width,
      height: options.height,
      crop: options.crop || "fill",
      quality: options.quality || "auto:good",
      fetch_format: options.format || "auto",
    },
    secure: true,
  });
}

export { cloudinary };
