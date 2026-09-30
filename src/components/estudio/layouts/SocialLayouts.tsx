import React from "react";
import { LayoutProps } from "./layoutTypes";

// 10. Tweet Social Thread
export function TweetLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  textMutedClass,
  borderClass,
  cardBgClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div
      className={`flex flex-col justify-between p-6 md:p-7 rounded-2xl border shadow-xl backdrop-blur-md ${cardBgClass} ${borderClass}`}
    >
      {/* Cabeçalho do Post Social */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {config.authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.authorAvatar}
              alt={config.authorName}
              className={`w-12 h-12 rounded-full object-cover border ${borderClass}`}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base"
              style={{
                backgroundColor: config.accentColor,
                color: isLight ? "#09090b" : "#ffffff",
              }}
            >
              {config.authorName.charAt(0) || "B"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-sm tracking-tight ${textPrimaryClass}`}>
                {config.authorName}
              </span>
              <svg
                className="w-4 h-4 fill-current"
                style={{ color: config.accentColor }}
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className={`text-xs font-mono ${textMutedClass}`}>
              {config.authorHandle} · 1h
            </span>
          </div>
        </div>
        <span className={`text-xs font-mono font-bold ${textMutedClass}`}>
          𝕏
        </span>
      </div>

      {/* Conteúdo do Tweet */}
      <div className="space-y-3 mb-6 text-left">
        <h2
          className={`font-bold tracking-tight leading-snug ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.25rem, calc(1.5rem * ${scale}), 2.2rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h2>
        <p
          className={`font-normal leading-relaxed whitespace-pre-line ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(0.9rem, calc(1.05rem * ${scale}), 1.4rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </div>

      {/* Métricas Simuladas de Engajamento */}
      <div
        className={`flex items-center justify-between pt-4 border-t font-mono text-xs ${borderClass} ${textMutedClass}`}
      >
        <div className="flex items-center gap-1.5">
          <span>💬</span>
          <span>42</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🔁</span>
          <span>128</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: config.accentColor }}>❤️</span>
          <span>1.4K</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🔖</span>
          <span>350</span>
        </div>
      </div>
    </div>
  );
}

// 11. Split 50/50 (Texto + Métrica de Impacto)
export function SplitLayout({
  slide,
  config,
  scale,
  textPrimaryClass,
  textSecondaryClass,
  textMutedClass,
  borderClass,
  cardBgClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full items-center">
      {/* Lado Esquerdo: Conteúdo Escrito */}
      <div className="md:col-span-7 flex flex-col justify-center gap-3 text-left">
        <span
          className="text-xs font-mono font-bold tracking-widest uppercase"
          style={{ color: config.accentColor }}
        >
          {slide.tag || "DESTAQUE B2B"}
        </span>
        <h1
          className={`font-black tracking-tight leading-tight ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.4rem, calc(1.85rem * ${scale}), 2.9rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>
        <p
          className={`font-normal leading-relaxed ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(0.85rem, calc(1rem * ${scale}), 1.35rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </div>

      {/* Lado Direito: Card Visual ou Gráfico */}
      <div className="md:col-span-5 h-full flex items-center justify-center">
        <div
          className={`w-full h-full min-h-[160px] p-5 rounded-2xl border flex flex-col justify-between shadow-lg relative overflow-hidden ${cardBgClass} ${borderClass}`}
        >
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none"
            style={{ backgroundColor: `${config.accentColor}30` }}
          />
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase ${textMutedClass}`}>
              MÉTRICA DE IMPACTO
            </span>
            <div
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: config.accentColor }}
            />
          </div>
          <div className="my-auto py-2">
            <span
              className="text-3xl md:text-4xl font-black font-mono tracking-tight"
              style={{ color: config.accentColor }}
            >
              +340%
            </span>
            <p className={`text-xs font-semibold mt-1 ${textPrimaryClass}`}>
              Retenção de Audiência B2B
            </p>
          </div>
          <span className={`text-[10px] font-mono ${textMutedClass}`}>
            Black Link Analytics
          </span>
        </div>
      </div>
    </div>
  );
}

// 12. Podcast Quote (Citação de Impacto)
export function PodcastQuoteLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  textMutedClass,
  borderClass,
  cardBgClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl border shadow-xl backdrop-blur-md text-center overflow-hidden ${cardBgClass} ${borderClass}`}
    >
      {/* Marca d'água de aspas gigantes */}
      <span
        className="absolute -bottom-10 -right-4 text-[13rem] md:text-[17rem] font-serif leading-none select-none pointer-events-none opacity-5"
        style={{
          color: isLight ? "#000000" : "#ffffff",
        }}
      >
        “
      </span>

      {/* Avatar centralizado no topo cortando a margem */}
      <div className="relative -mt-4 md:-mt-6 mb-4 z-10">
        {config.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.authorAvatar}
            alt={config.authorName}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 shadow-xl ring-2"
            style={{
              borderColor: config.bgColor,
              outlineColor: config.accentColor,
            }}
          />
        ) : (
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center font-black text-2xl shadow-xl border-4"
            style={{
              backgroundColor: config.accentColor,
              color: isLight ? "#09090b" : "#ffffff",
              borderColor: config.bgColor,
            }}
          >
            {config.authorName.charAt(0) || "B"}
          </div>
        )}
        <div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 text-white shadow-md text-[10px]"
          style={{
            backgroundColor: config.accentColor,
            borderColor: config.bgColor,
          }}
        >
          🎙️
        </div>
      </div>

      {/* Texto da citação em itálico */}
      <div className="relative z-10 max-w-lg mx-auto space-y-3">
        <h2
          className={`italic font-medium tracking-tight leading-snug ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.35rem, calc(1.9rem * ${scale}), 3rem)`,
          }}
        >
          “{renderHighlightedText(slide.headline, config.accentColor)}”
        </h2>

        {slide.bodyText && (
          <p
            className={`font-normal leading-relaxed text-xs md:text-sm max-w-md mx-auto ${textSecondaryClass}`}
            style={{
              fontSize: `clamp(0.85rem, calc(1rem * ${scale}), 1.35rem)`,
            }}
          >
            {renderHighlightedText(slide.bodyText, config.accentColor)}
          </p>
        )}

        {/* Assinatura do Autor */}
        <div className="pt-2">
          <p className={`font-bold text-sm tracking-tight ${textPrimaryClass}`}>
            — {config.authorName}
          </p>
          <p className={`text-xs font-mono ${textMutedClass}`}>
            {config.authorHandle}
          </p>
        </div>
      </div>
    </div>
  );
}

// 13. Testimonial / Review (Prova Social com Estrelas Douradas)
export function TestimonialReviewLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  borderClass,
  cardBgClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div
      className={`w-full h-full flex flex-col justify-center items-center text-center p-6 md:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl ${cardBgClass} ${borderClass}`}
    >
      {/* 5 Estrelas Douradas Gigantes */}
      <div className="flex items-center gap-1.5 text-amber-400 text-2xl md:text-3xl mb-4 drop-shadow">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>

      {slide.tag && (
        <span
          className="text-xs font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full mb-3"
          style={{
            backgroundColor: `${config.accentColor}20`,
            color: config.accentColor,
          }}
        >
          {slide.tag}
        </span>
      )}

      {/* Review Text */}
      <blockquote className="my-auto max-w-lg space-y-3">
        <h2
          className={`italic font-medium leading-relaxed ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.25rem, calc(1.75rem * ${scale}), 2.8rem)`,
          }}
        >
          &ldquo;{renderHighlightedText(slide.headline, config.accentColor)}&rdquo;
        </h2>

        <p
          className={`text-xs md:text-sm leading-relaxed max-w-md mx-auto ${textSecondaryClass}`}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </blockquote>

      {/* Reviewer Bio & Verified Badge */}
      <div className="flex items-center gap-3 pt-4 border-t border-current/10 mt-3">
        {config.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.authorAvatar}
            alt={config.authorName}
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: config.accentColor, color: isLight ? "#000" : "#fff" }}
          >
            {config.authorName.charAt(0) || "B"}
          </div>
        )}
        <div className="text-left leading-tight">
          <div className="flex items-center gap-1">
            <span className={`font-bold text-xs ${textPrimaryClass}`}>{config.authorName}</span>
            <span className="text-emerald-400 text-[11px]">✓</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Cliente Corporativo Verificado</span>
        </div>
      </div>
    </div>
  );
}

// 14. Polaroid / Retro B2B (Moldura Estilo Polaroid Flutuante)
export function PolaroidRetroLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-3 md:p-6">
      <div className="w-full max-w-md bg-white text-zinc-950 p-6 md:p-7 rounded-sm shadow-2xl border border-zinc-300 transform -rotate-1 hover:rotate-0 transition-transform duration-300 text-left">
        {/* Photo Box Area */}
        <div className="w-full aspect-[4/3] bg-zinc-900 rounded-sm p-4 flex flex-col justify-between mb-5 relative overflow-hidden text-white shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>BLACK LINK POLAROID</span>
            <span>EXP. 2026</span>
          </div>
          <h2
            className="font-black tracking-tight leading-snug my-auto"
            style={{
              fontSize: `clamp(1.2rem, calc(1.6rem * ${scale}), 2.4rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h2>
          <span className="text-[9px] font-mono text-zinc-500">
            {slide.tag || "SNAPSHOT EXECUTIVO"}
          </span>
        </div>

        {/* Polaroid Bottom Caption (Handwritten feel or clean font) */}
        <div className="space-y-1">
          <p
            className="font-serif italic text-zinc-800 text-xs md:text-sm leading-relaxed"
            style={{
              fontSize: `clamp(0.85rem, calc(0.95rem * ${scale}), 1.25rem)`,
            }}
          >
            {renderHighlightedText(slide.bodyText, config.accentColor)}
          </p>
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>{config.authorName}</span>
            <span>{config.authorHandle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
