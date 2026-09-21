import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leads, type NoteEntry } from "@/db/schema";
import { validateApiKey } from "@/lib/auth/api-key";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validação de segurança M2M via x-api-key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          error: "Acesso não autorizado. Header x-api-key ausente ou inválido.",
        },
        { status: 401 }
      );
    }

    // 2. Extração e validação do UUID do lead
    const { id: leadId } = await context.params;

    if (!leadId || !UUID_REGEX.test(leadId)) {
      return NextResponse.json(
        {
          error: "Identificador de lead inválido. Deve ser um UUID padrão.",
        },
        { status: 400 }
      );
    }

    // 3. Validação do payload
    const body = await request.json();
    const noteText = body?.text;
    const author = body?.author || "Black Link Autonomous Agent (AI)";

    if (!noteText || typeof noteText !== "string" || !noteText.trim()) {
      return NextResponse.json(
        {
          error: "Texto da anotação (text) é obrigatório.",
        },
        { status: 400 }
      );
    }

    // 4. Busca notas existentes para append atômico
    const [leadRecord] = await db
      .select({ notes: leads.notes })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!leadRecord) {
      return NextResponse.json(
        {
          error: "Lead não encontrado com o identificador fornecido.",
        },
        { status: 404 }
      );
    }

    const newNote: NoteEntry = {
      id: "note-auto-" + Date.now(),
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
      author,
    };

    const updatedNotes = [newNote, ...(leadRecord.notes || [])];

    await db
      .update(leads)
      .set({ notes: updatedNotes })
      .where(eq(leads.id, leadId));

    return NextResponse.json(
      {
        success: true,
        message: "Anotação registrada com sucesso pelo agente autônomo.",
        note: newNote,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro na rota POST /api/leads/[id]/notes:", error);
    return NextResponse.json(
      {
        error: "Falha ao registrar anotação no histórico.",
        details:
          error instanceof Error ? error.message : "Erro interno desconhecido.",
      },
      { status: 500 }
    );
  }
}
