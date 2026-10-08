"use client";

import React from "react";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Target,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export function DashboardView() {
  const { deals, setCurrentView } = useTenantStore();

  const totalPipelineValue = deals.reduce((acc, d) => acc + d.value, 0);
  const wonDealsValue = deals
    .filter((d) => d.stage === "won")
    .reduce((acc, d) => acc + d.value, 0);
  const activeDealsCount = deals.filter(
    (d) => d.stage !== "won" && d.stage !== "lost"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* GRID DE KPIS EXECUTIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: MRR & RECEITA CONSOLIDADA */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                MRR Contratado
              </span>
              <DollarSign className="h-4 w-4 text-gold" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(wonDealsValue || 220000)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+24.8% vs. trimestre anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: PIPELINE ATIVO TOTAL */}
        <Card>
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                Pipeline Ponderado
              </span>
              <TrendingUp className="h-4 w-4 text-subtle" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalPipelineValue)}
            </div>
            <div className="text-[11px] text-muted font-mono">
              {deals.length} oportunidades em negociação
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: DEALS ATIVOS EM ABERTO */}
        <Card>
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                Negócios em Andamento
              </span>
              <Briefcase className="h-4 w-4 text-subtle" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {activeDealsCount} Deals
            </div>
            <div className="text-[11px] text-muted font-mono">
              Tempo médio de ciclo: 22 dias
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: TAXA DE CONVERSÃO */}
        <Card>
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                Taxa de Conversão B2B
              </span>
              <Target className="h-4 w-4 text-gold" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              72.4%
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              Acima da meta corporativa (65%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO PRINCIPAL: TABELA DE OPORTUNIDADES PRIORITÁRIAS + ATIVIDADES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TABELA DE OPORTUNIDADES EM DESTAQUE */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Oportunidades de Alto Ticket</CardTitle>
              <span className="text-[11px] text-muted">
                Deals prioritários ordenados por valor contratual
              </span>
            </div>
            <button
              onClick={() => setCurrentView("pipeline")}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold hover:underline"
            >
              Ver Pipeline Completo →
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border-hairline/60">
              {deals.slice(0, 4).map((deal) => (
                <div
                  key={deal.id}
                  className="p-4 flex items-center justify-between hover:bg-surface-elevated/40 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-foreground">
                      {deal.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted">
                        {deal.companyName}
                      </span>
                      <span className="text-muted text-[10px]">•</span>
                      <span className="font-mono text-[9px] text-subtle">
                        {deal.serviceCategory}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-foreground">
                        {formatCurrency(deal.value)}
                      </span>
                      <span className="font-mono text-[9px] text-muted">
                        Prev: {formatDate(deal.expectedCloseDate)}
                      </span>
                    </div>
                    <Badge variant={deal.stage as any}>{deal.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FEED DE AUDITORIA & ATIVIDADES CORPORATIVAS */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Operações</CardTitle>
            <span className="text-[11px] text-muted">
              Últimas ações e movimentações do time
            </span>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-foreground font-medium">
                  Contrato Assinado: OmniCorp Seguros
                </span>
                <span className="font-mono text-[9px] text-muted">
                  R$ 220.000 • Tráfego & Performance • Lucas S.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-gold mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-foreground font-medium">
                  Proposta Enviada: Vanguard Asset
                </span>
                <span className="font-mono text-[9px] text-muted">
                  R$ 180.000 • Trading Algorítmico • Hoje, 14:30
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-foreground font-medium">
                  Alinhamento Técnico: Nexus Capital Tech
                </span>
                <span className="font-mono text-[9px] text-muted">
                  Arquitetura de Microsserviços • Ontem
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
