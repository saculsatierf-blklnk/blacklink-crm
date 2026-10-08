import React from "react";
import { LayoutProps } from "./layoutTypes";

/**
 * Função inteligente de clamp que respeita limites de palavras (evita cortar "tem r...")
 */
function smartClamp(text: string, max: number): string {
  const clean = (text || "").trim();
  if (clean.length <= max) return clean;
  const sub = clean.slice(0, max);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > Math.floor(max * 0.65)) {
    return sub.slice(0, lastSpace).trim() + "...";
  }
  return sub.trim() + "...";
}

/**
 * Template Antigravity — Black Link (1.0)
 * Glassmorphism Hiper-Realista 4K • Estritamente Monocromático • Safe-Zone 80px
 *
 * Arquitetura de Design 4K:
 * - Camada 1: Deep Void (#030305) com luz zenital difusa e micro-grão SVG tátil
 * - Camada 2: Margem imutável de 80px (px-20) com grid técnico translúcido
 * - Camada 3: Cartões de vidro multicamada com chanfro duplo especular e profundidade 3D
 * - Camada 4: Tipografia Clash Display (títulos/KPIs) + Inter (dados/corpo)
 * - Variações inteligentes: Capa (Slide 1), Conteúdo (Slides 2..N-1) e CTA Final (Slide N)
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

  // Aplicação Inteligente dos Hard Limits com Respeito a Limites de Palavras
  const rawHeadline = (slide.headline || "").trim();
  const safeHeadline = smartClamp(rawHeadline, 65);

  const rawBody = (slide.bodyText || "").trim();
  const safeBody = smartClamp(rawBody, 140);

  const rawTag = (slide.tag || (isCover ? "MARCO ZERO" : isCta ? "SÍNTESE & CTA" : "ANÁLISE ESTRATÉGICA"))
    .trim()
    .toUpperCase();

  const authorName = (config.authorName || "Black Link").trim();
  const authorHandle = (config.authorHandle || "@blacklink.com.br").trim().toLowerCase();

  // Detecta número ou KPI de destaque
  const kpiMatch =
    slide.kpiHighlight ||
    safeBody.match(/([+\-]?\d+[\d.,]*%|\d+[\d.,]*x|R\$\s*[\d.,]+[kKmMbB]?|\d+ms|\d+s)/);
  const detectedKpi = slide.kpiHighlight || (kpiMatch ? kpiMatch[0] : null);

  // Aspect Ratio Handling
  const is916 = config.aspectRatio === "9:16";
  const is45 = config.aspectRatio === "4:5";
  const verticalPaddingClass = is916 ? "py-28" : is45 ? "py-16" : "py-12";

  // Dimensionamento Dinâmico de Tipografia para Clash Display
  const headlineLength = safeHeadline.length;
  const getHeadlineFontSize = () => {
    if (isCover) {
      if (headlineLength <= 35) return `clamp(2.7rem, calc(3.4rem * ${scale}), 5.2rem)`;
      if (headlineLength <= 50) return `clamp(2.3rem, calc(2.9rem * ${scale}), 4.4rem)`;
      return `clamp(2.0rem, calc(2.5rem * ${scale}), 3.8rem)`;
    }
    if (headlineLength <= 40) return `clamp(2.2rem, calc(2.8rem * ${scale}), 4.2rem)`;
    return `clamp(1.9rem, calc(2.4rem * ${scale}), 3.6rem)`;
  };

  // Renderizador de Destaque Monocromático de Alta Fidelidade (0% saturação)
  const renderMonoHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className="text-white font-extrabold underline decoration-white/40 underline-offset-8 drop-shadow-[0_0_24px_rgba(255,255,255,0.45)] inline"
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
      {/* CAMADA 1: FUNDO MACRO TÁTIL DE ALTA DENSIDADE (0% SATURAÇÃO)       */}
      {/* ================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Luz difusa zenital fria no topo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 90% at 50% -10%, rgba(255,255,255,0.16) 0%, rgba(30,30,36,0.50) 40%, rgba(3,3,5,1) 90%)",
          }}
        />

        {/* Glow suave no centro inferior para profundidade tridimensional */}
        <div
          className="absolute -bottom-32 inset-x-8 h-80 blur-[120px] opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Textura de micro-grão SVG de alta densidade (sensação física de titânio fosco) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.038] mix-blend-screen pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="blacklinkNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#blacklinkNoise)" />
        </svg>

        {/* Linhas guias verticais sutis de 80px (Safe-Zone Imutável) */}
        <div className="absolute top-0 bottom-0 left-[80px] w-px bg-white/[0.04]" />
        <div className="absolute top-0 bottom-0 right-[80px] w-px bg-white/[0.04]" />
      </div>

      {/* ================================================================== */}
      {/* CONTEÚDO PRINCIPAL (COM MARGEM IMUTÁVEL DE 80PX: px-20)           */}
      {/* ================================================================== */}
      <div className={`relative z-10 flex flex-col justify-between h-full px-20 ${verticalPaddingClass}`}>
        
        {/* ================================================================ */}
        {/* CABEÇALHO DO TEMPLATE: Progresso + Identificação da Marca        */}
        {/* ================================================================ */}
        <header className="space-y-4">
          {/* Barra de Progresso Segmentada Minimalista */}
          <div className="flex items-center gap-2 w-full">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isPassed = idx + 1 <= currentSlide;
              return (
                <div
                  key={idx}
                  className="h-1.5 rounded-full flex-1 transition-all duration-300"
                  style={{
                    backgroundColor: isPassed ? "#ffffff" : "rgba(255, 255, 255, 0.15)",
                    boxShadow: isPassed ? "0 0 10px rgba(255, 255, 255, 0.6)" : "none",
                  }}
                />
              );
            })}
          </div>

          {/* Linha de Metadados e Marca */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              {/* Tag Badge Monocromática em Cápsula de Vidro */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/20 backdrop-blur-xl shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-200 uppercase">
                  {rawTag}
                </span>
              </div>

              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                {isCover ? "EDIÇÃO 01" : `LÂMINA ${String(currentSlide).padStart(2, "0")}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-extrabold tracking-widest text-white">
                BLACK LINK
              </span>
              <span className="text-zinc-600 font-mono text-xs">•</span>
              <span className="text-[10px] font-mono text-zinc-400">
                {String(currentSlide).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
              </span>
            </div>
          </div>
        </header>

        {/* ================================================================ */}
        {/* NÚCLEO CENTRAL DO SLIDE (VARIAÇÃO BASEADA NA FUNÇÃO DA LÂMINA)    */}
        {/* ================================================================ */}
        <main className="my-auto space-y-7 md:space-y-9">
          
          {/* -------------------------------------------------------------- */}
          {/* CENÁRIO 1: LÂMINA 01 — CAPA / GANCHO MONOLÍTICO               */}
          {/* -------------------------------------------------------------- */}
          {isCover && (
            <div className="space-y-6 md:space-y-8">
              {/* Título Monumental da Capa em Clash Display */}
              <h1
                className="font-clash font-extrabold text-white tracking-tight leading-[1.08] text-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                style={{
                  fontSize: getHeadlineFontSize(),
                  letterSpacing: "-0.03em",
                }}
              >
                {renderMonoHighlight(safeHeadline)}
              </h1>

              {/* Cartão de Vidro Flutuante com Síntese da Tese */}
              {safeBody && (
                <div
                  className="relative rounded-[2rem] border border-white/20 backdrop-blur-3xl overflow-hidden p-7 md:p-8 space-y-3 text-left transition-all"
                  style={{
                    backgroundColor: "rgba(18, 18, 24, 0.65)",
                    boxShadow:
                      "0 35px 70px -15px rgba(0, 0, 0, 0.9), inset 0 1.5px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(255, 255, 255, 0.06)",
                  }}
                >
                  {/* Chanfro de reflexo especular no topo */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span>SÍNTESE DA TESE ESTRATÉGICA</span>
                  </div>

                  <p
                    className="font-inter font-normal text-zinc-200 leading-relaxed text-left"
                    style={{
                      fontSize: `clamp(1.1rem, calc(1.3rem * ${scale}), 1.8rem)`,
                      lineHeight: 1.6,
                    }}
                  >
                    {renderMonoHighlight(safeBody)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* CENÁRIO 2: LÂMINAS INTERMEDIÁRIAS (CONTEÚDO / FRAMEWORK)       */}
          {/* -------------------------------------------------------------- */}
          {!isCover && !isCta && (
            <div className="space-y-6 md:space-y-8">
              {/* Título de Análise em Clash Display */}
              <h2
                className="font-clash font-extrabold text-white tracking-tight leading-[1.12] text-left drop-shadow-[0_3px_18px_rgba(0,0,0,0.9)]"
                style={{
                  fontSize: getHeadlineFontSize(),
                  letterSpacing: "-0.025em",
                }}
              >
                {renderMonoHighlight(safeHeadline)}
              </h2>

              {/* Cartão de Vidro Flutuante 4K */}
              <div
                className="relative rounded-[2rem] border border-white/20 backdrop-blur-3xl overflow-hidden p-8 md:p-9 space-y-5 text-left"
                style={{
                  backgroundColor: "rgba(18, 18, 24, 0.70)",
                  boxShadow:
                    "0 40px 80px -20px rgba(0, 0, 0, 0.95), inset 0 1.5px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(255, 255, 255, 0.06)",
                }}
              >
                {/* Chanfro de reflexo especular no topo */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                {/* Se houver KPI / Métrica de Destaque */}
                {detectedKpi ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-5 space-y-1">
                      <span className="font-clash font-extrabold text-white text-4xl sm:text-5xl tracking-tighter block drop-shadow-md">
                        {detectedKpi}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 block">
                        TELEMETRIA / IMPACTO
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <p
                        className="font-inter font-normal text-zinc-200 leading-relaxed text-left"
                        style={{
                          fontSize: `clamp(1.1rem, calc(1.3rem * ${scale}), 1.85rem)`,
                          lineHeight: 1.6,
                        }}
                      >
                        {renderMonoHighlight(safeBody)}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Corpo de Texto Limpo em Inter */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span>DIRETRIZ DE EXECUÇÃO // ANÁLISE TÉCNICA</span>
                    </div>

                    <p
                      className="font-inter font-normal text-zinc-200 leading-relaxed text-left"
                      style={{
                        fontSize: `clamp(1.15rem, calc(1.35rem * ${scale}), 1.95rem)`,
                        lineHeight: 1.65,
                      }}
                    >
                      {renderMonoHighlight(safeBody)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* CENÁRIO 3: LÂMINA FINAL — CALL TO ACTION & CONVERSÃO           */}
          {/* -------------------------------------------------------------- */}
          {isCta && (
            <div className="space-y-6 md:space-y-8">
              {/* Título de Fechamento */}
              <h2
                className="font-clash font-extrabold text-white tracking-tight leading-[1.12] text-left drop-shadow-[0_3px_18px_rgba(0,0,0,0.9)]"
                style={{
                  fontSize: getHeadlineFontSize(),
                  letterSpacing: "-0.025em",
                }}
              >
                {renderMonoHighlight(safeHeadline)}
              </h2>

              {/* Cartão de Fechamento com Ações em Estilo Apple */}
              <div
                className="relative rounded-[2rem] border border-white/20 backdrop-blur-3xl overflow-hidden p-8 md:p-9 space-y-6 text-left"
                style={{
                  backgroundColor: "rgba(18, 18, 24, 0.72)",
                  boxShadow:
                    "0 40px 80px -20px rgba(0, 0, 0, 0.95), inset 0 1.5px 0 rgba(255, 255, 255, 0.35)",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                <p
                  className="font-inter font-normal text-zinc-200 leading-relaxed text-left"
                  style={{
                    fontSize: `clamp(1.15rem, calc(1.35rem * ${scale}), 1.9rem)`,
                    lineHeight: 1.65,
                  }}
                >
                  {renderMonoHighlight(safeBody)}
                </p>

                {/* Pílulas de Ação Tátil (Salvar & Compartilhar) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.06] border border-white/15">
                    <span className="text-xl">🔖</span>
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">Salvar este post</span>
                      <span className="text-[10px] text-zinc-400 font-mono block">Para consultar com seu time</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.06] border border-white/15">
                    <span className="text-xl">↗</span>
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">Compartilhar</span>
                      <span className="text-[10px] text-zinc-400 font-mono block">Com sua diretoria comercial</span>
                    </div>
                  </div>
                </div>

                {/* Botão de Seguir Oficial */}
                <div className="pt-2 flex items-center justify-between border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span>✦ MEMBRO FUNDADOR</span>
                    <span>•</span>
                    <span className="text-white font-bold">MARCO ZERO</span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-2 shadow-lg">
                    <span>Siga {authorHandle}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ================================================================ */}
        {/* RODAPÉ DO TEMPLATE: Assinatura de Marca + Pista de Deslize       */}
        {/* ================================================================ */}
        <footer className="flex items-center justify-between border-t border-white/[0.12] pt-4 text-xs font-mono">
          {/* Identificação do Autor com Monograma de Vidro */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center font-clash text-xs shadow-md">
              {authorName.charAt(0) || "B"}
            </div>

            <div className="flex flex-col text-left leading-tight">
              <span className="font-clash font-bold text-white text-xs tracking-wider">
                {authorName}
              </span>
              <span className="text-zinc-400 text-[10px] font-mono">
                {authorHandle}
              </span>
            </div>
          </div>

          {/* Pista de Deslize ou Finalização */}
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
            {isCta ? (
              <span className="text-white font-bold tracking-wider">FIM DO CARROSSEL ✦</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="tracking-wider">Arraste para o lado</span>
                <span className="text-white font-bold animate-pulse">→</span>
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
