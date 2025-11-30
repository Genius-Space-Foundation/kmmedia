import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminAuth } from "@/lib/middleware";
import { sendEmail, emailTemplates } from "@/lib/notifications/email";

async function bulkHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationIds, action, comments, reviewedAt } = body;

    if (
      !applicationIds ||
      !Array.isArray(applicationIds) ||
      applicationIds.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Application IDs are required" },
        { status: 400 }
      );
    }

    if (!action || !["APPROVE", "REJECT", "UNDER_REVIEW"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Valid action is required" },
        { status: 400 }
      );
    }

    // Map action to status
    const statusMap: Record<string, "PENDING" | "APPROVED" | "REJECTED"> = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      UNDER_REVIEW: "PENDING",
    };

    const newStatus = statusMap[action];

    // Update all applications
    const result = await prisma.application.updateMany({
      where: {
        id: { in: applicationIds },
      },
      data: {
        status: newStatus,
        reviewedAt: reviewedAt ? new Date(reviewedAt) : new Date(),
        ...(comments && { comments }),
      },
    });

    // Send email notifications to students (async, don't block response)
    if (action === "APPROVE" || action === "REJECT") {
      // Fetch applications with student and course details
      const applications = await prisma.application.findMany({
        where: { id: { in: applicationIds } },
        include: {
          user: { select: { email: true, name: true } },
          course: {
            select: {
              title: true,
              instructor: { select: { name: true } },
            },
          },
        },
      });

      // Send emails to each student
      applications.forEach((application) => {
        if (action === "APPROVE") {
          sendEmail({
            to: application.user.email,
            ...emailTemplates.applicationApproved({
              studentName: application.user.name || "Student",
              courseName: application.course.title,
              instructorName: application.course.instructor.name || "Instructor",
            }),
          }).catch((error) => {
            console.error(
              `Failed to send approval email to ${application.user.email}:`,
              error
            );
          });
        } else if (action === "REJECT") {
          sendEmail({
            to: application.user.email,
            ...emailTemplates.applicationRejected({
              studentName: application.user.name || "Student",
              courseName: application.course.title,
              reason: comments,
            }),
          }).catch((error) => {
            console.error(
              `Failed to send rejection email to ${application.user.email}:`,
              error
            );
          });
        }
      });
    }

    console.log(`Bulk ${action}: ${result.count} applications updated, emails sent`);

    return NextResponse.json({
      success: true,
      message: `${
        result.count
      } applications ${action.toLowerCase()}d successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Bulk application action error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process bulk action" },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(bulkHandler);
