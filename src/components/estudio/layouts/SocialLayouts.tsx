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
      className={`w-full h-full flex-grow flex flex-col justify-between p-10 rounded-3xl border shadow-xl backdrop-blur-md ${cardBgClass} ${borderClass}`}
    >
      {/* Cabeçalho do Post Social */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {config.authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.authorAvatar}
              alt={config.authorName}
              className={`w-16 h-16 rounded-full object-cover border-2 ${borderClass}`}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
              style={{
                backgroundColor: config.accentColor,
                color: isLight ? "#09090b" : "#ffffff",
              }}
            >
              {config.authorName.charAt(0) || "B"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg tracking-tight ${textPrimaryClass}`}>
                {config.authorName}
              </span>
              <svg
                className="w-5 h-5 fill-current"
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
            <span className={`text-sm font-mono ${textMutedClass}`}>
              {config.authorHandle} · 1h
            </span>
          </div>
        </div>
        <span className={`text-base font-mono font-bold ${textMutedClass}`}>
          𝕏
        </span>
      </div>

      {/* Conteúdo do Tweet */}
      <div className="space-y-4 mb-8 text-left my-auto">
        <h2
          className={`font-bold tracking-tight leading-snug ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.8rem, calc(2.3rem * ${scale}), 3.8rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h2>
        <p
          className={`font-normal leading-relaxed whitespace-pre-line ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(1.1rem, calc(1.35rem * ${scale}), 2rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </div>

      {/* Métricas Simuladas de Engajamento */}
      <div
        className={`flex items-center justify-between pt-6 border-t font-mono text-sm ${borderClass} ${textMutedClass}`}
      >
        <div className="flex items-center gap-2">
          <span>💬</span>
          <span>42</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🔁</span>
          <span>128</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: config.accentColor }}>❤️</span>
          <span>1.4K</span>
        </div>
        <div className="flex items-center gap-2">
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
  const is916 = config.aspectRatio === "9:16";

  return (
    <div
      className={
        is916
          ? "w-full h-full flex-grow flex flex-col justify-around gap-8 py-4"
          : "w-full h-full flex-grow grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
      }
    >
      {/* Lado Esquerdo / Superior: Conteúdo Escrito */}
      <div className={`${is916 ? "w-full" : "md:col-span-7"} flex flex-col justify-center gap-4 text-left`}>
        <span
          className="text-sm font-mono font-bold tracking-widest uppercase"
          style={{ color: config.accentColor }}
        >
          {slide.tag || "DESTAQUE B2B"}
        </span>
        <h1
          className={`font-black tracking-tight leading-tight ${textPrimaryClass}`}
          style={{
            fontSize: is916
              ? `clamp(2rem, calc(2.75rem * ${scale}), 4.5rem)`
              : `clamp(1.8rem, calc(2.5rem * ${scale}), 4rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>
        <p
          className={`font-normal leading-relaxed ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(1.05rem, calc(1.3rem * ${scale}), 1.9rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </div>

      {/* Lado Direito / Inferior: Card Visual ou Gráfico */}
      <div className={`${is916 ? "w-full" : "md:col-span-5 h-full"} flex items-center justify-center`}>
        <div
          className={`w-full h-full min-h-[220px] p-8 rounded-3xl border flex flex-col justify-between shadow-lg relative overflow-hidden ${cardBgClass} ${borderClass}`}
        >
          <div
            className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl pointer-events-none"
            style={{ backgroundColor: `${config.accentColor}30` }}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono uppercase ${textMutedClass}`}>
              MÉTRICA DE IMPACTO
            </span>
            <div
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: config.accentColor }}
            />
          </div>
          <div className="my-auto py-4">
            <span
              className="text-5xl font-black font-mono tracking-tight"
              style={{ color: config.accentColor }}
            >
              +340%
            </span>
            <p className={`text-sm font-semibold mt-2 ${textPrimaryClass}`}>
              Retenção de Audiência B2B
            </p>
          </div>
          <span className={`text-xs font-mono ${textMutedClass}`}>
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
      className={`relative w-full h-full flex-grow flex flex-col items-center justify-center p-10 rounded-3xl border shadow-xl backdrop-blur-md text-center overflow-hidden ${cardBgClass} ${borderClass}`}
    >
      {/* Marca d'água de aspas gigantes */}
      <span
        className="absolute -bottom-16 -right-6 text-[18rem] md:text-[22rem] font-serif leading-none select-none pointer-events-none opacity-5"
        style={{
          color: isLight ? "#000000" : "#ffffff",
        }}
      >
        “
      </span>

      {/* Avatar centralizado no topo */}
      <div className="relative mb-6 z-10">
        {config.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.authorAvatar}
            alt={config.authorName}
            className="w-24 h-24 rounded-full object-cover border-4 shadow-xl ring-2"
            style={{
              borderColor: config.bgColor,
              outlineColor: config.accentColor,
            }}
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center font-black text-3xl shadow-xl border-4"
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
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 text-white shadow-md text-xs"
          style={{
            backgroundColor: config.accentColor,
            borderColor: config.bgColor,
          }}
        >
          🎙️
        </div>
      </div>

      {/* Texto da citação em itálico */}
      <div className="relative z-10 max-w-xl mx-auto space-y-4">
        <h2
          className={`italic font-medium tracking-tight leading-snug ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.8rem, calc(2.5rem * ${scale}), 4.2rem)`,
          }}
        >
          “{renderHighlightedText(slide.headline, config.accentColor)}”
        </h2>

        {slide.bodyText && (
          <p
            className={`font-normal leading-relaxed text-sm md:text-base max-w-lg mx-auto ${textSecondaryClass}`}
            style={{
              fontSize: `clamp(1.05rem, calc(1.3rem * ${scale}), 2rem)`,
            }}
          >
            {renderHighlightedText(slide.bodyText, config.accentColor)}
          </p>
        )}

        {/* Assinatura do Autor */}
        <div className="pt-4">
          <p className={`font-bold text-base tracking-tight ${textPrimaryClass}`}>
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
      className={`w-full h-full flex-grow flex flex-col justify-center items-center text-center p-10 rounded-3xl border shadow-2xl backdrop-blur-xl ${cardBgClass} ${borderClass}`}
    >
      {/* 5 Estrelas Douradas Gigantes */}
      <div className="flex items-center gap-2 text-amber-400 text-3xl md:text-4xl mb-6 drop-shadow">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>

      {slide.tag && (
        <span
          className="text-xs font-mono uppercase tracking-widest font-bold px-4 py-1.5 rounded-full mb-4"
          style={{
            backgroundColor: `${config.accentColor}20`,
            color: config.accentColor,
          }}
        >
          {slide.tag}
        </span>
      )}

      {/* Review Text */}
      <blockquote className="my-auto max-w-2xl space-y-4">
        <h2
          className={`italic font-medium leading-relaxed ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.8rem, calc(2.4rem * ${scale}), 4rem)`,
          }}
        >
          &ldquo;{renderHighlightedText(slide.headline, config.accentColor)}&rdquo;
        </h2>

        <p
          className={`text-sm md:text-base leading-relaxed max-w-xl mx-auto ${textSecondaryClass}`}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </blockquote>

      {/* Reviewer Bio & Verified Badge */}
      <div className="flex items-center gap-4 pt-6 border-t border-current/10 mt-4">
        {config.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.authorAvatar}
            alt={config.authorName}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-base"
            style={{ backgroundColor: config.accentColor, color: isLight ? "#000" : "#fff" }}
          >
            {config.authorName.charAt(0) || "B"}
          </div>
        )}
        <div className="text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold text-sm ${textPrimaryClass}`}>{config.authorName}</span>
            <span className="text-emerald-400 text-xs">✓</span>
          </div>
          <span className="text-xs font-mono text-zinc-400">Cliente Corporativo Verificado</span>
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
    <div className="w-full h-full flex-grow flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white text-zinc-950 p-8 md:p-10 rounded-sm shadow-2xl border border-zinc-300 transform -rotate-1 hover:rotate-0 transition-transform duration-300 text-left">
        {/* Photo Box Area */}
        <div className="w-full aspect-[4/3] bg-zinc-900 rounded-sm p-6 flex flex-col justify-between mb-6 relative overflow-hidden text-white shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>BLACK LINK POLAROID</span>
            <span>EXP. 2026</span>
          </div>
          <h2
            className="font-black tracking-tight leading-snug my-auto"
            style={{
              fontSize: `clamp(1.6rem, calc(2.2rem * ${scale}), 3.5rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            {slide.tag || "SNAPSHOT EXECUTIVO"}
          </span>
        </div>

        {/* Polaroid Bottom Caption */}
        <div className="space-y-2">
          <p
            className="font-serif italic text-zinc-800 text-sm md:text-base leading-relaxed"
            style={{
              fontSize: `clamp(1rem, calc(1.2rem * ${scale}), 1.8rem)`,
            }}
          >
            {renderHighlightedText(slide.bodyText, config.accentColor)}
          </p>
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>{config.authorName}</span>
            <span>{config.authorHandle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
