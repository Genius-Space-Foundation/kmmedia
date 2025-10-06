interface SMSConfig {
  apiKey: string;
  username: string;
  senderId: string;
  baseUrl: string;
}

interface SMSMessage {
  to: string;
  message: string;
  from?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private config: SMSConfig;

  constructor() {
    this.config = {
      apiKey: process.env.SMS_API_KEY || "",
      username: process.env.SMS_USERNAME || "",
      senderId: process.env.SMS_SENDER_ID || "KMEDIA",
      baseUrl:
        process.env.SMS_BASE_URL ||
        "https://api.africastalking.com/version1/messaging",
    };
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      // For development, we'll simulate SMS sending
      if (process.env.NODE_ENV === "development") {
        console.log("📱 SMS (Development Mode):", {
          to: message.to,
          message: message.message,
          from: message.from || this.config.senderId,
        });

        return {
          success: true,
          messageId: `dev-${Date.now()}`,
        };
      }

      // Production SMS sending using Africa's Talking API
      const response = await fetch(`${this.config.baseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          apiKey: this.config.apiKey,
        },
        body: new URLSearchParams({
          username: this.config.username,
          to: message.to,
          message: message.message,
          from: message.from || this.config.senderId,
        }),
      });

      const data = await response.json();

      if (data.SMSMessageData?.Recipients?.[0]?.status === "Success") {
        return {
          success: true,
          messageId: data.SMSMessageData.Recipients[0].messageId,
        };
      } else {
        throw new Error(
          data.SMSMessageData?.Recipients?.[0]?.status || "SMS sending failed"
        );
      }
    } catch (error) {
      console.error("SMS sending error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendPaymentReminder(
    phoneNumber: string,
    paymentDetails: {
      amount: number;
      dueDate: string;
      type: string;
      description: string;
      daysUntilDue: number;
      isOverdue: boolean;
    }
  ): Promise<SMSResponse> {
    const urgencyText = paymentDetails.isOverdue
      ? `OVERDUE by ${Math.abs(paymentDetails.daysUntilDue)} days`
      : paymentDetails.daysUntilDue === 0
      ? "DUE TODAY"
      : paymentDetails.daysUntilDue <= 3
      ? `Due in ${paymentDetails.daysUntilDue} days (URGENT)`
      : `Due in ${paymentDetails.daysUntilDue} days`;

    const message = `🔔 KM MEDIA TRAINING: Payment reminder for ${paymentDetails.type
      .replace("_", " ")
      .toLowerCase()} - ₵${paymentDetails.amount.toLocaleString()}. ${urgencyText}. Description: ${
      paymentDetails.description
    }. Please make payment to avoid late fees. Reply STOP to opt out.`;

    return this.sendSMS({
      to: phoneNumber,
      message: message,
    });
  }

  async sendPaymentConfirmation(
    phoneNumber: string,
    paymentDetails: {
      amount: number;
      reference: string;
      type: string;
    }
  ): Promise<SMSResponse> {
    const message = `✅ KM MEDIA TRAINING: Payment confirmed! ₵${paymentDetails.amount.toLocaleString()} for ${paymentDetails.type
      .replace("_", " ")
      .toLowerCase()}. Reference: ${paymentDetails.reference}. Thank you!`;

    return this.sendSMS({
      to: phoneNumber,
      message: message,
    });
  }

  async sendPaymentPlanCreated(
    phoneNumber: string,
    planDetails: {
      totalAmount: number;
      installments: number;
      monthlyAmount: number;
      startDate: string;
    }
  ): Promise<SMSResponse> {
    const message = `📋 KM MEDIA TRAINING: Payment plan created! Total: ₵${planDetails.totalAmount.toLocaleString()}, ${
      planDetails.installments
    } installments of ₵${planDetails.monthlyAmount.toLocaleString()} starting ${new Date(
      planDetails.startDate
    ).toLocaleDateString()}. You'll receive reminders before each due date.`;

    return this.sendSMS({
      to: phoneNumber,
      message: message,
    });
  }

  async sendInstallmentReminder(
    phoneNumber: string,
    installmentDetails: {
      installmentNumber: number;
      totalInstallments: number;
      amount: number;
      dueDate: string;
      daysUntilDue: number;
    }
  ): Promise<SMSResponse> {
    const message = `💳 KM MEDIA TRAINING: Installment ${
      installmentDetails.installmentNumber
    }/${
      installmentDetails.totalInstallments
    } reminder. Amount: ₵${installmentDetails.amount.toLocaleString()}, Due: ${new Date(
      installmentDetails.dueDate
    ).toLocaleDateString()} (${
      installmentDetails.daysUntilDue
    } days remaining). Please make payment to stay on track.`;

    return this.sendSMS({
      to: phoneNumber,
      message: message,
    });
  }
}

export const smsService = new SMSService();
export type { SMSMessage, SMSResponse };
