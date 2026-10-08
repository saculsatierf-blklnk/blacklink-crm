"use client";

import { useState } from "react";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Columns3,
  Download,
  Filter,
  Layers,
  ListFilter,
  Loader2,
  Plus,
  RefreshCw,
  Smartphone,
  Sparkles,
  Target,
  Wand2,
  X,
  Clock,
  ArrowRight,
  Eye,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMarketingStore,
  type EditorialPlanItem,
  type CreativeFormat,
} from "@/store/useMarketingStore";

export type PlanningViewMode = "diario" | "semanal" | "mensal";

const WEEKDAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const MONTH_WEEKS = [
  {
    week: 1,
    title: "Semana 1 • Atração & Quebra de Padrão",
    focus: "Topo de Funil (Viralização, Dores Críticas e Desmistificação)",
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
    badge: "text-sky-300 bg-sky-500/10",
  },
  {
    week: 2,
    title: "Semana 2 • Autoridade & Métricas Reais",
    focus: "Meio de Funil (Frameworks Técnicos, Casos de Sucesso e Processos)",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    badge: "text-amber-300 bg-amber-500/10",
  },
  {
    week: 3,
    title: "Semana 3 • Diferenciação & Engenharia Reversa",
    focus: "Meio de Funil (Contra-posicionamento, Clichês de Mercado e Segredos)",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    badge: "text-purple-300 bg-purple-500/10",
  },
  {
    week: 4,
    title: "Semana 4 • Conversão Executiva & Demonstração",
    focus: "Fundo de Funil (Apresentação de Solução, Oferta Direta e Inbound)",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    badge: "text-emerald-300 bg-emerald-500/10",
  },
];

export function EditorialPlanningView() {
  const {
    editorialPlan,
    isGeneratingPlan,
    generateEditorialPlan,
    selectPlanForCreation,
    addPlanItem,
    setActiveGrowthTab,
    companyProfile,
    scheduledPosts,
    setSelectedFeedPost,
    setFeedViewMode,
  } = useMarketingStore();

  const [planningViewMode, setPlanningViewMode] = useState<PlanningViewMode>("semanal");
  const [funnelFilter, setFunnelFilter] = useState<"all" | "topo" | "meio" | "fundo">("all");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<EditorialPlanItem | null>(null);

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

  // Helper para identificar se um post já está sincronizado/pronto nas prévias
  const isPostReady = (item: EditorialPlanItem) => {
    const matching = scheduledPosts.find(
      (p) =>
        p.id === item.id ||
        (p.theme && item.theme && p.theme.toLowerCase().trim() === item.theme.toLowerCase().trim())
    );
    return item.status === "pronto" || Boolean(matching);
  };

  const getMatchingPost = (item: EditorialPlanItem) => {
    return scheduledPosts.find(
      (p) =>
        p.id === item.id ||
        (p.theme && item.theme && p.theme.toLowerCase().trim() === item.theme.toLowerCase().trim())
    );
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Banner Superior Limpo com Controles Executivos */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 lg:p-8 shadow-2xl space-y-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                02
              </span>
              <h2 className="text-xl font-semibold text-white tracking-tight font-heading">
                Planejamento &amp; Cronograma Editorial
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans max-w-2xl">
              Alterne entre as visões <strong>Diária</strong>, <strong>Semanal</strong> e <strong>Mensal</strong> para observar a cadência de postagens. Envie qualquer pauta diretamente para o estúdio com 1 clique.
            </p>
          </div>

          {/* Botões Superiores de Exportação e Regeneração */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportPlan}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingPlan}
              onClick={() => generateEditorialPlan()}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Gerando Pautas...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-black" />
                  <span>Regenerar com IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {downloadFeedback && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-mono text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{downloadFeedback}</span>
          </div>
        )}

        {/* Barra de Controles: SELETOR DE VISÃO (Diária / Semanal / Mensal) + FILTRO DE FUNIL */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
          {/* Seletor de Visão (Tabs Apple / Linear) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Visão:
            </span>
            <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10">
              <button
                type="button"
                onClick={() => setPlanningViewMode("diario")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  planningViewMode === "diario"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Diária</span>
              </button>

              <button
                type="button"
                onClick={() => setPlanningViewMode("semanal")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  planningViewMode === "semanal"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Columns3 className="h-3.5 w-3.5" />
                <span>Semanal</span>
              </button>

              <button
                type="button"
                onClick={() => setPlanningViewMode("mensal")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  planningViewMode === "mensal"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                <span>Mensal</span>
              </button>
            </div>
          </div>

          {/* Filtro de Funil e Botão + Nova Pauta */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
              {(["all", "topo", "meio", "fundo"] as const).map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setFunnelFilter(stage)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    funnelFilter === stage
                      ? "bg-white/15 text-white font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {stage === "all"
                    ? "Todos"
                    : stage === "topo"
                    ? "Topo"
                    : stage === "meio"
                    ? "Meio"
                    : "Fundo"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingItem ? "Fechar" : "+ Pauta"}</span>
            </button>
          </div>
        </div>

        {/* Formulário de Adição de Nova Pauta */}
        {isAddingItem && (
          <form
            onSubmit={handleAddNewItem}
            className="rounded-2xl border border-white/10 bg-black/50 p-5 space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold text-white">Adicionar Pauta Personalizada</span>
              <span className="text-[10px] font-mono text-zinc-400">Entrada Rápida</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Dia / Data</label>
                <input
                  type="text"
                  placeholder="Ex: Terça • 14/Out"
                  value={newDayLabel}
                  onChange={(e) => setNewDayLabel(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Tema Principal *</label>
                <input
                  type="text"
                  placeholder="Ex: Como Reduzir o Ciclo de Vendas B2B em 40%"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white focus:outline-none focus:border-white/30"
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
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Estágio de Funil</label>
                <select
                  value={newFunnelStage}
                  onChange={(e) => setNewFunnelStage(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white focus:outline-none"
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
                Salvar Pauta
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 1. VISÃO DIÁRIA (Timeline Cronológica Dia a Dia)                    */}
      {/* ==================================================================== */}
      {planningViewMode === "diario" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Timeline Cronológica Diária ({filteredPlan.length} Pautas Programadas)
            </span>
            <span className="text-xs text-zinc-500">Ordenado por data de execução</span>
          </div>

          <div className="relative pl-4 sm:pl-6 border-l border-white/10 space-y-6">
            {filteredPlan.map((item, idx) => {
              const isTopo = item.funnelStage === "topo";
              const isMeio = item.funnelStage === "meio";
              const isReady = isPostReady(item);
              const matchingPost = getMatchingPost(item);

              return (
                <div key={item.id} className="relative group">
                  {/* Ponto indicador na linha do tempo */}
                  <div
                    className={`absolute -left-[21px] sm:-left-[29px] top-6 w-3 h-3 rounded-full border-2 border-black transition-transform group-hover:scale-125 ${
                      isTopo
                        ? "bg-sky-400"
                        : isMeio
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4 hover:border-white/20 transition-all shadow-lg backdrop-blur-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-white px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/10">
                          {item.dayLabel}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>10:00 • Horário Nobre</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            isTopo
                              ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
                              : isMeio
                              ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                              : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {isTopo ? "Topo (Atração)" : isMeio ? "Meio (Educação)" : "Fundo (Conversão)"}
                        </span>

                        {isReady && (
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 flex items-center gap-1">
                            <span>✓</span>
                            <span>Pronto</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-white tracking-tight font-heading">
                        {item.theme}
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-black/40 p-3 rounded-xl border border-white/5">
                        <strong className="text-zinc-400 block text-[10px] font-mono uppercase mb-0.5">
                          Gancho de Retenção (Headline do Slide 1):
                        </strong>
                        &ldquo;{item.hookHeadline}&rdquo;
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
                      <div className="rounded-xl bg-black/20 p-2.5 border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">
                          Objetivo:
                        </span>
                        <p className="text-zinc-300 line-clamp-2">{item.objective}</p>
                      </div>

                      <div className="rounded-xl bg-black/20 p-2.5 border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-0.5">
                          Chamada (CTA):
                        </span>
                        <p className="text-zinc-300 line-clamp-2">{item.ctaText}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-zinc-500 uppercase">
                        Formato: {item.format}
                      </span>

                      {isReady ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => selectPlanForCreation(item)}
                            className="text-zinc-400 hover:text-white text-xs underline cursor-pointer"
                          >
                            Editar no Estúdio
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (matchingPost) setSelectedFeedPost(matchingPost);
                              setFeedViewMode("visor");
                              setActiveGrowthTab("feed");
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 text-black px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                            <span>Ver nas Prévias ➔</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectPlanForCreation(item)}
                          className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          <span>Produzir no Estúdio ➔</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. VISÃO SEMANAL (Sprint 7 Dias - Segunda a Domingo)                */}
      {/* ==================================================================== */}
      {planningViewMode === "semanal" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Grade Semanal de Publicações (Segunda a Domingo)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Topo
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Meio
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Fundo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlan.map((item, idx) => {
              const isTopo = item.funnelStage === "topo";
              const isMeio = item.funnelStage === "meio";
              const isReady = isPostReady(item);
              const matchingPost = getMatchingPost(item);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4 hover:border-white/20 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-white px-2 py-0.5 rounded bg-white/[0.06] border border-white/10">
                        {item.dayLabel}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                          isTopo
                            ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
                            : isMeio
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        {isTopo ? "Topo" : isMeio ? "Meio" : "Fundo"}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white tracking-tight line-clamp-2 font-heading">
                      {item.theme}
                    </h4>

                    <p className="text-xs text-zinc-300 bg-black/40 p-2.5 rounded-lg border border-white/5 line-clamp-3">
                      &ldquo;{item.hookHeadline}&rdquo;
                    </p>

                    <div className="text-[11px] text-zinc-400 space-y-1">
                      <p className="line-clamp-1"><strong className="text-zinc-500">CTA:</strong> {item.ctaText}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    {isReady ? (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                        <span>✓</span> Pronto
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {item.format}
                      </span>
                    )}

                    {isReady ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (matchingPost) setSelectedFeedPost(matchingPost);
                          setFeedViewMode("visor");
                          setActiveGrowthTab("feed");
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                      >
                        Ver Prévias ➔
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => selectPlanForCreation(item)}
                        className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                      >
                        <Wand2 className="h-3 w-3" />
                        <span>Produzir ➔</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Card de Slot Livre da Semana */}
            <div className="rounded-2xl border border-dashed border-white/10 p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[220px]">
              <Calendar className="h-5 w-5 text-zinc-600" />
              <p className="text-xs text-zinc-400 font-medium">Dias Livres na Semana</p>
              <p className="text-[10px] text-zinc-500 max-w-[180px]">
                Espaço dedicado para stories diários, enquetes e engajamento orgânico.
              </p>
              <button
                type="button"
                onClick={() => setIsAddingItem(true)}
                className="mt-1 text-xs text-white hover:underline font-mono"
              >
                + Adicionar Pauta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. VISÃO MENSAL (Calendário Estratégico 4 Semanas)                   */}
      {/* ==================================================================== */}
      {planningViewMode === "mensal" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Visão Mensal Estratégica (Ciclo de 4 Semanas de Crescimento)
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Total: {filteredPlan.length} Pautas Ativas • Cobertura de Funil: 100%
            </span>
          </div>

          {/* 4 Blocos de Semanas Estratégicas do Mês */}
          <div className="space-y-4">
            {MONTH_WEEKS.map((weekInfo, weekIdx) => {
              // Associa itens correspondentes a cada semana de acordo com a ordem
              const weekPlanItem = filteredPlan[weekIdx];
              const isReady = weekPlanItem ? isPostReady(weekPlanItem) : false;
              const matchingPost = weekPlanItem ? getMatchingPost(weekPlanItem) : undefined;

              return (
                <div
                  key={weekInfo.week}
                  className={`rounded-2xl border ${weekInfo.border} bg-white/[0.02] p-5 space-y-4 transition-all shadow-md`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                      <div>
                        <h4 className="text-sm font-semibold text-white tracking-tight font-heading">
                          {weekInfo.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-sans">{weekInfo.focus}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-md border border-white/10 ${weekInfo.badge}`}>
                      Semana {weekInfo.week} de 4
                    </span>
                  </div>

                  {weekPlanItem ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="space-y-1 md:col-span-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-400 font-bold">
                            {weekPlanItem.dayLabel}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-white">
                            {weekPlanItem.funnelStage}
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-white leading-snug">
                          {weekPlanItem.theme}
                        </h5>
                        <p className="text-xs text-zinc-300 line-clamp-1 italic">
                          &ldquo;{weekPlanItem.hookHeadline}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center justify-start md:justify-end gap-2.5 pt-2 md:pt-0">
                        {isReady ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (matchingPost) setSelectedFeedPost(matchingPost);
                              setFeedViewMode("visor");
                              setActiveGrowthTab("feed");
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 text-black px-4 py-2 text-xs font-bold hover:bg-emerald-400 transition-all cursor-pointer shadow-sm"
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                            <span>Ver nas Prévias</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => selectPlanForCreation(weekPlanItem)}
                            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                          >
                            <Wand2 className="h-3.5 w-3.5" />
                            <span>Produzir no Estúdio ➔</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-zinc-500 font-mono">
                      Pauta em elaboração para este período • Clique em &quot;+ Pauta&quot; para preencher.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
