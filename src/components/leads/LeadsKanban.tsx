"use client";

import { useEffect, useState } from "react";
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
  Globe,
  GripVertical,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";
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
import { GoogleSheetsLeadHunter } from "./GoogleSheetsLeadHunter";
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
  id: LeadStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "new",
    title: "Novo Lead",
    icon: Sparkles,
    accentColor: "text-[#7fa9f7]",
    badgeBg: "bg-[#0f1b33] text-[#7fa9f7]",
  },
  {
    id: "negotiation",
    title: "Em Prospecção",
    icon: Clock,
    accentColor: "text-[#e8c267]",
    badgeBg: "bg-[#2b2410] text-[#e8c267]",
  },
  {
    id: "closed",
    title: "Fechado",
    icon: CheckCircle2,
    accentColor: "text-[#14d06e]",
    badgeBg: "bg-[#0c2b1c] text-[#14d06e]",
  },
];

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
    return deduplicateKanbanLeadsList(initialLeads).deduplicated;
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
      const savedLocal = localStorage.getItem("gofer_kanban_leads_v1");
      if (savedLocal) {
        const parsedLocal: Lead[] = JSON.parse(savedLocal);
        if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
          setLeadsList((prev) => {
            // Unifica leads do servidor + espelho local e passa pelo motor anti-duplicidade rigoroso
            const combined = [...prev, ...parsedLocal];
            const { deduplicated } = deduplicateKanbanLeadsList(combined);
            try {
              localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(deduplicated));
            } catch {}
            return deduplicated;
          });
        }
      }
    } catch {}

    const map: Record<string, string[]> = {};
    initialLeads.forEach((lead) => {
      map[lead.id] = lead.cadenceState?.completedSteps || [];
    });
    setCadenceMap(map);
  }, [initialLeads]);

  // Persiste espelho local do Kanban para garantir que leads enviados da planilha nunca sumam
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(leadsList));
    } catch {}
  }, [leadsList, isMounted]);

  // Sincroniza novos leads do servidor sem sobrescrever as alterações locais do operador, garantindo anti-colisão
  useEffect(() => {
    setLeadsList((prev) => {
      if (prev.length === 0) return deduplicateKanbanLeadsList(initialLeads).deduplicated;
      const combined = [...prev, ...initialLeads];
      const { deduplicated } = deduplicateKanbanLeadsList(combined);
      return deduplicated;
    });
  }, [initialLeads]);

  // Abertura do Slide-over Sheet para detalhes executivos do Hunter
  const handleOpenSheet = (lead: Lead) => {
    setSelectedLead(lead);
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
    setLeadsList((prev) => {
      const next = prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead));
      try {
        localStorage.setItem("gofer_kanban_leads_v1", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (selectedLead && selectedLead.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
  };

  // Alteração de status pelo modal ou arrasto com atualização otimista bidirecional (Kanban <-> Planilha Leads)
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const targetLead = leadsList.find((l) => l.id === leadId);
    setLeadsList((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    if (typeof window !== "undefined" && targetLead) {
      window.dispatchEvent(
        new CustomEvent("blacklink:kanban-to-sheets-sync", {
          detail: {
            lead: { ...targetLead, status: newStatus },
            action: "status_changed",
          },
        })
      );
    }

    try {
      await updateLeadStatusAction(leadId, newStatus);
    } catch (err) {
      console.error("Falha ao salvar status no banco de dados:", err);
    }
  };

  // Callback de novo lead cadastrado via AddLeadModal ou importado da Planilha
  const handleLeadCreated = (newLead: Lead, fromKanbanModal = false) => {
    setLeadsList((prev) => {
      // Barreira anti-colisão rigorosa (Telefone, E-mail, Domínio, Nome da Empresa ou ID)
      const collision = checkLeadCollisionInMemory(newLead, prev);
      if (collision.collision && collision.matchedLead) {
        // Funde os dados no lead existente preservando o estágio mais avançado (ex: Em Prospecção)
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

  // Callback de desfecho rápido registrado diretamente a partir do card no Kanban
  const handleSaveCardOutcome = async (data: {
    outcome: string;
    channel: string;
    notes?: string;
    quotedValue?: number;
    completedStepId?: string;
  }) => {
    if (!cardOutcomeLead) return;

    const leadTarget = cardOutcomeLead;
    const nowIso = new Date().toISOString();
    const currentOp = currentUser?.name || "Lucas de Freitas Leite (Gofer Metais)";

    const currentCadence = (leadTarget.cadenceState as any) || {};
    const currentCompleted: string[] = currentCadence.completedSteps || [];

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

    // Se orçou, avança automaticamente para Em Prospecção caso esteja em Novo Lead
    const nextStatus = (data.outcome === "solicitou_orcamento" && leadTarget.status === "new") ? "negotiation" : leadTarget.status;

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
            completedSteps: nextSteps,
            lastCompletedAt: nowIso,
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
        completedSteps: nextSteps,
        lastCompletedAt: nowIso,
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

  // Tratamento do término do arrasto (Drag End) com movimentação bidirecional livre
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destStatus = destination.droppableId as LeadStatus;
    const movedTarget = leadsList.find((item) => item.id === draggableId);

    // Atualização Otimista Precisa
    setLeadsList((prev) => {
      const currentList = [...prev];
      const targetIndex = currentList.findIndex((item) => item.id === draggableId);
      if (targetIndex === -1) return prev;

      const [movedLead] = currentList.splice(targetIndex, 1);
      const updatedLead = { ...movedLead, status: destStatus };

      const destLeads = currentList.filter((item) => item.status === destStatus);
      const otherLeads = currentList.filter((item) => item.status !== destStatus);

      destLeads.splice(destination.index, 0, updatedLead);

      return [...destLeads, ...otherLeads];
    });

    if (selectedLead && selectedLead.id === draggableId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: destStatus } : null));
    }

    if (typeof window !== "undefined" && movedTarget) {
      window.dispatchEvent(
        new CustomEvent("blacklink:kanban-to-sheets-sync", {
          detail: {
            lead: { ...movedTarget, status: destStatus },
            action: "status_changed",
          },
        })
      );
    }

    try {
      await updateLeadStatusAction(draggableId, destStatus);
    } catch (err) {
      console.error("Falha na Server Action de atualização de lead:", err);
    }
  };

  // Contadores de status de leads
  const activeLeadsCount = leadsList.filter((l) => !(l.cadenceState as any)?.isDeactivated).length;
  const deactivatedLeadsCount = leadsList.filter((l) => (l.cadenceState as any)?.isDeactivated).length;

  // Filtragem de visualização do Kanban (Operador + Ativo/Desativado)
  const baseLeadsByOperator =
    activeOperator === "todos"
      ? leadsList
      : leadsList.filter(
          (l) =>
            (l.ownerId || operators[0]?.id) === activeOperator ||
            (currentUser?.email && l.ownerId === currentUser.email)
        );

  const displayedLeads = baseLeadsByOperator.filter((l) => {
    const isDeactivated = Boolean((l.cadenceState as any)?.isDeactivated);
    if (leadStatusFilter === "active" && isDeactivated) return false;
    if (leadStatusFilter === "deactivated" && !isDeactivated) return false;

    // Filtro da Barra de Pesquisa de Leads
    if (leadSearchQuery && leadSearchQuery.trim()) {
      const q = leadSearchQuery.toLowerCase().trim();
      const cardCadence = (l.cadenceState as any) || {};
      const parsed = parseLeadInfo(l.leadName || "");
      const company = (cardCadence.companyName || parsed.company || parsed.name || l.leadName || "").toLowerCase();
      const person = (cardCadence.contactPerson || parsed.name || "").toLowerCase();
      const location = (cardCadence.location || "").toLowerCase();
      const rawPhone = (cardCadence.whatsapp || cardCadence.phone || l.leadPhone || "").toLowerCase();
      const cleanPhoneDigits = rawPhone.replace(/\D/g, "");
      const cleanQDigits = q.replace(/\D/g, "");
      const email = (l.leadEmail || "").toLowerCase();
      const deactivationReason = (cardCadence.deactivationReason || "").toLowerCase();
      const notesText = (l.notes || []).map((n) => n.text.toLowerCase()).join(" ");

      const matches =
        company.includes(q) ||
        person.includes(q) ||
        location.includes(q) ||
        rawPhone.includes(q) ||
        (cleanQDigits.length >= 3 && cleanPhoneDigits.includes(cleanQDigits)) ||
        email.includes(q) ||
        deactivationReason.includes(q) ||
        notesText.includes(q);

      if (!matches) return false;
    }

    return true;
  });

  const getLeadsByStatus = (status: LeadStatus) => {
    const statusLeads = displayedLeads.filter((lead) => lead.status === status);

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
        <div className="space-y-4">
          {/* Barra de Operador e Ações do Kanban */}
          <div className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
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
                    ? "conta visível"
                    : "contas visíveis"}
                </span>
              </div>
            ) : (
              <div
                data-tour="kanban-operator-filter"
                className="flex items-center gap-3"
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
                    Todos os Operadores ({leadsList.length})
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
                placeholder="Pesquisar empresa, decisor, WhatsApp..."
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
                type="button"
                onClick={() => setActiveWorkspaceTab("planilha")}
                className="flex items-center gap-1.5 rounded-md bg-[#14d06e] px-3.5 py-1.5 text-xs font-semibold text-[#0d0d0d] hover:bg-[#14d06e]/90 transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="size-3.5" />
                <span>+ Captar Leads (IA / Planilha)</span>
              </button>

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
                className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[#2e2e2e]"
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
                    <div className="flex items-center justify-between border-b border-[#2e2e2e] px-4 py-3.5 bg-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <ColumnIcon className={`size-4 ${column.accentColor}`} />
                        <h2 className="text-xs font-semibold text-white">
                          {column.title}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex h-5 items-center rounded-full px-2.5 text-xs font-semibold tabular-nums ${column.badgeBg}`}
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
                          className={`flex flex-col flex-1 p-3.5 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto transition-colors ${
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
                                    className={`rounded-xl p-3.5 space-y-2.5 transition-all select-none group cursor-grab active:cursor-grabbing border ${
                                      isDeactivated
                                        ? "bg-[#140e0e] border-[#ff5d48]/30 opacity-80 hover:opacity-100"
                                        : dragSnapshot.isDragging
                                        ? "bg-[#202020] border-[#7fa9f7]/70 z-50 shadow-2xl scale-[1.02]"
                                        : isCompletedToday
                                        ? "bg-[#0b1b13]/85 border-emerald-500/30 hover:border-emerald-500/50 shadow-sm"
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

                                    {/* Topo do Card: Título Inteligente sem Duplicidade */}
                                    {(() => {
                                      // 1. Extração inteligente de parênteses: "Nome (Empresa)"
                                      const rawName = (lead.leadName || "").trim();
                                      const parensMatch = rawName.match(/^([^(]+)\(([^)]+)\)$/);
                                      const extractedPerson = parensMatch ? parensMatch[1].trim() : "";
                                      const extractedCompany = parensMatch ? parensMatch[2].trim() : "";

                                      // 2. Determinação da Empresa
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

                                      // 3. Determinação da Pessoa de Contato
                                      let displayPerson =
                                        cardCadence.contactPerson ||
                                        extractedPerson ||
                                        (parsed.company && parsed.name !== parsed.company ? parsed.name : "");

                                      // 4. Eliminação de duplicações ("SulMetais / SulMetais", "Carlos / Carlos")
                                      if (
                                        displayPerson &&
                                        (displayPerson.toLowerCase() === displayCompany.toLowerCase() ||
                                          displayCompany.toLowerCase().includes(displayPerson.toLowerCase()) ||
                                          displayPerson.toLowerCase().includes(displayCompany.toLowerCase()))
                                      ) {
                                        displayPerson = "";
                                      }

                                      // 5. Fallback caso a empresa ainda esteja vazia
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
                                      const wppUrl = cleanDigits
                                        ? `https://wa.me/${cleanDigits.length >= 10 && cleanDigits.length <= 11 ? `55${cleanDigits}` : cleanDigits}`
                                        : "";

                                      return (
                                        <>
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-0.5 min-w-0 flex-1">
                                              <div className="font-semibold text-[13px] text-white/95 leading-snug truncate" title={displayCompany}>
                                                {displayCompany}
                                              </div>

                                              {displayPerson && (
                                                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                                  <User className="size-3 shrink-0 opacity-80" />
                                                  <span className="truncate">{displayPerson}</span>
                                                </div>
                                              )}

                                              {displayLocation && (
                                                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                                                  <MapPin className="size-2.5 shrink-0 text-neutral-500" />
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

                                          {/* Contatos Rápidos & Links em Barra Limpa */}
                                          <div className="space-y-1 text-[11px] text-neutral-300 bg-neutral-900/70 border border-white/[0.05] rounded-lg p-2">
                                            {rawPhone && (
                                              <div
                                                className="flex items-center justify-between gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <div className="flex items-center gap-1.5 truncate">
                                                  <Phone className="size-2.5 text-neutral-500 shrink-0" />
                                                  <span className="truncate tabular-nums text-neutral-200">
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
                                                    <span>WhatsApp</span>
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
                                                  className="truncate text-sky-400 hover:underline"
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
                                              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] ${activityInfo.badgeClass}`}
                                            >
                                              <Calendar className="size-3 shrink-0" />
                                              <span className="truncate tabular-nums font-medium">
                                                {activityInfo.formattedStr}
                                              </span>
                                              {activityInfo.isToday && (
                                                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider">
                                                  Hoje
                                                </span>
                                              )}
                                              {activityInfo.isOverdue && (
                                                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider">
                                                  Atrasado
                                                </span>
                                              )}
                                            </div>
                                          )}

                                          {/* Status da Cadência & Responsável */}
                                          <div className="flex items-center justify-between gap-1.5 pt-0.5">
                                            <span
                                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium truncate ${
                                                isCompletedToday
                                                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20"
                                                  : actionInfo.type === "today"
                                                  ? "bg-sky-950/40 text-sky-300 border border-sky-500/25"
                                                  : actionInfo.type === "overdue"
                                                  ? "bg-amber-950/40 text-amber-300 border border-amber-500/25"
                                                  : "bg-neutral-800 text-neutral-300 border border-white/[0.06]"
                                              }`}
                                            >
                                              <span className="truncate">
                                                {isCompletedToday && actionInfo.type === "future"
                                                  ? `Próx: ${actionInfo.actionText} (${actionInfo.temporalTag})`
                                                  : actionInfo.fullLabel}
                                              </span>
                                            </span>

                                            <span
                                              title={`Responsável: ${op.name} (${op.role})`}
                                              className="inline-flex items-center gap-1 rounded-md bg-neutral-900 border border-white/[0.06] px-1.5 py-0.5 text-[10px] text-neutral-400 shrink-0"
                                            >
                                              <User className="size-2.5" />
                                              <span>{op.shortName}</span>
                                            </span>
                                          </div>

                                          {/* Ação Operacional: Desfecho / OK (apenas se houver tarefa pendente) */}
                                          {!isCompletedToday ? (
                                            <div
                                              className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/[0.06]"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setCardOutcomeLead(lead);
                                                  setCardOutcomeStepTitle(actionInfo.actionText);
                                                  setCardOutcomeStepId(actionInfo.stepId);
                                                }}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] py-1 px-2 text-[11px] font-medium transition-all cursor-pointer shadow-sm"
                                                title="Registrar desfecho detalhado (Ligação atendida, WhatsApp solicitado, Cotação gerada)"
                                              >
                                                <CheckCircle2 className="size-3 text-emerald-400" />
                                                <span>Desfecho</span>
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => handleQuickCompleteLead(lead, actionInfo.actionText, actionInfo.stepId)}
                                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 hover:border-emerald-500 py-1 px-2.5 text-[11px] font-bold transition-all cursor-pointer shadow-sm shrink-0"
                                                title="Concluir tarefa de hoje e mover para o final da fila"
                                              >
                                                <Check className="size-3" />
                                                <span>OK</span>
                                              </button>
                                            </div>
                                          ) : (
                                            <div
                                              className="flex items-center justify-between gap-1.5 pt-1 border-t border-emerald-500/10 text-[10px] text-neutral-400"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <span className="text-emerald-400/90 font-medium truncate">
                                                Aguardando próxima etapa
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setCardOutcomeLead(lead);
                                                  setCardOutcomeStepTitle("Nota adicional");
                                                }}
                                                className="inline-flex items-center gap-1 text-neutral-400 hover:text-white hover:underline text-[10px] transition-colors"
                                              >
                                                + Registrar nota
                                              </button>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}

                                    {/* Rodapé do Card: Origem e Data */}
                                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[10px] text-neutral-500 tabular-nums">
                                      <span className="truncate max-w-[130px]">
                                        {lead.origin || "Prospecção B2B"}
                                      </span>
                                      <span>{formatDate(lead.createdAt)}</span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}

                          {columnLeads.length === 0 && (
                            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[#757575] rounded-lg bg-[#000000] ring-1 ring-[#2e2e2e] space-y-1">
                              <span className="text-xs">
                                {leadSearchQuery.trim()
                                  ? `Nenhum lead nesta etapa para "${leadSearchQuery}"`
                                  : "Nenhum lead nesta etapa"}
                              </span>
                              {leadSearchQuery.trim() && (
                                <button
                                  type="button"
                                  onClick={() => setLeadSearchQuery("")}
                                  className="text-[11px] text-[#14d06e] hover:underline cursor-pointer pt-1"
                                >
                                  Limpar pesquisa
                                </button>
                              )}
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
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[#2e2e2e]">
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
