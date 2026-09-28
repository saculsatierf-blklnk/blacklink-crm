import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dispatchPostToMeta } from "@/lib/tenant-social";

export const dynamic = "force-dynamic";

/**
 * Endpoint de disparo e aprovação final para a Meta Graph API
 * Utiliza estritamente as credenciais isoladas do tenant salvas no banco de dados.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, imageUrls, caption, format = "carousel", scheduledTime } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "O identificador do post (postId) é obrigatório." },
        { status: 400 }
      );
    }

    // Identifica o tenant ativo através do cookie de sessão corporativa
    let companyId: string | undefined = undefined;
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
      // Prossegue com tenant default se sessão não for parseável
    }

    const result = await dispatchPostToMeta({
      companyId,
      postId,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      caption: caption || "",
      format,
      scheduledTime,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro no agendamento para a Meta Graph API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Falha interna ao aprovar e agendar ativo na Meta API.",
      },
      { status: 500 }
    );
  }
}
