import { NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage/cloudinary";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Create a new course as Admin
async function createCourseAdmin(req: AuthenticatedRequest) {
  try {
    const formData = await req.formData();

    const instructorId = formData.get("instructorId") as string;
    
    if (!instructorId) {
      return NextResponse.json(
        { success: false, message: "Instructor ID is required" },
        { status: 400 }
      );
    }

    // Verify instructor exists and has correct role
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, role: true }
    });

    if (!instructor || instructor.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { success: false, message: "Invalid instructor ID" },
        { status: 400 }
      );
    }

    // Extract course data from form data
    const courseData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      difficulty: formData.get("difficulty") as string,
      language: formData.get("language") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      applicationFee: parseFloat(formData.get("applicationFee") as string) || 0,
      duration: parseInt(formData.get("duration") as string) || 4,
      estimatedHours: parseInt(formData.get("estimatedHours") as string) || 20,
      installmentEnabled: formData.get("installmentEnabled") === "true",
      installmentPlan: formData.get("installmentPlan") as string,
      prerequisites: JSON.parse(
        (formData.get("prerequisites") as string) || "[]"
      ),
      learningObjectives: JSON.parse(
        (formData.get("learningObjectives") as string) || "[]"
      ),
      courseOutline: JSON.parse(
        (formData.get("courseOutline") as string) || "[]"
      ),
      promotionalVideo: formData.get("promotionalVideo") as string,
      mode: JSON.parse((formData.get("mode") as string) || "[]"),
      maxStudents: parseInt(formData.get("maxStudents") as string) || 50,
      certificateAwarded: formData.get("certificateAwarded") === "true",
      isPublic: formData.get("isPublic") === "true",
      allowEnrollment: formData.get("allowEnrollment") === "true",
      autoApprove: formData.get("autoApprove") === "true",
      requireApplication: formData.get("requireApplication") === "true",
      enableDiscussion: formData.get("enableDiscussion") === "true",
      enableLiveSessions: formData.get("enableLiveSessions") === "true",
      enableAssessments: formData.get("enableAssessments") === "true",
    };

    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle thumbnail upload
    let thumbnailUrl = null;
    const thumbnailFile = formData.get("thumbnail") as File;
    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        const thumbnailBuffer = await thumbnailFile.arrayBuffer();
        // Use instructorId for the path as per existing convention
        const thumbnailResult = await uploadFile(
          Buffer.from(thumbnailBuffer),
          {
            folder: `courses/thumbnails/${instructorId}`,
            resource_type: "image",
            transformation: [
              { width: 1280, height: 720, crop: "fill", quality: "auto" },
            ],
          }
        );
        thumbnailUrl = thumbnailResult.secure_url;
      } catch (error) {
        console.error("Thumbnail upload error:", error);
        return NextResponse.json(
          { success: false, message: "Failed to upload thumbnail" },
          { status: 500 }
        );
      }
    }

    // Create course in database
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        difficulty: courseData.difficulty as any,
        language: courseData.language,
        price: courseData.price,
        applicationFee: courseData.applicationFee,
        duration: courseData.duration,
        estimatedHours: courseData.estimatedHours,
        installmentEnabled: courseData.installmentEnabled,
        installmentPlan: courseData.installmentPlan as any,
        prerequisites: courseData.prerequisites,
        learningObjectives: courseData.learningObjectives,
        promotionalVideo: courseData.promotionalVideo,
        mode: courseData.mode as any,
        maxStudents: courseData.maxStudents,
        certificateAwarded: courseData.certificateAwarded,
        isPublic: courseData.isPublic,
        allowEnrollment: courseData.allowEnrollment,
        autoApprove: courseData.autoApprove,
        requireApplication: courseData.requireApplication,
        enableDiscussion: courseData.enableDiscussion,
        enableLiveSessions: courseData.enableLiveSessions,
        enableAssessments: courseData.enableAssessments,
        thumbnailUrl,
        instructorId,
        status: "DRAFT", // Start as draft so instructor can add content
      },
    });

    // Create course outline items
    if (courseData.courseOutline.length > 0) {
      await prisma.lesson.createMany({
        data: courseData.courseOutline.map((item: any) => ({
          title: item.title,
          description: item.description,
          type: item.type.toUpperCase(),
          duration: item.duration,
          order: item.order,
          isRequired: item.isRequired,
          isPublished: false,
          courseId: course.id,
        })),
      });
    }

    // Course materials creation removed as the model is missing in schema.prisma

    return NextResponse.json({
      success: true,
      message: "Course created and assigned successfully",
      data: {
        id: course.id,
        title: course.title,
        status: course.status,
        instructorId: course.instructorId,
      },
    });
  } catch (error) {
    console.error("Admin create course error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create course" },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(createCourseAdmin);
