import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getCollaborationStats(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // In a real implementation, this would calculate stats from the database
    // For now, we'll simulate the data
    const stats = {
      totalTeamMembers: 4,
      activeSessions: 2,
      completedReviews: 1,
      averageRating: 4.2,
      collaborationHours: 15.5,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching collaboration stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch collaboration stats",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getCollaborationStats);

