import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { GradingService } from "@/lib/assignments/grading-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Use the GradingService to handle bulk grading
    const result = await GradingService.bulkGradeSubmissions(
      body,
      session.user.id
    );

    return NextResponse.json({
      message: `Successfully graded ${result.successful.length} submissions`,
      successful: result.successful.length,
      failed: result.failed.length,
      failures: result.failed,
      results: result.successful,
    });
  } catch (error) {
    console.error("Error bulk grading submissions:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to bulk grade submissions" },
      { status: 500 }
    );
  }
}
