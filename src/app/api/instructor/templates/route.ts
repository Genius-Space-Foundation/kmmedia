import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

// Get course templates for instructor
async function getInstructorTemplates(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // For now, return mock templates
    // In a real application, you would fetch from a templates table
    const templates = [
      {
        id: "1",
        name: "Basic Course Template",
        description: "A simple course structure with lessons and assessments",
        category: "General",
        duration: 30,
        lessons: 5,
        assessments: 2,
        estimatedDuration: 4,
        features: ["Video Lessons", "Quizzes", "Certificate", "Discussion Forum"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "2", 
        name: "Advanced Course Template",
        description: "Comprehensive course with multiple modules and projects",
        category: "Advanced",
        duration: 60,
        lessons: 10,
        assessments: 4,
        estimatedDuration: 8,
        features: ["Video Lessons", "Projects", "Peer Review", "Live Sessions", "Certificate"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Workshop Template",
        description: "Interactive workshop format with hands-on activities",
        category: "Workshop",
        duration: 45,
        lessons: 8,
        assessments: 3,
        estimatedDuration: 6,
        features: ["Live Sessions", "Hands-on Activities", "Group Projects", "Feedback"],
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get instructor templates error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getInstructorTemplates);
