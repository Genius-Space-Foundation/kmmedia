import { NextRequest, NextResponse } from "next/server";
import { withInstructorAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Get recent instructor activity
async function getInstructorActivity(req: AuthenticatedRequest) {
  try {
    const instructorId = req.user!.userId;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get recent activities from various sources
    const [
      recentCourses,
      recentEnrollments,
      recentSubmissions,
      recentAnnouncements,
    ] = await Promise.all([
      // Recent course creations
      prisma.course.findMany({
        where: { instructorId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),

      // Recent student enrollments
      prisma.enrollment.findMany({
        where: {
          course: { instructorId },
        },
        select: {
          id: true,
          enrolledAt: true,
          user: {
            select: {
              name: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
        take: limit,
      }),

      // Recent assessment submissions
      prisma.assessmentSubmission.findMany({
        where: {
          assessment: {
            course: { instructorId },
          },
        },
        select: {
          id: true,
          submittedAt: true,
          student: {
            select: {
              id: true,
              name: true,
            },
          },
          assessment: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: limit,
      }),

      // Recent announcements
      prisma.announcement.findMany({
        where: { instructorId },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    // Transform and combine activities
    const activities = [
      ...recentCourses.map((course) => ({
        id: `course-${course.id}`,
        type: "COURSE_CREATED" as const,
        title: "Course Created",
        description: `Created course: ${course.title}`,
        timestamp: course.createdAt.toISOString(),
        courseId: course.id,
      })),

      ...recentEnrollments.map((enrollment) => ({
        id: `enrollment-${enrollment.id}`,
        type: "STUDENT_ENROLLED" as const,
        title: "Student Enrolled",
        description: `${enrollment.user.name} enrolled in ${enrollment.course.title}`,
        timestamp: enrollment.enrolledAt.toISOString(),
        courseId: enrollment.course.id,
      })),

      ...recentSubmissions.map((submission) => ({
        id: `submission-${submission.id}`,
        type: "ASSESSMENT_SUBMITTED" as const,
        title: "Assessment Submitted",
        description: `${submission.student.name} submitted ${submission.assessment.title}`,
        timestamp: submission.submittedAt.toISOString(),
        studentId: submission.student.id,
      })),

      ...recentAnnouncements.map((announcement) => ({
        id: `announcement-${announcement.id}`,
        type: "ANNOUNCEMENT_SENT" as const,
        title: "Announcement Sent",
        description: `Sent announcement: ${announcement.title}`,
        timestamp: announcement.createdAt.toISOString(),
      })),
    ];

    // Sort by timestamp and limit
    const sortedActivities = activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: sortedActivities,
    });
  } catch (error) {
    console.error("Get instructor activity error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

export const GET = withInstructorAuth(getInstructorActivity);
