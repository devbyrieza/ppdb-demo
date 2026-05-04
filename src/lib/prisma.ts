import { PrismaClient } from "@prisma/client";

/**
 * ─── DATABASE & BACKGROUND WORKER ───
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;
const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton | undefined };

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// WhatsApp Background Worker
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  if (!(globalThis as any).__CRON_STARTED__) {
    if (!process.argv.includes("build") && !process.env.NEXT_PHASE?.includes("build")) {
      (globalThis as any).__CRON_STARTED__ = true;
      console.log("🚀 Background Worker: ACTIVE");
      setTimeout(() => {
        setInterval(() => {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
          fetch(`${baseUrl}/api/cron/whatsapp?secret=ppdb-demo-cron-2026`, {
            headers: { "User-Agent": "Internal-Worker/1.0" },
          }).catch(() => {});
        }, 60000);
      }, 10000);
    }
  }
}
