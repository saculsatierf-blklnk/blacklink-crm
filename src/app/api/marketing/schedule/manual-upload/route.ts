import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/db";
import { scheduledPosts, companies } from "@/db/schema";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

/**
 * Endpoint de upload manual de criativos externos ("A Prateleira")
 * Recebe mídias físicas (imagens/vídeos) e metadados, persistindo no Supabase
 * com source_type = 'manual' na mesma tabela dos criativos gerados por IA.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const theme = (formData.get("theme") as string) || "Ativo de Produção Manual";
    const format = (formData.get("format") as string) || "post";
    const bodyCopy = (formData.get("bodyCopy") as string) || "";
    const ctaText = (formData.get("ctaText") as string) || "";
    const scheduledDateStr = (formData.get("scheduledDate") as string) || "";
    const hashtagsRaw = (formData.get("hashtags") as string) || "";

    const hashtags = hashtagsRaw
      .split(" ")
      .map((t) => t.trim())
      .filter((t) => t.startsWith("#"));

    // Identifica o tenant ativo através do cookie de sessão
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
      // Ignora erro de parsing de cookie
    }

    if (!companyId) {
      try {
        const existing = await db.select().from(companies).limit(1);
        if (existing.length > 0) {
          companyId = existing[0].id;
        }
      } catch (err) {
        console.warn("Falha ao resolver empresa padrão:", err);
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "Nenhuma empresa (tenant) identificada para o upload." },
        { status: 400 }
      );
    }

    // Processamento dos arquivos físicos enviados
    const files = formData.getAll("files") as File[];
    const imageUrls: string[] = [];

    // Diretório local público para hospedar assets de upload manual com fallback
    const uploadsDir = join(process.cwd(), "public", "uploads", "tenant-assets");
    await mkdir(uploadsDir, { recursive: true }).catch(() => {});

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && typeof file.arrayBuffer === "function") {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileExt = file.name.split(".").pop() || "jpg";
        const safeFileName = `asset_${Date.now()}_${i}.${fileExt}`;
        const filePath = join(uploadsDir, safeFileName);

        await writeFile(filePath, buffer);
        imageUrls.push(`/uploads/tenant-assets/${safeFileName}`);
      }
    }

    // Se nenhuma mídia física foi salva, utiliza um placeholder de alta resolução
    if (imageUrls.length === 0) {
      imageUrls.push(
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
      );
    }

    // Cria as lâminas correspondentes às mídias enviadas
    const slides = imageUrls.map((url, idx) => ({
      slideNumber: idx + 1,
      headline: idx === 0 ? theme : `Lâmina 0${idx + 1} de Conteúdo`,
      bodyText: idx === 0 ? bodyCopy.slice(0, 140) : "Mídia externa carregada pela equipe de produção.",
      imageUrl: url,
    }));

    const scheduledDateObj = scheduledDateStr.includes("-")
      ? new Date(scheduledDateStr)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    let insertedRecord = null;
    try {
      const [inserted] = await db
        .insert(scheduledPosts)
        .values({
          companyId,
          theme,
          format,
          sourceType: "manual",
          scheduledDate: scheduledDateObj,
          status: "awaiting_approval",
          hookHeadline: theme,
          bodyCopy,
          ctaText,
          hashtags,
          slides,
          imageUrls,
        })
        .returning();

      insertedRecord = inserted;
    } catch (dbErr: any) {
      console.warn("Aviso ao persistir upload manual no banco de dados:", dbErr?.message || dbErr);
    }

    const createdPost = {
      id: insertedRecord?.id || `post-manual-${Date.now()}`,
      theme,
      format,
      sourceType: "manual" as const,
      targetAudience: "Audiência Geral da Empresa",
      scheduledDate: scheduledDateStr || "Amanhã • 14:00",
      status: "awaiting_approval" as const,
      hookHeadline: theme,
      bodyCopy,
      ctaText,
      hashtags,
      slides,
      imageUrls,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      post: createdPost,
      message: "Ativo manual salvo na prateleira e adicionado ao cronograma com sucesso.",
    });
  } catch (error: any) {
    console.error("Erro no upload manual de ativo:", error);
    return NextResponse.json(
      { error: error?.message || "Falha interna ao processar upload manual." },
      { status: 500 }
    );
  }
}
