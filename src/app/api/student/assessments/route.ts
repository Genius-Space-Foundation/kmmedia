import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { getStudentSubmissions } from "@/lib/assessments/assessment-manager";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get student's assessment submissions
async function getStudentSubmissionsHandler(req: AuthenticatedRequest) {
  try {
    const studentId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const submissions = await getStudentSubmissions(
      studentId,
      courseId || undefined
    );

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Get student submissions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// Get available assessments for student
async function getAvailableAssessmentsHandler(req: AuthenticatedRequest) {
  try {
    const studentId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // Get student's enrolled courses
    const enrolledCourses = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
        status: "ACTIVE",
      },
      select: {
        courseId: true,
      },
    });

    const enrolledCourseIds = enrolledCourses.map((e) => e.courseId);

    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // If courseId is provided, filter by that course
    const whereClause: any = {
      courseId: courseId ? courseId : { in: enrolledCourseIds },
      isPublished: true,
    };

    // Get assessments for the enrolled courses
    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            title: true,
          },
        },
        instructor: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            submissions: {
              where: {
                studentId,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter assessments based on due date and attempts
    const availableAssessments = assessments.filter((assessment) => {
      // Check if due date has passed
      if (assessment.dueDate && new Date(assessment.dueDate) < new Date()) {
        return false;
      }

      // Check if student has exceeded attempts
      if (
        assessment.attempts &&
        assessment._count.submissions >= assessment.attempts
      ) {
        return false;
      }

      return true;
    });

    return NextResponse.json({
      success: true,
      data: availableAssessments,
    });
  } catch (error) {
    console.error("Get available assessments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

export const GET = withStudentAuth(getAvailableAssessmentsHandler);
export const POST = withStudentAuth(getStudentSubmissionsHandler);
