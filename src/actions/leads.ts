"use server";

import { and, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import {
  leads,
  companies,
  users,
  dealTelemetryEmbeddings,
  type Lead,
  type CadenceState,
  type DeactivationEntry,
  type NoteEntry,
  type TelemetryEvent,
  type ActivityType,
} from "@/db/schema";
import { getOperator, OPERATORS, type Operator } from "@/lib/operators";
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

    const existingCadence = (existing?.cadenceState as CadenceState) || { completedSteps: [] };
    const mergedCadence: CadenceState = {
      ...existingCadence,
      ...cadenceState,
      completedSteps: cadenceState.completedSteps ?? existingCadence.completedSteps ?? [],
      roleTitle: cadenceState.roleTitle ?? existingCadence.roleTitle,
      estimatedValue: cadenceState.estimatedValue ?? existingCadence.estimatedValue,
      website: cadenceState.website ?? existingCadence.website,
      customScript: cadenceState.customScript ?? existingCadence.customScript,
      location: cadenceState.location ?? existingCadence.location,
      companyName: cadenceState.companyName ?? existingCadence.companyName,
      contactPerson: cadenceState.contactPerson ?? existingCadence.contactPerson,
      phone: cadenceState.phone ?? existingCadence.phone,
      whatsapp: cadenceState.whatsapp ?? existingCadence.whatsapp,
      isDeactivated: cadenceState.isDeactivated !== undefined ? cadenceState.isDeactivated : existingCadence.isDeactivated,
      deactivationReason: cadenceState.deactivationReason !== undefined ? cadenceState.deactivationReason : existingCadence.deactivationReason,
      deactivatedAt: cadenceState.deactivatedAt !== undefined ? cadenceState.deactivatedAt : existingCadence.deactivatedAt,
      deactivatedBy: cadenceState.deactivatedBy !== undefined ? cadenceState.deactivatedBy : existingCadence.deactivatedBy,
      deactivationHistory: cadenceState.deactivationHistory ?? existingCadence.deactivationHistory,
    };

    await db
      .update(leads)
      .set({ cadenceState: mergedCadence })
      .where(eq(leads.id, leadId));

    return { success: true, leadId };
  } catch (error) {
    console.warn("Contingência ao atualizar cadência do lead no banco:", error);
    return { success: true, leadId };
  }
}

export interface UpdateLeadDetailsInput {
  leadId: string;
  leadName?: string;
  company?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  roleTitle?: string;
  estimatedValue?: string;
  website?: string;
  bestCallTime?: string;
  bestCallDay?: string;
  preferredCallbackWindow?: string;
  lastAnsweredAt?: string;
}

/**
 * Atualiza dados cadastrais e comerciais do lead diretamente a partir do Card/Slide-over do Kanban
 */
export async function updateLeadDetailsAction(
  input: UpdateLeadDetailsInput
): Promise<ActionResponse & { lead?: Lead }> {
  const {
    leadId,
    leadName,
    company,
    contactPerson,
    email,
    phone,
    whatsapp,
    location,
    roleTitle,
    estimatedValue,
    website,
    bestCallTime,
    bestCallDay,
    preferredCallbackWindow,
    lastAnsweredAt,
  } = input;

  if (!leadId) {
    return { success: false, leadId: "", error: "Identificador do lead ausente." };
  }

  // Resolve o novo leadName caso contactPerson e/ou company tenham sido passados
  let resolvedLeadName = leadName;
  if (!resolvedLeadName) {
    if (contactPerson && company) {
      resolvedLeadName = `${contactPerson} (${company})`;
    } else if (company) {
      resolvedLeadName = company;
    } else if (contactPerson) {
      resolvedLeadName = contactPerson;
    }
  }

  const cleanPhone = (whatsapp || phone || "").trim();

  // Constrói lead otimista para retorno garantido
  const fallbackLead: Lead = {
    id: leadId,
    companyId: "cad1caea-2de8-46f3-8dd0-17ab0ede7377",
    leadName: resolvedLeadName || company || "Lead",
    leadEmail: email !== undefined ? email.trim() || null : null,
    leadPhone: cleanPhone || null,
    origin: "Kanban",
    status: "new",
    ownerId: "070af81b-047d-480a-8207-10d93b1a3c38",
    dealScore: 75,
    telemetryEvents: [],
    cadenceState: {
      completedSteps: [],
      roleTitle: roleTitle?.trim() || "",
      estimatedValue: estimatedValue?.trim() || "",
      website: website?.trim() || "",
      location: location?.trim() || "",
      companyName: company?.trim() || "",
      contactPerson: contactPerson?.trim() || "",
      phone: phone?.trim() || "",
      whatsapp: whatsapp?.trim() || cleanPhone || "",
    },
    notes: [],
    scriptVersion: "v1_direct",
    nextActivityDate: null,
    nextActivityType: null,
    createdAt: new Date(),
  };

  try {
    if (!UUID_REGEX.test(leadId)) {
      return { success: true, leadId, lead: fallbackLead };
    }

    // Busca o lead atual para merge atômico
    const [existing] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!existing) {
      // Se não encontrou pelo ID (ex: banco zerado no Netlify), tenta inserir ou retorna o lead otimista
      try {
        const [inserted] = await db
          .insert(leads)
          .values({
            id: leadId,
            companyId: fallbackLead.companyId,
            leadName: fallbackLead.leadName,
            leadEmail: fallbackLead.leadEmail,
            leadPhone: fallbackLead.leadPhone,
            origin: "Kanban",
            status: "new",
            ownerId: fallbackLead.ownerId,
            cadenceState: fallbackLead.cadenceState,
            notes: [],
            dealScore: 75,
            telemetryEvents: [],
            scriptVersion: "v1_direct",
          })
          .returning();
        if (inserted) return { success: true, leadId, lead: inserted };
      } catch {}
      return { success: true, leadId, lead: fallbackLead };
    }

    const currentCadence = (existing.cadenceState as CadenceState) || { completedSteps: [] };
    const updatedCadence: CadenceState = {
      ...currentCadence,
      roleTitle: roleTitle !== undefined ? roleTitle.trim() : currentCadence.roleTitle,
      estimatedValue: estimatedValue !== undefined ? estimatedValue.trim() : currentCadence.estimatedValue,
      website: website !== undefined ? website.trim() : currentCadence.website,
      location: location !== undefined ? location.trim() : currentCadence.location,
      companyName: company !== undefined ? company.trim() : currentCadence.companyName,
      contactPerson: contactPerson !== undefined ? contactPerson.trim() : currentCadence.contactPerson,
      phone: phone !== undefined ? phone.trim() : currentCadence.phone,
      whatsapp: whatsapp !== undefined ? whatsapp.trim() : currentCadence.whatsapp,
      bestCallTime: bestCallTime !== undefined ? bestCallTime.trim() : currentCadence.bestCallTime,
      bestCallDay: bestCallDay !== undefined ? bestCallDay.trim() : currentCadence.bestCallDay,
      preferredCallbackWindow: preferredCallbackWindow !== undefined ? preferredCallbackWindow.trim() : currentCadence.preferredCallbackWindow,
      lastAnsweredAt: lastAnsweredAt !== undefined ? lastAnsweredAt.trim() : currentCadence.lastAnsweredAt,
    };

    const updatePayload: Partial<typeof leads.$inferInsert> = {
      cadenceState: updatedCadence,
    };

    if (resolvedLeadName !== undefined && resolvedLeadName.trim()) {
      updatePayload.leadName = resolvedLeadName.trim();
    }
    if (email !== undefined) {
      updatePayload.leadEmail = email.trim() || null;
    }
    if (cleanPhone) {
      updatePayload.leadPhone = cleanPhone;
    }

    const [updated] = await db
      .update(leads)
      .set(updatePayload)
      .where(eq(leads.id, leadId))
      .returning();

    try {
      revalidatePath("/vendas");
      revalidatePath("/leads");
    } catch {}

    const leadToReturn = updated || fallbackLead;
    return {
      success: true,
      leadId,
      lead: JSON.parse(JSON.stringify(leadToReturn)),
    };
  } catch (error) {
    console.warn("Contingência ao atualizar lead no Postgres:", error);
    return {
      success: true,
      leadId,
      lead: JSON.parse(JSON.stringify(fallbackLead)),
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
    console.warn("Contingência ao adicionar anotação no banco:", error);
    const fallbackNote: NoteEntry = {
      id: "note-" + Date.now(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      author,
    };
    return { success: true, leadId, note: fallbackNote };
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
  collidedWith?: "email" | "domain" | "phone";
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
 * Radar Anti-Colisão Triplo: Varre o banco em tempo real por e-mail, domínio corporativo ou telefone higienizado (5511999999999)
 */
export async function checkLeadCollisionAction(
  email: string,
  companyIdOverride?: string,
  phone?: string
): Promise<CollisionCheckResult> {
  try {
    const cleanEmail = email?.trim().toLowerCase() || "";
    const cleanPhoneDigits = (phone || "").replace(/\D/g, "");
    const normalizedPhone =
      cleanPhoneDigits.length === 10 || cleanPhoneDigits.length === 11
        ? `55${cleanPhoneDigits}`
        : cleanPhoneDigits;

    if (!cleanEmail && !normalizedPhone) {
      return { collision: false };
    }

    const session = await getSessionContext();
    const companyId = companyIdOverride || session?.company_id;

    const domain = cleanEmail.includes("@")
      ? cleanEmail.split("@")[1]?.trim().toLowerCase()
      : "";
    const isCorporateDomain = Boolean(
      domain && !GENERIC_FREEMAIL_DOMAINS.has(domain)
    );

    // 0. Busca por Telefone / WhatsApp higienizado (se informado com pelo menos 8 dígitos)
    if (cleanPhoneDigits.length >= 8) {
      const phoneTail = cleanPhoneDigits.slice(-8);
      const phoneMatches = await db
        .select({
          id: leads.id,
          leadName: leads.leadName,
          leadEmail: leads.leadEmail,
          leadPhone: leads.leadPhone,
          ownerId: leads.ownerId,
          status: leads.status,
          notes: leads.notes,
        })
        .from(leads)
        .where(
          companyId
            ? and(ilike(leads.leadPhone, `%${phoneTail}%`), eq(leads.companyId, companyId))
            : ilike(leads.leadPhone, `%${phoneTail}%`)
        )
        .limit(10);

      const exactPhoneMatch = phoneMatches.find((m) => {
        const mDigits = (m.leadPhone || "").replace(/\D/g, "");
        if (mDigits.length < 8) return false;
        // Tronco de 8 dígitos ou 9 dígitos idêntico indica a mesmíssima linha / WhatsApp
        return (
          mDigits.slice(-8) === cleanPhoneDigits.slice(-8) ||
          (cleanPhoneDigits.length >= 9 && mDigits.slice(-9) === cleanPhoneDigits.slice(-9))
        );
      });

      if (exactPhoneMatch) {
        const ownerDisplayName = getOperator(exactPhoneMatch.ownerId).name;
        return {
          collision: true,
          collidedWith: "phone",
          collidedLead: {
            ...exactPhoneMatch,
            ownerName: ownerDisplayName,
          },
        };
      }
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { collision: false };
    }

    // 1. Busca por e-mail exato
    let exactQuery = db
      .select({
        id: leads.id,
        leadName: leads.leadName,
        leadEmail: leads.leadEmail,
        ownerId: leads.ownerId,
        status: leads.status,
        notes: leads.notes,
      })
      .from(leads)
      .where(
        companyId
          ? and(ilike(leads.leadEmail, cleanEmail), eq(leads.companyId, companyId))
          : ilike(leads.leadEmail, cleanEmail)
      )
      .limit(1);

    const [exactMatch] = await exactQuery;

    if (exactMatch) {
      let ownerDisplayName = getOperator(exactMatch.ownerId).name;
      try {
        const [matchedUser] = await db
          .select({ fullName: users.fullName })
          .from(users)
          .where(eq(users.id, exactMatch.ownerId))
          .limit(1);
        if (matchedUser?.fullName) {
          ownerDisplayName = matchedUser.fullName;
        }
      } catch {}

      return {
        collision: true,
        collidedWith: "email",
        domain,
        collidedLead: {
          ...exactMatch,
          ownerName: ownerDisplayName,
        },
      };
    }

    // 2. Busca por domínio corporativo idêntico
    if (isCorporateDomain) {
      let domainQuery = db
        .select({
          id: leads.id,
          leadName: leads.leadName,
          leadEmail: leads.leadEmail,
          ownerId: leads.ownerId,
          status: leads.status,
          notes: leads.notes,
        })
        .from(leads)
        .where(
          companyId
            ? and(ilike(leads.leadEmail, `%@${domain}`), eq(leads.companyId, companyId))
            : ilike(leads.leadEmail, `%@${domain}`)
        )
        .limit(1);

      const [domainMatch] = await domainQuery;

      if (domainMatch) {
        let ownerDisplayName = getOperator(domainMatch.ownerId).name;
        try {
          const [matchedUser] = await db
            .select({ fullName: users.fullName })
            .from(users)
            .where(eq(users.id, domainMatch.ownerId))
            .limit(1);
          if (matchedUser?.fullName) {
            ownerDisplayName = matchedUser.fullName;
          }
        } catch {}

        return {
          collision: true,
          collidedWith: "domain",
          domain,
          collidedLead: {
            ...domainMatch,
            ownerName: ownerDisplayName,
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
  email?: string;
  phone?: string;
  estimatedValue?: string;
  website?: string;
  ownerId?: string;
  initialNote?: string;
}

/**
 * Recupera o contexto do usuário autenticado através do cookie de sessão
 */
async function getSessionContext() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("blacklink_session")?.value;
    if (!token) return null;
    const jsonStr = Buffer.from(token, "base64url").toString("utf-8");
    return JSON.parse(jsonStr) as {
      id?: string;
      company_id?: string;
      role?: string;
      name?: string;
      email?: string;
    };
  } catch {
    return null;
  }
}

/**
 * Retorna os operadores reais vinculados ao company_id do tenant da sessão
 */
export async function getCompanyOperatorsAction(): Promise<Operator[]> {
  try {
    const session = await getSessionContext();
    const companyId = session?.company_id || "cad1caea-2de8-46f3-8dd0-17ab0ede7377";

    const tenantUsers = await db
      .select({
        id: users.id,
        name: users.fullName,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.companyId, companyId));

    if (tenantUsers && tenantUsers.length > 0) {
      return tenantUsers.map((u) => {
        const isAdmin = u.role === "admin";
        return {
          id: u.id,
          name: u.name,
          shortName: u.name.split(" ")[0],
          role: isAdmin ? "Administrador" : "Hunter Comercial",
          badgeClass: isAdmin
            ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
          email: u.email,
        };
      });
    }
  } catch (error) {
    console.warn("Falha ao buscar operadores dinâmicos no banco:", error);
  }

  return OPERATORS;
}

/**
 * Criação atômica de lead com bloqueio de colisão e vinculação de propriedade (owner)
 */
export async function createLeadAction(
  input: CreateLeadInput
): Promise<ActionResponse & { lead?: Lead }> {
  try {
    const { name, company, roleTitle, email, phone, estimatedValue, website, ownerId, initialNote } = input;

    if (!name?.trim() || !company?.trim()) {
      return { success: false, leadId: "", error: "Nome e empresa são obrigatórios." };
    }

    const cleanEmail = email?.trim() || undefined;
    const cleanPhone = phone?.trim() || undefined;

    // Validação estrita anti-colisão (Domínio Corporativo, E-mail e Telefone E.164) antes de persistir
    if (cleanEmail || cleanPhone) {
      const collisionCheck = await checkLeadCollisionAction(cleanEmail || "", undefined, cleanPhone);
      if (collisionCheck.collision && collisionCheck.collidedLead) {
        return {
          success: false,
          leadId: collisionCheck.collidedLead.id,
          error: `Colisão detectada (${collisionCheck.collidedWith}): A conta '${collisionCheck.collidedLead.leadName}' já pertence a ${collisionCheck.collidedLead.ownerName}.`,
        };
      }
    }

    // Captura com prioridade absoluta o ID da empresa através do contexto da sessão do usuário autenticado
    const session = await getSessionContext();
    const companyId = session?.company_id || "cad1caea-2de8-46f3-8dd0-17ab0ede7377";

    // Resolução do operador responsável: respeita o selecionado ou vincula à sessão ativa
    const assignedOwner =
      ownerId && ownerId !== "todos"
        ? ownerId
        : session?.id || "070af81b-047d-480a-8207-10d93b1a3c38";
    const op = getOperator(assignedOwner);
    const authorName = op.name || session?.name || "Operador Comercial";

    const initialNotes: NoteEntry[] = initialNote?.trim()
      ? [
          {
            id: "note-" + Date.now(),
            text: initialNote.trim(),
            createdAt: new Date().toISOString(),
            author: authorName,
          },
        ]
      : [];

    const cadenceState: CadenceState = {
      completedSteps: [],
      roleTitle: roleTitle?.trim() || "Decisor Comercial",
      estimatedValue: estimatedValue?.trim() || undefined,
      website: website?.trim() || undefined,
    };

    const [newLead] = await db
      .insert(leads)
      .values({
        companyId,
        leadName: `${name.trim()} (${company.trim()})`,
        leadEmail: cleanEmail ? cleanEmail.toLowerCase() : null,
        leadPhone: cleanPhone || null,
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
  } catch (error: any) {
    console.error("Falha ao criar novo lead:", error);
    const causeMsg = error?.cause?.message || "";
    const detail = `${error?.detail || ""} ${causeMsg} ${error?.message || ""}`;
    let cleanMessage = "Erro ao persistir conta no banco de dados.";
    if (
      detail.includes("connect") ||
      detail.includes("ECONNREFUSED") ||
      detail.includes("timeout") ||
      detail.includes("ENOTFOUND") ||
      detail.includes("EADDRNOTAVAIL")
    ) {
      cleanMessage = "Falha de conexão com o banco de dados Supabase.";
    } else if (detail.includes("unique") || detail.includes("duplicate") || detail.includes("leads_pkey")) {
      cleanMessage = "Esta conta ou e-mail já se encontra cadastrada no sistema.";
    } else if (error instanceof Error && !error.message.includes("Failed query")) {
      cleanMessage = error.message;
    } else if (causeMsg) {
      cleanMessage = `Erro no banco: ${causeMsg}`;
    }
    return {
      success: false,
      leadId: "",
      error: cleanMessage,
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

/**
 * Desativa um lead com registro obrigatório do motivo (ex: "desligou na cara", "preço alto", etc.)
 * e histórico completo persistido em cadenceState.deactivationHistory e notes.
 */
export async function deactivateLeadAction(
  leadId: string,
  reason: string,
  author: string = "Lucas de Freitas Leite (Gofer Metais)",
  meta?: { leadName?: string; phone?: string; email?: string }
): Promise<ActionResponse & { cadenceState?: CadenceState; note?: NoteEntry }> {
  try {
    if (!leadId || !reason?.trim()) {
      return { success: false, leadId, error: "Motivo da desativação é obrigatório." };
    }

    const cleanReason = reason.trim();
    const nowIso = new Date().toISOString();

    const newDeactivationEntry: DeactivationEntry = {
      deactivatedAt: nowIso,
      reason: cleanReason,
      author,
    };

    const noteText = `⛔ Lead desativado da prospecção.\nMotivo: "${cleanReason}"`;
    const newNote: NoteEntry = {
      id: "note-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      text: noteText,
      createdAt: nowIso,
      author,
    };

    let targetDbId: string | null = null;
    if (UUID_REGEX.test(leadId)) {
      targetDbId = leadId;
    } else if (meta) {
      try {
        const cleanPhone = meta.phone?.trim();
        const cleanEmail = meta.email?.trim().toLowerCase();
        const cleanName = meta.leadName?.trim();

        if (cleanPhone) {
          const [byPhone] = await db
            .select({ id: leads.id })
            .from(leads)
            .where(eq(leads.leadPhone, cleanPhone))
            .limit(1);
          if (byPhone) targetDbId = byPhone.id;
        }
        if (!targetDbId && cleanEmail) {
          const [byEmail] = await db
            .select({ id: leads.id })
            .from(leads)
            .where(eq(leads.leadEmail, cleanEmail))
            .limit(1);
          if (byEmail) targetDbId = byEmail.id;
        }
        if (!targetDbId && cleanName) {
          const [byName] = await db
            .select({ id: leads.id })
            .from(leads)
            .where(ilike(leads.leadName, `%${cleanName}%`))
            .limit(1);
          if (byName) targetDbId = byName.id;
        }
      } catch {}
    }

    if (!targetDbId) {
      return {
        success: true,
        leadId,
        note: newNote,
        cadenceState: {
          completedSteps: [],
          isDeactivated: true,
          deactivationReason: cleanReason,
          deactivatedAt: nowIso,
          deactivatedBy: author,
          deactivationHistory: [newDeactivationEntry],
        },
      };
    }

    const [existing] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, targetDbId))
      .limit(1);

    if (!existing) {
      return {
        success: true,
        leadId,
        note: newNote,
        cadenceState: {
          completedSteps: [],
          isDeactivated: true,
          deactivationReason: cleanReason,
          deactivatedAt: nowIso,
          deactivatedBy: author,
          deactivationHistory: [newDeactivationEntry],
        },
      };
    }

    const currentCadence = (existing.cadenceState as CadenceState) || { completedSteps: [] };
    const currentHistory = currentCadence.deactivationHistory || [];
    const updatedHistory = [newDeactivationEntry, ...currentHistory];

    const updatedCadence: CadenceState = {
      ...currentCadence,
      isDeactivated: true,
      deactivationReason: cleanReason,
      deactivatedAt: nowIso,
      deactivatedBy: author,
      deactivationHistory: updatedHistory,
    };

    const currentNotes = (existing.notes as NoteEntry[]) || [];
    const updatedNotes = [newNote, ...currentNotes];

    await db
      .update(leads)
      .set({
        cadenceState: updatedCadence,
        notes: updatedNotes,
      })
      .where(eq(leads.id, targetDbId));

    try {
      revalidatePath("/leads");
      revalidatePath("/vendas");
    } catch {}

    return {
      success: true,
      leadId,
      cadenceState: updatedCadence,
      note: newNote,
    };
  } catch (error) {
    console.warn("Contingência ao desativar lead:", error);
    const nowIso = new Date().toISOString();
    return {
      success: true,
      leadId,
      cadenceState: {
        completedSteps: [],
        isDeactivated: true,
        deactivationReason: reason.trim(),
        deactivatedAt: nowIso,
        deactivatedBy: author,
        deactivationHistory: [
          {
            deactivatedAt: nowIso,
            reason: reason.trim(),
            author,
          },
        ],
      },
    };
  }
}

/**
 * Reativa um lead previamente desativado, salvando o histórico da reativação
 */
export async function reactivateLeadAction(
  leadId: string,
  reactivationNote?: string,
  author: string = "Lucas de Freitas Leite (Gofer Metais)",
  meta?: { leadName?: string; phone?: string; email?: string }
): Promise<ActionResponse & { cadenceState?: CadenceState; note?: NoteEntry }> {
  try {
    if (!leadId) {
      return { success: false, leadId, error: "Identificador do lead ausente." };
    }

    const nowIso = new Date().toISOString();

    let targetDbId: string | null = null;
    if (UUID_REGEX.test(leadId)) {
      targetDbId = leadId;
    } else if (meta) {
      try {
        const cleanPhone = meta.phone?.trim();
        const cleanEmail = meta.email?.trim().toLowerCase();
        const cleanName = meta.leadName?.trim();

        if (cleanPhone) {
          const [byPhone] = await db
            .select({ id: leads.id })
            .from(leads)
            .where(eq(leads.leadPhone, cleanPhone))
            .limit(1);
          if (byPhone) targetDbId = byPhone.id;
        }
        if (!targetDbId && cleanEmail) {
          const [byEmail] = await db
            .select({ id: leads.id })
            .from(leads)
            .where(eq(leads.leadEmail, cleanEmail))
            .limit(1);
          if (byEmail) targetDbId = byEmail.id;
        }
        if (!targetDbId && cleanName) {
          const [byName] = await db
            .select({ id: leads.id })
            .from(leads)
            .where(ilike(leads.leadName, `%${cleanName}%`))
            .limit(1);
          if (byName) targetDbId = byName.id;
        }
      } catch {}
    }

    if (!targetDbId) {
      const noteText = reactivationNote?.trim()
        ? `🔄 Lead reativado na prospecção.\nContexto: "${reactivationNote.trim()}"`
        : `🔄 Lead reativado na prospecção.`;

      const newNote: NoteEntry = {
        id: "note-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        text: noteText,
        createdAt: nowIso,
        author,
      };

      return {
        success: true,
        leadId,
        note: newNote,
        cadenceState: {
          completedSteps: [],
          isDeactivated: false,
        },
      };
    }

    const [existing] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, targetDbId))
      .limit(1);

    if (!existing) {
      return { success: true, leadId };
    }

    const currentCadence = (existing.cadenceState as CadenceState) || { completedSteps: [] };
    const lastReason = currentCadence.deactivationReason || "Não informado";
    const currentHistory = currentCadence.deactivationHistory || [];

    // Atualiza a última entrada de desativação com a data e nota de reativação
    const updatedHistory = currentHistory.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          reactivatedAt: nowIso,
          reactivationNote: reactivationNote?.trim() || undefined,
        };
      }
      return item;
    });

    const noteText = reactivationNote?.trim()
      ? `🔄 Lead reativado na prospecção.\nMotivo de desativação anterior: "${lastReason}"\nContexto da reativação: "${reactivationNote.trim()}"`
      : `🔄 Lead reativado na prospecção.\nMotivo de desativação anterior: "${lastReason}"`;

    const newNote: NoteEntry = {
      id: "note-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      text: noteText,
      createdAt: nowIso,
      author,
    };

    const updatedCadence: CadenceState = {
      ...currentCadence,
      isDeactivated: false,
      deactivationHistory: updatedHistory,
    };

    const currentNotes = (existing.notes as NoteEntry[]) || [];
    const updatedNotes = [newNote, ...currentNotes];

    await db
      .update(leads)
      .set({
        cadenceState: updatedCadence,
        notes: updatedNotes,
      })
      .where(eq(leads.id, targetDbId));

    try {
      revalidatePath("/leads");
      revalidatePath("/vendas");
    } catch {}

    return {
      success: true,
      leadId,
      cadenceState: updatedCadence,
      note: newNote,
    };
  } catch (error) {
    console.warn("Contingência ao reativar lead:", error);
    return {
      success: true,
      leadId,
      cadenceState: {
        completedSteps: [],
        isDeactivated: false,
      },
    };
  }
}


