import nodemailer from "nodemailer";
import {
  assignmentEmailTemplates,
  AssignmentEmailTemplateData,
} from "./assignment-email-templates";
import { AssignmentNotificationType } from "./types";

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@kmmediatraining.com";

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Send email
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  applicationApproved: (data: {
    studentName: string;
    courseName: string;
    instructorName: string;
  }) => ({
    subject: `🎉 Application Approved - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Congratulations, ${data.studentName}! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We're excited to inform you that your application for <strong>${data.courseName}</strong> 
            has been approved!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Next Steps:</h3>
            <ol style="color: #555; line-height: 1.8;">
              <li>Complete your tuition payment to secure your spot</li>
              <li>Access your course materials in the student dashboard</li>
              <li>Connect with your instructor: ${data.instructorName}</li>
              <li>Join the course community and start learning!</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Access Dashboard
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `,
  }),

  temporaryPassword: (data: {
    userName: string;
    email: string;
    tempPassword: string;
    role: string;
  }) => ({
    subject: "Welcome to KM Media Training Institute - Account Created",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Welcome, ${data.userName}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your account has been created as a <strong>${data.role}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-top: 0;">Your Login Credentials:</h3>
            <p style="color: #555; margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
            <p style="color: #555; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${data.tempPassword}</code></p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ <strong>Important:</strong> Please change your password after your first login for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Login Now
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            If you didn't request this account, please contact our administrator immediately.
          </p>
        </div>
      </div>
    `,
  }),

  applicationRejected: (data: {
    studentName: string;
    courseName: string;
    reason?: string;
  }) => ({
    subject: `Application Update - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Application Update</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.studentName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for your interest in <strong>${data.courseName}</strong>. 
            After careful review, we regret to inform you that your application was not successful at this time.
          </p>
          
          ${
            data.reason
              ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>Feedback:</strong> ${data.reason}
            </div>
          `
              : ""
          }
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We encourage you to explore our other courses and apply again in the future. 
            Our team is always here to help you find the right learning path.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Explore Other Courses
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  paymentReminder: (data: {
    studentName: string;
    courseName: string;
    amount: number;
    dueDate: string;
  }) => ({
    subject: `Payment Reminder - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Payment Reminder 💳</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.studentName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            This is a friendly reminder that your payment for <strong>${
              data.courseName
            }</strong> 
            is due soon.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Payment Details:</h3>
            <p style="margin: 10px 0;"><strong>Amount:</strong> ₵${data.amount.toLocaleString()}</p>
            <p style="margin: 10px 0;"><strong>Due Date:</strong> ${
              data.dueDate
            }</p>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${
              data.courseName
            }</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/dashboards/student?tab=payments" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Make Payment
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            If you've already made this payment, please disregard this reminder.
          </p>
        </div>
      </div>
    `,
  }),

  courseApproved: (data: {
    instructorName: string;
    courseName: string;
    adminComments?: string;
  }) => ({
    subject: `Course Approved - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Course Approved! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.instructorName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Great news! Your course <strong>${
              data.courseName
            }</strong> has been approved and is now live on our platform.
          </p>
          
          ${
            data.adminComments
              ? `
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>Admin Comments:</strong> ${data.adminComments}
            </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/instructor" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Course
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  welcome: (data: { name: string }) => ({
    subject: "Welcome to KM Media Training Institute! 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Welcome, ${data.name}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for joining KM Media Training Institute. We're thrilled to have you on board!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Explore our wide range of courses and start your journey towards mastering media skills today.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Explore Courses
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  paymentReceipt: (data: {
    studentName: string;
    amount: number;
    courseName?: string;
    receiptUrl: string;
  }) => ({
    subject: "Payment Receipt - KM Media Training Institute",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Payment Successful! ✅</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.studentName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We have received your payment of <strong>GH₵${data.amount.toLocaleString()}</strong>
            ${data.courseName ? ` for <strong>${data.courseName}</strong>` : ""}.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.receiptUrl}" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Download Receipt
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  enrollmentConfirmation: (data: {
    studentName: string;
    courseName: string;
  }) => ({
    subject: `Enrollment Confirmed - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Enrollment Confirmed! 🎓</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.studentName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            You have successfully enrolled in <strong>${data.courseName}</strong>.
            You can now access all course materials and start learning.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  }),
};

// Assignment email sending function
export async function sendAssignmentEmail(
  to: string,
  type: AssignmentNotificationType,
  data: AssignmentEmailTemplateData
): Promise<boolean> {
  try {
    const template = assignmentEmailTemplates[type](data);

    return await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Assignment email sending error:", error);
    return false;
  }
}
