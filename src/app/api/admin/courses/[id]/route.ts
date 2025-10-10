import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const body = await request.json();
    const { action, comments, updatedAt } = body;

    // Validate action
    const validActions = ["APPROVE", "REJECT", "PUBLISH", "UNPUBLISH"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    let updatedCourse;

    switch (action) {
      case "APPROVE":
        updatedCourse = await prisma.course.update({
          where: { id: courseId },
          data: {
            status: "APPROVED",
            approvalComments: comments || null,
            updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
          },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                applications: true,
                enrollments: true,
              },
            },
          },
        });
        break;

      case "REJECT":
        updatedCourse = await prisma.course.update({
          where: { id: courseId },
          data: {
            status: "REJECTED",
            approvalComments: comments || null,
            updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
          },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                applications: true,
                enrollments: true,
              },
            },
          },
        });
        break;

      case "PUBLISH":
        updatedCourse = await prisma.course.update({
          where: {
            id: courseId,
            status: "APPROVED", // Only allow publishing approved courses
          },
          data: {
            status: "PUBLISHED",
            updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
          },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                applications: true,
                enrollments: true,
              },
            },
          },
        });

        if (!updatedCourse) {
          return NextResponse.json(
            {
              success: false,
              message: "Course must be approved before publishing",
            },
            { status: 400 }
          );
        }
        break;

      case "UNPUBLISH":
        updatedCourse = await prisma.course.update({
          where: { id: courseId },
          data: {
            status: "APPROVED", // Move back to approved status
            updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
          },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                applications: true,
                enrollments: true,
              },
            },
          },
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    // Send notification email to instructor
    if (action === "APPROVE") {
      // TODO: Send approval email
      console.log(
        `Sending course approval email to ${updatedCourse.instructor.email}`
      );
    } else if (action === "REJECT") {
      // TODO: Send rejection email
      console.log(
        `Sending course rejection email to ${updatedCourse.instructor.email}`
      );
    } else if (action === "PUBLISH") {
      // TODO: Send publish notification email
      console.log(
        `Sending course publish notification to ${updatedCourse.instructor.email}`
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: `Course ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            phone: true,
          },
        },
        _count: {
          select: {
            applications: true,
            enrollments: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
