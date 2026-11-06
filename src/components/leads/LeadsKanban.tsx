"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  AlertCircle,
  Ban,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe,
  GripVertical,
  HeartHandshake,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { KanbanStage, Lead } from "@/db/schema";
import {
  updateLeadStatusAction,
  getCompanyOperatorsAction,
  updateLeadCadenceAction,
  addLeadNoteAction,
  type LeadStatus,
} from "@/actions/leads";
import {
  getNextCadenceAction,
  parseLeadInfo,
  isLeadCompletedToday,
  getLastCompletedTime,
  CADENCE_STEPS,
} from "@/lib/cadence";
import { OPERATORS, getOperator, type Operator } from "@/lib/operators";
import { LeadDetailsSheet } from "./LeadDetailsSheet";
import { AddLeadModal } from "./AddLeadModal";
import { TeamInviteModal } from "./TeamInviteModal";
import {
  GoogleSheetsLeadHunter,
  DEFAULT_SPREADSHEETS,
  type ManagedSpreadsheet,
} from "./GoogleSheetsLeadHunter";
import { PersonalMetricsAnalytics } from "./PersonalMetricsAnalytics";
import { TaskOutcomeModal } from "./TaskOutcomeModal";
import {
  recordPersonalMetricEvent,
  inferSectorFromLead,
} from "@/lib/personalMetrics";
import { StartTourButton } from "@/components/tour/StartTourButton";
import { KANBAN_TOUR_STEPS } from "@/store/useTourStore";
import { useUiStore } from "@/store/useUiStore";
import {
  deduplicateKanbanLeadsList,
  checkLeadCollisionInMemory,
  mergeTwoKanbanLeads,
} from "@/lib/deduplication";
import {
  ANCHOR_CLIENTS_LEADS,
  ANCHOR_SHEET_ID,
  ANCHOR_SHEET_TABS,
  ANCHOR_SHEET_TITLE,
  LEGACY_SHEET_ID,
  LEGACY_SHEET_TABS,
  LEGACY_SHEET_TITLE,
  getEffectiveKanbanStage,
  mapKanbanStageToDbStatus,
  repairAndEnrichKanbanLead,
} from "@/lib/anchorClientsSheetData";

interface LeadsKanbanProps {
  initialLeads: Lead[];
  initialOperators?: Operator[];
  currentUser?: {
    id: string;
    company_id: string;
    role: "admin" | "commercial";
    name: string;
    email: string;
  } | null;
  companyName?: string;
}

interface ColumnConfig {
  id: KanbanStage;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "new",
    title: "Novo Lead",
    subtitle: "Fila de ataque inicial",
    icon: Sparkles,
    accentColor: "text-[#7fa9f7]",
    badgeBg: "bg-[#0f1b33] text-[#7fa9f7]",
  },
  {
    id: "negotiation",
    title: "Em Prospecção",
    subtitle: "Cadência ativa de contato",
    icon: Clock,
    accentColor: "text-[#e8c267]",
    badgeBg: "bg-[#2b2410] text-[#e8c267]",
  },
  {
    id: "quoted",
    title: "Orçamento Enviado",
    subtitle: "Cotação de aços em análise",
    icon: FileText,
    accentColor: "text-[#38bdf8]",
    badgeBg: "bg-[#0b2436] text-[#38bdf8]",
  },
  {
    id: "nurturing",
    title: "Cultivo & Relacionamento",
    subtitle: "Clientes receptivos · Sem spam",
    icon: HeartHandshake,
    accentColor: "text-[#c084fc]",
    badgeBg: "bg-[#241236] text-[#c084fc]",
  },
  {
    id: "closed",
    title: "Fechado",
    subtitle: "Pedido / Fornecimento ativo",
    icon: CheckCircle2,
    accentColor: "text-[#14d06e]",
    badgeBg: "bg-[#0c2b1c] text-[#14d06e]",
  },
];

function buildSeedLeadsFromAnchorSheet(
  companyId = "default-company-id",
  ownerId = "070af81b-047d-480a-8207-10d93b1a3c38"
): Lead[] {
  return ANCHOR_CLIENTS_LEADS.map((row) => ({
    id: `kanban-${row.id}`,
    companyId,
    leadName: row.empresa,
    leadEmail: "",
    leadPhone: row.contato,
    origin: `${ANCHOR_SHEET_TITLE} · ${row.tab}`,
    status: "new",
    dealScore: 94,
    telemetryEvents: [],
    cadenceState: {
      completedSteps: [],
      roleTitle: `${ANCHOR_SHEET_TITLE} · ${row.tab}`,
      companyName: row.empresa,
      phone: row.contato,
      whatsapp: row.contato,
      location: row.cidadeRegiao,
      website: row.website,
      mainProducts: row.linhaProdutos,
      steelMaterials: row.materiaisAco,
      hunterPitch: row.argumentoHunter,
      prospectionStatus: row.statusOriginal || "Não Contatado",
      sourceSpreadsheetId: ANCHOR_SHEET_ID,
      sourceSpreadsheetTitle: ANCHOR_SHEET_TITLE,
      sourceTabName: row.tab,
      kanbanStage: "new",
    },
    notes: [
      {
        id: `note-${row.id}`,
        text: `[Planilha ${ANCHOR_SHEET_TITLE} • ${row.tab}] Produtos: ${row.linhaProdutos} | Aços: ${row.materiaisAco} | Argumento Hunter: ${row.argumentoHunter}`,
        createdAt: new Date().toISOString(),
        author: "Gofer Metais",
      },
    ],
    scriptVersion: "v1_direct",
    ownerId,
    nextActivityDate: null,
    nextActivityType: null,
    createdAt: new Date(),
  }));
}

/**
 * Resolve a qual planilha e aba um card do Kanban pertence
 */
function resolveLeadSpreadsheetMeta(lead: Lead): {
  sheetId: string;
  sheetTitle: string;
  tabName: string;
} {
  const cs = (lead.cadenceState as any) || {};
  const originStr = cs.roleTitle || lead.origin || "";
  const originParts = originStr.split("·").map((s: string) => s.trim());

  let sheetId: string = cs.sourceSpreadsheetId || "";
  let sheetTitle: string = cs.sourceSpreadsheetTitle || (originParts.length > 1 ? originParts[0] : "");
  let tabName: string = cs.sourceTabName || (originParts.length > 1 ? originParts[1] : originParts[0] || "");

  if (
    sheetId === ANCHOR_SHEET_ID ||
    sheetTitle.toLowerCase().includes("âncora") ||
    sheetTitle.toLowerCase().includes("ancora") ||
    ANCHOR_SHEET_TABS.some((t) => t.toLowerCase() === tabName.toLowerCase())
  ) {
    return {
      sheetId: ANCHOR_SHEET_ID,
      sheetTitle: ANCHOR_SHEET_TITLE,
      tabName:
        ANCHOR_SHEET_TABS.find((t) => t.toLowerCase() === tabName.toLowerCase()) ||
        tabName ||
        "Implementos Rodoviários",
    };
  }

  if (
    sheetId === LEGACY_SHEET_ID ||
    sheetTitle.toLowerCase() === "leads" ||
    sheetTitle.toLowerCase().includes("construção modular") ||
    LEGACY_SHEET_TABS.some((t) => t.toLowerCase() === tabName.toLowerCase())
  ) {
    return {
      sheetId: LEGACY_SHEET_ID,
      sheetTitle: LEGACY_SHEET_TITLE,
      tabName:
        LEGACY_SHEET_TABS.find((t) => t.toLowerCase() === tabName.toLowerCase()) ||
        tabName ||
        "Casas Modulares",
    };
  }

  return {
    sheetId: sheetId || sheetTitle || "avulsos",
    sheetTitle: sheetTitle || "Leads Cadastrados Manualmente",
    tabName: tabName || "Geral",
  };
}

/**
 * Calcula dados visuais para a próxima atividade agendada no padrão irvo.com.br
 */
function getActivityInfo(date?: Date | string | null, type?: string | null) {
  if (!date) return null;
  const activityDate = new Date(date);
  if (isNaN(activityDate.getTime())) return null;

  const now = new Date();
  const isToday =
    activityDate.getDate() === now.getDate() &&
    activityDate.getMonth() === now.getMonth() &&
    activityDate.getFullYear() === now.getFullYear();

  const isOverdue = activityDate.getTime() < now.getTime() && !isToday;

  const typeLabels: Record<string, string> = {
    reuniao: "Reunião",
    call: "Ligação",
    follow_up: "Follow-up",
  };
  const label = typeLabels[type?.toLowerCase() || ""] || type || "Atividade";

  const dayMonth = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(activityDate);
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(activityDate);

  const formattedStr = `${label}: ${dayMonth} · ${time}`;

  let badgeClass = "bg-[#0d0d0d] ring-1 ring-[#2e2e2e] text-[#afafaf]";

  if (isToday) {
    badgeClass = "bg-[#2b2410] text-[#e8c267] font-semibold";
  } else if (isOverdue) {
    badgeClass = "bg-[#2b1310] text-[#ff5d48] font-semibold";
  }

  return {
    label,
    formattedStr,
    isToday,
    isOverdue,
    badgeClass,
  };
}

export function LeadsKanban({
  initialLeads,
  initialOperators,
  currentUser,
  companyName,
}: LeadsKanbanProps) {
  const [leadsList, setLeadsList] = useState<Lead[]>(() => {
    const repairedInitial = initialLeads.map((l) => repairAndEnrichKanbanLead(l));
    return deduplicateKanbanLeadsList(repairedInitial).deduplicated;
  });
  const [operators, setOperators] = useState<Operator[]>(initialOperators || OPERATORS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [cardOutcomeLead, setCardOutcomeLead] = useState<Lead | null>(null);
  const [cardOutcomeStepTitle, setCardOutcomeStepTitle] = useState<string | undefined>();
  const [cardOutcomeStepId, setCardOutcomeStepId] = useState<string | undefined>();
  const [isMounted, setIsMounted] = useState(false);
  const activeWorkspaceTab = useUiStore((state) => state.activeVendasTab);
  const setActiveWorkspaceTab = useUiStore((state) => state.setActiveVendasTab);
  const leadSearchQuery = useUiStore((state) => state.leadSearchQuery);
  const setLeadSearchQuery = useUiStore((state) => state.setLeadSearchQuery);

  // Filtro de Fila por Planilha & Aba específica no Kanban
  const [selectedSpreadsheetFilter, setSelectedSpreadsheetFilter] = useState<string>("all");
  const [selectedTabFilter, setSelectedTabFilter] = useState<string>("all");
  const [managedSheets, setManagedSheets] = useState<ManagedSpreadsheet[]>(DEFAULT_SPREADSHEETS);

  const isCommercial = currentUser?.role === "commercial";
  const myUserId = currentUser?.id || "";

  // Mostra todos os leads da operação por padrão para que nenhum lead enviado da planilha fique oculto
  const [activeOperator, setActiveOperator] = useState<string>("todos");

  // Filtro de status de leads: Ativos (padrão) vs Desativados / Perdidos vs Todos
  const [leadStatusFilter, setLeadStatusFilter] = useState<"active" | "deactivated" | "all">("active");

  // Sincroniza operadores dinâmicos
  useEffect(() => {
    if (initialOperators && initialOperators.length > 0) {
      setOperators(initialOperators);
      return;
    }
    getCompanyOperatorsAction().then((ops) => {
      if (ops && ops.length > 0) setOperators(ops);
    });
  }, [initialOperators]);

  // Mapa reativo do estado de cadência por lead derivado do PostgreSQL
  const [cadenceMap, setCadenceMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setIsMounted(true);

    try {
      const savedSheets = localStorage.getItem("gofer_spreadsheets_v3");
      if (savedSheets) {
        const parsedS: ManagedSpreadsheet[] = JSON.parse(savedSheets);
        if (Array.isArray(parsedS) && parsedS.length > 0) {
          setManagedSheets(parsedS);
        }
      }
    } catch {}

    try {
      const savedDeletedRaw = localStorage.getItem("gofer_deleted_sheets_v1");
      const deletedSheetIds: string[] = savedDeletedRaw ? JSON.parse(savedDeletedRaw) : [];
      const isAnchorDeleted =
        deletedSheetIds.includes(ANCHOR_SHEET_ID) ||
        deletedSheetIds.includes("sheet-ancora");

      const savedLocal = localStorage.getItem("gofer_kanban_leads_v1");
      const parsedLocal: Lead[] = savedLocal ? JSON.parse(savedLocal) : [];

      setLeadsList((prev) => {
        const anchorSeeds = isAnchorDeleted
          ? []
          : buildSeedLeadsFromAnchorSheet(
              currentUser?.company_id || "default-company-id",
              currentUser?.id || "070af81b-047d-480a-8207-10d93b1a3c38"
            );

        // Repara todos os leads antigos que tinham cidade no responsável ou site no telefone
        const combined = [...prev, ...parsedLocal, ...anchorSeeds].map((l) =>
          repairAndEnrichKanbanLead(l)
        );
        const { deduplicated } = deduplicateKanbanLeadsList(combined);
        try {
          localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(deduplicated));
        } catch {}
        return deduplicated;
      });
    } catch {}

    const map: Record<string, string[]> = {};
    initialLeads.forEach((lead) => {
      map[lead.id] = lead.cadenceState?.completedSteps || [];
    });
    setCadenceMap(map);
  }, [initialLeads, currentUser?.company_id, currentUser?.id]);

  // Persiste espelho local do Kanban para garantir que leads enviados da planilha nunca sumam
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(leadsList));
    } catch {}
  }, [leadsList, isMounted]);

  // Sincroniza novos leads do servidor sem sobrescrever as alterações locais do operador, garantindo anti-colisão e reparo
  useEffect(() => {
    setLeadsList((prev) => {
      const repairedInitial = initialLeads.map((l) => repairAndEnrichKanbanLead(l));
      if (prev.length === 0) return deduplicateKanbanLeadsList(repairedInitial).deduplicated;
      const combined = [...prev, ...repairedInitial].map((l) => repairAndEnrichKanbanLead(l));
      const { deduplicated } = deduplicateKanbanLeadsList(combined);
      return deduplicated;
    });
  }, [initialLeads]);

  // Abertura do Slide-over Sheet para detalhes executivos do Hunter
  const handleOpenSheet = (lead: Lead) => {
    setSelectedLead(repairAndEnrichKanbanLead(lead));
    setIsSheetOpen(true);
  };

  // Atualização em tempo real do mapa de cadência disparada pelo modal
  const handleCadenceChange = (leadId: string, completedStepIds: string[]) => {
    setCadenceMap((prev) => ({
      ...prev,
      [leadId]: completedStepIds,
    }));

    setLeadsList((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              cadenceState: {
                ...(lead.cadenceState || { completedSteps: [] }),
                completedSteps: completedStepIds,
              },
            }
          : lead
      )
    );
  };

  // Atualização de proprietário (owner)
  const handleOwnerChange = (leadId: string, newOwnerId: string) => {
    setLeadsList((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, ownerId: newOwnerId } : lead
      )
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, ownerId: newOwnerId } : null));
    }
  };

  // Atualização direta dos dados do lead a partir do slide-over lateral
  const handleLeadUpdate = (updatedLead: Lead) => {
    const repaired = repairAndEnrichKanbanLead(updatedLead);
    setLeadsList((prev) => {
      const next = prev.map((lead) => (lead.id === repaired.id ? repaired : lead));
      try {
        localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (selectedLead && selectedLead.id === repaired.id) {
      setSelectedLead(repaired);
    }
  };

  // Alteração de estágio pelo modal, botão rápido ou arrasto (suporta as 5 colunas do Kanban)
  const handleStatusChange = async (leadId: string, newStage: LeadStatus) => {
    const targetLead = leadsList.find((l) => l.id === leadId);
    const dbStatus = mapKanbanStageToDbStatus(newStage);
    const nowIso = new Date().toISOString();

    setLeadsList((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const currentCs = (lead.cadenceState as any) || { completedSteps: [] };
        return {
          ...lead,
          status: dbStatus,
          cadenceState: {
            ...currentCs,
            kanbanStage: newStage,
            ...(newStage === "nurturing"
              ? {
                  nurturingIntervalDays: currentCs.nurturingIntervalDays || 15,
                  nurturingLastTouchAt: currentCs.nurturingLastTouchAt || nowIso,
                }
              : {}),
          },
        };
      })
    );

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => {
        if (!prev) return null;
        const currentCs = (prev.cadenceState as any) || { completedSteps: [] };
        return {
          ...prev,
          status: dbStatus,
          cadenceState: {
            ...currentCs,
            kanbanStage: newStage,
            ...(newStage === "nurturing"
              ? {
                  nurturingIntervalDays: currentCs.nurturingIntervalDays || 15,
                  nurturingLastTouchAt: currentCs.nurturingLastTouchAt || nowIso,
                }
              : {}),
          },
        };
      });
    }

    if (typeof window !== "undefined" && targetLead) {
      window.dispatchEvent(
        new CustomEvent("blacklink:kanban-to-sheets-sync", {
          detail: {
            lead: {
              ...targetLead,
              status: dbStatus,
              cadenceState: {
                ...(targetLead.cadenceState || { completedSteps: [] }),
                kanbanStage: newStage,
              },
            },
            action: "status_changed",
          },
        })
      );
    }

    try {
      await updateLeadStatusAction(leadId, newStage);
    } catch (err) {
      console.error("Falha ao salvar status no banco de dados:", err);
    }
  };

  // Callback de novo lead único cadastrado via AddLeadModal ou importado da Planilha
  const handleLeadCreated = (rawNewLead: Lead, fromKanbanModal = false) => {
    const newLead = repairAndEnrichKanbanLead(rawNewLead);
    setLeadsList((prev) => {
      const collision = checkLeadCollisionInMemory(newLead, prev);
      if (collision.collision && collision.matchedLead) {
        const updatedList = prev.map((l) =>
          l.id === collision.matchedLead!.id ? mergeTwoKanbanLeads(l, newLead) : l
        );
        try {
          localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(updatedList));
        } catch {}
        return updatedList;
      }

      const next = [newLead, ...prev];
      try {
        localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(next));
      } catch {}
      return next;
    });

    if (newLead.cadenceState?.completedSteps) {
      setCadenceMap((prev) => ({
        ...prev,
        [newLead.id]: newLead.cadenceState.completedSteps,
      }));
    }

    if (typeof window !== "undefined" && fromKanbanModal) {
      window.dispatchEvent(
        new CustomEvent("blacklink:kanban-to-sheets-sync", {
          detail: { lead: newLead, action: "created" },
        })
      );
    }
  };

  // Callback de importação em LOTE instantânea (1 única atualização de estado em memória)
  const handleBatchLeadsCreated = (incomingLeads: Lead[]) => {
    if (!incomingLeads || incomingLeads.length === 0) return;
    const repairedBatch = incomingLeads.map((l) => repairAndEnrichKanbanLead(l));

    setLeadsList((prev) => {
      const combined = [...repairedBatch, ...prev];
      const { deduplicated } = deduplicateKanbanLeadsList(combined);
      try {
        localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(deduplicated));
      } catch {}
      return deduplicated;
    });

    // Se todos os leads importados vieram de uma planilha específica, foca nela no filtro do Kanban!
    const firstMeta = resolveLeadSpreadsheetMeta(repairedBatch[0]);
    if (firstMeta.sheetId && firstMeta.sheetId !== "avulsos") {
      setSelectedSpreadsheetFilter(firstMeta.sheetId);
      setSelectedTabFilter("all");
    }
  };

  // Callback quando o usuário exclui uma planilha na Central de Planilhas ou direto pelo Kanban
  const handleSpreadsheetDeleted = (
    deletedSheetId: string,
    deletedSheetTitle: string,
    deletedTabs: string[],
    removeLeadsFromKanban: boolean
  ) => {
    if (selectedSpreadsheetFilter === deletedSheetId || selectedSpreadsheetFilter === deletedSheetTitle) {
      setSelectedSpreadsheetFilter("all");
      setSelectedTabFilter("all");
    }

    try {
      const savedSheets = localStorage.getItem("gofer_spreadsheets_v3");
      if (savedSheets) {
        const parsedS: ManagedSpreadsheet[] = JSON.parse(savedSheets);
        setManagedSheets(parsedS);
      }
    } catch {}

    if (removeLeadsFromKanban) {
      setLeadsList((prev) => {
        const filtered = prev.filter((lead) => {
          const meta = resolveLeadSpreadsheetMeta(lead);
          if (meta.sheetId === deletedSheetId) return false;
          if (
            deletedSheetTitle &&
            meta.sheetTitle.toLowerCase() === deletedSheetTitle.toLowerCase()
          ) {
            return false;
          }
          if (deletedTabs.some((t) => t.toLowerCase() === meta.tabName.toLowerCase())) {
            return false;
          }
          return true;
        });
        try {
          localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(filtered));
        } catch {}
        return filtered;
      });
    }
  };

  // Callback de desfecho rápido registrado diretamente a partir do card no Kanban
  const handleSaveCardOutcome = async (data: {
    outcome: string;
    channel: string;
    notes?: string;
    quotedValue?: number;
    completedStepId?: string;
    bestCallTime?: string;
    bestCallDay?: string;
    preferredCallbackWindow?: string;
  }) => {
    if (!cardOutcomeLead) return;

    const leadTarget = cardOutcomeLead;
    const nowIso = new Date().toISOString();
    const currentOp = currentUser?.name || "Lucas de Freitas Leite (Gofer Metais)";

    const currentCadence = (leadTarget.cadenceState as any) || {};
    const currentCompleted: string[] = currentCadence.completedSteps || [];

    // Captura inteligência de retorno quando o cliente atendeu
    const isCallAnswered = data.channel === "call" && data.outcome !== "nao_atendeu";
    const nowLocalTime = (() => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    })();
    const nowLocalDay = (() => {
      const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
      return days[new Date().getDay()] || "Segunda-feira";
    })();

    const updatedBestCallTime = data.bestCallTime || (isCallAnswered ? currentCadence.bestCallTime || nowLocalTime : currentCadence.bestCallTime);
    const updatedBestCallDay = data.bestCallDay || (isCallAnswered ? currentCadence.bestCallDay || nowLocalDay : currentCadence.bestCallDay);
    const updatedCallbackWindow = data.preferredCallbackWindow || (isCallAnswered ? currentCadence.preferredCallbackWindow || `~${updatedBestCallTime}` : currentCadence.preferredCallbackWindow);

    // Resolve os passos a serem marcados como concluídos
    const stepsToAdd: string[] = [];
    if (data.completedStepId) stepsToAdd.push(data.completedStepId);

    // Se a interação foi via WhatsApp ou Primeiro Contato:
    // Automaticamente dá OK na atividade de contato WPP da esteira (step-1 e step-2)
    if (data.channel === "whatsapp" || data.outcome === "pediu_whatsapp") {
      stepsToAdd.push("step-1", "step-2", "1º Contato");
    } else if (!data.completedStepId) {
      const firstPending = CADENCE_STEPS.find((s) => !currentCompleted.includes(s.id));
      if (firstPending) stepsToAdd.push(firstPending.id);
    }

    const nextSteps = Array.from(new Set([...currentCompleted, ...stepsToAdd]));

    // Se orçou, avança automaticamente para Orçamento Enviado ("quoted")
    const currentStage = getEffectiveKanbanStage(leadTarget);
    const nextStage: KanbanStage =
      data.outcome === "solicitou_orcamento" || Boolean(data.quotedValue)
        ? "quoted"
        : currentStage === "new"
        ? "negotiation"
        : currentStage;
    const nextStatus = mapKanbanStageToDbStatus(nextStage);

    const currentNotes = leadTarget.notes || [];
    const nextNotes = data.notes
      ? [
          {
            id: "note-" + Date.now(),
            text: data.notes,
            createdAt: nowIso,
            author: currentOp,
          },
          ...currentNotes,
        ]
      : currentNotes;

    setLeadsList((prev) => {
      const next = prev.map((l) => {
        if (l.id !== leadTarget.id) return l;

        return {
          ...l,
          status: nextStatus,
          notes: nextNotes,
          cadenceState: {
            ...currentCadence,
            kanbanStage: nextStage,
            completedSteps: nextSteps,
            lastCompletedAt: nowIso,
            lastAnsweredAt: isCallAnswered ? nowIso : currentCadence.lastAnsweredAt,
            bestCallTime: updatedBestCallTime,
            bestCallDay: updatedBestCallDay,
            preferredCallbackWindow: updatedCallbackWindow,
            estimatedValue: data.quotedValue ? `R$ ${data.quotedValue.toLocaleString("pt-BR")}` : currentCadence.estimatedValue,
          },
        };
      });

      try {
        localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(next));
      } catch {}
      return next;
    });

    setCadenceMap((prev) => ({
      ...prev,
      [leadTarget.id]: nextSteps,
    }));

    try {
      await updateLeadCadenceAction(leadTarget.id, {
        kanbanStage: nextStage,
        completedSteps: nextSteps,
        lastCompletedAt: nowIso,
        lastAnsweredAt: isCallAnswered ? nowIso : currentCadence.lastAnsweredAt,
        bestCallTime: updatedBestCallTime,
        bestCallDay: updatedBestCallDay,
        preferredCallbackWindow: updatedCallbackWindow,
        estimatedValue: data.quotedValue ? `R$ ${data.quotedValue.toLocaleString("pt-BR")}` : currentCadence.estimatedValue,
      });
      if (data.notes) {
        await addLeadNoteAction(leadTarget.id, data.notes, currentOp);
      }
    } catch (err) {
      console.warn("Falha ao sincronizar desfecho no banco:", err);
    }
  };

  // Conclusão com 1-clique (Move para o final da coluna em verde fluorescente)
  const handleQuickCompleteLead = async (lead: Lead, stepTitle?: string, stepId?: string) => {
    const actionName = stepTitle || "Atividade de Prospecção";
    const nowIso = new Date().toISOString();
    const currentOp = currentUser?.name || "Lucas de Freitas Leite (Gofer Metais)";

    const isWpp = actionName.toLowerCase().includes("wpp") || actionName.toLowerCase().includes("whats");
    const isEmail = actionName.toLowerCase().includes("mail");
    const channel = isEmail ? "email" : isWpp ? "whatsapp" : "call";

    const currentCadence = (lead.cadenceState as any) || {};
    const currentCompleted: string[] = currentCadence.completedSteps || [];

    // Resolve o step ID correto da cadência
    const resolvedStepId = stepId || CADENCE_STEPS.find((s) => !currentCompleted.includes(s.id))?.id || "step-1";
    const stepsToAdd: string[] = [resolvedStepId, actionName];

    // Se for atividade de WhatsApp ou Primeiro Contato:
    // Automaticamente dá OK na atividade de contato WPP da esteira (step-1 e step-2)
    if (resolvedStepId === "step-1" || resolvedStepId === "step-2" || isWpp) {
      stepsToAdd.push("step-1", "step-2", "1º Contato");
    }

    const nextSteps = Array.from(new Set([...currentCompleted, ...stepsToAdd]));

    recordPersonalMetricEvent({
      operatorId: currentUser?.id || "lucas-freitas",
      operatorName: currentOp,
      leadId: lead.id,
      leadName: (lead.cadenceState as any)?.contactPerson || parseLeadInfo(lead.leadName || "").name || lead.leadName,
      companyName: (lead.cadenceState as any)?.companyName || parseLeadInfo(lead.leadName || "").company || lead.leadName,
      sector: inferSectorFromLead(lead),
      channel,
      outcome: "atendeu",
      stepId: resolvedStepId,
      stepTitle: actionName,
      notes: `✓ ${actionName} concluída via Fila Inteligente com 1 clique`,
    });

    const isCall = channel === "call";
    const nowLocalTime = (() => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    })();
    const nowLocalDay = (() => {
      const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
      return days[new Date().getDay()] || "Segunda-feira";
    })();

    const updatedBestCallTime = isCall ? (currentCadence.bestCallTime || nowLocalTime) : currentCadence.bestCallTime;
    const updatedBestCallDay = isCall ? (currentCadence.bestCallDay || nowLocalDay) : currentCadence.bestCallDay;
    const updatedCallbackWindow = isCall ? (currentCadence.preferredCallbackWindow || `~${updatedBestCallTime}`) : currentCadence.preferredCallbackWindow;

    const newNote = {
      id: "note-" + Date.now(),
      text: `[CADÊNCIA] ✓ ${actionName} concluída hoje com sucesso por ${currentOp}.`,
      createdAt: nowIso,
      author: currentOp,
    };

    setLeadsList((prev) => {
      const next = prev.map((l) => {
        if (l.id !== lead.id) return l;

        return {
          ...l,
          notes: [newNote, ...(l.notes || [])],
          cadenceState: {
            ...currentCadence,
            completedSteps: nextSteps,
            lastCompletedAt: nowIso,
            lastAnsweredAt: isCall ? nowIso : currentCadence.lastAnsweredAt,
            bestCallTime: updatedBestCallTime,
            bestCallDay: updatedBestCallDay,
            preferredCallbackWindow: updatedCallbackWindow,
            ...(getEffectiveKanbanStage(l) === "nurturing"
              ? { nurturingLastTouchAt: nowIso }
              : {}),
          },
        };
      });

      try {
        localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(next));
      } catch {}
      return next;
    });

    setCadenceMap((prev) => ({
      ...prev,
      [lead.id]: nextSteps,
    }));

    try {
      await updateLeadCadenceAction(lead.id, {
        completedSteps: nextSteps,
        lastCompletedAt: nowIso,
        lastAnsweredAt: isCall ? nowIso : currentCadence.lastAnsweredAt,
        bestCallTime: updatedBestCallTime,
        bestCallDay: updatedBestCallDay,
        preferredCallbackWindow: updatedCallbackWindow,
      });
      await addLeadNoteAction(lead.id, newNote.text, currentOp);
    } catch (err) {
      console.warn("Falha ao salvar conclusão da cadência no banco:", err);
    }
  };

  // Callback de atividade agendada e Hand-off processado
  const handleActivityScheduled = (
    leadId: string,
    activityDate: Date,
    activityType: string,
    newOwnerId?: string
  ) => {
    setLeadsList((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              nextActivityDate: activityDate,
              nextActivityType: activityType,
              ...(newOwnerId ? { ownerId: newOwnerId } : {}),
            }
          : l
      )
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) =>
        prev
          ? {
              ...prev,
              nextActivityDate: activityDate,
              nextActivityType: activityType,
              ...(newOwnerId ? { ownerId: newOwnerId } : {}),
            }
          : null
      );
    }
  };

  // Tratamento do término do arrasto (Drag End) entre as 5 colunas do Kanban
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destStage = destination.droppableId as KanbanStage;
    const dbStatus = mapKanbanStageToDbStatus(destStage);
    const nowIso = new Date().toISOString();
    const movedTarget = leadsList.find((item) => item.id === draggableId);

    setLeadsList((prev) => {
      const currentList = [...prev];
      const targetIndex = currentList.findIndex((item) => item.id === draggableId);
      if (targetIndex === -1) return prev;

      const [movedLead] = currentList.splice(targetIndex, 1);
      const currentCs = (movedLead.cadenceState as any) || { completedSteps: [] };
      const updatedLead: Lead = {
        ...movedLead,
        status: dbStatus,
        cadenceState: {
          ...currentCs,
          kanbanStage: destStage,
          ...(destStage === "nurturing"
            ? {
                nurturingIntervalDays: currentCs.nurturingIntervalDays || 15,
                nurturingLastTouchAt: currentCs.nurturingLastTouchAt || nowIso,
              }
            : {}),
        },
      };

      const destLeads = currentList.filter(
        (item) => getEffectiveKanbanStage(item) === destStage
      );
      const otherLeads = currentList.filter(
        (item) => getEffectiveKanbanStage(item) !== destStage
      );

      destLeads.splice(destination.index, 0, updatedLead);

      return [...destLeads, ...otherLeads];
    });

    if (selectedLead && selectedLead.id === draggableId) {
      setSelectedLead((prev) => {
        if (!prev) return null;
        const currentCs = (prev.cadenceState as any) || { completedSteps: [] };
        return {
          ...prev,
          status: dbStatus,
          cadenceState: {
            ...currentCs,
            kanbanStage: destStage,
          },
        };
      });
    }

    if (typeof window !== "undefined" && movedTarget) {
      window.dispatchEvent(
        new CustomEvent("blacklink:kanban-to-sheets-sync", {
          detail: {
            lead: {
              ...movedTarget,
              status: dbStatus,
              cadenceState: {
                ...(movedTarget.cadenceState || { completedSteps: [] }),
                kanbanStage: destStage,
              },
            },
            action: "status_changed",
          },
        })
      );
    }

    try {
      await updateLeadStatusAction(draggableId, destStage);
    } catch (err) {
      console.error("Falha na Server Action de atualização de lead:", err);
    }
  };

  // Contadores de status de leads
  const activeLeadsCount = leadsList.filter((l) => !(l.cadenceState as any)?.isDeactivated).length;
  const deactivatedLeadsCount = leadsList.filter((l) => (l.cadenceState as any)?.isDeactivated).length;

  // Filtragem de visualização do Kanban (Operador)
  const baseLeadsByOperator =
    activeOperator === "todos"
      ? leadsList
      : leadsList.filter(
          (l) =>
            (l.ownerId || operators[0]?.id) === activeOperator ||
            (currentUser?.email && l.ownerId === currentUser.email)
        );

  // Filas de Planilhas disponíveis no Kanban (calculadas dinamicamente a partir dos leads + planilhas conectadas)
  const spreadsheetQueues = useMemo(() => {
    const map = new Map<
      string,
      {
        sheetId: string;
        sheetTitle: string;
        tabs: Map<string, number>;
        totalCount: number;
      }
    >();

    // Garante que as planilhas conectadas apareçam no seletor
    for (const ms of managedSheets) {
      const mId =
        ms.sheetUrl.includes(ANCHOR_SHEET_ID) || ms.id === "sheet-ancora"
          ? ANCHOR_SHEET_ID
          : ms.sheetUrl.includes(LEGACY_SHEET_ID) || ms.id === "sheet-leads"
          ? LEGACY_SHEET_ID
          : ms.id;
      if (!map.has(mId)) {
        const tabMap = new Map<string, number>();
        ms.tabs.forEach((t) => tabMap.set(t, 0));
        map.set(mId, {
          sheetId: mId,
          sheetTitle: ms.title,
          tabs: tabMap,
          totalCount: 0,
        });
      }
    }

    // Conta os leads reais de cada planilha e aba
    for (const lead of baseLeadsByOperator) {
      const isDeactivated = Boolean((lead.cadenceState as any)?.isDeactivated);
      if (leadStatusFilter === "active" && isDeactivated) continue;
      if (leadStatusFilter === "deactivated" && !isDeactivated) continue;

      const meta = resolveLeadSpreadsheetMeta(lead);
      const existing = map.get(meta.sheetId);
      if (existing) {
        existing.totalCount += 1;
        existing.tabs.set(meta.tabName, (existing.tabs.get(meta.tabName) || 0) + 1);
      } else {
        const tabMap = new Map<string, number>();
        tabMap.set(meta.tabName, 1);
        map.set(meta.sheetId, {
          sheetId: meta.sheetId,
          sheetTitle: meta.sheetTitle,
          tabs: tabMap,
          totalCount: 1,
        });
      }
    }

    return Array.from(map.values()).filter((q) => q.totalCount > 0 || q.sheetId === ANCHOR_SHEET_ID);
  }, [baseLeadsByOperator, managedSheets, leadStatusFilter]);

  const activeSelectedQueue = useMemo(
    () => spreadsheetQueues.find((q) => q.sheetId === selectedSpreadsheetFilter) || null,
    [spreadsheetQueues, selectedSpreadsheetFilter]
  );

  const displayedLeads = baseLeadsByOperator.filter((l) => {
    const isDeactivated = Boolean((l.cadenceState as any)?.isDeactivated);
    if (leadStatusFilter === "active" && isDeactivated) return false;
    if (leadStatusFilter === "deactivated" && !isDeactivated) return false;

    // Filtro por Planilha e Aba específica no Kanban
    if (selectedSpreadsheetFilter !== "all") {
      const meta = resolveLeadSpreadsheetMeta(l);
      if (meta.sheetId !== selectedSpreadsheetFilter) return false;
      if (
        selectedTabFilter !== "all" &&
        meta.tabName.toLowerCase() !== selectedTabFilter.toLowerCase()
      ) {
        return false;
      }
    }

    // Filtro da Barra de Pesquisa de Leads (inclui produtos, materiais de aço e argumento Hunter)
    if (leadSearchQuery && leadSearchQuery.trim()) {
      const q = leadSearchQuery.toLowerCase().trim();
      const cardCadence = (l.cadenceState as any) || {};
      const parsed = parseLeadInfo(l.leadName || "");
      const company = (cardCadence.companyName || parsed.company || parsed.name || l.leadName || "").toLowerCase();
      const person = (cardCadence.contactPerson || parsed.name || "").toLowerCase();
      const location = (cardCadence.location || "").toLowerCase();
      const mainProducts = (cardCadence.mainProducts || "").toLowerCase();
      const steelMaterials = (cardCadence.steelMaterials || "").toLowerCase();
      const hunterPitch = (cardCadence.hunterPitch || "").toLowerCase();
      const rawPhone = (cardCadence.whatsapp || cardCadence.phone || l.leadPhone || "").toLowerCase();
      const cleanPhoneDigits = rawPhone.replace(/\D/g, "");
      const cleanQDigits = q.replace(/\D/g, "");
      const email = (l.leadEmail || "").toLowerCase();
      const website = (cardCadence.website || "").toLowerCase();
      const deactivationReason = (cardCadence.deactivationReason || "").toLowerCase();
      const notesText = (l.notes || []).map((n) => n.text.toLowerCase()).join(" ");

      const matches =
        company.includes(q) ||
        person.includes(q) ||
        location.includes(q) ||
        mainProducts.includes(q) ||
        steelMaterials.includes(q) ||
        hunterPitch.includes(q) ||
        website.includes(q) ||
        rawPhone.includes(q) ||
        (cleanQDigits.length >= 3 && cleanPhoneDigits.includes(cleanQDigits)) ||
        email.includes(q) ||
        deactivationReason.includes(q) ||
        notesText.includes(q);

      if (!matches) return false;
    }

    return true;
  });

  const getLeadsByStatus = (stage: KanbanStage) => {
    const statusLeads = displayedLeads.filter(
      (lead) => getEffectiveKanbanStage(lead) === stage
    );

    // Fila Inteligente:
    // 1. Leads com pendências imediatas (Atrasados e Hoje) no TOPO
    // 2. Leads já concluídos hoje ou com tarefas apenas para AMANHÃ / FUTURO no FINAL (verde fluorescente)
    const pending = statusLeads.filter((lead) => !isLeadCompletedToday(lead));
    const completedOrFuture = statusLeads.filter((lead) => isLeadCompletedToday(lead));

    const sortedPending = [...pending].sort((a, b) => {
      const actionA = getNextCadenceAction(a.createdAt, a.cadenceState?.completedSteps || [], a.status);
      const actionB = getNextCadenceAction(b.createdAt, b.cadenceState?.completedSteps || [], b.status);
      const score = (type: string) => (type === "overdue" ? 3 : type === "today" ? 2 : 1);
      return score(actionB.type) - score(actionA.type);
    });

    return [...sortedPending, ...completedOrFuture];
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <div className="space-y-4">
      {/* Módulos Google Sheets (Planilha, Cadência, Nichos e Integração) — Controlados pelas abas na barra lateral esquerda */}
      <div className={activeWorkspaceTab === "kanban" || activeWorkspaceTab === "metricas" ? "hidden" : "block"}>
        <GoogleSheetsLeadHunter
          companyName={companyName || "Gofer Metais"}
          onLeadImportedToKanban={handleLeadCreated}
          onBatchLeadsImportedToKanban={handleBatchLeadsCreated}
          onSpreadsheetDeleted={handleSpreadsheetDeleted}
          activeWorkspaceTab={activeWorkspaceTab}
          onWorkspaceTabChange={setActiveWorkspaceTab}
          currentUserId={currentUser?.id}
          currentCompanyId={currentUser?.company_id}
        />
      </div>

      {/* ABA 5: MÉTRICAS PESSOAIS & ASSERTIVIDADE COM IA */}
      {activeWorkspaceTab === "metricas" && (
        <PersonalMetricsAnalytics
          leadsList={leadsList}
          currentOperatorName={currentUser?.name || "Lucas de Freitas Leite"}
          onNavigateToKanban={() => setActiveWorkspaceTab("kanban")}
        />
      )}

      {/* ABA 4: PIPELINE KANBAN (ESTÉTICA ARQUITETÔNICA IRVO.COM.BR) */}
      {activeWorkspaceTab === "kanban" && (
        <div className="space-y-3">
          {/* BARRA DE SELEÇÃO DE FILA POR PLANILHA & ABA NO KANBAN */}
          <div className="rounded-xl bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#afafaf] mr-1 shrink-0">
                  <Layers className="size-3.5 text-[#14d06e]" />
                  <span>Fila da Planilha:</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpreadsheetFilter("all");
                    setSelectedTabFilter("all");
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedSpreadsheetFilter === "all"
                      ? "bg-white text-[#0d0d0d] shadow-sm"
                      : "bg-[#171717] text-[#afafaf] hover:text-white ring-1 ring-[#2a2a2a]"
                  }`}
                >
                  <span>Todas as Planilhas</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                      selectedSpreadsheetFilter === "all"
                        ? "bg-[#0d0d0d]/15 text-[#0d0d0d]"
                        : "bg-[#262626] text-[#afafaf]"
                    }`}
                  >
                    {activeLeadsCount}
                  </span>
                </button>

                {spreadsheetQueues.map((q) => {
                  const isSelected = selectedSpreadsheetFilter === q.sheetId;
                  return (
                    <button
                      key={q.sheetId}
                      type="button"
                      onClick={() => {
                        setSelectedSpreadsheetFilter(q.sheetId);
                        setSelectedTabFilter("all");
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm"
                          : "bg-[#171717] text-[#cfcfcf] hover:text-white ring-1 ring-[#2a2a2a]"
                      }`}
                    >
                      <FileSpreadsheet className="size-3.5 shrink-0" />
                      <span className="max-w-[240px] truncate">{q.sheetTitle}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                          isSelected
                            ? "bg-[#0d0d0d]/20 text-[#0d0d0d]"
                            : "bg-[#262626] text-[#afafaf]"
                        }`}
                      >
                        {q.totalCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Botões rápidos: Excluir planilha selecionada ou gerenciar planilhas */}
              <div className="flex items-center gap-2 shrink-0">
                {activeSelectedQueue && activeSelectedQueue.sheetId !== "avulsos" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        window.confirm(
                          `Deseja excluir a planilha "${activeSelectedQueue.sheetTitle}" e remover seus ${activeSelectedQueue.totalCount} leads do Kanban?`
                        )
                      ) {
                        window.dispatchEvent(
                          new CustomEvent("blacklink:request-delete-spreadsheet", {
                            detail: {
                              sheetId: activeSelectedQueue.sheetId,
                              removeLeadsFromKanban: true,
                            },
                          })
                        );
                        handleSpreadsheetDeleted(
                          activeSelectedQueue.sheetId,
                          activeSelectedQueue.sheetTitle,
                          Array.from(activeSelectedQueue.tabs.keys()),
                          true
                        );
                      }
                    }}
                    title="Excluir esta planilha e remover os cards dela do Kanban"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2b1310] hover:bg-[#3a1915] ring-1 ring-[#ff5d48]/40 px-2.5 py-1.5 text-[11px] font-semibold text-[#ff5d48] transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Excluir Planilha</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab("planilha")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] ring-1 ring-[#2e2e2e] px-2.5 py-1.5 text-[11px] font-semibold text-[#cfcfcf] hover:text-white transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="size-3.5 text-[#14d06e]" />
                  <span>Gerenciar Planilhas</span>
                </button>
              </div>
            </div>

            {/* Sub-barra de Abas quando uma planilha específica está selecionada */}
            {activeSelectedQueue && activeSelectedQueue.tabs.size > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#222222]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] mr-1 shrink-0">
                  Setor / Aba:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTabFilter("all")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                    selectedTabFilter === "all"
                      ? "bg-white text-[#0d0d0d]"
                      : "bg-[#161616] text-[#afafaf] hover:text-white ring-1 ring-[#2a2a2a]"
                  }`}
                >
                  <span>Todas as abas ({activeSelectedQueue.totalCount})</span>
                </button>
                {Array.from(activeSelectedQueue.tabs.entries()).map(([tabName, count]) => {
                  const isTabActive = selectedTabFilter.toLowerCase() === tabName.toLowerCase();
                  return (
                    <button
                      key={tabName}
                      type="button"
                      onClick={() => setSelectedTabFilter(tabName)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                        isTabActive
                          ? "bg-[#14d06e]/20 text-[#14d06e] ring-1 ring-[#14d06e]"
                          : "bg-[#161616] text-[#afafaf] hover:text-white ring-1 ring-[#2a2a2a]"
                      }`}
                    >
                      <span>{tabName}</span>
                      <span className="rounded-full bg-black/30 px-1.5 text-[10px] tabular-nums">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Barra de Operador, Status e Pesquisa do Kanban */}
          <div className="rounded-xl bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            {isCommercial ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-1.5 text-xs text-white">
                  <span className="size-2 rounded-full bg-[#14d06e]" />
                  <span className="font-semibold">Carteira:</span>
                  <span>{currentUser?.name || "Operador Comercial"}</span>
                </div>
                <span className="text-xs text-[#afafaf] tabular-nums">
                  {displayedLeads.length}{" "}
                  {displayedLeads.length === 1
                    ? "conta na fila"
                    : "contas na fila"}
                </span>
              </div>
            ) : (
              <div
                data-tour="kanban-operator-filter"
                className="flex items-center gap-2.5"
              >
                <span className="text-xs font-medium text-[#afafaf]">
                  Operador:
                </span>
                <select
                  value={activeOperator}
                  onChange={(e) => setActiveOperator(e.target.value)}
                  className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-1.5 text-xs font-medium text-white focus:ring-white focus:outline-none cursor-pointer"
                >
                  <option value="todos">
                    Todos os Operadores ({displayedLeads.length} na fila)
                  </option>
                  {operators.map((op) => {
                    const count = leadsList.filter(
                      (l) => (l.ownerId || operators[0]?.id) === op.id
                    ).length;
                    return (
                      <option key={op.id} value={op.id}>
                        {op.name} ({op.role}) — {count} contas
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Filtro de Status: Ativos vs Desativados / Perdidos */}
            <div className="inline-flex rounded-md bg-[#1a1a1a] p-0.5 ring-1 ring-[#2e2e2e]">
              <button
                type="button"
                onClick={() => setLeadStatusFilter("active")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  leadStatusFilter === "active"
                    ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm"
                    : "text-[#afafaf] hover:text-white"
                }`}
              >
                Ativos ({activeLeadsCount})
              </button>
              <button
                type="button"
                onClick={() => setLeadStatusFilter("deactivated")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  leadStatusFilter === "deactivated"
                    ? "bg-[#ff5d48] text-[#0d0d0d] shadow-sm"
                    : "text-[#afafaf] hover:text-white"
                }`}
              >
                Desativados ({deactivatedLeadsCount})
              </button>
              <button
                type="button"
                onClick={() => setLeadStatusFilter("all")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  leadStatusFilter === "all"
                    ? "bg-white text-[#0d0d0d] shadow-sm"
                    : "text-[#afafaf] hover:text-white"
                }`}
              >
                Todos ({leadsList.length})
              </button>
            </div>

            {/* Barra de Pesquisa de Leads no Kanban */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-400" />
              <input
                type="text"
                value={leadSearchQuery}
                onChange={(e) => setLeadSearchQuery(e.target.value)}
                placeholder="Pesquisar empresa, cidade, aço (A36, inox), tel..."
                className="h-8.5 w-full rounded-md border border-[#2e2e2e] bg-[#1a1a1a] pl-8.5 pr-8 text-xs text-white placeholder:text-zinc-500 focus:border-[#14d06e] focus:outline-none"
              />
              {leadSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLeadSearchQuery("")}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#262626] transition-colors cursor-pointer"
              >
                <Users className="size-3.5 text-[#afafaf]" />
                <span>Equipe</span>
              </button>

              <StartTourButton
                steps={KANBAN_TOUR_STEPS}
                variant="secondary"
                label="Guia"
              />

              <button
                data-tour="kanban-new-lead"
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0d0d0d] hover:bg-white/90 transition-colors cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Novo Lead</span>
              </button>
            </div>
          </div>

          {/* Indicador de Busca Ativa */}
          {leadSearchQuery && leadSearchQuery.trim() && (
            <div className="flex items-center justify-between rounded-lg bg-[#141414] ring-1 ring-[#2e2e2e] px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-white">
                <Search className="size-3.5 text-[#14d06e]" />
                <span>
                  Resultados da pesquisa por: <strong className="text-[#14d06e]">&ldquo;{leadSearchQuery}&rdquo;</strong>
                </span>
                <span className="text-[#afafaf] font-mono">
                  &bull; {displayedLeads.length} {displayedLeads.length === 1 ? "lead encontrado" : "leads encontrados"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLeadSearchQuery("")}
                className="text-xs text-[#afafaf] hover:text-white underline cursor-pointer"
              >
                Limpar pesquisa
              </button>
            </div>
          )}

          {isMounted ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <div
                data-tour="kanban-columns"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 border-t border-l border-[#2e2e2e]"
              >
              {COLUMNS.map((column) => {
                const columnLeads = getLeadsByStatus(column.id);
                const ColumnIcon = column.icon;

                return (
                  <div
                    key={column.id}
                    className="flex flex-col border-r border-b border-[#2e2e2e] bg-[#0d0d0d] min-h-[540px]"
                  >
                    {/* Cabeçalho da Coluna */}
                    <div className="flex items-center justify-between border-b border-[#2e2e2e] px-3 py-3 bg-[#161616]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <ColumnIcon className={`size-3.5 shrink-0 ${column.accentColor}`} />
                          <h2 className="text-xs font-bold text-white truncate">
                            {column.title}
                          </h2>
                        </div>
                        <p className="text-[10px] text-[#8a8a8a] truncate mt-0.5">
                          {column.subtitle}
                        </p>
                      </div>

                      <span
                        className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-bold tabular-nums shrink-0 ${column.badgeBg}`}
                      >
                        {columnLeads.length}
                      </span>
                    </div>

                    {/* Área Droppable da Coluna */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex flex-col flex-1 p-2.5 space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto transition-colors ${
                            snapshot.isDraggingOver ? "bg-[#1a1a1a]/70" : ""
                          }`}
                        >
                          {columnLeads.map((lead, index) => {
                            const parsed = parseLeadInfo(lead.leadName);
                            const completed =
                              cadenceMap[lead.id] ||
                              lead.cadenceState?.completedSteps ||
                              [];
                            const actionInfo = getNextCadenceAction(
                              lead.createdAt,
                              completed,
                              lead.status
                            );
                            const op = getOperator(lead.ownerId);
                            const activityInfo = getActivityInfo(
                              lead.nextActivityDate,
                              lead.nextActivityType
                            );

                            const cardCadence = (lead.cadenceState as any) || {};
                            const isDeactivated = Boolean(cardCadence.isDeactivated);
                            const isCompletedToday = isLeadCompletedToday(lead);
                            const lastCompletedTime = getLastCompletedTime(lead);
                            const effectiveStage = getEffectiveKanbanStage(lead);
                            const sheetMeta = resolveLeadSpreadsheetMeta(lead);

                            return (
                              <Draggable
                                key={lead.id}
                                draggableId={lead.id}
                                index={index}
                              >
                                {(dragProvided, dragSnapshot) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    onClick={() => {
                                      if (dragSnapshot.isDragging) return;
                                      handleOpenSheet(lead);
                                    }}
                                    className={`rounded-xl p-3 space-y-2 transition-all select-none group cursor-grab active:cursor-grabbing border ${
                                      isDeactivated
                                        ? "bg-[#140e0e] border-[#ff5d48]/30 opacity-80 hover:opacity-100"
                                        : dragSnapshot.isDragging
                                        ? "bg-[#202020] border-[#7fa9f7]/70 z-50 shadow-2xl scale-[1.02]"
                                        : isCompletedToday
                                        ? "bg-[#0b1b13]/85 border-emerald-500/30 hover:border-emerald-500/50 shadow-sm"
                                        : effectiveStage === "nurturing"
                                        ? "bg-[#171120] border-purple-500/25 hover:border-purple-400/50 shadow-sm"
                                        : effectiveStage === "quoted"
                                        ? "bg-[#0e1922] border-sky-500/25 hover:border-sky-400/50 shadow-sm"
                                        : "bg-[#161616] border-white/[0.08] hover:border-white/[0.18] hover:bg-[#191919] shadow-sm"
                                    }`}
                                  >
                                    {/* Indicador de Lead Desativado */}
                                    {isDeactivated && (
                                      <div className="flex items-center justify-between gap-1 text-[10px] text-[#ff5d48] bg-[#2b1310]/80 border border-[#ff5d48]/30 px-2 py-1 rounded-md font-mono font-medium">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <Ban className="size-3 shrink-0" />
                                          <span className="truncate">Desativado: {cardCadence.deactivationReason || "Descartado"}</span>
                                        </div>
                                        <span className="text-[9px] text-[#14d06e] font-sans hover:underline shrink-0 font-semibold">Reativar</span>
                                      </div>
                                    )}

                                    {/* Badge de Cultivo & Relacionamento */}
                                    {effectiveStage === "nurturing" && !isDeactivated && (
                                      <div className="flex items-center justify-between gap-1 text-[10px] text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-md font-medium">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <HeartHandshake className="size-3 shrink-0 text-purple-400" />
                                          <span className="truncate">
                                            🌱 Cultivo ({cardCadence.nurturingIntervalDays || 15}d) · Sem pressão
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Badge de Orçamento Enviado */}
                                    {effectiveStage === "quoted" && !isDeactivated && (
                                      <div className="flex items-center justify-between gap-1 text-[10px] text-sky-300 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded-md font-medium">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <FileText className="size-3 shrink-0 text-sky-400" />
                                          <span className="truncate">
                                            📄 Orçamento Enviado {cardCadence.estimatedValue ? `(${cardCadence.estimatedValue})` : ""}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Indicador Suave de Lead Concluído Hoje */}
                                    {isCompletedToday && (
                                      <div className="flex items-center justify-between gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <CheckCircle2 className="size-3 shrink-0 text-emerald-400" />
                                          <span className="truncate">
                                            {lastCompletedTime
                                              ? `Concluído hoje às ${lastCompletedTime}`
                                              : "Concluído hoje"}
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-emerald-300 font-mono shrink-0 uppercase tracking-wide">
                                          {actionInfo.type === "future" ? actionInfo.temporalTag : "OK"}
                                        </span>
                                      </div>
                                    )}

                                    {/* Alerta de Retorno no Mesmo Dia & Horário em que Atendeu */}
                                    {cardCadence.bestCallTime && (() => {
                                      let isCallbackWindowActive = false;
                                      try {
                                        const [hStr, mStr] = cardCadence.bestCallTime.split(":");
                                        const h = parseInt(hStr, 10);
                                        const m = parseInt(mStr || "0", 10);
                                        if (!isNaN(h)) {
                                          const now = new Date();
                                          const nowMinutes = now.getHours() * 60 + now.getMinutes();
                                          const targetMinutes = h * 60 + (isNaN(m) ? 0 : m);
                                          isCallbackWindowActive = Math.abs(nowMinutes - targetMinutes) <= 45;
                                        }
                                      } catch {}

                                      if (isCallbackWindowActive) {
                                        return (
                                          <div
                                            className="flex items-center justify-between gap-1 text-[10px] text-amber-200 bg-amber-950/80 border border-amber-500/50 px-2 py-1 rounded-md font-medium shadow-sm animate-pulse"
                                            title="Janela ativa agora! Este cliente costuma atender por volta deste horário."
                                          >
                                            <div className="flex items-center gap-1.5 truncate">
                                              <Flame className="size-3 shrink-0 text-amber-400" />
                                              <span className="truncate font-bold">
                                                🔥 Retorne ~{cardCadence.bestCallTime}
                                              </span>
                                            </div>
                                            <span className="text-[9px] font-mono text-amber-300 uppercase font-black shrink-0">
                                              {cardCadence.bestCallDay || "Hoje"}
                                            </span>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div
                                          className="flex items-center justify-between gap-1 text-[10px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/25 px-2 py-0.5 rounded-md font-medium"
                                          title={`Contato efetivo registrado: atendeu às ${cardCadence.bestCallTime}. Retorne no mesmo horário.`}
                                        >
                                          <div className="flex items-center gap-1.5 truncate">
                                            <PhoneCall className="size-2.5 shrink-0 text-emerald-400" />
                                            <span className="truncate">
                                              Atendeu às <strong className="text-white font-mono">{cardCadence.bestCallTime}</strong>
                                            </span>
                                          </div>
                                          <span className="text-[9px] text-emerald-400/80 font-mono shrink-0">
                                            ~{cardCadence.bestCallTime}
                                          </span>
                                        </div>
                                      );
                                    })()}

                                    {/* Topo do Card: Título Inteligente sem Duplicidade */}
                                    {(() => {
                                      const rawName = (lead.leadName || "").trim();
                                      const parensMatch = rawName.match(/^([^(]+)\(([^)]+)\)$/);
                                      const extractedPerson = parensMatch ? parensMatch[1].trim() : "";
                                      const extractedCompany = parensMatch ? parensMatch[2].trim() : "";

                                      let displayCompany =
                                        (cardCadence.companyName && !cardCadence.companyName.includes("(") ? cardCadence.companyName : "") ||
                                        extractedCompany ||
                                        cardCadence.companyName ||
                                        parsed.company ||
                                        parsed.name ||
                                        "";

                                      if (displayCompany.includes("(") && extractedCompany) {
                                        displayCompany = extractedCompany;
                                      }

                                      let displayPerson =
                                        cardCadence.contactPerson ||
                                        extractedPerson ||
                                        (parsed.company && parsed.name !== parsed.company ? parsed.name : "");

                                      if (
                                        displayPerson &&
                                        (displayPerson.toLowerCase() === displayCompany.toLowerCase() ||
                                          displayCompany.toLowerCase().includes(displayPerson.toLowerCase()) ||
                                          displayPerson.toLowerCase().includes(displayCompany.toLowerCase()) ||
                                          displayPerson === "Compras / Engenharia")
                                      ) {
                                        displayPerson = "";
                                      }

                                      if (!displayCompany) {
                                        displayCompany =
                                          displayPerson ||
                                          lead.leadEmail?.split("@")[0] ||
                                          (lead.leadPhone ? `Lead ${lead.leadPhone}` : "Lead sem identificação");
                                        if (displayCompany === displayPerson) {
                                          displayPerson = "";
                                        }
                                      }

                                      const displayLocation = cardCadence.location || "";
                                      const rawPhone = cardCadence.whatsapp || cardCadence.phone || lead.leadPhone || "";
                                      const cleanDigits = rawPhone.replace(/\D/g, "");
                                      const wppText = cardCadence.hunterPitch
                                        ? `?text=${encodeURIComponent(cardCadence.hunterPitch)}`
                                        : "";
                                      const wppUrl = cleanDigits
                                        ? `https://wa.me/${cleanDigits.length >= 10 && cleanDigits.length <= 11 ? `55${cleanDigits}` : cleanDigits}${wppText}`
                                        : "";

                                      return (
                                        <>
                                          <div className="flex items-start justify-between gap-1.5">
                                            <div className="space-y-0.5 min-w-0 flex-1">
                                              <div className="font-bold text-[12.5px] text-white/95 leading-snug truncate" title={displayCompany}>
                                                {displayCompany}
                                              </div>

                                              {displayPerson && (
                                                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                                  <User className="size-2.5 shrink-0 opacity-80" />
                                                  <span className="truncate">{displayPerson}</span>
                                                </div>
                                              )}

                                              {displayLocation && (
                                                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                                                  <MapPin className="size-2.5 shrink-0 text-[#14d06e]" />
                                                  <span className="truncate">{displayLocation}</span>
                                                </div>
                                              )}
                                            </div>

                                            <div
                                              title="Arrastar Card"
                                              className="text-neutral-500 group-hover:text-neutral-300 transition-colors p-0.5 rounded shrink-0 cursor-grab"
                                            >
                                              <GripVertical className="size-3.5" />
                                            </div>
                                          </div>

                                          {/* Resumo Técnico de Aços & Produtos (da Planilha B2B) */}
                                          {(cardCadence.steelMaterials || cardCadence.mainProducts) && (
                                            <div className="rounded-lg bg-[#111914] border border-[#14d06e]/20 px-2 py-1.5 space-y-0.5">
                                              {cardCadence.mainProducts && (
                                                <div className="text-[10px] text-neutral-300 truncate" title={cardCadence.mainProducts}>
                                                  <span className="text-neutral-500 font-semibold">Linha:</span>{" "}
                                                  {cardCadence.mainProducts}
                                                </div>
                                              )}
                                              {cardCadence.steelMaterials && (
                                                <div className="flex items-center gap-1 text-[10px] text-[#14d06e] font-medium truncate" title={cardCadence.steelMaterials}>
                                                  <Wrench className="size-2.5 shrink-0" />
                                                  <span className="truncate">{cardCadence.steelMaterials}</span>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Contatos Rápidos & Links em Barra Limpa */}
                                          <div className="space-y-1 text-[11px] text-neutral-300 bg-neutral-900/70 border border-white/[0.05] rounded-lg p-2">
                                            {rawPhone && (
                                              <div
                                                className="flex items-center justify-between gap-1.5"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <div className="flex items-center gap-1.5 truncate">
                                                  <Phone className="size-2.5 text-neutral-500 shrink-0" />
                                                  <span className="truncate tabular-nums text-neutral-200 font-medium">
                                                    {rawPhone}
                                                  </span>
                                                </div>

                                                {wppUrl && (
                                                  <a
                                                    href={wppUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-black font-semibold text-[10px] transition-all shrink-0"
                                                    title="Abrir WhatsApp Web"
                                                  >
                                                    <MessageCircle className="size-2.5" />
                                                    <span>WPP</span>
                                                  </a>
                                                )}
                                              </div>
                                            )}

                                            {lead.leadEmail && (
                                              <div
                                                className="flex items-center gap-1.5 truncate"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <Mail className="size-2.5 text-neutral-500 shrink-0" />
                                                <a
                                                  href={`mailto:${lead.leadEmail}`}
                                                  className="truncate text-sky-400 hover:underline text-[10px]"
                                                  title={lead.leadEmail}
                                                >
                                                  {lead.leadEmail}
                                                </a>
                                              </div>
                                            )}

                                            {cardCadence.website && (
                                              <div
                                                className="flex items-center gap-1.5 truncate text-[10px]"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <Globe className="size-2.5 text-neutral-500 shrink-0" />
                                                <a
                                                  href={cardCadence.website.startsWith("http") ? cardCadence.website : `https://${cardCadence.website}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="truncate text-emerald-400/90 hover:underline"
                                                  title="Acessar site da empresa"
                                                >
                                                  {cardCadence.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                                                </a>
                                              </div>
                                            )}
                                          </div>

                                          {/* Próxima Atividade Agendada (se houver) */}
                                          {activityInfo && (
                                            <div
                                              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] ${activityInfo.badgeClass}`}
                                            >
                                              <Calendar className="size-3 shrink-0" />
                                              <span className="truncate tabular-nums font-medium">
                                                {activityInfo.formattedStr}
                                              </span>
                                            </div>
                                          )}

                                          {/* Status da Cadência & Atalhos de Etapa (Orçamento / Cultivo) */}
                                          <div className="flex items-center justify-between gap-1 pt-0.5">
                                            <span
                                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate ${
                                                effectiveStage === "nurturing"
                                                  ? "bg-purple-950/40 text-purple-300 border border-purple-500/20"
                                                  : isCompletedToday
                                                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20"
                                                  : actionInfo.type === "today"
                                                  ? "bg-sky-950/40 text-sky-300 border border-sky-500/25"
                                                  : actionInfo.type === "overdue"
                                                  ? "bg-amber-950/40 text-amber-300 border border-amber-500/25"
                                                  : "bg-neutral-800 text-neutral-300 border border-white/[0.06]"
                                              }`}
                                            >
                                              <span className="truncate">
                                                {effectiveStage === "nurturing"
                                                  ? "Manter relacionamento leve"
                                                  : isCompletedToday && actionInfo.type === "future"
                                                  ? `Próx: ${actionInfo.actionText}`
                                                  : actionInfo.fullLabel}
                                              </span>
                                            </span>

                                            <span
                                              title={`Aba: ${sheetMeta.tabName}`}
                                              className="inline-flex items-center rounded bg-neutral-900 border border-white/[0.06] px-1.5 py-0.5 text-[9px] text-neutral-400 truncate max-w-[90px] shrink-0"
                                            >
                                              {sheetMeta.tabName}
                                            </span>
                                          </div>

                                          {/* Botões Rápidos de Movimentação p/ Orçamento Enviado ou Cultivo + OK */}
                                          {!isCompletedToday ? (
                                            <div
                                              className="space-y-1.5 pt-1 border-t border-white/[0.06]"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <div className="flex items-center justify-between gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setCardOutcomeLead(lead);
                                                    setCardOutcomeStepTitle(actionInfo.actionText);
                                                    setCardOutcomeStepId(actionInfo.stepId);
                                                  }}
                                                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/[0.08] py-1 px-1.5 text-[10px] font-medium transition-all cursor-pointer"
                                                  title="Registrar desfecho detalhado"
                                                >
                                                  <CheckCircle2 className="size-2.5 text-emerald-400" />
                                                  <span>Desfecho</span>
                                                </button>

                                                {effectiveStage !== "quoted" && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(lead.id, "quoted")}
                                                    className="inline-flex items-center justify-center rounded-lg bg-sky-500/10 hover:bg-sky-500/25 text-sky-300 border border-sky-500/25 py-1 px-1.5 text-[10px] font-semibold transition-all cursor-pointer"
                                                    title="Mover para Orçamento Enviado"
                                                  >
                                                    📄 Orçou
                                                  </button>
                                                )}

                                                {effectiveStage !== "nurturing" && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(lead.id, "nurturing")}
                                                    className="inline-flex items-center justify-center rounded-lg bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border border-purple-500/25 py-1 px-1.5 text-[10px] font-semibold transition-all cursor-pointer"
                                                    title="Mover para Cultivo & Relacionamento (clientes simpáticos p/ nutrir sem pressão)"
                                                  >
                                                    🌱 Cultivo
                                                  </button>
                                                )}

                                                <button
                                                  type="button"
                                                  onClick={() => handleQuickCompleteLead(lead, actionInfo.actionText, actionInfo.stepId)}
                                                  className="inline-flex items-center justify-center gap-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 py-1 px-2 text-[10px] font-bold transition-all cursor-pointer shrink-0"
                                                  title="Concluir tarefa de hoje e mover para o final da fila"
                                                >
                                                  <Check className="size-2.5" />
                                                  <span>OK</span>
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div
                                              className="flex items-center justify-between gap-1.5 pt-1 border-t border-emerald-500/10 text-[10px] text-neutral-400"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <span className="text-emerald-400/90 font-medium truncate">
                                                Concluído hoje
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setCardOutcomeLead(lead);
                                                  setCardOutcomeStepTitle("Nota adicional");
                                                }}
                                                className="inline-flex items-center gap-1 text-neutral-400 hover:text-white hover:underline text-[10px] transition-colors"
                                              >
                                                + Nota
                                              </button>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}

                          {columnLeads.length === 0 && (
                            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-[#757575] rounded-lg bg-[#050505] ring-1 ring-[#222222] space-y-1">
                              <span className="text-[11px]">
                                {leadSearchQuery.trim()
                                  ? `Nenhum lead para "${leadSearchQuery}"`
                                  : "Arraste cards para cá"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 border-t border-l border-[#2e2e2e]">
              {COLUMNS.map((col) => (
                <div
                  key={col.id}
                  className="border-r border-b border-[#2e2e2e] bg-[#0d0d0d] p-4 min-h-[520px] animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slide-over Sheet Lateral: Dossiê Completo do Vendedor (Hunter) */}
      <LeadDetailsSheet
        lead={selectedLead}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedLead(null);
        }}
        onStatusChange={handleStatusChange}
        onCadenceChange={handleCadenceChange}
        onOwnerChange={handleOwnerChange}
        onActivityScheduled={handleActivityScheduled}
        onLeadUpdate={handleLeadUpdate}
        operators={operators}
      />

      {/* Modal de Criação de Lead com Radar Anti-Colisão */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadCreated={(newLead) => handleLeadCreated(newLead, true)}
        defaultOwnerId={
          isCommercial && myUserId
            ? myUserId
            : activeOperator !== "todos"
            ? activeOperator
            : operators[0]?.id
        }
        operators={operators}
        companyId={currentUser?.company_id}
      />

      {/* Modal de Convite da Equipe (Jorge / Novos Vendedores da Gofer Metais) */}
      <TeamInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        companyName={companyName || "Gofer Metais"}
        companyId={currentUser?.company_id}
        currentUserId={currentUser?.id}
        onMemberAdded={() => {
          getCompanyOperatorsAction().then((ops) => {
            if (ops && ops.length > 0) setOperators(ops);
          });
        }}
      />

      {/* Modal de Desfecho Rápido da Tarefa disparado diretamente do Card */}
      {cardOutcomeLead && (
        <TaskOutcomeModal
          isOpen={Boolean(cardOutcomeLead)}
          lead={cardOutcomeLead}
          onClose={() => setCardOutcomeLead(null)}
          stepId={cardOutcomeStepId}
          stepTitle={cardOutcomeStepTitle}
          currentOperatorName={currentUser?.name || "Lucas de Freitas Leite (Gofer Metais)"}
          onSaveOutcome={handleSaveCardOutcome}
        />
      )}
    </div>
  );
}
