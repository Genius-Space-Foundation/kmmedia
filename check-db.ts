import { prisma } from "./src/lib/db";

async function main() {
  try {
    console.log("Checking database connection...");
    await prisma.$connect();
    console.log("Connected!");

    console.log("Checking Attendance table...");
    try {
      const count = await (prisma as any).attendance.count();
      console.log(`Attendance table exists. Count: ${count}`);
    } catch (e: any) {
      console.log("Attendance table does NOT exist or is inaccessible.");
      console.error(e.message);
    }

    console.log("Checking Enrollment table...");
    const enrollmentCount = await prisma.enrollment.count();
    console.log(`Enrollment table exists. Count: ${enrollmentCount}`);

  } catch (error: any) {
    console.error("Database connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
