
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Verifying RLS Policies...')
  
  try {
    // Check if RLS is enabled on users table
    const rlsStatus = await prisma.$queryRaw`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE tablename = 'users' AND schemaname = 'public';
    `
    console.log('RLS Status:', rlsStatus)
    
    // Count policies
    const policyCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM pg_policies WHERE schemaname = 'public';
    `
    console.log('Total Policies:', policyCount)

    // Check helper functions
    console.log('Helper functions check skipped (requires authenticated context)')
    
  } catch (e) {
    console.error('Verification failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
