import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __seneca_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__seneca_prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__seneca_prisma__ = prisma;
}

export type { Prisma } from '@prisma/client';
export * from '@prisma/client';
