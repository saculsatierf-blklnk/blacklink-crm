"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Layers,
  Megaphone,
  Share2,
  Sparkles,
} from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";
import { SlideArtRenderer } from "@/components/marketing/SlideArtRenderer";

export function CreativeAssetViewer() {
  const { activeResult, isLoading, statusMessage } = useMarketingStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // 1. Estado de Carregamento (Loading Skeleton Futurista)
  if (isLoading) {
    return (
      <div className="rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-center items-center min-h-[480px] text-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          </div>
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
            Agente n8n em Execução
          </h3>
          <p className="text-xs text-sub leading-relaxed font-mono">
            {statusMessage || "Gerando variações visuais e estruturando copies..."}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-sub/70">
          <span>IA Generativa &bull; Pipeline TLS 1.3 &bull; Renderização B2B</span>
        </div>
      </div>
    );
  }

  // 2. Estado Vazio (Tabula Rasa Standby)
  if (!activeResult) {
    return (
      <div className="rounded-xl border border-dashed border-glass-border bg-carbon/50 p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-center items-center min-h-[480px] text-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-carbon-muted border border-glass-border text-sub">
          <Layers className="h-6 w-6 text-platinum" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
            Painel de Ativos & Criativos em Standby
          </h3>
          <p className="text-xs text-sub leading-relaxed">
            Preencha os parâmetros de campanha à esquerda e acione o gerador autônomo. Os carrosséis, stories, ganchos persuasivos e copies completos aparecerão aqui em tempo real.
          </p>
        </div>
        <div className="rounded-md border border-glass-border bg-void/50 px-3 py-1.5 text-[11px] font-mono text-sub">
          Pronto para renderizar Carrosséis, Stories e Dossiês
        </div>
      </div>
    );
  }

  // 3. Estado com Criativos Gerados
  const slides = activeResult.slides || [];
  const hasSlides = slides.length > 0;
  const currentSlide = hasSlides ? slides[currentSlideIndex] : null;

  return (
    <div className="rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Topo do Viewer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-glass-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 items-center rounded bg-accent/15 px-2 font-mono text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/25">
            {activeResult.format === "carousel"
              ? "Carrossel B2B"
              : activeResult.format === "story"
              ? "Sequência de Stories"
              : "Post Único"}
          </span>
          <span className="text-xs font-mono text-sub">
            &bull; Origem: <span className="text-platinum font-semibold">{activeResult.source.toUpperCase()}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              handleCopy(
                `TÍTULO: ${activeResult.hookHeadline}\n\nCOPY:\n${activeResult.bodyCopy}\n\nCTA: ${activeResult.ctaText}\n\nHASHTAGS:\n${activeResult.hashtags.join(" ")}`,
                "all"
              )
            }
            className="flex h-8 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-2.5 text-xs text-sub hover:text-platinum transition-colors cursor-pointer font-mono"
            title="Copiar Toda a Estratégia"
          >
            {copiedSection === "all" ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Tudo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Interno: Preview Visual do Slide e Estrutura de Copywriting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Coluna Esquerda: Preview Visual (Estilo Carrossel Apple Dark) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-platinum">
              Preview do Ativo
            </span>
            {hasSlides && (
              <span className="text-[11px] font-mono text-sub">
                Slide {currentSlideIndex + 1} de {slides.length}
              </span>
            )}
          </div>

          {/* Card Visual do Slide com Motor Dark Industrial */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
            <SlideArtRenderer
              headline={currentSlide?.headline || activeResult.hookHeadline}
              bodyText={currentSlide?.bodyText || activeResult.bodyCopy.slice(0, 140) + "..."}
              slideNumber={currentSlideIndex + 1}
              totalSlides={slides.length || 1}
              format={activeResult.format}
            />
          </div>

          {/* Controles de Navegação do Carrossel */}
          {hasSlides && slides.length > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="flex h-8 items-center gap-1 rounded-md border border-glass-border bg-carbon px-3 text-xs text-sub hover:text-platinum transition-colors disabled:opacity-30 cursor-pointer font-mono"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentSlideIndex
                        ? "w-4 bg-accent"
                        : "w-1.5 bg-carbon-muted hover:bg-sub"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="flex h-8 items-center gap-1 rounded-md border border-glass-border bg-carbon px-3 text-xs text-sub hover:text-platinum transition-colors disabled:opacity-30 cursor-pointer font-mono"
              >
                <span>Próximo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Coluna Direita: Copywriting Estruturado & Hashtags */}
        <div className="space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-platinum block">
            Copywriting & Textos da Publicação
          </span>

          {/* Bloco 1: Gancho (Headline) */}
          <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                Gancho (Hook de Retenção)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeResult.hookHeadline, "hook")}
                className="text-[11px] font-mono text-sub hover:text-platinum flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "hook" ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copiar</span>
              </button>
            </div>
            <p className="text-xs font-bold text-platinum">
              {activeResult.hookHeadline}
            </p>
          </div>

          {/* Bloco 2: Corpo da Copy */}
          <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
                Texto Principal (Legenda do Post)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeResult.bodyCopy, "body")}
                className="text-[11px] font-mono text-sub hover:text-platinum flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "body" ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copiar</span>
              </button>
            </div>
            <p className="text-xs text-sub leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-1">
              {activeResult.bodyCopy}
            </p>
          </div>

          {/* Bloco 3: Chamada para Ação (CTA) */}
          <div className="rounded-lg border border-glass-border bg-void/60 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                Chamada para Ação (CTA)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeResult.ctaText, "cta")}
                className="text-[11px] font-mono text-sub hover:text-platinum flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === "cta" ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copiar</span>
              </button>
            </div>
            <p className="text-xs text-platinum font-medium">
              {activeResult.ctaText}
            </p>
          </div>

          {/* Bloco 4: Hashtags Recomendadas */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sub block">
              Hashtags Otimizadas para Alcance
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeResult.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded bg-carbon-muted border border-glass-border px-2 py-0.5 text-[11px] font-mono text-sub"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
