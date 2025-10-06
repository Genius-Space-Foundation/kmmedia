import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getIntegrationStats(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // In a real implementation, this would calculate stats from the database
    // For now, we'll simulate the data
    const stats = {
      totalIntegrations: 8,
      activeIntegrations: 5,
      totalUsage: 541,
      mostUsed: "Slack",
      lastSync: "2024-01-20T16:45:00Z",
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching integration stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch integration stats",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getIntegrationStats);

