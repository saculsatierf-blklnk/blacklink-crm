import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { webhookLeadSchema } from "@/lib/validations/webhook";
import { validateApiKey } from "@/lib/auth/api-key";

export async function POST(req: NextRequest) {
  try {
    // 1. Validação de segurança M2M via header x-api-key
    if (!validateApiKey(req)) {
      return NextResponse.json(
        {
          error: "Acesso não autorizado. Header x-api-key ausente ou inválido.",
        },
        { status: 401 }
      );
    }

    // 2. Validação estrutural do payload de entrada
    const body = await req.json();
    const parsed = webhookLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload de webhook inválido.",
          issues: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { companyId, leadName, leadEmail, leadPhone, origin } = parsed.data;

    // 3. Inserção persistida no PostgreSQL com defaults da Fase 2
    const [createdLead] = await db
      .insert(leads)
      .values({
        companyId,
        leadName,
        leadEmail: leadEmail?.trim() || null,
        leadPhone: leadPhone?.trim() || null,
        origin: origin?.trim() || "n8n",
        status: "new",
        cadenceState: { completedSteps: [] },
        notes: [],
        scriptVersion: "v1_direct",
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Lead corporativo injetado com sucesso via automação externa.",
        lead: createdLead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao processar webhook de leads:", error);
    return NextResponse.json(
      {
        error: "Falha na ingestão do lead.",
        details:
          error instanceof Error ? error.message : "Erro interno desconhecido.",
      },
      { status: 500 }
    );
  }
}
