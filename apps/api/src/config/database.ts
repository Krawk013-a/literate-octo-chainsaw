import { PrismaClient } from '@prisma/client';
import { env } from './env';

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined; // eslint-disable-line
}

// Initialize Prisma client only in production or when DATABASE_URL is set
if (env.NODE_ENV === 'production' || (process.env.DATABASE_URL && env.NODE_ENV !== 'test')) {
  prisma = new PrismaClient();
} else if (env.NODE_ENV !== 'test') {
  if (!global.prismaClient) {
    prisma = new PrismaClient();
    global.prismaClient = prisma;
  }
  prisma = global.prismaClient;
} else {
  // For test environment without DATABASE_URL, create a dummy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma = null as any;
}

export { prisma };

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
