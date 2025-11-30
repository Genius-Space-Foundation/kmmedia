import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/notifications/email";
import { extendedEmailTemplates } from "@/lib/notifications/email-templates-extended";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const body = await request.json();
    const { action, comments, updatedAt } = body;

    // Validate action
    const validActions = ["APPROVE", "REJECT", "PUBLISH", "UNPUBLISH", "UPDATE_INSTALLMENTS"];
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
          },
        });
        break;

      case "UPDATE_INSTALLMENTS":
        const { installmentEnabled, installmentPlan } = body;
        
        // Basic validation for installment plan
        if (installmentEnabled && !installmentPlan) {
           return NextResponse.json(
            { success: false, message: "Installment plan is required when enabled" },
            { status: 400 }
          );
        }

        updatedCourse = await prisma.course.update({
          where: { id: courseId },
          data: {
            installmentEnabled,
            installmentPlan,
            updatedAt: new Date(),
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

    // Send notification email to instructor (async, don't block response)
    if (action === "APPROVE") {
      sendEmail({
        to: updatedCourse.instructor.email,
        ...emailTemplates.courseApproved({
          instructorName: updatedCourse.instructor.name || "Instructor",
          courseName: updatedCourse.title,
          adminComments: comments,
        }),
      }).catch((error) => {
        console.error(
          `Failed to send course approval email to ${updatedCourse.instructor.email}:`,
          error
        );
      });
    } else if (action === "REJECT") {
      sendEmail({
        to: updatedCourse.instructor.email,
        ...extendedEmailTemplates.courseRejected({
          instructorName: updatedCourse.instructor.name || "Instructor",
          courseName: updatedCourse.title,
          rejectionReason: comments,
        }),
      }).catch((error) => {
        console.error(
          `Failed to send course rejection email to ${updatedCourse.instructor.email}:`,
          error
        );
      });
    } else if (action === "PUBLISH") {
      sendEmail({
        to: updatedCourse.instructor.email,
        ...extendedEmailTemplates.coursePublished({
          instructorName: updatedCourse.instructor.name || "Instructor",
          courseName: updatedCourse.title,
        }),
      }).catch((error) => {
        console.error(
          `Failed to send course publish notification to ${updatedCourse.instructor.email}:`,
          error
        );
      });
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
