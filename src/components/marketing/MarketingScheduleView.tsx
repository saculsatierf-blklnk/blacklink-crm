"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  Layers,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";
import {
  useMarketingStore,
  type ScheduledPost,
  type PostApprovalStatus,
} from "@/store/useMarketingStore";
import { ManualAssetUploadModal } from "./ManualAssetUploadModal";

export function MarketingScheduleView() {
  const {
    scheduledPosts,
    isApprovingPostId,
    isReformulatingPostId,
    approvePost,
    updateCaption,
    requestReformulation,
  } = useMarketingStore();

  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");
  const [isManualUploadModalOpen, setIsManualUploadModalOpen] = useState<boolean>(false);

  // Estados locais para reformulação e navegação de slides
  const [reformulateOpenId, setReformulateOpenId] = useState<string | null>(null);
  const [reformulateInput, setReformulateInput] = useState<string>("");
  const [slideIndices, setSlideIndices] = useState<Record<string, number>>({});
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const filteredPosts = scheduledPosts.filter((post) => {
    if (filterStatus === "todos") return true;
    return post.status === filterStatus;
  });

  const awaitingCount = scheduledPosts.filter((p) => p.status === "awaiting_approval").length;
  const scheduledCount = scheduledPosts.filter((p) => p.status === "scheduled").length;
  const reformulationCount = scheduledPosts.filter((p) => p.status === "reformulation_requested").length;

  const handlePrevSlide = (postId: string, totalSlides: number) => {
    const current = slideIndices[postId] || 0;
    const next = current > 0 ? current - 1 : totalSlides - 1;
    setSlideIndices({ ...slideIndices, [postId]: next });
  };

  const handleNextSlide = (postId: string, totalSlides: number) => {
    const current = slideIndices[postId] || 0;
    const next = current < totalSlides - 1 ? current + 1 : 0;
    setSlideIndices({ ...slideIndices, [postId]: next });
  };

  const handleApprove = async (postId: string) => {
    setActionSuccessMessage(null);
    const success = await approvePost(postId);
    if (success) {
      setActionSuccessMessage("Ativo aprovado e transmitido ao pipeline da Meta API com sucesso!");
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const handleSubmitReformulation = async (postId: string) => {
    if (!reformulateInput.trim()) return;
    setActionSuccessMessage(null);
    const success = await requestReformulation(postId, reformulateInput.trim());
    if (success) {
      setReformulateOpenId(null);
      setReformulateInput("");
      setActionSuccessMessage("Diretriz de refação processada e lâminas reformuladas com sucesso!");
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Barra Superior do Cronograma & Métricas Rápidas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-glass-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-void">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold font-mono uppercase tracking-wider text-platinum">
              Cronograma & Mesa de Aprovação Multi-tenant
            </h2>
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">
              Meta Graph v20.0 Ready
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Revisão executiva, ajustes manuais finos e autorização de agendamento por cliente antes da ativação de verba.
          </p>
        </div>

        {/* Controles de Visualização e Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Botão de Upload Manual ("A Prateleira") */}
          <button
            type="button"
            onClick={() => setIsManualUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-mono font-bold text-accent hover:bg-accent hover:text-void transition-all cursor-pointer shadow-sm"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>+ Upload Manual de Ativo</span>
          </button>

          {/* Switcher de Modo: Timeline ou Calendário */}
          <div className="flex items-center rounded-lg border border-glass-border bg-void/50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`rounded px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-carbon text-platinum font-bold shadow-sm"
                  : "text-sub hover:text-platinum"
              }`}
            >
              Timeline Vertical
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`rounded px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-carbon text-platinum font-bold shadow-sm"
                  : "text-sub hover:text-platinum"
              }`}
            >
              Visão Semanal
            </button>
          </div>

          {/* Filtros de Status */}
          <div className="flex items-center gap-1 border-l border-glass-border/70 pl-3">
            <button
              type="button"
              onClick={() => setFilterStatus("todos")}
              className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                filterStatus === "todos"
                  ? "bg-carbon-muted border border-glass-highlight text-platinum font-bold"
                  : "text-sub hover:text-platinum"
              }`}
            >
              Todos ({scheduledPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("awaiting_approval")}
              className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                filterStatus === "awaiting_approval"
                  ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                  : "text-sub hover:text-amber-400"
              }`}
            >
              Aguardando ({awaitingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("scheduled")}
              className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                filterStatus === "scheduled"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-sub hover:text-emerald-400"
              }`}
            >
              Agendados ({scheduledCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("reformulation_requested")}
              className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                filterStatus === "reformulation_requested"
                  ? "bg-red-500/20 text-red-400 font-bold border border-red-500/30"
                  : "text-sub hover:text-red-400"
              }`}
            >
              Refações ({reformulationCount})
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback de Sucesso */}
      {actionSuccessMessage && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-mono text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Grid / Timeline de Cards de Ativos */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-glass-border bg-carbon p-12 text-center space-y-3">
          <Layers className="h-8 w-8 text-sub mx-auto" />
          <h3 className="text-sm font-bold font-mono text-platinum">
            Nenhum post encontrado para este filtro
          </h3>
          <p className="text-xs text-sub max-w-md mx-auto">
            Utilize o estúdio de geração na aba anterior para criar novas esteiras de conteúdo que serão inseridas automaticamente no cronograma.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post, postIndex) => {
            const currentSlideIndex = slideIndices[post.id] || 0;
            const totalSlides = post.slides?.length || 1;
            const activeSlide = post.slides?.[currentSlideIndex] || {
              slideNumber: 1,
              headline: post.hookHeadline,
              bodyText: post.bodyCopy,
              imageUrl: post.imageUrls?.[0],
            };

            const isAwaiting = post.status === "awaiting_approval";
            const isScheduled = post.status === "scheduled";
            const isReformulation = post.status === "reformulation_requested";

            const isApproving = isApprovingPostId === post.id;
            const isReformulating = isReformulatingPostId === post.id;
            const isReformulateInputOpen = reformulateOpenId === post.id;

            return (
              <div
                key={post.id}
                className="rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-glass-highlight space-y-6"
              >
                {/* Cabeçalho do Card de Ativo */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-glass-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-void border border-glass-border text-xs font-mono font-bold text-sub">
                      0{postIndex + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-platinum font-sans">
                          {post.theme}
                        </h3>
                        <span className="rounded bg-void border border-glass-border px-2 py-0.5 text-[10px] font-mono text-sub uppercase">
                          {post.format}
                        </span>
                        {post.sourceType === "manual" ? (
                          <span className="rounded bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-mono text-zinc-300 font-semibold flex items-center gap-1">
                            <UploadCloud className="h-2.5 w-2.5 text-accent" />
                            Manual • Prateleira
                          </span>
                        ) : (
                          <span className="rounded bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 text-[10px] font-mono text-cyan-300 font-semibold flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                            IA Autônoma
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-sub font-mono">
                        Público: {post.targetAudience || "Decisores B2B"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Badge de Horário Agendado */}
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-glass-border bg-void/60 px-2.5 py-1 text-xs font-mono text-platinum">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      <span>{post.scheduledDate}</span>
                    </div>

                    {/* Badge de Status Oficial */}
                    {isAwaiting && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono font-semibold text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Aguardando Aprovação
                      </span>
                    )}

                    {isScheduled && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Agendado na Meta API
                      </span>
                    )}

                    {isReformulation && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-mono font-semibold text-red-400">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Refação Solicitada
                      </span>
                    )}
                  </div>
                </div>

                {/* Conteúdo do Card: Split Lâminas vs Editor de Copy */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Coluna da Esquerda: Pré-visualização do Criativo com Navegação de Slides */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="relative aspect-square w-full rounded-lg border border-glass-border bg-void overflow-hidden flex items-center justify-center group shadow-inner">
                      {activeSlide.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={activeSlide.imageUrl}
                          alt={activeSlide.headline}
                          className="h-full w-full object-cover transition-transform duration-300"
                        />
                      ) : (
                        <div className="p-6 text-center space-y-2">
                          <Layers className="h-8 w-8 text-sub mx-auto" />
                          <div className="text-xs font-bold text-platinum">
                            {activeSlide.headline}
                          </div>
                          <p className="text-[11px] text-sub">{activeSlide.bodyText}</p>
                        </div>
                      )}

                      {/* Controles de Navegação de Carrossel */}
                      {totalSlides > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePrevSlide(post.id, totalSlides)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-glass-border bg-carbon/80 p-1.5 text-platinum hover:bg-carbon hover:text-white transition-all cursor-pointer shadow-lg"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNextSlide(post.id, totalSlides)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-glass-border bg-carbon/80 p-1.5 text-platinum hover:bg-carbon hover:text-white transition-all cursor-pointer shadow-lg"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {/* Contador de Lâminas */}
                      <div className="absolute bottom-2 right-2 rounded bg-void/80 border border-glass-border px-2 py-0.5 text-[10px] font-mono text-platinum">
                        Lâmina {currentSlideIndex + 1} de {totalSlides}
                      </div>
                    </div>

                    {/* Miniaturas das Lâminas para troca rápida */}
                    {totalSlides > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {post.slides.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setSlideIndices({ ...slideIndices, [post.id]: idx })
                            }
                            className={`h-12 w-12 shrink-0 rounded border text-[10px] font-mono transition-all cursor-pointer flex items-center justify-center ${
                              currentSlideIndex === idx
                                ? "border-accent bg-accent/20 text-platinum font-bold"
                                : "border-glass-border bg-void text-sub hover:border-glass-highlight"
                            }`}
                          >
                            0{idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Coluna da Direita: Textarea Editável & Controles de Ação */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Caixa de Texto Textarea Editável */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-sub flex items-center gap-1.5">
                          <Edit3 className="h-3.5 w-3.5 text-accent" />
                          <span>Legenda & Copywriting (Ajuste Fino Manual)</span>
                        </label>
                        <span className="text-[10px] font-mono text-emerald-400">
                          Edição em tempo real habilitada
                        </span>
                      </div>

                      <div className="relative">
                        <textarea
                          rows={6}
                          value={post.bodyCopy}
                          onChange={(e) => updateCaption(post.id, e.target.value)}
                          placeholder="Texto executivo da publicação..."
                          className="w-full rounded-lg border border-glass-border bg-void/70 p-3 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none focus:ring-1 focus:ring-accent/50 resize-y"
                        />
                      </div>

                      {/* Hashtags e Chamada para Ação */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {post.hashtags?.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className="rounded bg-void border border-glass-border px-2 py-0.5 text-[10px] font-mono text-sub"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Exibição de Feedback de Refação Anterior se Existente */}
                    {post.reformulationFeedback && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1 text-xs font-mono">
                        <span className="text-[10px] uppercase font-bold text-amber-400">
                          Diretriz de Refação Solicitada:
                        </span>
                        <p className="text-platinum text-[11px]">
                          &quot;{post.reformulationFeedback}&quot;
                        </p>
                      </div>
                    )}

                    {/* Input Retrátil de Reformulação (Ao Clicar no Botão Reformular) */}
                    {isReformulateInputOpen && (
                      <div className="rounded-lg border border-accent/40 bg-void/80 p-3.5 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-platinum flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-accent" />
                            Diretriz de Ajuste para IA & n8n
                          </span>
                          <button
                            type="button"
                            onClick={() => setReformulateOpenId(null)}
                            className="text-[11px] font-mono text-sub hover:text-platinum cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>

                        <input
                          type="text"
                          value={reformulateInput}
                          onChange={(e) => setReformulateInput(e.target.value)}
                          placeholder='Ex: "Troque o fundo para vermelho e deixe a copy mais agressiva para CFOs"'
                          className="w-full rounded border border-glass-border bg-carbon p-2 text-xs font-sans text-platinum placeholder:text-sub focus:border-accent focus:outline-none"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={isReformulating || !reformulateInput.trim()}
                            onClick={() => handleSubmitReformulation(post.id)}
                            className="flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-xs font-mono font-bold text-void hover:bg-platinum transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isReformulating ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Processando Refação...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3" />
                                <span>Submeter ao Pipeline</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Barra de Ações: Botão Primário (Aprovar) e Secundário (Reformular) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-glass-border/50">
                      <div className="text-[11px] font-mono text-sub">
                        {isScheduled && post.metaPostId && (
                          <span className="text-emerald-400">
                            Registro Meta: {post.metaPostId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Botão Secundário: Reformular */}
                        <button
                          type="button"
                          disabled={isReformulating || isApproving}
                          onClick={() => {
                            setReformulateOpenId(
                              isReformulateInputOpen ? null : post.id
                            );
                            setReformulateInput(post.reformulationFeedback || "");
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-void/60 px-3.5 py-2 text-xs font-mono text-sub hover:text-platinum hover:border-glass-highlight transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Reformular</span>
                        </button>

                        {/* Botão Primário: Aprovar e Agendar */}
                        <button
                          type="button"
                          disabled={isApproving || isScheduled}
                          onClick={() => handleApprove(post.id)}
                          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold transition-all cursor-pointer shadow-lg ${
                            isScheduled
                              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-default"
                              : "bg-accent text-void hover:bg-platinum hover:shadow-accent/20 disabled:opacity-50"
                          }`}
                        >
                          {isApproving ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Transmitindo à Meta API...</span>
                            </>
                          ) : isScheduled ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Aprovado & Agendado</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Aprovar e Agendar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Upload Manual ("A Prateleira") */}
      <ManualAssetUploadModal
        isOpen={isManualUploadModalOpen}
        onClose={() => setIsManualUploadModalOpen(false)}
        onSuccess={() => {
          setActionSuccessMessage("Ativo manual adicionado à esteira de aprovação com sucesso!");
          setTimeout(() => setActionSuccessMessage(null), 4000);
        }}
      />
    </div>
  );
}
