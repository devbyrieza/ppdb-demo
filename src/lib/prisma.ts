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
