import { sendEmail, emailTemplates } from './email';
import { sendSMS, smsTemplates } from './sms';
import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  email?: boolean;
  sms?: boolean;
  metadata?: any;
}

// Send notification (email, SMS, and in-app)
export async function sendNotification(data: NotificationData): Promise<boolean> {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      console.error('User not found for notification:', data.userId);
      return false;
    }

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
      },
    });

    // Send email if requested
    if (data.email) {
      await sendEmail({
        to: user.email,
        subject: data.title,
        html: data.message,
      });
    }

    // Send SMS if requested and phone number available
    if (data.sms && user.profile?.phone) {
      await sendSMS({
        to: user.profile.phone,
        message: data.message.replace(/<[^>]*>/g, ''), // Strip HTML tags for SMS
      });
    }

    return true;
  } catch (error) {
    console.error('Notification sending error:', error);
    return false;
  }
}

// Notification helpers for common scenarios
export const notificationHelpers = {
  applicationApproved: async (userId: string, courseName: string, instructorName: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const emailContent = emailTemplates.applicationApproved({
      studentName: user.name,
      courseName,
      instructorName,
    });

    return sendNotification({
      userId,
      type: 'APPLICATION',
      title: emailContent.subject,
      message: emailContent.html,
      email: true,
      sms: true,
      metadata: { courseName, instructorName },
    });
  },

  applicationRejected: async (userId: string, courseName: string, reason?: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const emailContent = emailTemplates.applicationRejected({
      studentName: user.name,
      courseName,
      reason,
    });

    return sendNotification({
      userId,
      type: 'APPLICATION',
      title: emailContent.subject,
      message: emailContent.html,
      email: true,
      metadata: { courseName, reason },
    });
  },

  paymentReceived: async (userId: string, amount: number, courseName: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    return sendNotification({
      userId,
      type: 'PAYMENT',
      title: 'Payment Received',
      message: `Your payment of ₵${amount.toLocaleString()} for ${courseName} has been received successfully.`,
      email: true,
      sms: true,
      metadata: { amount, courseName },
    });
  },

  paymentReminder: async (userId: string, amount: number, dueDate: string, courseName: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const emailContent = emailTemplates.paymentReminder({
      studentName: user.name,
      courseName,
      amount,
      dueDate,
    });

    return sendNotification({
      userId,
      type: 'REMINDER',
      title: emailContent.subject,
      message: emailContent.html,
      email: true,
      sms: true,
      metadata: { amount, dueDate, courseName },
    });
  },

  courseApproved: async (instructorId: string, courseName: string, adminComments?: string) => {
    const instructor = await prisma.user.findUnique({ where: { id: instructorId } });
    if (!instructor) return false;

    const emailContent = emailTemplates.courseApproved({
      instructorName: instructor.name,
      courseName,
      adminComments,
    });

    return sendNotification({
      userId: instructorId,
      type: 'COURSE',
      title: emailContent.subject,
      message: emailContent.html,
      email: true,
      metadata: { courseName, adminComments },
    });
  },
};

// Bulk notification sender
export async function sendBulkNotification(
  userIds: string[],
  notification: Omit<NotificationData, 'userId'>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const userId of userIds) {
    try {
      const result = await sendNotification({ ...notification, userId });
      if (result) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

