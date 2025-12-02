import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Mock templates data since we don't have a CourseTemplate model yet
const MOCK_TEMPLATES = [
  {
    id: "temp-1",
    name: "Standard Course Structure",
    description: "A balanced mix of video lessons, quizzes, and assignments.",
    category: "General",
    estimatedDuration: 4,
    features: ["4 Modules", "Weekly Quizzes", "Final Project"],
  },
  {
    id: "temp-2",
    name: "Workshop Format",
    description: "Intensive short course focused on practical skills.",
    category: "Workshop",
    estimatedDuration: 1,
    features: ["Live Sessions", "Hands-on Exercises", "Certificate"],
  },
  {
    id: "temp-3",
    name: "Assessment-Based",
    description: "Focus on evaluation and certification.",
    category: "Certification",
    estimatedDuration: 2,
    features: ["Pre-assessment", "Practice Tests", "Final Exam"],
  },
];

async function getTemplates(req: AuthenticatedRequest) {
  // In a real implementation, this would fetch from prisma.courseTemplate
  return NextResponse.json({
    success: true,
    data: MOCK_TEMPLATES,
  });
}

async function createTemplate(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    // In a real implementation, this would save to DB
    
    return NextResponse.json({
      success: true,
      data: {
        id: `temp-${Date.now()}`,
        ...body,
      },
      message: "Template created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create template" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getTemplates);
export const POST = withInstructorAuth(createTemplate);
