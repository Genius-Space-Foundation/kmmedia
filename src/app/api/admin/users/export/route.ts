import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { createAuditLog, AuditAction, ResourceType } from "@/lib/audit-log";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Export users to CSV
async function exportUsers(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    // Build where clause for filtering
    const where: any = {};
    if (role && role !== "ALL") {
      where.role = role;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Get users with their profiles
    const users = await prisma.user.findMany({
      where,
      include: {
        profile: {
          select: {
            phone: true,
            bio: true,
          },
        },
        _count: {
          select: {
            courses: true,
            applications: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });



    // Log data export
    await createAuditLog({
      userId: req.user!.userId,
      action: AuditAction.USER_DATA_EXPORT,
      resourceType: ResourceType.USER,
      // No specific resource ID for bulk export, maybe leave undefined or use "bulk"
      metadata: {
        format,
        roleFilter: role,
        statusFilter: status,
        count: users.length,
      },
      req,
    });

    if (format === "csv") {
      // Generate CSV content
      const csvHeaders = [
        "ID",
        "Name",
        "Email",
        "Role",
        "Status",
        "Phone",
        "Created At",
        "Last Login",
        "Courses Count",
        "Applications Count",
        "Enrollments Count",
      ];

      const csvRows = users.map((user) => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
        user.profile?.phone || "",
        user.createdAt.toISOString(),
        user.lastLogin?.toISOString() || "",
        user._count.courses,
        user._count.applications,
        user._count.enrollments,
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="users-export-${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Export users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export users" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(exportUsers);
