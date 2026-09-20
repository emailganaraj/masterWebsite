import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const usePglite = process.env.USE_PGLITE === "1";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
  pglite: PGlite | undefined;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 20 : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

function createPglite() {
  const dataDir = process.env.PGLITE_DATA_DIR ?? "./data/pglite";
  return new PGlite(dataDir);
}

if (usePglite) {
  globalForDb.pglite ??= createPglite();
} else {
  globalForDb.pool ??= createPool();
}

export const pool = usePglite ? null : globalForDb.pool!;

export const db = usePglite
  ? drizzlePglite(globalForDb.pglite!, { schema })
  : drizzlePg(globalForDb.pool!, { schema });

export async function closeDb() {
  if (globalForDb.pool) {
    await globalForDb.pool.end();
    globalForDb.pool = undefined;
  }
  if (globalForDb.pglite) {
    await globalForDb.pglite.close();
    globalForDb.pglite = undefined;
  }
}

export type Database = typeof db;
