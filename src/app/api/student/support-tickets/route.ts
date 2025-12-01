import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  category: z.string().default("GENERAL"),
});

// Create support ticket (Student only)
async function createSupportTicket(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const ticketData = createTicketSchema.parse(body);
    const userId = req.user!.userId;

    const ticket = await prisma.supportTicket.create({
      data: {
        subject: ticketData.subject,
        message: ticketData.message,
        priority: ticketData.priority as TicketPriority,
        category: ticketData.category,
        status: TicketStatus.OPEN,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        responses: {
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Transform responses to match frontend interface
    const transformedTicket = {
      ...ticket,
      responses: ticket.responses.map((response) => ({
        id: response.id,
        message: response.message,
        isFromSupport:
          response.user.role === "ADMIN" || response.user.role === "INSTRUCTOR",
        createdAt: response.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedTicket,
      message: "Support ticket created successfully",
    });
  } catch (error) {
    console.error("Create support ticket error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Ticket creation failed",
      },
      { status: 500 }
    );
  }
}

// Get student's support tickets
async function getStudentSupportTickets(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { userId };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          responses: {
            include: {
              user: {
                select: {
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    // Transform tickets to match frontend interface
    const transformedTickets = tickets.map((ticket) => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      responses: ticket.responses.map((response) => ({
        id: response.id,
        message: response.message,
        isFromSupport:
          response.user.role === "ADMIN" || response.user.role === "INSTRUCTOR",
        createdAt: response.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        tickets: transformedTickets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get student support tickets error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

export const POST = withStudentAuth(createSupportTicket);
export const GET = withStudentAuth(getStudentSupportTickets);

