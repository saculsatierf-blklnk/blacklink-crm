"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";
import { SlideArtRenderer } from "@/components/marketing/SlideArtRenderer";

export function Step2SlideStudio() {
  const {
    draftCarousel,
    activeEditingSlideIndex,
    setActiveEditingSlideIndex,
    updateDraftSlide,
    setWizardStep,
  } = useMarketingStore();

  const slides = draftCarousel?.slides || [];
  const currentSlide = slides[activeEditingSlideIndex] || slides[0];
  const totalSlides = slides.length || 1;

  const handlePrevSlide = () => {
    const nextIdx = activeEditingSlideIndex > 0 ? activeEditingSlideIndex - 1 : totalSlides - 1;
    setActiveEditingSlideIndex(nextIdx);
  };

  const handleNextSlide = () => {
    const nextIdx = activeEditingSlideIndex < totalSlides - 1 ? activeEditingSlideIndex + 1 : 0;
    setActiveEditingSlideIndex(nextIdx);
  };

  if (!draftCarousel) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6 mb-12">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <Layers className="h-10 w-10 text-zinc-400 mx-auto" />
          <h3 className="text-2xl font-medium tracking-tight text-white">
            Nenhum rascunho em edição no momento
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Inicie um novo briefing de geração autônoma para que a IA estruture as lâminas de alta retenção.
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

  return (
    <div className="animate-in fade-in duration-300 mb-12">
      {/* 12-COLUMN GRID SYSTEM COM GAP-10 LG:GAP-12 (CONTROLES: 5 Colunas vs PREVIEW: 7 Colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* COLUNA ESQUERDA (5 Colunas): LISTA DE CARDS DE EDIÇÃO COM FÓRMULA EXATA DE VIDRO APPLE */}
        <div className="col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Título de Seção (Padrão Apple: tracking-tight font-medium) */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  Lâminas Editoriais
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Selecione a lâmina para editar o texto e ver a prévia ao vivo.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full">
                {slides.length} slides
              </span>
            </div>

            {/* Lista de Slides com Scroll Interno Limpo */}
            <div className="space-y-5 max-h-[720px] overflow-y-auto pr-1">
              {slides.map((slide, idx) => {
                const isActive = activeEditingSlideIndex === idx;
                const slideBadge =
                  idx === 0
                    ? "Gancho Principal"
                    : idx === totalSlides - 1
                    ? "Chamada Final"
                    : `Passo 0${idx + 1}`;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveEditingSlideIndex(idx)}
                    className={`rounded-2xl border p-6 transition-all duration-300 cursor-pointer space-y-5 ${
                      isActive
                        ? "border-white/40 bg-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/20"
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-mono font-bold transition-all ${
                            isActive
                              ? "bg-white text-black"
                              : "bg-white/[0.06] text-zinc-400 border border-white/10"
                          }`}
                        >
                          0{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-white tracking-tight uppercase">
                          Slide 0{idx + 1} &bull; {slideBadge}
                        </span>
                      </div>

                      {isActive && (
                        <span className="rounded-full bg-white/[0.15] border border-white/25 px-2.5 py-0.5 text-[9px] font-mono font-semibold text-white uppercase tracking-wider">
                          Foco Ativo
                        </span>
                      )}
                    </div>

                    {/* Input do Título / Hook do Slide */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                        Hook / Título do Slide
                      </label>
                      <input
                        type="text"
                        value={slide.headline}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateDraftSlide(idx, "headline", e.target.value)}
                        placeholder="Título de alto impacto..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Textarea do Texto / BodyCopy do Slide */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                        Texto Explicativo / BodyCopy
                      </label>
                      <textarea
                        rows={2}
                        value={slide.bodyText}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateDraftSlide(idx, "bodyText", e.target.value)}
                        placeholder="Texto de explicação densa..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors resize-y"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (7 Colunas): PREVIEW VISUAL LIVE COM MOTOR DE RENDERIZAÇÃO DARK INDUSTRIAL */}
        <div className="col-span-12 lg:col-span-7 relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl sticky top-24">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Título de Seção (Padrão Apple) */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-6 mb-6">
              <div>
                <h3 className="text-2xl font-medium tracking-tight text-white">
                  Preview em Tempo Real
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Design de alta densidade B2B (Dark Industrial). Atualização instantânea.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-mono text-emerald-300 font-semibold">
                Live Canvas
              </span>
            </div>

            {/* Canvas do Motor de Renderização Gráfica B2B */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl group flex items-center justify-center">
              <SlideArtRenderer
                headline={currentSlide?.headline || ""}
                bodyText={currentSlide?.bodyText || ""}
                slideNumber={activeEditingSlideIndex + 1}
                totalSlides={totalSlides}
                format={draftCarousel?.format || "carousel"}
                niche={draftCarousel?.nicheValueProposition || draftCarousel?.theme}
              />

              {/* Setas de Navegação Sobrepostas Apple Glass */}
              {totalSlides > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    title="Slide Anterior"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl z-20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    title="Próximo Slide"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl z-20"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Grade de Miniaturas Rápidas */}
            {totalSlides > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveEditingSlideIndex(idx)}
                    className={`h-11 flex-1 min-w-[50px] rounded-xl border text-xs font-mono font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center ${
                      activeEditingSlideIndex === idx
                        ? "border-white/40 bg-white/[0.15] text-white ring-1 ring-white/30 shadow-md"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Ações de Navegação da Etapa */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar ao Briefing</span>
              </button>

              <button
                type="button"
                onClick={() => setWizardStep(3)}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <span>Avançar para Revisão</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
