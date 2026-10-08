"use client";

import React from "react";
import {
  ChevronRight,
  ChevronLeft,
  Building,
  DollarSign,
  User,
  Calendar,
  Layers,
} from "lucide-react";
import { useTenantStore, DealStage, Deal } from "@/store/useTenantStore";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ColumnDef {
  id: DealStage;
  label: string;
  badgeVariant: any;
}

const columns: ColumnDef[] = [
  { id: "prospecting", label: "Prospecção", badgeVariant: "prospecting" },
  { id: "qualification", label: "Qualificação", badgeVariant: "qualification" },
  { id: "proposal", label: "Proposta", badgeVariant: "proposal" },
  { id: "negotiation", label: "Negociação", badgeVariant: "negotiation" },
  { id: "won", label: "Fechado / Ganho", badgeVariant: "won" },
  { id: "lost", label: "Perdido", badgeVariant: "lost" },
];

export function PipelineKanbanView() {
  const { deals, updateDealStage, searchQuery } = useTenantStore();

  const filteredDeals = deals.filter((deal) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      deal.title.toLowerCase().includes(query) ||
      deal.companyName.toLowerCase().includes(query) ||
      deal.contactPerson.toLowerCase().includes(query)
    );
  });

  const getStageTotal = (stage: DealStage) => {
    return filteredDeals
      .filter((d) => d.stage === stage)
      .reduce((sum, d) => sum + d.value, 0);
  };

  const stageOrder: DealStage[] = [
    "prospecting",
    "qualification",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ];

  const moveStage = (deal: Deal, direction: "next" | "prev") => {
    const currentIndex = stageOrder.indexOf(deal.stage);
    if (direction === "next" && currentIndex < stageOrder.length - 1) {
      updateDealStage(deal.id, stageOrder[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      updateDealStage(deal.id, stageOrder[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* SUMÁRIO SUPERIOR DO PIPELINE */}
      <div className="flex items-center justify-between p-4 bg-carbon border border-border-hairline">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              Volume em Pipeline
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(filteredDeals.reduce((acc, d) => acc + d.value, 0))}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-border-hairline" />
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              Total de Oportunidades
            </span>
            <span className="text-lg font-bold text-foreground">
              {filteredDeals.length} Negócios
            </span>
          </div>
        </div>

        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
          Pipeline B2B Operacional
        </span>
      </div>

      {/* QUADRO KANBAN (COLUNAS HORIZONTAIS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {columns.map((column) => {
          const colDeals = filteredDeals.filter((d) => d.stage === column.id);
          const colTotal = getStageTotal(column.id);

          return (
            <div
              key={column.id}
              className="flex flex-col gap-2.5 min-w-[250px] bg-carbon/70 border border-border-hairline p-3"
            >
              {/* CABEÇALHO DA COLUNA */}
              <div className="flex items-center justify-between pb-2 border-b border-border-hairline/60">
                <div className="flex items-center gap-2">
                  <Badge variant={column.badgeVariant}>{column.label}</Badge>
                  <span className="font-mono text-[10px] text-muted">
                    ({colDeals.length})
                  </span>
                </div>
              </div>

              {/* VALOR TOTAL DA COLUNA */}
              <div className="font-mono text-[10px] text-muted tracking-wider pb-1">
                Total: <span className="text-foreground font-semibold">{formatCurrency(colTotal)}</span>
              </div>

              {/* LISTA DE CARDS DA COLUNA */}
              <div className="flex flex-col gap-2.5 min-h-[400px]">
                {colDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="p-3.5 bg-surface border-border-hairline hover:border-border-focus transition-all group flex flex-col gap-2.5"
                  >
                    {/* TÍTULO E EMPRESA */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-foreground leading-snug">
                        {deal.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-muted text-[11px]">
                        <Building className="h-3 w-3 shrink-0" />
                        <span className="truncate">{deal.companyName}</span>
                      </div>
                    </div>

                    {/* SERVIÇO & VALOR */}
                    <div className="flex flex-col gap-1 pt-1.5 border-t border-border-hairline/40">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted truncate max-w-[140px]">
                          {deal.serviceCategory}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>

                      {/* RESPONSÁVEL E DATA */}
                      <div className="flex items-center justify-between text-[10px] text-muted pt-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{deal.owner}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(deal.expectedCloseDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* AÇÕES DE AVANÇO / RETROCESSO DE ESTÁGIO */}
                    <div className="flex items-center justify-between pt-2 border-t border-border-hairline/40 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveStage(deal, "prev")}
                        disabled={stageOrder.indexOf(deal.stage) === 0}
                        className="p-1 hover:bg-surface-elevated text-muted hover:text-white disabled:opacity-20"
                        title="Mover para fase anterior"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>

                      <span className="font-mono text-[8px] uppercase tracking-widest text-muted">
                        Mover Fase
                      </span>

                      <button
                        type="button"
                        onClick={() => moveStage(deal, "next")}
                        disabled={
                          stageOrder.indexOf(deal.stage) === stageOrder.length - 1
                        }
                        className="p-1 hover:bg-surface-elevated text-muted hover:text-gold disabled:opacity-20"
                        title="Avançar para próxima fase"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}

                {colDeals.length === 0 && (
                  <div className="h-28 flex items-center justify-center border border-dashed border-border-hairline/40 text-muted font-mono text-[9px] uppercase tracking-widest">
                    Sem oportunidades
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
