"use client";

import React, { forwardRef } from "react";

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

export interface SlideDesignConfig {
  layout: SlideLayout;
  font: SlideFont;
  aspectRatio: AspectRatio;
  pattern?: SlidePattern;
  fontSizeScale?: number; // 80 to 150
  bgColor?: string;
  accentColor?: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  bgImage?: string;
  bgOpacity?: number;
}

export interface BlackLinkSlidePreviewProps {
  headline: string;
  bodyText: string;
  currentSlide?: number;
  totalSlides?: number;
  theme?: SlideTheme | string;
  designConfig?: SlideDesignConfig;
  isExportMode?: boolean;
  className?: string;
  id?: string;
}

/**
 * Função utilitária para cálculo matemático de contraste YIQ:
 * Determina com precisão se a cor de fundo é clara ou escura,
 * garantindo que textos nunca sumam (fim do branco-no-branco).
 */
export function isLightColor(colorStr?: string): boolean {
  if (!colorStr) return false;
  let hex = colorStr.trim().toLowerCase();
  if (hex === "white" || hex === "#fff" || hex === "#ffffff" || hex === "#fafafa" || hex === "#f8f9fa") {
    return true;
  }
  if (hex === "black" || hex === "#000" || hex === "#000000" || hex === "#050505" || hex === "#0a1128" || hex === "#061a14" || hex === "#18080a") {
    return false;
  }
  if (hex.startsWith("#")) hex = hex.slice(1);
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length !== 6) return false;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
}

/**
 * Função de destaque dinâmico:
 * Converte palavras envolvidas em asteriscos duplos (**palavra**)
 * na cor de destaque (accentColor) configurada.
 */
function renderHighlightedText(
  text: string,
  accentColor: string,
  fallbackHighlightClass: string = "font-bold"
): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <span
          key={index}
          style={accentColor ? { color: accentColor } : undefined}
          className={`font-bold drop-shadow-sm transition-colors ${
            !accentColor ? fallbackHighlightClass : ""
          }`}
        >
          {content}
        </span>
      );
    }
    return part;
  });
}

/**
 * Renderizador Oficial Black Link (Padrão Ouro & Nível Figma/Taplio)
 * Recursos de Alta Precisão:
 * 1. Texturas paramétricas (Solid/Mesh, Dots, Grid, Noise/Grain)
 * 2. Contraste inteligente matemático YIQ (Auto light/dark)
 * 3. Layouts de alta variabilidade: Brutalista, Minimal, Tweet, Split 50/50, Terminal Tech, Glass Floating
 * 4. Slide de CTA na lâmina final com avatar ampliado e setas de conversão
 * 5. Barra de progresso e Swipe Cue
 */
export const BlackLinkSlidePreview = forwardRef<
  HTMLDivElement,
  BlackLinkSlidePreviewProps
>(function BlackLinkSlidePreview(
  {
    headline,
    bodyText,
    currentSlide = 1,
    totalSlides = 5,
    theme = "dark-industrial",
    designConfig,
    isExportMode = false,
    className = "",
    id,
  },
  ref
) {
  const formattedSlide = String(currentSlide).padStart(2, "0");
  const formattedTotal = String(totalSlides).padStart(2, "0");

  // Regra de Conversão: A lâmina final assume o Layout Exclusivo de CTA
  const isFinalSlide = currentSlide === totalSlides;

  const cleanHeadline =
    headline?.trim() ||
    (isFinalSlide
      ? "Pronto para Escalar sua **Operação B2B**?"
      : "Como Dominar Contas Enterprise sem Perder Margem");

  const cleanBodyText =
    bodyText?.trim() ||
    (isFinalSlide
      ? "Salve este conteúdo para consultar nos próximos fechamentos e compartilhe com sua diretoria comercial para blindar a esteira."
      : "A maioria das operações corporativas trava por falta de clareza nos gargalos de esteira. Quando alinhamos inteligência de dados e blindagem de território, o ciclo médio cai pela metade.");

  // Configurações do Design Paramétrico
  const activeLayout: SlideLayout = designConfig?.layout || "brutalista";
  const activeFont: SlideFont = designConfig?.font || "space-grotesk";
  const activeAspectRatio: AspectRatio = designConfig?.aspectRatio || "1:1";
  const activePattern: SlidePattern = designConfig?.pattern || "solid-mesh";
  const fontScale = (designConfig?.fontSizeScale || 100) / 100;
  const customBgColor = designConfig?.bgColor;
  const customAccentColor = designConfig?.accentColor || "";
  const authorName = designConfig?.authorName || "Lucas Satierf";
  const authorHandle = designConfig?.authorHandle || "@lucasblacklink";
  const authorAvatar = designConfig?.authorAvatar || "";
  const bgImage = designConfig?.bgImage || "";
  const bgOpacity = designConfig?.bgOpacity ?? 25;

  // Mapeamento de famílias tipográficas
  const fontClasses: Record<SlideFont, string> = {
    "space-grotesk": "font-space-grotesk",
    playfair: "font-playfair",
    jakarta: "font-jakarta",
    inter: "font-inter",
  };

  // Mapeamento estético por tema
  const activeTheme =
    theme === "light-minimal" || theme === "neon-accent"
      ? theme
      : "dark-industrial";

  const themeDefaults = {
    "dark-industrial": {
      bgColor: "#050505",
      accent: "#10b981",
    },
    "light-minimal": {
      bgColor: "#fafafa",
      accent: "#09090b",
    },
    "neon-accent": {
      bgColor: "#000000",
      accent: "#34d399",
    },
  }[activeTheme];

  const resolvedBgColor = customBgColor || themeDefaults.bgColor;
  const resolvedAccentColor = customAccentColor || themeDefaults.accent;

  // 2. Sistema Inteligente de Contraste (YIQ)
  const isLight = isLightColor(resolvedBgColor);

  const colors = {
    headline: isLight ? "text-zinc-950 font-bold" : "text-white font-bold",
    body: isLight ? "text-zinc-700" : "text-zinc-300",
    muted: isLight ? "text-zinc-600" : "text-zinc-400",
    subtle: isLight ? "text-zinc-400" : "text-zinc-500",
    border: isLight ? "border-zinc-300/80" : "border-white/10",
    divider: isLight ? "border-zinc-300/70" : "border-white/[0.08]",
    card: isLight ? "bg-white/80 border-zinc-200 shadow-xl" : "bg-black/40 border-white/10 shadow-2xl",
    glow: isLight ? "via-black/10" : "via-white/20",
    brand: isLight ? "text-zinc-600" : "text-zinc-500",
  };

  // Dimensões do Canvas
  const containerDimensions = isExportMode
    ? activeAspectRatio === "4:5"
      ? "w-[1080px] h-[1350px] min-w-[1080px] min-h-[1350px] rounded-none border-0"
      : "w-[1080px] h-[1080px] min-w-[1080px] min-h-[1080px] rounded-none border-0"
    : activeAspectRatio === "4:5"
    ? "aspect-[4/5] w-full max-w-[480px] mx-auto rounded-3xl border shadow-2xl"
    : "aspect-square w-full rounded-3xl border shadow-2xl";

  const progressPercentage = (currentSlide / totalSlides) * 100;

  return (
    <div
      ref={ref}
      id={id}
      style={{
        backgroundColor: resolvedBgColor,
      }}
      className={`relative select-none overflow-hidden transition-colors ${containerDimensions} ${colors.border} ${fontClasses[activeFont]} ${className}`}
    >
      {/* 1. MOTOR DE TEXTURAS DE FUNDO (PATTERNS & NOISE) */}
      {activePattern === "dots" && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: isLight
              ? "radial-gradient(#00000018 1.2px, transparent 1.2px)"
              : "radial-gradient(#ffffff18 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
      )}

      {activePattern === "grid" && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: isLight
              ? "linear-gradient(to right, #00000010 1px, transparent 1px), linear-gradient(to bottom, #00000010 1px, transparent 1px)"
              : "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      {activePattern === "noise" && (
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {activePattern === "solid-mesh" && (
        <div
          className={`absolute inset-0 pointer-events-none z-0 ${
            isLight
              ? "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-300/30 via-transparent to-transparent"
              : "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-700/20 via-transparent to-transparent"
          }`}
        />
      )}

      {/* Imagem de Fundo Opcional */}
      {bgImage && activeLayout !== "split" && (
        <div
          className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-300 z-0 ${
            activeLayout === "glass-floating" ? "blur-xl scale-110" : ""
          }`}
          style={{
            backgroundImage: `url(${bgImage})`,
            opacity: bgOpacity / 100,
          }}
        />
      )}

      {/* Linha sutil de refração superior */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${colors.glow} to-transparent pointer-events-none z-20`}
      />

      {/* Barra de Progresso no Topo de Todas as Lâminas */}
      <div
        className={`absolute top-0 inset-x-0 bg-white/[0.08] z-30 overflow-hidden ${
          isExportMode ? "h-3" : "h-1 sm:h-1.5"
        }`}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: resolvedAccentColor,
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* LÂMINA FINAL: SLIDE EXCLUSIVO DE CTA */}
      {/* ========================================================= */}
      {isFinalSlide ? (
        <div
          className={`flex flex-col justify-between items-center text-center h-full relative z-10 ${
            isExportMode
              ? activeAspectRatio === "4:5"
                ? "p-24"
                : "p-20"
              : "p-8 sm:p-10 lg:p-12"
          }`}
        >
          {/* Topo do CTA */}
          <div className={`flex items-center justify-between w-full border-b ${colors.divider} pb-4`}>
            <span
              className={`font-bold uppercase tracking-[0.3em] font-sans ${
                isExportMode ? "text-base" : "text-[10px]"
              } ${colors.brand}`}
            >
              BLACK LINK • CONVERSÃO
            </span>

            <span
              className={`font-mono tracking-wider font-semibold ${
                isExportMode ? "text-lg" : "text-xs"
              }`}
              style={{ color: resolvedAccentColor }}
            >
              [ AÇÃO FINAL ]
            </span>
          </div>

          {/* Centro: Avatar Grande + Headline + Copy */}
          <div className="flex-1 flex flex-col justify-center items-center my-auto max-w-xl mx-auto py-4">
            <div
              className={`rounded-full overflow-hidden border-2 shadow-2xl shrink-0 flex items-center justify-center font-bold text-white relative transition-transform ${
                isExportMode
                  ? "w-60 h-60 text-4xl border-4 mb-8"
                  : "w-28 h-28 sm:w-36 sm:h-36 text-2xl mb-4"
              }`}
              style={{
                borderColor: resolvedAccentColor,
                boxShadow: `0 0 35px ${resolvedAccentColor}40`,
              }}
            >
              {authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-700 flex items-center justify-center">
                  <span>{authorName.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1 mb-4">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-bold tracking-tight ${colors.headline} ${
                    isExportMode ? "text-2xl" : "text-base sm:text-lg"
                  }`}
                >
                  {authorName}
                </span>
                <svg
                  className={`text-sky-400 fill-current shrink-0 ${
                    isExportMode ? "w-6 h-6" : "w-4 h-4"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zm-12.8 4.2l-3.9-3.9 1.4-1.4 2.5 2.5 6.7-6.7 1.4 1.4-8.1 8.1z" />
                </svg>
              </div>
              <span
                className={`font-mono ${colors.muted} ${
                  isExportMode ? "text-lg" : "text-xs"
                }`}
              >
                {authorHandle}
              </span>
            </div>

            <h2
              style={{
                fontSize: isExportMode
                  ? `${Math.round((activeAspectRatio === "4:5" ? 58 : 50) * fontScale)}px`
                  : `calc(1.875rem * ${fontScale})`,
                lineHeight: 1.15,
              }}
              className={`tracking-tight ${colors.headline} mb-3`}
            >
              {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
            </h2>

            <p
              style={{
                fontSize: isExportMode
                  ? `${Math.round(26 * fontScale)}px`
                  : `calc(0.95rem * ${fontScale})`,
                lineHeight: 1.5,
              }}
              className={`${colors.body} max-w-lg mb-6`}
            >
              {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
            </p>
          </div>

          {/* Rodapé: Ícones e Setas de Conversão */}
          <div className={`w-full flex flex-col items-center gap-3 pt-3 border-t ${colors.divider}`}>
            <div className="flex items-center justify-between w-full max-w-md px-4">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono uppercase font-bold tracking-wider ${
                    isExportMode ? "text-lg" : "text-[10px]"
                  }`}
                  style={{ color: resolvedAccentColor }}
                >
                  Compartilhe
                </span>
                <svg
                  className={`fill-none stroke-current animate-bounce ${
                    isExportMode ? "w-6 h-6" : "w-3.5 h-3.5"
                  }`}
                  style={{ color: resolvedAccentColor }}
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5">
                <svg
                  className={`fill-none stroke-current animate-bounce ${
                    isExportMode ? "w-6 h-6" : "w-3.5 h-3.5"
                  }`}
                  style={{ color: resolvedAccentColor }}
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
                <span
                  className={`font-mono uppercase font-bold tracking-wider ${
                    isExportMode ? "text-lg" : "text-[10px]"
                  }`}
                  style={{ color: resolvedAccentColor }}
                >
                  Salve o Post
                </span>
              </div>
            </div>

            <div
              className={`flex items-center justify-between w-full max-w-md rounded-2xl border backdrop-blur-xl ${
                isLight ? "bg-black/[0.04] border-black/10" : "bg-white/[0.04] border-white/10"
              } ${isExportMode ? "p-6" : "px-6 py-3"}`}
            >
              <div className={`flex items-center gap-2 ${colors.muted}`}>
                <svg className={`fill-none stroke-current ${isExportMode ? "w-8 h-8" : "w-5 h-5"}`} viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className={isExportMode ? "text-base font-mono" : "text-[11px] font-mono"}>Curtir</span>
              </div>

              <div className={`flex items-center gap-2 ${colors.muted}`}>
                <svg className={`fill-none stroke-current ${isExportMode ? "w-8 h-8" : "w-5 h-5"}`} viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span className={isExportMode ? "text-base font-mono" : "text-[11px] font-mono"}>Comentar</span>
              </div>

              <div className="flex items-center gap-2 font-semibold" style={{ color: resolvedAccentColor }}>
                <svg className={`fill-none stroke-current ${isExportMode ? "w-8 h-8" : "w-5 h-5"}`} viewBox="0 0 24 24" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span className={isExportMode ? "text-base font-mono" : "text-[11px] font-mono"}>Enviar</span>
              </div>

              <div className="flex items-center gap-2 font-semibold" style={{ color: resolvedAccentColor }}>
                <svg className={`fill-none stroke-current ${isExportMode ? "w-8 h-8" : "w-5 h-5"}`} viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span className={isExportMode ? "text-base font-mono" : "text-[11px] font-mono"}>Salvar</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* LÂMINAS 1 A 4: BIBLIOTECA DE LAYOUTS PARAMÉTRICOS */
        /* ========================================================= */
        <>
          {/* LAYOUT 1: BRUTALISTA */}
          {activeLayout === "brutalista" && (
            <div
              className={`flex flex-col justify-between h-full relative z-10 ${
                isExportMode
                  ? activeAspectRatio === "4:5"
                    ? "p-24"
                    : "p-20"
                  : "p-8 sm:p-10 lg:p-12"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-bold uppercase tracking-[0.3em] font-sans ${isExportMode ? "text-base" : "text-[10px]"} ${colors.brand}`}>
                  BLACK LINK • CRM
                </span>
                <span className={`font-mono tracking-wider font-medium ${isExportMode ? "text-lg" : "text-xs sm:text-sm"} ${colors.muted}`}>
                  [ {formattedSlide} / {formattedTotal} ]
                </span>
              </div>

              <div className={`flex-1 flex flex-col justify-center text-left my-auto ${isExportMode ? "py-10" : "py-6"}`}>
                <h2
                  style={{
                    fontSize: isExportMode
                      ? `${Math.round((activeAspectRatio === "4:5" ? 72 : 64) * fontScale)}px`
                      : `calc(2.25rem * ${fontScale})`,
                    lineHeight: 1.08,
                  }}
                  className={`tracking-tighter ${colors.headline} mb-6 line-clamp-4`}
                >
                  {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                </h2>

                <p
                  style={{
                    fontSize: isExportMode
                      ? `${Math.round(28 * fontScale)}px`
                      : `calc(1.1rem * ${fontScale})`,
                    lineHeight: 1.5,
                  }}
                  className={`leading-relaxed font-normal ${colors.body} max-w-[90%] line-clamp-6`}
                >
                  {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                </p>
              </div>

              <div className={`border-t ${colors.divider} flex items-center justify-between ${isExportMode ? "pt-8" : "pt-6"}`}>
                <span className={`font-sans tracking-wide font-normal ${isExportMode ? "text-lg" : "text-xs sm:text-sm"} ${colors.muted}`}>
                  Inteligência B2B &amp; Automação
                </span>
                <div className={`flex items-center gap-1.5 uppercase tracking-widest text-[10px] font-mono select-none ${colors.subtle}`}>
                  <span>Arraste</span>
                  <span className="inline-block animate-pulse">➔</span>
                </div>
              </div>
            </div>
          )}

          {/* LAYOUT 2: MINIMALISTA */}
          {activeLayout === "minimal" && (
            <div
              className={`flex flex-col justify-between items-center text-center h-full relative z-10 ${
                isExportMode
                  ? activeAspectRatio === "4:5"
                    ? "p-28"
                    : "p-24"
                  : "p-10 sm:p-12 lg:p-14"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className={`font-medium uppercase tracking-[0.4em] font-sans ${isExportMode ? "text-sm" : "text-[9px]"} ${colors.brand} opacity-80`}>
                  {authorName.toUpperCase()}
                </span>
                <span className={`font-mono tracking-widest ${isExportMode ? "text-sm" : "text-[11px]"} ${colors.muted}`}>
                  — {formattedSlide} / {formattedTotal} —
                </span>
              </div>

              <div className={`flex-1 flex flex-col justify-center items-center text-center max-w-2xl mx-auto my-auto ${isExportMode ? "py-12" : "py-8"}`}>
                <h2
                  style={{
                    fontSize: isExportMode
                      ? `${Math.round((activeAspectRatio === "4:5" ? 68 : 58) * fontScale)}px`
                      : `calc(2rem * ${fontScale})`,
                    lineHeight: 1.18,
                  }}
                  className={`tracking-tight ${colors.headline} mb-6 line-clamp-4`}
                >
                  {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                </h2>

                <div
                  style={{ backgroundColor: resolvedAccentColor }}
                  className="w-12 h-0.5 my-6 opacity-40 rounded-full"
                />

                <p
                  style={{
                    fontSize: isExportMode
                      ? `${Math.round(26 * fontScale)}px`
                      : `calc(1rem * ${fontScale})`,
                    lineHeight: 1.5,
                  }}
                  className={`leading-relaxed font-normal ${colors.body} max-w-[85%] line-clamp-6`}
                >
                  {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                </p>
              </div>

              <div className={`flex items-center justify-between w-full pt-4 border-t ${colors.divider}`}>
                <span className={`font-mono text-[9px] ${colors.subtle}`}>
                  Black Link Editorial
                </span>
                <div className={`flex items-center gap-1.5 uppercase tracking-widest text-[10px] font-mono select-none ${colors.subtle}`}>
                  <span>Arraste</span>
                  <span className="inline-block animate-pulse">➔</span>
                </div>
              </div>
            </div>
          )}

          {/* LAYOUT 3: THREAD / TWEET */}
          {activeLayout === "tweet" && (
            <div
              className={`flex flex-col justify-between h-full relative z-10 ${
                isExportMode
                  ? activeAspectRatio === "4:5"
                    ? "p-24"
                    : "p-20"
                  : "p-8 sm:p-10 lg:p-12"
              }`}
            >
              <div className={`flex items-center justify-between border-b ${colors.divider} pb-5`}>
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div
                    className={`rounded-full overflow-hidden border shrink-0 flex items-center justify-center font-bold text-white shadow-md ${colors.border} ${
                      isExportMode ? "w-20 h-20 text-2xl" : "w-11 h-11 text-sm"
                    }`}
                  >
                    {authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center">
                        <span>{authorName.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold tracking-tight leading-tight ${colors.headline} ${isExportMode ? "text-2xl" : "text-sm sm:text-base"}`}>
                        {authorName}
                      </span>
                      <svg className={`text-sky-400 fill-current shrink-0 ${isExportMode ? "w-6 h-6" : "w-4 h-4"}`} viewBox="0 0 24 24">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zm-12.8 4.2l-3.9-3.9 1.4-1.4 2.5 2.5 6.7-6.7 1.4 1.4-8.1 8.1z" />
                      </svg>
                    </div>
                    <div className={`flex items-center gap-1.5 font-mono ${colors.muted}`}>
                      <span className={isExportMode ? "text-lg" : "text-xs"}>{authorHandle}</span>
                      <span>·</span>
                      <span className={isExportMode ? "text-lg" : "text-xs"}>{currentSlide}h</span>
                    </div>
                  </div>
                </div>

                <div className={`font-black tracking-tighter opacity-80 ${colors.headline} ${isExportMode ? "text-3xl" : "text-lg"}`}>
                  𝕏
                </div>
              </div>

              <div className={`flex-1 flex flex-col justify-center text-left my-auto ${isExportMode ? "py-8" : "py-5"}`}>
                <h2
                  style={{
                    fontSize: isExportMode
                      ? `${Math.round((activeAspectRatio === "4:5" ? 54 : 46) * fontScale)}px`
                      : `calc(1.5rem * ${fontScale})`,
                    lineHeight: 1.25,
                  }}
                  className={`tracking-tight ${colors.headline} mb-4 line-clamp-3`}
                >
                  {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                </h2>

                <p
                  style={{
                    fontSize: isExportMode
                      ? `${Math.round(28 * fontScale)}px`
                      : `calc(0.95rem * ${fontScale})`,
                    lineHeight: 1.5,
                  }}
                  className={`leading-relaxed font-normal whitespace-pre-line ${colors.body} max-w-[95%] line-clamp-6`}
                >
                  {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                </p>
              </div>

              <div className={`border-t ${colors.divider} pt-4 space-y-3`}>
                <div className={`flex items-center justify-between font-mono ${colors.muted} ${isExportMode ? "text-lg" : "text-xs"}`}>
                  <span>💬 48</span>
                  <span>🔁 128</span>
                  <span className="text-rose-400">❤️ 1.4k</span>
                  <span>🔖 342</span>
                  <span>📊 94k</span>
                </div>

                <div className={`flex items-center justify-between text-[11px] font-mono ${colors.subtle} pt-1`}>
                  <span>🧵 Thread [{formattedSlide}/{formattedTotal}]</span>
                  <div className="flex items-center gap-1.5 select-none">
                    <span>Arraste</span>
                    <span className="inline-block animate-pulse">➔</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LAYOUT 4: SPLIT (50/50) */}
          {activeLayout === "split" && (
            <div className="grid grid-cols-2 h-full w-full relative z-10">
              {/* Lado Esquerdo: Conteúdo Editorial */}
              <div
                className={`flex flex-col justify-between h-full border-r ${colors.divider} ${
                  isExportMode ? "p-16" : "p-6 sm:p-8"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold uppercase tracking-[0.25em] font-sans ${isExportMode ? "text-sm" : "text-[9px]"} ${colors.brand}`}>
                    BLACK LINK
                  </span>
                  <span className={`font-mono text-xs ${colors.muted}`}>
                    [{formattedSlide}/{formattedTotal}]
                  </span>
                </div>

                <div className="my-auto py-4">
                  <h2
                    style={{
                      fontSize: isExportMode
                        ? `${Math.round(48 * fontScale)}px`
                        : `calc(1.4rem * ${fontScale})`,
                      lineHeight: 1.15,
                    }}
                    className={`tracking-tighter ${colors.headline} mb-4 line-clamp-4`}
                  >
                    {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                  </h2>

                  <p
                    style={{
                      fontSize: isExportMode
                        ? `${Math.round(24 * fontScale)}px`
                        : `calc(0.85rem * ${fontScale})`,
                      lineHeight: 1.45,
                    }}
                    className={`${colors.body} line-clamp-5`}
                  >
                    {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono ${colors.subtle}`}>
                    {authorHandle}
                  </span>
                  <span className={`text-[10px] font-mono ${colors.subtle}`}>
                    Arraste ➔
                  </span>
                </div>
              </div>

              {/* Lado Direito: Imagem 100% ou Gráfico B2B */}
              <div className="relative h-full w-full overflow-hidden bg-zinc-900">
                {bgImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bgImage} alt="Visual" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: "radial-gradient(#ffffff22 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                    <div
                      className="w-24 h-24 rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl relative z-10"
                      style={{
                        background: `radial-gradient(circle, ${resolvedAccentColor}33 0%, transparent 70%)`,
                      }}
                    >
                      <span className="text-3xl font-mono" style={{ color: resolvedAccentColor }}>
                        {formattedSlide}
                      </span>
                    </div>
                    <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-4">
                      Asset Visual B2B
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LAYOUT 5: TERMINAL / TECH */}
          {activeLayout === "terminal" && (
            <div
              className={`flex flex-col justify-between h-full relative z-10 font-mono ${
                isExportMode ? "p-20" : "p-6 sm:p-8"
              }`}
            >
              {/* Janela macOS: 3 Botões Coloridos */}
              <div className={`flex items-center justify-between pb-4 border-b ${colors.divider}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm" />
                </div>
                <span className={`text-[11px] ${colors.muted}`}>
                  ~/blacklink/insight_{formattedSlide}.sh
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  EXEC: OK
                </span>
              </div>

              {/* Corpo do Terminal */}
              <div className="my-auto py-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-emerald-400 font-bold">❯</span>
                  <span className={`text-xs ${colors.subtle}`}>blacklink-cli --inspect</span>
                </div>

                <h2
                  style={{
                    fontSize: isExportMode
                      ? `${Math.round(54 * fontScale)}px`
                      : `calc(1.75rem * ${fontScale})`,
                    lineHeight: 1.15,
                  }}
                  className={`tracking-tight ${colors.headline} mb-4 line-clamp-3`}
                >
                  {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                </h2>

                <div className={`p-4 rounded-xl border ${colors.card} my-4`}>
                  <p
                    style={{
                      fontSize: isExportMode
                        ? `${Math.round(26 * fontScale)}px`
                        : `calc(0.9rem * ${fontScale})`,
                      lineHeight: 1.5,
                    }}
                    className={`${colors.body} line-clamp-5`}
                  >
                    <span className="text-zinc-500 mr-2">&gt;</span>
                    {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                  </p>
                </div>
              </div>

              {/* Status Bar do Terminal */}
              <div className={`flex items-center justify-between pt-3 border-t ${colors.divider} text-[10px] ${colors.subtle}`}>
                <span>[UTF-8] LN {currentSlide}, COL 1</span>
                <span>DESLIZE PARA EXECUTAR ➔</span>
              </div>
            </div>
          )}

          {/* LAYOUT 6: GLASS FLOATING */}
          {activeLayout === "glass-floating" && (
            <div className="h-full w-full p-6 sm:p-8 flex items-center justify-center relative z-10">
              <div
                className={`w-full h-full rounded-3xl border flex flex-col justify-between ${colors.card} ${
                  isExportMode ? "p-20" : "p-8 sm:p-10"
                }`}
                style={{
                  boxShadow: `0 30px 60px -15px ${resolvedAccentColor}18, 0 10px 30px -10px rgba(0,0,0,0.5)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold uppercase tracking-[0.3em] font-sans ${isExportMode ? "text-base" : "text-[10px]"} ${colors.brand}`}>
                    BLACK LINK • 3D GLASS
                  </span>
                  <span className={`font-mono text-xs font-semibold ${colors.muted}`}>
                    [ {formattedSlide} / {formattedTotal} ]
                  </span>
                </div>

                <div className="my-auto py-4 text-center max-w-lg mx-auto">
                  <h2
                    style={{
                      fontSize: isExportMode
                        ? `${Math.round(58 * fontScale)}px`
                        : `calc(1.85rem * ${fontScale})`,
                      lineHeight: 1.15,
                    }}
                    className={`tracking-tight ${colors.headline} mb-4 line-clamp-3`}
                  >
                    {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                  </h2>

                  <p
                    style={{
                      fontSize: isExportMode
                        ? `${Math.round(26 * fontScale)}px`
                        : `calc(0.95rem * ${fontScale})`,
                      lineHeight: 1.5,
                    }}
                    className={`${colors.body} line-clamp-5`}
                  >
                    {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                  </p>
                </div>

                <div className={`flex items-center justify-between pt-4 border-t ${colors.divider}`}>
                  <span className={`text-[10px] font-mono ${colors.subtle}`}>
                    {authorName}
                  </span>
                  <span className={`text-[10px] font-mono ${colors.subtle}`}>
                    Arraste ➔
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});
