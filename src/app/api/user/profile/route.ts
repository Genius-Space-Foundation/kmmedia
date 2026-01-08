import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { createAuditLog, AuditAction, ResourceType } from "@/lib/audit-log";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    console.log("========== PROFILE API GET REQUEST ==========");

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ No active session");
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("User ID from session:", userId);

    console.log("Fetching user from database...");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        status: true,
        lastLogin: true,
        profileImage: true, // This is on User model
        profile: {
          select: {
            avatar: true,
            bio: true,
            phone: true,
            address: true,
            dateOfBirth: true,
          },
        },
      },
    });

    if (!user) {
      console.log("❌ User not found in database for ID:", userId);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ User found:", user.email);
    console.log("✅ Profile fetched successfully for user:", userId);

    // Flatten the user object to include profile fields at the top level
    const flattenedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.profile?.phone || user.phone || null,
      createdAt: user.createdAt,
      status: user.status,
      lastLogin: user.lastLogin,
      avatar: user.profile?.avatar || user.profileImage || null,
      bio: user.profile?.bio || null,
      address: user.profile?.address || null,
      dateOfBirth: user.profile?.dateOfBirth || null,
    };

    const response = {
      success: true,
      user: flattenedUser,
    };
    console.log(
      "Sending response:",
      JSON.stringify(response).substring(0, 200) + "..."
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const { name, email, phone, address, bio, dateOfBirth, avatar } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already taken" },
        { status: 400 }
      );
    }

    // Update user and profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone: phone || null,
        profile: {
          upsert: {
            create: {
              avatar: avatar || null,
              bio: bio || null,
              phone: phone || null,
              address: address || null,
              dateOfBirth: dateOfBirth || null,
            },
            update: {
              avatar: avatar || null,
              bio: bio || null,
              phone: phone || null,
              address: address || null,
              dateOfBirth: dateOfBirth || null,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        status: true,
        lastLogin: true,
        profileImage: true,
        profile: {
          select: {
            avatar: true,
            bio: true,
            phone: true,
            address: true,
            dateOfBirth: true,
          },
        },
      },
    });

    console.log("Profile updated successfully for user:", userId);

    // Log profile update
    await createAuditLog({
      userId: userId,
      action: AuditAction.USER_UPDATE,
      resourceType: ResourceType.USER,
      resourceId: userId,
      metadata: {
        updatedFields: Object.keys(body).filter(k => body[k] !== undefined),
      },
    });

    // Flatten the response
    const flattenedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.profile?.phone || updatedUser.phone || null,
      createdAt: updatedUser.createdAt,
      status: updatedUser.status,
      lastLogin: updatedUser.lastLogin,
      avatar: updatedUser.profile?.avatar || updatedUser.profileImage || null,
      bio: updatedUser.profile?.bio || null,
      address: updatedUser.profile?.address || null,
      dateOfBirth: updatedUser.profile?.dateOfBirth || null,
    };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: flattenedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
