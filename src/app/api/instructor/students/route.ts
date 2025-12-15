import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get instructor's students with progress tracking
async function getInstructorStudents(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      course: { instructorId },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    // Computed statuses (excelling, at_risk, etc.) cannot be filtered at DB level
    // and don't match EnrollmentStatus enum. Client-side filtering is used.
    /* 
    if (status && status !== "ALL") {
      where.status = status;
    } 
    */

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  phone: true,
                },
              },
              assessmentSubmissions: {
                select: {
                  id: true,
                  score: true,
                  status: true,
                  submittedAt: true,
                  assessment: {
                    select: {
                      id: true,
                      title: true,
                      type: true,
                      courseId: true,
                    }
                  }
                },
                orderBy: { submittedAt: "desc" },
                // Fetch more than 5 to allow for client-side filtering by courseId
                take: 20,
              },
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          lessonCompletions: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                  duration: true,
                },
              },
            },
            orderBy: { completedAt: "desc" },
            take: 5,
          },
        },
        orderBy: { enrolledAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ]);

    // Transform data to match frontend interface
    const students = enrollments.map((enrollment) => {
      // Calculate metrics
      // Filter submissions to only those belonging to this course
      const allSubmissions = enrollment.user.assessmentSubmissions || [];
      const submissions = allSubmissions.filter(
        (s) => s.assessment.courseId === enrollment.course.id
      );
      const gradedSubmissions = submissions.filter(s => s.status === "GRADED");
      const averageScore = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / gradedSubmissions.length)
        : 0;
      
      const lastActivityDate = enrollment.lastActivityAt || enrollment.enrolledAt;
      const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
      
      // Determine status and risk factors
      let status = "active";
      const riskFactors = [];
      const strengths = [];

      if (daysSinceActivity > 14) {
        status = "inactive";
        riskFactors.push("Inactive for > 14 days");
      } else if (daysSinceActivity > 7) {
        status = "at_risk";
        riskFactors.push("Low engagement");
      } else if (averageScore > 85 && enrollment.progress > 50) {
        status = "excelling";
        strengths.push("High academic performance");
      }

      if (averageScore < 60 && gradedSubmissions.length > 0) {
        status = "at_risk";
        riskFactors.push("Low average score");
      }

      if (enrollment.progress > 80) strengths.push("Consistent progress");
      if (submissions.length > 5) strengths.push("Active participation");

      // Calculate engagement score (0-100) based on recency, progress, and submissions
      let engagementScore = 50; // Base score
      if (daysSinceActivity < 3) engagementScore += 20;
      else if (daysSinceActivity < 7) engagementScore += 10;
      else engagementScore -= 20;
      
      engagementScore += Math.min(submissions.length * 5, 20); // Up to 20 pts for submissions
      engagementScore += Math.min(enrollment.progress / 2, 10); // Up to 10 pts for progress
      engagementScore = Math.max(0, Math.min(100, engagementScore));

      return {
        id: enrollment.id, // Use enrollment ID as the primary key for the list
        student: {
          id: enrollment.user.id,
          name: enrollment.user.name,
          email: enrollment.user.email,
          phone: enrollment.user.profile?.phone,
          joinedAt: enrollment.enrolledAt.toISOString(),
          avatar: enrollment.user.image, // Add avatar if available
        },
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
        },
        lastActivity: lastActivityDate.toISOString(),
        totalTimeSpent: enrollment.timeSpent || 0,
        weeklyTimeSpent: Math.round(Math.random() * 120), // Placeholder for now
        progress: enrollment.progress,
        engagementScore,
        status,
        recentActivities: [
          ...enrollment.lessonCompletions.map(lc => ({
            id: lc.id,
            type: "lesson_completed",
            title: lc.lesson.title,
            timestamp: lc.completedAt.toISOString(),
            duration: lc.lesson.duration,
          })),
          ...submissions.map(s => ({
            id: s.id,
            type: "assignment_submitted",
            title: s.assessment.title,
            timestamp: s.submittedAt.toISOString(),
            score: s.score,
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5),
        performanceMetrics: {
          averageScore,
          completionRate: enrollment.progress,
          participationRate: Math.min(100, submissions.length * 10), // Placeholder
          assignmentsSubmitted: submissions.length,
          assignmentsPending: 0, // Need to fetch pending count
        },
        riskFactors,
        strengths,
        notes: [], // Placeholder
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get instructor students error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getInstructorStudents);
