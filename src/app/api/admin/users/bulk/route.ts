import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { UserStatus } from "@prisma/client";
import { z } from "zod";

const bulkUserActionSchema = z.object({
  action: z.enum(["activate", "deactivate", "suspend", "delete"]),
  userIds: z.array(z.string()).min(1, "At least one user ID is required"),
});

// Bulk user actions (Admin only)
async function bulkUserActions(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { action, userIds } = bulkUserActionSchema.parse(body);

    let updateData: any = {};

    switch (action) {
      case "activate":
        updateData = { status: UserStatus.ACTIVE };
        break;
      case "deactivate":
        updateData = { status: UserStatus.INACTIVE };
        break;
      case "suspend":
        updateData = { status: UserStatus.SUSPENDED };
        break;
      case "delete":
        // Soft delete by suspending and modifying email
        const timestamp = Date.now();
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        });

        await Promise.all(
          users.map((user) =>
            prisma.user.update({
              where: { id: user.id },
              data: {
                status: UserStatus.SUSPENDED,
                email: `deleted_${timestamp}_${user.email}`,
              },
            })
          )
        );

        return NextResponse.json({
          success: true,
          message: `${userIds.length} users deleted successfully`,
        });
      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: { updatedCount: result.count },
      message: `${result.count} users ${action}d successfully`,
    });
  } catch (error) {
    console.error("Bulk user action error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
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

export const POST = withAdminAuth(bulkUserActions);

