"use client";

import { useState, useMemo } from "react";
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
  Check,
  FileText,
  BrainCircuit,
  Zap,
  TrendingUp,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMarketingStore,
  type EditorialPlanItem,
  type DailyActivityItem,
  type CreativeFormat,
  type AgendaDay,
} from "@/store/useMarketingStore";

export type PlanningViewMode = "diario" | "semanal" | "mensal";

const MONTH_WEEKS = [
  {
    week: 1,
    title: "Semana 1 • Atração & Quebra de Padrão",
    focus: "Topo de Funil (Viralização, Dores Críticas e Desmistificação de Problemas)",
    border: "border-sky-500/30",
    badge: "text-sky-300 bg-sky-500/10",
  },
  {
    week: 2,
    title: "Semana 2 • Autoridade & Métricas Reais",
    focus: "Meio de Funil (Frameworks Técnicos, Casos de Sucesso e Processos)",
    border: "border-amber-500/30",
    badge: "text-amber-300 bg-amber-500/10",
  },
  {
    week: 3,
    title: "Semana 3 • Diferenciação & Engenharia Reversa",
    focus: "Meio de Funil (Contra-posicionamento, Clichês de Mercado e Segredos de Escala)",
    border: "border-purple-500/30",
    badge: "text-purple-300 bg-purple-500/10",
  },
  {
    week: 4,
    title: "Semana 4 • Conversão Executiva & Demonstração",
    focus: "Fundo de Funil (Apresentação de Solução, Oferta Direta e Inbound)",
    border: "border-emerald-500/30",
    badge: "text-emerald-300 bg-emerald-500/10",
  },
];

export function EditorialPlanningView() {
  const {
    editorialPlan,
    weeklyAgenda,
    cadenceStrategy,
    isOptimizingCadence,
    optimizeCadenceWithAI,
    isGeneratingPlan,
    generateEditorialPlan,
    selectPlanForCreation,
    addPlanItem,
    companyProfile,
    scheduledPosts,
  } = useMarketingStore();

  const [planningViewMode, setPlanningViewMode] = useState<PlanningViewMode>("diario");
  // Índice 2 = Quarta-feira 08/Out (HOJE)
  const [selectedAgendaDayIndex, setSelectedAgendaDayIndex] = useState<number>(2);
  const [funnelFilter, setFunnelFilter] = useState<"all" | "topo" | "meio" | "fundo">("all");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [showAgentDetails, setShowAgentDetails] = useState<boolean>(true);

  // Form State
  const [newTheme, setNewTheme] = useState("");
  const [newHook, setNewHook] = useState("");
  const [newDayLabel, setNewDayLabel] = useState("");
  const [newFormat, setNewFormat] = useState<CreativeFormat>("carousel");
  const [newFunnelStage, setNewFunnelStage] = useState<"topo" | "meio" | "fundo">("meio");
  const [newObjective, setNewObjective] = useState("");
  const [newCta, setNewCta] = useState("");

  // Dia atualmente selecionado na agenda
  const selectedDay = useMemo(() => {
    return weeklyAgenda[selectedAgendaDayIndex] || weeklyAgenda[2] || weeklyAgenda[0];
  }, [weeklyAgenda, selectedAgendaDayIndex]);

  // Atividades filtradas do dia selecionado
  const filteredDayActivities = useMemo(() => {
    if (!selectedDay?.activities) return [];
    if (funnelFilter === "all") return selectedDay.activities;
    return selectedDay.activities.filter((act) => act.funnelStage === funnelFilter);
  }, [selectedDay, funnelFilter]);

  /**
   * Leva diretamente para o Estúdio de Criação com o briefing da atividade carregado
   */
  const handleProduceActivity = (dayLabel: string, activity: DailyActivityItem) => {
    const planItem: EditorialPlanItem = {
      id: activity.id,
      dayNumber: (selectedDay?.index ?? 0) + 1,
      dayLabel: `${dayLabel} • ${activity.time}`,
      theme: activity.theme,
      hookHeadline: activity.hookHeadline || activity.theme,
      format: activity.format,
      funnelStage: activity.funnelStage,
      objective: activity.objective,
      viralAngle: activity.aiRationale || activity.objective,
      ctaText: activity.ctaText,
      status: "em_producao",
      scheduledTime: activity.time,
    };

    selectPlanForCreation(planItem);
  };

  const handleExportPlan = () => {
    const headers = [
      "Dia da Semana",
      "Horario (Definido pela IA)",
      "Formato",
      "Estagio de Funil",
      "Tema da Publicacao",
      "Hook Magnetico (Slide 1)",
      "Racional Algoritmico da IA",
      "Objetivo Estrategico",
      "CTA Sugerida",
      "Status",
    ];

    const rows: string[][] = [];

    weeklyAgenda.forEach((day) => {
      day.activities.forEach((act) => {
        rows.push([
          `"${day.fullName} (${day.dateNumber}/Out)"`,
          `"${act.time}"`,
          `"${act.format}"`,
          `"${act.funnelStage}"`,
          `"${act.theme.replace(/"/g, '""')}"`,
          `"${act.hookHeadline.replace(/"/g, '""')}"`,
          `"${(act.aiRationale || "").replace(/"/g, '""')}"`,
          `"${act.objective.replace(/"/g, '""')}"`,
          `"${act.ctaText.replace(/"/g, '""')}"`,
          `"${act.status || "planejado"}"`,
        ]);
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const brandFileName = (companyProfile.name || "blacklink")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `agenda_cadencia_ia_${brandFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadFeedback("Agenda de cadência da IA exportada com sucesso em CSV!");
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
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* ==================================================================== */}
      {/* CARD DO AGENTE ESPECIALISTA EM CADÊNCIA & ALGORITMO EDITORIAL        */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.08] via-black/60 to-black/90 backdrop-blur-2xl p-6 lg:p-7 shadow-2xl space-y-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 border-b border-white/[0.08] pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500 text-black px-2.5 py-1 text-xs font-mono font-extrabold uppercase shadow-sm">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Agente Especialista de IA</span>
              </span>
              <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                {cadenceStrategy.strategyName}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight font-heading">
              Cadência &amp; Horários Calculados por Inteligência Artificial
            </h2>
            <p className="text-xs text-zinc-300 font-sans max-w-3xl leading-relaxed">
              Os horários, quantidade e formatos de postagens desta agenda <strong>não são fixos nem arbitrários</strong>. Eles foram calculados pelo Agente de IA com base no comportamento de consumo e janelas de atenção do seu público.
            </p>
          </div>

          {/* Botão de Otimização da Cadência com Agente de IA */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isOptimizingCadence}
              onClick={() => optimizeCadenceWithAI()}
              className="flex items-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 px-4 py-2 text-xs font-bold text-black transition-all cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isOptimizingCadence ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Calculando Cadência com IA...</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 text-black fill-black" />
                  <span>Recalcular Cadência com Agente de IA</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportPlan}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Resumo do Racional Estratégico do Agente de IA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Racional Algorítmico */}
          <div className="md:col-span-2 rounded-2xl bg-black/50 border border-white/10 p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-extrabold flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>Racional do Agente de IA para Este Perfil:</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Atualizado: {cadenceStrategy.lastOptimizedAt}
              </span>
            </div>
            <p className="text-xs text-zinc-200 font-sans leading-relaxed">
              {cadenceStrategy.rationale}
            </p>
          </div>

          {/* Janelas de Pico Calculadas */}
          <div className="rounded-2xl bg-black/50 border border-white/10 p-4 space-y-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-extrabold block">
              Janelas de Pico Decididas pela IA:
            </span>
            <div className="space-y-1.5">
              {cadenceStrategy.peakEngagementWindows.map((win, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[11px] font-mono text-zinc-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="line-clamp-1">{win}</span>
                </div>
              ))}
            </div>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-2 border-t border-white/[0.06]">
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
                <span>Diária (Agenda com IA)</span>
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
                <span>Semanal (Grade 7 Dias)</span>
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
                <span>Mensal (Estratégico)</span>
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
            className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4 animate-in fade-in duration-200"
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
                  placeholder="Ex: Quarta • 08/Out"
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
      {/* 1. VISÃO DIÁRIA COM AGENDA DECIDIDA PELO AGENTE DE IA                */}
      {/* ==================================================================== */}
      {planningViewMode === "diario" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SELETOR INTERATIVO DE DIAS DA AGENDA */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Agenda Semanal da IA • Clique no Dia para Ver os Horários
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Hoje é Quarta, 08/Out
              </span>
            </div>

            {/* Strip de 7 Botões de Dias */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {weeklyAgenda.map((day) => {
                const isSelected = day.index === selectedAgendaDayIndex;
                const isToday = day.isToday;

                return (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => setSelectedAgendaDayIndex(day.index)}
                    className={`relative flex flex-col items-center justify-center py-3 px-1 sm:px-2 rounded-xl border transition-all cursor-pointer group text-center ${
                      isSelected
                        ? "bg-white text-black border-white shadow-lg scale-[1.02]"
                        : isToday
                        ? "bg-emerald-500/10 border-emerald-500/40 text-white hover:border-emerald-500/60"
                        : "bg-black/30 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {/* Badge "HOJE" */}
                    {isToday && (
                      <span
                        className={`absolute -top-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-tight shadow-sm ${
                          isSelected
                            ? "bg-black text-emerald-400 border border-emerald-400/40"
                            : "bg-emerald-500 text-black"
                        }`}
                      >
                        Hoje
                      </span>
                    )}

                    <span
                      className={`text-[10px] sm:text-xs font-mono font-bold uppercase ${
                        isSelected ? "text-zinc-800" : isToday ? "text-emerald-300" : "text-zinc-400"
                      }`}
                    >
                      {day.shortName}
                    </span>

                    <span
                      className={`text-base sm:text-xl font-bold tracking-tight font-heading my-0.5 ${
                        isSelected ? "text-black" : "text-white"
                      }`}
                    >
                      {day.dateNumber}
                    </span>

                    {/* Indicadores de horários/atividades decididas pela IA naquele dia */}
                    <div className="flex items-center gap-1 mt-0.5">
                      {day.activities.map((act, i) => (
                        <span
                          key={act.id || i}
                          title={`${act.time} ${act.format}`}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? act.format === "story"
                                ? "bg-purple-600"
                                : "bg-sky-600"
                              : act.format === "story"
                              ? "bg-purple-400"
                              : "bg-sky-400"
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CABEÇALHO DO DIA SELECIONADO */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                  {selectedDay.fullDateLabel}
                </h3>
                {selectedDay.isToday && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Dia Atual
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Foco do Dia: <strong>{selectedDay.strategicFocus}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
                {filteredDayActivities.length} Atividades Prescritas pela IA
              </span>
              <button
                type="button"
                onClick={() => setPlanningViewMode("semanal")}
                className="text-xs font-mono text-zinc-400 hover:text-white underline cursor-pointer flex items-center gap-1 ml-2"
              >
                <span>Ver semana inteira</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* LINHA DO TEMPO DOS HORÁRIOS DO DIA SELECIONADO */}
          <div className="space-y-4">
            {filteredDayActivities.map((activity) => {
              const isStory = activity.format === "story";
              const isCarousel = activity.format === "carousel";
              const isTopo = activity.funnelStage === "topo";
              const isMeio = activity.funnelStage === "meio";

              return (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4 hover:border-white/20 transition-all shadow-xl backdrop-blur-xl group"
                >
                  {/* Top Bar da Atividade com Horário da IA e Formato */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-3">
                      {/* Badge de Horário Calculado pela IA */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-emerald-500/30 text-white font-mono text-xs font-bold shadow-inner">
                        <Clock className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-extrabold">{activity.time}</span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {activity.period === "manha"
                            ? "• Abertura Matinal"
                            : activity.period === "tarde"
                            ? "• Janela de Almoço"
                            : "• Encerramento / Noite"}
                        </span>
                      </div>

                      {/* Badge de Formato */}
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                          isStory
                            ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                            : isCarousel
                            ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
                            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        {isStory ? (
                          <Smartphone className="h-3.5 w-3.5" />
                        ) : isCarousel ? (
                          <Layers className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {isStory
                            ? "Story (9:16)"
                            : isCarousel
                            ? "Carrossel (Feed)"
                            : "Post Único"}
                        </span>
                      </span>
                    </div>

                    {/* Badge de Estágio de Funil */}
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

                      {activity.status === "pronto" && (
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Pronto</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Racional Algorítmico do Agente de IA para Este Horário */}
                  {activity.aiRationale && (
                    <div className="flex items-start gap-2 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-200/90 font-sans">
                      <BrainCircuit className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <strong className="text-emerald-300 font-mono text-[11px] uppercase block mb-0.5">
                          Racional do Agente de IA para este Horário:
                        </strong>
                        <p className="leading-relaxed">{activity.aiRationale}</p>
                      </div>
                    </div>
                  )}

                  {/* Conteúdo: Tema e Gancho */}
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-white tracking-tight font-heading">
                      {activity.theme}
                    </h4>

                    <div className="rounded-xl bg-black/50 border border-white/5 p-3.5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                        {isStory ? "Gancho da Tela de Abertura do Story:" : "Gancho de Retenção (Headline do Slide 1):"}
                      </span>
                      <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                        &ldquo;{activity.hookHeadline}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Grid de Objetivo e CTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-black/30 p-3 border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">
                        Objetivo Estratégico:
                      </span>
                      <p className="text-zinc-300 leading-relaxed">{activity.objective}</p>
                    </div>

                    <div className="rounded-xl bg-black/30 p-3 border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">
                        Chamada para Ação (CTA):
                      </span>
                      <p className="text-zinc-300 leading-relaxed">{activity.ctaText}</p>
                    </div>
                  </div>

                  {/* Rodapé com o BOTÃO DE AÇÃO OBRIGATÓRIO (PRODUZIR NO ESTÚDIO) */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400">
                      Horário prescrito: <strong className="text-white">{activity.time}</strong> • {isStory ? "9:16 Vertical" : "Feed"}
                    </span>

                    {/* BOTÃO PRIMÁRIO: PRODUZIR NO ESTÚDIO */}
                    <button
                      type="button"
                      onClick={() => handleProduceActivity(selectedDay.dayLabel, activity)}
                      className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg"
                    >
                      <Wand2 className="h-3.5 w-3.5 text-black" />
                      <span>
                        {isStory
                          ? "⚡ Produzir Story no Estúdio ➔"
                          : isCarousel
                          ? "⚡ Produzir Carrossel no Estúdio ➔"
                          : "⚡ Produzir Post no Estúdio ➔"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. VISÃO SEMANAL EXPANDIDA (Grade Completa com Horários da IA)       */}
      {/* ==================================================================== */}
      {planningViewMode === "semanal" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white font-bold block">
                Grade Semanal Prescrita pelo Agente de IA (Segunda a Domingo)
              </span>
              <span className="text-xs text-zinc-400">
                Horários calculados para o nicho de {companyProfile.name || "sua empresa"}. Clique em qualquer pauta para produzir.
              </span>
            </div>

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

          {/* Grid dos 7 Dias da Semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weeklyAgenda.map((day) => {
              const isToday = day.isToday;
              const mainAct = day.activities.find((a) => a.format !== "story") || day.activities[0];

              return (
                <div
                  key={day.index}
                  className={`rounded-2xl border p-5 space-y-4 transition-all shadow-md flex flex-col justify-between ${
                    isToday
                      ? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                            isToday
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-white/[0.06] text-white border-white/10"
                          }`}
                        >
                          {day.dayLabel}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-mono uppercase bg-emerald-500 text-black px-1.5 py-0.2 rounded font-extrabold">
                            Hoje
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAgendaDayIndex(day.index);
                          setPlanningViewMode("diario");
                        }}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        Abrir Agenda ➔
                      </button>
                    </div>

                    {/* Pauta Principal do Dia */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="text-emerald-400 font-bold">
                          {mainAct.time} • {mainAct.format === "story" ? "Story" : "Post Feed"}
                        </span>
                        <span className="uppercase text-zinc-400">{mainAct.funnelStage}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white tracking-tight line-clamp-2 font-heading">
                        {mainAct.theme}
                      </h4>
                      <p className="text-xs text-zinc-300 bg-black/40 p-2.5 rounded-lg border border-white/5 line-clamp-2">
                        &ldquo;{mainAct.hookHeadline}&rdquo;
                      </p>
                    </div>

                    {/* Cadência Horária Decidida pelo Agente */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                        Cadência Horária da IA ({day.activities.length} Atividades):
                      </span>
                      <div className="space-y-1">
                        {day.activities.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-center justify-between text-[11px] bg-black/30 px-2 py-1.5 rounded-md border border-white/5"
                          >
                            <span className="font-mono text-emerald-400 font-bold">{act.time}</span>
                            <span className="text-zinc-400 line-clamp-1 max-w-[130px] text-[10px]">
                              {act.format === "story" ? "Story: " : "Feed: "}
                              {act.theme}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleProduceActivity(day.dayLabel, act)}
                              className="text-[10px] font-semibold text-white hover:underline cursor-pointer"
                            >
                              Produzir ➔
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card com Botão Primário para Produzir */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {day.activities.length} slots ativos
                    </span>

                    <button
                      type="button"
                      onClick={() => handleProduceActivity(day.dayLabel, mainAct)}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                    >
                      <Wand2 className="h-3 w-3" />
                      <span>Produzir no Estúdio ➔</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
              Total: 21 Atividades Programadas pela IA • Cobertura de Funil: 100%
            </span>
          </div>

          {/* 4 Blocos de Semanas Estratégicas do Mês */}
          <div className="space-y-4">
            {MONTH_WEEKS.map((weekInfo, weekIdx) => {
              const weekPlanItem = editorialPlan[weekIdx];

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
                        {/* Botão Primário é SEMPRE Produzir no Estúdio */}
                        <button
                          type="button"
                          onClick={() => selectPlanForCreation(weekPlanItem)}
                          className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          <span>Produzir no Estúdio ➔</span>
                        </button>
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
