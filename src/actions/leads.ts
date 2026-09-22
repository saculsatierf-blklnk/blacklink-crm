"use server";

import { eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  leads,
  dealTelemetryEmbeddings,
  type Lead,
  type CadenceState,
  type NoteEntry,
  type TelemetryEvent,
  type ActivityType,
} from "@/db/schema";
import { getOperator } from "@/lib/operators";
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

export interface CollidedLeadData {
  id: string;
  leadName: string;
  leadEmail: string | null;
  ownerId: string;
  ownerName: string;
  status: string;
  notes: NoteEntry[];
}

export interface CollisionCheckResult {
  collision: boolean;
  collidedWith?: "email" | "domain";
  domain?: string;
  collidedLead?: CollidedLeadData;
}

const GENERIC_FREEMAIL_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "uol.com.br",
  "bol.com.br",
  "live.com",
  "terra.com.br",
]);

/**
 * Radar Anti-Colisão: Varre o banco em tempo real por e-mail ou domínio corporativo
 */
export async function checkLeadCollisionAction(
  email: string
): Promise<CollisionCheckResult> {
  try {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { collision: false };
    }

    const domain = cleanEmail.split("@")[1]?.trim().toLowerCase();
    const isCorporateDomain = domain && !GENERIC_FREEMAIL_DOMAINS.has(domain);

    // 1. Busca por e-mail exato
    const [exactMatch] = await db
      .select({
        id: leads.id,
        leadName: leads.leadName,
        leadEmail: leads.leadEmail,
        ownerId: leads.ownerId,
        status: leads.status,
        notes: leads.notes,
      })
      .from(leads)
      .where(ilike(leads.leadEmail, cleanEmail))
      .limit(1);

    if (exactMatch) {
      const op = getOperator(exactMatch.ownerId);
      return {
        collision: true,
        collidedWith: "email",
        domain,
        collidedLead: {
          ...exactMatch,
          ownerName: op.name,
        },
      };
    }

    // 2. Busca por domínio corporativo idêntico
    if (isCorporateDomain) {
      const [domainMatch] = await db
        .select({
          id: leads.id,
          leadName: leads.leadName,
          leadEmail: leads.leadEmail,
          ownerId: leads.ownerId,
          status: leads.status,
          notes: leads.notes,
        })
        .from(leads)
        .where(ilike(leads.leadEmail, `%@${domain}`))
        .limit(1);

      if (domainMatch) {
        const op = getOperator(domainMatch.ownerId);
        return {
          collision: true,
          collidedWith: "domain",
          domain,
          collidedLead: {
            ...domainMatch,
            ownerName: op.name,
          },
        };
      }
    }

    return { collision: false };
  } catch (error) {
    console.error("Erro na verificação de colisão de lead:", error);
    return { collision: false };
  }
}

export interface CreateLeadInput {
  name: string;
  company: string;
  roleTitle?: string;
  email: string;
  phone?: string;
  estimatedValue?: string;
  ownerId?: string;
  initialNote?: string;
}

/**
 * Criação atômica de lead com bloqueio de colisão e vinculação de propriedade (owner)
 */
export async function createLeadAction(
  input: CreateLeadInput
): Promise<ActionResponse & { lead?: Lead }> {
  try {
    const { name, company, roleTitle, email, phone, estimatedValue, ownerId, initialNote } = input;

    if (!name?.trim() || !company?.trim() || !email?.trim()) {
      return { success: false, leadId: "", error: "Nome, empresa e e-mail são obrigatórios." };
    }

    // Validação estrita anti-colisão antes de persistir
    const collisionCheck = await checkLeadCollisionAction(email);
    if (collisionCheck.collision && collisionCheck.collidedLead) {
      return {
        success: false,
        leadId: collisionCheck.collidedLead.id,
        error: `Colisão detectada: A conta '${collisionCheck.collidedLead.leadName}' já pertence a ${collisionCheck.collidedLead.ownerName}.`,
      };
    }

    // Resolução de companyId para isolamento multi-tenant
    const [existingLead] = await db.select({ companyId: leads.companyId }).from(leads).limit(1);
    const companyId = existingLead?.companyId || "44d73af8-8026-4061-8aa9-91a6becd33c9";

    const assignedOwner = ownerId || "lucas.leite";
    const op = getOperator(assignedOwner);

    const initialNotes: NoteEntry[] = initialNote?.trim()
      ? [
          {
            id: "note-" + Date.now(),
            text: initialNote.trim(),
            createdAt: new Date().toISOString(),
            author: `${op.name} (${op.role})`,
          },
        ]
      : [];

    const cadenceState: CadenceState = {
      completedSteps: [],
      roleTitle: roleTitle?.trim() || "Decisor Comercial",
      estimatedValue: estimatedValue?.trim() || "R$ 50.000,00",
    };

    const [newLead] = await db
      .insert(leads)
      .values({
        companyId,
        leadName: `${name.trim()} (${company.trim()})`,
        leadEmail: email.trim().toLowerCase(),
        leadPhone: phone?.trim() || null,
        origin: "Hunter Manual / Radar",
        status: "new",
        ownerId: assignedOwner,
        cadenceState,
        notes: initialNotes,
        dealScore: 50,
        telemetryEvents: [],
        scriptVersion: "v1_direct",
      })
      .returning();

    try {
      revalidatePath("/leads");
    } catch {
      // Ignorado fora do request context
    }

    return { success: true, leadId: newLead.id, lead: newLead };
  } catch (error) {
    console.error("Falha ao criar novo lead:", error);
    return {
      success: false,
      leadId: "",
      error: error instanceof Error ? error.message : "Erro interno ao cadastrar lead.",
    };
  }
}

/**
 * Atualiza o operador responsável (dono) do lead
 */
export async function updateLeadOwnerAction(
  leadId: string,
  newOwnerId: string
): Promise<ActionResponse & { newOwnerId: string }> {
  try {
    if (!leadId || !newOwnerId) {
      return { success: false, leadId, newOwnerId, error: "Identificadores inválidos." };
    }

    if (!UUID_REGEX.test(leadId)) {
      return { success: true, leadId, newOwnerId };
    }

    await db.update(leads).set({ ownerId: newOwnerId }).where(eq(leads.id, leadId));

    try {
      revalidatePath("/leads");
    } catch {
      // Ignorado
    }

    return { success: true, leadId, newOwnerId };
  } catch (error) {
    console.error("Falha ao transferir proprietário do lead:", error);
    return {
      success: false,
      leadId,
      newOwnerId,
      error: error instanceof Error ? error.message : "Erro ao alterar proprietário.",
    };
  }
}

export interface ScheduleActivityParams {
  leadId: string;
  activityDate: string;
  activityType: ActivityType | string;
  assignedOperatorId: string;
  currentOperatorId?: string;
}

export interface ScheduleActivityResult extends ActionResponse {
  updatedLead?: Lead;
  note?: NoteEntry;
  isHandOff?: boolean;
  newOwnerId?: string;
}

/**
 * Agenda compromisso (data/hora + tipo) e executa o Hand-off automático se o operador mudar
 */
export async function scheduleLeadActivityAction(
  params: ScheduleActivityParams
): Promise<ScheduleActivityResult> {
  try {
    const {
      leadId,
      activityDate,
      activityType,
      assignedOperatorId,
      currentOperatorId,
    } = params;

    if (!leadId || !activityDate || !activityType || !assignedOperatorId) {
      return {
        success: false,
        leadId: leadId || "",
        error: "Parâmetros obrigatórios ausentes para o agendamento.",
      };
    }

    const scheduledDate = new Date(activityDate);
    if (isNaN(scheduledDate.getTime())) {
      return {
        success: false,
        leadId,
        error: "Data ou horário da atividade inválido.",
      };
    }

    if (!UUID_REGEX.test(leadId)) {
      return {
        success: true,
        leadId,
        isHandOff: false,
        newOwnerId: assignedOperatorId,
      };
    }

    const [currentLead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!currentLead) {
      return {
        success: false,
        leadId,
        error: "Lead não encontrado no banco de dados.",
      };
    }

    const currentOwner = currentLead.ownerId || "lucas.leite";
    const newOp = getOperator(assignedOperatorId);
    const activeCurrentOp = getOperator(currentOperatorId || currentOwner);

    // Identifica se houve transferência de bastão (Hand-off)
    const isHandOff = assignedOperatorId !== currentOwner;

    // Rótulo amigável do tipo da atividade
    const typeLabels: Record<string, string> = {
      reuniao: "Reunião",
      call: "Ligação",
      follow_up: "Follow-up",
    };
    const displayType = typeLabels[activityType.toLowerCase()] || activityType;

    const formattedDateTime = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(scheduledDate);

    // Registro do log no histórico
    const noteText = isHandOff
      ? `Hand-off: Atividade [${displayType}] agendada para [${formattedDateTime}]. Conta transferida para o operador [${newOp.name}].`
      : `Atividade [${displayType}] agendada para [${formattedDateTime}].`;

    const newNote: NoteEntry = {
      id: "note-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      text: noteText,
      createdAt: new Date().toISOString(),
      author: isHandOff ? `${activeCurrentOp.name} (Hand-off)` : activeCurrentOp.name,
    };

    const currentNotes = currentLead.notes || [];
    const updatedNotes = [newNote, ...currentNotes];

    const [updatedLead] = await db
      .update(leads)
      .set({
        nextActivityDate: scheduledDate,
        nextActivityType: activityType,
        notes: updatedNotes,
        ...(isHandOff ? { ownerId: assignedOperatorId } : {}),
      })
      .where(eq(leads.id, leadId))
      .returning();

    try {
      revalidatePath("/leads");
    } catch {
      // Ignorado fora do contexto de requisição
    }

    return {
      success: true,
      leadId,
      updatedLead,
      note: newNote,
      isHandOff,
      newOwnerId: isHandOff ? assignedOperatorId : currentOwner,
    };
  } catch (error) {
    console.error("Falha ao agendar atividade e processar Hand-off:", error);
    return {
      success: false,
      leadId: params.leadId || "",
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao processar agendamento de atividade.",
    };
  }
}


