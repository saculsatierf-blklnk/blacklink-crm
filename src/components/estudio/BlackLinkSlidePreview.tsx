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
 * Renderizador Oficial Black Link (Padrão Ouro & Canva-Killer Engine)
 * Canvas visual brutalista, minimalista e tweet B2B de alta fidelidade.
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

  const cleanHeadline =
    headline?.trim() || "Como Dominar Contas Enterprise sem Perder Margem";
  const cleanBodyText =
    bodyText?.trim() ||
    "A maioria das operações corporativas trava por falta de clareza nos gargalos de esteira. Quando alinhamos inteligência de dados e blindagem de território, o ciclo médio cai pela metade.";

  // Configuração ativa de layout e estilo
  const activeLayout: SlideLayout = designConfig?.layout || "brutalista";
  const activeFont: SlideFont = designConfig?.font || "space-grotesk";
  const activeAspectRatio: AspectRatio = designConfig?.aspectRatio || "1:1";
  const customBgColor = designConfig?.bgColor;
  const customAccentColor = designConfig?.accentColor || "";
  const authorName = designConfig?.authorName || "Black Link CRM";
  const authorHandle = designConfig?.authorHandle || "@blacklinkcrm";
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
      {/* ESTRUTURA 1: LAYOUT BRUTALISTA (ALINHADO À ESQUERDA, PADRÃO OURO) */}
      {/* ========================================================= */}
      {activeLayout === "brutalista" && (
        <div
          className={`flex flex-col justify-between h-full relative z-10 ${
            isExportMode ? (activeAspectRatio === "4:5" ? "p-24" : "p-20") : "p-8 sm:p-10 lg:p-12"
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
      )}

      {/* ========================================================= */}
      {/* ESTRUTURA 2: LAYOUT MINIMALISTA (CENTRALIZADO, RESPIRO MASSIVO) */}
      {/* ========================================================= */}
      {activeLayout === "minimal" && (
        <div
          className={`flex flex-col justify-between items-center text-center h-full relative z-10 ${
            isExportMode ? (activeAspectRatio === "4:5" ? "p-28" : "p-24") : "p-10 sm:p-12 lg:p-14"
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

          {/* Rodapé (Footer Minimal) */}
          <div className="flex flex-col items-center gap-1.5 pt-4">
            <span
              className={`font-sans tracking-widest uppercase font-medium ${
                isExportMode ? "text-xs" : "text-[9px]"
              } ${themeStyles.footerSubtle}`}
            >
              {currentSlide < totalSlides ? "Deslize para continuar •" : "Conclusão •"}
            </span>
            <span
              className={`font-mono text-[9px] ${themeStyles.footerText} opacity-60`}
            >
              Black Link Editorial
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ESTRUTURA 3: LAYOUT THREAD / TWEET (SIMULAÇÃO VIRAL DO X) */}
      {/* ========================================================= */}
      {activeLayout === "tweet" && (
        <div
          className={`flex flex-col justify-between h-full relative z-10 ${
            isExportMode ? (activeAspectRatio === "4:5" ? "p-24" : "p-20") : "p-8 sm:p-10 lg:p-12"
          }`}
        >
          {/* Header do Tweet (Avatar + Nome + @Handle + Verificado + Ícone X) */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-3.5 sm:gap-4">
              {/* Avatar Arredondado */}
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

              {/* Nome e Handle */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold tracking-tight text-white leading-tight ${
                      isExportMode ? "text-2xl" : "text-sm sm:text-base"
                    }`}
                  >
                    {authorName}
                  </span>
                  {/* Badge Verificado SVG */}
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

            {/* Ícone Minimalista da Plataforma Social */}
            <div
              className={`font-black tracking-tighter text-white opacity-80 ${
                isExportMode ? "text-3xl" : "text-lg"
              }`}
            >
              𝕏
            </div>
          </div>

          {/* Centro do Tweet: Headline em destaque + Body explicativo */}
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

          {/* Rodapé do Tweet: Barra de Métricas & Indicador de Fio */}
          <div className="border-t border-white/[0.08] pt-4 space-y-3">
            <div
              className={`flex items-center justify-between text-zinc-400 font-mono ${
                isExportMode ? "text-lg" : "text-xs"
              }`}
            >
              <div className="flex items-center gap-1 hover:text-white transition-colors">
                <span>💬</span>
                <span>48</span>
              </div>
              <div className="flex items-center gap-1 hover:text-white transition-colors">
                <span>🔁</span>
                <span>128</span>
              </div>
              <div className="flex items-center gap-1 hover:text-rose-400 transition-colors">
                <span>❤️</span>
                <span>1.4k</span>
              </div>
              <div className="flex items-center gap-1 hover:text-white transition-colors">
                <span>🔖</span>
                <span>342</span>
              </div>
              <div className="flex items-center gap-1 hover:text-white transition-colors">
                <span>📊</span>
                <span>94k</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
              <span>🧵 Thread [{formattedSlide}/{formattedTotal}]</span>
              <span>{currentSlide < totalSlides ? "Arraste para continuar →" : "Fim da Thread"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
