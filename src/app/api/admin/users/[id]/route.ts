import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { UserStatus } from "@prisma/client";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  profile: z
    .object({
      phone: z.string().optional(),
      bio: z.string().optional(),
    })
    .optional(),
});

// Update user (Admin only)
async function updateUser(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const updateData = updateUserSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        status: updateData.status as UserStatus,
        profile: updateData.profile
          ? {
              upsert: {
                create: updateData.profile,
                update: updateData.profile,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        profile: {
          select: {
            bio: true,
            phone: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            courses: true,
            applications: true,
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "User update failed",
      },
      { status: 500 }
    );
  }
}

// Delete user (Admin only)
async function deleteUser(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to SUSPENDED
    await prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.SUSPENDED,
        email: `deleted_${Date.now()}_${user.email}`, // Prevent email conflicts
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "User deletion failed",
      },
      { status: 500 }
    );
  }
}

// Get user details (Admin only)
async function getUser(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        emailVerified: true,
        profile: {
          select: {
            bio: true,
            phone: true,
            avatar: true,
          },
        },
        courses: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                applications: true,
                enrollments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        applications: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { submittedAt: "desc" },
          take: 10,
        },
        enrollments: {
          select: {
            id: true,
            status: true,
            progress: true,
            enrolledAt: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            courses: true,
            applications: true,
            enrollments: true,
          },
        },
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
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(updateUser);
export const DELETE = withAdminAuth(deleteUser);
export const GET = withAdminAuth(getUser);
