import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * The database is optional: with no `DATABASE_URL` the app runs in guest mode,
 * keeping pantry, saves and shopping list in local storage. So every consumer
 * goes through `getDb()` and handles `null` rather than assuming a connection
 * exists — that keeps the app deployable to Vercel before a database is
 * provisioned.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);

export function getDb(): PrismaClient | null {
  if (!isDatabaseConfigured()) return null;

  // Reused across hot reloads in development, where each reload would otherwise
  // open a new pool and eventually exhaust Postgres connections.
  globalForPrisma.prisma ??= new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return globalForPrisma.prisma;
}
