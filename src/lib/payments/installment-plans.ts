import { prisma } from "@/lib/db";

export interface InstallmentPlan {
  id: string;
  name: string;
  numberOfInstallments: number;
  firstPaymentPercentage: number;
  monthlyPercentage: number;
  totalAmount: number;
  firstPaymentAmount: number;
  monthlyAmount: number;
}

export const DEFAULT_INSTALLMENT_PLANS: InstallmentPlan[] = [
  {
    id: "standard",
    name: "Standard Plan",
    numberOfInstallments: 1,
    firstPaymentPercentage: 100,
    monthlyPercentage: 0,
    totalAmount: 0, // Will be calculated based on course price
    firstPaymentAmount: 0,
    monthlyAmount: 0,
  },
  {
    id: "3-month",
    name: "3-Month Plan",
    numberOfInstallments: 3,
    firstPaymentPercentage: 40,
    monthlyPercentage: 30,
    totalAmount: 0,
    firstPaymentAmount: 0,
    monthlyAmount: 0,
  },
  {
    id: "6-month",
    name: "6-Month Plan",
    numberOfInstallments: 6,
    firstPaymentPercentage: 30,
    monthlyPercentage: 14,
    totalAmount: 0,
    firstPaymentAmount: 0,
    monthlyAmount: 0,
  },
];

export function calculateInstallmentPlan(
  planId: string,
  coursePrice: number
): InstallmentPlan {
  const plan = DEFAULT_INSTALLMENT_PLANS.find((p) => p.id === planId);
  if (!plan) {
    throw new Error("Invalid installment plan");
  }

  const firstPaymentAmount = Math.round(
    (coursePrice * plan.firstPaymentPercentage) / 100
  );
  const monthlyAmount = Math.round(
    (coursePrice * plan.monthlyPercentage) / 100
  );

  return {
    ...plan,
    totalAmount: coursePrice,
    firstPaymentAmount,
    monthlyAmount,
  };
}

export async function createInstallmentSchedule(
  userId: string,
  courseId: string,
  plan: InstallmentPlan,
  applicationFee: number
) {
  const payments = [];
  const startDate = new Date();

  // First payment (application fee + first installment)
  payments.push({
    userId,
    courseId,
    type: "APPLICATION_FEE" as const,
    amount: applicationFee,
    dueDate: startDate,
    installmentNumber: 0,
    status: "PENDING" as const,
  });

  if (plan.firstPaymentAmount > 0) {
    payments.push({
      userId,
      courseId,
      type: "INSTALLMENT" as const,
      amount: plan.firstPaymentAmount,
      dueDate: startDate,
      installmentNumber: 1,
      status: "PENDING" as const,
    });
  }

  // Monthly installments
  for (let i = 2; i <= plan.numberOfInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

    payments.push({
      userId,
      courseId,
      type: "INSTALLMENT" as const,
      amount: plan.monthlyAmount,
      dueDate,
      installmentNumber: i,
      status: "PENDING" as const,
    });
  }

  // Create payment records
  return await prisma.payment.createMany({
    data: payments,
  });
}

export async function getInstallmentPlans(): Promise<InstallmentPlan[]> {
  return DEFAULT_INSTALLMENT_PLANS;
}

export async function getStudentInstallmentSchedule(
  userId: string,
  courseId: string
) {
  return await prisma.payment.findMany({
    where: {
      userId,
      courseId,
    },
    orderBy: {
      dueDate: "asc",
    },
  });
}
