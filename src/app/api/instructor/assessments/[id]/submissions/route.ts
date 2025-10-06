import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import {
  getAssessmentSubmissions,
  getAssessmentStatistics,
} from "@/lib/assessments/assessment-manager";

// Get assessment submissions
async function getSubmissionsHandler(req: AuthenticatedRequest) {
  try {
    const { id } = req.nextUrl.pathname.split("/").pop() as any;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Assessment ID is required" },
        { status: 400 }
      );
    }

    const submissions = await getAssessmentSubmissions(id);
    const statistics = await getAssessmentStatistics(id);

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        statistics,
      },
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getSubmissionsHandler);
