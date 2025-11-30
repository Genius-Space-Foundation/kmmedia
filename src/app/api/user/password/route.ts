import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Update user password
async function updatePassword(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;
    const body = await req.json();
    const data = updatePasswordSchema.parse(body);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "Password not set for this user" },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      data.currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update password",
      },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updatePassword);
