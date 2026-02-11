import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Database connection configuration
const databaseConfig: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  // Connection pooling configuration
  transactionOptions: {
    maxWait: 10000, // 10 seconds
    timeout: 30000, // 30 seconds
  },
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(databaseConfig);

// Export as db for backward compatibility
export const db = prisma;

// Handle graceful shutdown
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
