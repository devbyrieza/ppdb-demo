import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.error('CRITICAL ERROR: DATABASE_URL is not defined in process.env at runtime!');
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// --- INTERNAL CRON WORKER ---
// Trigger Whatsapp queue processing every 1 minute automatically without external cron.
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  if (!(globalThis as any).__CRON_STARTED__) {
    if (!process.argv.includes('build') && !process.env.NEXT_PHASE?.includes('build')) {
      (globalThis as any).__CRON_STARTED__ = true;
      console.log("🚀 Starting internal WhatsApp Background Processor...");
      
      // Delay 10 seconds to ensure server is fully bound before first ping
      setTimeout(() => {
        setInterval(() => {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
          fetch(`${baseUrl}/api/cron/whatsapp?secret=ppdb-alimam-cron-2026`, {
              headers: { 'User-Agent': 'Internal-Worker/1.0' }
          }).catch(() => {}); // silent fail if network error
        }, 60000); // Check every 60 seconds
      }, 10000);
    }
  }
}
