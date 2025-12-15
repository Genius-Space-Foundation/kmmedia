import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get all assessment and assignment submissions for instructor's courses
async function getAssessmentSubmissions(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";
    const assessmentId = searchParams.get("assessmentId"); // Can be assessment ID or assignment ID

    // 1. Fetch Assessment Submissions (Quizzes/Exams)
    const assessmentWhere: any = {
      assessment: {
        course: {
          instructorId,
        },
      },
    };

    if (status !== "all") {
      assessmentWhere.status = status;
    }
    if (assessmentId) {
      assessmentWhere.assessmentId = assessmentId;
    }

    // 2. Fetch Assignment Submissions (File Uploads)
    const assignmentWhere: any = {
      assignment: {
        instructorId, // Assignment model has direct instructor link
      },
    };

    if (status !== "all") {
      assignmentWhere.status = status === "PENDING" ? "SUBMITTED" : status; // Map PENDING to SUBMITTED for AssignmentSubmission
    }
    if (assessmentId) {
      assignmentWhere.assignmentId = assessmentId;
    }

    const [assessmentSubmissions, assignmentSubmissions] = await Promise.all([
      prisma.assessmentSubmission.findMany({
        where: assessmentWhere,
        include: {
          student: {
            select: { id: true, name: true, email: true, profile: { select: { avatar: true } } },
          },
          assessment: {
            select: { id: true, title: true, type: true, course: { select: { id: true, title: true } } },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: limit, // Over-fetch slightly, we'll slice later
      }),
      prisma.assignmentSubmission.findMany({
        where: assignmentWhere,
        include: {
          student: {
            select: { id: true, name: true, email: true, profile: { select: { avatar: true } } },
          },
          assignment: {
            select: { id: true, title: true, totalPoints: true, course: { select: { id: true, title: true } } },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: limit,
      }),
    ]);

    // Normalize and Merge
    const normalizedAssessmentSubs = assessmentSubmissions.map((sub) => ({
      id: sub.id,
      student: sub.student,
      score: sub.score,
      totalPoints: 100, // Default or fetch from assessment
      submittedAt: sub.submittedAt,
      status: sub.status,
      timeSpent: sub.timeSpent,
      type: sub.assessment.type,
      title: sub.assessment.title,
      courseTitle: sub.assessment.course.title,
      answers: [], // Placeholder
      files: [],
      isAssignment: false,
    }));

    const normalizedAssignmentSubs = assignmentSubmissions.map((sub) => ({
      id: sub.id,
      student: sub.student,
      score: sub.grade || 0,
      totalPoints: sub.assignment.totalPoints,
      submittedAt: sub.submittedAt,
      status: sub.status === "SUBMITTED" ? "PENDING" : sub.status, // Map back to PENDING for UI consistency
      timeSpent: 0,
      type: "ASSIGNMENT",
      title: sub.assignment.title,
      courseTitle: sub.assignment.course.title,
      answers: [],
      files: sub.files,
      isAssignment: true,
      submissionText: sub.submissionText,
    }));

    // Combine and Sort
    const allSubmissions = [...normalizedAssessmentSubs, ...normalizedAssignmentSubs]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice((page - 1) * limit, page * limit);

    const total = assessmentSubmissions.length + assignmentSubmissions.length; // Approximate total for now

    // Statistics (Simplified for merged view)
    const stats = {
      totalSubmissions: total,
      averageScore: 0, // specific calc needed
      statusCounts: {}, // specific calc needed
    };

    return NextResponse.json({
      success: true,
      data: {
        submissions: allSubmissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        statistics: stats,
      },
    });
  } catch (error) {
    console.error("Get assessment submissions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assessment submissions" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getAssessmentSubmissions);
