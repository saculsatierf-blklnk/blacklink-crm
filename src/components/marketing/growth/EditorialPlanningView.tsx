"use client";

import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMarketingStore,
  type EditorialPlanItem,
  type CreativeFormat,
} from "@/store/useMarketingStore";

export function EditorialPlanningView() {
  const {
    editorialPlan,
    isGeneratingPlan,
    generateEditorialPlan,
    selectPlanForCreation,
    addPlanItem,
    setActiveGrowthTab,
    companyProfile,
  } = useMarketingStore();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [funnelFilter, setFunnelFilter] = useState<"all" | "topo" | "meio" | "fundo">("all");
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Form State
  const [newTheme, setNewTheme] = useState("");
  const [newHook, setNewHook] = useState("");
  const [newDayLabel, setNewDayLabel] = useState("");
  const [newFormat, setNewFormat] = useState<CreativeFormat>("carousel");
  const [newFunnelStage, setNewFunnelStage] = useState<"topo" | "meio" | "fundo">("meio");
  const [newObjective, setNewObjective] = useState("");
  const [newCta, setNewCta] = useState("");

  const filteredPlan = editorialPlan.filter((item) => {
    if (funnelFilter === "all") return true;
    return item.funnelStage === funnelFilter;
  });

  const handleExportPlan = () => {
    // Monta um arquivo CSV estruturado e executivo para download imediato
    const headers = [
      "Dia / Data",
      "Tema da Publicacao",
      "Hook Magnético",
      "Formato",
      "Estagio de Funil",
      "Objetivo Estrategico",
      "CTA Sugerida",
      "Status",
    ];

    const rows = editorialPlan.map((item) => [
      `"${item.dayLabel}"`,
      `"${item.theme.replace(/"/g, '""')}"`,
      `"${item.hookHeadline.replace(/"/g, '""')}"`,
      `"${item.format}"`,
      `"${item.funnelStage}"`,
      `"${item.objective.replace(/"/g, '""')}"`,
      `"${item.ctaText.replace(/"/g, '""')}"`,
      `"${item.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `cronograma_marketing_${companyProfile.name.toLowerCase().replace(/\s+/g, "_") || "blacklink"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadFeedback("Cronograma editorial exportado com sucesso em formato CSV executivo!");
    setTimeout(() => setDownloadFeedback(null), 4000);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTheme.trim()) return;

    addPlanItem({
      dayNumber: editorialPlan.length + 1,
      dayLabel: newDayLabel.trim() || `Pauta #${editorialPlan.length + 1}`,
      theme: newTheme.trim(),
      hookHeadline: newHook.trim() || newTheme.trim(),
      format: newFormat,
      funnelStage: newFunnelStage,
      objective: newObjective.trim() || "Posicionamento e conversão B2B",
      viralAngle: "Ângulo de autoridade e dados práticos",
      ctaText: newCta.trim() || "Salve para consultar mais tarde",
      status: "planejado",
    });

    setIsAddingItem(false);
    setNewTheme("");
    setNewHook("");
    setNewDayLabel("");
    setNewObjective("");
    setNewCta("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner Superior da Etapa */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-7 lg:p-9 shadow-2xl space-y-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                02
              </span>
              <h2 className="text-xl font-semibold text-white tracking-tight font-heading">
                Planejamento &amp; Cronograma Editorial B2B
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans max-w-2xl">
              Estruturação das pautas do mês baseadas no diagnóstico de concorrência. Exporte para a equipe ou envie cada pauta diretamente para o estúdio criativo em 1 clique.
            </p>
          </div>

          {/* Botões de Ação do Header */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportPlan}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Cronograma (CSV / Dossiê)</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingPlan}
              onClick={() => generateEditorialPlan()}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gerando Pautas...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 text-black" />
                  <span>Regenerar com IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {downloadFeedback && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5 text-xs font-mono text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{downloadFeedback}</span>
          </div>
        )}

        {/* Barra de Filtro & Adição de Pauta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Estágio do Funil:
            </span>
            <div className="flex items-center gap-1.5">
              {(["all", "topo", "meio", "fundo"] as const).map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setFunnelFilter(stage)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    funnelFilter === stage
                      ? "bg-white/[0.12] text-white font-semibold border border-white/20"
                      : "text-zinc-400 hover:text-white bg-white/[0.02]"
                  }`}
                >
                  {stage === "all"
                    ? "Todas"
                    : stage === "topo"
                    ? "Topo (Atração)"
                    : stage === "meio"
                    ? "Meio (Educação)"
                    : "Fundo (Conversão)"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5 text-white" />
            <span>{isAddingItem ? "Cancelar" : "+ Nova Pauta"}</span>
          </button>
        </div>

        {/* Formulário de Adição de Nova Pauta */}
        {isAddingItem && (
          <form
            onSubmit={handleAddNewItem}
            className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold text-white">Adicionar Pauta ao Cronograma</span>
              <span className="text-[10px] font-mono text-zinc-400">Entrada Manual</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Dia / Data</label>
                <input
                  type="text"
                  placeholder="Ex: Terça • 12/Out"
                  value={newDayLabel}
                  onChange={(e) => setNewDayLabel(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Tema Principal *</label>
                <input
                  type="text"
                  placeholder="Ex: Como Reduzir o Ciclo de Vendas B2B em 40%"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Hook Headline (Gancho)</label>
                <input
                  type="text"
                  placeholder="Ex: Se sua equipe ainda gasta 3 horas preenchendo planilhas..."
                  value={newHook}
                  onChange={(e) => setNewHook(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Estágio de Funil</label>
                <select
                  value={newFunnelStage}
                  onChange={(e) => setNewFunnelStage(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white"
                >
                  <option value="topo" className="bg-[#0A0A0A]">Topo (Atração)</option>
                  <option value="meio" className="bg-[#0A0A0A]">Meio (Educação)</option>
                  <option value="fundo" className="bg-[#0A0A0A]">Fundo (Conversão)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                Adicionar Pauta
              </button>
            </div>
          </form>
        )}
      </div>

      {/* GRADE DE PAUTAS E ATALHO 1-CLIQUE PARA O ESTÚDIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlan.map((item) => {
          const isTopo = item.funnelStage === "topo";
          const isMeio = item.funnelStage === "meio";
          const isFundo = item.funnelStage === "fundo";

          return (
            <div
              key={item.id}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 space-y-5 hover:border-white/20 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header do Card de Pauta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-xs font-mono font-semibold text-white">
                      {item.dayLabel}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${
                      isTopo
                        ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
                        : isMeio
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                        : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {isTopo
                      ? "Funil: Topo (Atração)"
                      : isMeio
                      ? "Funil: Meio (Educação)"
                      : "Funil: Fundo (Conversão)"}
                  </span>
                </div>

                {/* Título & Gancho Magnético */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-white font-heading leading-snug">
                    {item.theme}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-black/40 p-3 rounded-xl border border-white/5">
                    <strong className="text-white block text-[10px] font-mono uppercase text-zinc-400 mb-0.5">
                      Hook de Abertura:
                    </strong>
                    &quot;{item.hookHeadline}&quot;
                  </p>
                </div>

                {/* Metadados Estratégicos */}
                <div className="grid grid-cols-2 gap-3 text-xs font-sans text-zinc-400">
                  <div className="rounded-xl bg-black/20 p-2.5 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block">Objetivo:</span>
                    <p className="text-zinc-300 line-clamp-2">{item.objective}</p>
                  </div>

                  <div className="rounded-xl bg-black/20 p-2.5 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block">Chamada (CTA):</span>
                    <p className="text-zinc-300 line-clamp-2">{item.ctaText}</p>
                  </div>
                </div>
              </div>

              {/* BOTÃO 1-CLIQUE: PRODUZIR ESTE POST NO ESTÚDIO */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Formato: {item.format}
                </span>

                <button
                  type="button"
                  onClick={() => selectPlanForCreation(item)}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Wand2 className="h-3.5 w-3.5 text-black" />
                  <span>Produzir no Estúdio ➔</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
