import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getNotification(
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

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function deleteNotification(
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

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = (
  request: NextRequest,
  context: { params: { id: string } }
) => withAuth((req) => getNotification(req, context.params.id))(request);

export const DELETE = (
  request: NextRequest,
  context: { params: { id: string } }
) => withAuth((req) => deleteNotification(req, context.params.id))(request);
