import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getIntegrationUsage(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // In a real implementation, this would query usage analytics from the database
    // For now, we'll simulate the data
    const usage = [
      {
        integrationId: "1",
        name: "Zoom",
        usageCount: 45,
        lastUsed: "2024-01-20T14:30:00Z",
        features: ["Live Meetings", "Recording", "Breakout Rooms"],
      },
      {
        integrationId: "2",
        name: "Google Drive",
        usageCount: 128,
        lastUsed: "2024-01-20T12:15:00Z",
        features: ["File Storage", "Document Sharing", "Collaborative Editing"],
      },
      {
        integrationId: "3",
        name: "Google Calendar",
        usageCount: 67,
        lastUsed: "2024-01-20T16:45:00Z",
        features: ["Event Scheduling", "Reminders", "Time Blocking"],
      },
      {
        integrationId: "4",
        name: "Gmail",
        usageCount: 89,
        lastUsed: "2024-01-20T12:20:00Z",
        features: ["Bulk Emails", "Templates", "Automated Responses"],
      },
      {
        integrationId: "5",
        name: "Google Analytics",
        usageCount: 23,
        lastUsed: "2024-01-19T09:30:00Z",
        features: [
          "Student Engagement",
          "Course Performance",
          "Custom Reports",
        ],
      },
      {
        integrationId: "6",
        name: "Kahoot!",
        usageCount: 34,
        lastUsed: "2024-01-15T11:00:00Z",
        features: ["Interactive Quizzes", "Live Polls", "Gamification"],
      },
      {
        integrationId: "7",
        name: "Slack",
        usageCount: 156,
        lastUsed: "2024-01-20T13:10:00Z",
        features: ["Team Chat", "Channels", "File Sharing"],
      },
    ];

    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error("Error fetching integration usage:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch integration usage",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getIntegrationUsage);

