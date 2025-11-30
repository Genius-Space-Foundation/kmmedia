import { prisma } from "@/lib/db";
import { sendEmail } from "./email";
import { sendNotification } from "./notification-manager";
import { Assignment, AssignmentSubmission, User } from "@prisma/client";
import { AssignmentNotificationType } from "./types";

export interface AssignmentNotificationData {
  assignmentId: string;
  studentId?: string;
  instructorId?: string;
  type: string;
  data?: any;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  assignmentDeadlines: boolean;
  gradeNotifications: boolean;
  reminderTime: string;
}

export class AssignmentNotificationService {
  /**
   * Send notification when a new assignment is published
   */
  static async sendAssignmentPublishedNotification(
    assignmentId: string
  ): Promise<void> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          course: {
            include: {
              enrollments: {
                include: {
                  user: {
                    include: {
                      notificationSettings: true,
                    },
                  },
                },
              },
            },
          },
          instructor: true,
        },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      // Send notifications to all enrolled students
      for (const enrollment of assignment.course.enrollments) {
        const student = enrollment.user;
        const settings = student.notificationSettings;

        // Check if student wants assignment notifications
        if (settings?.assignmentDeadlines !== false) {
          await this.sendNotificationToUser(
            student.id,
            AssignmentNotificationType.ASSIGNMENT_PUBLISHED,
            {
              assignmentTitle: assignment.title,
              courseName: assignment.course.title,
              dueDate: assignment.dueDate,
              instructorName: assignment.instructor.name,
            }
          );
        }
      }
    } catch (error) {
      console.error("Error sending assignment published notification:", error);
    }
  }

  /**
   * Send deadline reminder notifications
   */
  static async sendDeadlineReminder(
    assignmentId: string,
    reminderType: AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_48H | AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_24H
  ): Promise<void> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          course: {
            include: {
              enrollments: {
                include: {
                  user: {
                    include: {
                      notificationSettings: true,
                    },
                  },
                },
              },
            },
          },
          submissions: true,
          extensions: true,
        },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      // Get students who haven't submitted yet
      const submittedStudentIds = assignment.submissions.map(s => s.studentId);
      const studentsWithExtensions = assignment.extensions.reduce((acc, ext) => {
        acc[ext.studentId] = ext.newDueDate;
        return acc;
      }, {} as Record<string, Date>);

      for (const enrollment of assignment.course.enrollments) {
        const student = enrollment.user;
        const settings = student.notificationSettings;

        // Skip if student has already submitted
        if (submittedStudentIds.includes(student.id)) {
          continue;
        }

        // Check if student wants deadline reminders
        if (settings?.assignmentDeadlines !== false) {
          const effectiveDueDate = studentsWithExtensions[student.id] || assignment.dueDate;
          const hoursUntilDue = Math.floor((effectiveDueDate.getTime() - Date.now()) / (1000 * 60 * 60));

          // Send appropriate reminder based on time remaining
          if (
            (reminderType === AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_48H && hoursUntilDue <= 48 && hoursUntilDue > 24) ||
            (reminderType === AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_24H && hoursUntilDue <= 24 && hoursUntilDue > 0)
          ) {
            await this.sendNotificationToUser(
              student.id,
              reminderType,
              {
                assignmentTitle: assignment.title,
                courseName: assignment.course.title,
                dueDate: effectiveDueDate,
                hoursRemaining: hoursUntilDue,
              }
            );
          }
        }
      }
    } catch (error) {
      console.error("Error sending deadline reminder:", error);
    }
  }

  /**
   * Send notification when submission is received
   */
  static async sendSubmissionReceivedNotification(
    submissionId: string
  ): Promise<void> {
    try {
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              course: true,
              instructor: {
                include: {
                  notificationSettings: true,
                },
              },
            },
          },
          student: true,
        },
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      const instructor = submission.assignment.instructor;
      const settings = instructor.notificationSettings;

      // Send notification to instructor
      if (settings?.emailNotifications !== false) {
        await this.sendNotificationToUser(
          instructor.id,
          AssignmentNotificationType.SUBMISSION_RECEIVED,
          {
            assignmentTitle: submission.assignment.title,
            courseName: submission.assignment.course.title,
            studentName: submission.student.name,
            submittedAt: submission.submittedAt,
            isLate: submission.isLate,
          }
        );
      }
    } catch (error) {
      console.error("Error sending submission received notification:", error);
    }
  }

  /**
   * Send notification when submission is graded
   */
  static async sendSubmissionGradedNotification(
    submissionId: string
  ): Promise<void> {
    try {
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              course: true,
            },
          },
          student: {
            include: {
              notificationSettings: true,
            },
          },
        },
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      const student = submission.student;
      const settings = student.notificationSettings;

      // Send notification to student
      if (settings?.emailNotifications !== false) {
        await this.sendNotificationToUser(
          student.id,
          AssignmentNotificationType.SUBMISSION_GRADED,
          {
            assignmentTitle: submission.assignment.title,
            courseName: submission.assignment.course.title,
            grade: submission.finalScore || submission.grade,
            totalPoints: submission.assignment.totalPoints,
            feedback: submission.feedback,
            gradedAt: submission.gradedAt,
          }
        );
      }
    } catch (error) {
      console.error("Error sending submission graded notification:", error);
    }
  }

  /**
   * Send notification when extension is granted
   */
  static async sendExtensionGrantedNotification(
    assignmentId: string,
    studentId: string,
    newDueDate: Date,
    reason: string
  ): Promise<void> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          course: true,
        },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      await this.sendNotificationToUser(
        studentId,
        AssignmentNotificationType.EXTENSION_GRANTED,
        {
          assignmentTitle: assignment.title,
          courseName: assignment.course.title,
          originalDueDate: assignment.dueDate,
          newDueDate: newDueDate,
          reason: reason,
        }
      );
    } catch (error) {
      console.error("Error sending extension granted notification:", error);
    }
  }

  /**
   * Send notification to a specific user
   */
  static async sendNotificationToUser(
    userId: string,
    type: AssignmentNotificationType,
    data: any
  ): Promise<void> {
    const template = this.getNotificationTemplate(type, data);

    // Send in-app notification
    await sendNotification({
      userId,
      type: "IN_APP",
      title: template.title,
      message: template.message,
      category: "COURSE",
      priority: template.priority,
      data: {
        type,
        actionUrl: this.getActionUrl(type, data),
        actionText: this.getActionText(type),
        ...data,
      },
    });

    // Send email notification
    await sendNotification({
      userId,
      type: "EMAIL",
      title: template.title,
      message: template.message,
      category: "COURSE",
      priority: template.priority,
      data: {
        type,
        ...data,
      },
    });
  }

  /**
   * Get notification template based on type
   */
  static getNotificationTemplate(
    type: AssignmentNotificationType,
    data: any
  ): { title: string; message: string; priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" } {
    switch (type) {
      case AssignmentNotificationType.ASSIGNMENT_PUBLISHED:
        return {
          title: "New Assignment Available 📝",
          message: `A new assignment "${data.assignmentTitle}" has been published in ${data.courseName}. Due: ${new Date(data.dueDate).toLocaleDateString()}`,
          priority: "MEDIUM",
        };

      case AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_48H:
        return {
          title: "Assignment Due in 48 Hours ⏰",
          message: `Reminder: "${data.assignmentTitle}" in ${data.courseName} is due in ${data.hoursRemaining} hours.`,
          priority: "HIGH",
        };

      case AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_24H:
        return {
          title: "Assignment Due Tomorrow! ⚠️",
          message: `Urgent: "${data.assignmentTitle}" in ${data.courseName} is due in ${data.hoursRemaining} hours.`,
          priority: "URGENT",
        };

      case AssignmentNotificationType.ASSIGNMENT_OVERDUE:
        return {
          title: "Assignment Overdue 🚨",
          message: `"${data.assignmentTitle}" in ${data.courseName} is now overdue. Please submit as soon as possible.`,
          priority: "URGENT",
        };

      case AssignmentNotificationType.SUBMISSION_RECEIVED:
        return {
          title: "New Submission Received 📥",
          message: `${data.studentName} has submitted "${data.assignmentTitle}" in ${data.courseName}${data.isLate ? " (Late submission)" : ""}.`,
          priority: "MEDIUM",
        };

      case AssignmentNotificationType.SUBMISSION_GRADED:
        return {
          title: "Assignment Graded ✅",
          message: `Your submission for "${data.assignmentTitle}" has been graded. Score: ${data.grade}/${data.totalPoints}`,
          priority: "HIGH",
        };

      case AssignmentNotificationType.EXTENSION_GRANTED:
        return {
          title: "Assignment Extension Granted 📅",
          message: `Your deadline for "${data.assignmentTitle}" has been extended to ${new Date(data.newDueDate).toLocaleDateString()}.`,
          priority: "HIGH",
        };

      case AssignmentNotificationType.EXTENSION_REQUESTED:
        return {
          title: "Extension Request Received 📋",
          message: `A student has requested an extension for "${data.assignmentTitle}" in ${data.courseName}.`,
          priority: "MEDIUM",
        };

      default:
        return {
          title: "Assignment Notification",
          message: "You have a new assignment notification.",
          priority: "MEDIUM",
        };
    }
  }

  /**
   * Get user notification preferences
   */
  static async getUserNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });

    return {
      emailNotifications: settings?.emailNotifications ?? true,
      assignmentDeadlines: settings?.assignmentDeadlines ?? true,
      gradeNotifications: true, // Always enabled for grades
      reminderTime: settings?.reminderTime ?? "09:00",
    };
  }

  /**
   * Update user notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    await prisma.userNotificationSettings.upsert({
      where: { userId },
      update: {
        emailNotifications: preferences.emailNotifications,
        assignmentDeadlines: preferences.assignmentDeadlines,
        reminderTime: preferences.reminderTime,
      },
      create: {
        userId,
        emailNotifications: preferences.emailNotifications ?? true,
        assignmentDeadlines: preferences.assignmentDeadlines ?? true,
        reminderTime: preferences.reminderTime ?? "09:00",
      },
    });
  }

  /**
   * Get action URL for notification type
   */
  static getActionUrl(type: AssignmentNotificationType, data: any): string {
    switch (type) {
      case AssignmentNotificationType.ASSIGNMENT_PUBLISHED:
      case AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_48H:
      case AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_24H:
      case AssignmentNotificationType.ASSIGNMENT_OVERDUE:
        return `/assignments/${data.assignmentId}`;
      case AssignmentNotificationType.SUBMISSION_RECEIVED:
        return `/assignments/${data.assignmentId}/submissions`;
      case AssignmentNotificationType.SUBMISSION_GRADED:
        return `/assignments/${data.assignmentId}/submission`;
      case AssignmentNotificationType.EXTENSION_GRANTED:
      case AssignmentNotificationType.EXTENSION_REQUESTED:
        return `/assignments/${data.assignmentId}`;
      default:
        return "/assignments";
    }
  }

  /**
   * Get action text for notification type
   */
  static getActionText(type: AssignmentNotificationType): string {
    switch (type) {
      case AssignmentNotificationType.ASSIGNMENT_PUBLISHED:
      case AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_48H:
      case AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_24H:
      case AssignmentNotificationType.ASSIGNMENT_OVERDUE:
        return "View Assignment";
      case AssignmentNotificationType.SUBMISSION_RECEIVED:
        return "View Submissions";
      case AssignmentNotificationType.SUBMISSION_GRADED:
        return "View Grade";
      case AssignmentNotificationType.EXTENSION_GRANTED:
      case AssignmentNotificationType.EXTENSION_REQUESTED:
        return "View Details";
      default:
        return "View";
    }
  }
}