import { emailTemplates as baseTemplates } from "./email";

// Extended email templates for user management, course workflows, and payments
export const extendedEmailTemplates = {
  ...baseTemplates,

  courseRejected: (data: {
    instructorName: string;
    courseName: string;
    rejectionReason?: string;
  }) => ({
    subject: `Course Review Update - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Course Review Update</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.instructorName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for submitting <strong>${data.courseName}</strong> for review. 
            After careful consideration, we need you to make some revisions before we can approve it.
          </p>
          
          ${
            data.rejectionReason
              ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>Feedback:</strong> ${data.rejectionReason}
            </div>
          `
              : ""
          }
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Please review the feedback above and make the necessary changes. 
            Once updated, you can resubmit your course for review.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/instructor" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Edit Course
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  coursePublished: (data: {
    instructorName: string;
    courseName: string;
  }) => ({
    subject: `Course Published - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Course Published! 🚀</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.instructorName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Exciting news! Your course <strong>${data.courseName}</strong> is now published 
            and available to students on our platform.
          </p>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #155724;">
              ✅ Students can now discover and enroll in your course!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/instructor" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Course
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  userSuspended: (data: {
    userName: string;
    reason?: string;
  }) => ({
    subject: "Account Suspended - KM Media Training Institute",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Account Suspended</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.userName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your account has been temporarily suspended.
          </p>
          
          ${
            data.reason
              ? `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>Reason:</strong> ${data.reason}
            </div>
          `
              : ""
          }
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            If you believe this is an error or would like to appeal this decision, 
            please contact our support team.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  userActivated: (data: {
    userName: string;
  }) => ({
    subject: "Account Activated - Welcome Back!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Welcome Back! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.userName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Great news! Your account has been reactivated and you now have full access 
            to the platform again.
          </p>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #155724;">
              ✅ You can now log in and continue your learning journey!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Login Now
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  roleChanged: (data: {
    userName: string;
    oldRole: string;
    newRole: string;
  }) => ({
    subject: "Account Role Updated - KM Media Training Institute",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Account Role Updated</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.userName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your account role has been updated by an administrator.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 10px 0;"><strong>Previous Role:</strong> ${data.oldRole}</p>
            <p style="margin: 10px 0;"><strong>New Role:</strong> ${data.newRole}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your permissions and access have been updated accordingly. 
            Please log in to see your new dashboard and features.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Access Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  paymentConfirmation: (data: {
    studentName: string;
    courseName: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    receiptUrl?: string;
  }) => ({
    subject: `Payment Confirmed - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Payment Confirmed! ✅</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.studentName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you! Your payment has been successfully processed.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Payment Details</h3>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${data.courseName}</p>
            <p style="margin: 10px 0;"><strong>Amount:</strong> ₵${data.amount.toLocaleString()}</p>
            <p style="margin: 10px 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            <p style="margin: 10px 0;"><strong>Reference:</strong> ${data.reference}</p>
          </div>
          
          ${
            data.receiptUrl
              ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${data.receiptUrl}" 
               style="background: #6c757d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Download Receipt
            </a>
          </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Access Your Course
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  refundProcessed: (data: {
    userName: string;
    courseName: string;
    amount: number;
    reason?: string;
  }) => ({
    subject: `Refund Processed - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Refund Processed</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.userName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your refund has been processed successfully.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-top: 0;">Refund Details</h3>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${data.courseName}</p>
            <p style="margin: 10px 0;"><strong>Refund Amount:</strong> ₵${data.amount.toLocaleString()}</p>
            ${
              data.reason
                ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${data.reason}</p>`
                : ""
            }
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #888;">
            The refund will be credited to your original payment method within 5-10 business days.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  courseSubmittedForReview: (data: {
    adminName: string;
    instructorName: string;
    courseName: string;
    courseId: string;
  }) => ({
    subject: `New Course Submitted for Review - ${data.courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">New Course Awaiting Review 📚</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.adminName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            A new course has been submitted for your review.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
            <h3 style="color: #6f42c1; margin-top: 0;">${data.courseName}</h3>
            <p style="margin: 10px 0;"><strong>Instructor:</strong> ${data.instructorName}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/admin" 
               style="background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Course
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  enrollmentConfirmation: (data: {
    studentName: string;
    courseName: string;
    courseUrl: string;
  }) => ({
    subject: `Welcome to ${data.courseName} - Start Learning!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Welcome to the Course! 🎓</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.studentName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Congratulations! You have successfully enrolled in <strong>${data.courseName}</strong>. 
            We are thrilled to have you join us.
          </p>
          
          <div style="background: #e2e6ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #333;">
              Ready to start learning? Your course materials are waiting for you.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.courseUrl}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Start Learning Now
            </a>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #888;">
            If you have any questions, feel free to reach out to your instructor or our support team.
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (data: {
    userName: string;
    resetUrl: string;
  }) => ({
    subject: "Reset Your Password - KM Media Training Institute",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Password Reset Request 🔒</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Dear ${data.userName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We received a request to reset your password. If you didn't make this request, 
            you can safely ignore this email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #888;">
            This link will expire in 1 hour.
          </p>
        </div>
      </div>
    `,
  }),
};
