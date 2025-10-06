import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { smsService } from "@/lib/notifications/sms";
import { withStudentAuth } from "@/lib/middleware";

export const GET = withStudentAuth(async (request: NextRequest) => {
  try {
    const userId = request.user!.id;

    // Fetch payment plans with installments
    const plans = await prisma.paymentPlan.findMany({
      where: {
        userId: userId,
      },
      include: {
        installments: {
          orderBy: {
            installmentNumber: "asc",
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate summary statistics
    const activePlans = plans.filter((p) => p.status === "ACTIVE");
    const completedPlans = plans.filter((p) => p.status === "COMPLETED");
    const totalPlans = plans.length;
    const totalAmount = plans.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = plans.reduce((sum, plan) => {
      return (
        sum +
        plan.installments
          .filter((i) => i.status === "PAID")
          .reduce((installmentSum, i) => installmentSum + i.amount, 0)
      );
    }, 0);

    const summary = {
      totalPlans,
      activePlans: activePlans.length,
      completedPlans: completedPlans.length,
      totalAmount,
      totalPaid,
      remainingAmount: totalAmount - totalPaid,
    };

    return NextResponse.json({
      success: true,
      data: {
        plans,
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching payment plans:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment plans",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

export const POST = withStudentAuth(async (request: NextRequest) => {
  try {
    const userId = request.user!.id;
    const body = await request.json();
    const {
      courseId,
      totalAmount,
      installmentCount,
      monthlyAmount,
      startDate,
      endDate,
      description,
      smsNotifications,
    } = body;

    if (!totalAmount || !installmentCount || !monthlyAmount || !startDate) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Create payment plan with installments
    const plan = await prisma.paymentPlan.create({
      data: {
        userId,
        courseId: courseId || null,
        totalAmount: parseFloat(totalAmount),
        installmentCount: parseInt(installmentCount),
        monthlyAmount: parseFloat(monthlyAmount),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description || "",
        status: "ACTIVE",
        smsNotifications: smsNotifications || false,
        installments: {
          create: Array.from(
            { length: parseInt(installmentCount) },
            (_, index) => {
              const installmentDate = new Date(startDate);
              installmentDate.setMonth(installmentDate.getMonth() + index);

              return {
                installmentNumber: index + 1,
                amount: parseFloat(monthlyAmount),
                dueDate: installmentDate,
                status: "PENDING",
              };
            }
          ),
        },
      },
      include: {
        installments: true,
        course: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send SMS notification if enabled and user has phone number
    if (smsNotifications && plan.user.phone) {
      try {
        await smsService.sendPaymentPlanCreated(plan.user.phone, {
          totalAmount: plan.totalAmount,
          installments: plan.installmentCount,
          monthlyAmount: plan.monthlyAmount,
          startDate: plan.startDate.toISOString(),
        });
      } catch (smsError) {
        console.error("Failed to send SMS notification:", smsError);
        // Don't fail the entire operation if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        plan,
        message: "Payment plan created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating payment plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment plan",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
