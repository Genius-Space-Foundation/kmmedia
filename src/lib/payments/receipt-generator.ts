import PDFDocument from "pdfkit";
import { formatCurrency } from "@/lib/currency";

export interface ReceiptData {
  receiptNumber: string;
  paymentId: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  description: string;
  transactionReference?: string;
  courseName?: string;
  installmentNumber?: number;
  totalInstallments?: number;
}

/**
 * Generate receipt number
 */
export function generateReceiptNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `RCP-${timestamp}-${random}`;
}

/**
 * Format date
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Generate PDF receipt as Buffer
 */
export async function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("KM MEDIA TRAINING INSTITUTE", { align: "center" })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Learn Today, Lead Tomorrow", { align: "center" })
        .moveDown(0.3);

      doc
        .fontSize(9)
        .text("Email: info@kmmedia.ng | Phone: +234 XXX XXX XXXX", {
          align: "center",
        })
        .moveDown(2);

      // Receipt title
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("PAYMENT RECEIPT", { align: "center" })
        .moveDown(1.5);

      // Receipt details box
      const startY = doc.y;
      doc
        .rect(50, startY, doc.page.width - 100, 0)
        .stroke("#333333")
        .moveDown(0.5);

      // Receipt info
      doc.fontSize(10).font("Helvetica");

      const leftColumn = 70;
      const rightColumn = 320;
      let currentY = startY + 20;

      // Receipt Number
      doc.text("Receipt Number:", leftColumn, currentY, { continued: true });
      doc.font("Helvetica-Bold").text(data.receiptNumber, { align: "left" });
      currentY += 20;

      // Payment Date
      doc.font("Helvetica").text("Payment Date:", leftColumn, currentY, {
        continued: true,
      });
      doc
        .font("Helvetica-Bold")
        .text(formatDate(data.paymentDate), { align: "left" });
      currentY += 20;

      // Transaction Reference
      if (data.transactionReference) {
        doc.font("Helvetica").text("Transaction Ref:", leftColumn, currentY, {
          continued: true,
        });
        doc
          .font("Helvetica-Bold")
          .text(data.transactionReference, { align: "left" });
        currentY += 20;
      }

      currentY += 10;
      doc.moveDown(1);

      // Student Information
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Student Information", leftColumn, currentY)
        .moveDown(0.5);
      currentY = doc.y;

      doc.fontSize(10).font("Helvetica");
      doc.text("Name:", leftColumn, currentY, { continued: true });
      doc.font("Helvetica-Bold").text(data.studentName, { align: "left" });
      currentY += 20;

      doc.font("Helvetica").text("Email:", leftColumn, currentY, {
        continued: true,
      });
      doc.font("Helvetica-Bold").text(data.studentEmail, { align: "left" });
      currentY += 30;

      // Payment Details
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Payment Details", leftColumn, currentY)
        .moveDown(0.5);
      currentY = doc.y;

      doc.fontSize(10).font("Helvetica");
      doc.text("Description:", leftColumn, currentY, { continued: true });
      doc.font("Helvetica-Bold").text(data.description, { align: "left" });
      currentY += 20;

      if (data.courseName) {
        doc.font("Helvetica").text("Course:", leftColumn, currentY, {
          continued: true,
        });
        doc.font("Helvetica-Bold").text(data.courseName, { align: "left" });
        currentY += 20;
      }

      if (data.installmentNumber && data.totalInstallments) {
        doc.font("Helvetica").text("Installment:", leftColumn, currentY, {
          continued: true,
        });
        doc
          .font("Helvetica-Bold")
          .text(`${data.installmentNumber} of ${data.totalInstallments}`, {
            align: "left",
          });
        currentY += 20;
      }

      doc.font("Helvetica").text("Payment Method:", leftColumn, currentY, {
        continued: true,
      });
      doc.font("Helvetica-Bold").text(data.paymentMethod, { align: "left" });
      currentY += 40;

      // Amount box
      doc
        .rect(50, currentY, doc.page.width - 100, 60)
        .fillAndStroke("#f0f0f0", "#333333");

      doc.fillColor("#000000");
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Amount Paid", leftColumn, currentY + 15);
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(formatCurrency(data.amount), leftColumn, currentY + 35);

      currentY += 80;

      // Footer
      const footerY = doc.page.height - 120;
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "This is an automatically generated receipt. No signature required.",
          50,
          footerY,
          {
            align: "center",
            width: doc.page.width - 100,
          }
        );

      doc
        .fontSize(8)
        .text(
          "For inquiries, contact support@kmmedia.ng or call +234 XXX XXX XXXX",
          50,
          footerY + 20,
          {
            align: "center",
            width: doc.page.width - 100,
          }
        );

      doc
        .fontSize(7)
        .fillColor("#666666")
        .text(`Generated on ${formatDate(new Date())}`, 50, footerY + 40, {
          align: "center",
          width: doc.page.width - 100,
        });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate receipt for payment (Helper)
 */
export async function generateReceiptForPayment(
  payment: {
    id: string;
    amount: number;
    paymentMethod: string;
    createdAt: Date;
    reference?: string;
    type: string;
  },
  student: {
    name: string;
    email: string;
  },
  course?: {
    title: string;
  },
  installment?: {
    installmentNumber: number;
    totalInstallments: number;
  }
): Promise<Buffer> {
  const receiptNumber = generateReceiptNumber();

  const receiptData: ReceiptData = {
    receiptNumber,
    paymentId: payment.id,
    studentName: student.name,
    studentEmail: student.email,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.createdAt,
    description: payment.type.replace(/_/g, " "),
    transactionReference: payment.reference,
    courseName: course?.title,
    installmentNumber: installment?.installmentNumber,
    totalInstallments: installment?.totalInstallments,
  };

  return generateReceiptPdf(receiptData);
}
