import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { action, newRole } = body;

    // Validate action
    const validActions = ["ACTIVATE", "SUSPEND", "DELETE", "CHANGE_ROLE"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    let updatedUser;

    switch (action) {
      case "ACTIVATE":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            status: "ACTIVE",
            updatedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        break;

      case "SUSPEND":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            status: "SUSPENDED",
            updatedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        break;

      case "CHANGE_ROLE":
        if (!newRole) {
          return NextResponse.json(
            { success: false, message: "New role is required" },
            { status: 400 }
          );
        }

        const validRoles = ["ADMIN", "INSTRUCTOR", "STUDENT"];
        if (!validRoles.includes(newRole)) {
          return NextResponse.json(
            { success: false, message: "Invalid role" },
            { status: 400 }
          );
        }

        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            role: newRole,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        break;

      case "DELETE":
        // Check if user has any dependencies
        const userDependencies = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            _count: {
              select: {
                courses: true,
                applications: true,
                enrollments: true,
              },
            },
          },
        });

        if (
          userDependencies &&
          (userDependencies._count.courses > 0 ||
            userDependencies._count.applications > 0 ||
            userDependencies._count.enrollments > 0)
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Cannot delete user with existing courses, applications, or enrollments",
            },
            { status: 400 }
          );
        }

        await prisma.user.delete({
          where: { id: userId },
        });

        return NextResponse.json({
          success: true,
          message: "User deleted successfully",
        });

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    // Send notification email
    if (action === "SUSPEND") {
      // TODO: Send suspension email
      console.log(`Sending suspension email to ${updatedUser.email}`);
    } else if (action === "ACTIVATE") {
      // TODO: Send activation email
      console.log(`Sending activation email to ${updatedUser.email}`);
    } else if (action === "CHANGE_ROLE") {
      // TODO: Send role change email
      console.log(`Sending role change email to ${updatedUser.email}`);
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
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
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
