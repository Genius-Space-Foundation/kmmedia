/**
 * Environment Variables Verification Script
 * 
 * This script checks if all required environment variables are set
 * without exposing their actual values.
 * 
 * Usage: npx tsx scripts/verify-env.ts
 */

// Load environment variables from .env and .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env first
config({ path: resolve(process.cwd(), '.env') });
// Then load .env.local (will override .env values)
config({ path: resolve(process.cwd(), '.env.local') });

interface EnvVariable {
  name: string;
  required: boolean;
  category: string;
  description: string;
}

const envVariables: EnvVariable[] = [
  // Database
  {
    name: 'DATABASE_URL',
    required: true,
    category: 'Database',
    description: 'PostgreSQL connection string',
  },

  // Authentication (JWT)
  {
    name: 'JWT_SECRET',
    required: true,
    category: 'Authentication',
    description: 'Secret key for signing access tokens',
  },
  {
    name: 'JWT_REFRESH_SECRET',
    required: true,
    category: 'Authentication',
    description: 'Secret key for signing refresh tokens',
  },
  {
    name: 'JWT_EXPIRES_IN',
    required: false,
    category: 'Authentication',
    description: 'Access token expiration time (default: 15m)',
  },
  {
    name: 'JWT_REFRESH_EXPIRES_IN',
    required: false,
    category: 'Authentication',
    description: 'Refresh token expiration time (default: 7d)',
  },

  // Payment (Paystack)
  {
    name: 'PAYSTACK_SECRET_KEY',
    required: true,
    category: 'Payment',
    description: 'Paystack secret key for server-side operations',
  },
  {
    name: 'PAYSTACK_PUBLIC_KEY',
    required: true,
    category: 'Payment',
    description: 'Paystack public key',
  },
  {
    name: 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
    required: true,
    category: 'Payment',
    description: 'Paystack public key for client-side (must match PAYSTACK_PUBLIC_KEY)',
  },

  // Email (Optional for development)
  {
    name: 'EMAIL_HOST',
    required: false,
    category: 'Email',
    description: 'SMTP host (e.g., smtp.gmail.com)',
  },
  {
    name: 'EMAIL_PORT',
    required: false,
    category: 'Email',
    description: 'SMTP port (e.g., 587)',
  },
  {
    name: 'EMAIL_USER',
    required: false,
    category: 'Email',
    description: 'SMTP username/email',
  },
  {
    name: 'EMAIL_PASSWORD',
    required: false,
    category: 'Email',
    description: 'SMTP password or app password',
  },
  {
    name: 'EMAIL_FROM',
    required: false,
    category: 'Email',
    description: 'From email address',
  },

  // File Upload (Cloudinary)
  {
    name: 'CLOUDINARY_CLOUD_NAME',
    required: true,
    category: 'File Upload',
    description: 'Cloudinary cloud name',
  },
  {
    name: 'CLOUDINARY_API_KEY',
    required: true,
    category: 'File Upload',
    description: 'Cloudinary API key',
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    required: true,
    category: 'File Upload',
    description: 'Cloudinary API secret',
  },

  // Application
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    category: 'Application',
    description: 'Application URL (e.g., http://localhost:3000)',
  },
  {
    name: 'NODE_ENV',
    required: false,
    category: 'Application',
    description: 'Environment (development/production)',
  },

  // Security (Optional)
  {
    name: 'RATE_LIMIT_WINDOW',
    required: false,
    category: 'Security',
    description: 'Rate limit window in minutes (default: 15)',
  },
  {
    name: 'RATE_LIMIT_MAX',
    required: false,
    category: 'Security',
    description: 'Max requests per window (default: 100)',
  },
  {
    name: 'CRON_SECRET',
    required: false,
    category: 'Security',
    description: 'Secret for authenticating cron jobs',
  },
];

interface VerificationResult {
  category: string;
  variable: string;
  status: 'SET' | 'MISSING' | 'EMPTY';
  required: boolean;
  description: string;
  valuePreview?: string;
}

function checkEnvironmentVariables(): VerificationResult[] {
  const results: VerificationResult[] = [];

  envVariables.forEach((envVar) => {
    const value = process.env[envVar.name];
    let status: 'SET' | 'MISSING' | 'EMPTY';
    let valuePreview: string | undefined;

    if (value === undefined) {
      status = 'MISSING';
    } else if (value.trim() === '') {
      status = 'EMPTY';
    } else {
      status = 'SET';
      // Show first 3 and last 3 characters for verification (not for secrets)
      if (value.length > 10 && !envVar.name.includes('SECRET') && !envVar.name.includes('PASSWORD')) {
        valuePreview = `${value.substring(0, 3)}...${value.substring(value.length - 3)}`;
      } else if (!envVar.name.includes('SECRET') && !envVar.name.includes('PASSWORD')) {
        valuePreview = value.length > 20 ? `${value.substring(0, 20)}...` : value;
      } else {
        valuePreview = `***${value.length} chars***`;
      }
    }

    results.push({
      category: envVar.category,
      variable: envVar.name,
      status,
      required: envVar.required,
      description: envVar.description,
      valuePreview,
    });
  });

  return results;
}

function printResults(results: VerificationResult[]) {
  console.log('\n🔍 Environment Variables Verification\n');
  console.log('='.repeat(80));

  // Group by category
  const categories = [...new Set(results.map((r) => r.category))];

  categories.forEach((category) => {
    const categoryResults = results.filter((r) => r.category === category);
    
    console.log(`\n📁 ${category}`);
    console.log('-'.repeat(80));

    categoryResults.forEach((result) => {
      const icon = result.status === 'SET' ? '✅' : result.required ? '❌' : '⚠️';
      const statusText = result.status === 'SET' ? 'SET' : result.status === 'MISSING' ? 'MISSING' : 'EMPTY';
      const requiredText = result.required ? '(Required)' : '(Optional)';
      
      console.log(`${icon} ${result.variable.padEnd(35)} ${statusText.padEnd(10)} ${requiredText}`);
      
      if (result.status === 'SET' && result.valuePreview) {
        console.log(`   └─ Value: ${result.valuePreview}`);
      }
      
      if (result.status !== 'SET') {
        console.log(`   └─ ${result.description}`);
      }
    });
  });

  console.log('\n' + '='.repeat(80));
}

function printSummary(results: VerificationResult[]) {
  const totalRequired = results.filter((r) => r.required).length;
  const setRequired = results.filter((r) => r.required && r.status === 'SET').length;
  const missingRequired = results.filter((r) => r.required && r.status !== 'SET');
  
  const totalOptional = results.filter((r) => !r.required).length;
  const setOptional = results.filter((r) => !r.required && r.status === 'SET').length;

  console.log('\n📊 Summary\n');
  console.log(`Required Variables: ${setRequired}/${totalRequired} set`);
  console.log(`Optional Variables: ${setOptional}/${totalOptional} set`);

  if (missingRequired.length > 0) {
    console.log('\n❌ Missing Required Variables:');
    missingRequired.forEach((result) => {
      console.log(`   - ${result.variable}: ${result.description}`);
    });
    console.log('\n⚠️  Application may not function correctly without these variables!');
  } else {
    console.log('\n✅ All required environment variables are set!');
  }

  // Special checks
  console.log('\n🔍 Special Checks:');
  
  // Check if Paystack keys match
  const paystackPublic = process.env.PAYSTACK_PUBLIC_KEY;
  const nextPublicPaystack = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  
  if (paystackPublic && nextPublicPaystack) {
    if (paystackPublic === nextPublicPaystack) {
      console.log('   ✅ Paystack public keys match');
    } else {
      console.log('   ❌ Paystack public keys DO NOT match!');
      console.log('      PAYSTACK_PUBLIC_KEY and NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY should be identical');
    }
  }

  // Check email configuration completeness
  const emailVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
  const emailSet = emailVars.filter((v) => process.env[v]).length;
  
  if (emailSet > 0 && emailSet < emailVars.length) {
    console.log('   ⚠️  Email configuration incomplete');
    console.log('      Set all email variables or none for email functionality to work');
  } else if (emailSet === emailVars.length) {
    console.log('   ✅ Email configuration complete');
  } else {
    console.log('   ℹ️  Email not configured (optional for development)');
  }

  // Check environment
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`   ℹ️  Running in ${nodeEnv} mode`);

  console.log('\n' + '='.repeat(80));
}

function generateEnvTemplate() {
  console.log('\n📝 .env Template\n');
  console.log('Copy this template to your .env file and fill in the values:\n');
  console.log('# ' + '='.repeat(78));
  
  const categories = [...new Set(envVariables.map((v) => v.category))];
  
  categories.forEach((category) => {
    console.log(`\n# ${category}`);
    const categoryVars = envVariables.filter((v) => v.category === category);
    
    categoryVars.forEach((envVar) => {
      console.log(`# ${envVar.description}`);
      if (envVar.required) {
        console.log(`${envVar.name}=`);
      } else {
        console.log(`# ${envVar.name}=`);
      }
    });
  });
  
  console.log('\n# ' + '='.repeat(78));
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--template')) {
    generateEnvTemplate();
    return;
  }

  const results = checkEnvironmentVariables();
  printResults(results);
  printSummary(results);

  const missingRequired = results.filter((r) => r.required && r.status !== 'SET');
  
  if (missingRequired.length > 0) {
    console.log('\n💡 Tip: Run with --template flag to generate a .env template');
    process.exit(1);
  } else {
    console.log('\n🎉 Environment configuration looks good!');
    process.exit(0);
  }
}

main();
