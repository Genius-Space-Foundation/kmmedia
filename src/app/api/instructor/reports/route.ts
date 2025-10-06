import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

async function getReports(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user.id;

    // Mock reports data - in a real implementation, this would come from a reports table
    const reports = [
      {
        id: "1",
        title: "Student Performance Report",
        type: "student-performance",
        generatedAt: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        period: "Last 30 days",
        status: "completed",
        size: "2.3 MB",
        format: "PDF",
      },
      {
        id: "2",
        title: "Course Analytics Report",
        type: "course-analytics",
        generatedAt: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        period: "Last 90 days",
        status: "completed",
        size: "1.8 MB",
        format: "PDF",
      },
      {
        id: "3",
        title: "Revenue Analysis",
        type: "revenue-report",
        generatedAt: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        period: "Last 30 days",
        status: "completed",
        size: "1.2 MB",
        format: "Excel",
      },
      {
        id: "4",
        title: "Engagement Analysis",
        type: "engagement-analysis",
        generatedAt: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        period: "Last 7 days",
        status: "processing",
        size: "0 MB",
        format: "PDF",
      },
    ];

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getReports);

