import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { companies, users } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Callback oficial do Google OAuth: recebe o código do Google, valida o perfil,
 * inicializa/conecta o usuário no banco de dados e fecha o pop-up com sucesso.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";
  const isHttps =
    request.headers.get("x-forwarded-proto") === "https" ||
    !host.includes("localhost");
  const scheme = isHttps ? "https" : "http";
  const baseUrl = `${scheme}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (error || !code) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Erro no Login</title></head>
        <body style="background: #030303; color: #E5E4E2; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: '${error || "Autorização cancelada ou código não fornecido pelo Google."}'
            }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Erro de Configuração</title></head>
        <body style="background: #030303; color: #E5E4E2; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Credenciais GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configuradas no servidor.'
            }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  try {
    // 1. Troca o código de autorização pelo token de acesso do Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Erro na troca de token Google:", tokenData);
      return new Response(
        `<!DOCTYPE html>
        <html>
          <body style="background: #030303; color: #E5E4E2;">
            <script>
              window.opener?.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Falha na comunicação com o servidor Google OAuth.'
              }, '*');
              window.close();
            </script>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // 2. Busca os dados reais do perfil (e-mail verificado, nome e foto)
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userinfoResponse.json();
    if (!googleUser?.email) {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <body style="background: #030303; color: #E5E4E2;">
            <script>
              window.opener?.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Não foi possível recuperar o e-mail da sua conta Google.'
              }, '*');
              window.close();
            </script>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const cleanEmail = String(googleUser.email).toLowerCase().trim();
    const googleName = googleUser.name || "Operador Google";

    // 3. Verifica se o usuário já existe na base corporativa
    const existingUsers = await db
      .select({
        id: users.id,
        companyId: users.companyId,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(sql`LOWER(${users.email}) = ${cleanEmail}`)
      .limit(1);

    let sessionPayload: {
      id: string;
      company_id: string;
      role: "admin" | "commercial";
      name: string;
      email: string;
      createdAt: string;
    };

    if (existingUsers.length > 0) {
      const dbUser = existingUsers[0];
      sessionPayload = {
        id: dbUser.id,
        company_id: dbUser.companyId,
        role: (dbUser.role as "admin" | "commercial") || "admin",
        name: dbUser.fullName,
        email: dbUser.email,
        createdAt: new Date().toISOString(),
      };
    } else {
      // Cria a organização raiz e o primeiro Administrador automaticamente via Google
      const [newCompany] = await db
        .insert(companies)
        .values({
          corporateName: `Black Link • ${googleName.split(" ")[0]}`,
        })
        .returning({ id: companies.id });

      const insertRes = await db.execute(
        sql`
          INSERT INTO users (company_id, full_name, email, password_hash, role)
          VALUES (
            ${newCompany.id}::uuid,
            ${googleName},
            ${cleanEmail},
            crypt('google-oauth-auth', gen_salt('bf')),
            'admin'
          )
          RETURNING id, full_name, email, role, company_id;
        `
      );

      const newUser = insertRes[0];
      sessionPayload = {
        id: String(newUser.id),
        company_id: String(newCompany.id),
        role: "admin",
        name: googleName,
        email: cleanEmail,
        createdAt: new Date().toISOString(),
      };
    }

    // 4. Configura cookie de sessão corporativa
    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString("base64url");
    const cookieStore = await cookies();
    cookieStore.set("blacklink_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    const destination = sessionPayload.role === "commercial" ? "/leads" : "/";

    // 5. Retorna script para notificar a janela pai e fechar o pop-up
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Autenticado</title></head>
        <body style="background: #030303; color: #E5E4E2; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center;">
            <p style="font-size: 14px; font-weight: bold;">Autenticado com Sucesso!</p>
            <p style="font-size: 12px; color: #71717A;">Redirecionando para o Black Link CRM...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                user: ${JSON.stringify(sessionPayload)},
                destination: '${destination}'
              }, '*');
              window.close();
            } else {
              window.location.href = '${destination}';
            }
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err: unknown) {
    console.error("Erro interno no callback Google OAuth:", err);
    return new Response(
      `<!DOCTYPE html>
      <html>
        <body style="background: #030303; color: #E5E4E2;">
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Erro interno ao validar dados da conta Google.'
            }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
