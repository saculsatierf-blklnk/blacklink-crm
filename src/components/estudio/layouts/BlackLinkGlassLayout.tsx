import React from "react";
import { LayoutProps } from "./layoutTypes";

/**
 * Template Antigravity — Black Link (1.0)
 * Padrão Oficial e Limites Absolutos do Design System Black Link
 *
 * ESPECIFICAÇÕES TÉCNICAS E LIMITES ABSOLUTOS (HARD LIMITS):
 * 1. Título: Máximo 65 caracteres (Clash Display)
 * 2. Corpo: Máximo 140 caracteres por cartão/bloco (Inter)
 * 3. Margens Imutáveis: 80px Esquerda / Direita (Safe-zone inegociável)
 * 4. Regra de Cor: 0% cores saturadas (Estritamente Monocromático: Preto, Branco, Cinza)
 * 5. Fotografia/Fundo: Padrão Zoom-in Extremo Macro (Texturas cruas: metal fosco, vidro jateado, titânio escovado)
 * 6. Famílias de Fontes: Clash Display (títulos/KPIs) + Inter (corpo/legendas/rótulos)
 * 7. Z-Index Rigoroso:
 *    - Z-0: Fundo Base Monocromático
 *    - Z-10: Overlay Estrutural (Grade técnica e marcadores de 80px)
 *    - Z-20: Cartões de Vidro (Glassmorphism 4K hiper-realista e tátil)
 *    - Z-30: Núcleo de Texto & Dados
 */
export function BlackLinkGlassLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  // Hard Limits Aplicados Rigorosamente
  const rawHeadline = (slide.headline || "").trim();
  const safeHeadline =
    rawHeadline.length > 65 ? `${rawHeadline.slice(0, 62)}...` : rawHeadline;

  const rawBody = (slide.bodyText || "").trim();
  const safeBody =
    rawBody.length > 140 ? `${rawBody.slice(0, 137)}...` : rawBody;

  const rawTag = (slide.tag || "DIRETRIZ ESTRATÉGICA").trim().toUpperCase();
  const authorName = (config.authorName || "Black Link").trim().toUpperCase();
  const authorHandle = (config.authorHandle || "@blacklink.b2b").trim().toLowerCase();

  // Detecta se há número ou KPI de destaque
  const kpiMatch =
    slide.kpiHighlight ||
    safeBody.match(/([+\-]?\d+[\d.,]*%|\d+[\d.,]*x|R\$\s*[\d.,]+[kKmMbB]?|\d+ms|\d+s)/);
  const detectedKpi = slide.kpiHighlight || (kpiMatch ? kpiMatch[0] : null);

  // Renderizador de Destaque Estritamente Monocromático (0% saturação)
  const renderMonoHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className="text-white font-extrabold drop-shadow-[0_0_12px_rgba(255,255,255,0.45)] underline decoration-white/30 underline-offset-4 inline"
          >
            {clean}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-[#030304] text-white">
      {/* ================================================================== */}
      {/* CAMADA 1 (Z-0): FUNDO BASE MONOCROMÁTICO (EXTREMO MACRO TÁTIL)     */}
      {/* ================================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Luz difusa zenital fria (0% saturação) */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(130% 90% at 50% -15%, rgba(255,255,255,0.12) 0%, rgba(24,24,27,0.45) 45%, rgba(3,3,4,1) 95%)",
          }}
        />

        {/* Micro-feixe de contraluz inferior */}
        <div
          className="absolute -bottom-24 inset-x-12 h-64 blur-[90px] opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Textura de micro-grão SVG de alta densidade (Sensação física tátil de titânio jateado) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-screen pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="macroNoiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#macroNoiseFilter)" />
        </svg>
      </div>

      {/* ================================================================== */}
      {/* CAMADA 2 (Z-10): OVERLAY ESTRUTURAL & GUIAS DE 80PX               */}
      {/* ================================================================== */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Linhas Guias Verticais de 80px (Limite Absoluto de Margem) */}
        <div className="absolute top-0 bottom-0 left-[80px] w-px bg-white/[0.06]" />
        <div className="absolute top-0 bottom-0 right-[80px] w-px bg-white/[0.06]" />

        {/* Marcadores de Coordenada Técnica nos 4 Cantos (Mira +) */}
        <div className="absolute top-6 left-[80px] -translate-x-1/2 flex items-center gap-1 text-[9px] font-mono text-zinc-600 font-bold tracking-widest">
          <span>+</span>
          <span className="opacity-70">00.80PX / L</span>
        </div>
        <div className="absolute top-6 right-[80px] translate-x-1/2 flex items-center gap-1 text-[9px] font-mono text-zinc-600 font-bold tracking-widest">
          <span className="opacity-70">00.80PX / R</span>
          <span>+</span>
        </div>
        <div className="absolute bottom-6 left-[80px] -translate-x-1/2 flex items-center gap-1 text-[9px] font-mono text-zinc-600 font-bold tracking-widest">
          <span>+</span>
          <span className="opacity-70">ORIGIN / 0.0</span>
        </div>
        <div className="absolute bottom-6 right-[80px] translate-x-1/2 flex items-center gap-1 text-[9px] font-mono text-zinc-600 font-bold tracking-widest">
          <span className="opacity-70">4K / MASTER</span>
          <span>+</span>
        </div>

        {/* Grade Milimétrica Translúcida Superior */}
        <div className="absolute top-0 inset-x-[80px] h-3 border-b border-white/[0.08] flex justify-between items-center opacity-40">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="w-px h-1.5 bg-white/30" />
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* CAMADA 3 & 4 (Z-20 & Z-30): CARTÕES DE VIDRO E NÚCLEO DE TEXTO     */}
      {/* MARGENS IMUTÁVEIS RIGOROSAS: px-[80px]                             */}
      {/* ================================================================== */}
      <div className="relative z-30 flex flex-col justify-between h-full px-[80px] py-10 md:py-12">
        {/* CABEÇALHO TÉCNICO ESTRUTURAL */}
        <header className="flex items-center justify-between border-b border-white/[0.12] pb-4">
          <div className="flex items-center gap-3">
            {/* Tag Monocromática em Cápsula de Vidro */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-300 uppercase">
                {rawTag}
              </span>
            </div>

            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
              ANTIGRAVITY // SPEC 1.0
            </span>
          </div>

          <div className="flex items-center gap-2 text-right">
            <span className="text-[10px] font-mono font-extrabold text-white tracking-widest">
              BLACK LINK
            </span>
            <span className="text-[10px] font-mono text-zinc-600">•</span>
            <span className="text-[9px] font-mono text-zinc-400">4K GLASS</span>
          </div>
        </header>

        {/* NÚCLEO CENTRAL: TÍTULO MONOLÍTICO + CARTÃO DE VIDRO HIPER-REALISTA */}
        <main className="my-auto space-y-7 md:space-y-8">
          {/* TÍTULO PRINCIPAL: MÁXIMO 65 CARACTERES (CLASH DISPLAY) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>NÚCLEO DE TESE // HIERARQUIA 01</span>
              <span>{safeHeadline.length}/65 CARACTERES</span>
            </div>

            <h1
              className="font-clash font-extrabold text-white tracking-tight leading-[1.08] text-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
              style={{
                fontSize: `clamp(2.1rem, calc(2.85rem * ${scale}), 4.6rem)`,
                letterSpacing: "-0.035em",
              }}
            >
              {renderMonoHighlight(safeHeadline)}
            </h1>
          </div>

          {/* CARTÃO DE VIDRO FLUTUANTE 4K (GLASSMORPHISM HIPER-REALISTA & TÁTIL) */}
          <div
            className="relative rounded-[2rem] md:rounded-[2.5rem] border border-white/20 backdrop-blur-[45px] md:backdrop-blur-[65px] overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: "rgba(18, 18, 22, 0.68)",
              boxShadow:
                "0 45px 90px -20px rgba(0, 0, 0, 0.95), 0 20px 40px -10px rgba(0, 0, 0, 0.85), inset 0 1.5px 0.5px rgba(255, 255, 255, 0.40), inset 0 -1px 0 rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Chanfro de reflexo especular no topo do vidro (Refração tátil 4K) */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {/* Reflexo diagonal sutil de luz sobre o vidro lapidado */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.02) 40%, transparent 80%)",
              }}
            />

            <div className="relative z-10 p-7 md:p-9 space-y-4 text-left">
              {/* Header do Cartão de Vidro */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-[10px] font-mono text-zinc-400">
                <span className="uppercase tracking-widest flex items-center gap-1.5 text-zinc-300 font-bold">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  CORPO DE ANÁLISE // DADOS
                </span>
                <span className="text-zinc-500 font-mono text-[9px]">
                  {safeBody.length}/140 CARACTERES
                </span>
              </div>

              {/* Layout com KPI / Número Colossal (se identificado) */}
              {detectedKpi ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                  <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4">
                    <span className="font-clash font-extrabold text-white text-3xl md:text-4xl tracking-tighter block drop-shadow-md">
                      {detectedKpi}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block mt-0.5">
                      TELEMETRIA
                    </span>
                  </div>

                  {/* Corpo de Texto em Inter (Máx 140 Caracteres) */}
                  <div className="md:col-span-2">
                    <p
                      className="font-inter font-normal text-zinc-200 leading-relaxed text-left"
                      style={{
                        fontSize: `clamp(1.05rem, calc(1.22rem * ${scale}), 1.85rem)`,
                        lineHeight: 1.55,
                      }}
                    >
                      {renderMonoHighlight(safeBody)}
                    </p>
                  </div>
                </div>
              ) : (
                /* Corpo de Texto Completo em Inter (Máx 140 Caracteres) */
                <p
                  className="font-inter font-normal text-zinc-200 leading-relaxed text-left"
                  style={{
                    fontSize: `clamp(1.1rem, calc(1.28rem * ${scale}), 1.95rem)`,
                    lineHeight: 1.6,
                  }}
                >
                  {renderMonoHighlight(safeBody)}
                </p>
              )}

              {/* Rodapé Interno do Cartão de Vidro */}
              <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span className="tracking-widest">TRANSLUCÊNCIA: 68% // FOSFATO</span>
                <span className="tracking-widest text-zinc-400">HARD LIMIT: 140 CHR OK</span>
              </div>
            </div>
          </div>
        </main>

        {/* RODAPÉ ESTRUTURAL DA MARCA (MARGIN 80PX IMUTÁVEL) */}
        <footer className="flex items-center justify-between border-t border-white/[0.12] pt-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-clash font-bold text-white text-xs tracking-wider">
              {authorName}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400 text-[11px] font-inter">
              {authorHandle}
            </span>
          </div>

          <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono">
            <span className="text-zinc-400 font-bold uppercase tracking-widest">
              [ ANTIGRAVITY 1.0 ]
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </footer>
      </div>
    </div>
  );
}
