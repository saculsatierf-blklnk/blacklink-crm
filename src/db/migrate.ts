import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;

  if (
    !connectionString ||
    connectionString.includes("usuario:senha") ||
    connectionString === "postgresql://"
  ) {
    console.error(
      "ERRO: DATABASE_URL não configurada ou contendo credenciais padrão de exemplo."
    );
    console.error(
      "Defina uma string de conexão válida no arquivo .env antes de executar as migrações."
    );
    process.exit(1);
  }

  console.log(
    "Iniciando aplicação de migrações Drizzle no banco de dados corporativo..."
  );

  // Para execução de migrações DDL, utiliza-se max: 1 para evitar concorrência de locks
  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  const migrationClient = postgres(connectionString, {
    max: 1,
    ssl: isLocal ? false : "require",
  });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrações DDL aplicadas com sucesso no banco de dados!");
  } catch (error) {
    console.error("Falha na execução das migrações:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
