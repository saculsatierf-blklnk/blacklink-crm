import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { webhookLeadSchema } from "@/lib/validations/webhook";

export async function POST(req: NextRequest) {
  try {
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

    const [createdLead] = await db
      .insert(leads)
      .values({
        companyId,
        leadName,
        leadEmail: leadEmail?.trim() || null,
        leadPhone: leadPhone?.trim() || null,
        origin: origin?.trim() || "n8n",
        status: "new",
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
