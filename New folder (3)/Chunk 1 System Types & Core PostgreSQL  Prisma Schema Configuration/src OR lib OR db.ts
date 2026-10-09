import { PrismaClient } from '@prisma/client';

/**
 * Enterprise Production Database Initialization Wrapper
 * Prevents multiple instantiations of Prisma Client during Next.js Hot Reload cycles.
 */

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query' as const, 'error' as const, 'warn' as const] : ['error' as const],
  errorFormat: 'minimal' as const,
};

export const db = globalThis.globalPrisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalPrisma = db;
}

/**
 * Safe database health verification check executed at boot lifecycle.
 */
export async function verifyDatabaseConnectivity(): Promise<boolean> {
  try {
    await db.\$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('CRITICAL: Database connection layer failure sequence triggered:', error);
    return false;
  }
}
