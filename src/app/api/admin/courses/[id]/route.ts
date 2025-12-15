import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/notifications/email";
import { extendedEmailTemplates } from "@/lib/notifications/email-templates-extended";
import { withAdminAuth, AuthenticatedRequest } from "@/lib/middleware";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Helper to detect build-time execution
function isBuildTime() {
  return process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;
}

export const PUT = withAdminAuth(async function PUT(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isBuildTime()) {
    return NextResponse.json({ success: true, building: true });
  }

  let body: any;
  let action: string | undefined;
  let courseId: string;

  try {
    const paramsResolved = await params;
    courseId = paramsResolved.id;
    body = await request.json();
    const { action: requestAction, comments, updatedAt } = body;
    action = requestAction;

    // Validate action exists and is a string
    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { success: false, message: "Invalid or missing action parameter" },
        { status: 400 }
      );
    }

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
                image: true,
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
                image: true,
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
            status: "APPROVED",
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
                image: true,
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
            status: "APPROVED",
            updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
          },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
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
                image: true,
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

    // Map image to avatar for frontend compatibility
    if (updatedCourse && updatedCourse.instructor && (updatedCourse.instructor as any).image) {
      (updatedCourse.instructor as any).avatar = (updatedCourse.instructor as any).image;
    }

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: `Course ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      courseId,
      action: body?.action,
    });
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update course",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
});

export const GET = withAdminAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  if (isBuildTime()) {
    return NextResponse.json({ success: true, building: true });
  }

  try {
    const { id: courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            phone: true,
          },
        },
        _count: {
          select: {
            applications: true,
            enrollments: true,
            lessons: true,
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

    // Map image to avatar for frontend compatibility
    if (course && course.instructor && (course.instructor as any).image) {
      (course.instructor as any).avatar = (course.instructor as any).image;
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
});
