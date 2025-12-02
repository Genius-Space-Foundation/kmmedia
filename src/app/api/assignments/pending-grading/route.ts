import { NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getPendingGrading(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;

    const submissions = await prisma.assessmentSubmission.findMany({
      where: {
        assessment: {
          course: { instructorId },
        },
        status: "SUBMITTED",
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: "asc", // Oldest first
      },
    });

    const formattedSubmissions = submissions.map((sub) => {
      const dueDate = sub.assessment.dueDate ? new Date(sub.assessment.dueDate) : new Date();
      const submittedAt = new Date(sub.submittedAt);
      const isLate = submittedAt > dueDate;
      const daysLate = isLate 
        ? Math.ceil((submittedAt.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) 
        : 0;

      return {
        id: sub.id,
        assignment: {
          id: sub.assessment.id,
          title: sub.assessment.title,
          dueDate: sub.assessment.dueDate,
          course: sub.assessment.course,
        },
        student: sub.student,
        submittedAt: sub.submittedAt,
        isLate,
        daysLate,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        submissions: formattedSubmissions,
        count: formattedSubmissions.length,
      },
    });
  } catch (error) {
    console.error("Get pending grading error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pending grading" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getPendingGrading);
