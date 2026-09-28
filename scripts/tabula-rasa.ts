import "dotenv/config";
import postgres from "postgres";

async function runTabulaRasa() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("ERRO: DATABASE_URL não configurada no arquivo .env.");
    process.exit(1);
  }

  console.log("Iniciando rotina de limpeza estrutural e setup Tabula Rasa...");

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  const sql = postgres(connectionString, {
    max: 1,
    ssl: isLocal ? false : "require",
  });

  try {
    // 1. Garantir extensões e enums necessários
    console.log("Configurando extensões e enums...");
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;
    await sql`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'commercial';`;

    // 2. Limpeza estrutural (Tabula Rasa) respeitando chaves estrangeiras
    console.log("Executando limpeza em cascata das tabelas...");
    await sql`
      DO $$
      BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deal_telemetry_embeddings') THEN
          TRUNCATE TABLE deal_telemetry_embeddings CASCADE;
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_creatives') THEN
          TRUNCATE TABLE social_creatives CASCADE;
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_contents') THEN
          TRUNCATE TABLE social_contents CASCADE;
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
          TRUNCATE TABLE leads CASCADE;
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
          TRUNCATE TABLE users CASCADE;
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
          TRUNCATE TABLE companies CASCADE;
        END IF;
      END $$;
    `;
    console.log("Todas as tabelas foram limpas com sucesso.");

    // 3. Criação do Tenant Principal
    console.log("Criando tenant principal na tabela companies...");
    const [company] = await sql`
      INSERT INTO companies (id, corporate_name, document_cnpj)
      VALUES (
        gen_random_uuid(),
        'Black Link Enterprise',
        '45.123.789/0001-90'
      )
      RETURNING id, corporate_name, document_cnpj;
    `;
    console.log(`Tenant criado: ${company.corporate_name} (ID: ${company.id})`);

    // 4. Criação dos dois perfis com hash pgcrypto (bcrypt)
    console.log("Criando perfis de acesso na tabela users...");

    // Perfil 1: Administrador (adm@blacklink.com)
    const [adminUser] = await sql`
      INSERT INTO users (id, company_id, full_name, email, password_hash, role)
      VALUES (
        gen_random_uuid(),
        ${company.id},
        'Administrador Black Link',
        'adm@blacklink.com',
        crypt('363900', gen_salt('bf', 12)),
        'admin'
      )
      RETURNING id, full_name, email, role;
    `;
    console.log(`Usuário Administrador criado: ${adminUser.email} (Role: ${adminUser.role})`);

    // Perfil 2: Operador Comercial (comercial@blacklink.com)
    const [commercialUser] = await sql`
      INSERT INTO users (id, company_id, full_name, email, password_hash, role)
      VALUES (
        gen_random_uuid(),
        ${company.id},
        'Operador Comercial (Hunter)',
        'comercial@blacklink.com',
        crypt('363900', gen_salt('bf', 12)),
        'commercial'
      )
      RETURNING id, full_name, email, role;
    `;
    console.log(`Usuário Comercial criado: ${commercialUser.email} (Role: ${commercialUser.role})`);

    // 5. Verificação da autenticação criptográfica
    const verifyAdmin = await sql`
      SELECT (password_hash = crypt('363900', password_hash)) as is_valid 
      FROM users WHERE email = 'adm@blacklink.com';
    `;
    const verifyCommercial = await sql`
      SELECT (password_hash = crypt('363900', password_hash)) as is_valid 
      FROM users WHERE email = 'comercial@blacklink.com';
    `;

    console.log("------------------------------------------");
    console.log("TABULA_RASA_CONCLUIDA_COM_SUCESSO");
    console.log(`EMPRESA: ${company.corporate_name} (${company.id})`);
    console.log(`ADMIN: ${adminUser.email} - Senha validada: ${verifyAdmin[0].is_valid}`);
    console.log(`COMERCIAL: ${commercialUser.email} - Senha validada: ${verifyCommercial[0].is_valid}`);
    console.log("------------------------------------------");
  } catch (error) {
    console.error("Falha ao executar rotina Tabula Rasa:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runTabulaRasa();
