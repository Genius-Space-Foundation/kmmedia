import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function disconnectIntegration(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instructorId = req.user!.userId;
    const integrationId = params.id;

    // In a real implementation, this would:
    // 1. Remove the stored credentials from the database
    // 2. Update the integration status to DISCONNECTED
    
    console.log(`Disconnecting integration ${integrationId} for instructor ${instructorId}`);

    return NextResponse.json({
      success: true,
      message: "Integration disconnected successfully",
      data: {
        id: integrationId,
        status: "DISCONNECTED",
      }
    });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { success: false, message: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(disconnectIntegration);
