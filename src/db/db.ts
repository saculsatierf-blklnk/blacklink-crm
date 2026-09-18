import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const rawConnectionString = process.env.DATABASE_URL || "";

// Detecta se a string de conexão é um placeholder com parâmetros literais como "host:porta"
const isPlaceholder =
  rawConnectionString.includes("host:porta") ||
  rawConnectionString.includes("usuario:senha");

const connectionString =
  !isPlaceholder &&
  (rawConnectionString.startsWith("postgres://") ||
    rawConnectionString.startsWith("postgresql://"))
    ? rawConnectionString
    : "postgres://postgres:postgres@localhost:5432/blacklink_crm";

/**
 * Cliente singleton para Next.js (App Router / Server Actions / Hot Reload)
 * Evita o esgotamento do pool de conexões durante o ciclo de desenvolvimento.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: process.env.DB_MIGRATING ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: connectionString.includes("localhost") ? false : "require",
    onnotice: () => {},
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });

export type Database = typeof db;
