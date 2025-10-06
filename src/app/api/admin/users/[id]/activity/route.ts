import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get user activity logs
async function getUserActivity(req: AuthenticatedRequest) {
  try {
    const { id } = (await req.nextUrl.pathname.split("/").pop()) as any;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user activity logs from the database
    const activities = await prisma.activityLog.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 activities
    });

    // Transform activities for frontend
    const transformedActivities = activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      type: activity.type,
      timestamp: activity.createdAt,
      details: activity.details,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
    }));

    return NextResponse.json({
      success: true,
      data: transformedActivities,
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user activity" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getUserActivity);
