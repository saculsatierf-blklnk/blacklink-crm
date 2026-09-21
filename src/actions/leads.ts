"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { leads, type CadenceState, type NoteEntry } from "@/db/schema";

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
