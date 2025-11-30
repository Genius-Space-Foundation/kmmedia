
import { prisma } from "./src/lib/db";

async function main() {
  try {
    console.log("Connecting to DB...");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    console.log("DB Connection Successful");
  } catch (error) {
    console.error("DB Connection Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
