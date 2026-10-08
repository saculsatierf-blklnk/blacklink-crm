import React from "react";
import { LayoutProps } from "./layoutTypes";

/**
 * Template Antigravity — Black Link (1.0)
 * Pôster Editorial Suíço Brutalista (Inspirado no Pinterest / High-Fashion Tech)
 *
 * Características:
 * - Escultura 3D Monocromática de Estúdio (Titânio e Vidro Líquido no fundo com profundidade de campo)
 * - Bounding Box Técnica de Design com pontos de ancoragem nos cantos e centro
 * - Tipografia Soberana em Clash Display (Kerning -0.04em)
 * - Micro-detalhes suíços: Metadados discretos nos cantos (BLACK LINK // 2026) e setinha diagonal ↗
 * - Zero ruído, zero firulas de aplicativo, 100% elegância editorial
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

  // Conteúdo (100% íntegro)
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

  // Dimensionamento Dinâmico em 1080px Nativo
  const headlineLen = rawHeadline.length;
  const headlineStyle = (() => {
    if (is916) {
      if (headlineLen <= 35) return { fontSize: "62px", lineHeight: "1.10" };
      if (headlineLen <= 65) return { fontSize: "50px", lineHeight: "1.14" };
      if (headlineLen <= 95) return { fontSize: "42px", lineHeight: "1.18" };
      return { fontSize: "36px", lineHeight: "1.22" };
    }
    if (headlineLen <= 35) return { fontSize: "58px", lineHeight: "1.10" };
    if (headlineLen <= 65) return { fontSize: "48px", lineHeight: "1.14" };
    if (headlineLen <= 95) return { fontSize: "40px", lineHeight: "1.18" };
    return { fontSize: "34px", lineHeight: "1.22" };
  })();

  // Renderizador de Destaque Monocromático (0% saturação)
  const renderMonoHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className="text-white font-black underline decoration-white/50 underline-offset-[12px] drop-shadow-[0_0_24px_rgba(255,255,255,0.6)] inline"
          >
            {clean}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-[#030305] text-white">
      {/* ================================================================== */}
      {/* 1. FUNDO MONOCROMÁTICO COM ESCULTURA 3D DE ESTÚDIO (0% SATURAÇÃO) */}
      {/* ================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Render 3D de Estúdio com Escultura de Vidro Líquido e Titânio */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url('${bgImageSrc}')`,
            filter: "contrast(110%) brightness(55%) grayscale(100%)",
            transform: is916 ? "scale(1.05)" : "scale(1.03)",
          }}
        />

        {/* Vinheta Cinematográfica de Profundidade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(3, 3, 5, 0.4) 0%, rgba(2, 2, 4, 0.82) 60%, rgba(1, 1, 2, 0.98) 100%)",
          }}
        />

        {/* Linhas Guias de Margem Imutável (80px) */}
        <div className="absolute top-0 bottom-0 left-[80px] w-px bg-white/[0.04]" />
        <div className="absolute top-0 bottom-0 right-[80px] w-px bg-white/[0.04]" />
      </div>

      {/* ================================================================== */}
      {/* 2. CABEÇALHO EDITORIAL SUÍÇO (DISCRETO E ELEGANTE)                 */}
      {/* ================================================================== */}
      <header className={`relative z-10 w-full px-[80px] flex items-center justify-between text-xs font-mono tracking-[0.25em] text-zinc-400 ${is916 ? "pt-24" : is45 ? "pt-16" : "pt-14"}`}>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
          <span className="font-bold text-white uppercase tracking-[0.3em]">
            BLACK LINK
          </span>
        </div>

        <div className="font-bold tracking-widest text-zinc-400">
          2026 // {String(currentSlide).padStart(2, "0")}
        </div>
      </header>

      {/* ================================================================== */}
      {/* 3. NÚCLEO EDITORIAL (A BOUNDING BOX SUÍÇA + TIPOGRAFIA MONUMENTAL) */}
      {/* ================================================================== */}
      <main className={`relative z-10 w-full px-[80px] my-auto flex flex-col justify-center items-center text-center ${is916 ? "py-16" : is45 ? "py-10" : "py-8"}`}>
        
        {/* A BOUNDING BOX DE DESIGN SUÍÇO COM PONTOS DE ANCORAGEM (REFERÊNCIA PINTEREST) */}
        <div className="relative inline-block px-10 py-5 mb-8">
          {/* Borda Fina da Bounding Box */}
          <div className="absolute inset-0 border border-white/35 backdrop-blur-[2px] bg-white/[0.02]" />

          {/* Pontos de Ancoragem (Vetor Handles) nos 4 Cantos e Meios */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-black shadow-sm" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-black shadow-sm" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-black shadow-sm" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-black shadow-sm" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white/70" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white/70" />

          {/* Tag de Impacto Central */}
          <span className="relative z-10 font-clash text-2xl md:text-3xl font-extrabold uppercase tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {rawTag}
          </span>
        </div>

        {/* TÍTULO PRINCIPAL MONUMENTAL (HEADLINE EM CLASH DISPLAY) */}
        <div className="max-w-[920px] w-full space-y-6">
          <h1
            className="font-clash font-extrabold text-white tracking-tight uppercase leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
            style={{
              fontSize: headlineStyle.fontSize,
              lineHeight: headlineStyle.lineHeight,
              letterSpacing: "-0.04em",
            }}
          >
            {renderMonoHighlight(rawHeadline)}
          </h1>

          {/* Linha Divisória de Precisão */}
          <div className="w-24 h-[1.5px] bg-white/40 mx-auto my-6" />

          {/* TESE DIRETA / CORPO EM INTER (SEM ENROLAÇÃO) */}
          {rawBody && (
            <p
              className="font-inter font-normal text-zinc-300 max-w-2xl mx-auto leading-relaxed"
              style={{
                fontSize: is916 ? "28px" : "24px",
                lineHeight: "1.65",
              }}
            >
              {renderMonoHighlight(rawBody)}
            </p>
          )}

          {/* Bloco de Métrica Quantitativa (Se existir dado numérico) */}
          {detectedKpi && (
            <div className="pt-4">
              <span className="font-clash text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                {detectedKpi}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* ================================================================== */}
      {/* 4. RODAPÉ EDITORIAL SUÍÇO (A SETINHA DISCRETA ↗ DA REFERÊNCIA)     */}
      {/* ================================================================== */}
      <footer className={`relative z-10 w-full px-[80px] flex items-center justify-between text-xs font-mono text-zinc-400 ${is916 ? "pb-24" : is45 ? "pb-16" : "pb-14"}`}>
        <div className="tracking-[0.25em] uppercase font-bold text-zinc-300">
          DIRETRIZ DE ELITE
        </div>

        {/* A Setinha Diagonal Minimalista Suíça do Pinterest */}
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white text-lg font-bold hover:bg-white hover:text-black transition-all">
          ↗
        </div>
      </footer>
    </div>
  );
}
