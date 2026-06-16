// Re-export the shared Prisma client so Server Components can call it
// directly per spec §4.1. No API routes for reads; mutations via Server
// Actions.
export { prisma } from '@seneca/db';
export type * from '@seneca/db';
