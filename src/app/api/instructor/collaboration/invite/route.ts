import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["ASSISTANT", "REVIEWER", "OBSERVER"]),
  permissions: z.array(z.string()).optional(),
});

async function inviteTeamMember(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = inviteSchema.parse(body);
    const instructorId = req.user!.userId;

    // In a real implementation, this would:
    // 1. Create an invitation record in the database
    // 2. Send an email invitation
    // 3. Generate a secure invitation token

    const invitation = {
      id: Date.now().toString(),
      email: validatedData.email,
      role: validatedData.role,
      permissions: validatedData.permissions || [],
      status: "PENDING",
      invitedBy: instructorId,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    // Simulate sending invitation email
    console.log(
      `Sending invitation email to ${validatedData.email} for role ${validatedData.role}`
    );

    return NextResponse.json({
      success: true,
      data: invitation,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send invitation",
      },
      { status: 500 }
    );
  }
}

export const POST = withInstructorAuth(inviteTeamMember);

