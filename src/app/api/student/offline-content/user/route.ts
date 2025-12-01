import { NextRequest, NextResponse } from "next/server";
import { withStudentAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        { status: 401 }
      );
    }

    const userId = request.user.userId;

    // Get user's enrollments and available content
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            lessons: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                duration: true,
                content: true,
                resources: true,
              },
              where: {
                isPublished: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    // Generate offline content list
    const offlineContent = [];

    for (const enrollment of enrollments) {
      for (const lesson of enrollment.course.lessons) {
        // Add lesson content
        offlineContent.push({
          id: `lesson-${lesson.id}`,
          type: "lesson",
          title: lesson.title,
          description: lesson.description,
          size: Math.floor(Math.random() * 50) + 10, // Mock size in MB
          downloaded: false,
          downloadProgress: 0,
          courseTitle: enrollment.course.title,
          lessonId: lesson.id,
        });

        // Add lesson resources
        if (lesson.resources && Array.isArray(lesson.resources)) {
          for (const resource of lesson.resources) {
            offlineContent.push({
              id: `resource-${lesson.id}-${resource.id || Math.random()}`,
              type: "resource",
              title: resource.name || "Resource",
              description: `Resource for ${lesson.title}`,
              size: Math.floor(Math.random() * 20) + 5, // Mock size in MB
              downloaded: false,
              downloadProgress: 0,
              courseTitle: enrollment.course.title,
              lessonId: lesson.id,
              resourceUrl: resource.url,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        content: offlineContent,
        totalSize: offlineContent.reduce((sum, item) => sum + item.size, 0),
      },
    });
  } catch (error) {
    console.error("Get offline content error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch offline content",
      },
      { status: 500 }
    );
  }
}
