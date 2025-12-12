import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const createApplicationSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  personalInfo: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
  }),
  education: z.object({
    highestDegree: z.string().min(1, "Highest degree is required"),
    institution: z.string().min(1, "Institution is required"),
    yearCompleted: z.string().min(1, "Year completed is required"),
    fieldOfStudy: z.string().optional(),
  }),
  motivation: z.object({
    reasonForApplying: z
      .string()
      .min(10, "Reason for applying must be at least 10 characters"),
    careerGoals: z
      .string()
      .min(10, "Career goals must be at least 10 characters"),
    expectations: z
      .string()
      .min(10, "Expectations must be at least 10 characters"),
    additionalInfo: z.string().optional(),
  }),
  documents: z.array(z.string()).default([]), // File URLs after upload
});

// Create application (Student only)
async function createApplication(req: AuthenticatedRequest) {
  try {
    if (!req.user || !req.user.userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Received application data:", JSON.stringify(body, null, 2));

    // Clean up empty strings and convert to undefined for optional fields
    const cleanedBody = {
      ...body,
      personalInfo: {
        ...body.personalInfo,
        dateOfBirth:
          body.personalInfo?.dateOfBirth &&
          body.personalInfo.dateOfBirth.trim() !== ""
            ? body.personalInfo.dateOfBirth
            : undefined,
        gender:
          body.personalInfo?.gender && body.personalInfo.gender.trim() !== ""
            ? body.personalInfo.gender
            : undefined,
      },
      education: {
        ...body.education,
        fieldOfStudy:
          body.education?.fieldOfStudy &&
          body.education.fieldOfStudy.trim() !== ""
            ? body.education.fieldOfStudy
            : undefined,
      },
      motivation: {
        ...body.motivation,
        additionalInfo:
          body.motivation?.additionalInfo &&
          body.motivation.additionalInfo.trim() !== ""
            ? body.motivation.additionalInfo
            : undefined,
      },
      documents: body.documents || [],
    };

    const applicationData = createApplicationSchema.parse(cleanedBody);
    const userId = req.user.userId;

    // Check if course exists and is available for applications
    const course = await prisma.course.findUnique({
      where: { id: applicationData.courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (!["APPROVED", "PUBLISHED"].includes(course.status)) {
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
          courseId: applicationData.courseId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already applied for this course",
        },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
        courseId: applicationData.courseId,
        formData: {
          personalInfo: applicationData.personalInfo,
          education: applicationData.education,
          motivation: applicationData.motivation,
        },
        documents: applicationData.documents.map((url, index) => ({
          id: `doc_${index}`,
          name: `Document ${index + 1}`,
          type: "application/pdf",
          url,
          uploadedAt: new Date().toISOString(),
        })),
        status: ApplicationStatus.PENDING,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            applicationFee: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Create application error:", error);

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      });

      console.error("Validation errors:", error.issues);
      console.error("Error messages:", errorMessages);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid input. Please check the form fields.",
          errors: error.issues,
          errorMessages: errorMessages,
        },
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

// Get student's applications
async function getStudentApplications(req: AuthenticatedRequest) {
  try {
    if (!req.user || !req.user.userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = req.user.userId;

    // Safely parse URL and search params
    let status: string | null = null;
    let page = 1;
    let limit = 20;

    try {
      if (req.url) {
        const { searchParams } = new URL(req.url);
        status = searchParams.get("status");
        const pageParam = searchParams.get("page");
        const limitParam = searchParams.get("limit");

        if (pageParam) {
          const parsedPage = parseInt(pageParam);
          if (!isNaN(parsedPage) && parsedPage > 0) {
            page = parsedPage;
          }
        }

        if (limitParam) {
          const parsedLimit = parseInt(limitParam);
          if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
            limit = parsedLimit;
          }
        }
      }
    } catch (urlError) {
      console.error("Error parsing URL:", urlError);
      // Continue with default values if URL parsing fails
    }

    const where: {
      userId: string;
      status?: ApplicationStatus;
    } = { userId };

    if (status && status !== "ALL") {
      where.status = status as ApplicationStatus;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              applicationFee: true,
              installmentEnabled: true,
              installmentPlan: true,
              instructor: {
                select: {
                  name: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              type: true,
              amount: true,
              status: true,
              method: true,
              reference: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Transform applications to match frontend interface
    const transformedApplications = applications.map((app) => {
      const applicationFeePayment = app.payments?.find(
        (p) => p.type === "APPLICATION_FEE"
      );
      const tuitionPayment = app.payments?.find((p) => p.type === "TUITION");

      return {
        ...app,
        payments: {
          applicationFee: {
            status: applicationFeePayment?.status || "PENDING",
            amount: app.course?.applicationFee || 0,
            paidAt: applicationFeePayment?.createdAt?.toISOString() || null,
          },
          tuition: tuitionPayment
            ? {
                status: tuitionPayment.status,
                amount: app.course?.price || 0,
                paidAt: tuitionPayment.createdAt?.toISOString() || null,
              }
            : undefined,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        applications: transformedApplications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get student applications error:", error);

    // Provide more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);

    console.error("Error details:", errorDetails);

    // Return appropriate status code based on error type
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request parameters",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch applications: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(createApplication);
export const GET = withStudentAuth(getStudentApplications);
