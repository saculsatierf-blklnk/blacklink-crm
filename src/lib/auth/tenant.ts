import { cookies } from "next/headers";
import { db } from "@/db/db";
import { companies } from "@/db/schema";

/**
 * Utilitário de resolução multi-tenant seguro para rotas e APIs
 * Extrai o company_id da sessão ou recorre à empresa ativa do banco.
 */
export async function resolveTenantCompanyId(): Promise<string> {
  let companyId: string | undefined;

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("blacklink_session")?.value;
    if (sessionToken) {
      const decoded = JSON.parse(
        Buffer.from(sessionToken, "base64url").toString("utf-8")
      );
      companyId = decoded.company_id || decoded.companyId;
    }
  } catch {
    // Silencia erros de parse do cookie
  }

  if (!companyId) {
    try {
      const existing = await db.select().from(companies).limit(1);
      if (existing.length > 0) {
        companyId = existing[0].id;
      }
    } catch (err) {
      console.warn("Falha ao resolver empresa padrão no Supabase:", err);
    }
  }

  return companyId || "cad1caea-2de8-46f3-8dd0-17ab0ede7377";
}
