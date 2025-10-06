import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { ApplicationStatus, EnrollmentStatus } from "@prisma/client";
import { z } from "zod";

const updateApplicationSchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]),
  reviewNotes: z.string().optional(),
});

// Update application status (Admin only)
async function updateApplication(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, reviewNotes } = updateApplicationSchema.parse(body);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Start a transaction for approval process
    const result = await prisma.$transaction(async (tx) => {
      // Update application
      const updatedApplication = await tx.application.update({
        where: { id },
        data: {
          status: status as ApplicationStatus,
          reviewNotes,
          reviewedAt: new Date(),
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
              applicationFee: true,
            },
          },
          payments: {
            where: { type: "APPLICATION_FEE" },
          },
        },
      });

      // If approved, create enrollment
      if (status === "APPROVED") {
        const existingEnrollment = await tx.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: application.userId,
              courseId: application.courseId,
            },
          },
        });

        if (!existingEnrollment) {
          await tx.enrollment.create({
            data: {
              userId: application.userId,
              courseId: application.courseId,
              status: EnrollmentStatus.ACTIVE,
              enrolledAt: new Date(),
              progress: 0,
            },
          });
        }
      }

      return updatedApplication;
    });

    // TODO: Send notification email to student
    console.log(
      `Application ${status} for ${result.user.email} - Course: ${result.course.title}`
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Application ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Update application error:", error);

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
          error instanceof Error ? error.message : "Application update failed",
      },
      { status: 500 }
    );
  }
}

// Get application details (Admin only)
async function getApplication(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const application = await prisma.application.findUnique({
      where: { id },
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
            category: true,
            price: true,
            applicationFee: true,
            instructor: {
              select: {
                name: true,
                email: true,
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
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
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

export const PUT = withAdminAuth(updateApplication);
export const GET = withAdminAuth(getApplication);
