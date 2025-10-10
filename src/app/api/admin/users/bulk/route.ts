import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminAuth } from "@/lib/middleware/auth";

async function bulkHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, action, comments } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "User IDs are required" },
        { status: 400 }
      );
    }

    if (
      !action ||
      !["ACTIVATE", "SUSPEND", "DELETE", "SEND_EMAIL"].includes(action)
    ) {
      return NextResponse.json(
        { success: false, message: "Valid action is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "ACTIVATE":
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "ACTIVE" },
        });
        break;

      case "SUSPEND":
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "SUSPENDED" },
        });
        break;

      case "DELETE":
        // Check for dependencies
        const usersWithDependencies = await prisma.user.findMany({
          where: { id: { in: userIds } },
          include: {
            _count: {
              select: {
                courses: true,
                applications: true,
                enrollments: true,
              },
            },
          },
        });

        const cannotDelete = usersWithDependencies.filter(
          (user) =>
            user._count.courses > 0 ||
            user._count.applications > 0 ||
            user._count.enrollments > 0
        );

        if (cannotDelete.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot delete ${cannotDelete.length} users with existing data`,
            },
            { status: 400 }
          );
        }

        result = await prisma.user.deleteMany({
          where: { id: { in: userIds } },
        });
        break;

      case "SEND_EMAIL":
        // TODO: Implement email sending
        console.log(`Sending email to ${userIds.length} users`);
        result = { count: userIds.length };
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk action completed for ${result.count} users`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Bulk user action error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process bulk action" },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(bulkHandler);
