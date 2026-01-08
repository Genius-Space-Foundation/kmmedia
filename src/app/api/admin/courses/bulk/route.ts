import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminAuth } from "@/lib/middleware/auth";
import { logBulkAction, ResourceType } from "@/lib/audit-log";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function bulkHandler(request: NextRequest) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ building: true });
  }

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

    console.log(`Bulk ${action}: ${result.count} courses updated`);

    // Log bulk course action
    await logBulkAction({
      userId: body.userId || "admin", // Ideally get from auth middleware but it's not exposed here in the args
      action: `COURSE_BULK_${action}`, // e.g. COURSE_BULK_APPROVE
      resourceType: ResourceType.COURSE,
      resourceIds: courseIds,
      metadata: {
        action,
        comments,
        count: result.count,
      },
    });

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

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
