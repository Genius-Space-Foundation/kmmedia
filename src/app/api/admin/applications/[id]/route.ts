import { NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/db";
import {
  notifyApplicationApproved,
  notifyApplicationRejected,
} from "@/lib/notifications/notification-triggers";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function updateApplication(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ building: true });
  }

  try {
    if (!req.user || !req.user.userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const applicationId = (await params).id;
    const body = await req.json();
    const { status, comments, reviewNotes, reviewedAt } = body;
    const adminId = req.user.userId;

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        reviewNotes: reviewNotes || comments || null, // Support both field names for backward compatibility
        reviewedBy: adminId,
        reviewedAt: reviewedAt ? new Date(reviewedAt) : new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            profileImage: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            applicationFee: true,
            instructor: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (status === "APPROVED") {
      console.log(`Application ${applicationId} approved. Updating payment stats...`);
      
      // Explicitly update application fee payment
      const paymentUpdate = await prisma.payment.updateMany({
        where: {
          applicationId: applicationId,
          type: "APPLICATION_FEE",
          status: { not: "COMPLETED" },
        },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });

      console.log(`Updated ${paymentUpdate.count} payments for application ${applicationId}`);

      await notifyApplicationApproved(applicationId).catch((error) =>
        console.error("Failed to send approval notification:", error)
      );
    } else if (status === "REJECTED") {
      await notifyApplicationRejected(applicationId).catch((error) =>
        console.error("Failed to send rejection notification:", error)
      );
    }

    // Transform data to include virtual 'name' fields for the UI
    const transformedApplication = {
      ...updatedApplication,
      user: {
        ...updatedApplication.user,
        name: `${updatedApplication.user.firstName || ""} ${updatedApplication.user.lastName || ""}`.trim() || updatedApplication.user.email,
      },
      course: {
        ...updatedApplication.course,
        instructor: {
          ...updatedApplication.course.instructor,
          name: `${updatedApplication.course.instructor.firstName || ""} ${updatedApplication.course.instructor.lastName || ""}`.trim() || updatedApplication.course.instructor.email,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: transformedApplication,
      message: `Application ${status.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update application" },
      { status: 500 }
    );
  }
}

async function getApplication(
  _req: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ building: true });
  }

  try {
    const applicationId = (await params).id;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            profileImage: true,
            phone: true,
            bio: true,
            // Accessing profile for dateOfBirth if needed, but not direct User field
            profile: {
              select: {
                dateOfBirth: true,
              }
            }
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            applicationFee: true,
            duration: true,
            category: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                image: true,
                profileImage: true,
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

    // Transform data for UI
    const transformedApplication = {
      ...application,
      user: {
        ...application.user,
        name: `${application.user.firstName || ""} ${application.user.lastName || ""}`.trim() || application.user.email,
        dateOfBirth: application.user.profile?.dateOfBirth || null,
      },
      course: {
        ...application.course,
        instructor: {
          ...application.course.instructor,
          name: `${application.course.instructor.firstName || ""} ${application.course.instructor.lastName || ""}`.trim() || application.course.instructor.email,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: transformedApplication,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(updateApplication);
export const GET = withAdminAuth(getApplication);
