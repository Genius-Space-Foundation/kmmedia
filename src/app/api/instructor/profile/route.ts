import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get instructor profile
async function getProfile(req: NextRequest) {
  try {
    const instructorId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: instructorId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        coverImage: true,
        bio: true,
        title: true,
        department: true,
        specialization: true,
        qualifications: true,
        experience: true,
        location: true,
        socialLinks: true,
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// Update instructor profile
async function updateProfile(req: NextRequest) {
  try {
    const instructorId = req.user!.userId;
    const body = await req.json();

    const updatedUser = await prisma.user.update({
      where: {
        id: instructorId,
      },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        profileImage: body.profileImage,
        coverImage: body.coverImage,
        bio: body.bio,
        title: body.title,
        department: body.department,
        specialization: body.specialization,
        qualifications: body.qualifications,
        experience: body.experience,
        location: body.location,
        socialLinks: body.socialLinks,
        preferences: body.preferences,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        coverImage: true,
        bio: true,
        title: true,
        department: true,
        specialization: true,
        qualifications: true,
        experience: true,
        location: true,
        socialLinks: true,
        preferences: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getProfile);
export const PUT = withInstructorAuth(updateProfile);
