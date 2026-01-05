import { NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const createInstructorSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

async function createInstructor(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { email, name, password, phone } = createInstructorSchema.parse(body);

    // Check availability
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create user with INSTRUCTOR role and requiresPasswordChange flag
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: UserRole.INSTRUCTOR,
        status: UserStatus.ACTIVE,
        phone,
        requiresPasswordChange: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "PROVISION_INSTRUCTOR",
        resourceType: "USER",
        resourceId: user.id,
        userId: req.user.id,
        metadata: {
          email: user.email,
          name: user.name,
        },
      },
    });

    // Send credentials email
    try {
      const { sendEmail, emailTemplates } = await import("@/lib/notifications/email");
      const template = emailTemplates.instructorWelcome({
        name: user.name,
        email: user.email,
        temporaryPassword: password, // Note: Be careful with sending raw passwords. Consider sending a set-password link instead for better security in future iterations.
        loginUrl: `${process.env.NEXTAUTH_URL}/auth/login`,
      });
      
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error("Failed to send instructor welcome email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Instructor account provisioned successfully",
      data: user,
    });
  } catch (error) {
    console.error("Provisioning error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to provision instructor" },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(createInstructor);
