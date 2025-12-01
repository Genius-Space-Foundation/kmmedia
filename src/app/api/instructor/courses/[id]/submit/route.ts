import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { CourseStatus } from "@prisma/client";
import { sendEmail } from "@/lib/notifications/email";
import { extendedEmailTemplates } from "@/lib/notifications/email-templates-extended";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function submitCourse(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const courseId = (await params).id;
    const instructorId = req.user!.userId;

    // 1. Check if course exists and belongs to instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.instructorId !== instructorId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // 2. Validate Course State
    if (course.status !== "DRAFT" && course.status !== "REJECTED") {
      return NextResponse.json(
        { 
          success: false, 
          message: `Course cannot be submitted. Current status: ${course.status}` 
        },
        { status: 400 }
      );
    }

    // 3. Basic Validation (Ensure critical fields are present)
    if (!course.title || !course.description || !course.price) {
       return NextResponse.json(
        { 
          success: false, 
          message: "Please ensure Title, Description, and Price are set before submitting." 
        },
        { status: 400 }
      );
    }

    // 4. Update Status
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: "PENDING_APPROVAL",
        submittedAt: new Date(),
      },
    });

    // Notify all admins about the course submission
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true, name: true },
    });

    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { name: true },
    });

    // Send emails to all admins (async, don't block response)
    admins.forEach((admin) => {
      sendEmail({
        to: admin.email,
        ...extendedEmailTemplates.courseSubmittedForReview({
          adminName: admin.name || "Admin",
          instructorName: instructor?.name || "Instructor",
          courseName: updatedCourse.title,
          courseId: updatedCourse.id,
        }),
      }).catch((error) => {
        console.error(`Failed to send course submission email to ${admin.email}:`, error);
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: "Course submitted for approval successfully",
    });

  } catch (error) {
    console.error("Submit course error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit course" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(submitCourse);

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
