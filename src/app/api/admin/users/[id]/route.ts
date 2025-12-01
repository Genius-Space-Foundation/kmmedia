import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/notifications/email";
import { extendedEmailTemplates } from "@/lib/notifications/email-templates-extended";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id;
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

    // Send notification email (async, don't block response)
    if (action === "SUSPEND") {
      sendEmail({
        to: updatedUser.email,
        ...extendedEmailTemplates.userSuspended({
          userName: updatedUser.name || "User",
          reason: body.reason,
        }),
      }).catch((error) => {
        console.error(`Failed to send suspension email to ${updatedUser.email}:`, error);
      });
    } else if (action === "ACTIVATE") {
      sendEmail({
        to: updatedUser.email,
        ...extendedEmailTemplates.userActivated({
          userName: updatedUser.name || "User",
        }),
      }).catch((error) => {
        console.error(`Failed to send activation email to ${updatedUser.email}:`, error);
      });
    } else if (action === "CHANGE_ROLE") {
      // Get old role from request body or fetch from DB before update
      const oldRole = body.oldRole || "STUDENT"; // You may need to fetch this before the update
      sendEmail({
        to: updatedUser.email,
        ...extendedEmailTemplates.roleChanged({
          userName: updatedUser.name || "User",
          oldRole: oldRole,
          newRole: newRole,
        }),
      }).catch((error) => {
        console.error(`Failed to send role change email to ${updatedUser.email}:`, error);
      });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id;

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
