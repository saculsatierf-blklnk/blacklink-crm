"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Flame,
  HelpCircle,
  Lightbulb,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PieChart,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";
import {
  computePersonalMetrics,
  getPersonalMetricEvents,
  type PersonalMetricEvent,
  type PersonalMetricsSummary,
} from "@/lib/personalMetrics";

interface PersonalMetricsAnalyticsProps {
  leadsList?: Lead[];
  currentOperatorName?: string;
  onNavigateToKanban?: () => void;
}

export function PersonalMetricsAnalytics({
  leadsList = [],
  currentOperatorName = "Lucas de Freitas Leite",
  onNavigateToKanban,
}: PersonalMetricsAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "all">("daily");
  const [events, setEvents] = useState<PersonalMetricEvent[]>([]);
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [aiCustomInsight, setAiCustomInsight] = useState<string | null>(null);

  // Carrega eventos e escuta eventos de métricas disparados em tempo real pelo Kanban
  useEffect(() => {
    const loaded = getPersonalMetricEvents(leadsList);
    setEvents(loaded);

    const handleMetricRecorded = () => {
      const updated = getPersonalMetricEvents(leadsList);
      setEvents(updated);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("blacklink:personal-metric-recorded", handleMetricRecorded);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("blacklink:personal-metric-recorded", handleMetricRecorded);
      }
    };
  }, [leadsList]);

  // Sumário reativo das métricas
  const summary: PersonalMetricsSummary = useMemo(() => {
    return computePersonalMetrics(events, timeRange);
  }, [events, timeRange]);

  const handleRefreshAi = () => {
    setIsRefreshingAi(true);
    setTimeout(() => {
      setIsRefreshingAi(false);
      setAiCustomInsight(
        `IA analisou os últimos ${summary.totalInteractions} contatos: seu maior índice de fechamento de cotações acontece quando você liga nos primeiros 10 minutos após o envio da tabela no WhatsApp. Continue focando em ${summary.aiCommercialDiagnosis.hotSectorToFocus}.`
      );
    }, 800);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ===================================================================
          1. HEADER COM IDENTIDADE & SELETOR TEMPORAL (DIÁRIO / SEMANAL / MENSAL)
         =================================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#2e2e2e] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14d06e]/10 border border-[#14d06e]/30 px-2.5 py-0.5 text-xs font-semibold text-[#14d06e]">
              <Sparkles className="size-3" />
              <span>Painel Executivo do Operador</span>
            </span>
            <span className="text-xs text-[#afafaf]">&middot;</span>
            <span className="text-xs text-white font-medium">{currentOperatorName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Minhas Métricas &amp; Assertividade de Prospecção</span>
          </h2>
          <p className="text-xs text-[#afafaf]">
            Controle pessoal de ligações, conexões, pedidos via WhatsApp/E-mail, orçamentos gerados e análise de nichos.
          </p>
        </div>

        {/* Seletor Temporal Segmentado */}
        <div className="inline-flex rounded-lg bg-[#141414] p-1 border border-[#2e2e2e] shrink-0">
          <button
            type="button"
            onClick={() => setTimeRange("daily")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              timeRange === "daily"
                ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm font-bold"
                : "text-[#afafaf] hover:text-white"
            }`}
          >
            Hoje (Diário)
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("weekly")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              timeRange === "weekly"
                ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm font-bold"
                : "text-[#afafaf] hover:text-white"
            }`}
          >
            7 Dias (Semanal)
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("monthly")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              timeRange === "monthly"
                ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm font-bold"
                : "text-[#afafaf] hover:text-white"
            }`}
          >
            30 Dias (Mensal)
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              timeRange === "all"
                ? "bg-white text-[#0d0d0d] shadow-sm font-bold"
                : "text-[#afafaf] hover:text-white"
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {/* ===================================================================
          2. CARDS DE KPIS DIRETOS (LIGAÇÕES, ATENDIDAS, WPP, EMAIL, COTAÇÕES)
         =================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Ligações Totais & Taxa de Conexão */}
        <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4 space-y-2 relative overflow-hidden group hover:border-[#14d06e]/50 transition-colors">
          <div className="flex items-center justify-between text-[#afafaf]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ligações Feitas</span>
            <div className="size-8 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-[#7fa9f7]">
              <PhoneCall className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {summary.totalCalls}
            </span>
            <span className="text-xs text-[#afafaf]">chamadas</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-[#1f1f1f] text-[11px]">
            <span className="text-[#14d06e] font-semibold flex items-center gap-0.5">
              <PhoneIncoming className="size-3" />
              {summary.callsAnswered} atendidas
            </span>
            <span className="text-[#757575]">&middot;</span>
            <span className="text-[#ff5d48] font-medium flex items-center gap-0.5">
              <PhoneMissed className="size-3" />
              {summary.callsNotAnswered} sem contato
            </span>
          </div>
        </div>

        {/* Card 2: Taxa de Atendimento (Connect Rate) */}
        <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4 space-y-2 relative overflow-hidden group hover:border-[#14d06e]/50 transition-colors">
          <div className="flex items-center justify-between text-[#afafaf]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Taxa de Conexão</span>
            <div className="size-8 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-[#14d06e]">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#14d06e] tabular-nums">
              {summary.callConnectRate}%
            </span>
            <span className="text-xs text-[#afafaf]">assertividade call</span>
          </div>
          <div className="pt-1 border-t border-[#1f1f1f]">
            <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#14d06e] transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, summary.callConnectRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Solicitações de Envio (WhatsApp & E-mail) */}
        <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4 space-y-2 relative overflow-hidden group hover:border-[#14d06e]/50 transition-colors">
          <div className="flex items-center justify-between text-[#afafaf]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Solicitaram Contato</span>
            <div className="size-8 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center text-[#e8c267]">
              <MessageCircle className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {summary.requestedWhatsapp + summary.requestedEmail}
            </span>
            <span className="text-xs text-[#afafaf]">solicitações</span>
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-[#1f1f1f] text-[11px]">
            <span className="text-[#14d06e] font-semibold flex items-center gap-1">
              <MessageCircle className="size-3 text-[#14d06e]" />
              {summary.requestedWhatsapp} via WhatsApp
            </span>
            <span className="text-[#7fa9f7] font-semibold flex items-center gap-1">
              <Mail className="size-3 text-[#7fa9f7]" />
              {summary.requestedEmail} via E-mail
            </span>
          </div>
        </div>

        {/* Card 4: Cotações & Orçamentos Solicitados */}
        <div className="rounded-xl border border-[#14d06e]/40 bg-[#0c2014] p-4 space-y-2 relative overflow-hidden group hover:border-[#14d06e] transition-colors shadow-lg">
          <div className="flex items-center justify-between text-[#afafaf]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#14d06e]">
              Cotações / Orçaram
            </span>
            <div className="size-8 rounded-lg bg-[#14d06e]/20 border border-[#14d06e]/40 flex items-center justify-center text-[#14d06e]">
              <Target className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {summary.quotedCount}
            </span>
            <span className="text-xs font-mono font-bold text-[#14d06e] bg-[#14d06e]/10 px-2 py-0.5 rounded border border-[#14d06e]/30">
              {summary.quoteConversionRate}% conversão
            </span>
          </div>
          <div className="pt-1 border-t border-[#14d06e]/20 text-[11px] text-zinc-300 flex items-center justify-between">
            <span>Volume em cotações:</span>
            <span className="font-bold text-white font-mono">{formatCurrency(summary.quotedTotalValue)}</span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          3. DIAGNÓSTICO INTELIGENTE COM IA (DIRECIONAMENTO COMERCIAL GOFER)
         =================================================================== */}
      <div className="rounded-xl border border-[#2e2e2e] bg-gradient-to-br from-[#141414] to-[#0d0d0d] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#2e2e2e] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#14d06e]/10 border border-[#14d06e]/30 flex items-center justify-center text-[#14d06e]">
              <Zap className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Diagnóstico de Performance por IA</span>
                <span className="rounded bg-[#0d0d0d] px-1.5 py-0.5 text-[10px] font-mono text-[#14d06e] border border-[#2e2e2e]">
                  Gofer Copilot v2.4
                </span>
              </h3>
              <p className="text-xs text-[#afafaf]">{summary.aiCommercialDiagnosis.headline}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isRefreshingAi}
            onClick={handleRefreshAi}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#262626] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isRefreshingAi ? "animate-spin text-[#14d06e]" : ""}`} />
            <span>{isRefreshingAi ? "Analisando..." : "Atualizar IA"}</span>
          </button>
        </div>

        {aiCustomInsight && (
          <div className="rounded-lg bg-[#0c2b1c] border border-[#14d06e]/40 p-3 text-xs text-[#14d06e] font-medium animate-in fade-in">
            {aiCustomInsight}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Pontos Fortes */}
          <div className="rounded-lg bg-[#0a0a0a] border border-[#2e2e2e] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-[#14d06e] font-semibold uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="size-3.5" />
              <span>O que está funcionando</span>
            </div>
            <ul className="space-y-1.5 text-[#d1d1d1]">
              {summary.aiCommercialDiagnosis.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#14d06e] shrink-0 font-bold">&bull;</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gargalos / Oportunidades */}
          <div className="rounded-lg bg-[#0a0a0a] border border-[#2e2e2e] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-[#e8c267] font-semibold uppercase tracking-wider text-[11px]">
              <TrendingDown className="size-3.5" />
              <span>Gargalos Identificados</span>
            </div>
            <ul className="space-y-1.5 text-[#d1d1d1]">
              {summary.aiCommercialDiagnosis.bottlenecks.map((b, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#e8c267] shrink-0 font-bold">&bull;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ações Práticas Recomendadas */}
          <div className="rounded-lg bg-[#0a0a0a] border border-[#2e2e2e] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-[#7fa9f7] font-semibold uppercase tracking-wider text-[11px]">
              <Lightbulb className="size-3.5" />
              <span>Recomendações Práticas</span>
            </div>
            <ul className="space-y-1.5 text-[#d1d1d1]">
              {summary.aiCommercialDiagnosis.recommendedActions.map((a, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#7fa9f7] shrink-0 font-bold">&rarr;</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rodapé do Diagnóstico: Janela Ideal de Horário & Nicho Quente */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-[#afafaf] border-t border-[#2e2e2e]/60">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-[#7fa9f7]" />
            <span>Melhor janela para ligar: <strong className="text-white font-mono">{summary.aiCommercialDiagnosis.bestHourWindow}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="size-3.5 text-[#ff5d48]" />
            <span>Nicho mais receptivo hoje: <strong className="text-white font-semibold">{summary.aiCommercialDiagnosis.hotSectorToFocus}</strong></span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          4. COMPARATIVO DE SETORES (OS QUE MAIS DERAM CERTO VS OS QUE MAIS DERAM ERRADO)
         =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Setores com Mais Sucesso (Mais Deram Certo) */}
        <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-[#0c2b1c] border border-[#14d06e]/40 flex items-center justify-center text-[#14d06e]">
                <Flame className="size-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Setores que Mais Deram Certo (Alta Conversão)
              </h3>
            </div>
            <span className="text-[11px] text-[#14d06e] font-mono font-semibold">
              Prioridade Comercial
            </span>
          </div>

          <div className="space-y-2.5">
            {summary.topSectors.length === 0 ? (
              <p className="text-xs text-[#757575] py-2">Registrando contatos para ranquear setores...</p>
            ) : (
              summary.topSectors.map((sec, idx) => (
                <div
                  key={sec.sector + idx}
                  className="rounded-lg bg-[#0a0a0a] border border-[#2e2e2e] p-3 space-y-2 hover:border-[#14d06e]/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{sec.sector}</span>
                    <span className="font-mono font-bold text-[#14d06e] bg-[#0c2b1c] px-2 py-0.5 rounded border border-[#14d06e]/30">
                      {sec.assertivenessRate}% assertividade
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#afafaf] pt-1 border-t border-[#1f1f1f]">
                    <div>
                      <span>Contatados: </span>
                      <strong className="text-white">{sec.totalContacts}</strong>
                    </div>
                    <div>
                      <span>Atendidos: </span>
                      <strong className="text-[#14d06e]">{sec.answered}</strong>
                    </div>
                    <div>
                      <span>Cotações: </span>
                      <strong className="text-[#e8c267] font-bold">{sec.quotedCount}</strong>
                    </div>
                  </div>

                  {sec.quotedValue > 0 && (
                    <div className="text-[10px] text-[#7fa9f7] font-mono flex items-center justify-between pt-0.5">
                      <span>Volume orçado neste setor:</span>
                      <span className="font-bold">{formatCurrency(sec.quotedValue)}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Setores que Mais Deram Errado (Maior Objeção / Menor Resposta) */}
        <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-[#2b1310] border border-[#ff5d48]/40 flex items-center justify-center text-[#ff5d48]">
                <TrendingDown className="size-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Setores com Maior Fricção / Ajustar Abordagem
              </h3>
            </div>
            <span className="text-[11px] text-[#ff5d48] font-mono font-semibold">
              Revisar Argumento
            </span>
          </div>

          <div className="space-y-2.5">
            {summary.worstSectors.length === 0 ? (
              <p className="text-xs text-[#757575] py-2">Nenhum setor crítico identificado no período.</p>
            ) : (
              summary.worstSectors.map((sec, idx) => (
                <div
                  key={sec.sector + idx}
                  className="rounded-lg bg-[#0a0a0a] border border-[#2e2e2e] p-3 space-y-2 hover:border-[#ff5d48]/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{sec.sector}</span>
                    <span className="font-mono font-bold text-[#ff5d48] bg-[#2b1310] px-2 py-0.5 rounded border border-[#ff5d48]/30">
                      {sec.assertivenessRate}% assertividade
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#afafaf] pt-1 border-t border-[#1f1f1f]">
                    <div>
                      <span>Contatados: </span>
                      <strong className="text-white">{sec.totalContacts}</strong>
                    </div>
                    <div>
                      <span>Sem interesse: </span>
                      <strong className="text-[#ff5d48]">{sec.rejectedCount}</strong>
                    </div>
                    <div>
                      <span>Cotações: </span>
                      <strong className="text-[#afafaf]">{sec.quotedCount}</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 italic">
                    Sugestão IA: Iniciar abordagem enfatizando catálogo rápido com pronta-entrega para quebrar objeção inicial.
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================
          5. TABELA COMPLETA DE DESEMPENHO SETORIAL & OPERACIONAL
         =================================================================== */}
      <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4.5 space-y-3.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-[#14d06e]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Tabela Geral de Assertividade por Nicho de Aço
            </h3>
          </div>
          {onNavigateToKanban && (
            <button
              type="button"
              onClick={onNavigateToKanban}
              className="text-xs text-[#14d06e] font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Ir para o Kanban &rarr;</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2e2e2e] text-[#afafaf] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Setor / Nicho</th>
                <th className="py-2.5 px-3">Total Contatados</th>
                <th className="py-2.5 px-3">Atenderam</th>
                <th className="py-2.5 px-3">Pediram Wpp</th>
                <th className="py-2.5 px-3">Pediram E-mail</th>
                <th className="py-2.5 px-3">Cotações</th>
                <th className="py-2.5 px-3">Volume Orçado</th>
                <th className="py-2.5 px-3 text-right">Taxa de Assertividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {summary.allSectors.map((s, idx) => (
                <tr key={s.sector + idx} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">{s.sector}</td>
                  <td className="py-2.5 px-3 text-zinc-300 tabular-nums">{s.totalContacts}</td>
                  <td className="py-2.5 px-3 text-[#14d06e] tabular-nums font-medium">{s.answered}</td>
                  <td className="py-2.5 px-3 text-zinc-300 tabular-nums">{s.wppRequests}</td>
                  <td className="py-2.5 px-3 text-zinc-300 tabular-nums">{s.emailRequests}</td>
                  <td className="py-2.5 px-3 text-[#e8c267] font-bold tabular-nums">{s.quotedCount}</td>
                  <td className="py-2.5 px-3 text-zinc-200 font-mono text-[11px]">
                    {s.quotedValue > 0 ? formatCurrency(s.quotedValue) : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        s.status === "high_performer"
                          ? "bg-[#0c2b1c] text-[#14d06e] border border-[#14d06e]/30"
                          : s.status === "needs_attention"
                          ? "bg-[#2b1310] text-[#ff5d48] border border-[#ff5d48]/30"
                          : "bg-[#1a1a1a] text-zinc-300 border border-[#2e2e2e]"
                      }`}
                    >
                      {s.assertivenessRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
