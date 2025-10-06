import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getIntegrations(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // In a real implementation, this would query the database for instructor's integrations
    // For now, we'll simulate the data
    const integrations = [
      {
        id: "1",
        name: "Zoom",
        type: "VIDEO_CONFERENCING",
        provider: "Zoom",
        status: "CONNECTED",
        lastSync: "2024-01-20T14:30:00Z",
        features: ["Live Meetings", "Recording", "Breakout Rooms", "Polls"],
        icon: "🎥",
        description:
          "Host live video sessions and record meetings for your courses",
        setupUrl: "https://zoom.us/oauth/authorize",
      },
      {
        id: "2",
        name: "Google Drive",
        type: "CLOUD_STORAGE",
        provider: "Google",
        status: "DISCONNECTED",
        lastSync: "2024-01-18T10:15:00Z",
        features: [
          "File Storage",
          "Document Sharing",
          "Collaborative Editing",
          "Version Control",
        ],
        icon: "☁️",
        description: "Store and share course materials with your students",
        setupUrl: "https://accounts.google.com/oauth/authorize",
      },
      {
        id: "3",
        name: "Google Calendar",
        type: "CALENDAR",
        provider: "Google",
        status: "CONNECTED",
        lastSync: "2024-01-20T16:45:00Z",
        features: [
          "Event Scheduling",
          "Reminders",
          "Time Blocking",
          "Meeting Links",
        ],
        icon: "📅",
        description: "Sync your course schedule and manage live sessions",
        setupUrl: "https://accounts.google.com/oauth/authorize",
      },
      {
        id: "4",
        name: "Gmail",
        type: "EMAIL",
        provider: "Google",
        status: "CONNECTED",
        lastSync: "2024-01-20T12:20:00Z",
        features: [
          "Bulk Emails",
          "Templates",
          "Automated Responses",
          "Tracking",
        ],
        icon: "📧",
        description:
          "Send announcements and communicate with students via email",
        setupUrl: "https://accounts.google.com/oauth/authorize",
      },
      {
        id: "5",
        name: "Google Analytics",
        type: "ANALYTICS",
        provider: "Google",
        status: "PENDING",
        lastSync: "2024-01-19T09:30:00Z",
        features: [
          "Student Engagement",
          "Course Performance",
          "Custom Reports",
          "Real-time Data",
        ],
        icon: "📊",
        description: "Track student engagement and course performance metrics",
        setupUrl: "https://accounts.google.com/oauth/authorize",
      },
      {
        id: "6",
        name: "Kahoot!",
        type: "ASSESSMENT",
        provider: "Kahoot!",
        status: "DISCONNECTED",
        lastSync: "2024-01-15T11:00:00Z",
        features: [
          "Interactive Quizzes",
          "Live Polls",
          "Gamification",
          "Real-time Results",
        ],
        icon: "🎮",
        description: "Create engaging quizzes and interactive assessments",
        setupUrl: "https://kahoot.com/oauth/authorize",
      },
      {
        id: "7",
        name: "Slack",
        type: "COMMUNICATION",
        provider: "Slack",
        status: "CONNECTED",
        lastSync: "2024-01-20T13:10:00Z",
        features: ["Team Chat", "Channels", "File Sharing", "Notifications"],
        icon: "💬",
        description: "Create communication channels for your courses and teams",
        setupUrl: "https://slack.com/oauth/authorize",
      },
      {
        id: "8",
        name: "Microsoft Teams",
        type: "VIDEO_CONFERENCING",
        provider: "Microsoft",
        status: "ERROR",
        lastSync: "2024-01-17T08:45:00Z",
        features: [
          "Video Calls",
          "Screen Sharing",
          "File Collaboration",
          "Chat",
        ],
        icon: "👥",
        description:
          "Alternative video conferencing and collaboration platform",
        setupUrl: "https://login.microsoftonline.com/oauth2/authorize",
      },
    ];

    return NextResponse.json({
      success: true,
      data: integrations,
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch integrations",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getIntegrations);

