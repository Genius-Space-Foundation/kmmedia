import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { withErrorHandler } from "@/lib/error-handler";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

async function loginHandler(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.auth)(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json();
  const { email, password } = loginSchema.parse(body);

  const result = await authenticateUser(email, password);

  return NextResponse.json({
    success: true,
    user: result.user,
    tokens: result.tokens,
    message: "Login successful",
  });
}

export const POST = withErrorHandler(loginHandler);
