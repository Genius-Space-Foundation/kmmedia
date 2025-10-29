import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { UserRole, UserStatus } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Validate JWT secrets
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  throw new Error("JWT_REFRESH_SECRET must be at least 32 characters long");
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT tokens
export function generateTokens(payload: JWTPayload): AuthTokens {
  const accessToken = jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "kmmedia-lms",
    audience: "kmmedia-users",
  });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET!, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: "kmmedia-lms",
    audience: "kmmedia-users",
  });

  return { accessToken, refreshToken };
}

// Verify JWT token
export function verifyToken(
  token: string,
  isRefresh = false
): JWTPayload | null {
  try {
    const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret!, {
      issuer: "kmmedia-lms",
      audience: "kmmedia-users",
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      status: true,
      profile: true,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new Error("Account is not active");
  }

  // For now, we'll assume password is stored in a separate field
  // In a real implementation, you'd store hashed passwords
  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      profile: user.profile,
    },
    tokens: generateTokens(payload),
  };
}

// Create user (for admin use)
export async function createUser(userData: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  phone?: string;
  interests?: string[];
  experience?: string;
}) {
  const hashedPassword = await hashPassword(userData.password);

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      role: userData.role,
      phone: userData.phone,
    },
  });

  // Create learning profile if interests or experience provided
  if (userData.interests || userData.experience) {
    await prisma.learningProfile.create({
      data: {
        userId: user.id,
        interests: userData.interests || [],
        experience: userData.experience || "",
        onboardingCompleted: false,
      },
    });
  }

  return user;
}

// Refresh token
export async function refreshAccessToken(refreshToken: string) {
  const payload = verifyToken(refreshToken, true);

  if (!payload) {
    throw new Error("Invalid refresh token");
  }

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new Error("User not found or inactive");
  }

  const newPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  return generateTokens(newPayload);
}
