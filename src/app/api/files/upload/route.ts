import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import {
  fileService,
  FileUploadOptions,
  FileUploadError,
  FileUploadErrorCode,
} from "@/lib/assignments/file-service";
import { createAssignmentValidator } from "@/lib/assignments/file-validator";
import { z } from "zod";

// Request validation schema
const uploadRequestSchema = z.object({
  assignmentId: z.string().optional(),
  submissionId: z.string().optional(),
  allowedFormats: z.array(z.string()).min(1),
  maxFileSize: z.number().positive(),
  maxFiles: z.number().positive().optional(),
});

interface UploadResponse {
  success: boolean;
  files?: Array<{
    id: string;
    originalName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    previewUrl?: string;
    thumbnailUrl?: string;
  }>;
  errors?: Array<{
    fileName: string;
    error: string;
    code: string;
  }>;
  message?: string;
}

async function handleFileUpload(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    // Get upload options from form data
    const optionsJson = formData.get("options") as string;
    if (!optionsJson) {
      return NextResponse.json(
        {
          success: false,
          message: "Upload options are required",
        } as UploadResponse,
        { status: 400 }
      );
    }

    let uploadOptions: FileUploadOptions;
    try {
      const parsedOptions = JSON.parse(optionsJson);
      const validatedOptions = uploadRequestSchema.parse(parsedOptions);

      uploadOptions = {
        ...validatedOptions,
        userId: req.user!.userId,
      };
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload options format",
        } as UploadResponse,
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No files provided",
        } as UploadResponse,
        { status: 400 }
      );
    }

    // Check max files limit
    if (uploadOptions.maxFiles && files.length > uploadOptions.maxFiles) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many files. Maximum allowed: ${uploadOptions.maxFiles}`,
        } as UploadResponse,
        { status: 400 }
      );
    }

    // Validate files before upload
    const validator = createAssignmentValidator(
      uploadOptions.allowedFormats,
      uploadOptions.maxFileSize
    );

    const validationResults = await validator.validateFiles(
      files,
      files.map((f) => f.name)
    );

    // Check for validation errors
    const validationErrors = validationResults
      .map((result, index) => ({
        fileName: files[index].name,
        result,
      }))
      .filter(({ result }) => !result.isValid);

    if (validationErrors.length > 0) {
      const errors = validationErrors.map(({ fileName, result }) => ({
        fileName,
        error: result.errors.map((e) => e.message).join(", "),
        code: result.errors[0]?.code || "VALIDATION_ERROR",
      }));

      return NextResponse.json(
        {
          success: false,
          errors,
          message: "File validation failed",
        } as UploadResponse,
        { status: 400 }
      );
    }

    // Upload valid files
    const uploadResults = [];
    const uploadErrors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fileMetadata = await fileService.uploadFile(
          file,
          {
            originalName: file.name,
            userId: uploadOptions.userId,
            assignmentId: uploadOptions.assignmentId,
            submissionId: uploadOptions.submissionId,
          },
          uploadOptions
        );

        uploadResults.push({
          id: fileMetadata.id,
          originalName: fileMetadata.originalName,
          fileName: fileMetadata.fileName,
          fileType: fileMetadata.fileType,
          fileSize: fileMetadata.fileSize,
          url: fileMetadata.cloudinaryUrl,
          previewUrl: fileMetadata.previewUrl,
          thumbnailUrl: fileMetadata.thumbnailUrl,
        });
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);

        let errorMessage = "Upload failed";
        let errorCode = "UPLOAD_ERROR";

        if (error instanceof FileUploadError) {
          errorMessage = error.message;
          errorCode = error.code;
        }

        uploadErrors.push({
          fileName: file.name,
          error: errorMessage,
          code: errorCode,
        });
      }
    }

    // Return results
    const response: UploadResponse = {
      success: uploadResults.length > 0,
      files: uploadResults.length > 0 ? uploadResults : undefined,
      errors: uploadErrors.length > 0 ? uploadErrors : undefined,
    };

    if (uploadResults.length === 0) {
      response.message = "All file uploads failed";
      return NextResponse.json(response, { status: 500 });
    } else if (uploadErrors.length > 0) {
      response.message = `${uploadResults.length} files uploaded successfully, ${uploadErrors.length} failed`;
    } else {
      response.message = `${uploadResults.length} files uploaded successfully`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during file upload",
      } as UploadResponse,
      { status: 500 }
    );
  }
}

// Progress tracking endpoint
async function handleUploadProgress(
  req: AuthenticatedRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get("uploadId");

    if (!uploadId) {
      return NextResponse.json(
        { success: false, message: "Upload ID is required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would track upload progress
    // For now, return a mock progress response
    return NextResponse.json({
      success: true,
      uploadId,
      progress: 100, // Mock completed upload
      status: "completed",
      filesProcessed: 1,
      totalFiles: 1,
    });
  } catch (error) {
    console.error("Upload progress error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get upload progress" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleFileUpload);
export const GET = withAuth(handleUploadProgress);
