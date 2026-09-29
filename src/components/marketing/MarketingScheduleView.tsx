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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Barra Superior do Cronograma & Métricas Rápidas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Cronograma & Mesa de Aprovação
            </h2>
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Meta Graph v20.0
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Revisão executiva, ajustes manuais finos e autorização de agendamento por cliente antes da ativação de verba.
          </p>
        </div>

        {/* Controles de Visualização e Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Botão de Upload Manual ("A Prateleira") */}
          <button
            type="button"
            onClick={() => setIsManualUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 cursor-pointer shadow-sm"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>+ Upload Manual de Ativo</span>
          </button>

          {/* Switcher de Modo: Timeline ou Calendário */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all duration-300 cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-white/[0.12] border border-white/15 text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Timeline Vertical
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all duration-300 cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white/[0.12] border border-white/15 text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Visão Semanal
            </button>
          </div>

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
              Todos ({scheduledPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("awaiting_approval")}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
                filterStatus === "awaiting_approval"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40"
                  : "text-zinc-400 hover:text-amber-300"
              }`}
            >
              Aguardando ({awaitingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("scheduled")}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
                filterStatus === "scheduled"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40"
                  : "text-zinc-400 hover:text-emerald-300"
              }`}
            >
              Agendados ({scheduledCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("reformulation_requested")}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
                filterStatus === "reformulation_requested"
                  ? "bg-red-500/20 text-red-300 font-semibold border border-red-500/40"
                  : "text-zinc-400 hover:text-red-300"
              }`}
            >
              Refações ({reformulationCount})
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback de Sucesso Apple Glass */}
      {actionSuccessMessage && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-mono text-emerald-300 flex items-center gap-2.5 animate-fadeIn backdrop-blur-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Grid / Timeline de Cards de Ativos */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-14 text-center space-y-3">
          <Layers className="h-8 w-8 text-zinc-500 mx-auto" />
          <h3 className="text-base font-semibold tracking-tight text-white">
            Nenhum post encontrado para este filtro
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Utilize o estúdio de geração na aba anterior para criar novas esteiras de conteúdo que serão inseridas automaticamente no cronograma.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
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
                className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 sm:p-8 shadow-2xl shadow-black/60 transition-all duration-300 hover:border-white/20 space-y-6"
              >
                {/* Cabeçalho do Card de Ativo */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-zinc-300">
                      0{postIndex + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-semibold text-white tracking-tight">
                          {post.theme}
                        </h3>
                        <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                          {post.format}
                        </span>
                        {post.sourceType === "manual" ? (
                          <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 text-[10px] font-mono text-zinc-300 font-semibold flex items-center gap-1.5">
                            <UploadCloud className="h-3 w-3 text-white" />
                            Manual • Prateleira
                          </span>
                        ) : (
                          <span className="rounded-full bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-cyan-400" />
                            IA Autônoma
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
                        Público: {post.targetAudience || "Decisores B2B"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Badge de Horário Agendado */}
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-mono text-zinc-200">
                      <Clock className="h-3.5 w-3.5 text-white" />
                      <span>{post.scheduledDate}</span>
                    </div>

                    {/* Badge de Status Oficial */}
                    {isAwaiting && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Aguardando Aprovação
                      </span>
                    )}

                    {isScheduled && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Agendado na Meta API
                      </span>
                    )}

                    {isReformulation && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-300">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Refação Solicitada
                      </span>
                    )}
                  </div>
                </div>

                {/* Conteúdo do Card: Split Lâminas vs Editor de Copy */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Coluna da Esquerda: Pré-visualização do Criativo com Navegação de Slides */}
                  <div className="lg:col-span-5 space-y-3.5">
                    <div className="relative aspect-square w-full rounded-2xl border border-white/15 bg-black/60 overflow-hidden flex items-center justify-center group shadow-inner">
                      {activeSlide.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={activeSlide.imageUrl}
                          alt={activeSlide.headline}
                          className="h-full w-full object-cover transition-transform duration-300"
                        />
                      ) : (
                        <div className="p-6 text-center space-y-2">
                          <Layers className="h-8 w-8 text-zinc-500 mx-auto" />
                          <div className="text-xs font-semibold text-white">
                            {activeSlide.headline}
                          </div>
                          <p className="text-[11px] text-zinc-400">{activeSlide.bodyText}</p>
                        </div>
                      )}

                      {/* Controles de Navegação de Carrossel */}
                      {totalSlides > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePrevSlide(post.id, totalSlides)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNextSlide(post.id, totalSlides)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {/* Contador de Lâminas */}
                      <div className="absolute bottom-3 right-3 rounded-xl bg-black/70 border border-white/15 px-3 py-1 text-[11px] font-mono text-white backdrop-blur-md">
                        Lâmina {currentSlideIndex + 1} de {totalSlides}
                      </div>
                    </div>

                    {/* Miniaturas das Lâminas para troca rápida */}
                    {totalSlides > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {post.slides.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setSlideIndices({ ...slideIndices, [post.id]: idx })
                            }
                            className={`h-11 flex-1 min-w-[48px] rounded-xl border text-[11px] font-mono font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center ${
                              currentSlideIndex === idx
                                ? "border-white/40 bg-white/[0.15] text-white ring-1 ring-white/30 shadow-md"
                                : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            0{idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Coluna da Direita: Textarea Editável & Controles de Ação */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Caixa de Texto Textarea Editável */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold tracking-tight text-zinc-300 flex items-center gap-2">
                          <Edit3 className="h-3.5 w-3.5 text-white" />
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
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all resize-y leading-relaxed"
                        />
                      </div>

                      {/* Hashtags e Chamada para Ação */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {post.hashtags?.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className="rounded-full bg-white/[0.04] border border-white/10 px-3 py-0.5 text-[10px] font-mono text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Exibição de Feedback de Refação Anterior se Existente */}
                    {post.reformulationFeedback && (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5 text-xs">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                          Diretriz de Refação Solicitada:
                        </span>
                        <p className="text-zinc-200 text-xs">
                          &quot;{post.reformulationFeedback}&quot;
                        </p>
                      </div>
                    )}

                    {/* Input Retrátil de Reformulação (Ao Clicar no Botão Reformular) */}
                    {isReformulateInputOpen && (
                      <div className="rounded-2xl border border-white/20 bg-white/[0.05] backdrop-blur-xl p-4 space-y-3.5 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold tracking-tight text-white flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                            Diretriz de Ajuste para IA & n8n
                          </span>
                          <button
                            type="button"
                            onClick={() => setReformulateOpenId(null)}
                            className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>

                        <input
                          type="text"
                          value={reformulateInput}
                          onChange={(e) => setReformulateInput(e.target.value)}
                          placeholder='Ex: "Troque o fundo para tom grafite escuro e deixe a copy mais assertiva"'
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={isReformulating || !reformulateInput.trim()}
                            onClick={() => handleSubmitReformulation(post.id)}
                            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50"
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
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
                      <div className="text-[11px] font-mono text-zinc-400">
                        {isScheduled && post.metaPostId && (
                          <span className="text-emerald-400">
                            Registro Meta: {post.metaPostId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
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
                          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Reformular</span>
                        </button>

                        {/* Botão Primário: Aprovar e Agendar */}
                        <button
                          type="button"
                          disabled={isApproving || isScheduled}
                          onClick={() => handleApprove(post.id)}
                          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold tracking-tight transition-all cursor-pointer shadow-lg ${
                            isScheduled
                              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default"
                              : "bg-white text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
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
