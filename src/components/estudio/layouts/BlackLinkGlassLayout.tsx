import React from "react";
import { LayoutProps, BlackLinkStyleVariant } from "./layoutTypes";

/**
 * Template Antigravity — Black Link (1.0)
 * Pôster Editorial Suíço Brutalista (Inspirado nas coleções do Pinterest)
 *
 * 4 Variações Rítmicas de Feed:
 * 1. 3d-sculpture: Escultura 3D de Titânio & Vidro Líquido no centro com iluminação de estúdio
 * 2. swiss-box: Bounding Box técnica vetorial com handles de ancoragem e setinha ↗
 * 3. pure-monumental: Tipografia colossal pura sobre preto absoluto, peso e respiro suíço
 * 4. clean-ice: Invertido claro (Cinza Gelo acetinado com tipografia preto profundo para quebrar o grid)
 */
export function BlackLinkGlassLayout({
  slide,
  config,
  scale = 1.0,
  currentSlide = 1,
  totalSlides = 5,
}: LayoutProps) {
  const isCover = currentSlide === 1;
  const isCta = currentSlide === totalSlides && totalSlides > 1;

  // Determina a variação rítmica do post
  const variant: BlackLinkStyleVariant =
    slide.blackLinkVariant || config.blackLinkVariant || "3d-sculpture";

  // Conteúdo das Lâminas (Texto 100% íntegro)
  const rawHeadline = (slide.headline || "").trim();
  const rawBody = (slide.bodyText || "").trim();
  const rawTag = (slide.tag || (isCover ? "ESTRATÉGIA" : isCta ? "DIRETRIZ" : "TESE")).trim().toUpperCase();

  // Detecção de KPI / Métrica Numérica
  const kpiMatch =
    slide.kpiHighlight ||
    rawBody.match(/([+\-]?\d+[\d.,]*%|\d+[\d.,]*x|R\$\s*[\d.,]+[kKmMbB]?|\d+ms|\d+s)/);
  const detectedKpi = slide.kpiHighlight || (kpiMatch ? kpiMatch[0] : null);

  // Proporção de Tela
  const is916 = config.aspectRatio === "9:16";
  const is45 = config.aspectRatio === "4:5";

  // Imagem de Fundo de Estúdio 3D Oficial da Black Link
  const bgImageSrc = is916 ? "/brand/blacklink-bg-story.jpg" : "/brand/blacklink-bg-square.jpg";

  // Variação Clean Ice (Invertido Claro)
  const isCleanIce = variant === "clean-ice";

  // Dimensionamento Dinâmico em Resolução Nativa 1080px
  const headlineLen = rawHeadline.length;
  const headlineStyle = (() => {
    if (variant === "pure-monumental") {
      if (headlineLen <= 30) return { fontSize: is916 ? "76px" : "68px", lineHeight: "1.06" };
      if (headlineLen <= 55) return { fontSize: is916 ? "60px" : "54px", lineHeight: "1.10" };
      if (headlineLen <= 80) return { fontSize: is916 ? "48px" : "44px", lineHeight: "1.14" };
      return { fontSize: "38px", lineHeight: "1.18" };
    }
    if (is916) {
      if (headlineLen <= 35) return { fontSize: "62px", lineHeight: "1.10" };
      if (headlineLen <= 65) return { fontSize: "50px", lineHeight: "1.14" };
      if (headlineLen <= 95) return { fontSize: "42px", lineHeight: "1.18" };
      return { fontSize: "36px", lineHeight: "1.22" };
    }
    if (headlineLen <= 35) return { fontSize: "56px", lineHeight: "1.10" };
    if (headlineLen <= 65) return { fontSize: "46px", lineHeight: "1.14" };
    if (headlineLen <= 95) return { fontSize: "38px", lineHeight: "1.18" };
    return { fontSize: "32px", lineHeight: "1.22" };
  })();

  // Renderizador de Destaque
  const renderHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className={`font-black underline underline-offset-[12px] inline ${
              isCleanIce
                ? "text-black decoration-black/40"
                : "text-white decoration-white/50 drop-shadow-[0_0_24px_rgba(255,255,255,0.6)]"
            }`}
          >
            {clean}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none transition-colors duration-500 ${
        isCleanIce ? "bg-[#ececec] text-[#09090b]" : "bg-[#030305] text-white"
      }`}
    >
      {/* ================================================================== */}
      {/* 1. FUNDO ATMOSFÉRICO CONFORME A VARIAÇÃO                           */}
      {/* ================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Render 3D apenas na variação 3d-sculpture */}
        {variant === "3d-sculpture" && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
              style={{
                backgroundImage: `url('${bgImageSrc}')`,
                filter: "contrast(115%) brightness(55%) grayscale(100%)",
                transform: is916 ? "scale(1.05)" : "scale(1.03)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(3, 3, 5, 0.45) 0%, rgba(2, 2, 4, 0.85) 60%, rgba(1, 1, 2, 0.98) 100%)",
              }}
            />
          </>
        )}

        {/* Textura para a variação Clean Ice (Invertido Claro) */}
        {isCleanIce && (
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.8) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
        )}

        {/* Gradiente puro para as variações Pure Monumental e Swiss Box */}
        {(variant === "pure-monumental" || variant === "swiss-box") && !isCleanIce && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(20, 22, 30, 0.5) 0%, rgba(3, 3, 5, 0.95) 70%, rgba(1, 1, 2, 1) 100%)",
            }}
          />
        )}

        {/* Linhas Guias de Margem Imutável (80px) */}
        <div
          className={`absolute top-0 bottom-0 left-[80px] w-px ${
            isCleanIce ? "bg-black/[0.06]" : "bg-white/[0.04]"
          }`}
        />
        <div
          className={`absolute top-0 bottom-0 right-[80px] w-px ${
            isCleanIce ? "bg-black/[0.06]" : "bg-white/[0.04]"
          }`}
        />
      </div>

      {/* ================================================================== */}
      {/* 2. CABEÇALHO EDITORIAL SUÍÇO (DISCRETO E ELEGANTE)                 */}
      {/* ================================================================== */}
      <header
        className={`relative z-10 w-full px-[80px] flex items-center justify-between text-xs font-mono tracking-[0.25em] ${
          isCleanIce ? "text-zinc-600" : "text-zinc-400"
        } ${is916 ? "pt-24" : is45 ? "pt-16" : "pt-14"}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCleanIce ? "bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)]" : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            }`}
          />
          <span
            className={`font-bold uppercase tracking-[0.3em] ${
              isCleanIce ? "text-black" : "text-white"
            }`}
          >
            BLACK LINK
          </span>
        </div>

        <div className="font-bold tracking-widest">
          2026 // {String(currentSlide).padStart(2, "0")}
        </div>
      </header>

      {/* ================================================================== */}
      {/* 3. NÚCLEO EDITORIAL DA VARIAÇÃO SELECIONADA                       */}
      {/* ================================================================== */}
      <main
        className={`relative z-10 w-full px-[80px] my-auto flex flex-col justify-center items-center text-center ${
          is916 ? "py-16" : is45 ? "py-10" : "py-8"
        }`}
      >
        {/* VARIANTE 1: SWISS BOX (BOUNDING BOX COM HANDLES DE VETOR) */}
        {variant === "swiss-box" && (
          <div className="relative inline-block px-10 py-5 mb-8">
            <div
              className={`absolute inset-0 border ${
                isCleanIce
                  ? "border-black/40 bg-black/[0.03]"
                  : "border-white/35 backdrop-blur-[2px] bg-white/[0.02]"
              }`}
            />
            {/* 4 Handles de Âncora nos cantos */}
            <span
              className={`absolute -top-1 -left-1 w-2.5 h-2.5 ${
                isCleanIce ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${
                isCleanIce ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 ${
                isCleanIce ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 ${
                isCleanIce ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />

            <span
              className={`relative z-10 font-clash text-2xl md:text-3xl font-extrabold uppercase tracking-[0.2em] ${
                isCleanIce ? "text-black" : "text-white"
              }`}
            >
              {rawTag}
            </span>
          </div>
        )}

        {/* VARIANTE 2 & 3: TAG SUTIL EM CAPSULA */}
        {variant !== "swiss-box" && (
          <div className="mb-8">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-[0.25em] ${
                isCleanIce
                  ? "bg-black/10 text-black border border-black/20"
                  : "bg-white/[0.08] text-zinc-300 border border-white/20"
              }`}
            >
              // {rawTag}
            </span>
          </div>
        )}

        {/* TÍTULO PRINCIPAL MONUMENTAL (CLASH DISPLAY) */}
        <div className="max-w-[920px] w-full space-y-6">
          <h1
            className={`font-clash font-extrabold tracking-tight uppercase leading-[1.08] ${
              isCleanIce
                ? "text-black"
                : "text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
            }`}
            style={{
              fontSize: headlineStyle.fontSize,
              lineHeight: headlineStyle.lineHeight,
              letterSpacing: "-0.04em",
            }}
          >
            {renderHighlight(rawHeadline)}
          </h1>

          {/* Linha Divisória de Precisão */}
          <div
            className={`w-24 h-[1.5px] mx-auto my-6 ${
              isCleanIce ? "bg-black/30" : "bg-white/40"
            }`}
          />

          {/* TESE DIRETA / CORPO EM INTER */}
          {rawBody && (
            <p
              className={`font-inter font-normal max-w-2xl mx-auto leading-relaxed ${
                isCleanIce ? "text-zinc-700" : "text-zinc-300"
              }`}
              style={{
                fontSize: is916 ? "28px" : "24px",
                lineHeight: "1.65",
              }}
            >
              {renderHighlight(rawBody)}
            </p>
          )}

          {/* Métrica Quantitativa (Se existir dado numérico) */}
          {detectedKpi && (
            <div className="pt-4">
              <span
                className={`font-clash text-4xl md:text-5xl font-black tracking-tight ${
                  isCleanIce ? "text-black" : "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                }`}
              >
                {detectedKpi}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* ================================================================== */}
      {/* 4. RODAPÉ EDITORIAL SUÍÇO (A SETINHA DISCRETA ↗ DA REFERÊNCIA)     */}
      {/* ================================================================== */}
      <footer
        className={`relative z-10 w-full px-[80px] flex items-center justify-between text-xs font-mono ${
          isCleanIce ? "text-zinc-600" : "text-zinc-400"
        } ${is916 ? "pb-24" : is45 ? "pb-16" : "pb-14"}`}
      >
        <div
          className={`tracking-[0.25em] uppercase font-bold ${
            isCleanIce ? "text-black" : "text-zinc-300"
          }`}
        >
          DIRETRIZ DE ELITE
        </div>

        {/* A Setinha Diagonal Minimalista Suíça do Pinterest */}
        <div
          className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg font-bold transition-all ${
            isCleanIce
              ? "border-black/30 text-black hover:bg-black hover:text-white"
              : "border-white/20 text-white hover:bg-white hover:text-black"
          }`}
        >
          ↗
        </div>
      </footer>
    </div>
  );
}
