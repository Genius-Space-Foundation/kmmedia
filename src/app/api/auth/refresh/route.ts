import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken, verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401 }
      );
    }

    const tokens = await refreshAccessToken(refreshToken);

    return NextResponse.json({
      success: true,
      tokens,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Token refresh failed",
      },
      { status: 401 }
    );
  }
}
