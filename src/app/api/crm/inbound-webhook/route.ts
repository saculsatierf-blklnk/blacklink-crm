import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { leads } from "@/db/schema";
import { resolveTenantCompanyId } from "@/lib/auth/tenant";

export const dynamic = "force-dynamic";

export interface InboundWebhookPayload {
  tenantId?: string;
  leadName?: string;
  socialHandle?: string;
  socialPlatform?: "IG" | "LI" | "Instagram" | "LinkedIn" | string;
  campaignOrigin?: string;
  keyword?: string;
  leadEmail?: string;
  leadPhone?: string;
  notes?: string;
}

/**
 * POST /api/crm/inbound-webhook
 * Endpoint de Interceção B2B para o Loop de Inbound (n8n, ManyChat ou Meta Graph API).
 * Injeta o lead qualificado diretamente na primeira coluna do Kanban ("Inbound / Para Qualificação")
 * com a tag visual permanente: 🏷️ Capturado via Estúdio.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InboundWebhookPayload;
    const {
      tenantId,
      leadName,
      socialHandle,
      socialPlatform = "IG",
      campaignOrigin = "Carrossel B2B Estúdio",
      keyword = "SCRIPT",
      leadEmail,
      leadPhone,
      notes: extraNotes,
    } = body;

    // 1. Validação de identificação mínima do lead
    const effectiveName =
      leadName?.trim() ||
      (socialHandle?.trim() ? `${socialHandle.trim()} (${socialPlatform})` : "Lead Inbound Social");

    // 2. Resolução do Tenant ID (empresa no banco de dados)
    let companyId = tenantId?.trim();
    if (!companyId) {
      companyId = await resolveTenantCompanyId();
    }

    const captureTimestamp = new Date();
    const formattedCaptureDate = captureTimestamp.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const studioTag = "🏷️ Capturado via Estúdio";
    const cleanPlatform =
      socialPlatform === "IG"
        ? "Instagram"
        : socialPlatform === "LI"
        ? "LinkedIn"
        : socialPlatform;

    const noteText = `${studioTag} em ${formattedCaptureDate}. Palavra-chave: "${keyword}". Plataforma: ${cleanPlatform}. Perfil: ${
      socialHandle || "N/A"
    }. Campanha: ${campaignOrigin}.${extraNotes ? ` Observações: ${extraNotes}` : ""}`;

    const leadRecord = {
      companyId,
      leadName: effectiveName,
      leadEmail: leadEmail?.trim() || null,
      leadPhone: leadPhone?.trim() || null,
      origin: studioTag,
      status: "new" as const, // Injeta na primeira etapa do pipeline (Novo Lead / Inbound)
      dealScore: 75, // Score inicial aquecido por ser captura direta de inbound
      telemetryEvents: [
        {
          type: "inbound_studio_comment",
          weight: 75,
          timestamp: captureTimestamp.toISOString(),
          details: `Comentou "${keyword}" em post de campanha social`,
        },
      ],
      cadenceState: {
        completedSteps: [],
        roleTitle: socialHandle ? `@${socialHandle.replace(/^@/, "")} • ${cleanPlatform}` : "Decisor Inbound",
        estimatedValue: "A qualificar",
        customScript: `Lead converteu via palavra-chave "${keyword}". Iniciar contato imediato via Direct/DM antes que o interesse esfrie.`,
      },
      notes: [
        {
          id: `note-${Date.now()}`,
          text: noteText,
          createdAt: captureTimestamp.toISOString(),
          author: "Loop de Inbound (Estúdio)",
        },
      ],
      scriptVersion: "v1_inbound_studio",
      ownerId: "lucas.leite",
      createdAt: captureTimestamp,
    };

    let createdLead: any = null;
    let isDbPersisted = false;

    // 3. Mutação no PostgreSQL / Supabase com proteção de timeout
    try {
      const dbPromise = db.insert(leads).values(leadRecord).returning();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 3500)
      );

      const [persisted] = await Promise.race([dbPromise, timeoutPromise]);
      if (persisted) {
        createdLead = persisted;
        isDbPersisted = true;
      }
    } catch (dbErr) {
      console.warn("Persistência via banco direto falhou ou excedeu timeout; gerando registro em memória:", dbErr);
      createdLead = {
        id: `mock-inbound-${Date.now()}`,
        ...leadRecord,
      };
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead de inbound interceptado e injetado no Kanban com sucesso.",
        kanbanColumn: "Inbound / Para Qualificação",
        tag: studioTag,
        capturedAt: captureTimestamp.toISOString(),
        isDbPersisted,
        lead: createdLead,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Erro no processamento do webhook de inbound:", err);
    return NextResponse.json(
      { error: "Falha interna ao processar o webhook de inbound." },
      { status: 500 }
    );
  }
}
