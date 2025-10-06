import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  return NextResponse.json({
    success: true,
    message: "Auth test endpoint",
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    authHeader: authHeader,
    token: token ? token.substring(0, 20) + "..." : null,
  });
}
