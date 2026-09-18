import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { companies, users } from "./schema";

async function runSeed() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("ERRO: DATABASE_URL não configurada no arquivo .env.");
    process.exit(1);
  }

  console.log("Iniciando processo de seeding corporativo...");

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  const sql = postgres(connectionString, {
    max: 1,
    ssl: isLocal ? false : "require",
  });
  const db = drizzle(sql);

  try {
    // 1. Inserção / Resolução do Tenant "Black Link"
    const [company] = await db
      .insert(companies)
      .values({
        corporateName: "Black Link",
        documentCnpj: "45.123.789/0001-90",
      })
      .onConflictDoUpdate({
        target: companies.documentCnpj,
        set: { corporateName: "Black Link" },
      })
      .returning();

    console.log("------------------------------------------");
    console.log("TENANT_REGISTRADO_COM_SUCESSO");
    console.log(`EMPRESA: ${company.corporateName}`);
    console.log(`COMPANY_ID: ${company.id}`);
    console.log("------------------------------------------");

    // 2. Inserção / Resolução do Usuário Master
    const [user] = await db
      .insert(users)
      .values({
        companyId: company.id,
        fullName: "Lucas de Freitas Leite",
        email: "lucas@blacklink.com.br",
        passwordHash:
          "$2b$12$e8YxP4bH3f5u8K2j6L8M7u0A9Z8X7C6V5B4N3M2Q1W0E9R8T7Y6U",
        role: "admin",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          fullName: "Lucas de Freitas Leite",
          companyId: company.id,
          role: "admin",
        },
      })
      .returning();

    console.log("OPERADOR_REGISTRADO_COM_SUCESSO");
    console.log(`NOME: ${user.fullName}`);
    console.log(`EMAIL: ${user.email}`);
    console.log(`ROLE: ${user.role}`);
    console.log(`USER_ID: ${user.id}`);
    console.log("------------------------------------------");
  } catch (error) {
    console.error("Falha na execução do seed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSeed();
