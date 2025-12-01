import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const reviewSchema = z.object({
  reviewee: z.string().min(1, "Reviewer is required"),
  course: z.string().min(1, "Course is required"),
  content: z.string().min(1, "Content to review is required"),
  type: z.enum(["COURSE_CONTENT", "ASSESSMENT", "LESSON_PLAN", "RESOURCE"]),
  dueDate: z.string().min(1, "Due date is required"),
});

async function getPeerReviews(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    // In a real implementation, this would query a peer_reviews table
    // For now, we'll simulate the data
    const reviews = [
      {
        id: "1",
        reviewer: "Dr. Sarah Johnson",
        reviewee: "Mike Chen",
        course: "Digital Marketing Fundamentals",
        content: "Module 2: Social Media Marketing Strategy",
        type: "COURSE_CONTENT",
        status: "COMPLETED",
        rating: 4,
        feedback:
          "Excellent content structure and clear learning objectives. The examples are relevant and engaging.",
        suggestions: [
          "Consider adding more interactive elements",
          "Include real-world case studies",
          "Add discussion prompts for student engagement",
        ],
        createdAt: "2024-01-18T10:00:00Z",
        dueDate: "2024-01-25T23:59:00Z",
      },
      {
        id: "2",
        reviewer: "Emily Rodriguez",
        reviewee: "Dr. Sarah Johnson",
        course: "Digital Marketing Fundamentals",
        content: "Final Project Assessment Rubric",
        type: "ASSESSMENT",
        status: "IN_PROGRESS",
        rating: 0,
        feedback: "",
        suggestions: [],
        createdAt: "2024-01-20T14:00:00Z",
        dueDate: "2024-01-27T23:59:00Z",
      },
      {
        id: "3",
        reviewer: "Mike Chen",
        reviewee: "Dr. Sarah Johnson",
        course: "Digital Marketing Fundamentals",
        content: "Lesson Plan: Email Marketing Best Practices",
        type: "LESSON_PLAN",
        status: "PENDING",
        rating: 0,
        feedback: "",
        suggestions: [],
        createdAt: "2024-01-21T09:00:00Z",
        dueDate: "2024-01-28T23:59:00Z",
      },
    ];

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching peer reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch peer reviews",
      },
      { status: 500 }
    );
  }
}

async function createPeerReview(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = reviewSchema.parse(body);
    const instructorId = req.user!.userId;

    // In a real implementation, this would create a new review in the database
    const newReview = {
      id: Date.now().toString(),
      ...validatedData,
      status: "PENDING",
      rating: 0,
      feedback: "",
      suggestions: [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newReview,
    });
  } catch (error) {
    console.error("Error creating peer review:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create review",
      },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getPeerReviews);
export const POST = withInstructorAuth(createPeerReview);

