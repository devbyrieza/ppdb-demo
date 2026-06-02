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

// WhatsApp Background Worker (In-Process)
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  if (!(globalThis as any).__CRON_STARTED__) {
    if (!process.argv.includes("build") && !process.env.NEXT_PHASE?.includes("build")) {
      (globalThis as any).__CRON_STARTED__ = true;
      console.log("🚀 WhatsApp Background Worker: ACTIVE (In-Process)");
      setTimeout(() => {
        setInterval(async () => {
          try {
            const { processWhatsappQueue } = await import("./whatsapp-queue");
            await processWhatsappQueue();
          } catch (err) {
            console.error("❌ Background Worker Error:", err);
          }
        }, 60000);
      }, 10000);
    }
  }
}
