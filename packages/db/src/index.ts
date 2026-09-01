import { PrismaClient } from "@prisma/client";

// Singleton so Next.js hot-reload doesn't spawn many clients.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Re-export generated enums + model types so apps import them from one place:
//   import { prisma, Role, ProblemStatus } from "@repo/db";
export * from "@prisma/client";
