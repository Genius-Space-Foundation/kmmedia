import { prisma } from "../db";
import { PaymentType, PaymentStatus } from "@prisma/client";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || "";

export interface PaystackPaymentData {
  email: string;
  amount: number; // in pesewas (Ghanaian currency)
  reference: string;
  metadata?: Record<string, any>;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: any;
    fees: number;
    fees_split: any;
    authorization: any;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
      international_format_phone: string;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

// Initialize payment with Paystack
export async function initializePayment(
  paymentData: PaystackPaymentData
): Promise<PaystackResponse> {
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: paymentData.email,
        amount: paymentData.amount,
        reference: paymentData.reference,
        metadata: paymentData.metadata,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

// Verify payment with Paystack
export async function verifyPayment(
  reference: string
): Promise<PaystackVerificationResponse> {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

// Create payment record in database
export async function createPaymentRecord(data: {
  userId: string;
  type: PaymentType;
  amount: number;
  reference: string;
  applicationId?: string;
  enrollmentId?: string;
  dueDate?: Date;
}) {
  return prisma.payment.create({
    data: {
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      reference: data.reference,
      status: PaymentStatus.PENDING,
      applicationId: data.applicationId,
      enrollmentId: data.enrollmentId,
      dueDate: data.dueDate,
    },
  });
}

// Update payment status
export async function updatePaymentStatus(
  reference: string,
  status: PaymentStatus,
  metadata?: any
) {
  return prisma.payment.update({
    where: { reference },
    data: {
      status,
      paidAt: status === PaymentStatus.COMPLETED ? new Date() : null,
      metadata,
    },
  });
}

// Generate unique payment reference
export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `KM_${timestamp}_${random}`.toUpperCase();
}

// Convert amount to pesewas (Paystack expects amount in pesewas)
export function convertToKobo(amount: number): number {
  return Math.round(amount * 100);
}

// Convert amount from pesewas to cedis
export function convertFromKobo(amount: number): number {
  return amount / 100;
}
