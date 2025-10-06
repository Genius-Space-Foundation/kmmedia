import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

const createApplicationSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  personalInfo: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
  }),
  education: z.object({
    highestDegree: z.string().min(1, "Highest degree is required"),
    institution: z.string().min(1, "Institution is required"),
    yearCompleted: z.string().min(1, "Year completed is required"),
  }),
  motivation: z.string().min(50, "Motivation must be at least 50 characters"),
  documents: z.array(z.string()).default([]), // File URLs after upload
});

// Create application (Student only)
async function createApplication(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const applicationData = createApplicationSchema.parse(body);
    const userId = req.user!.userId;

    // Check if course exists and is approved
    const course = await prisma.course.findUnique({
      where: { id: applicationData.courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.status !== "APPROVED") {
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
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
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
    const userId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { userId };

    if (status && status !== "ALL") {
      where.status = status;
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
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Transform applications to match frontend interface
    const transformedApplications = applications.map((app) => ({
      ...app,
      payments: {
        applicationFee: {
          status:
            app.payments.find((p) => p.type === "APPLICATION_FEE")?.status ||
            "PENDING",
          amount: app.course.applicationFee,
          paidAt: app.payments
            .find((p) => p.type === "APPLICATION_FEE")
            ?.createdAt?.toISOString(),
        },
        tuition: app.payments.find((p) => p.type === "TUITION")
          ? {
              status: app.payments.find((p) => p.type === "TUITION")!.status,
              amount: app.course.price,
              paidAt: app.payments
                .find((p) => p.type === "TUITION")
                ?.createdAt?.toISOString(),
            }
          : undefined,
      },
    }));

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
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(createApplication);
export const GET = withStudentAuth(getStudentApplications);

