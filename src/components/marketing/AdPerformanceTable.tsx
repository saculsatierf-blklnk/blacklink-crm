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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 sm:p-8 shadow-2xl shadow-black/60 space-y-7">
      {/* Cabeçalho da Seção de Tráfego Pago & Botão de Disparo do Robô */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-white/10 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-white">
              Agente de Tráfego Pago & Otimização Autônoma
            </h3>
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Meta Graph v20.0
            </span>
            {lastOptimizationRun && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-mono text-emerald-300 font-semibold">
                Último ciclo: {new Date(lastOptimizationRun).toLocaleTimeString("pt-BR")}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Algoritmo autônomo: escala +20% do orçamento para criativos vencedores (ROAS &ge; 3.5x e CTR &ge; 2.5%) e pausa conjuntos sub-performers.
          </p>
        </div>

        {/* Controles de Ação do Robô & Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Botão de Disparo do Robô */}
          <button
            type="button"
            disabled={isOptimizing}
            onClick={handleRunRobot}
            className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-semibold tracking-tight hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                <span>Otimizando Anúncios...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 fill-black" />
                <span>Executar Otimização</span>
              </>
            )}
          </button>

          {/* Botão de Exibição dos Logs de Auditoria */}
          <button
            type="button"
            onClick={() => setShowLogsDrawer(!showLogsDrawer)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300 cursor-pointer ${
              showLogsDrawer
                ? "border-white/30 bg-white/[0.12] text-white shadow-sm"
                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Auditoria ({optimizationLogs.length})</span>
            {showLogsDrawer ? (
              <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>

          {/* Filtros de Status */}
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
            <button
              type="button"
              onClick={() => setFilterStatus("todos")}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
                filterStatus === "todos"
                  ? "bg-white/[0.15] border border-white/20 text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Todos ({adCampaigns.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("active")}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
                filterStatus === "active"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40"
                  : "text-zinc-400 hover:text-emerald-300"
              }`}
            >
              Ativos
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("paused")}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
                filterStatus === "paused"
                  ? "bg-zinc-500/20 text-zinc-300 font-semibold border border-zinc-500/40"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Pausados
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Resumo dos Indicadores de Escala Apple Glass */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
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
          <div className="text-xl font-bold font-mono text-white">
            R$ {totalDailyBudget.toFixed(2).replace(".", ",")}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Orçamento alocado em tempo real</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            CTR Médio Ponderado
          </span>
          <div className="text-xl font-bold font-mono text-white">
            {avgCtr}%
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Taxa de clique qualificada</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            ROAS Consolidado
          </span>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {avgRoas}x
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Retorno sobre gasto publicitário</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Conversões / Reuniões
          </span>
          <div className="text-xl font-bold font-mono text-white">
            {totalConversions}
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Leads B2B qualificados injetados</span>
        </div>
      </div>

      {/* Dossiê de Auditoria do Robô (Expandível) */}
      {showLogsDrawer && (
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-5 space-y-4 transition-all animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Cpu className="h-4 w-4 text-white" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
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
                <span className="text-zinc-500">
                  {optimizationSummary.maintainedCount} Mantidos
                </span>
              </div>
            )}
          </div>

          {optimizationLogs.length === 0 ? (
            <p className="text-xs text-zinc-400 font-mono py-2">
              Nenhuma ação executada nesta sessão ainda. Clique no botão &quot;Executar Otimização&quot; acima para processar a telemetria.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {optimizationLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {log.action === "scale" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300">
                          <Zap className="h-3 w-3 fill-emerald-400" />
                          ESCALA +20%
                        </span>
                      ) : log.action === "pause" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[9px] font-bold text-red-300">
                          <Pause className="h-3 w-3" />
                          PAUSA DE PROTEÇÃO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[9px] font-semibold text-zinc-300">
                          MANTER
                        </span>
                      )}
                      <span className="font-semibold text-white tracking-tight truncate font-sans text-xs">
                        {log.adSetName}
                      </span>
                    </div>

                    <span className="text-[10px] text-zinc-400 shrink-0">
                      R$ {log.previousBudget.toFixed(2)} &rarr;{" "}
                      <span className="text-white font-bold">R$ {log.newBudget.toFixed(2)}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 pl-1">{log.rationale}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabela de Campanhas & Criativos Apple Glass */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.03] text-[10px] font-mono uppercase tracking-widest text-zinc-400 border-b border-white/10">
            <tr>
              <th className="py-3.5 px-5">Criativo & Campanha</th>
              <th className="py-3.5 px-5">Formato</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Investimento Diário</th>
              <th className="py-3.5 px-5">CTR</th>
              <th className="py-3.5 px-5">ROAS</th>
              <th className="py-3.5 px-5 text-right">Ação Algorítmica</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filteredCampaigns.map((ad) => {
              const isHighRoas = ad.roas >= 3.5;
              const isHighCtr = ad.ctr >= 2.5;

              return (
                <tr
                  key={ad.id}
                  className="hover:bg-white/[0.03] transition-colors text-white"
                >
                  {/* Criativo & Campanha */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="h-10 w-10 shrink-0 rounded-xl border border-white/15 bg-cover bg-center shadow-sm"
                        style={{ backgroundImage: `url(${ad.thumbnailUrl})` }}
                      />
                      <div className="flex flex-col min-w-0 max-w-xs">
                        <span className="font-semibold text-xs text-white truncate font-sans tracking-tight">
                          {ad.creativeName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ID: {ad.id}
                          </span>
                          {ad.scaleBadge && (
                            <span
                              className={`rounded-full px-2 py-0.2 text-[9px] font-mono font-bold ${
                                ad.scaleBadge.includes("+20%") || ad.scaleBadge === "VENCEDOR"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-red-500/20 text-red-300 border border-red-500/40"
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
                  <td className="py-3.5 px-5">
                    <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-[10px] text-zinc-300 uppercase tracking-wider font-semibold">
                      {ad.format}
                    </span>
                  </td>

                  {/* Status da Campanha */}
                  <td className="py-3.5 px-5">
                    {ad.campaignStatus === "active" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Ativo
                      </span>
                    ) : ad.campaignStatus === "learning" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Aprendizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        Pausado
                      </span>
                    )}
                  </td>

                  {/* Investimento Diário */}
                  <td className="py-3.5 px-5 font-semibold text-white">
                    R$ {ad.dailyBudget.toFixed(2).replace(".", ",")}
                  </td>

                  {/* CTR */}
                  <td className="py-3.5 px-5">
                    <span
                      className={`font-semibold ${
                        isHighCtr ? "text-emerald-400" : ad.ctr < 1.0 ? "text-red-400" : "text-white"
                      }`}
                    >
                      {ad.ctr.toFixed(2)}%
                    </span>
                  </td>

                  {/* ROAS */}
                  <td className="py-3.5 px-5">
                    <span
                      className={`font-bold ${
                        isHighRoas ? "text-emerald-400" : ad.roas < 2.0 ? "text-red-400" : "text-white"
                      }`}
                    >
                      {ad.roas.toFixed(1)}x
                    </span>
                  </td>

                  {/* Ação Algorítmica */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => scaleSingleCampaign(ad.id)}
                        title="Escalar orçamento em +20%"
                        className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all cursor-pointer font-mono font-semibold"
                      >
                        <Zap className="h-3 w-3" />
                        <span>+20%</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCampaignStatus(ad.id)}
                        title={ad.campaignStatus === "paused" ? "Reativar anúncio" : "Pausar anúncio"}
                        className={`inline-flex items-center rounded-xl border p-1.5 text-xs transition-all cursor-pointer ${
                          ad.campaignStatus === "paused"
                            ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                            : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.08]"
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
