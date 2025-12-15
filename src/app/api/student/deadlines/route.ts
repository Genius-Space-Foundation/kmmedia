import { NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function handleRequest(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = request.user.userId;

    // Get courses the user is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
      select: {
        courseId: true,
      },
    });

    const courseIds = enrollments.map(e => e.courseId);

    if (courseIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch upcoming assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
        dueDate: {
          gte: new Date(),
        },
        isPublished: true,
      },
      include: {
        course: {
            select: {
               id: true,
               title: true,
            }
        },
        // Check if already submitted
        submissions: {
            where: {
                studentId: userId,
            },
            select: {
                id: true,
                status: true,
            }
        }
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 5,
    });

    // Fetch upcoming assessments (quizzes)
    const assessments = await prisma.assessment.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
        dueDate: {
          gte: new Date(),
        },
        isPublished: true,
      },
      include: {
         course: {
            select: {
               id: true,
               title: true,
            }
        },
        submissions: {
             where: {
                studentId: userId,
            },
            select: {
                id: true,
                status: true,
            }
        }
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 5,
    });

    // Format and combine
    const formattedAssignments = assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate.toISOString(),
      course: a.course,
      type: "assignment",
      priority: getPriority(a.dueDate),
      status: a.submissions.length > 0 ? a.submissions[0].status : "pending",
      estimatedTime: 60, // approximate
      reminderSet: false,
    }));

    const formattedAssessments = assessments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description || "Assessment",
      dueDate: a.dueDate?.toISOString() || "",
      course: a.course,
      type: "quiz",
      priority: a.dueDate ? getPriority(a.dueDate) : "low",
      status: a.submissions.length > 0 ? a.submissions[0].status : "pending",
      estimatedTime: a.timeLimit || 30,
      reminderSet: false,
    }));

    // Combine and sort by due date
    const allDeadlines = [...formattedAssignments, ...formattedAssessments]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 10);

    return NextResponse.json(allDeadlines);
  } catch (error) {
    console.error("Error in student endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getPriority(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    
    if (days < 2) return "high";
    if (days < 5) return "medium";
    return "low";
}

export const GET = withStudentAuth(handleRequest);
