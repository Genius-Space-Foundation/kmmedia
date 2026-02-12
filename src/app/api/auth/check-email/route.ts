import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  email: z.string().email(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const result = querySchema.safeParse({ email });
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: result.data.email },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      available: !existingUser,
      message: existingUser ? "Email is already registered" : "Email is available",
    });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check email availability" },
      { status: 500 }
    );
  }
}
