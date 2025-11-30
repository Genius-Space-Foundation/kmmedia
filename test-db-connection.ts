import { prisma } from './src/lib/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    const courseCount = await prisma.course.count();
    console.log(`✅ Found ${courseCount} courses in database`);
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
