import { prisma } from "@/lib/db";
import { AssignmentNotificationService } from "./assignment-notification-service";
import { AssignmentNotificationType } from "./types";

export interface ReminderSchedule {
  assignmentId: string;
  reminderType: "48_HOUR" | "24_HOUR" | "OVERDUE";
  scheduledFor: Date;
  processed: boolean;
}

export class DeadlineReminderService {
  /**
   * Schedule reminder notifications for an assignment
   */
  static async scheduleReminders(assignmentId: string): Promise<void> {
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
          extensions: true,
        },
      });

      if (!assignment || !assignment.isPublished) {
        return;
      }

      // Calculate reminder times
      const dueDate = new Date(assignment.dueDate);
      const reminder48h = new Date(dueDate.getTime() - 48 * 60 * 60 * 1000);
      const reminder24h = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
      const overdueCheck = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour after due

      // Only schedule future reminders
      const now = new Date();
      
      if (reminder48h > now) {
        await this.createReminderRecord(assignmentId, "48_HOUR", reminder48h);
      }
      
      if (reminder24h > now) {
        await this.createReminderRecord(assignmentId, "24_HOUR", reminder24h);
      }
      
      if (overdueCheck > now) {
        await this.createReminderRecord(assignmentId, "OVERDUE", overdueCheck);
      }

      console.log(`Scheduled reminders for assignment ${assignmentId}`);
    } catch (error) {
      console.error("Error scheduling reminders:", error);
    }
  }

  /**
   * Process pending reminders (to be called by cron job)
   */
  static async processPendingReminders(): Promise<void> {
    try {
      const now = new Date();
      
      // Get all pending reminders that are due
      const pendingReminders = await prisma.assignmentReminder.findMany({
        where: {
          processed: false,
          scheduledFor: {
            lte: now,
          },
        },
        include: {
          assignment: {
            include: {
              course: true,
            },
          },
        },
      });

      console.log(`Processing ${pendingReminders.length} pending reminders`);

      for (const reminder of pendingReminders) {
        try {
          await this.processReminder(reminder);
          
          // Mark as processed
          await prisma.assignmentReminder.update({
            where: { id: reminder.id },
            data: { processed: true },
          });
        } catch (error) {
          console.error(`Error processing reminder ${reminder.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error processing pending reminders:", error);
    }
  }

  /**
   * Process a single reminder
   */
  private static async processReminder(reminder: any): Promise<void> {
    const { assignment, reminderType } = reminder;

    switch (reminderType) {
      case "48_HOUR":
        await AssignmentNotificationService.sendDeadlineReminder(
          assignment.id,
          AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_48H
        );
        break;

      case "24_HOUR":
        await AssignmentNotificationService.sendDeadlineReminder(
          assignment.id,
          AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_24H
        );
        break;

      case "OVERDUE":
        await this.sendOverdueNotifications(assignment.id);
        break;
    }
  }

  /**
   * Send overdue notifications to students who haven't submitted
   */
  private static async sendOverdueNotifications(assignmentId: string): Promise<void> {
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
        return;
      }

      // Get students who haven't submitted and don't have extensions
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

        // Check if student has an extension that's still valid
        const extensionDate = studentsWithExtensions[student.id];
        if (extensionDate && extensionDate > new Date()) {
          continue;
        }

        // Send overdue notification if enabled
        if (settings?.assignmentDeadlines !== false) {
          await this.sendOverdueNotificationToUser(
            student.id,
            assignment.title,
            assignment.course.title,
            assignment.dueDate
          );
        }
      }
    } catch (error) {
      console.error("Error sending overdue notifications:", error);
    }
  }

  /**
   * Create a reminder record in the database
   */
  private static async createReminderRecord(
    assignmentId: string,
    reminderType: "48_HOUR" | "24_HOUR" | "OVERDUE",
    scheduledFor: Date
  ): Promise<void> {
    try {
      await prisma.assignmentReminder.upsert({
        where: {
          assignmentId_reminderType: {
            assignmentId,
            reminderType,
          },
        },
        update: {
          scheduledFor,
          processed: false,
        },
        create: {
          assignmentId,
          reminderType,
          scheduledFor,
          processed: false,
        },
      });
    } catch (error) {
      console.error("Error creating reminder record:", error);
    }
  }

  /**
   * Cancel reminders for an assignment (e.g., when assignment is deleted or unpublished)
   */
  static async cancelReminders(assignmentId: string): Promise<void> {
    try {
      await prisma.assignmentReminder.deleteMany({
        where: {
          assignmentId,
          processed: false,
        },
      });
      console.log(`Cancelled reminders for assignment ${assignmentId}`);
    } catch (error) {
      console.error("Error cancelling reminders:", error);
    }
  }

  /**
   * Reschedule reminders when assignment due date changes
   */
  static async rescheduleReminders(assignmentId: string): Promise<void> {
    try {
      // Cancel existing reminders
      await this.cancelReminders(assignmentId);
      
      // Schedule new reminders
      await this.scheduleReminders(assignmentId);
      
      console.log(`Rescheduled reminders for assignment ${assignmentId}`);
    } catch (error) {
      console.error("Error rescheduling reminders:", error);
    }
  }

  /**
   * Get reminder preferences for a user
   */
  static async getUserReminderPreferences(userId: string): Promise<{
    enabled: boolean;
    reminderTime: string;
    emailEnabled: boolean;
  }> {
    try {
      const settings = await prisma.userNotificationSettings.findUnique({
        where: { userId },
      });

      return {
        enabled: settings?.assignmentDeadlines ?? true,
        reminderTime: settings?.reminderTime ?? "09:00",
        emailEnabled: settings?.emailNotifications ?? true,
      };
    } catch (error) {
      console.error("Error getting reminder preferences:", error);
      return {
        enabled: true,
        reminderTime: "09:00",
        emailEnabled: true,
      };
    }
  }

  /**
   * Update reminder preferences for a user
   */
  static async updateReminderPreferences(
    userId: string,
    preferences: {
      enabled?: boolean;
      reminderTime?: string;
      emailEnabled?: boolean;
    }
  ): Promise<void> {
    try {
      await prisma.userNotificationSettings.upsert({
        where: { userId },
        update: {
          assignmentDeadlines: preferences.enabled,
          reminderTime: preferences.reminderTime,
          emailNotifications: preferences.emailEnabled,
        },
        create: {
          userId,
          assignmentDeadlines: preferences.enabled ?? true,
          reminderTime: preferences.reminderTime ?? "09:00",
          emailNotifications: preferences.emailEnabled ?? true,
        },
      });
    } catch (error) {
      console.error("Error updating reminder preferences:", error);
    }
  }

  /**
   * Send overdue notification to a specific user
   */
  private static async sendOverdueNotificationToUser(
    userId: string,
    assignmentTitle: string,
    courseName: string,
    dueDate: Date
  ): Promise<void> {
    try {
      const { sendNotification } = await import("./notification-manager");
      
      await sendNotification({
        userId,
        type: "IN_APP",
        title: "Assignment Overdue 🚨",
        message: `"${assignmentTitle}" in ${courseName} is now overdue. Please submit as soon as possible.`,
        category: "COURSE",
        priority: "URGENT",
        data: {
          type: AssignmentNotificationType.ASSIGNMENT_OVERDUE,
          assignmentTitle,
          courseName,
          dueDate,
        },
      });

      // Send email notification
      await sendNotification({
        userId,
        type: "EMAIL",
        title: "Assignment Overdue 🚨",
        message: `"${assignmentTitle}" in ${courseName} is now overdue. Please submit as soon as possible.`,
        category: "COURSE",
        priority: "URGENT",
        data: {
          type: AssignmentNotificationType.ASSIGNMENT_OVERDUE,
          assignmentTitle,
          courseName,
          dueDate,
        },
      });
    } catch (error) {
      console.error("Error sending overdue notification:", error);
    }
  }}
