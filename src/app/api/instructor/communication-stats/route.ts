import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get communication statistics
async function getCommunicationStats(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    const [
      totalAnnouncements,
      unreadMessages,
      upcomingSessions,
      totalRecipients,
    ] = await Promise.all([
      // Total announcements sent this month
      prisma.announcement.count({
        where: {
          instructorId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Unread messages (if message system exists)
      prisma.message.count({
        where: {
          recipientId: instructorId,
          isRead: false,
        },
      }),

      // Upcoming live sessions
      prisma.liveSession.count({
        where: {
          instructorId,
          scheduledAt: {
            gte: new Date(),
          },
          status: "SCHEDULED",
        },
      }),

      // Total recipients across all communications
      prisma.announcement.count({
        where: { instructorId },
      }),
    ]);

    const stats = {
      totalAnnouncements,
      unreadMessages,
      upcomingSessions,
      totalRecipients: totalAnnouncements * 10, // Mock calculation
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get communication stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch communication stats" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getCommunicationStats);
