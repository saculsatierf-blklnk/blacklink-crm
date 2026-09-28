import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DEFAULT_SUPABASE_URL =
  "postgresql://postgres.vtblcaqihlknddadycpr:82283703Lu!@aws-0-us-west-2.pooler.supabase.com:6543/postgres";

const rawConnectionString = process.env.DATABASE_URL || DEFAULT_SUPABASE_URL;

// Detecta se a string de conexão é um placeholder ou se é localhost sem serviço ativo
const isPlaceholder =
  rawConnectionString.includes("host:porta") ||
  rawConnectionString.includes("usuario:senha") ||
  rawConnectionString.includes("localhost:5432/blacklink_crm");

const connectionString =
  !isPlaceholder &&
  (rawConnectionString.startsWith("postgres://") ||
    rawConnectionString.startsWith("postgresql://"))
    ? rawConnectionString
    : DEFAULT_SUPABASE_URL;

/**
 * Cliente singleton para Next.js (App Router / Server Actions / Serverless)
 * Mantém pool seguro e evita prepared statements conflicts em ambientes serverless.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: process.env.DB_MIGRATING ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: connectionString.includes("localhost") ? false : "require",
    prepare: false, // Essencial para compatibilidade com poolers Supavisor/PgBouncer e Serverless
    onnotice: () => {},
  });

globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

export type Database = typeof db;
