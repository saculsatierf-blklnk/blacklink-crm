"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
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
      <div className="rounded-xl border border-glass-border bg-carbon p-12 text-center space-y-4">
        <Layers className="h-8 w-8 text-sub mx-auto" />
        <h3 className="text-sm font-bold font-mono text-platinum">
          Nenhum rascunho em edição no momento
        </h3>
        <button
          type="button"
          onClick={() => setWizardStep(1)}
          className="rounded-lg bg-accent px-4 py-2 text-xs font-mono font-bold text-void cursor-pointer"
        >
          Iniciar Novo Briefing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Barra de Status do Estúdio */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-glass-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent font-bold">
              Etapa 2 de 3: Estúdio Slide a Slide
            </span>
            <span className="text-xs text-sub font-mono">
              &bull; {draftCarousel.theme}
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Edite os textos na coluna esquerda e acompanhe a renderização em tempo real na coluna direita com zero interrupção.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setWizardStep(1)}
            className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-void/50 px-3 py-1.5 text-xs font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Editar Briefing</span>
          </button>

          <button
            type="button"
            onClick={() => setWizardStep(3)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold font-mono text-void hover:bg-platinum transition-all cursor-pointer shadow-lg hover:shadow-accent/20"
          >
            <span>Avançar para Revisão & Legenda</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* LAYOUT SPLIT VIEW: EDITOR DIRETO (ESQUERDA) vs PREVIEW VISUAL LIVE (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA: LISTA DE CARDS DE EDIÇÃO SLIDE A SLIDE */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-platinum flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5 text-accent" />
              <span>Cards de Edição dos Slides ({slides.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-sub">
              Clique no card para alternar o preview
            </span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
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
                  className={`rounded-xl border p-4 transition-all cursor-pointer space-y-3 ${
                    isActive
                      ? "border-accent bg-carbon shadow-xl shadow-accent/5 ring-1 ring-accent/30"
                      : "border-glass-border bg-void/50 hover:border-glass-highlight hover:bg-carbon/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? "bg-accent text-void"
                            : "bg-carbon-muted text-sub border border-glass-border"
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-platinum font-mono uppercase tracking-wider">
                        Slide 0{idx + 1} &bull; {slideBadge}
                      </span>
                    </div>

                    {isActive && (
                      <span className="rounded bg-accent/20 border border-accent/40 px-2 py-0.2 text-[9px] font-mono font-bold text-accent">
                        Foco Ativo
                      </span>
                    )}
                  </div>

                  {/* Input do Título / Hook do Slide */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-sub">
                      Hook / Título do Slide
                    </label>
                    <input
                      type="text"
                      value={slide.headline}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateDraftSlide(idx, "headline", e.target.value)}
                      placeholder="Título de alto impacto..."
                      className="w-full rounded border border-glass-border bg-void/80 p-2 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none"
                    />
                  </div>

                  {/* Textarea do Texto / BodyCopy do Slide */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-sub">
                      Texto / BodyCopy do Slide
                    </label>
                    <textarea
                      rows={2}
                      value={slide.bodyText}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateDraftSlide(idx, "bodyText", e.target.value)}
                      placeholder="Texto de explicação densa..."
                      className="w-full rounded border border-glass-border bg-void/80 p-2 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none resize-y"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW VISUAL LIVE (SEM FLICKER) */}
        <div className="lg:col-span-6 space-y-4 sticky top-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-platinum flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Preview Visual Live (Renderizador SVG)</span>
            </h3>
            <span className="rounded bg-void border border-glass-border px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              Debounce 300ms Ativo
            </span>
          </div>

          {/* Moldura de Pré-visualização do Carrossel / Story */}
          <div className="relative aspect-square w-full rounded-xl border border-glass-border bg-void overflow-hidden flex items-center justify-center shadow-2xl group">
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
                <Layers className="h-8 w-8 text-sub mx-auto animate-pulse" />
                <p className="text-xs font-mono text-sub">Carregando lâmina...</p>
              </div>
            )}

            {/* Setas de Navegação Sobrepostas */}
            {totalSlides > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  title="Slide Anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-glass-border bg-carbon/80 p-2 text-platinum hover:bg-carbon hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  title="Próximo Slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-glass-border bg-carbon/80 p-2 text-platinum hover:bg-carbon hover:text-white transition-all cursor-pointer shadow-xl backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Badge de Posição da Lâmina */}
            <div className="absolute bottom-3 right-3 rounded-md bg-void/80 border border-glass-border px-2.5 py-1 text-[11px] font-mono text-platinum backdrop-blur-sm">
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
                  className={`h-11 flex-1 min-w-[50px] rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    activeEditingSlideIndex === idx
                      ? "border-accent bg-accent/20 text-platinum ring-1 ring-accent"
                      : "border-glass-border bg-void/60 text-sub hover:border-glass-highlight"
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
