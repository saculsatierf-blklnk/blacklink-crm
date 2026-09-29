"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Layers,
  Sparkles,
} from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";

export function Step2SlideStudio() {
  const {
    draftCarousel,
    activeEditingSlideIndex,
    setActiveEditingSlideIndex,
    updateDraftSlide,
    setWizardStep,
  } = useMarketingStore();

  const [debouncedUrl, setDebouncedUrl] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const slides = draftCarousel?.slides || [];
  const currentSlide = slides[activeEditingSlideIndex] || slides[0];
  const totalSlides = slides.length || 1;

  // Debounce de 300ms para renderizar a lâmina no preview sem flicker
  useEffect(() => {
    if (!currentSlide || !draftCarousel) return;

    const timer = setTimeout(() => {
      const query = new URLSearchParams({
        slide: String(currentSlide.slideNumber || activeEditingSlideIndex + 1),
        total: String(totalSlides),
        headline: currentSlide.headline || "",
        body: currentSlide.bodyText || "",
        format: draftCarousel.format || "carousel",
        theme: draftCarousel.theme || "Estratégia B2B",
      });

      const nextUrl = `/api/marketing/render-slide?${query.toString()}`;
      startTransition(() => {
        setIsImageLoading(true);
        setDebouncedUrl(nextUrl);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    currentSlide?.headline,
    currentSlide?.bodyText,
    activeEditingSlideIndex,
    totalSlides,
    draftCarousel?.theme,
    draftCarousel?.format,
  ]);

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
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-12 text-center space-y-4">
        <Layers className="h-8 w-8 text-zinc-400 mx-auto" />
        <h3 className="text-base font-semibold tracking-tight text-white">
          Nenhum rascunho em edição no momento
        </h3>
        <button
          type="button"
          onClick={() => setWizardStep(1)}
          className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer"
        >
          Iniciar Novo Briefing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Barra de Status do Estúdio */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Etapa 2 de 3: Estúdio Slide a Slide
            </span>
            <span className="text-xs text-zinc-400 font-medium truncate">
              &bull; {draftCarousel.theme}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Edite os textos na coluna esquerda e acompanhe a renderização em tempo real na coluna direita com zero interrupção.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setWizardStep(1)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Editar Briefing</span>
          </button>

          <button
            type="button"
            onClick={() => setWizardStep(3)}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span>Avançar para Revisão</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* LAYOUT SPLIT VIEW: EDITOR DIRETO (ESQUERDA) vs PREVIEW VISUAL LIVE (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* COLUNA ESQUERDA: LISTA DE CARDS DE EDIÇÃO SLIDE A SLIDE */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
              <Edit3 className="h-3.5 w-3.5 text-white" />
              <span>Cards de Edição ({slides.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">
              Clique para focar
            </span>
          </div>

          <div className="space-y-3.5 max-h-[720px] overflow-y-auto pr-1">
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
                  className={`rounded-2xl border p-5 transition-all duration-300 cursor-pointer space-y-3.5 ${
                    isActive
                      ? "border-white/30 bg-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/20"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-mono font-bold transition-all ${
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
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Hook / Título do Slide
                    </label>
                    <input
                      type="text"
                      value={slide.headline}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateDraftSlide(idx, "headline", e.target.value)}
                      placeholder="Título de alto impacto..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder:text-zinc-600 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Textarea do Texto / BodyCopy do Slide */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Texto / BodyCopy do Slide
                    </label>
                    <textarea
                      rows={2}
                      value={slide.bodyText}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateDraftSlide(idx, "bodyText", e.target.value)}
                      placeholder="Texto de explicação densa..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder:text-zinc-600 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all resize-y"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW VISUAL LIVE (SEM FLICKER) */}
        <div className="lg:col-span-6 space-y-4 sticky top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Preview Live (Renderizador SVG)</span>
            </h3>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
              Debounce 300ms
            </span>
          </div>

          {/* Moldura de Pré-visualização do Carrossel / Story */}
          <div className="relative aspect-square w-full rounded-3xl border border-white/15 bg-black/60 overflow-hidden flex items-center justify-center shadow-2xl shadow-black/80 backdrop-blur-2xl group">
            {/* Imagem do Slide Renderizado Server-side com transição suave de opacidade */}
            {debouncedUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={debouncedUrl}
                alt={currentSlide?.headline || "Preview do slide"}
                onLoad={() => setIsImageLoading(false)}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  isImageLoading ? "opacity-75" : "opacity-100"
                }`}
              />
            ) : (
              <div className="text-center p-8 space-y-2">
                <Layers className="h-8 w-8 text-zinc-500 mx-auto animate-pulse" />
                <p className="text-xs font-mono text-zinc-400">Renderizando lâmina...</p>
              </div>
            )}

            {/* Setas de Navegação Sobrepostas Apple Glass */}
            {totalSlides > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  title="Slide Anterior"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2.5 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  title="Próximo Slide"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2.5 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Badge de Posição da Lâmina */}
            <div className="absolute bottom-4 right-4 rounded-xl bg-black/70 border border-white/15 px-3 py-1 text-[11px] font-mono text-white backdrop-blur-md shadow-md">
              Lâmina {activeEditingSlideIndex + 1} de {totalSlides}
            </div>
          </div>

          {/* Grade de Miniaturas Rápidas */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveEditingSlideIndex(idx)}
                  className={`h-11 flex-1 min-w-[50px] rounded-xl border text-xs font-mono font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center ${
                    activeEditingSlideIndex === idx
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
      </div>
    </div>
  );
}
