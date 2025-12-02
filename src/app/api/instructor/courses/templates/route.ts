import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const templateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  duration: z.number().min(1, "Duration must be at least 1 week"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  modules: z.any(), // JSON structure for modules
  isPublic: z.boolean().optional(),
});

// Get course templates
export async function getTemplates(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    const templates = await prisma.courseTemplate.findMany({
      where: {
        OR: [
          { instructorId },
          { isPublic: true },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// Create course template
export async function createTemplate(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const body = await req.json();

    const validatedData = templateSchema.parse(body);

    const template = await prisma.courseTemplate.create({
      data: {
        ...validatedData,
        instructorId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create template" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getTemplates);
export const POST = withInstructorAuth(createTemplate);
