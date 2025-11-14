import { randomBytes, createHmac } from "crypto";
import { NextRequest } from "next/server";

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || "";
const CSRF_TOKEN_LENGTH = 32;

if (!CSRF_SECRET || CSRF_SECRET.length < 32) {
  console.warn("⚠️ CSRF_SECRET not set or too short. Using JWT_SECRET as fallback.");
}

/**
 * Generate a CSRF token
 * Format: {random}.{signature}
 */
export function generateCsrfToken(): string {
  const randomValue = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const signature = createHmac("sha256", CSRF_SECRET)
    .update(randomValue)
    .digest("hex");
  return `${randomValue}.${signature}`;
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [randomValue, signature] = parts;
  const expectedSignature = createHmac("sha256", CSRF_SECRET)
    .update(randomValue)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(signature, expectedSignature);
}

/**
 * Constant-time string comparison
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Extract CSRF token from request
 * Checks: header, body, query parameter (in that order)
 */
export function extractCsrfToken(req: NextRequest): string | null {
  // Check header first (recommended)
  const headerToken = req.headers.get("x-csrf-token");
  if (headerToken) {
    return headerToken;
  }

  // Check query parameter (for GET requests with forms)
  const { searchParams } = new URL(req.url);
  const queryToken = searchParams.get("_csrf");
  if (queryToken) {
    return queryToken;
  }

  return null;
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  return !safeMethods.includes(method.toUpperCase());
}

/**
 * Check if route is exempt from CSRF protection
 */
export function isExemptRoute(pathname: string): boolean {
  const exemptPaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/webhooks", // Webhooks don't use CSRF
    "/api/health",
  ];

  return exemptPaths.some((path) => pathname.startsWith(path));
}

/**
 * Middleware function to validate CSRF token
 */
export function validateCsrfToken(req: NextRequest): boolean {
  const { pathname } = new URL(req.url);

  // Skip CSRF check for exempt routes
  if (isExemptRoute(pathname)) {
    return true;
  }

  // Skip CSRF check for safe methods
  if (!requiresCsrfProtection(req.method)) {
    return true;
  }

  // Extract and verify token
  const token = extractCsrfToken(req);
  if (!token) {
    console.warn(`CSRF token missing for ${req.method} ${pathname}`);
    return false;
  }

  const isValid = verifyCsrfToken(token);
  if (!isValid) {
    console.warn(`Invalid CSRF token for ${req.method} ${pathname}`);
  }

  return isValid;
}

/**
 * Get CSRF token from cookie or generate new one
 * For use in API routes
 */
export function getCsrfTokenForResponse(): string {
  return generateCsrfToken();
}
