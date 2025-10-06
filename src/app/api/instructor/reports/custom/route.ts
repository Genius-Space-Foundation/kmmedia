import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";

async function getCustomReports(req: AuthenticatedRequest) {
  try {
    // Mock custom reports data
    const customReports = [
      {
        id: "1",
        name: "Weekly Student Progress",
        description:
          "Automated weekly report on student progress and engagement",
        metrics: ["student-progress", "engagement", "completion"],
        filters: {
          dateRange: "7d",
          courseIds: [],
          studentIds: [],
        },
        schedule: "Weekly (Mondays)",
        recipients: ["instructor@example.com"],
        lastGenerated: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isActive: true,
      },
      {
        id: "2",
        name: "Monthly Revenue Summary",
        description: "Comprehensive monthly revenue and financial analysis",
        metrics: ["revenue", "payments", "refunds", "growth"],
        filters: {
          dateRange: "30d",
          courseIds: [],
          paymentStatus: "COMPLETED",
        },
        schedule: "Monthly (1st of month)",
        recipients: ["instructor@example.com", "admin@example.com"],
        lastGenerated: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isActive: true,
      },
      {
        id: "3",
        name: "Course Performance Deep Dive",
        description:
          "Detailed analysis of course performance and student feedback",
        metrics: [
          "course-ratings",
          "completion-rates",
          "student-feedback",
          "engagement",
        ],
        filters: {
          dateRange: "90d",
          courseIds: [],
          minRating: 3,
        },
        schedule: "Quarterly",
        recipients: ["instructor@example.com"],
        lastGenerated: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isActive: false,
      },
    ];

    return NextResponse.json(customReports);
  } catch (error) {
    console.error("Error fetching custom reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom reports" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getCustomReports);

