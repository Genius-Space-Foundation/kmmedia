import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/csrf";

/**
 * GET /api/csrf - Get CSRF token for forms
 * This endpoint allows clients to fetch a CSRF token before submitting forms
 */
export async function GET() {
  try {
    const csrfToken = generateCsrfToken();

    return NextResponse.json({
      success: true,
      csrfToken,
      message: "CSRF token generated successfully",
    });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate CSRF token",
      },
      { status: 500 }
    );
  }
}
