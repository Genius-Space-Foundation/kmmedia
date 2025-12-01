import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { smsService } from "@/lib/notifications/sms";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    // This endpoint would typically be called by a cron job or scheduled task
    const { dryRun = false } = await request.json();

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find payments due for reminders
    const paymentsDueForReminders = await prisma.payment.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          not: null,
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        application: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        enrollment: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Find overdue payments
    const overduePayments = await prisma.payment.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          lt: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        application: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        enrollment: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Find payment plan installments due for reminders
    const installmentsDueForReminders =
      await prisma.paymentInstallment.findMany({
        where: {
          status: "PENDING",
          dueDate: {
            gte: now,
            lte: sevenDaysFromNow,
          },
          paymentPlan: {
            smsNotifications: true,
          },
        },
        include: {
          paymentPlan: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });

    const results = {
      paymentsReminders: [],
      overdueReminders: [],
      installmentReminders: [],
      errors: [],
    };

    // Process payment reminders
    for (const payment of paymentsDueForReminders) {
      try {
        const dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
        const daysUntilDue = dueDate
          ? Math.ceil(
              (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0;
        const courseTitle =
          payment.application?.course?.title ||
          payment.enrollment?.course?.title;

        // Create notification
        if (!dryRun) {
          const notification = await prisma.notification.create({
            data: {
              userId: payment.userId,
              type: "PAYMENT_REMINDER",
              title: `Payment Reminder - ${payment.type.replace("_", " ")}`,
              content: `Reminder: Your ${payment.type
                .replace("_", " ")
                .toLowerCase()} payment of ₵${payment.amount} ${
                courseTitle ? `for "${courseTitle}"` : ""
              } is due in ${daysUntilDue} days.`,
              metadata: {
                paymentId: payment.id,
                amount: payment.amount,
                dueDate: payment.dueDate?.toISOString(),
                daysUntilDue: daysUntilDue,
                isOverdue: false,
                urgency:
                  daysUntilDue <= 1
                    ? "critical"
                    : daysUntilDue <= 3
                    ? "high"
                    : "medium",
                reminderType: "automated",
                courseTitle: courseTitle,
              },
            },
          });

          // Send SMS if user has phone number
          if (payment.user.phone) {
            const smsResult = await smsService.sendPaymentReminder(
              payment.user.phone,
              {
                amount: payment.amount,
                dueDate: payment.dueDate?.toISOString() || "",
                type: payment.type,
                description: payment.description || "",
                daysUntilDue: daysUntilDue,
                isOverdue: false,
              }
            );

            results.paymentsReminders.push({
              paymentId: payment.id,
              userId: payment.userId,
              notificationId: notification.id,
              smsSent: smsResult.success,
              daysUntilDue: daysUntilDue,
            });
          }
        } else {
          results.paymentsReminders.push({
            paymentId: payment.id,
            userId: payment.userId,
            daysUntilDue: daysUntilDue,
            dryRun: true,
          });
        }
      } catch (error) {
        results.errors.push({
          paymentId: payment.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Process overdue payment reminders
    for (const payment of overduePayments) {
      try {
        const dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
        const daysOverdue = dueDate
          ? Math.ceil(
              (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0;
        const courseTitle =
          payment.application?.course?.title ||
          payment.enrollment?.course?.title;

        // Create notification
        if (!dryRun) {
          const notification = await prisma.notification.create({
            data: {
              userId: payment.userId,
              type: "PAYMENT_REMINDER",
              title: `Overdue Payment - ${payment.type.replace("_", " ")}`,
              content: `URGENT: Your ${payment.type
                .replace("_", " ")
                .toLowerCase()} payment of ₵${payment.amount} ${
                courseTitle ? `for "${courseTitle}"` : ""
              } is overdue by ${daysOverdue} days. Please make payment immediately.`,
              metadata: {
                paymentId: payment.id,
                amount: payment.amount,
                dueDate: payment.dueDate?.toISOString(),
                daysOverdue: daysOverdue,
                isOverdue: true,
                urgency: "critical",
                reminderType: "automated",
                courseTitle: courseTitle,
              },
            },
          });

          // Send SMS if user has phone number
          if (payment.user.phone) {
            const smsResult = await smsService.sendPaymentReminder(
              payment.user.phone,
              {
                amount: payment.amount,
                dueDate: payment.dueDate?.toISOString() || "",
                type: payment.type,
                description: payment.description || "",
                daysUntilDue: -daysOverdue,
                isOverdue: true,
              }
            );

            results.overdueReminders.push({
              paymentId: payment.id,
              userId: payment.userId,
              notificationId: notification.id,
              smsSent: smsResult.success,
              daysOverdue: daysOverdue,
            });
          }
        } else {
          results.overdueReminders.push({
            paymentId: payment.id,
            userId: payment.userId,
            daysOverdue: daysOverdue,
            dryRun: true,
          });
        }
      } catch (error) {
        results.errors.push({
          paymentId: payment.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Process installment reminders
    for (const installment of installmentsDueForReminders) {
      try {
        const dueDate = new Date(installment.dueDate);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Create notification
        if (!dryRun) {
          const notification = await prisma.notification.create({
            data: {
              userId: installment.paymentPlan.userId,
              type: "PAYMENT_REMINDER",
              title: `Installment Reminder - ${
                installment.paymentPlan.course?.title || "Payment Plan"
              }`,
              content: `Reminder: Your installment ${installment.installmentNumber} of ₵${installment.amount} is due in ${daysUntilDue} days.`,
              metadata: {
                installmentId: installment.id,
                paymentPlanId: installment.paymentPlanId,
                amount: installment.amount,
                dueDate: installment.dueDate.toISOString(),
                daysUntilDue: daysUntilDue,
                installmentNumber: installment.installmentNumber,
                reminderType: "automated",
              },
            },
          });

          // Send SMS if user has phone number
          if (installment.paymentPlan.user.phone) {
            const smsResult = await smsService.sendInstallmentReminder(
              installment.paymentPlan.user.phone,
              {
                installmentNumber: installment.installmentNumber,
                totalInstallments: installment.paymentPlan.installmentCount,
                amount: installment.amount,
                dueDate: installment.dueDate.toISOString(),
                daysUntilDue: daysUntilDue,
              }
            );

            results.installmentReminders.push({
              installmentId: installment.id,
              paymentPlanId: installment.paymentPlanId,
              userId: installment.paymentPlan.userId,
              notificationId: notification.id,
              smsSent: smsResult.success,
              daysUntilDue: daysUntilDue,
            });
          }
        } else {
          results.installmentReminders.push({
            installmentId: installment.id,
            paymentPlanId: installment.paymentPlanId,
            userId: installment.paymentPlan.userId,
            daysUntilDue: daysUntilDue,
            dryRun: true,
          });
        }
      } catch (error) {
        results.errors.push({
          installmentId: installment.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          paymentsRemindersSent: results.paymentsReminders.length,
          overdueRemindersSent: results.overdueReminders.length,
          installmentRemindersSent: results.installmentReminders.length,
          errors: results.errors.length,
          dryRun: dryRun,
        },
        results,
      },
      message: dryRun
        ? "Automated reminder check completed (dry run)"
        : "Automated reminders sent successfully",
    });
  } catch (error) {
    console.error("Error processing automated reminders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process automated reminders",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
