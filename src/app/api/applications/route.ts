import { NextRequest, NextResponse } from "next/server";
import {
  withStudentAuth,
  withAdminAuth,
  AuthenticatedRequest,
} from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const createApplicationSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  formData: z.record(z.any()), // Application form responses
});

// Create application (Student only)
async function createApplication(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { courseId, formData } = createApplicationSchema.parse(body);
    const userId = req.user!.userId;

    // Check if course exists and is approved
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.status !== "APPROVED" && course.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, message: "Course is not available for applications" },
        { status: 400 }
      );
    }

    // Check if user already has an application for this course
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          message: "Application already exists for this course",
        },
        { status: 400 }
      );
    }

    // DEADLINE ENFORCEMENT: Check if enrollment deadline has passed
    if (course.enrollmentDeadline && new Date() > new Date(course.enrollmentDeadline)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Enrollment for this cohort closed on ${new Date(course.enrollmentDeadline).toLocaleDateString()}.` 
        },
        { status: 400 }
      );
    }

    // PROFESSIONAL COHORT ENFORCEMENT (6-Month Cycle)
    // If course has a startDate, check for any overlapping enrollment/application in a 6-month window
    if (course.startDate) {
      const cohortStart = new Date(course.startDate);
      // We define the cycle as 6 months from the start date
      const cohortEnd = course.endDate ? new Date(course.endDate) : new Date(cohortStart.getTime() + 180 * 24 * 60 * 60 * 1000);

      // Check for overlapping applications
      const overlappingApplication = await prisma.application.findFirst({
        where: {
          userId,
          status: { in: ["PENDING", "APPROVED"] },
          course: {
            OR: [
              {
                // New course starts during an existing course's window
                startDate: { lte: cohortStart },
                endDate: { gte: cohortStart }
              },
              {
                // Existing course starts during this new course's window
                startDate: { gte: cohortStart, lte: cohortEnd }
              }
            ]
          }
        },
        include: { course: true }
      });

      if (overlappingApplication) {
        return NextResponse.json(
          {
            success: false,
            message: `You already have an active application for "${overlappingApplication.course.title}" which runs during this period. Students can only enroll in one course per 6-month cohort cycle.`,
          },
          { status: 400 }
        );
      }

      // Check for overlapping enrollments
      const overlappingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          course: {
            OR: [
              {
                startDate: { lte: cohortStart },
                endDate: { gte: cohortStart }
              },
              {
                startDate: { gte: cohortStart, lte: cohortEnd }
              }
            ]
          }
        },
        include: { course: true }
      });

      if (overlappingEnrollment) {
        return NextResponse.json(
          {
            success: false,
            message: `You are currently enrolled in "${overlappingEnrollment.course.title}" which runs during this period. Students can only enroll in one course per 6-month cohort cycle.`,
          },
          { status: 400 }
        );
      }
    }

    // Check if application fee has been paid (if applicable)
    let applicationFeePaymentId: string | null = null;

    if (course.applicationFee > 0) {
      const applicationFeePayment = await prisma.payment.findFirst({
        where: {
          userId,
          applicationId: null, // Not yet linked to an application
          type: "APPLICATION_FEE",
          status: "COMPLETED",
          metadata: {
            path: ["courseId"],
            equals: courseId,
          },
        },
      });

      /* 
      // TEMPORARILY DISABLED FOR TESTING
      if (!applicationFeePayment) {
        return NextResponse.json(
          {
            success: false,
            message: "Application fee must be paid before submitting application",
          },
          { status: 400 }
        );
      }
      
      applicationFeePaymentId = applicationFeePayment.id;
      */
      
      // Allow proceeding without payment for now
      // applicationFeePaymentId = null;

      // RE-ENABLED
      if (!applicationFeePayment) {
        return NextResponse.json(
          {
            success: false,
            message: "Application fee must be paid before submitting application",
          },
          { status: 400 }
        );
      }
      applicationFeePaymentId = applicationFeePayment.id;
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
        courseId,
        formData,
        status: ApplicationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
          },
        },
      },
    });

    // Link the payment to the application if applicable
    if (applicationFeePaymentId) {
      await prisma.payment.update({
        where: { id: applicationFeePaymentId },
        data: { applicationId: application.id },
      });
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Create application error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Application submission failed",
      },
      { status: 500 }
    );
  }
}

// Get applications (Admin only)
async function getApplications(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              price: true,
            },
          },
          payments: {
            where: { type: "APPLICATION_FEE" },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(createApplication);
export const GET = withAdminAuth(getApplications);
