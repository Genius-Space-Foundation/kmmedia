import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  notifyApplicationApproved,
  notifyApplicationRejected,
} from "@/lib/notifications/notification-triggers";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ building: true });
  }

  try {
    const applicationId = (await params).id;
    const body = await request.json();
    const { status, comments, reviewedAt } = body;

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        comments: comments || null,
        reviewedAt: reviewedAt ? new Date(reviewedAt) : new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
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
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (status === "APPROVED") {
      await notifyApplicationApproved(applicationId).catch((error) =>
        console.error("Failed to send approval notification:", error)
      );
    } else if (status === "REJECTED") {
      await notifyApplicationRejected(applicationId).catch((error) =>
        console.error("Failed to send rejection notification:", error)
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedApplication,
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

export async function GET(
  request: NextRequest,
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
            name: true,
            email: true,
            avatar: true,
            phone: true,
            bio: true,
            address: true,
            dateOfBirth: true,
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
            level: true,
            category: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        documents: true,
        payment: true,
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
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch application" },
      { status: 500 }
    );
  }
}
