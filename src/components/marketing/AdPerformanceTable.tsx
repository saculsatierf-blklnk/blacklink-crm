"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Filter,
  Layers,
  Pause,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMarketingStore, type AdPerformanceItem } from "@/store/useMarketingStore";

export function AdPerformanceTable() {
  const { adCampaigns } = useMarketingStore();
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const filteredCampaigns = adCampaigns.filter((item) => {
    if (filterStatus === "todos") return true;
    return item.campaignStatus === filterStatus;
  });

  const totalDailyBudget = adCampaigns.reduce((acc, curr) => acc + curr.dailyBudget, 0);
  const avgCtr = (
    adCampaigns.reduce((acc, curr) => acc + curr.ctr, 0) / (adCampaigns.length || 1)
  ).toFixed(2);
  const avgRoas = (
    adCampaigns.reduce((acc, curr) => acc + curr.roas, 0) / (adCampaigns.length || 1)
  ).toFixed(1);
  const totalConversions = adCampaigns.reduce((acc, curr) => acc + curr.conversions, 0);

  return (
    <div className="rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Cabeçalho da Seção de Tráfego Pago */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-glass-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-void">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
              Agente de Tráfego Pago & Performance de Anúncios
            </h3>
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">
              Meta & Google Ads API Ready
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Monitoramento de escala para criativos vencedores validados no pipeline.
          </p>
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus("todos")}
            className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === "todos"
                ? "bg-accent text-void font-bold"
                : "border border-glass-border bg-void/50 text-sub hover:text-platinum"
            }`}
          >
            Todos ({adCampaigns.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("active")}
            className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === "active"
                ? "bg-emerald-500 text-void font-bold"
                : "border border-glass-border bg-void/50 text-sub hover:text-platinum"
            }`}
          >
            Ativos
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("learning")}
            className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === "learning"
                ? "bg-amber-500 text-void font-bold"
                : "border border-glass-border bg-void/50 text-sub hover:text-platinum"
            }`}
          >
            Aprendizado
          </button>
        </div>
      </div>

      {/* Grid de Resumo dos Indicadores de Escala */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
            Investimento Diário Total
          </span>
          <div className="text-lg font-bold font-mono text-platinum">
            R$ {totalDailyBudget.toFixed(2).replace(".", ",")}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Orçamento alocado</span>
        </div>

        <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
            CTR Médio Ponderado
          </span>
          <div className="text-lg font-bold font-mono text-platinum">
            {avgCtr}%
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Taxa de clique qualificada</span>
        </div>

        <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
            ROAS Consolidado
          </span>
          <div className="text-lg font-bold font-mono text-emerald-400">
            {avgRoas}x
          </div>
          <span className="text-[10px] text-sub font-mono">Retorno sobre gasto</span>
        </div>

        <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
            Conversões / Reuniões
          </span>
          <div className="text-lg font-bold font-mono text-platinum">
            {totalConversions}
          </div>
          <span className="text-[10px] text-sub font-mono">Leads injetados na esteira</span>
        </div>
      </div>

      {/* Tabela de Campanhas & Criativos */}
      <div className="overflow-x-auto rounded-lg border border-glass-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-carbon-muted/70 text-[10px] font-mono uppercase tracking-wider text-sub border-b border-glass-border">
            <tr>
              <th className="py-3 px-4">Criativo & Campanha</th>
              <th className="py-3 px-4">Formato</th>
              <th className="py-3 px-4">Status da Campanha</th>
              <th className="py-3 px-4">Investimento Diário</th>
              <th className="py-3 px-4">CTR</th>
              <th className="py-3 px-4">ROAS</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40 font-mono">
            {filteredCampaigns.map((ad) => {
              const isHighRoas = ad.roas >= 4.0;
              const isHighCtr = ad.ctr >= 3.0;

              return (
                <tr
                  key={ad.id}
                  className="hover:bg-carbon-muted/30 transition-colors text-platinum"
                >
                  {/* Criativo & Campanha */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 shrink-0 rounded-md border border-glass-border bg-cover bg-center"
                        style={{ backgroundImage: `url(${ad.thumbnailUrl})` }}
                      />
                      <div className="flex flex-col min-w-0 max-w-xs">
                        <span className="font-semibold text-xs text-platinum truncate font-sans">
                          {ad.creativeName}
                        </span>
                        <span className="text-[10px] text-sub font-mono">
                          ID: {ad.id} &bull; {ad.impressions.toLocaleString()} imp.
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Formato */}
                  <td className="py-3 px-4">
                    <span className="rounded bg-void border border-glass-border px-2 py-0.5 text-[10px] text-sub uppercase">
                      {ad.format}
                    </span>
                  </td>

                  {/* Status da Campanha */}
                  <td className="py-3 px-4">
                    {ad.campaignStatus === "active" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Ativo
                      </span>
                    ) : ad.campaignStatus === "learning" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Aprendizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        Pausado
                      </span>
                    )}
                  </td>

                  {/* Investimento Diário */}
                  <td className="py-3 px-4 font-semibold text-platinum">
                    R$ {ad.dailyBudget.toFixed(2).replace(".", ",")}
                  </td>

                  {/* CTR */}
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        isHighCtr ? "text-emerald-400" : "text-platinum"
                      }`}
                    >
                      {ad.ctr.toFixed(2)}%
                    </span>
                  </td>

                  {/* ROAS */}
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        isHighRoas ? "text-emerald-400" : "text-platinum"
                      }`}
                    >
                      {ad.roas.toFixed(1)}x
                    </span>
                  </td>

                  {/* Ação */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded border border-glass-border bg-carbon px-2.5 py-1 text-[11px] text-sub hover:text-platinum hover:border-glass-highlight transition-all cursor-pointer"
                    >
                      <span>Ajustar Escala</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
