import { prisma } from "@/lib/db";
import { sendEmail, sendAssignmentEmail } from "./email";
import { sendSMS } from "./sms";
import { AssignmentNotificationType } from "./assignment-notification-service";

export interface NotificationData {
  userId: string;
  type: "EMAIL" | "SMS" | "IN_APP" | "PUSH";
  title: string;
  message: string;
  data?: any;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?: "SYSTEM" | "COURSE" | "PAYMENT" | "ANNOUNCEMENT" | "SUPPORT";
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  push: boolean;
}

export async function sendNotification(
  notification: NotificationData
): Promise<boolean> {
  try {
    // Get user notification preferences
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      console.error("User not found for notification:", notification.userId);
      return false;
    }

    // Create notification record
    const notificationRecord = await prisma.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority || "MEDIUM",
        category: notification.category || "SYSTEM",
        status: "PENDING",
      },
    });

    let success = false;

    // Send based on type
    switch (notification.type) {
      case "EMAIL":
        success = await sendEmailNotification(user.email, notification);
        break;
      case "SMS":
        if (user.profile?.phone) {
          success = await sendSMSNotification(user.profile.phone, notification);
        }
        break;
      case "IN_APP":
        success = true; // Already created in database
        break;
      case "PUSH":
        success = await sendPushNotification(notification);
        break;
    }

    // Update notification status
    await prisma.notification.update({
      where: { id: notificationRecord.id },
      data: {
        status: success ? "SENT" : "FAILED",
        sentAt: success ? new Date() : null,
      },
    });

    return success;
  } catch (error) {
    console.error("Send notification error:", error);
    return false;
  }
}

export async function sendBulkNotification(
  userIds: string[],
  notification: Omit<NotificationData, "userId">
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const userId of userIds) {
    const result = await sendNotification({
      ...notification,
      userId,
    });

    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

export async function sendCourseNotification(
  courseId: string,
  notification: Omit<NotificationData, "userId" | "category">
): Promise<{ success: number; failed: number }> {
  // Get all enrolled students
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { userId: true },
  });

  const userIds = enrollments.map((e) => e.userId);

  return await sendBulkNotification(userIds, {
    ...notification,
    category: "COURSE",
  });
}

export async function sendSystemNotification(
  notification: Omit<NotificationData, "userId" | "category">
): Promise<{ success: number; failed: number }> {
  // Get all active users
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });

  const userIds = users.map((u) => u.id);

  return await sendBulkNotification(userIds, {
    ...notification,
    category: "SYSTEM",
  });
}

export async function getUserNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}

// Helper functions
async function sendEmailNotification(
  email: string,
  notification: NotificationData
) {
  try {
    // Check if this is an assignment notification with specific template
    if (
      notification.data?.type &&
      Object.values(AssignmentNotificationType).includes(notification.data.type)
    ) {
      return await sendAssignmentEmail(
        email,
        notification.data.type,
        notification.data
      );
    }

    // Default email template for non-assignment notifications
    return await sendEmail({
      to: email,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">${notification.title}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">${notification.message}</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  }
}

async function sendSMSNotification(
  phone: string,
  notification: NotificationData
) {
  try {
    return await sendSMS({
      to: phone,
      message: `${notification.title}\n\n${notification.message}`,
    });
  } catch (error) {
    console.error("SMS notification error:", error);
    return false;
  }
}

async function sendPushNotification(notification: NotificationData) {
  // Implement push notification logic here
  // This would integrate with services like Firebase Cloud Messaging
  console.log("Push notification:", notification);
  return true;
}

// Predefined notification templates
export const notificationTemplates = {
  applicationApproved: (studentName: string, courseName: string) => ({
    title: "Application Approved! 🎉",
    message: `Congratulations ${studentName}! Your application for ${courseName} has been approved.`,
    category: "COURSE" as const,
    priority: "HIGH" as const,
  }),

  applicationRejected: (studentName: string, courseName: string) => ({
    title: "Application Update",
    message: `Thank you for applying to ${courseName}. Unfortunately, your application was not successful this time.`,
    category: "COURSE" as const,
    priority: "MEDIUM" as const,
  }),

  paymentReceived: (
    studentName: string,
    amount: number,
    courseName: string
  ) => ({
    title: "Payment Received ✅",
    message: `Payment of GH₵${amount.toLocaleString()} for ${courseName} has been received successfully.`,
    category: "PAYMENT" as const,
    priority: "HIGH" as const,
  }),

  courseApproved: (instructorName: string, courseName: string) => ({
    title: "Course Approved! 🎉",
    message: `Great news ${instructorName}! Your course "${courseName}" has been approved and is now live.`,
    category: "COURSE" as const,
    priority: "HIGH" as const,
  }),

  newAnnouncement: (title: string, courseName?: string) => ({
    title: "New Announcement 📢",
    message: courseName
      ? `New announcement in ${courseName}: ${title}`
      : `New system announcement: ${title}`,
    category: "ANNOUNCEMENT" as const,
    priority: "MEDIUM" as const,
  }),

  supportTicketResponse: (ticketId: string) => ({
    title: "Support Response 💬",
    message: `You have received a response to your support ticket #${ticketId}.`,
    category: "SUPPORT" as const,
    priority: "MEDIUM" as const,
  }),
};
