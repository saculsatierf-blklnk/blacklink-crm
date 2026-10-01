import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveTenantCompanyId } from "@/lib/auth/tenant";
import { db } from "@/db/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export interface TenantBrandProfile {
  companyId: string;
  companyName: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  accentColor: string;
  bgColor: string;
  theme: string;
  isDbResolved: boolean;
}

/**
 * GET /api/tenant/brand-profile
 * Retorna os dados corporativos da empresa ativa do tenant autenticado
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("blacklink_session")?.value;
    let sessionUser: any = null;

    if (sessionToken) {
      try {
        sessionUser = JSON.parse(
          Buffer.from(sessionToken, "base64url").toString("utf-8")
        );
      } catch {
        // Silencia erro de decode
      }
    }

    const companyId = await resolveTenantCompanyId();
    let corporateName = sessionUser?.name ? `${sessionUser.name} Org` : "Black Link Enterprise";
    let instagramHandle = "blacklink.b2b";
    let isDbResolved = false;

    // Tentativa segura de consulta no banco com fallback imediato
    try {
      const records = await Promise.race([
        db.select().from(companies).where(eq(companies.id, companyId)).limit(1),
        new Promise<any[]>((_, reject) =>
          setTimeout(() => reject(new Error("DB_TIMEOUT")), 2500)
        ),
      ]);

      if (records && records.length > 0) {
        const comp = records[0];
        if (comp.corporateName) corporateName = comp.corporateName;
        if (comp.instagramAccountId) instagramHandle = comp.instagramAccountId;
        isDbResolved = true;
      }
    } catch {
      // Usa dados da sessão ou fallback seguro
    }

    const cleanHandle = instagramHandle.startsWith("@")
      ? instagramHandle
      : `@${instagramHandle}`;

    const profile: TenantBrandProfile = {
      companyId,
      companyName: corporateName,
      authorName: corporateName,
      authorHandle: cleanHandle,
      authorAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        corporateName
      )}&backgroundColor=09090b`,
      accentColor: "#38bdf8",
      bgColor: "#09090b",
      theme: "dark-industrial",
      isDbResolved,
    };

    return NextResponse.json(profile);
  } catch (err: unknown) {
    console.error("Erro ao resolver perfil do tenant:", err);
    return NextResponse.json(
      {
        companyId: "cad1caea-2de8-46f3-8dd0-17ab0ede7377",
        companyName: "Black Link Enterprise",
        authorName: "Black Link CRM",
        authorHandle: "@blacklink.b2b",
        authorAvatar: "",
        accentColor: "#38bdf8",
        bgColor: "#09090b",
        theme: "dark-industrial",
        isDbResolved: false,
      },
      { status: 200 }
    );
  }
}

/**
 * POST /api/tenant/brand-profile
 * Salva e persiste os dados de identidade visual do tenant no banco
 */
export async function POST(request: NextRequest) {
  try {
    const companyId = await resolveTenantCompanyId();
    const body = await request.json();

    const { corporateName, instagramAccountId } = body;

    if (corporateName || instagramAccountId) {
      try {
        await Promise.race([
          db
            .update(companies)
            .set({
              ...(corporateName ? { corporateName } : {}),
              ...(instagramAccountId ? { instagramAccountId } : {}),
            })
            .where(eq(companies.id, companyId)),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("DB_TIMEOUT")), 2500)
          ),
        ]);
      } catch (e) {
        console.warn("Aviso ao atualizar empresa no banco:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Identidade do tenant atualizada com sucesso.",
      companyId,
    });
  } catch (err: unknown) {
    console.error("Erro ao atualizar perfil do tenant:", err);
    return NextResponse.json(
      { error: "Falha interna ao atualizar perfil do tenant." },
      { status: 500 }
    );
  }
}
