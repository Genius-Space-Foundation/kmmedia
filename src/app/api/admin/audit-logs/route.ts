import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { getRecentAuditLogs } from "@/lib/audit-log";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive()).optional().default("1"),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().positive().max(1000)).optional().default("50"),
  action: z.string().optional(),
  userId: z.string().optional(),
  format: z.string().optional(),
});

async function getLogs(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const { page, limit, action, userId, format } = querySchema.parse(params);
    
    if (format === "csv") {
      // For CSV export, we might want to fetch more logs (e.g., up to 1000)
      const logs = await getRecentAuditLogs({
        limit: 1000,
        offset: 0,
        action: action || undefined,
        userId: userId || undefined,
      });

      const csvHeaders = ["ID", "Time", "User", "Email", "Action", "Resource Type", "Resource ID", "IP", "Metadata"];
      const csvRows = logs.map(log => [
        log.id,
        new Date(log.createdAt).toISOString(),
        log.user?.name || "Unknown",
        log.user?.email || "Unknown",
        log.action,
        log.resourceType,
        log.resourceId || "",
        log.ipAddress || "",
        JSON.stringify(log.metadata || {}).replace(/"/g, '""'),
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(",")),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const offset = (page - 1) * limit;

    const logs = await getRecentAuditLogs({
      limit,
      offset,
      action: action || undefined,
      userId: userId || undefined,
    });

    const total = await import("@/lib/db").then((mod) => 
      mod.prisma.auditLog.count({
        where: {
          ...(action ? { action } : {}),
          ...(userId ? { userId } : {}),
        },
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    
    if (error instanceof z.ZodError) {
       return NextResponse.json(
        { success: false, message: "Invalid query parameters", errors: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getLogs);
