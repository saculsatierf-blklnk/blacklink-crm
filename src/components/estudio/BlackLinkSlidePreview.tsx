"use client";

import React, { useState, useEffect, useRef } from "react";
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
  isLoadingAI?: boolean;
  scaleMode?: "auto" | "export" | "manual";
  manualScale?: number;
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

// Mapeamento das 21 Famílias Tipográficas
const FONT_CLASS_MAP: Record<SlideFont, string> = {
  // Tipografia Oficial Black Link
  "clash-display": "font-clash",

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
  isLoadingAI = false,
  scaleMode = "auto",
  manualScale,
}: BlackLinkSlidePreviewProps) {
  const isLight = isLightColor(config.bgColor);
  const scale = config.fontSizeScale || 1.0;
  const isCta = currentSlide === totalSlides && totalSlides > 1;

  // Garantia absoluta de fallback defensivo: nunca renderiza vazio nem crasha por campos nulos/indefinidos
  const safeSlide: SlideData = {
    tag:
      slide?.tag?.trim() ||
      (currentSlide === 1
        ? "GANCHO MAGNÉTICO"
        : isCta
        ? "CTA FINAL"
        : `LÂMINA ${currentSlide}`),
    headline:
      slide?.headline?.trim() ||
      (isCta
        ? "Próxima Ação Estratégica"
        : "Defina a Headline desta Lâmina"),
    bodyText:
      slide?.bodyText?.trim() ||
      "Diretrizes estratégicas e conteúdo acionável preparados para esta publicação.",
    category: slide?.category,
    chartData: slide?.chartData,
    kpiHighlight: slide?.kpiHighlight,
  };

  // Dimensões Fixas de Resolução (Padrão Canva)
  const is916 = config.aspectRatio === "9:16";
  const is45 = config.aspectRatio === "4:5";
  const canvasWidth = 1080;
  const canvasHeight = is916 ? 1920 : is45 ? 1350 : 1080;
  const canvasHeightClass = is916 ? "h-[1920px]" : is45 ? "h-[1350px]" : "h-[1080px]";

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
    slide: safeSlide,
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
    isLoadingAI,
  };

  const isLightLayout = config.layout === "notion-doc" || config.layout === "sticky-note" || isLight;

  // Gerenciamento da Escala Visual (transform: scale) via React useRef
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [computedScale, setComputedScale] = useState<number>(() => {
    if (typeof manualScale === "number") return manualScale;
    if (scaleMode === "export") return 1.0;
    return is916 ? 0.32 : is45 ? 0.38 : 0.44;
  });

  useEffect(() => {
    if (scaleMode === "export") {
      setComputedScale(1.0);
      return;
    }
    if (typeof manualScale === "number") {
      setComputedScale(manualScale);
      return;
    }

    const calculateScale = () => {
      const parent = wrapperRef.current?.parentElement || wrapperRef.current;
      if (!parent) return;
      const rawWidth = parent.clientWidth;
      const availableWidth = rawWidth && rawWidth > 40 ? rawWidth : 480;
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 900;
      const maxAvailableHeight = Math.min(viewportHeight * 0.72, 720);

      const scaleByWidth = Math.max(0.1, (availableWidth - 16) / canvasWidth);
      const scaleByHeight = Math.max(0.1, maxAvailableHeight / canvasHeight);

      const bestScale = Math.min(scaleByWidth, scaleByHeight, 0.65);
      const safeScale = Math.max(0.28, Math.min(bestScale, 1.0));

      setComputedScale(Number(safeScale.toFixed(4)));
    };

    calculateScale();
    const handleResize = () => calculateScale();
    window.addEventListener("resize", handleResize);

    let observer: ResizeObserver | null = null;
    if (wrapperRef.current?.parentElement && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => calculateScale());
      observer.observe(wrapperRef.current.parentElement);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
    };
  }, [canvasWidth, canvasHeight, scaleMode, manualScale, is916, is45]);

  // Renderizador do Conteúdo Interno da Lâmina em Resolução Nativa 1080px
  const renderSlideInnerContent = () => (
    <>
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
              } 2.5px, transparent 2.5px)`,
              backgroundSize: "36px 36px",
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
              } 1.5px, transparent 1.5px), linear-gradient(to bottom, ${
                isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.09)"
              } 1.5px, transparent 1.5px)`,
              backgroundSize: "48px 48px",
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
      <div className={`relative z-10 ${is916 ? "pt-32 px-12" : "p-12 pb-4"} pb-4 flex flex-col gap-4`}>
        {/* Barra de Progresso Segmentada */}
        <div className="flex items-center gap-2 w-full">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            const isActive = idx + 1 <= currentSlide;
            return (
              <div
                key={idx}
                className="h-2 rounded-full flex-1 transition-all duration-300"
                style={{
                  backgroundColor: isActive
                    ? config.accentColor
                    : isLightLayout
                    ? "rgba(0, 0, 0, 0.12)"
                    : "rgba(255, 255, 255, 0.20)",
                  boxShadow: isActive ? `0 0 10px ${config.accentColor}60` : "none",
                }}
              />
            );
          })}
        </div>

        {/* Linha de Identificação: Miniatura do Autor + Marca Oficial */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3.5">
            {config.authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.authorAvatar}
                alt={config.authorName}
                className={`w-12 h-12 rounded-full object-cover border-2 ${
                  isLightLayout ? "border-zinc-300" : borderClass
                }`}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: config.accentColor,
                  color: isLightColor(config.accentColor) ? "#09090b" : "#ffffff",
                }}
              >
                {config.authorName.charAt(0) || "B"}
              </div>
            )}
            <div className="flex flex-col text-left leading-tight">
              <span
                className={`text-base font-bold tracking-tight truncate max-w-[280px] ${
                  isLightLayout ? "text-zinc-900" : textPrimaryClass
                }`}
              >
                {config.authorName}
              </span>
              <span
                className={`text-xs font-mono tracking-tight ${
                  isLightLayout ? "text-zinc-500" : textMutedClass
                }`}
              >
                {config.authorHandle}
              </span>
            </div>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border flex items-center gap-2 ${
              isLightLayout
                ? "bg-zinc-100 border-zinc-200 text-zinc-600"
                : `${cardBgClass} ${borderClass} ${textMutedClass}`
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.accentColor }}
            />
            BLACK LINK
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. CORPO DO SLIDE: Layout Dinâmico (Dicionário de 20 Modelos) ou CTA */}
      {/* ==================================================================== */}
      <div className="relative z-10 px-12 py-6 flex-1 flex flex-col justify-center overflow-hidden">
        {isCta ? <CtaLayout {...layoutProps} /> : <LayoutComponent {...layoutProps} />}
      </div>

      {/* ==================================================================== */}
      {/* 5. RODAPÉ DO SLIDE: Numeração / Posição + Pista Visual de Deslize    */}
      {/* ==================================================================== */}
      <div className={`relative z-10 ${is916 ? "pb-36 px-12" : "p-12 pt-4"} pt-4 flex items-center justify-between`}>
        <div
          className={`text-sm font-mono font-bold tracking-widest px-4 py-1.5 rounded-full border ${
            isLightLayout
              ? "bg-zinc-100 border-zinc-200 text-zinc-600"
              : `${cardBgClass} ${borderClass} ${textMutedClass}`
          }`}
        >
          {isCta ? "CTA FINAL" : `${String(currentSlide).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`}
        </div>

        <div
          className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-transform duration-200"
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
          <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </>
  );

  // MODO EXPORT: Retorna diretamente o Canvas nativo 1080px (Sem wrapper transform)
  if (scaleMode === "export") {
    return (
      <div
        id={canvasId}
        data-slide-index={currentSlide}
        className={`w-[1080px] shrink-0 ${canvasHeightClass} relative overflow-hidden select-none flex flex-col justify-between ${fontClass} ${textPrimaryClass}`}
        style={{
          width: "1080px",
          height: `${canvasHeight}px`,
          minWidth: "1080px",
          minHeight: `${canvasHeight}px`,
          maxWidth: "1080px",
          maxHeight: `${canvasHeight}px`,
          backgroundColor:
            config.layout === "notion-doc"
              ? "#fafafa"
              : config.layout === "sticky-note"
              ? "#e5e7eb"
              : config.bgColor,
        }}
      >
        {renderSlideInnerContent()}
      </div>
    );
  }

  // MODO INTERATIVO (PREVIEW DO ESTÚDIO): Canvas 1080px dentro do wrapper com transform: scale
  const scaledWidth = Math.round(canvasWidth * computedScale);
  const scaledHeight = Math.round(canvasHeight * computedScale);

  return (
    <div
      ref={wrapperRef}
      className="w-full flex items-center justify-center overflow-hidden py-1"
    >
      {/* Container de Enquadramento com Dimensões Proporcionais Escaladas */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-200 border border-white/10 shrink-0"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
        }}
      >
        {/* O Nó Real da Lâmina (Canvas de Resolução Fixa 1080px) */}
        <div
          id={canvasId}
          data-slide-index={currentSlide}
          className={`w-[1080px] shrink-0 ${canvasHeightClass} relative overflow-hidden select-none flex flex-col justify-between ${fontClass} ${textPrimaryClass}`}
          style={{
            width: "1080px",
            height: `${canvasHeight}px`,
            minWidth: "1080px",
            minHeight: `${canvasHeight}px`,
            maxWidth: "1080px",
            maxHeight: `${canvasHeight}px`,
            transform: `scale(${computedScale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor:
              config.layout === "notion-doc"
                ? "#fafafa"
                : config.layout === "sticky-note"
                ? "#e5e7eb"
                : config.bgColor,
          }}
        >
          {renderSlideInnerContent()}
        </div>
      </div>
    </div>
  );
}
