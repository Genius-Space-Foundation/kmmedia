import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import {
  initializePayment,
  generatePaymentReference,
  convertToPesewas,
} from "@/lib/payments/paystack";
import { createPaymentRecord } from "@/lib/payments/paystack";
import { prisma } from "@/lib/db";
import { PaymentType } from "@prisma/client";
import { z } from "zod";

const initializeTuitionSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { applicationId } = initializeTuitionSchema.parse(body);
    const userId = req.user!.userId;

    // 1. Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 2. Validate Application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    if (application.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (application.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Application is not approved yet" },
        { status: 400 }
      );
    }

    // 3. Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: application.courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: "You are already enrolled in this course" },
        { status: 400 }
      );
    }

    // 4. Initialize Payment
    const reference = generatePaymentReference();
    const amount = application.course.price;

    const paystackResponse = await initializePayment({
      email: user.email,
      amount: convertToPesewas(amount),
      reference,
      metadata: {
        userId,
        type: "TUITION",
        applicationId,
        courseId: application.courseId, // Add courseId for easier lookup later
        custom_fields: [
          {
            display_name: "Payment Type",
            variable_name: "payment_type",
            value: "Tuition Fee"
          },
          {
            display_name: "Course",
            variable_name: "course_title",
            value: application.course.title
          }
        ]
      },
    });

    if (!paystackResponse.status) {
      return NextResponse.json(
        { success: false, message: paystackResponse.message },
        { status: 400 }
      );
    }

    // 5. Create Payment Record
    await createPaymentRecord({
      userId,
      type: "TUITION",
      amount,
      reference,
      // We link to application immediately
    });
    
    // Update the payment with applicationId since createPaymentRecord might not support it directly 
    // depending on its implementation (checking that next)
    // But assuming standard prisma create, we can update it.
    await prisma.payment.update({
      where: { reference },
      data: { applicationId }
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        reference,
        accessCode: paystackResponse.data.access_code,
      },
      message: "Tuition payment initialized",
    });

  } catch (error) {
    console.error("Tuition payment initialization error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Payment initialization failed",
      },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(handler);
