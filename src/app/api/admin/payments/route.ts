import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { PaymentStatus, PaymentType } from "@prisma/client";

// Get all payments for admin with enhanced filtering
async function getAdminPayments(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { reference: { contains: search, mode: "insensitive" } },
      ];
    }

    const [payments, total, stats] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          application: {
            select: {
              id: true,
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
          enrollment: {
            select: {
              id: true,
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
      // Payment statistics
      prisma.payment.groupBy({
        by: ["status", "type"],
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    // Calculate payment statistics
    const paymentStats = {
      totalRevenue: stats
        .filter(s => s.status === "COMPLETED")
        .reduce((acc, s) => acc + (s._sum.amount || 0), 0),
      pendingAmount: stats
        .filter(s => s.status === "PENDING")
        .reduce((acc, s) => acc + (s._sum.amount || 0), 0),
      failedAmount: stats
        .filter(s => s.status === "FAILED")
        .reduce((acc, s) => acc + (s._sum.amount || 0), 0),
      byType: stats.reduce((acc, s) => {
        if (!acc[s.type]) {
          acc[s.type] = { count: 0, amount: 0 };
        }
        acc[s.type].count += s._count.id;
        acc[s.type].amount += s._sum.amount || 0;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>),
    };

    return NextResponse.json({
      success: true,
      data: {
        payments,
        stats: paymentStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get admin payments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getAdminPayments);

