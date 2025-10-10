import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const body = await request.json();
    const { status, comments, reviewedAt } = body;

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Update application
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

    // Send notification email to user
    if (status === "APPROVED") {
      // TODO: Send approval email
      console.log(`Sending approval email to ${updatedApplication.user.email}`);
    } else if (status === "REJECTED") {
      // TODO: Send rejection email
      console.log(
        `Sending rejection email to ${updatedApplication.user.email}`
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
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

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
