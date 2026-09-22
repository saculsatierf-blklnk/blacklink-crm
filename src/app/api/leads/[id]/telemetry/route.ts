import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leads, type TelemetryEvent } from "@/db/schema";
import {
  TELEMETRY_WEIGHTS,
  calculateDealScore,
  resolveNextBestAction,
} from "@/lib/predictive";
import { broadcastDealEvent } from "@/lib/deal-stream";
import { parseLeadInfo } from "@/lib/cadence";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await context.params;

    if (!leadId || !UUID_REGEX.test(leadId)) {
      return NextResponse.json(
        { error: "Identificador de lead inválido." },
        { status: 400 }
      );
    }

    const [lead] = await db
      .select({
        id: leads.id,
        leadName: leads.leadName,
        dealScore: leads.dealScore,
        telemetryEvents: leads.telemetryEvents,
      })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }

    const parsed = parseLeadInfo(lead.leadName);
    const nba = resolveNextBestAction(lead.dealScore, {
      name: parsed.name,
      company: parsed.company,
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      score: lead.dealScore,
      nba,
      events: lead.telemetryEvents || [],
    });
  } catch (error) {
    console.error("Erro na rota GET /api/leads/[id]/telemetry:", error);
    return NextResponse.json(
      { error: "Falha ao buscar telemetria do lead." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await context.params;

    if (!leadId || !UUID_REGEX.test(leadId)) {
      return NextResponse.json(
        { error: "Identificador de lead inválido. Deve ser um UUID padrão." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const eventType = body?.type as string;
    const details = body?.details as string | undefined;

    if (!eventType) {
      return NextResponse.json(
        { error: "Campo 'type' obrigatório no evento de telemetria." },
        { status: 400 }
      );
    }

    const config = TELEMETRY_WEIGHTS[eventType];
    const weight =
      typeof body.weight === "number"
        ? body.weight
        : config?.weight ?? 0;
    const label = config?.label || eventType;

    // 1. Busca o lead existente
    const [existing] = await db
      .select({
        id: leads.id,
        leadName: leads.leadName,
        dealScore: leads.dealScore,
        telemetryEvents: leads.telemetryEvents,
      })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Lead não encontrado com o identificador fornecido." },
        { status: 404 }
      );
    }

    // 2. Novo evento de telemetria
    const newEvent: TelemetryEvent = {
      type: eventType,
      weight,
      timestamp: new Date().toISOString(),
      details: details || label,
    };

    const currentEvents = existing.telemetryEvents || [];
    const updatedEvents = [newEvent, ...currentEvents];

    // 3. Recálculo ponderado do Deal Momentum Score
    const newScore = calculateDealScore(updatedEvents, 50);

    // 4. Persistência atômica no Supabase
    const [updatedLead] = await db
      .update(leads)
      .set({
        dealScore: newScore,
        telemetryEvents: updatedEvents,
      })
      .where(eq(leads.id, leadId))
      .returning();

    // 5. Resolução da Matriz NBA
    const parsed = parseLeadInfo(existing.leadName);
    const nba = resolveNextBestAction(newScore, {
      name: parsed.name,
      company: parsed.company,
    });

    // 6. Broadcast em tempo real para o streaming de Deal Momentum (WSS / SSE)
    broadcastDealEvent({
      type: "telemetry",
      leadId: existing.id,
      leadName: parsed.name,
      company: parsed.company,
      score: newScore,
      delta: weight,
      triggerType: eventType,
      triggerLabel: label,
      command: nba.command,
      zone: nba.zone,
      details: newEvent.details,
    });

    return NextResponse.json({
      success: true,
      message: `Evento de telemetria '${label}' registrado com sucesso.`,
      score: newScore,
      delta: weight,
      nba,
      event: newEvent,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Erro na rota POST /api/leads/[id]/telemetry:", error);
    return NextResponse.json(
      {
        error: "Falha ao registrar telemetria do lead.",
        details: error instanceof Error ? error.message : "Erro interno.",
      },
      { status: 500 }
    );
  }
}
