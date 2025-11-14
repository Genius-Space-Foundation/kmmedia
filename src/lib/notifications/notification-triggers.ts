import { prisma } from "@/lib/db";
import {
  sendNotification,
  notificationTemplates,
} from "./notification-manager";

/**
 * Notification Triggers for System Events
 * This service provides functions to create notifications for various system events
 */

// Application-related notifications
export async function notifyApplicationApproved(
  applicationId: string
): Promise<boolean> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        course: true,
      },
    });

    if (!application) return false;

    const template = notificationTemplates.applicationApproved(
      application.user.name,
      application.course.title
    );

    // Send in-app notification
    await sendNotification({
      userId: application.user.id,
      type: "IN_APP",
      ...template,
      data: {
        actionUrl: `/dashboards/student`,
        actionText: "View Dashboard",
      },
    });

    // Send email notification
    await sendNotification({
      userId: application.user.id,
      type: "EMAIL",
      ...template,
      data: {
        actionUrl: `/dashboards/student`,
        actionText: "View Dashboard",
      },
    });

    return true;
  } catch (error) {
    console.error("Notify application approved error:", error);
    return false;
  }
}

export async function notifyApplicationRejected(
  applicationId: string
): Promise<boolean> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        course: true,
      },
    });

    if (!application) return false;

    const template = notificationTemplates.applicationRejected(
      application.user.name,
      application.course.title
    );

    await sendNotification({
      userId: application.user.id,
      type: "IN_APP",
      ...template,
      data: {
        actionUrl: `/courses`,
        actionText: "Browse Other Courses",
      },
    });

    await sendNotification({
      userId: application.user.id,
      type: "EMAIL",
      ...template,
    });

    return true;
  } catch (error) {
    console.error("Notify application rejected error:", error);
    return false;
  }
}

// Course-related notifications
export async function notifyCourseApproved(courseId: string): Promise<boolean> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
      },
    });

    if (!course) return false;

    const template = notificationTemplates.courseApproved(
      course.instructor.name,
      course.title
    );

    await sendNotification({
      userId: course.instructor.id,
      type: "IN_APP",
      ...template,
      data: {
        actionUrl: `/dashboards/instructor/courses/${courseId}`,
        actionText: "View Course",
      },
    });

    await sendNotification({
      userId: course.instructor.id,
      type: "EMAIL",
      ...template,
    });

    return true;
  } catch (error) {
    console.error("Notify course approved error:", error);
    return false;
  }
}

export async function notifyCourseRejected(courseId: string): Promise<boolean> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
      },
    });

    if (!course) return false;

    await sendNotification({
      userId: course.instructor.id,
      type: "IN_APP",
      title: "Course Not Approved",
      message: `Your course "${course.title}" requires revisions. Please check the review comments.`,
      category: "COURSE",
      priority: "HIGH",
      data: {
        actionUrl: `/dashboards/instructor/courses/${courseId}`,
        actionText: "View Comments",
      },
    });

    await sendNotification({
      userId: course.instructor.id,
      type: "EMAIL",
      title: "Course Not Approved",
      message: `Your course "${course.title}" requires revisions. Please check the review comments.`,
      category: "COURSE",
      priority: "HIGH",
    });

    return true;
  } catch (error) {
    console.error("Notify course rejected error:", error);
    return false;
  }
}

export async function notifyCourseSubmittedForApproval(
  courseId: string
): Promise<boolean> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
      },
    });

    if (!course) return false;

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        type: "IN_APP",
        title: "New Course Pending Approval",
        message: `${course.instructor.name} has submitted "${course.title}" for approval.`,
        category: "COURSE",
        priority: "HIGH",
        data: {
          actionUrl: `/dashboards/admin/courses?status=PENDING_APPROVAL`,
          actionText: "Review Course",
        },
      });
    }

    return true;
  } catch (error) {
    console.error("Notify course submitted error:", error);
    return false;
  }
}

// Payment-related notifications
export async function notifyPaymentReceived(
  paymentId: string
): Promise<boolean> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        application: {
          include: {
            course: true,
          },
        },
        enrollment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!payment) return false;

    const courseName =
      payment.application?.course?.title ||
      payment.enrollment?.course?.title ||
      "Unknown Course";

    const template = notificationTemplates.paymentReceived(
      payment.user.name,
      payment.amount,
      courseName
    );

    await sendNotification({
      userId: payment.user.id,
      type: "IN_APP",
      ...template,
      data: {
        actionUrl: `/dashboards/student/payments`,
        actionText: "View Payments",
      },
    });

    await sendNotification({
      userId: payment.user.id,
      type: "EMAIL",
      ...template,
    });

    return true;
  } catch (error) {
    console.error("Notify payment received error:", error);
    return false;
  }
}

// Assignment-related notifications
export async function notifyAssignmentGraded(
  submissionId: string
): Promise<boolean> {
  try {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) return false;

    await sendNotification({
      userId: submission.student.id,
      type: "IN_APP",
      title: "Assignment Graded 📝",
      message: `Your assignment "${submission.assignment.title}" has been graded. Score: ${submission.grade}/${submission.assignment.totalPoints}`,
      category: "COURSE",
      priority: "HIGH",
      data: {
        actionUrl: `/dashboards/student/assignments/${submission.assignmentId}`,
        actionText: "View Grade",
      },
    });

    await sendNotification({
      userId: submission.student.id,
      type: "EMAIL",
      title: "Assignment Graded",
      message: `Your assignment "${submission.assignment.title}" in ${submission.assignment.course.title} has been graded.`,
      category: "COURSE",
      priority: "HIGH",
    });

    return true;
  } catch (error) {
    console.error("Notify assignment graded error:", error);
    return false;
  }
}

export async function notifyAssignmentPublished(
  assignmentId: string
): Promise<boolean> {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) return false;

    // Notify all enrolled students
    for (const enrollment of assignment.course.enrollments) {
      await sendNotification({
        userId: enrollment.user.id,
        type: "IN_APP",
        title: "New Assignment Published 📚",
        message: `A new assignment "${assignment.title}" has been published in ${assignment.course.title}. Due: ${new Date(assignment.dueDate).toLocaleDateString()}`,
        category: "COURSE",
        priority: "HIGH",
        data: {
          actionUrl: `/dashboards/student/assignments/${assignmentId}`,
          actionText: "View Assignment",
        },
      });
    }

    return true;
  } catch (error) {
    console.error("Notify assignment published error:", error);
    return false;
  }
}

// Assessment-related notifications
export async function notifyAssessmentGraded(
  submissionId: string
): Promise<boolean> {
  try {
    const submission = await prisma.assessmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        assessment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) return false;

    const passed = submission.passed ? "passed" : "did not pass";
    const emoji = submission.passed ? "🎉" : "📊";

    await sendNotification({
      userId: submission.student.id,
      type: "IN_APP",
      title: `Assessment Graded ${emoji}`,
      message: `Your ${submission.assessment.type.toLowerCase()} "${submission.assessment.title}" has been graded. Score: ${submission.finalPercentage || submission.percentage}%. You ${passed}.`,
      category: "COURSE",
      priority: "HIGH",
      data: {
        actionUrl: `/dashboards/student/assessments/${submission.assessmentId}`,
        actionText: "View Results",
      },
    });

    await sendNotification({
      userId: submission.student.id,
      type: "EMAIL",
      title: "Assessment Graded",
      message: `Your assessment "${submission.assessment.title}" in ${submission.assessment.course.title} has been graded.`,
      category: "COURSE",
      priority: "HIGH",
    });

    return true;
  } catch (error) {
    console.error("Notify assessment graded error:", error);
    return false;
  }
}

// Announcement notifications
export async function notifyNewAnnouncement(
  announcementId: string
): Promise<boolean> {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!announcement) return false;

    const template = notificationTemplates.newAnnouncement(
      announcement.title,
      announcement.course?.title
    );

    if (announcement.targetAudience === "ALL_STUDENTS") {
      // Notify all active students
      const students = await prisma.user.findMany({
        where: {
          role: "STUDENT",
          status: "ACTIVE",
        },
      });

      for (const student of students) {
        await sendNotification({
          userId: student.id,
          type: "IN_APP",
          ...template,
          data: {
            actionUrl: `/announcements/${announcementId}`,
            actionText: "Read More",
          },
        });
      }
    } else if (
      announcement.targetAudience === "COURSE_STUDENTS" &&
      announcement.course
    ) {
      // Notify only enrolled students
      for (const enrollment of announcement.course.enrollments) {
        await sendNotification({
          userId: enrollment.user.id,
          type: "IN_APP",
          ...template,
          data: {
            actionUrl: `/announcements/${announcementId}`,
            actionText: "Read More",
          },
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Notify new announcement error:", error);
    return false;
  }
}

// Support ticket notifications
export async function notifySupportTicketResponse(
  ticketId: string
): Promise<boolean> {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
      },
    });

    if (!ticket) return false;

    const template = notificationTemplates.supportTicketResponse(
      ticketId.substring(0, 8)
    );

    await sendNotification({
      userId: ticket.user.id,
      type: "IN_APP",
      ...template,
      data: {
        actionUrl: `/dashboards/student/support/${ticketId}`,
        actionText: "View Response",
      },
    });

    await sendNotification({
      userId: ticket.user.id,
      type: "EMAIL",
      ...template,
    });

    return true;
  } catch (error) {
    console.error("Notify support ticket response error:", error);
    return false;
  }
}

// Enrollment notification
export async function notifyEnrollmentCreated(
  enrollmentId: string
): Promise<boolean> {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!enrollment) return false;

    // Notify student
    await sendNotification({
      userId: enrollment.user.id,
      type: "IN_APP",
      title: "Enrollment Confirmed! 🎓",
      message: `You are now enrolled in ${enrollment.course.title}. Start learning today!`,
      category: "COURSE",
      priority: "HIGH",
      data: {
        actionUrl: `/dashboards/student/courses/${enrollment.courseId}`,
        actionText: "Start Learning",
      },
    });

    await sendNotification({
      userId: enrollment.user.id,
      type: "EMAIL",
      title: "Enrollment Confirmed",
      message: `Welcome to ${enrollment.course.title}!`,
      category: "COURSE",
      priority: "HIGH",
    });

    return true;
  } catch (error) {
    console.error("Notify enrollment created error:", error);
    return false;
  }
}

// Deadline reminder notification
export async function notifyDeadlineReminder(
  assignmentId: string,
  hoursUntilDue: number
): Promise<boolean> {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                user: true,
              },
            },
          },
        },
        submissions: true,
      },
    });

    if (!assignment) return false;

    // Get students who haven't submitted
    const submittedStudentIds = new Set(
      assignment.submissions.map((s) => s.studentId)
    );

    for (const enrollment of assignment.course.enrollments) {
      if (!submittedStudentIds.has(enrollment.user.id)) {
        const timeMessage =
          hoursUntilDue < 24
            ? `${hoursUntilDue} hours`
            : `${Math.floor(hoursUntilDue / 24)} days`;

        await sendNotification({
          userId: enrollment.user.id,
          type: "IN_APP",
          title: "Assignment Deadline Reminder ⏰",
          message: `Assignment "${assignment.title}" is due in ${timeMessage}. Don't forget to submit!`,
          category: "COURSE",
          priority: "HIGH",
          data: {
            actionUrl: `/dashboards/student/assignments/${assignmentId}`,
            actionText: "Submit Now",
          },
        });

        // Send email for urgent reminders (24 hours or less)
        if (hoursUntilDue <= 24) {
          await sendNotification({
            userId: enrollment.user.id,
            type: "EMAIL",
            title: "Urgent: Assignment Due Soon",
            message: `Assignment "${assignment.title}" in ${assignment.course.title} is due in ${timeMessage}!`,
            category: "COURSE",
            priority: "URGENT",
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Notify deadline reminder error:", error);
    return false;
  }
}
