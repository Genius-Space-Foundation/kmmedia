import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { Role, UserStatus } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendEmail, emailTemplates } from "@/lib/notifications/email";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

const bulkUserActionSchema = z.object({
  action: z.enum(["activate", "deactivate", "suspend", "delete"]),
  userIds: z.array(z.string()).min(1, "At least one user ID is required"),
});

// Create user (Admin only)
async function createUser(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const userData = createUserSchema.parse(body);

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role as Role,
        status: userData.status as UserStatus,
        emailVerified: new Date(), // Auto-verify admin-created users
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
            phone: true,
            bio: true,
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

    // Send email with temporary password
    const emailTemplate = emailTemplates.temporaryPassword({
      userName: userData.name,
      email: userData.email,
      tempPassword,
      role: userData.role,
    });

    await sendEmail({
      to: userData.email,
      ...emailTemplate,
    }).catch((error) =>
      console.error("Failed to send temporary password email:", error)
    );

    return NextResponse.json({
      success: true,
      data: user,
      message: "User created successfully. Temporary password sent via email.",
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "User creation failed",
      },
      { status: 500 }
    );
  }
}

// Get users with filtering (Admin only)
async function getUsers(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
              phone: true,
              bio: true,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(createUser);
export const GET = withAdminAuth(getUsers);
