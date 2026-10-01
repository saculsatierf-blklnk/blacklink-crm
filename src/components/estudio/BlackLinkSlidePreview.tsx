"use client";

import React from "react";
import {
  SlideData,
  SlideDesignConfig,
  SlideTheme,
  SlideLayout,
  SlideFont,
  AspectRatio,
  SlidePattern,
  LAYOUT_REGISTRY,
  CtaLayout,
  LayoutProps,
} from "./layouts";

export type {
  SlideTheme,
  SlideLayout,
  SlideFont,
  AspectRatio,
  SlidePattern,
  SlideData,
  SlideDesignConfig,
};

export interface BlackLinkSlidePreviewProps {
  slide: SlideData;
  currentSlide: number;
  totalSlides: number;
  config: SlideDesignConfig;
  canvasId?: string;
}

/**
 * Calculador de contraste matemático YIQ
 * Calcula se a cor de fundo é clara ou escura para alternar o texto entre text-zinc-900 e text-white.
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
 * Parser de destaque tipográfico (**termo**) aplicando a cor de destaque (accentColor)
 */
export function renderHighlightedText(text: string, accentColor: string) {
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

// Mapeamento das 20 Famílias Tipográficas
const FONT_CLASS_MAP: Record<SlideFont, string> = {
  // Tech / Código
  "space-grotesk": "font-space-grotesk",
  "fira-code": "font-fira-code",
  "jetbrains-mono": "font-jetbrains-mono",
  "ibm-plex-mono": "font-ibm-plex-mono",
  "roboto-mono": "font-roboto-mono",

  // SaaS / Modernas
  jakarta: "font-jakarta",
  inter: "font-inter",
  syne: "font-syne",
  "dm-sans": "font-dm-sans",
  montserrat: "font-montserrat",
  poppins: "font-poppins",
  outfit: "font-outfit",
  "bebas-neue": "font-bebas-neue",
  oswald: "font-oswald",
  bricolage: "font-bricolage",

  // Editorial / Luxo
  playfair: "font-playfair",
  merriweather: "font-merriweather",
  lora: "font-lora",
  "eb-garamond": "font-eb-garamond",
  cinzel: "font-cinzel",
  "crimson-pro": "font-crimson-pro",
};

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

  // Classes de texto e contraste obrigatórias
  const textPrimaryClass = isLight ? "text-zinc-900" : "text-white";
  const textSecondaryClass = isLight ? "text-zinc-700" : "text-zinc-300";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const borderClass = isLight ? "border-black/10" : "border-white/10";
  const cardBgClass = isLight ? "bg-black/5" : "bg-white/5";

  // Mapeamento tipográfico de fontes do Next.js
  const fontClass = FONT_CLASS_MAP[config.font] || "font-space-grotesk";

  // Obter componente modular de layout registrado
  const LayoutComponent = LAYOUT_REGISTRY[config.layout] || LAYOUT_REGISTRY["brutalista"];

  const layoutProps: LayoutProps = {
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
    currentSlide,
  };

  const isLightLayout = config.layout === "notion-doc" || config.layout === "sticky-note" || isLight;

  return (
    <div
      id={canvasId}
      data-slide-index={currentSlide}
      className={`relative w-full overflow-hidden select-none transition-all duration-300 shadow-2xl flex flex-col justify-between ${fontClass} ${textPrimaryClass} ${
        config.aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-square"
      }`}
      style={{
        backgroundColor:
          config.layout === "notion-doc"
            ? "#fafafa"
            : config.layout === "sticky-note"
            ? "#e5e7eb"
            : config.bgColor,
      }}
    >
      {/* ==================================================================== */}
      {/* 1. CAMADA DE IMAGEM DE FUNDO (SE CONFIGURADA)                       */}
      {/* ==================================================================== */}
      {config.bgImage && config.layout !== "notion-doc" && config.layout !== "sticky-note" && (
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center z-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${config.bgImage})`,
            opacity: typeof config.bgOpacity === "number" ? config.bgOpacity / 100 : 0.25,
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* 2. CAMADAS DE TEXTURA (PATTERN ENGINE CONDICIONAL CSS)               */}
      {/* ==================================================================== */}

      {/* Textura Dots (Pontilhado Dinâmico) */}
      {config.pattern === "dots" &&
        config.layout !== "notion-doc" &&
        config.layout !== "sticky-note" && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `radial-gradient(${
                isLight ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.22)"
              } 1.5px, transparent 1.5px)`,
              backgroundSize: "24px 24px",
            }}
          />
        )}

      {/* Textura Grid (Grade Técnica Industrial) */}
      {config.pattern === "grid" &&
        config.layout !== "notion-doc" &&
        config.layout !== "sticky-note" && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${
                isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.09)"
              } 1px, transparent 1px), linear-gradient(to bottom, ${
                isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.09)"
              } 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        )}

      {/* Textura Noise (Granulado Fractal Inline SVG) */}
      {config.pattern === "noise" &&
        config.layout !== "notion-doc" &&
        config.layout !== "sticky-note" && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${
                isLight ? "0.08" : "0.06"
              }'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          />
        )}

      {/* Textura Solid Mesh (Refração Radial Difusa) */}
      {config.pattern === "solid-mesh" &&
        config.layout !== "notion-doc" &&
        config.layout !== "sticky-note" && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `radial-gradient(circle at 85% 15%, ${config.accentColor}25 0%, transparent 50%), radial-gradient(circle at 15% 85%, ${config.accentColor}18 0%, transparent 60%)`,
            }}
          />
        )}

      {/* ==================================================================== */}
      {/* 3. CABEÇALHO DO SLIDE: Barra de Progresso + Identificação do Autor   */}
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
                  backgroundColor: isActive
                    ? config.accentColor
                    : isLightLayout
                    ? "rgba(0, 0, 0, 0.12)"
                    : "rgba(255, 255, 255, 0.20)",
                  boxShadow: isActive ? `0 0 8px ${config.accentColor}60` : "none",
                }}
              />
            );
          })}
        </div>

        {/* Linha de Identificação: Miniatura do Autor + Marca Oficial */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            {config.authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.authorAvatar}
                alt={config.authorName}
                className={`w-7 h-7 rounded-full object-cover border ${
                  isLightLayout ? "border-zinc-300" : borderClass
                }`}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: config.accentColor,
                  color: isLightColor(config.accentColor) ? "#09090b" : "#ffffff",
                }}
              >
                {config.authorName.charAt(0) || "B"}
              </div>
            )}
            <div className="flex flex-col text-left leading-none">
              <span
                className={`text-xs font-bold tracking-tight truncate max-w-[140px] ${
                  isLightLayout ? "text-zinc-900" : textPrimaryClass
                }`}
              >
                {config.authorName}
              </span>
              <span
                className={`text-[10px] font-mono tracking-tight ${
                  isLightLayout ? "text-zinc-500" : textMutedClass
                }`}
              >
                {config.authorHandle}
              </span>
            </div>
          </div>

          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
              isLightLayout
                ? "bg-zinc-100 border-zinc-200 text-zinc-600"
                : `${cardBgClass} ${borderClass} ${textMutedClass}`
            }`}
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
      {/* 4. CORPO DO SLIDE: Layout Dinâmico (Dicionário de 20 Modelos) ou CTA */}
      {/* ==================================================================== */}
      <div className="relative z-10 px-6 md:px-8 py-4 flex-1 flex flex-col justify-center">
        {isCta ? <CtaLayout {...layoutProps} /> : <LayoutComponent {...layoutProps} />}
      </div>

      {/* ==================================================================== */}
      {/* 5. RODAPÉ DO SLIDE: Numeração / Posição + Pista Visual de Deslize    */}
      {/* ==================================================================== */}
      <div className="relative z-10 p-6 md:p-8 pt-2 flex items-center justify-between">
        <div
          className={`text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full border ${
            isLightLayout
              ? "bg-zinc-100 border-zinc-200 text-zinc-600"
              : `${cardBgClass} ${borderClass} ${textMutedClass}`
          }`}
        >
          {isCta ? "CTA FINAL" : `${String(currentSlide).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`}
        </div>

        <div
          className="flex items-center gap-1.5 text-xs font-semibold tracking-tight transition-transform duration-200"
          style={{
            color: isCta
              ? config.accentColor
              : isLightLayout
              ? "#52525b"
              : isLight
              ? "#27272a"
              : "#d4d4d8",
          }}
        >
          <span>{isCta ? "Siga para mais" : "Arraste"}</span>
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
