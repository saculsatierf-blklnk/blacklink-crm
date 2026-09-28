"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMarketingStore, type AdPerformanceItem } from "@/store/useMarketingStore";

export function AdPerformanceTable() {
  const {
    adCampaigns,
    isOptimizing,
    lastOptimizationRun,
    optimizationSummary,
    optimizationLogs,
    fetchAdPerformance,
    runOptimizationRobot,
    scaleSingleCampaign,
    toggleCampaignStatus,
  } = useMarketingStore();

  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [showLogsDrawer, setShowLogsDrawer] = useState<boolean>(false);
  const [justOptimized, setJustOptimized] = useState<boolean>(false);

  useEffect(() => {
    fetchAdPerformance();
  }, [fetchAdPerformance]);

  const handleRunRobot = async () => {
    setJustOptimized(false);
    const summary = await runOptimizationRobot();
    if (summary) {
      setJustOptimized(true);
      setShowLogsDrawer(true);
    }
  };

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
      {/* Cabeçalho da Seção de Tráfego Pago & Botão de Disparo do Robô */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-glass-border/70 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-void">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
              Agente de Tráfego Pago & Otimização Autônoma
            </h3>
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">
              Meta Ads Graph v20.0 Ready
            </span>
            {lastOptimizationRun && (
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                Último ciclo: {new Date(lastOptimizationRun).toLocaleTimeString("pt-BR")}
              </span>
            )}
          </div>
          <p className="text-xs text-sub mt-1">
            Algoritmo autônomo: escala +20% do orçamento para criativos vencedores (ROAS &ge; 3.5x e CTR &ge; 2.5%) e pausa conjuntos sub-performers.
          </p>
        </div>

        {/* Controles de Ação do Robô & Filtros */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão de Disparo do Robô */}
          <button
            type="button"
            disabled={isOptimizing}
            onClick={handleRunRobot}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold font-mono text-void hover:bg-platinum transition-all cursor-pointer shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-void" />
                <span>Otimizando Anúncios...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 fill-void" />
                <span>Executar Robô de Otimização</span>
              </>
            )}
          </button>

          {/* Botão de Exibição dos Logs de Auditoria */}
          <button
            type="button"
            onClick={() => setShowLogsDrawer(!showLogsDrawer)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-mono transition-colors cursor-pointer ${
              showLogsDrawer
                ? "border-accent bg-carbon-muted text-platinum"
                : "border-glass-border bg-void/50 text-sub hover:text-platinum"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Auditoria ({optimizationLogs.length})</span>
            {showLogsDrawer ? (
              <ChevronUp className="h-3 w-3 ml-0.5" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-0.5" />
            )}
          </button>

          {/* Filtros de Status */}
          <div className="flex items-center gap-1 border-l border-glass-border/70 pl-2">
            <button
              type="button"
              onClick={() => setFilterStatus("todos")}
              className={`rounded-md px-2 py-1 text-xs font-mono transition-colors cursor-pointer ${
                filterStatus === "todos"
                  ? "bg-carbon-muted border border-glass-highlight text-platinum font-bold"
                  : "text-sub hover:text-platinum"
              }`}
            >
              Todos ({adCampaigns.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("active")}
              className={`rounded-md px-2 py-1 text-xs font-mono transition-colors cursor-pointer ${
                filterStatus === "active"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-sub hover:text-emerald-400"
              }`}
            >
              Ativos
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("paused")}
              className={`rounded-md px-2 py-1 text-xs font-mono transition-colors cursor-pointer ${
                filterStatus === "paused"
                  ? "bg-zinc-500/20 text-zinc-300 font-bold border border-zinc-500/30"
                  : "text-sub hover:text-zinc-300"
              }`}
            >
              Pausados
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Resumo dos Indicadores de Escala */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
              Investimento Diário Total
            </span>
            {optimizationSummary && (
              <span
                className={`text-[10px] font-mono font-bold ${
                  optimizationSummary.budgetDelta >= 0 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {optimizationSummary.budgetDelta >= 0 ? "+" : ""}
                R$ {optimizationSummary.budgetDelta.toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-lg font-bold font-mono text-platinum">
            R$ {totalDailyBudget.toFixed(2).replace(".", ",")}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Orçamento alocado em tempo real</span>
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
          <span className="text-[10px] text-sub font-mono">Retorno sobre gasto publicitário</span>
        </div>

        <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
            Conversões / Reuniões
          </span>
          <div className="text-lg font-bold font-mono text-platinum">
            {totalConversions}
          </div>
          <span className="text-[10px] text-sub font-mono">Leads B2B qualificados injetados</span>
        </div>
      </div>

      {/* Dossiê de Auditoria do Robô (Expandível) */}
      {showLogsDrawer && (
        <div className="rounded-xl border border-glass-border bg-void/80 p-4 space-y-3 transition-all animate-fadeIn">
          <div className="flex items-center justify-between border-b border-glass-border pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-platinum">
                Relatório de Auditoria das Decisões Algorítmicas
              </h4>
            </div>
            {optimizationSummary && (
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-emerald-400">
                  {optimizationSummary.scaledCount} Escalados (+20%)
                </span>
                <span className="text-zinc-400">
                  {optimizationSummary.pausedCount} Pausados
                </span>
                <span className="text-sub">
                  {optimizationSummary.maintainedCount} Mantidos
                </span>
              </div>
            )}
          </div>

          {optimizationLogs.length === 0 ? (
            <p className="text-xs text-sub font-mono py-2">
              Nenhuma ação executada nesta sessão ainda. Clique no botão &quot;Executar Robô de Otimização&quot; acima para processar a telemetria.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {optimizationLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-glass-border bg-carbon/60 p-3 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {log.action === "scale" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <Zap className="h-3 w-3 fill-emerald-400" />
                          ESCALA +20%
                        </span>
                      ) : log.action === "pause" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                          <Pause className="h-3 w-3" />
                          PAUSA DE PROTEÇÃO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-zinc-500/20 border border-zinc-500/30 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                          MANTER
                        </span>
                      )}
                      <span className="font-bold text-platinum truncate font-sans">
                        {log.adSetName}
                      </span>
                    </div>

                    <span className="text-[10px] text-sub shrink-0">
                      R$ {log.previousBudget.toFixed(2)} &rarr;{" "}
                      <span className="text-platinum font-bold">R$ {log.newBudget.toFixed(2)}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-sub pl-1">{log.rationale}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabela de Campanhas & Criativos */}
      <div className="overflow-x-auto rounded-lg border border-glass-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-carbon-muted/70 text-[10px] font-mono uppercase tracking-wider text-sub border-b border-glass-border">
            <tr>
              <th className="py-3 px-4">Criativo & Campanha</th>
              <th className="py-3 px-4">Formato</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Investimento Diário</th>
              <th className="py-3 px-4">CTR</th>
              <th className="py-3 px-4">ROAS</th>
              <th className="py-3 px-4 text-right">Ação Algorítmica</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40 font-mono">
            {filteredCampaigns.map((ad) => {
              const isHighRoas = ad.roas >= 3.5;
              const isHighCtr = ad.ctr >= 2.5;

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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-sub font-mono">
                            ID: {ad.id}
                          </span>
                          {ad.scaleBadge && (
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                                ad.scaleBadge.includes("+20%") || ad.scaleBadge === "VENCEDOR"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {ad.scaleBadge}
                            </span>
                          )}
                        </div>
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
                        isHighCtr ? "text-emerald-400" : ad.ctr < 1.0 ? "text-red-400" : "text-platinum"
                      }`}
                    >
                      {ad.ctr.toFixed(2)}%
                    </span>
                  </td>

                  {/* ROAS */}
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        isHighRoas ? "text-emerald-400" : ad.roas < 2.0 ? "text-red-400" : "text-platinum"
                      }`}
                    >
                      {ad.roas.toFixed(1)}x
                    </span>
                  </td>

                  {/* Ação Algorítmica */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => scaleSingleCampaign(ad.id)}
                        title="Escalar orçamento em +20%"
                        className="inline-flex items-center gap-1 rounded border border-glass-border bg-carbon px-2.5 py-1 text-[11px] text-emerald-400 hover:text-platinum hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all cursor-pointer font-mono"
                      >
                        <Zap className="h-3 w-3" />
                        <span>+20%</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCampaignStatus(ad.id)}
                        title={ad.campaignStatus === "paused" ? "Reativar anúncio" : "Pausar anúncio"}
                        className={`inline-flex items-center rounded border p-1 text-[11px] transition-all cursor-pointer ${
                          ad.campaignStatus === "paused"
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "border-glass-border text-sub hover:text-platinum hover:border-glass-highlight"
                        }`}
                      >
                        {ad.campaignStatus === "paused" ? (
                          <Play className="h-3 w-3" />
                        ) : (
                          <Pause className="h-3 w-3" />
                        )}
                      </button>
                    </div>
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
