"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";
import { SlideArtRenderer } from "@/components/marketing/SlideArtRenderer";

export function Step3GlobalReview() {
  const {
    draftCarousel,
    updateDraftCaption,
    saveDraftToSchedule,
    setActiveMarketingTab,
    setWizardStep,
    isLoading,
    error,
  } = useMarketingStore();

  const [scheduledDateInput, setScheduledDateInput] = useState<string>(
    draftCarousel?.scheduledDate || "Amanhã • 10:00"
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!draftCarousel) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6 mb-12">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <Layers className="h-10 w-10 text-zinc-400 mx-auto" />
          <h3 className="text-2xl font-medium tracking-tight text-white">
            Nenhum carrossel pronto para revisão
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Estruture seu criativo no briefing e edite as lâminas no estúdio antes da aprovação final.
          </p>
          <button
            type="button"
            onClick={() => setWizardStep(1)}
            className="rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
          >
            Iniciar Novo Briefing
          </button>
        </div>
      </div>
    );
  }

  const handleSaveOnly = async () => {
    const success = await saveDraftToSchedule(scheduledDateInput);
    if (success) {
      setSuccessMessage("Carrossel salvo no cronograma com status 'Aguardando Aprovação'!");
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveMarketingTab("schedule");
      }, 1500);
    }
  };

  const handleApproveAndPublish = async () => {
    setIsPublishing(true);
    const success = await saveDraftToSchedule(scheduledDateInput);
    if (success) {
      setSuccessMessage("Carrossel aprovado e registrado no cronograma com sucesso!");
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveMarketingTab("schedule");
      }, 1500);
    }
    setIsPublishing(false);
  };

  const coverSlide = draftCarousel.slides?.[0];

  return (
    <div className="animate-in fade-in duration-300 space-y-10 mb-12">
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-xs text-red-300 font-mono">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-xs text-emerald-300 font-mono flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 12-COLUMN GRID SYSTEM COM GAP-10 LG:GAP-12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* COLUNA ESQUERDA (5 Colunas): Capa & Dossiê Editorial com Fórmula Exata de Vidro Apple */}
        <div className="col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Título de Seção (Padrão Apple: tracking-tight font-medium) */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  Dossiê das Lâminas
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Resumo visual e estrutura do carrossel gerado.
                </p>
              </div>
              <span className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-[10px] font-mono text-zinc-300 uppercase tracking-wider font-semibold">
                {draftCarousel.format}
              </span>
            </div>

            {/* Lâmina de Destaque (Capa / Gancho) com Motor de Renderização Dark Industrial */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
              <SlideArtRenderer
                headline={coverSlide?.headline || draftCarousel.hookHeadline || "Diagnóstico Estratégico B2B"}
                bodyText={coverSlide?.bodyText || "Alinhamento executivo de prospecção e conversão corporativa."}
                slideNumber={1}
                totalSlides={draftCarousel.slides?.length || 5}
                format={draftCarousel.format}
                niche={draftCarousel.nicheValueProposition || draftCarousel.theme}
              />
            </div>

            {/* Título de Cada Slide para Auditoria Rápida */}
            <div className="space-y-3 pt-2">
              <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                Estrutura Editorial do Carrossel
              </span>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {draftCarousel.slides?.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-black/20 p-3.5 text-xs flex items-center gap-3"
                  >
                    <span className="text-white font-mono font-bold text-[11px] bg-white/[0.08] px-2 py-0.5 rounded-md">
                      0{idx + 1}
                    </span>
                    <span className="text-zinc-300 truncate text-xs font-normal">
                      {s.headline}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão para voltar à edição */}
            <div className="pt-6 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar e Ajustar Lâminas</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (7 Colunas): Legenda & Agendamento com Fórmula Exata de Vidro Apple */}
        <div className="col-span-12 lg:col-span-7 relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Título de Seção (Padrão Apple: tracking-tight font-medium) */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-6 mb-6">
              <div>
                <h3 className="text-2xl font-medium tracking-tight text-white">
                  Legenda &amp; Programação
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Revise o texto final da publicação e determine o momento da distribuição.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full">
                Etapa 03 / 03
              </span>
            </div>

            {/* Campo de Edição da Legenda (BodyCopy) */}
            <div>
              <label
                htmlFor="bodyCopyReview"
                className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3"
              >
                Legenda Oficial do Post (Instagram / LinkedIn)
              </label>
              <textarea
                id="bodyCopyReview"
                rows={8}
                value={draftCarousel.bodyCopy}
                onChange={(e) => updateDraftCaption(e.target.value)}
                placeholder="Legenda persuasiva..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors leading-relaxed font-sans resize-y"
              />
            </div>

            {/* Hashtags Recomendadas */}
            {draftCarousel.hashtags && draftCarousel.hashtags.length > 0 && (
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                  Hashtags Estratégicas Sugeridas
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {draftCarousel.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-white/[0.05] border border-white/10 px-3 py-1 text-[11px] font-mono text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Agendamento de Data e Hora */}
            <div>
              <label
                htmlFor="scheduledDateReview"
                className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3"
              >
                Data &amp; Horário da Publicação
              </label>
              <div className="relative">
                <input
                  id="scheduledDateReview"
                  type="text"
                  value={scheduledDateInput}
                  onChange={(e) => setScheduledDateInput(e.target.value)}
                  placeholder="Ex: Amanhã • 10:00 ou 2026-10-02 14:00"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Botões de Ação Final Apple Glass */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-white/[0.08]">
              <button
                type="button"
                disabled={isLoading || isPublishing}
                onClick={handleSaveOnly}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] px-6 py-3 text-xs font-semibold text-white transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                <span>Salvar no Cronograma</span>
              </button>

              <button
                type="button"
                disabled={isLoading || isPublishing}
                onClick={handleApproveAndPublish}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-xs font-semibold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_25px_rgba(255,255,255,0.25)]"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Aprovar &amp; Registrar no Cronograma</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
