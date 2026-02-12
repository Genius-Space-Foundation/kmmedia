import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { UserRole } from "@prisma/client";

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

// Create user (for admin use)
export async function createUser(userData: {
  email: string;
  firstName: string;
  lastName: string;
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
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: hashedPassword,
      role: userData.role,
      phone: userData.phone,
    },
  });

  // Create learning profile if interests or experience provided
  if (userData.interests || userData.experience) {
    await prisma.learningProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        interests: userData.interests || [],
        experience: userData.experience || "",
        onboardingCompleted: false,
      },
      update: {
        interests: userData.interests || [],
        experience: userData.experience || "",
      }
    });
  }

  return user;
}
