import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function markNotificationAsRead(
  request: AuthenticatedRequest,
  notificationId: string
) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (
      notification.userId !== request.user!.userId &&
      request.user!.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PATCH = (
  request: NextRequest,
  context: { params: { id: string } }
) => withAuth((req) => markNotificationAsRead(req, context.params.id))(request);
