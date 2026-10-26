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
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  GripVertical,
  Mail,
  Phone,
  Plus,
  Sparkles,
  User,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";
import {
  updateLeadStatusAction,
  getCompanyOperatorsAction,
  type LeadStatus,
} from "@/actions/leads";
import { getNextCadenceAction, parseLeadInfo } from "@/lib/cadence";
import { OPERATORS, getOperator, type Operator } from "@/lib/operators";
import { LeadDetailsSheet } from "./LeadDetailsSheet";
import { AddLeadModal } from "./AddLeadModal";
import { TeamInviteModal } from "./TeamInviteModal";
import { GoogleSheetsLeadHunter } from "./GoogleSheetsLeadHunter";
import { StartTourButton } from "@/components/tour/StartTourButton";
import { KANBAN_TOUR_STEPS } from "@/store/useTourStore";
import { useUiStore } from "@/store/useUiStore";

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
  const [leadsList, setLeadsList] = useState<Lead[]>(initialLeads);
  const [operators, setOperators] = useState<Operator[]>(initialOperators || OPERATORS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const activeWorkspaceTab = useUiStore((state) => state.activeVendasTab);
  const setActiveWorkspaceTab = useUiStore((state) => state.setActiveVendasTab);

  const isCommercial = currentUser?.role === "commercial";
  const myUserId = currentUser?.id || "";

  // Mostra todos os leads da operação por padrão para que nenhum lead enviado da planilha fique oculto
  const [activeOperator, setActiveOperator] = useState<string>("todos");

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
            const existingIds = new Set(prev.map((l) => l.id));
            const existingNames = new Set(
              prev.map((l) => (l.leadName || "").toLowerCase().trim())
            );
            const extras = parsedLocal.filter(
              (l) =>
                !existingIds.has(l.id) &&
                !existingNames.has((l.leadName || "").toLowerCase().trim())
            );
            return [...extras, ...prev];
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

  // Sincroniza novos leads do servidor sem sobrescrever as alterações locais do operador
  useEffect(() => {
    setLeadsList((prev) => {
      if (prev.length === 0) return initialLeads;
      const existingIds = new Set(prev.map((l) => l.id));
      const incomingNewLeads = initialLeads.filter((l) => !existingIds.has(l.id));
      if (incomingNewLeads.length === 0) return prev;
      return [...prev, ...incomingNewLeads];
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
      const alreadyExists = prev.some(
        (l) =>
          l.id === newLead.id ||
          (l.leadName || "").toLowerCase().trim() ===
            (newLead.leadName || "").toLowerCase().trim()
      );
      if (alreadyExists) return prev;
      return [newLead, ...prev];
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

  // Filtragem de visualização do Kanban
  const displayedLeads =
    activeOperator === "todos"
      ? leadsList
      : leadsList.filter(
          (l) =>
            (l.ownerId || operators[0]?.id) === activeOperator ||
            (currentUser?.email && l.ownerId === currentUser.email)
        );

  const getLeadsByStatus = (status: LeadStatus) => {
    return displayedLeads.filter((lead) => lead.status === status);
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
      <div className={activeWorkspaceTab === "kanban" ? "hidden" : "block"}>
        <GoogleSheetsLeadHunter
          companyName={companyName || "Gofer Metais"}
          onLeadImportedToKanban={handleLeadCreated}
          activeWorkspaceTab={activeWorkspaceTab}
          onWorkspaceTabChange={setActiveWorkspaceTab}
          currentUserId={currentUser?.id}
          currentCompanyId={currentUser?.company_id}
        />
      </div>

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
                                    className={`rounded-lg p-4 space-y-3 transition-colors select-none group cursor-grab active:cursor-grabbing ${
                                      dragSnapshot.isDragging
                                        ? "bg-[#262626] ring-1 ring-[#7fa9f7]/60 z-50"
                                        : "bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626]"
                                    }`}
                                  >
                                    {/* Topo do Card: Nome, Empresa e Alça */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="font-semibold text-sm text-white truncate">
                                          {parsed.name}
                                        </div>
                                        {parsed.company && (
                                          <div className="flex items-center gap-1.5 text-xs text-[#afafaf]">
                                            <Building2 className="size-3.5 shrink-0" />
                                            <span className="truncate">
                                              {parsed.company}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div
                                        title="Arrastar Card"
                                        className="text-[#757575] group-hover:text-white transition-colors p-0.5 rounded shrink-0"
                                      >
                                        <GripVertical className="size-3.5" />
                                      </div>
                                    </div>

                                    {/* Linha Operacional: Setor/Cargo & Valor */}
                                    <div className="flex items-center justify-between gap-2 text-xs text-[#afafaf] bg-[#0d0d0d] rounded-md px-2.5 py-1.5 ring-1 ring-[#2e2e2e]">
                                      <span className="truncate">
                                        {lead.cadenceState?.roleTitle ||
                                          "Decisor Comercial"}
                                      </span>
                                      {lead.cadenceState?.estimatedValue ? (
                                        <span className="font-semibold text-white tabular-nums shrink-0">
                                          {lead.cadenceState.estimatedValue}
                                        </span>
                                      ) : (
                                        <span className="text-[11px] text-[#757575] shrink-0">
                                          Cotação aberta
                                        </span>
                                      )}
                                    </div>

                                    {/* Próxima Atividade Agendada */}
                                    {activityInfo && (
                                      <div
                                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${activityInfo.badgeClass}`}
                                      >
                                        <Calendar className="size-3.5 shrink-0" />
                                        <span className="truncate tabular-nums">
                                          {activityInfo.formattedStr}
                                        </span>
                                        {activityInfo.isToday && (
                                          <span className="ml-auto text-[10px] font-semibold">
                                            Hoje
                                          </span>
                                        )}
                                        {activityInfo.isOverdue && (
                                          <span className="ml-auto text-[10px] font-semibold">
                                            Atrasado
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Próxima Ação da Cadência & Responsável */}
                                    <div className="flex items-center justify-between gap-2 border-y border-[#2e2e2e] py-2">
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f1b33] px-2.5 py-0.5 text-[11px] font-semibold text-[#7fa9f7] truncate">
                                        <span className="truncate">
                                          {actionInfo.fullLabel}
                                        </span>
                                      </span>

                                      <span
                                        title={`Responsável: ${op.name} (${op.role})`}
                                        className="inline-flex items-center gap-1 rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-2 py-0.5 text-[11px] text-[#afafaf] shrink-0"
                                      >
                                        <User className="size-3" />
                                        <span>{op.shortName}</span>
                                      </span>
                                    </div>

                                    {/* Contatos Rápidos */}
                                    <div className="space-y-1 text-xs text-[#afafaf]">
                                      {lead.leadEmail && (
                                        <div
                                          className="flex items-center gap-1.5 truncate"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Mail className="size-3.5 text-[#757575] shrink-0" />
                                          <a
                                            href={`mailto:${lead.leadEmail}`}
                                            className="truncate text-[#7fa9f7] hover:underline"
                                          >
                                            {lead.leadEmail}
                                          </a>
                                        </div>
                                      )}
                                      {lead.leadPhone && (
                                        <div
                                          className="flex items-center gap-1.5 tabular-nums"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Phone className="size-3.5 text-[#757575] shrink-0" />
                                          <a
                                            href={`tel:${lead.leadPhone}`}
                                            className="hover:text-white transition-colors"
                                          >
                                            {lead.leadPhone}
                                          </a>
                                        </div>
                                      )}
                                    </div>

                                    {/* Rodapé do Card: Origem e Data */}
                                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#757575] tabular-nums">
                                      <span className="truncate max-w-[140px]">
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
                            <div className="flex flex-1 items-center justify-center p-8 text-center text-[#757575] rounded-lg bg-[#000000] ring-1 ring-[#2e2e2e] pointer-events-none">
                              <span className="text-xs">
                                Nenhum lead nesta etapa
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
    </div>
  );
}
