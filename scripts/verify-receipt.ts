import { generateReceiptForPayment } from "../src/lib/payments/receipt-generator";
import { Buffer } from "buffer";

async function verifyReceiptGeneration() {
  console.log("Starting Receipt Generation Verification...");

  try {
    // Mock data matching the structure expected by generateReceiptForPayment
    const mockPayment = {
      id: "pay_123456",
      amount: 500.0,
      paymentMethod: "PAYSTACK", // This is the critical field that was missing
      createdAt: new Date(),
      reference: "ref_123456",
      type: "TUITION",
    };

    const mockStudent = {
      name: "Test Student",
      email: "test@example.com",
    };

    const mockCourse = {
      title: "Test Course",
    };

    console.log("Testing with valid payment data...");
    const buffer = await generateReceiptForPayment(
      mockPayment,
      mockStudent,
      mockCourse
    );

    if (Buffer.isBuffer(buffer) && buffer.length > 0) {
      console.log("✅ SUCCESS: Receipt PDF generated successfully.");
      console.log(`   PDF Size: ${buffer.length} bytes`);
    } else {
      console.error("❌ FAILED: Generator returned invalid data (not a buffer or empty).");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ FAILED: Error during receipt generation:", error);
    process.exit(1);
  }
}

verifyReceiptGeneration();
