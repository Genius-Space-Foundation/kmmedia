import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import {
  initializePayment,
  generatePaymentReference,
  convertToPesewas,
} from "@/lib/payments/paystack";
import { createPaymentRecord } from "@/lib/payments/paystack";
import { prisma } from "@/lib/db";
import { z } from "zod";

const initializeAppFeeSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { courseId } = initializeAppFeeSchema.parse(body);
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

    // 2. Validate Course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, applicationFee: true, status: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.status !== "APPROVED" && course.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, message: "Course is not available for applications" },
        { status: 400 }
      );
    }

    if (course.applicationFee <= 0) {
      return NextResponse.json(
        { success: false, message: "This course has no application fee" },
        { status: 400 }
      );
    }

    // 3. Check for existing application
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: "You have already applied for this course" },
        { status: 400 }
      );
    }

    // 4. Check if fee already paid (but application not created yet)
    // This prevents double payment if the user paid but didn't complete the form
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        type: "APPLICATION_FEE",
        status: "COMPLETED",
        applicationId: null,
        metadata: {
          path: ["courseId"],
          equals: courseId,
        },
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Application fee already paid. Please proceed to application form.",
          data: {
            paymentId: existingPayment.id,
            alreadyPaid: true
          }
        },
        { status: 400 }
      );
    }

    // 5. Initialize Payment
    const reference = generatePaymentReference();
    const amount = course.applicationFee;

    const paystackResponse = await initializePayment({
      email: user.email,
      amount: convertToPesewas(amount),
      reference,
      metadata: {
        userId,
        type: "APPLICATION_FEE",
        courseId,
        custom_fields: [
          {
            display_name: "Payment Type",
            variable_name: "payment_type",
            value: "Application Fee"
          },
          {
            display_name: "Course",
            variable_name: "course_title",
            value: course.title
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

    // 6. Create Payment Record
    await createPaymentRecord({
      userId,
      type: "APPLICATION_FEE",
      amount,
      reference,
      // We don't link applicationId yet because it doesn't exist
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        reference,
        accessCode: paystackResponse.data.access_code,
      },
      message: "Application fee payment initialized",
    });

  } catch (error) {
    console.error("Application fee initialization error:", error);

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
