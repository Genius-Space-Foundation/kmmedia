/**
 * Email Delivery Test Script
 * 
 * This script tests the email notification system by:
 * 1. Checking email configuration
 * 2. Testing individual email templates
 * 3. Logging results for verification
 * 
 * Usage: npx tsx scripts/test-email-delivery.ts
 */

import { sendEmail, emailTemplates } from '../src/lib/notifications/email';

// Test configuration
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

interface TestResult {
  template: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

const results: TestResult[] = [];

async function testEmailTemplate(
  templateName: string,
  emailData: any
): Promise<TestResult> {
  console.log(`\n📧 Testing ${templateName}...`);
  
  try {
    const result = await sendEmail(emailData);
    
    if (result.success) {
      console.log(`✅ ${templateName} sent successfully!`);
      console.log(`   Message ID: ${result.messageId}`);
      return {
        template: templateName,
        success: true,
        messageId: result.messageId,
      };
    } else {
      console.log(`❌ ${templateName} failed: ${result.error}`);
      return {
        template: templateName,
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`❌ ${templateName} threw error: ${errorMessage}`);
    return {
      template: templateName,
      success: false,
      error: errorMessage,
    };
  }
}

async function runTests() {
  console.log('🚀 Starting Email Delivery Tests');
  console.log(`📬 Test email address: ${TEST_EMAIL}`);
  console.log('=' .repeat(60));

  // Test 1: Welcome Email
  results.push(
    await testEmailTemplate('Welcome Email', {
      to: TEST_EMAIL,
      ...emailTemplates.welcome({
        userName: 'Test User',
        loginUrl: 'http://localhost:3000/auth/login',
      }),
    })
  );

  // Test 2: Payment Confirmation
  results.push(
    await testEmailTemplate('Payment Confirmation', {
      to: TEST_EMAIL,
      ...emailTemplates.paymentConfirmation({
        studentName: 'Test Student',
        amount: 5000,
        courseName: 'Test Course',
        paymentReference: 'TEST-REF-123',
        paymentDate: new Date().toISOString(),
      }),
    })
  );

  // Test 3: Enrollment Confirmation
  results.push(
    await testEmailTemplate('Enrollment Confirmation', {
      to: TEST_EMAIL,
      ...emailTemplates.enrollmentConfirmation({
        studentName: 'Test Student',
        courseName: 'Test Course',
        courseUrl: 'http://localhost:3000/courses/test-course',
        startDate: new Date().toISOString(),
      }),
    })
  );

  // Test 4: Application Approved
  results.push(
    await testEmailTemplate('Application Approved', {
      to: TEST_EMAIL,
      ...emailTemplates.applicationApproved({
        studentName: 'Test Student',
        courseName: 'Test Course',
        instructorName: 'Test Instructor',
      }),
    })
  );

  // Test 5: Password Reset
  results.push(
    await testEmailTemplate('Password Reset', {
      to: TEST_EMAIL,
      ...emailTemplates.passwordReset({
        userName: 'Test User',
        resetUrl: 'http://localhost:3000/auth/reset-password?token=test-token',
      }),
    })
  );

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.template}: ${r.error}`);
      });
  }

  console.log('\n💡 Note: Check your email logs or inbox to verify delivery.');
  console.log('   If using SMTP, check server logs for email sending confirmation.');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Check environment variables
function checkConfig() {
  console.log('🔍 Checking Email Configuration...\n');
  
  const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
  ];

  const missing: string[] = [];
  
  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
      console.log(`❌ ${varName}: Not set`);
    } else {
      // Mask sensitive values
      const displayValue = varName.includes('PASSWORD') 
        ? '***' 
        : value.length > 20 
        ? value.substring(0, 20) + '...' 
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  });

  console.log('');

  if (missing.length > 0) {
    console.log('⚠️  Warning: Missing environment variables:');
    missing.forEach((v) => console.log(`   - ${v}`));
    console.log('\n💡 Email sending may fail without proper configuration.');
    console.log('   Set these in your .env.local file.\n');
  }

  return missing.length === 0;
}

// Main execution
async function main() {
  const configOk = checkConfig();
  
  if (!configOk) {
    console.log('⚠️  Proceeding with tests despite missing configuration...\n');
  }

  await runTests();
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
