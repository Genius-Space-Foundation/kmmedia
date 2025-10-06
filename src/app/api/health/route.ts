import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface HealthCheck {
  status: "healthy" | "unhealthy";
  timestamp: string;
  services: {
    database: ServiceHealth;
    api: ServiceHealth;
  };
  version: string;
  uptime: number;
}

interface ServiceHealth {
  status: "healthy" | "unhealthy";
  responseTime?: number;
  message?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const healthCheck: HealthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: { status: "unhealthy" },
      api: { status: "healthy", responseTime: 0 },
    },
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
  };

  // Check database connectivity
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStartTime;

    healthCheck.services.database = {
      status: "healthy",
      responseTime: dbResponseTime,
    };
  } catch (error) {
    healthCheck.services.database = {
      status: "unhealthy",
      message:
        error instanceof Error ? error.message : "Database connection failed",
    };
    healthCheck.status = "unhealthy";
  }

  // Calculate API response time
  healthCheck.services.api.responseTime = Date.now() - startTime;

  // Determine overall health status
  const isHealthy = healthCheck.services.database.status === "healthy";
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(healthCheck, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
