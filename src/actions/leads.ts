"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  leads,
  dealTelemetryEmbeddings,
  type CadenceState,
  type NoteEntry,
  type TelemetryEvent,
} from "@/db/schema";
import {
  TELEMETRY_WEIGHTS,
  calculateDealScore,
  resolveNextBestAction,
} from "@/lib/predictive";
import { broadcastDealEvent } from "@/lib/deal-stream";
import { parseLeadInfo } from "@/lib/cadence";

export type LeadStatus = "new" | "negotiation" | "closed";

export interface ActionResponse {
  success: boolean;
  leadId: string;
  error?: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Atualiza o status do funil de um lead no PostgreSQL
 */
export async function updateLeadStatusAction(
  leadId: string,
  newStatus: LeadStatus
): Promise<ActionResponse & { newStatus: LeadStatus }> {
  try {
    if (!leadId) {
      return {
        success: false,
        leadId,
        newStatus,
        error: "Identificador do lead ausente.",
      };
    }

    const validStatuses: LeadStatus[] = ["new", "negotiation", "closed"];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        leadId,
        newStatus,
        error: "Status de lead inválido.",
      };
    }

    if (!UUID_REGEX.test(leadId)) {
      // Mock / contingência local
      return { success: true, leadId, newStatus };
    }

    await db
      .update(leads)
      .set({ status: newStatus })
      .where(eq(leads.id, leadId));

    try {
      revalidatePath("/leads");
    } catch {
      // Ignorado fora do contexto de requisição HTTP ativa
    }

    return { success: true, leadId, newStatus };
  } catch (error) {
    console.error("Falha ao atualizar status do lead no banco:", error);
    return {
      success: false,
      leadId,
      newStatus,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao persistir novo status do lead.",
    };
  }
}

/**
 * Atualiza o estado da cadência temporal e metadados no PostgreSQL (sem localStorage)
 */
export async function updateLeadCadenceAction(
  leadId: string,
  cadenceState: Partial<CadenceState>
): Promise<ActionResponse> {
  try {
    if (!leadId) {
      return { success: false, leadId, error: "Identificador do lead ausente." };
    }

    if (!UUID_REGEX.test(leadId)) {
      return { success: true, leadId };
    }

    // Busca o estado atual para fazer merge atômico
    const [existing] = await db
      .select({ cadenceState: leads.cadenceState })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    const mergedCadence: CadenceState = {
      completedSteps: cadenceState.completedSteps ?? existing?.cadenceState?.completedSteps ?? [],
      roleTitle: cadenceState.roleTitle ?? existing?.cadenceState?.roleTitle,
      estimatedValue: cadenceState.estimatedValue ?? existing?.cadenceState?.estimatedValue,
      customScript: cadenceState.customScript ?? existing?.cadenceState?.customScript,
    };

    await db
      .update(leads)
      .set({ cadenceState: mergedCadence })
      .where(eq(leads.id, leadId));

    return { success: true, leadId };
  } catch (error) {
    console.error("Falha ao atualizar cadência do lead no banco:", error);
    return {
      success: false,
      leadId,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao persistir cadência.",
    };
  }
}

/**
 * Adiciona uma anotação cronológica ao histórico persistido no PostgreSQL
 */
export async function addLeadNoteAction(
  leadId: string,
  text: string,
  author: string = "Lucas Leite (Hunter)"
): Promise<ActionResponse & { note?: NoteEntry }> {
  try {
    if (!leadId || !text.trim()) {
      return { success: false, leadId, error: "Texto da anotação obrigatório." };
    }

    const newNote: NoteEntry = {
      id: "note-" + Date.now(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      author,
    };

    if (!UUID_REGEX.test(leadId)) {
      return { success: true, leadId, note: newNote };
    }

    const [existing] = await db
      .select({ notes: leads.notes })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    const currentNotes = existing?.notes || [];
    const updatedNotes = [newNote, ...currentNotes];

    await db
      .update(leads)
      .set({ notes: updatedNotes })
      .where(eq(leads.id, leadId));

    return { success: true, leadId, note: newNote };
  } catch (error) {
    console.error("Falha ao adicionar anotação no banco:", error);
    return {
      success: false,
      leadId,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao salvar anotação.",
    };
  }
}

/**
 * Remove uma anotação específica do histórico persistido no PostgreSQL
 */
export async function deleteLeadNoteAction(
  leadId: string,
  noteId: string
): Promise<ActionResponse> {
  try {
    if (!leadId || !noteId) {
      return { success: false, leadId, error: "Identificadores inválidos." };
    }

    if (!UUID_REGEX.test(leadId)) {
      return { success: true, leadId };
    }

    const [existing] = await db
      .select({ notes: leads.notes })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    const currentNotes = existing?.notes || [];
    const filteredNotes = currentNotes.filter((n) => n.id !== noteId);

    await db
      .update(leads)
      .set({ notes: filteredNotes })
      .where(eq(leads.id, leadId));

    return { success: true, leadId };
  } catch (error) {
    console.error("Falha ao excluir anotação no banco:", error);
    return {
      success: false,
      leadId,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao excluir anotação.",
    };
  }
}

/**
 * Atualiza o rascunho de script e a versão de teste A/B no PostgreSQL
 */
export async function updateLeadScriptAction(
  leadId: string,
  customScript: string,
  scriptVersion?: string
): Promise<ActionResponse> {
  try {
    if (!leadId) {
      return { success: false, leadId, error: "Identificador ausente." };
    }

    if (!UUID_REGEX.test(leadId)) {
      return { success: true, leadId };
    }

    const [existing] = await db
      .select({ cadenceState: leads.cadenceState })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    const updatedCadence: CadenceState = {
      ...(existing?.cadenceState || { completedSteps: [] }),
      customScript,
    };

    const updatePayload: Record<string, unknown> = {
      cadenceState: updatedCadence,
    };

    if (scriptVersion) {
      updatePayload.scriptVersion = scriptVersion;
    }

    await db
      .update(leads)
      .set(updatePayload)
      .where(eq(leads.id, leadId));

    return { success: true, leadId };
  } catch (error) {
    console.error("Falha ao atualizar script no banco:", error);
    return {
      success: false,
      leadId,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao salvar script.",
    };
  }
}

/**
 * Registra um evento de telemetria ponderado e recalcula o Deal Momentum Score
 */
export async function recordTelemetryEventAction(
  leadId: string,
  eventType: string,
  customWeight?: number,
  details?: string
): Promise<ActionResponse & { score?: number; event?: TelemetryEvent }> {
  try {
    if (!leadId || !eventType) {
      return { success: false, leadId, error: "Parâmetros obrigatórios ausentes." };
    }

    const config = TELEMETRY_WEIGHTS[eventType];
    const weight =
      typeof customWeight === "number" ? customWeight : config?.weight ?? 0;
    const label = config?.label || eventType;

    const newEvent: TelemetryEvent = {
      type: eventType,
      weight,
      timestamp: new Date().toISOString(),
      details: details || label,
    };

    if (!UUID_REGEX.test(leadId)) {
      return { success: true, leadId, score: 75, event: newEvent };
    }

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
      return { success: false, leadId, error: "Lead não encontrado." };
    }

    const currentEvents = existing.telemetryEvents || [];
    const updatedEvents = [newEvent, ...currentEvents];
    const newScore = calculateDealScore(updatedEvents, 50);

    await db
      .update(leads)
      .set({
        dealScore: newScore,
        telemetryEvents: updatedEvents,
      })
      .where(eq(leads.id, leadId));

    const parsed = parseLeadInfo(existing.leadName);
    const nba = resolveNextBestAction(newScore, {
      name: parsed.name,
      company: parsed.company,
    });

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

    return { success: true, leadId, score: newScore, event: newEvent };
  } catch (error) {
    console.error("Falha ao registrar telemetria via Server Action:", error);
    return {
      success: false,
      leadId,
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao registrar telemetria.",
    };
  }
}

/**
 * Atualiza diretamente o Deal Momentum Score de um lead
 */
export async function updateDealScoreAction(
  leadId: string,
  newScore: number
): Promise<ActionResponse & { score: number }> {
  try {
    const clampedScore = Math.max(0, Math.min(100, Math.round(newScore)));

    if (!UUID_REGEX.test(leadId)) {
      return { success: true, leadId, score: clampedScore };
    }

    const [lead] = await db
      .update(leads)
      .set({ dealScore: clampedScore })
      .where(eq(leads.id, leadId))
      .returning({ id: leads.id, leadName: leads.leadName });

    if (lead) {
      const parsed = parseLeadInfo(lead.leadName);
      const nba = resolveNextBestAction(clampedScore, {
        name: parsed.name,
        company: parsed.company,
      });

      broadcastDealEvent({
        type: "score_update",
        leadId: lead.id,
        leadName: parsed.name,
        company: parsed.company,
        score: clampedScore,
        command: nba.command,
        zone: nba.zone,
      });
    }

    return { success: true, leadId, score: clampedScore };
  } catch (error) {
    console.error("Falha ao atualizar score via Server Action:", error);
    return {
      success: false,
      leadId,
      score: newScore,
      error:
        error instanceof Error ? error.message : "Erro interno ao atualizar score.",
    };
  }
}

