import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("========== PROFILE API GET REQUEST ==========");

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No auth header or invalid format");
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    console.log("Token extracted, length:", token.length);
    console.log("Token first 20 chars:", token.substring(0, 20) + "...");

    // Verify JWT token using the auth library
    console.log("Attempting to verify token...");
    const payload = verifyToken(token, false);
    console.log("Verification result:", payload ? "✅ Valid" : "❌ Invalid");

    if (!payload) {
      console.error("❌ JWT verification failed - Invalid token");
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    console.log("✅ Token verified! Payload:", payload);
    const userId = payload.userId;
    console.log("User ID from token:", userId);

    if (!userId) {
      console.log("❌ No userId in payload");
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

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
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify JWT token using the auth library
    const payload = verifyToken(token, false);

    if (!payload) {
      console.error("JWT verification failed - Invalid token");
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

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
