"use client";

import React, { forwardRef } from "react";

export type SlideTheme = "dark-industrial" | "light-minimal" | "neon-accent";

interface BlackLinkSlidePreviewProps {
  headline: string;
  bodyText: string;
  currentSlide?: number;
  totalSlides?: number;
  theme?: SlideTheme | string;
  isExportMode?: boolean;
  className?: string;
  id?: string;
}

/**
 * Renderizador Hardcoded Oficial Black Link (Padrão Ouro)
 * Canvas visual 1:1 brutalista e de alta densidade B2B com suporte ao Motor de Temas.
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
    isExportMode = false,
    className = "",
    id,
  },
  ref
) {
  const formattedSlide = String(currentSlide).padStart(2, "0");
  const formattedTotal = String(totalSlides).padStart(2, "0");

  const cleanHeadline =
    headline?.trim() || "Como Dominar Contas Enterprise sem Perder Margem";
  const cleanBodyText =
    bodyText?.trim() ||
    "A maioria das operações corporativas trava por falta de clareza nos gargalos de esteira. Quando alinhamos inteligência de dados e blindagem de território, o ciclo médio cai pela metade.";

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
    },
  }[activeTheme];

  return (
    <div
      ref={ref}
      id={id}
      className={`relative select-none overflow-hidden transition-colors ${
        isExportMode
          ? "w-[1080px] h-[1080px] min-w-[1080px] min-h-[1080px] rounded-none border-0"
          : "aspect-square w-full rounded-3xl border shadow-2xl"
      } ${themeStyles.container} ${className}`}
    >
      {/* Linha sutil de refração superior */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${themeStyles.topGlow} to-transparent pointer-events-none`}
      />

      {/* Grid e Padding Interno Brutalista */}
      <div
        className={`flex flex-col justify-between h-full relative z-10 ${
          isExportMode ? "p-20" : "p-8 sm:p-10 lg:p-12"
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
            className={`font-semibold tracking-tighter leading-[1.1] ${
              isExportMode
                ? "text-[64px] mb-8"
                : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 line-clamp-4"
            } ${themeStyles.headline}`}
          >
            {cleanHeadline}
          </h2>

          <p
            className={`leading-relaxed font-normal ${
              isExportMode
                ? "text-[28px] max-w-[90%]"
                : "text-base sm:text-lg lg:text-xl max-w-[90%] line-clamp-6"
            } ${themeStyles.body}`}
          >
            {cleanBodyText}
          </p>
        </div>

        {/* Rodapé (Footer) */}
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

          <span
            className={`font-mono uppercase tracking-widest ${
              isExportMode ? "text-sm" : "text-[10px]"
            } ${themeStyles.footerSubtle}`}
          >
            {currentSlide < totalSlides ? "Arraste →" : "Fim do Conteúdo"}
          </span>
        </div>
      </div>
    </div>
  );
});
