import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { createAuditLog, AuditAction, ResourceType } from "@/lib/audit-log";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
  interests: z.array(z.string()).optional(),
  experience: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed", 
          errors: result.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, password, phone, role, interests, experience } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: "An account with this email already exists. Please login instead.",
          code: "EMAIL_EXISTS"
        },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      email,
      firstName,
      lastName,
      password,
      role: role as UserRole,
      phone,
      interests,
      experience,
    });

    // Send welcome email
    try {
      const { sendEmail, emailTemplates } = await import("@/lib/notifications/email");
      const template = emailTemplates.welcome({ fullName: `${user.firstName} ${user.lastName}` });
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    // Log user registration
    await createAuditLog({
      userId: user.id,
      action: AuditAction.USER_REGISTER,
      resourceType: ResourceType.USER,
      resourceId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
        registrationMethod: 'email',
      },
      req: request,
    });

    // Return success - client should then call NextAuth signIn
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
      message: "Registration successful. Welcome to KM Media!",
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle known Prisma errors
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
          code: "EMAIL_EXISTS"
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "We encountered a technical issue while creating your account. Please try again or contact support if the problem persists.",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}
