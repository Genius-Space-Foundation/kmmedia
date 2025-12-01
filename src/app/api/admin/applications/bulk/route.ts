import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminAuth } from "@/lib/middleware/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function bulkHandler(request: NextRequest) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ building: true });
  }

  try {
    const body = await request.json();
    const { applicationIds, action, comments } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Application IDs are required" },
        { status: 400 }
      );
    }

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Valid action is required" },
        { status: 400 }
      );
    }

    const result = await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        ...(comments && { comments }),
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`Bulk ${action}: ${result.count} applications updated`);

    return NextResponse.json({
      success: true,
      message: `${result.count} applications ${action.toLowerCase()}d successfully`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error("Bulk application action error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process bulk action" },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(bulkHandler);

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
