import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications/notification-manager";

async function getNotifications(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || request.user!.userId;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const read = searchParams.get("read");

    // Ensure user can only access their own notifications (unless admin)
    if (userId !== request.user!.userId && request.user!.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build where clause with filters
    const where: any = { userId };

    if (type && type !== "all") {
      where.type = type;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (read !== null && read !== undefined) {
      if (read === "true") {
        where.read = true;
      } else if (read === "false") {
        where.read = false;
      }
    }

    // Fetch notifications with filters
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      getUnreadNotificationCount(userId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function createNotification(request: AuthenticatedRequest) {
  try {
    // Only admins and instructors can create notifications
    if (!["ADMIN", "INSTRUCTOR"].includes(request.user!.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      title,
      content,
      type = "general",
      priority = "medium",
      actionUrl,
      actionText,
    } = body;

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        content,
        type,
        priority,
        actionUrl,
        actionText,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getNotifications);
export const POST = withAuth(createNotification);
