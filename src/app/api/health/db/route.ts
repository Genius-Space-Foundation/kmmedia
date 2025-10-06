import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const startTime = Date.now();

    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Test basic query performance
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      responseTime: `${responseTime}ms`,
      data: {
        connected: true,
        userCount,
        courseCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        error:
          error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
