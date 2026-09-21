"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  GripVertical,
  Mail,
  Phone,
  Sparkles,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";
import { updateLeadStatusAction, type LeadStatus } from "@/actions/leads";
import { LeadDetailsSheet } from "./LeadDetailsSheet";

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
    title: "Em Negociação",
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
  const [isMounted, setIsMounted] = useState(false);

  // Garante renderização consistente entre SSR e Client no Drag-and-Drop
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mantém os dados sincronizados quando os dados do servidor mudam
  useEffect(() => {
    setLeadsList(initialLeads);
  }, [initialLeads]);

  // Abertura do Slide-over Sheet para detalhes
  const handleOpenSheet = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSheetOpen(true);
  };

  // Alteração de status pelo modal ou arrasto
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    // 1. Atualização Otimista
    setLeadsList((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // 2. Persistência assíncrona via Server Action
    try {
      const result = await updateLeadStatusAction(leadId, newStatus);
      if (!result.success) {
        console.error("Falha ao salvar no servidor:", result.error);
      }
    } catch (err) {
      console.error("Erro na Server Action de atualização de lead:", err);
    }
  };

  // Tratamento do término do arrasto (Drag End)
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Se soltou na mesma coluna e na mesma posição
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as LeadStatus;
    await handleStatusChange(draggableId, newStatus);
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leadsList.filter((lead) => lead.status === status);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(d);
  };

  return (
    <div className="space-y-6">
      {/* Board Kanban com Drag-and-Drop */}
      {isMounted ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {COLUMNS.map((column) => {
              const columnLeads = getLeadsByStatus(column.id);
              const ColumnIcon = column.icon;

              return (
                <div
                  key={column.id}
                  className="flex flex-col rounded-xl border border-glass-border bg-carbon/60 backdrop-blur-xl shadow-xl overflow-hidden"
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
                        className={`p-3 space-y-3 min-h-[420px] transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-carbon-muted/70 ring-1 ring-accent/30"
                            : ""
                        }`}
                      >
                        {columnLeads.map((lead, index) => {
                          const isAutomation =
                            lead.origin?.toLowerCase().includes("n8n") ||
                            lead.origin?.toLowerCase().includes("webhook");

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
                                  className={`rounded-lg border bg-carbon p-4 space-y-3 transition-all select-none group cursor-pointer ${
                                    dragSnapshot.isDragging
                                      ? "border-accent shadow-2xl scale-[1.02] ring-2 ring-accent/20 z-50 bg-carbon"
                                      : "border-glass-border hover:border-glass-highlight hover:bg-carbon-muted/40 shadow-md"
                                  }`}
                                  onClick={() => handleOpenSheet(lead)}
                                >
                                  {/* Topo do Card: Nome e Drag Handle */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold text-xs text-platinum group-hover:text-accent transition-colors leading-snug">
                                      {lead.leadName}
                                    </div>

                                    <div
                                      {...dragProvided.dragHandleProps}
                                      onClick={(e) => e.stopPropagation()}
                                      title="Arrastar Card"
                                      className="text-sub/50 hover:text-platinum transition-colors cursor-grab active:cursor-grabbing p-0.5 rounded shrink-0"
                                    >
                                      <GripVertical className="h-3.5 w-3.5" />
                                    </div>
                                  </div>

                                  {/* Contatos Rápidos */}
                                  <div className="space-y-1 text-[11px] text-sub font-mono">
                                    {lead.leadEmail && (
                                      <div className="flex items-center gap-1.5 truncate">
                                        <Mail className="h-3 w-3 text-sub shrink-0" />
                                        <span className="truncate">{lead.leadEmail}</span>
                                      </div>
                                    )}
                                    {lead.leadPhone && (
                                      <div className="flex items-center gap-1.5">
                                        <Phone className="h-3 w-3 text-sub shrink-0" />
                                        <span>{lead.leadPhone}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Rodapé do Card: Origem e Data */}
                                  <div className="flex items-center justify-between border-t border-glass-border/60 pt-2.5 text-[10px] font-mono text-sub">
                                    <div className="flex items-center gap-1">
                                      {isAutomation ? (
                                        <Zap className="h-3 w-3 text-amber-300" />
                                      ) : (
                                        <Globe className="h-3 w-3 text-sub" />
                                      )}
                                      <span className="truncate max-w-[120px]">
                                        {lead.origin || "Direto"}
                                      </span>
                                    </div>

                                    <span>{formatDate(lead.createdAt)}</span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}

                        {columnLeads.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center text-sub border border-dashed border-glass-border/60 rounded-lg">
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
              className="rounded-xl border border-glass-border bg-carbon p-4 min-h-[420px] animate-pulse"
            >
              <div className="h-5 w-28 bg-carbon-muted rounded mb-4" />
              <div className="space-y-3">
                <div className="h-20 bg-carbon-muted/50 rounded-lg" />
                <div className="h-20 bg-carbon-muted/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Sheet Lateral para Detalhes do Lead */}
      <LeadDetailsSheet
        lead={selectedLead}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedLead(null);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
