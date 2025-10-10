import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminAuth } from "@/lib/middleware/auth";

async function bulkHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseIds, action, comments } = body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course IDs are required" },
        { status: 400 }
      );
    }

    if (
      !action ||
      !["APPROVE", "REJECT", "PUBLISH", "UNPUBLISH"].includes(action)
    ) {
      return NextResponse.json(
        { success: false, message: "Valid action is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "APPROVE":
        result = await prisma.course.updateMany({
          where: { id: { in: courseIds } },
          data: {
            status: "APPROVED",
            ...(comments && { approvalComments: comments }),
            updatedAt: new Date(),
          },
        });
        break;

      case "REJECT":
        result = await prisma.course.updateMany({
          where: { id: { in: courseIds } },
          data: {
            status: "REJECTED",
            ...(comments && { approvalComments: comments }),
            updatedAt: new Date(),
          },
        });
        break;

      case "PUBLISH":
        // Only publish approved courses
        result = await prisma.course.updateMany({
          where: {
            id: { in: courseIds },
            status: "APPROVED",
          },
          data: {
            status: "PUBLISHED",
            updatedAt: new Date(),
          },
        });

        if (result.count === 0) {
          return NextResponse.json(
            {
              success: false,
              message:
                "No courses were published. Courses must be approved first.",
            },
            { status: 400 }
          );
        }
        break;

      case "UNPUBLISH":
        result = await prisma.course.updateMany({
          where: { id: { in: courseIds } },
          data: {
            status: "APPROVED",
            updatedAt: new Date(),
          },
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    // Send notifications to instructors (TODO: Implement)
    console.log(`Bulk ${action}: ${result.count} courses updated`);

    return NextResponse.json({
      success: true,
      message: `${result.count} courses ${action.toLowerCase()}d successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Bulk course action error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process bulk action" },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(bulkHandler);
