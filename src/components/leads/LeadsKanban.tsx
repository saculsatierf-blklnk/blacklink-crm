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
  Users,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";
import { updateLeadStatusAction, type LeadStatus } from "@/actions/leads";
import { getNextCadenceAction, parseLeadInfo } from "@/lib/cadence";
import { OPERATORS, getOperator } from "@/lib/operators";
import { LeadDetailsSheet } from "./LeadDetailsSheet";
import { AddLeadModal } from "./AddLeadModal";

interface LeadsKanbanProps {
  initialLeads: Lead[];
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
    accentColor: "text-platinum",
    badgeBg: "bg-white/10 text-platinum",
  },
  {
    id: "negotiation",
    title: "Em Prospecção",
    icon: Clock,
    accentColor: "text-emerald-400",
    badgeBg: "bg-emerald-400/10 text-emerald-400 border border-emerald-500/20",
  },
  {
    id: "closed",
    title: "Fechado",
    icon: CheckCircle2,
    accentColor: "text-accent",
    badgeBg: "bg-accent text-void font-semibold",
  },
];

export function LeadsKanban({ initialLeads }: LeadsKanbanProps) {
  const [leadsList, setLeadsList] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Silo de Propriedade: Filtro de Operador Ativo
  const [activeOperator, setActiveOperator] = useState<string>("todos");

  // Mapa reativo do estado de cadência por lead derivado do PostgreSQL
  const [cadenceMap, setCadenceMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setIsMounted(true);

    const map: Record<string, string[]> = {};
    initialLeads.forEach((lead) => {
      map[lead.id] = lead.cadenceState?.completedSteps || [];
    });
    setCadenceMap(map);
  }, [initialLeads]);

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

  // Alteração de status pelo modal ou arrasto com atualização otimista bidirecional
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setLeadsList((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await updateLeadStatusAction(leadId, newStatus);
    } catch (err) {
      console.error("Falha ao salvar status no banco de dados:", err);
    }
  };

  // Callback de novo lead cadastrado via AddLeadModal
  const handleLeadCreated = (newLead: Lead) => {
    setLeadsList((prev) => [newLead, ...prev]);
    if (newLead.cadenceState?.completedSteps) {
      setCadenceMap((prev) => ({
        ...prev,
        [newLead.id]: newLead.cadenceState.completedSteps,
      }));
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

    try {
      await updateLeadStatusAction(draggableId, destStatus);
    } catch (err) {
      console.error("Falha na Server Action de atualização de lead:", err);
    }
  };

  // Filtragem estrita pelo Silo de Propriedade (Ownership)
  const displayedLeads =
    activeOperator === "todos"
      ? leadsList
      : leadsList.filter((l) => (l.ownerId || "lucas.leite") === activeOperator);

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
    <div className="space-y-6">
      {/* Barra Operacional do Hunter: Silo de Propriedade & Novo Lead */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-glass-border bg-carbon/80 backdrop-blur-xl px-4 py-3 shadow-lg">
        {/* Seletor de Operador Ativo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-platinum">
              Operador Ativo:
            </span>
          </div>

          <select
            value={activeOperator}
            onChange={(e) => setActiveOperator(e.target.value)}
            className="rounded-md border border-glass-border bg-carbon-muted px-3 py-1.5 text-xs font-mono text-platinum focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos os Operadores ({leadsList.length})</option>
            {OPERATORS.map((op) => {
              const count = leadsList.filter(
                (l) => (l.ownerId || "lucas.leite") === op.id
              ).length;
              return (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.role}) — {count} contas
                </option>
              );
            })}
          </select>

          <span className="hidden sm:inline-block text-[11px] font-mono text-sub border-l border-glass-border pl-3">
            {displayedLeads.length} {displayedLeads.length === 1 ? "conta visível" : "contas visíveis"}
          </span>
        </div>

        {/* Botão de Criação de Lead com Radar Anti-Colisão */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-xs font-mono font-bold text-void hover:bg-platinum transition-all cursor-pointer shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Board Kanban com Drag-and-Drop Bidirecional */}
      {isMounted ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {COLUMNS.map((column) => {
              const columnLeads = getLeadsByStatus(column.id);
              const ColumnIcon = column.icon;

              return (
                <div
                  key={column.id}
                  className="flex flex-col rounded-xl border border-glass-border bg-carbon/60 backdrop-blur-xl shadow-xl overflow-hidden min-h-[520px]"
                >
                  {/* Cabeçalho da Coluna */}
                  <div className="flex items-center justify-between border-b border-glass-border p-4 bg-carbon-muted/40">
                    <div className="flex items-center gap-2">
                      <ColumnIcon className={`h-4 w-4 ${column.accentColor}`} />
                      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-platinum">
                        {column.title}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-mono ${column.badgeBg}`}
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
                        className={`flex flex-col flex-1 p-3 space-y-3 min-h-[460px] transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-carbon-muted/70 ring-1 ring-accent/30"
                            : ""
                        }`}
                      >
                        {columnLeads.map((lead, index) => {
                          const parsed = parseLeadInfo(lead.leadName);

                          // Inteligência Visual Temporal derivada dos dados do PostgreSQL
                          const completed =
                            cadenceMap[lead.id] ||
                            lead.cadenceState?.completedSteps ||
                            [];
                          const actionInfo = getNextCadenceAction(
                            lead.createdAt,
                            completed,
                            lead.status
                          );

                          // Resolução do Dono da Conta (Ownership)
                          const op = getOperator(lead.ownerId);

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
                                  onClick={(e) => {
                                    if (dragSnapshot.isDragging) return;
                                    handleOpenSheet(lead);
                                  }}
                                  className={`rounded-lg border bg-carbon p-4 space-y-3 transition-all select-none group cursor-grab active:cursor-grabbing ${
                                    dragSnapshot.isDragging
                                      ? "border-accent shadow-2xl scale-[1.02] ring-2 ring-accent/20 z-50 bg-carbon"
                                      : "border-glass-border hover:border-glass-highlight hover:bg-carbon-muted/40 shadow-md"
                                  }`}
                                >
                                  {/* Topo do Card: Nome, Empresa e Alça */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="font-semibold text-xs text-platinum group-hover:text-accent transition-colors leading-snug truncate">
                                        {parsed.name}
                                      </div>
                                      {parsed.company && (
                                        <div className="flex items-center gap-1 text-[11px] text-sub">
                                          <Building2 className="h-3 w-3 shrink-0" />
                                          <span className="truncate">{parsed.company}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div
                                      title="Arrastar Card"
                                      className="text-sub/40 group-hover:text-platinum transition-colors p-0.5 rounded shrink-0"
                                    >
                                      <GripVertical className="h-3.5 w-3.5" />
                                    </div>
                                  </div>

                                  {/* Linha Operacional do Hunter: Cargo & Valor Estimado */}
                                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-sub bg-void/50 rounded px-2.5 py-1.5 border border-glass-border/40">
                                    <span className="truncate max-w-[150px] text-sub">
                                      {lead.cadenceState?.roleTitle || "Decisor Comercial"}
                                    </span>
                                    <span className="font-bold text-accent shrink-0">
                                      {lead.cadenceState?.estimatedValue || "R$ 50.000,00"}
                                    </span>
                                  </div>

                                  {/* Inteligência Operacional: Próxima Ação da Cadência & Dono */}
                                  <div className="flex items-center justify-between gap-2 border-y border-glass-border/60 py-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="text-[9px] font-mono uppercase tracking-wider text-sub shrink-0">
                                        Cadência:
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono border truncate ${actionInfo.badgeClass}`}
                                      >
                                        {actionInfo.type === "overdue" && (
                                          <AlertCircle className="h-3 w-3 shrink-0 text-rose-400" />
                                        )}
                                        {actionInfo.type === "today" && (
                                          <Zap className="h-3 w-3 shrink-0 text-amber-300" />
                                        )}
                                        {actionInfo.type === "future" && (
                                          <Clock className="h-3 w-3 shrink-0 text-sub" />
                                        )}
                                        {actionInfo.type === "completed" && (
                                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                                        )}
                                        <span className="truncate">{actionInfo.fullLabel}</span>
                                      </span>
                                    </div>

                                    {/* Dono do Lead (Silo de Propriedade) */}
                                    <span
                                      title={`Responsável: ${op.name} (${op.role})`}
                                      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono shrink-0 ${op.badgeClass}`}
                                    >
                                      <User className="h-2.5 w-2.5" />
                                      <span>{op.shortName}</span>
                                    </span>
                                  </div>

                                  {/* Contatos Rápidos */}
                                  <div className="space-y-1 text-[11px] text-sub font-mono">
                                    {lead.leadEmail && (
                                      <div
                                        className="flex items-center gap-1.5 truncate"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Mail className="h-3 w-3 text-sub shrink-0" />
                                        <a
                                          href={`mailto:${lead.leadEmail}`}
                                          className="truncate hover:text-platinum transition-colors"
                                        >
                                          {lead.leadEmail}
                                        </a>
                                      </div>
                                    )}
                                    {lead.leadPhone && (
                                      <div
                                        className="flex items-center gap-1.5"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Phone className="h-3 w-3 text-sub shrink-0" />
                                        <a
                                          href={`tel:${lead.leadPhone}`}
                                          className="hover:text-platinum transition-colors"
                                        >
                                          {lead.leadPhone}
                                        </a>
                                      </div>
                                    )}
                                  </div>

                                  {/* Rodapé do Card: Origem e Data */}
                                  <div className="flex items-center justify-between border-t border-glass-border/60 pt-2.5 text-[10px] font-mono text-sub">
                                    <div className="flex items-center gap-1">
                                      <Globe className="h-3 w-3 text-sub" />
                                      <span className="truncate max-w-[120px]">
                                        {lead.origin || "Direto"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-[10px]">
                                      <Calendar className="h-3 w-3 text-sub" />
                                      <span>{formatDate(lead.createdAt)}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}

                        {/* Estado Vazio da Coluna */}
                        {columnLeads.length === 0 && (
                          <div className="flex flex-1 items-center justify-center p-8 text-center text-sub border border-dashed border-glass-border/60 rounded-lg pointer-events-none">
                            <span className="text-[11px] font-mono">
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
        /* Fallback durante hidratação SSR */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="rounded-xl border border-glass-border bg-carbon p-4 min-h-[520px] animate-pulse"
            >
              <div className="h-5 w-28 bg-carbon-muted rounded mb-4" />
              <div className="space-y-3">
                <div className="h-24 bg-carbon-muted/50 rounded-lg" />
                <div className="h-24 bg-carbon-muted/50 rounded-lg" />
              </div>
            </div>
          ))}
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
      />

      {/* Modal de Criação de Lead com Radar Anti-Colisão */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadCreated={handleLeadCreated}
        defaultOwnerId={activeOperator !== "todos" ? activeOperator : "lucas.leite"}
      />
    </div>
  );
}
