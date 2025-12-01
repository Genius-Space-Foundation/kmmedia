import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { GradingService } from "@/lib/assignments/grading-service";

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

    const submissionId = (await params).id;

    // Get grading history
    const history = await GradingService.getGradingHistory(submissionId);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching grading history:", error);
    return NextResponse.json(
      { error: "Failed to fetch grading history" },
      { status: 500 }
    );
  }
}
