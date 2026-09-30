"use client";

import React from "react";

export type SlideTheme = "dark-industrial" | "light-minimal" | "neon-accent";

export type SlideLayout =
  | "brutalista"
  | "minimal"
  | "tweet"
  | "split"
  | "terminal"
  | "glass-floating";

export type SlideFont = "space-grotesk" | "playfair" | "jakarta" | "inter";

export type AspectRatio = "1:1" | "4:5";

export type SlidePattern = "solid-mesh" | "dots" | "grid" | "noise";

export interface SlideData {
  id?: string;
  headline: string;
  bodyText: string;
  category?: string;
  tag?: string;
}

export interface SlideDesignConfig {
  theme: SlideTheme;
  layout: SlideLayout;
  font: SlideFont;
  aspectRatio: AspectRatio;
  pattern: SlidePattern;
  fontSizeScale: number; // 0.8 a 1.5 (default 1.0)
  bgColor: string;
  accentColor: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  bgImage?: string;
  bgOpacity?: number;
}

export interface BlackLinkSlidePreviewProps {
  slide: SlideData;
  currentSlide: number;
  totalSlides: number;
  config: SlideDesignConfig;
  canvasId?: string;
}

/**
 * Calculador de contraste matemático YIQ
 * Determina se a cor de fundo é clara ou escura para garantir legibilidade absoluta.
 */
export function isLightColor(colorHex: string): boolean {
  if (!colorHex || typeof colorHex !== "string") return false;
  let hex = colorHex.replace("#", "").trim();
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
}

/**
 * Parser de destaque tipográfico (**termo**) com a cor de destaque (accentColor)
 */
function renderHighlightedText(
  text: string,
  accentColor: string
) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const cleanText = part.slice(2, -2);
      return (
        <span
          key={index}
          style={{ color: accentColor }}
          className="font-black drop-shadow-sm transition-colors duration-150 inline"
        >
          {cleanText}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function BlackLinkSlidePreview({
  slide,
  currentSlide,
  totalSlides,
  config,
  canvasId = "blacklink-slide-canvas",
}: BlackLinkSlidePreviewProps) {
  const isLight = isLightColor(config.bgColor);
  const scale = config.fontSizeScale || 1.0;
  const isCta = currentSlide === totalSlides && totalSlides > 1;

  // Tokens de cor baseados estritamente na fórmula de contraste YIQ
  const textPrimary = isLight ? "#09090b" : "#ffffff";
  const textSecondary = isLight ? "#27272a" : "#d4d4d8";
  const textMuted = isLight ? "#71717a" : "#a1a1aa";
  const borderColor = isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)";
  const cardBg = isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)";
  const glassBg = isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(10, 10, 12, 0.75)";
  const glassBorder = isLight ? "rgba(0, 0, 0, 0.10)" : "rgba(255, 255, 255, 0.14)";
  const progressInactive = isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.20)";

  // Mapeamento de classes de fonte do Next.js
  const fontClass =
    config.font === "space-grotesk"
      ? "font-space-grotesk"
      : config.font === "playfair"
      ? "font-playfair"
      : config.font === "jakarta"
      ? "font-jakarta"
      : "font-inter";

  // Estilização de Textura de Fundo (Pattern Engine)
  const renderPatternStyle = (): React.CSSProperties => {
    switch (config.pattern) {
      case "dots": {
        const dotColor = isLight ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.22)";
        return {
          backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
          backgroundSize: "24px 24px",
        };
      }
      case "grid": {
        const gridColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.09)";
        return {
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        };
      }
      case "noise": {
        const noiseOpacity = isLight ? "0.08" : "0.06";
        const svgNoise = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${noiseOpacity}'/%3E%3C/svg%3E`;
        return {
          backgroundImage: `url("${svgNoise}")`,
          backgroundRepeat: "repeat",
        };
      }
      case "solid-mesh":
      default: {
        return {
          backgroundImage: `radial-gradient(circle at 85% 15%, ${config.accentColor}25 0%, transparent 50%), radial-gradient(circle at 15% 85%, ${config.accentColor}18 0%, transparent 60%)`,
        };
      }
    }
  };

  return (
    <div
      id={canvasId}
      data-slide-index={currentSlide}
      className={`relative w-full overflow-hidden select-none transition-all duration-300 shadow-2xl flex flex-col justify-between ${fontClass} ${
        config.aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-square"
      }`}
      style={{
        backgroundColor: config.bgColor,
        color: textPrimary,
      }}
    >
      {/* Camada de Imagem de Fundo (se configurada) */}
      {config.bgImage && (
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center z-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${config.bgImage})`,
            opacity: typeof config.bgOpacity === "number" ? config.bgOpacity / 100 : 0.25,
          }}
        />
      )}

      {/* Camada de Textura Paramétrica (CSS Pattern Engine) */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={renderPatternStyle()}
      />

      {/* ==================================================================== */}
      {/* CABEÇALHO DO SLIDE: Barra de Progresso + Identificação do Autor     */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-6 md:p-8 pb-2 flex flex-col gap-3">
        {/* Barra de Progresso Segmentada */}
        <div className="flex items-center gap-1.5 w-full">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            const isActive = idx + 1 <= currentSlide;
            return (
              <div
                key={idx}
                className="h-1.5 rounded-full flex-1 transition-all duration-300"
                style={{
                  backgroundColor: isActive ? config.accentColor : progressInactive,
                  boxShadow: isActive ? `0 0 8px ${config.accentColor}60` : "none",
                }}
              />
            );
          })}
        </div>

        {/* Linha de Identificação: Miniatura do Autor + Marca Oficial Black Link */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            {config.authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.authorAvatar}
                alt={config.authorName}
                className="w-7 h-7 rounded-full object-cover border"
                style={{ borderColor }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: config.accentColor,
                  color: isLightColor(config.accentColor) ? "#000000" : "#ffffff",
                }}
              >
                {config.authorName.charAt(0) || "B"}
              </div>
            )}
            <div className="flex flex-col text-left leading-none">
              <span
                className="text-xs font-bold tracking-tight truncate max-w-[140px]"
                style={{ color: textPrimary }}
              >
                {config.authorName}
              </span>
              <span
                className="text-[10px] font-mono tracking-tight"
                style={{ color: textMuted }}
              >
                {config.authorHandle}
              </span>
            </div>
          </div>

          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5"
            style={{
              backgroundColor: cardBg,
              borderColor,
              color: textMuted,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: config.accentColor }}
            />
            BLACK LINK
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CORPO DO SLIDE: Layout Selecionado OU Slide de CTA (Lâmina Final)    */}
      {/* ==================================================================== */}
      <div className="relative z-10 px-6 md:px-8 py-4 flex-1 flex flex-col justify-center">
        {isCta ? (
          /* ================================================================ */
          /* LAYOUT EXCLUSIVO DE CTA (LÂMINA FINAL - CONVERSÃO B2B)            */
          /* ================================================================ */
          <div className="flex flex-col items-center text-center justify-center h-full gap-4 max-w-lg mx-auto py-2">
            {/* Foto Grande do Autor com Anel de Destaque */}
            <div className="relative">
              {config.authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.authorAvatar}
                  alt={config.authorName}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover shadow-2xl border-4"
                  style={{
                    borderColor: config.accentColor,
                    boxShadow: `0 10px 30px ${config.accentColor}35`,
                  }}
                />
              ) : (
                <div
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center font-black text-3xl shadow-2xl border-4"
                  style={{
                    backgroundColor: config.accentColor,
                    color: isLightColor(config.accentColor) ? "#000000" : "#ffffff",
                    borderColor: config.accentColor,
                  }}
                >
                  {config.authorName.charAt(0) || "B"}
                </div>
              )}

              {/* Selo Verificado B2B */}
              <div
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2"
                style={{
                  backgroundColor: config.accentColor,
                  borderColor: config.bgColor,
                  color: isLightColor(config.accentColor) ? "#000000" : "#ffffff",
                }}
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Headline de Ação */}
            <div className="space-y-2">
              <h2
                className="font-black tracking-tight leading-tight"
                style={{
                  fontSize: `clamp(1.5rem, calc(2.1rem * ${scale}), 3.2rem)`,
                  color: textPrimary,
                }}
              >
                {renderHighlightedText(
                  slide.headline || "Gostou deste conteúdo?",
                  config.accentColor
                )}
              </h2>
              <p
                className="font-normal leading-relaxed max-w-md mx-auto"
                style={{
                  fontSize: `clamp(0.9rem, calc(1.05rem * ${scale}), 1.4rem)`,
                  color: textSecondary,
                }}
              >
                {renderHighlightedText(
                  slide.bodyText ||
                    "Salve para consultar mais tarde e compartilhe este insight com líderes da sua rede.",
                  config.accentColor
                )}
              </p>
            </div>

            {/* Barra de Engajamento Social Simulada (Salvar, Curtir, Comentar) */}
            <div
              className="flex items-center justify-center gap-6 px-6 py-3 rounded-2xl border shadow-lg backdrop-blur-md mt-1"
              style={{
                backgroundColor: cardBg,
                borderColor,
              }}
            >
              <div className="flex items-center gap-1.5" style={{ color: textSecondary }}>
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-xs font-bold font-mono">Gostei</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: textSecondary }}>
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs font-bold font-mono">Comentar</span>
              </div>
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl"
                style={{
                  backgroundColor: `${config.accentColor}25`,
                  color: config.accentColor,
                }}
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs font-black font-mono">Salvar</span>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* RENDERIZADOR DOS 6 LAYOUTS PARAMÉTRICOS FIGMA-LIKE                */
          /* ================================================================ */
          <>
            {/* 1. LAYOUT BRUTALISTA TECH */}
            {config.layout === "brutalista" && (
              <div className="flex flex-col justify-center h-full gap-4 text-left">
                {slide.tag && (
                  <span
                    className="w-fit px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${config.accentColor}22`,
                      color: config.accentColor,
                    }}
                  >
                    {slide.tag}
                  </span>
                )}
                <h1
                  className="font-black uppercase tracking-tight leading-[1.08]"
                  style={{
                    fontSize: `clamp(1.75rem, calc(2.35rem * ${scale}), 3.8rem)`,
                    color: textPrimary,
                  }}
                >
                  {renderHighlightedText(slide.headline, config.accentColor)}
                </h1>
                <div
                  className="h-1.5 w-16 rounded-full"
                  style={{ backgroundColor: config.accentColor }}
                />
                <p
                  className="font-normal leading-relaxed max-w-xl"
                  style={{
                    fontSize: `clamp(0.95rem, calc(1.15rem * ${scale}), 1.6rem)`,
                    color: textSecondary,
                  }}
                >
                  {renderHighlightedText(slide.bodyText, config.accentColor)}
                </p>
              </div>
            )}

            {/* 2. LAYOUT MINIMAL EDITORIAL */}
            {config.layout === "minimal" && (
              <div className="flex flex-col justify-center items-center h-full gap-5 text-center max-w-lg mx-auto">
                <div
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: config.accentColor }}
                />
                <h1
                  className="font-bold tracking-tight leading-snug"
                  style={{
                    fontSize: `clamp(1.6rem, calc(2.2rem * ${scale}), 3.5rem)`,
                    color: textPrimary,
                  }}
                >
                  {renderHighlightedText(slide.headline, config.accentColor)}
                </h1>
                <p
                  className="font-normal leading-relaxed max-w-md"
                  style={{
                    fontSize: `clamp(0.95rem, calc(1.1rem * ${scale}), 1.5rem)`,
                    color: textSecondary,
                  }}
                >
                  {renderHighlightedText(slide.bodyText, config.accentColor)}
                </p>
              </div>
            )}

            {/* 3. LAYOUT TWEET / SOCIAL THREAD */}
            {config.layout === "tweet" && (
              <div
                className="flex flex-col justify-between p-6 md:p-7 rounded-2xl border shadow-xl backdrop-blur-md"
                style={{
                  backgroundColor: cardBg,
                  borderColor,
                }}
              >
                {/* Cabeçalho do Post Social */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {config.authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={config.authorAvatar}
                        alt={config.authorName}
                        className="w-12 h-12 rounded-full object-cover border"
                        style={{ borderColor }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base"
                        style={{
                          backgroundColor: config.accentColor,
                          color: isLightColor(config.accentColor) ? "#000000" : "#ffffff",
                        }}
                      >
                        {config.authorName.charAt(0) || "B"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold text-sm tracking-tight"
                          style={{ color: textPrimary }}
                        >
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
                      <span className="text-xs font-mono" style={{ color: textMuted }}>
                        {config.authorHandle} · 1h
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: textMuted }}>
                    𝕏
                  </span>
                </div>

                {/* Conteúdo do Tweet */}
                <div className="space-y-3 mb-6 text-left">
                  <h2
                    className="font-bold tracking-tight leading-snug"
                    style={{
                      fontSize: `clamp(1.25rem, calc(1.5rem * ${scale}), 2.2rem)`,
                      color: textPrimary,
                    }}
                  >
                    {renderHighlightedText(slide.headline, config.accentColor)}
                  </h2>
                  <p
                    className="font-normal leading-relaxed whitespace-pre-line"
                    style={{
                      fontSize: `clamp(0.9rem, calc(1.05rem * ${scale}), 1.4rem)`,
                      color: textSecondary,
                    }}
                  >
                    {renderHighlightedText(slide.bodyText, config.accentColor)}
                  </p>
                </div>

                {/* Métricas Simuladas de Engajamento */}
                <div
                  className="flex items-center justify-between pt-4 border-t font-mono text-xs"
                  style={{
                    borderColor,
                    color: textMuted,
                  }}
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
            )}

            {/* 4. LAYOUT SPLIT 50/50 */}
            {config.layout === "split" && (
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
                    className="font-black tracking-tight leading-tight"
                    style={{
                      fontSize: `clamp(1.4rem, calc(1.85rem * ${scale}), 2.9rem)`,
                      color: textPrimary,
                    }}
                  >
                    {renderHighlightedText(slide.headline, config.accentColor)}
                  </h1>
                  <p
                    className="font-normal leading-relaxed"
                    style={{
                      fontSize: `clamp(0.85rem, calc(1rem * ${scale}), 1.35rem)`,
                      color: textSecondary,
                    }}
                  >
                    {renderHighlightedText(slide.bodyText, config.accentColor)}
                  </p>
                </div>

                {/* Lado Direito: Card Visual ou Gráfico */}
                <div className="md:col-span-5 h-full flex items-center justify-center">
                  <div
                    className="w-full h-full min-h-[160px] p-5 rounded-2xl border flex flex-col justify-between shadow-lg relative overflow-hidden"
                    style={{
                      backgroundColor: cardBg,
                      borderColor,
                    }}
                  >
                    <div
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                      style={{ backgroundColor: `${config.accentColor}30` }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase" style={{ color: textMuted }}>
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
                      <p className="text-xs font-semibold mt-1" style={{ color: textPrimary }}>
                        Retenção de Audiência B2B
                      </p>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: textMuted }}>
                      Black Link Analytics
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. LAYOUT TERMINAL INDUSTRIAL */}
            {config.layout === "terminal" && (
              <div
                className="w-full rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-md text-left"
                style={{
                  backgroundColor: isLight ? "#ffffff" : "#0d0e12",
                  borderColor,
                }}
              >
                {/* Barra Superior do macOS Terminal */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b"
                  style={{
                    backgroundColor: isLight ? "#f4f4f5" : "#16171d",
                    borderColor,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span
                    className="text-[11px] font-mono font-medium tracking-tight"
                    style={{ color: textMuted }}
                  >
                    bash ~ blacklink-b2b
                  </span>
                  <div className="w-12" />
                </div>

                {/* Conteúdo do Terminal */}
                <div className="p-6 font-mono space-y-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span style={{ color: config.accentColor }}>❯</span>
                    <span style={{ color: textMuted }}>exec blacklink-insight --strict</span>
                  </div>

                  <h2
                    className="font-bold tracking-tight leading-snug"
                    style={{
                      fontSize: `clamp(1.3rem, calc(1.75rem * ${scale}), 2.6rem)`,
                      color: textPrimary,
                    }}
                  >
                    {renderHighlightedText(slide.headline, config.accentColor)}
                  </h2>

                  <div
                    className="p-3.5 rounded-lg border-l-2 space-y-2"
                    style={{
                      backgroundColor: cardBg,
                      borderLeftColor: config.accentColor,
                    }}
                  >
                    <p
                      className="font-normal leading-relaxed text-xs md:text-sm"
                      style={{ color: textSecondary }}
                    >
                      {renderHighlightedText(slide.bodyText, config.accentColor)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs" style={{ color: config.accentColor }}>
                    <span>[STATUS: 200 OK]</span>
                    <span className="w-2 h-4 bg-current animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* 6. LAYOUT GLASS-FLOATING 3D */}
            {config.layout === "glass-floating" && (
              <div className="flex items-center justify-center h-full p-2">
                <div
                  className="w-full max-w-xl p-8 rounded-3xl border shadow-2xl backdrop-blur-2xl text-left relative overflow-hidden"
                  style={{
                    backgroundColor: glassBg,
                    borderColor: glassBorder,
                    boxShadow: isLight
                      ? "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                      : "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                  }}
                >
                  <div
                    className="absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                    style={{ backgroundColor: `${config.accentColor}30` }}
                  />
                  <div className="relative z-10 space-y-4">
                    {slide.tag && (
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${config.accentColor}25`,
                          color: config.accentColor,
                        }}
                      >
                        {slide.tag}
                      </span>
                    )}
                    <h1
                      className="font-extrabold tracking-tight leading-tight"
                      style={{
                        fontSize: `clamp(1.45rem, calc(2rem * ${scale}), 3.2rem)`,
                        color: textPrimary,
                      }}
                    >
                      {renderHighlightedText(slide.headline, config.accentColor)}
                    </h1>
                    <p
                      className="font-normal leading-relaxed"
                      style={{
                        fontSize: `clamp(0.95rem, calc(1.1rem * ${scale}), 1.5rem)`,
                        color: textSecondary,
                      }}
                    >
                      {renderHighlightedText(slide.bodyText, config.accentColor)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================================================================== */}
      {/* RODAPÉ DO SLIDE: Numeração / Posição + Pista Visual de Deslize      */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-6 md:p-8 pt-2 flex items-center justify-between">
        <div
          className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full border"
          style={{
            backgroundColor: cardBg,
            borderColor,
            color: textMuted,
          }}
        >
          {isCta ? "CTA FINAL" : `${String(currentSlide).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`}
        </div>

        <div
          className="flex items-center gap-1.5 text-xs font-semibold tracking-tight transition-transform duration-200"
          style={{ color: isCta ? config.accentColor : textSecondary }}
        >
          <span>{isCta ? "Siga para mais" : "Arraste"}</span>
          <svg
            className="w-4 h-4 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
