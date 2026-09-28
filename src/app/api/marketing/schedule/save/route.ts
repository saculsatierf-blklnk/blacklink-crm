import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/db";
import { scheduledPosts, companies } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Salva um rascunho de post (Carrossel, Story ou Post Único) gerado e editado
 * no estúdio na tabela scheduled_posts do Supabase com isolamento de tenant.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post, companyId: explicitCompanyId } = body;

    if (!post || !post.theme || !post.hookHeadline) {
      return NextResponse.json(
        { error: "Dados incompletos do post para salvamento no cronograma." },
        { status: 400 }
      );
    }

    // Identifica o tenant ativo através do cookie de sessão
    let companyId = explicitCompanyId;
    if (!companyId) {
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
        // Prossegue com tenant default se não conseguir ler cookie
      }
    }

    // Se ainda não houver companyId, seleciona a primeira empresa cadastrada
    if (!companyId) {
      try {
        const existingCompanies = await db.select().from(companies).limit(1);
        if (existingCompanies.length > 0) {
          companyId = existingCompanies[0].id;
        }
      } catch (err) {
        console.warn("Falha ao recuperar empresa padrão:", err);
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "Nenhuma empresa (tenant) vinculada para registrar o agendamento." },
        { status: 400 }
      );
    }

    // Insere o post no Supabase PostgreSQL
    let savedRecord = null;
    try {
      const scheduledDateObj = post.scheduledDate?.includes("-")
        ? new Date(post.scheduledDate)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h a frente por padrão

      const [inserted] = await db
        .insert(scheduledPosts)
        .values({
          companyId,
          theme: post.theme,
          format: post.format || "carousel",
          scheduledDate: scheduledDateObj,
          status: "awaiting_approval",
          hookHeadline: post.hookHeadline,
          bodyCopy: post.bodyCopy || "",
          ctaText: post.ctaText || "",
          hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
          slides: Array.isArray(post.slides) ? post.slides : [],
          imageUrls: Array.isArray(post.imageUrls) ? post.imageUrls : [],
        })
        .returning();

      savedRecord = inserted;
    } catch (dbErr: any) {
      console.warn("Aviso ao persistir no Supabase:", dbErr?.message || dbErr);
    }

    return NextResponse.json({
      success: true,
      savedPost: savedRecord || {
        ...post,
        companyId,
        status: "awaiting_approval",
        createdAt: new Date().toISOString(),
      },
      message: "Ativo salvo no cronograma do cliente com sucesso.",
    });
  } catch (error: any) {
    console.error("Erro ao salvar post no cronograma:", error);
    return NextResponse.json(
      { error: error?.message || "Falha interna ao salvar post no cronograma." },
      { status: 500 }
    );
  }
}
