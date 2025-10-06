import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

async function getTeamMembers(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // Get team members for the instructor
    // In a real implementation, this would query a team_members table
    // For now, we'll simulate the data
    const teamMembers = [
      {
        id: "1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@example.com",
        role: "INSTRUCTOR",
        permissions: ["VIEW", "EDIT", "MANAGE", "INVITE"],
        status: "ACTIVE",
        joinedAt: "2024-01-15T10:00:00Z",
        lastActive: "2024-01-20T14:30:00Z",
      },
      {
        id: "2",
        name: "Mike Chen",
        email: "mike.chen@example.com",
        role: "ASSISTANT",
        permissions: ["VIEW", "EDIT", "PARTICIPATE"],
        status: "ACTIVE",
        joinedAt: "2024-01-20T09:00:00Z",
        lastActive: "2024-01-20T16:45:00Z",
      },
      {
        id: "3",
        name: "Emily Rodriguez",
        email: "emily.rodriguez@example.com",
        role: "REVIEWER",
        permissions: ["VIEW", "REVIEW"],
        status: "ACTIVE",
        joinedAt: "2024-01-18T11:30:00Z",
        lastActive: "2024-01-19T13:20:00Z",
      },
      {
        id: "4",
        name: "David Kim",
        email: "david.kim@example.com",
        role: "OBSERVER",
        permissions: ["VIEW"],
        status: "PENDING",
        joinedAt: "2024-01-21T08:00:00Z",
        lastActive: "2024-01-21T08:00:00Z",
      },
    ];

    return NextResponse.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch team members",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getTeamMembers);

