import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const GET = withStudentAuth(async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        { status: 401 }
      );
    }

    const userId = request.user.userId;

    // Get user's notifications
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent 50 notifications
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map((notif) => ({
          id: notif.id,
          title: notif.title,
          message: notif.content,
          type: notif.type || "general",
          priority: notif.priority || "medium",
          read: notif.read,
          createdAt: notif.createdAt.toISOString(),
          actionUrl: notif.actionUrl,
          actionText: notif.actionText,
        })),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
});

// Update notification settings
export const PUT = withStudentAuth(async (request: AuthenticatedRequest) => {
  try {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        { status: 401 }
      );
    }

    const userId = request.user.userId;

    const body = await request.json();
    const settings = body;

    // Update or create notification settings
    await prisma.userNotificationSettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification settings updated successfully",
    });
  } catch (error) {
    console.error("Update notification settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification settings",
      },
      { status: 500 }
    );
  }
});
