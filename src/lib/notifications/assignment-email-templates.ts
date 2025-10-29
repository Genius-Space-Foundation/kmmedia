import { AssignmentNotificationType } from "./assignment-notification-service";

export interface AssignmentEmailTemplateData {
  assignmentTitle: string;
  courseName: string;
  studentName?: string;
  instructorName?: string;
  dueDate?: Date;
  newDueDate?: Date;
  originalDueDate?: Date;
  grade?: number;
  totalPoints?: number;
  feedback?: string;
  hoursRemaining?: number;
  reason?: string;
  submittedAt?: Date;
  gradedAt?: Date;
  isLate?: boolean;
}

export const assignmentEmailTemplates = {
  [AssignmentNotificationType.ASSIGNMENT_PUBLISHED]: (
    data: AssignmentEmailTemplateData
  ) => ({
    subject: `📝 New Assignment: ${data.assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">📝 New Assignment Available</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            A new assignment has been published in your course <strong>${
              data.courseName
            }</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-top: 0;">${
              data.assignmentTitle
            }</h3>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${
              data.courseName
            }</p>
            <p style="margin: 10px 0;"><strong>Instructor:</strong> ${
              data.instructorName
            }</p>
            <p style="margin: 10px 0;"><strong>Due Date:</strong> ${
              data.dueDate
                ? new Date(data.dueDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not specified"
            }</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Assignment
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Make sure to read the assignment instructions carefully and submit your work before the deadline.
          </p>
        </div>
      </div>
    `,
  }),

  [AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_48H]: (
    data: AssignmentEmailTemplateData
  ) => ({
    subject: `⏰ Assignment Due in 48 Hours: ${data.assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">⏰ Assignment Due Soon</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            This is a friendly reminder that your assignment is due in <strong>${data.hoursRemaining} hours</strong>.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">${data.assignmentTitle}</h3>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${data.courseName}</p>
            <p style="margin: 10px 0;"><strong>Time Remaining:</strong> ${data.hoursRemaining} hours</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Submit Assignment
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Don't wait until the last minute! Submit your assignment early to avoid any technical issues.
          </p>
        </div>
      </div>
    `,
  }),
  [AssignmentNotificationType.ASSIGNMENT_DUE_REMINDER_24H]: (
    data: AssignmentEmailTemplateData
  ) => ({
    subject: `🚨 URGENT: Assignment Due Tomorrow - ${data.assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">🚨 URGENT: Assignment Due Tomorrow!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            <strong>Final reminder:</strong> Your assignment is due in less than <strong>${data.hoursRemaining} hours</strong>!
          </p>
          
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">${data.assignmentTitle}</h3>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${data.courseName}</p>
            <p style="margin: 10px 0; color: #721c24;"><strong>⚠️ Due in:</strong> ${data.hoursRemaining} hours</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              SUBMIT NOW
            </a>
          </div>
          
          <p style="color: #721c24; font-size: 14px; font-weight: bold;">
            ⚠️ Late submissions may result in grade penalties. Submit immediately to avoid missing the deadline!
          </p>
        </div>
      </div>
    `,
  }),

  [AssignmentNotificationType.SUBMISSION_RECEIVED]: (
    data: AssignmentEmailTemplateData
  ) => ({
    subject: `📥 New Submission: ${data.assignmentTitle} - ${data.studentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">📥 New Submission Received</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            A student has submitted their assignment for your review.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">${
              data.assignmentTitle
            }</h3>
            <p style="margin: 10px 0;"><strong>Student:</strong> ${
              data.studentName
            }</p>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${
              data.courseName
            }</p>
            <p style="margin: 10px 0;"><strong>Submitted:</strong> ${
              data.submittedAt
                ? new Date(data.submittedAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"
            }</p>
            ${
              data.isLate
                ? '<p style="margin: 10px 0; color: #dc3545;"><strong>⚠️ Status:</strong> Late Submission</p>'
                : ""
            }
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/instructor" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Submission
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Please review and grade the submission when convenient. Students appreciate timely feedback!
          </p>
        </div>
      </div>
    `,
  }),

  [AssignmentNotificationType.SUBMISSION_GRADED]: (
    data: AssignmentEmailTemplateData
  ) => ({
    subject: `✅ Assignment Graded: ${data.assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">✅ Assignment Graded</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Great news! Your assignment has been graded and feedback is now available.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">${
              data.assignmentTitle
            }</h3>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${
              data.courseName
            }</p>
            <p style="margin: 10px 0;"><strong>Your Score:</strong> ${
              data.grade
            }/${data.totalPoints} points</p>
            <p style="margin: 10px 0;"><strong>Percentage:</strong> ${
              data.grade && data.totalPoints
                ? Math.round((data.grade / data.totalPoints) * 100)
                : 0
            }%</p>
            ${
              data.feedback
                ? `<p style="margin: 10px 0;"><strong>Feedback:</strong> ${data.feedback}</p>`
                : ""
            }
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Full Feedback
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Keep up the great work! Use the feedback to improve your future assignments.
          </p>
        </div>
      </div>
    `,
  }),
  [AssignmentNotificationType.EXTENSION_GRANTED]: (
    data: AssignmentEmailTemplateData
  ) => ({
    subject: `📅 Assignment Extension Granted: ${data.assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">📅 Assignment Extension Granted</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Good news! Your request for an assignment extension has been approved.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h3 style="color: #17a2b8; margin-top: 0;">${
              data.assignmentTitle
            }</h3>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${
              data.courseName
            }</p>
            <p style="margin: 10px 0;"><strong>Original Due Date:</strong> ${
              data.originalDueDate
                ? new Date(data.originalDueDate).toLocaleDateString()
                : "N/A"
            }</p>
            <p style="margin: 10px 0; color: #17a2b8;"><strong>New Due Date:</strong> ${
              data.newDueDate
                ? new Date(data.newDueDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"
            }</p>
            ${
              data.reason
                ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${data.reason}</p>`
                : ""
            }
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Assignment
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Please make sure to submit your assignment by the new deadline. Use this extra time wisely!
          </p>
        </div>
      </div>
    `,
  }),

  [AssignmentNotificationType.EXTENSION_REQUESTED]: (
    data: AssignmentEmailTemplateData
  ) => ({
    subject: `📋 Extension Request: ${data.assignmentTitle} - ${data.studentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">📋 Extension Request Received</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            A student has requested an extension for an assignment deadline.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
            <h3 style="color: #6f42c1; margin-top: 0;">${
              data.assignmentTitle
            }</h3>
            <p style="margin: 10px 0;"><strong>Student:</strong> ${
              data.studentName
            }</p>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${
              data.courseName
            }</p>
            <p style="margin: 10px 0;"><strong>Current Due Date:</strong> ${
              data.dueDate ? new Date(data.dueDate).toLocaleDateString() : "N/A"
            }</p>
            ${
              data.reason
                ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${data.reason}</p>`
                : ""
            }
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/instructor" 
               style="background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Request
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Please review the extension request and respond to the student promptly.
          </p>
        </div>
      </div>
    `,
  }),

  [AssignmentNotificationType.ASSIGNMENT_OVERDUE]: (
    data: AssignmentEmailTemplateData
  ) => ({
    subject: `🚨 OVERDUE: ${data.assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">KM Media Training Institute</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">🚨 Assignment Overdue</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            <strong>Important:</strong> Your assignment deadline has passed and your submission is now overdue.
          </p>
          
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">${data.assignmentTitle}</h3>
            <p style="margin: 10px 0;"><strong>Course:</strong> ${data.courseName}</p>
            <p style="margin: 10px 0; color: #721c24;"><strong>Status:</strong> OVERDUE</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboards/student" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Submit Now (Late)
            </a>
          </div>
          
          <p style="color: #721c24; font-size: 14px; font-weight: bold;">
            ⚠️ Late submissions may result in grade penalties. Contact your instructor if you need assistance.
          </p>
        </div>
      </div>
    `,
  }),
};
