import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma client instance.
 *
 * In development, Next.js hot-reloads modules frequently which would create
 * many PrismaClient instances and exhaust the database connection pool.
 * Caching the client on globalThis prevents this.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** The shared Prisma client instance used across the application. */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
