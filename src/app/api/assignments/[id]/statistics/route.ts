import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { GradingService } from "@/lib/assignments/grading-service";
import { AssignmentService } from "@/lib/assignments/assignment-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const assignmentId = (await params).id;

    // Verify user has access to this assignment
    const hasAccess = await AssignmentService.validateInstructorAccess(
      assignmentId,
      session.user.id,
      session.user.role as any
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Access denied. You don't have permission to view these statistics.",
        },
        { status: 403 }
      );
    }

    // Get assignment statistics
    const statistics = await GradingService.getAssignmentGradeStatistics(
      assignmentId
    );

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error fetching assignment statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment statistics" },
      { status: 500 }
    );
  }
}
