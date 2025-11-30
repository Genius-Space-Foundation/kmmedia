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

const initializeInstallmentSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { applicationId } = initializeInstallmentSchema.parse(body);
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

    // 2. Validate Application & Course
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            installmentEnabled: true,
            installmentPlan: true,
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

    if (!application.course.installmentEnabled || !application.course.installmentPlan) {
      return NextResponse.json(
        { success: false, message: "Installment payments are not enabled for this course" },
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

    // 4. Calculate Upfront Amount
    const plan = application.course.installmentPlan as any;
    const upfrontPercentage = plan.upfront || 0;
    
    if (upfrontPercentage <= 0) {
        return NextResponse.json(
            { success: false, message: "Invalid installment plan configuration" },
            { status: 500 }
        );
    }

    const upfrontAmount = (application.course.price * upfrontPercentage) / 100;

    // 5. Initialize Payment
    const reference = generatePaymentReference();
    
    const paystackResponse = await initializePayment({
      email: user.email,
      amount: convertToPesewas(upfrontAmount),
      reference,
      metadata: {
        userId,
        type: "INSTALLMENT_INIT", // Special type for first installment
        applicationId,
        courseId: application.courseId,
        custom_fields: [
          {
            display_name: "Payment Type",
            variable_name: "payment_type",
            value: `Installment (Upfront ${upfrontPercentage}%)`
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

    // 6. Create Payment Record
    // We use INSTALLMENT type but mark it as the first one via metadata or logic in verify
    await createPaymentRecord({
      userId,
      type: "INSTALLMENT",
      amount: upfrontAmount,
      reference,
    });
    
    await prisma.payment.update({
      where: { reference },
      data: { 
        applicationId,
        description: `Upfront payment (${upfrontPercentage}%) for ${application.course.title}`
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        reference,
        accessCode: paystackResponse.data.access_code,
      },
      message: "Installment payment initialized",
    });

  } catch (error) {
    console.error("Installment initialization error:", error);

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
