import { PrismaClient } from '../generated/prisma';
import { env } from './env';

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined; // eslint-disable-line
}

// Initialize Prisma client
if (env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else if (env.NODE_ENV === 'test') {
  // For test environment, create a real client (it will be mocked in individual tests)
  if (!global.prismaClient) {
    prisma = new PrismaClient();
    global.prismaClient = prisma;
  }
  prisma = global.prismaClient;
} else {
  // Development environment
  if (!global.prismaClient) {
    prisma = new PrismaClient();
    global.prismaClient = prisma;
  }
  prisma = global.prismaClient;
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
