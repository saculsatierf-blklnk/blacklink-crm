"use client";

import React, { forwardRef } from "react";

export type SlideTheme = "dark-industrial" | "light-minimal" | "neon-accent";
export type SlideLayout = "brutalista" | "minimal" | "tweet";
export type SlideFont = "space-grotesk" | "playfair" | "jakarta" | "inter";
export type AspectRatio = "1:1" | "4:5";

export interface SlideDesignConfig {
  layout: SlideLayout;
  font: SlideFont;
  aspectRatio: AspectRatio;
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
 * Função de destaque dinâmico:
 * Converte palavras envolvidas em asteriscos duplos (**palavra**)
 * na cor de destaque (accentColor) configurada.
 */
function renderHighlightedText(
  text: string,
  accentColor: string,
  fallbackHighlightClass: string = "text-white"
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
          className={`font-bold transition-colors ${
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
 * Renderizador Oficial Black Link (Padrão Ouro & Conversão B2B)
 * Inclui:
 * - Layout Exclusivo de CTA na lâmina final com avatar grande e gatilhos de engajamento
 * - Barra de progresso proporcional no topo de todas as lâminas
 * - Indicador Swipe Cue ("Arraste ➔") nas lâminas 1 a 4
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
      ? "Salve este conteúdo para consultar nos próximos fechamentos e compartilhe com sua diretoria comercial para alinhar a esteira."
      : "A maioria das operações corporativas trava por falta de clareza nos gargalos de esteira. Quando alinhamos inteligência de dados e blindagem de território, o ciclo médio cai pela metade.");

  // Configuração ativa de layout e estilo
  const activeLayout: SlideLayout = designConfig?.layout || "brutalista";
  const activeFont: SlideFont = designConfig?.font || "space-grotesk";
  const activeAspectRatio: AspectRatio = designConfig?.aspectRatio || "1:1";
  const customBgColor = designConfig?.bgColor;
  const customAccentColor = designConfig?.accentColor || "";
  const authorName = designConfig?.authorName || "Lucas Satierf";
  const authorHandle = designConfig?.authorHandle || "@lucasblacklink";
  const authorAvatar = designConfig?.authorAvatar || "";
  const bgImage = designConfig?.bgImage || "";
  const bgOpacity = designConfig?.bgOpacity ?? 20;

  // Mapeamento de famílias tipográficas
  const fontClasses: Record<SlideFont, string> = {
    "space-grotesk": "font-space-grotesk",
    playfair: "font-playfair",
    jakarta: "font-jakarta",
    inter: "font-inter",
  };

  // Configurações e mapeamento estético por tema
  const activeTheme =
    theme === "light-minimal" || theme === "neon-accent"
      ? theme
      : "dark-industrial";

  const themeStyles = {
    "dark-industrial": {
      container:
        "border-white/[0.08] bg-[#050505] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#050505] to-[#050505]",
      topGlow: "via-white/20",
      brand: "text-zinc-500",
      counter: "text-zinc-400",
      headline: "text-white",
      body: "text-zinc-400",
      footerBorder: "border-white/10",
      footerText: "text-zinc-400",
      footerSubtle: "text-zinc-600",
      defaultAccent: "#10b981",
    },
    "light-minimal": {
      container: "border-zinc-200 bg-zinc-50 shadow-xl",
      topGlow: "via-zinc-300",
      brand: "text-zinc-500",
      counter: "text-zinc-500",
      headline: "text-zinc-900",
      body: "text-zinc-600",
      footerBorder: "border-zinc-200",
      footerText: "text-zinc-700",
      footerSubtle: "text-zinc-400",
      defaultAccent: "#09090b",
    },
    "neon-accent": {
      container: "border-emerald-500/20 bg-black",
      topGlow: "via-emerald-400/40",
      brand: "text-emerald-400",
      counter: "text-cyan-300",
      headline:
        "bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text",
      body: "text-zinc-300",
      footerBorder: "border-emerald-500/20",
      footerText: "text-zinc-300",
      footerSubtle: "text-emerald-400/60",
      defaultAccent: "#34d399",
    },
  }[activeTheme];

  const resolvedAccentColor = customAccentColor || themeStyles.defaultAccent;

  // Dimensões dinâmicas para exportação vs preview interativo
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
        backgroundColor: customBgColor || undefined,
      }}
      className={`relative select-none overflow-hidden transition-colors ${containerDimensions} ${
        !customBgColor ? themeStyles.container : "border-white/10 shadow-2xl"
      } ${fontClasses[activeFont]} ${className}`}
    >
      {/* Imagem de Fundo Opcional com Controle de Opacidade */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-300"
          style={{
            backgroundImage: `url(${bgImage})`,
            opacity: bgOpacity / 100,
          }}
        />
      )}

      {/* Linha sutil de refração superior Apple Glass */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${themeStyles.topGlow} to-transparent pointer-events-none z-20`}
      />

      {/* ========================================================= */}
      {/* 2. INDICADOR DE RETENÇÃO: BARRA DE PROGRESSO NO TOPO */}
      {/* ========================================================= */}
      <div
        className={`absolute top-0 inset-x-0 bg-white/[0.08] z-30 overflow-hidden ${
          isExportMode ? "h-3" : "h-1 sm:h-1.5"
        }`}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: resolvedAccentColor || "#10b981",
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* 1. LAYOUT EXCLUSIVO DA LÂMINA FINAL: SLIDE DE CTA */}
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
          <div className="flex items-center justify-between w-full border-b border-white/[0.08] pb-4">
            <span
              className={`font-bold uppercase tracking-[0.3em] font-sans ${
                isExportMode ? "text-base" : "text-[10px]"
              } ${themeStyles.brand}`}
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

          {/* Centro do CTA: Foto do Autor (Avatar Grande) + Headline + BodyText */}
          <div className="flex-1 flex flex-col justify-center items-center my-auto max-w-xl mx-auto py-4">
            {/* Foto do Autor em Tamanho Grande */}
            <div
              className={`rounded-full overflow-hidden border-2 shadow-2xl shrink-0 flex items-center justify-center font-bold text-white relative group transition-transform ${
                isExportMode
                  ? "w-60 h-60 text-4xl border-4 mb-8"
                  : "w-28 h-28 sm:w-36 sm:h-36 text-2xl mb-4"
              }`}
              style={{
                borderColor: resolvedAccentColor || "rgba(255,255,255,0.2)",
                boxShadow: `0 0 35px ${resolvedAccentColor}33`,
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

            {/* Identificação do Autor */}
            <div className="flex flex-col items-center gap-1 mb-4">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-bold tracking-tight text-white ${
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
                className={`font-mono text-zinc-400 ${
                  isExportMode ? "text-lg" : "text-xs"
                }`}
              >
                {authorHandle}
              </span>
            </div>

            {/* Headline Colossal de CTA */}
            <h2
              className={`font-bold tracking-tight text-white leading-tight mb-3 ${
                isExportMode
                  ? activeAspectRatio === "4:5"
                    ? "text-[58px] mb-6"
                    : "text-[50px] mb-5"
                  : "text-2xl sm:text-3xl md:text-4xl"
              }`}
            >
              {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
            </h2>

            {/* BodyText / Chamada Clara */}
            <p
              className={`leading-relaxed text-zinc-300 font-normal max-w-lg ${
                isExportMode
                  ? "text-[26px] max-w-2xl mb-8"
                  : "text-xs sm:text-sm md:text-base mb-6"
              }`}
            >
              {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
            </p>
          </div>

          {/* Rodapé do CTA: Ícones Sociais (Instagram/LinkedIn) & Setas Visuais */}
          <div className="w-full flex flex-col items-center gap-3 pt-3 border-t border-white/[0.08]">
            {/* Setas Visuais Apontando para "Compartilhar" e "Salvar" */}
            <div className="flex items-center justify-between w-full max-w-md px-4">
              <div className="flex items-center gap-1.5 text-zinc-400">
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

              <div className="flex items-center gap-1.5 text-zinc-400">
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

            {/* Barra Simulada com Ícones Sociais */}
            <div
              className={`flex items-center justify-between w-full max-w-md rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl ${
                isExportMode ? "p-6" : "px-6 py-3"
              }`}
            >
              {/* Coração (Curtir) */}
              <div className="flex items-center gap-2 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer">
                <svg
                  className={`fill-none stroke-current ${
                    isExportMode ? "w-8 h-8" : "w-5 h-5"
                  }`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className={isExportMode ? "text-base font-mono" : "text-[11px] font-mono"}>
                  Curtir
                </span>
              </div>

              {/* Comentário */}
              <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                <svg
                  className={`fill-none stroke-current ${
                    isExportMode ? "w-8 h-8" : "w-5 h-5"
                  }`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span className={isExportMode ? "text-base font-mono" : "text-[11px] font-mono"}>
                  Comentar
                </span>
              </div>

              {/* Aviãozinho (Compartilhar) */}
              <div
                className="flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                style={{ color: resolvedAccentColor }}
              >
                <svg
                  className={`fill-none stroke-current ${
                    isExportMode ? "w-8 h-8" : "w-5 h-5"
                  }`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span className={isExportMode ? "text-base font-mono" : "text-[11px] font-mono"}>
                  Enviar
                </span>
              </div>

              {/* Marcador (Salvar) */}
              <div
                className="flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                style={{ color: resolvedAccentColor }}
              >
                <svg
                  className={`fill-none stroke-current ${
                    isExportMode ? "w-8 h-8" : "w-5 h-5"
                  }`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span className={isExportMode ? "text-base font-mono" : "text-[11px] font-mono"}>
                  Salvar
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* LÂMINAS DE 1 A 4: LAYOUT SELECIONADO COM SWIPE CUES */
        /* ========================================================= */
        <>
          {/* ESTRUTURA 1: LAYOUT BRUTALISTA */}
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
              {/* Topo (Header) */}
              <div className="flex justify-between items-center">
                <span
                  className={`font-bold uppercase tracking-[0.3em] font-sans ${
                    isExportMode ? "text-base" : "text-[10px]"
                  } ${themeStyles.brand}`}
                >
                  BLACK LINK • CRM
                </span>

                <span
                  className={`font-mono tracking-wider font-medium ${
                    isExportMode ? "text-lg" : "text-xs sm:text-sm"
                  } ${themeStyles.counter}`}
                >
                  [ {formattedSlide} / {formattedTotal} ]
                </span>
              </div>

              {/* Centro (Body): Totalmente alinhado à esquerda */}
              <div
                className={`flex-1 flex flex-col justify-center text-left my-auto ${
                  isExportMode ? "py-10" : "py-6"
                }`}
              >
                <h2
                  className={`font-semibold tracking-tighter leading-[1.08] ${
                    isExportMode
                      ? activeAspectRatio === "4:5"
                        ? "text-[72px] mb-10"
                        : "text-[64px] mb-8"
                      : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 line-clamp-4"
                  } ${themeStyles.headline}`}
                >
                  {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                </h2>

                <p
                  className={`leading-relaxed font-normal ${
                    isExportMode
                      ? "text-[28px] max-w-[92%]"
                      : "text-base sm:text-lg lg:text-xl max-w-[90%] line-clamp-6"
                  } ${themeStyles.body}`}
                >
                  {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                </p>
              </div>

              {/* Rodapé (Footer) com Swipe Cue */}
              <div
                className={`border-t flex items-center justify-between ${
                  isExportMode ? "pt-8" : "pt-6"
                } ${themeStyles.footerBorder}`}
              >
                <span
                  className={`font-sans tracking-wide font-normal ${
                    isExportMode ? "text-lg" : "text-xs sm:text-sm"
                  } ${themeStyles.footerText}`}
                >
                  Inteligência B2B &amp; Automação
                </span>

                {/* Swipe Cue Animado */}
                <div className="flex items-center gap-1.5 text-white/40 uppercase tracking-widest text-[10px] font-mono select-none">
                  <span>Arraste</span>
                  <span className="inline-block animate-pulse">➔</span>
                </div>
              </div>
            </div>
          )}

          {/* ESTRUTURA 2: LAYOUT MINIMALISTA */}
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
              {/* Topo (Header Minimal) */}
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`font-medium uppercase tracking-[0.4em] font-sans ${
                    isExportMode ? "text-sm" : "text-[9px]"
                  } ${themeStyles.brand} opacity-80`}
                >
                  {authorName.toUpperCase()}
                </span>
                <span
                  className={`font-mono tracking-widest ${
                    isExportMode ? "text-sm" : "text-[11px]"
                  } ${themeStyles.counter}`}
                >
                  — {formattedSlide} / {formattedTotal} —
                </span>
              </div>

              {/* Centro (Body Minimal): Totalmente Centralizado */}
              <div
                className={`flex-1 flex flex-col justify-center items-center text-center max-w-2xl mx-auto my-auto ${
                  isExportMode ? "py-12" : "py-8"
                }`}
              >
                <h2
                  className={`font-medium tracking-tight leading-[1.18] ${
                    isExportMode
                      ? activeAspectRatio === "4:5"
                        ? "text-[68px] mb-10"
                        : "text-[58px] mb-8"
                      : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 line-clamp-4"
                  } ${themeStyles.headline}`}
                >
                  {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                </h2>

                <div
                  style={{ backgroundColor: resolvedAccentColor || "#ffffff" }}
                  className="w-12 h-0.5 my-6 opacity-40 rounded-full"
                />

                <p
                  className={`leading-relaxed font-normal ${
                    isExportMode
                      ? "text-[26px] max-w-[85%]"
                      : "text-sm sm:text-base lg:text-lg max-w-[85%] line-clamp-6"
                  } ${themeStyles.body}`}
                >
                  {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                </p>
              </div>

              {/* Rodapé (Footer Minimal) com Swipe Cue */}
              <div className="flex items-center justify-between w-full pt-4 border-t border-white/[0.05]">
                <span
                  className={`font-mono text-[9px] ${themeStyles.footerText} opacity-60`}
                >
                  Black Link Editorial
                </span>

                <div className="flex items-center gap-1.5 text-white/40 uppercase tracking-widest text-[10px] font-mono select-none">
                  <span>Arraste</span>
                  <span className="inline-block animate-pulse">➔</span>
                </div>
              </div>
            </div>
          )}

          {/* ESTRUTURA 3: LAYOUT THREAD / TWEET */}
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
              {/* Header do Tweet */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div
                    className={`rounded-full overflow-hidden border border-white/20 shrink-0 bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center font-bold text-white shadow-md ${
                      isExportMode ? "w-20 h-20 text-2xl" : "w-11 h-11 text-sm"
                    }`}
                  >
                    {authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{authorName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-bold tracking-tight text-white leading-tight ${
                          isExportMode ? "text-2xl" : "text-sm sm:text-base"
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
                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                      <span className={isExportMode ? "text-lg" : "text-xs"}>
                        {authorHandle}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className={isExportMode ? "text-lg" : "text-xs"}>
                        {currentSlide}h
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`font-black tracking-tighter text-white opacity-80 ${
                    isExportMode ? "text-3xl" : "text-lg"
                  }`}
                >
                  𝕏
                </div>
              </div>

              {/* Centro do Tweet */}
              <div
                className={`flex-1 flex flex-col justify-center text-left my-auto ${
                  isExportMode ? "py-8" : "py-5"
                }`}
              >
                <h2
                  className={`font-bold tracking-tight text-white leading-snug ${
                    isExportMode
                      ? activeAspectRatio === "4:5"
                        ? "text-[54px] mb-8"
                        : "text-[46px] mb-6"
                      : "text-xl sm:text-2xl md:text-3xl mb-4 line-clamp-3"
                  }`}
                >
                  {renderHighlightedText(cleanHeadline, resolvedAccentColor)}
                </h2>

                <p
                  className={`leading-relaxed text-zinc-300 font-normal whitespace-pre-line ${
                    isExportMode
                      ? "text-[28px] max-w-[95%]"
                      : "text-sm sm:text-base md:text-lg max-w-[95%] line-clamp-6"
                  }`}
                >
                  {renderHighlightedText(cleanBodyText, resolvedAccentColor)}
                </p>
              </div>

              {/* Rodapé do Tweet com Swipe Cue */}
              <div className="border-t border-white/[0.08] pt-4 space-y-3">
                <div
                  className={`flex items-center justify-between text-zinc-400 font-mono ${
                    isExportMode ? "text-lg" : "text-xs"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>💬</span>
                    <span>48</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔁</span>
                    <span>128</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>1.4k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔖</span>
                    <span>342</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📊</span>
                    <span>94k</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                  <span>🧵 Thread [{formattedSlide}/{formattedTotal}]</span>
                  <div className="flex items-center gap-1.5 text-white/40 uppercase tracking-widest text-[10px] select-none">
                    <span>Arraste</span>
                    <span className="inline-block animate-pulse">➔</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});
