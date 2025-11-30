import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { UserStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: "No authentication session",
        },
        { status: 401 }
      );
    }

    // Get full user details from database
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        profileImage: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found or inactive",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in auth/me:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 401 }
    );
  }
}
