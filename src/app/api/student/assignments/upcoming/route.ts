import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

async function getUpcomingAssignments(request: AuthenticatedRequest) {
  try {
    // For now, return empty array since there are no assignments in the system yet
    // This endpoint can be fully implemented when assignments are added to courses
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching upcoming assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(getUpcomingAssignments);
