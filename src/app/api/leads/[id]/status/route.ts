import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { validateApiKey } from "@/lib/auth/api-key";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_STATUSES = ["new", "negotiation", "closed"] as const;
type LeadStatusType = (typeof VALID_STATUSES)[number];

export async function PATCH(
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

    // 2. Extração e validação do parâmetro de rota (UUID do lead)
    const { id: leadId } = await context.params;

    if (!leadId || !UUID_REGEX.test(leadId)) {
      return NextResponse.json(
        {
          error: "Identificador de lead inválido. Deve ser um UUID padrão.",
        },
        { status: 400 }
      );
    }

    // 3. Validação do payload da mutação
    const body = await request.json();
    const newStatus = body?.status as LeadStatusType;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          error:
            "Status inválido. Valores aceitos: 'new', 'negotiation', 'closed'.",
        },
        { status: 400 }
      );
    }

    // 4. Mutação atômica no PostgreSQL
    const [updatedLead] = await db
      .update(leads)
      .set({ status: newStatus })
      .where(eq(leads.id, leadId))
      .returning();

    if (!updatedLead) {
      return NextResponse.json(
        {
          error: "Lead não encontrado com o identificador fornecido.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Estágio do lead atualizado para '${newStatus}' com sucesso via orquestrador autônomo.`,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Erro na rota PATCH /api/leads/[id]/status:", error);
    return NextResponse.json(
      {
        error: "Falha ao processar atualização de status do lead.",
        details:
          error instanceof Error ? error.message : "Erro interno desconhecido.",
      },
      { status: 500 }
    );
  }
}
