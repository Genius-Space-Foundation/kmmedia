import { NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { UserStatus } from "@prisma/client";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const bulkUserActionSchema = z.object({
  action: z.enum(["ACTIVATE", "SUSPEND", "DELETE", "SEND_EMAIL"]),
  userIds: z.array(z.string()).min(1, "At least one user ID is required"),
  comments: z.string().optional(),
});

// Bulk user operations (Admin only)
async function bulkUserActions(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { action, userIds, comments } = bulkUserActionSchema.parse(body);

    // Validate that users exist
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, status: true, role: true },
    });

    if (users.length !== userIds.length) {
      return NextResponse.json(
        { success: false, message: "Some users not found" },
        { status: 404 }
      );
    }

    // Prevent admin from performing bulk actions on other admins
    const adminUsers = users.filter((user) => user.role === "ADMIN");
    if (adminUsers.length > 0 && action !== "SEND_EMAIL") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot perform bulk actions on admin users",
          affectedUsers: adminUsers.map((u) => u.email),
        },
        { status: 403 }
      );
    }

    let result;
    let message = "";

    switch (action) {
      case "ACTIVATE":
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            role: { not: "ADMIN" }, // Extra safety check
          },
          data: { status: UserStatus.ACTIVE },
        });
        message = `${result.count} users activated successfully`;
        break;

      case "SUSPEND":
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            role: { not: "ADMIN" }, // Extra safety check
          },
          data: { status: UserStatus.SUSPENDED },
        });
        message = `${result.count} users suspended successfully`;
        break;

      case "DELETE":
        // Soft delete by setting status to INACTIVE and adding deletion timestamp
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            role: { not: "ADMIN" }, // Extra safety check
          },
          data: {
            status: UserStatus.INACTIVE,
            // In a real implementation, you might want to add a deletedAt field
          },
        });
        message = `${result.count} users deleted successfully`;
        break;

      case "SEND_EMAIL":
        // In a real implementation, this would trigger email sending
        // For now, we'll just log the action
        console.log(
          `Bulk email would be sent to ${users.length} users:`,
          users.map((u) => u.email)
        );
        result = { count: users.length };
        message = `Email queued for ${users.length} users`;
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    // Log the bulk action for audit purposes
    console.log(`Bulk action performed by admin ${req.user!.userId}:`, {
      action,
      userIds,
      comments,
      affectedCount: result.count,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, you might want to create audit log entries
    // await prisma.auditLog.createMany({
    //   data: userIds.map(userId => ({
    //     action: `BULK_${action}`,
    //     targetUserId: userId,
    //     performedById: req.user.id,
    //     comments,
    //   }))
    // });

    return NextResponse.json({
      success: true,
      message,
      data: {
        action,
        affectedCount: result.count,
        processedUsers: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        })),
      },
    });
  } catch (error) {
    console.error("Bulk user action error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Bulk action failed",
      },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(bulkUserActions);
