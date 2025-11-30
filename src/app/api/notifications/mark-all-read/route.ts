import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function markAllNotificationsRead(request: AuthenticatedRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetUserId = body.userId || request.user!.userId;

    if (
      targetUserId !== request.user!.userId &&
      request.user!.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: targetUserId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(markAllNotificationsRead);
