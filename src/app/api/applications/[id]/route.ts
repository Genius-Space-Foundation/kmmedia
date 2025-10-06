import { NextRequest, NextResponse } from "next/server";
import {
  withAuth,
  withAdminAuth,
  AuthenticatedRequest,
} from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

// Get single application
async function getApplication(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile: {
              select: {
                bio: true,
                phone: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            duration: true,
            price: true,
            applicationFee: true,
            mode: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (userRole !== "ADMIN" && application.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to view this application" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// Update application (Admin only - for approval/rejection)
async function updateApplication(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const applicationId = params.id;
    const adminId = req.user!.userId;

    const updateSchema = z.object({
      status: z.enum(["APPROVED", "REJECTED"]),
      notes: z.string().optional(),
    });

    const { status, notes } = updateSchema.parse(body);

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        course: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== ApplicationStatus.PENDING) {
      return NextResponse.json(
        { success: false, message: "Application has already been reviewed" },
        { status: 400 }
      );
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status as ApplicationStatus,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        notes,
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

    // If approved, create enrollment
    if (status === "APPROVED") {
      await prisma.enrollment.create({
        data: {
          userId: application.userId,
          courseId: application.courseId,
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Application ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Update application error:", error);

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
          error instanceof Error ? error.message : "Application update failed",
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getApplication);
export const PUT = withAdminAuth(updateApplication);
