import React from "react";
import { LayoutProps } from "./layoutTypes";

/**
 * Template Antigravity — Black Link (1.0)
 * Monólito de Vidro Titânio e Liquid Glass de Alta Densidade (0% Saturação)
 *
 * Conceito & Rigor:
 * - Direto. Discreto. Escultural.
 * - Zero imagem colada (sem logos ou correntes coladas na tela).
 * - A própria superfície do monólito carrega a materialidade da marca:
 *   densidade física, chanfro óptico duplo, refração interna,
 *   reflexos especulares de estúdio e textura tátil micro-porosa de titânio forjado.
 * - Zero interferência com a interface nativa do Instagram (topo e base limpos).
 * - Margens de 80px imutáveis.
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

  // Conteúdo das Lâminas (Texto 100% íntegro, sem cortes de palavras)
  const rawHeadline = (slide.headline || "").trim();
  const rawBody = (slide.bodyText || "").trim();
  const rawTag = (slide.tag || (isCover ? "MARCO ZERO" : isCta ? "DIRETRIZ" : "TESE")).trim().toUpperCase();

  // Detecção de KPI / Métrica Numérica
  const kpiMatch =
    slide.kpiHighlight ||
    rawBody.match(/([+\-]?\d+[\d.,]*%|\d+[\d.,]*x|R\$\s*[\d.,]+[kKmMbB]?|\d+ms|\d+s)/);
  const detectedKpi = slide.kpiHighlight || (kpiMatch ? kpiMatch[0] : null);

  // Proporção de Tela
  const is916 = config.aspectRatio === "9:16";
  const is45 = config.aspectRatio === "4:5";

  // Dimensionamento Dinâmico Proporcional da Headline (Resolução Nativa 1080px)
  const headlineLen = rawHeadline.length;
  const headlineStyle = (() => {
    if (is916) {
      if (headlineLen <= 35) return { fontSize: "62px", lineHeight: "1.12" };
      if (headlineLen <= 65) return { fontSize: "52px", lineHeight: "1.15" };
      if (headlineLen <= 95) return { fontSize: "44px", lineHeight: "1.18" };
      return { fontSize: "36px", lineHeight: "1.22" };
    }
    if (isCover) {
      if (headlineLen <= 35) return { fontSize: "56px", lineHeight: "1.12" };
      if (headlineLen <= 65) return { fontSize: "48px", lineHeight: "1.15" };
      if (headlineLen <= 90) return { fontSize: "40px", lineHeight: "1.18" };
      return { fontSize: "34px", lineHeight: "1.22" };
    }
    if (headlineLen <= 40) return { fontSize: "50px", lineHeight: "1.14" };
    if (headlineLen <= 70) return { fontSize: "42px", lineHeight: "1.16" };
    if (headlineLen <= 95) return { fontSize: "36px", lineHeight: "1.20" };
    return { fontSize: "32px", lineHeight: "1.24" };
  })();

  // Renderizador de Destaque Monocromático de Alta Fidelidade (Brilho Especular em Branco Puro)
  const renderMonoHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className="text-white font-black underline decoration-white/50 underline-offset-[12px] drop-shadow-[0_0_28px_rgba(255,255,255,0.7)] inline"
          >
            {clean}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden select-none bg-[#020204] text-white">
      {/* ================================================================== */}
      {/* 1. SHADER SVG DE TEXTURA TÁTIL & DISPERSÃO DE TITÂNIO/VIDRO        */}
      {/* ================================================================== */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="blacklink-tactile-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0"
              in="noise"
              result="coloredNoise"
            />
            <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
          </filter>
        </defs>
      </svg>

      {/* ================================================================== */}
      {/* 2. AMBIENTE DE ESTÚDIO ESCURO COM ILUMINAÇÃO VOLUMÉTRICA DE RECORTE */}
      {/* ================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Vinheta de Estúdio Ultra-Profunda */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(20, 22, 30, 0.55) 0%, rgba(5, 5, 8, 0.92) 55%, rgba(1, 1, 3, 1) 100%)",
          }}
        />

        {/* Softbox Zenital Traseiro (Gera a Refração Luminosa das Bordas) */}
        <div
          className="absolute -top-40 inset-x-0 h-[640px] blur-[150px] opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.45) 0%, rgba(150, 155, 175, 0.2) 45%, transparent 80%)",
          }}
        />

        {/* Glow de Sustentação Inferior */}
        <div
          className="absolute -bottom-32 inset-x-12 h-64 blur-[120px] opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
          }}
        />

        {/* Textura Tátil Micro-Jateada de Fundo */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Linhas Guias Imutáveis de 80px (Safe Area Oficial) */}
        <div className="absolute top-0 bottom-0 left-[80px] w-px bg-white/[0.04]" />
        <div className="absolute top-0 bottom-0 right-[80px] w-px bg-white/[0.04]" />
      </div>

      {/* ================================================================== */}
      {/* 3. O MONÓLITO DE VIDRO TITÂNIO (LIQUID GLASS 3D DE ALTA DENSIDADE)  */}
      {/* ================================================================== */}
      <div
        className={`relative z-10 w-full px-[80px] flex flex-col justify-center items-center ${
          is916
            ? "my-auto py-28"
            : is45
            ? "my-auto py-16"
            : "my-auto py-12"
        }`}
      >
        <div
          className={`relative w-full overflow-hidden transition-all duration-300 rounded-[44px] ${
            is916
              ? "min-h-[1260px] flex flex-col justify-between"
              : is45
              ? "min-h-[1020px] flex flex-col justify-between"
              : "min-h-[820px] flex flex-col justify-between"
          }`}
          style={{
            // Densidade Física do Vidro Negro de Titânio
            background:
              "linear-gradient(160deg, rgba(28, 30, 42, 0.86) 0%, rgba(13, 14, 20, 0.92) 45%, rgba(5, 6, 9, 0.97) 100%)",
            backdropFilter: "blur(60px) saturate(160%) contrast(115%)",
            WebkitBackdropFilter: "blur(60px) saturate(160%) contrast(115%)",
            
            // Borda Óptica com Chanfro Especular Contínuo
            border: "1.5px solid rgba(255, 255, 255, 0.18)",
            borderTop: "2.5px solid rgba(255, 255, 255, 0.75)",
            
            // Cascata de Sombras 3D: Oclusão de Ambiente + Espessura Interna de 15mm
            boxShadow:
              "0 60px 120px -25px rgba(0, 0, 0, 0.98), 0 30px 60px -15px rgba(0, 0, 0, 0.95), 0 0 90px rgba(255, 255, 255, 0.035), inset 0 2px 3px rgba(255, 255, 255, 0.65), inset 0 -4px 10px rgba(0, 0, 0, 0.85), inset 2px 0 4px rgba(255, 255, 255, 0.18), inset -2px 0 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          {/* Chanfro de Reflexo Zenital Superior de Corte Óptico */}
          <div
            className="absolute inset-x-0 top-0 h-[2.5px] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.7) 25%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.7) 75%, transparent 95%)",
            }}
          />

          {/* Faixa Diagonal de Reflexo Especular de Estúdio (Softbox Sheen) */}
          <div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none opacity-30 mix-blend-screen"
            style={{
              background:
                "linear-gradient(135deg, transparent 38%, rgba(255, 255, 255, 0.28) 47%, rgba(255, 255, 255, 0.06) 53%, transparent 64%)",
            }}
          />

          {/* Textura Micro-Porosa de Titânio Acetinado Aplicada Diretamente no Vidro */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)`,
              backgroundSize: "16px 16px",
            }}
          />

          {/* ============================================================== */}
          {/* CONTEÚDO INTEGRAL DENTRO DO MONÓLITO                           */}
          {/* ============================================================== */}
          <div className="relative z-10 p-14 md:p-18 flex flex-col justify-between flex-1 text-left space-y-10">
            
            {/* Topo do Monólito: Marcador Técnico Silencioso */}
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.12]">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
                <span className="font-mono text-sm font-black tracking-[0.35em] text-zinc-300 uppercase">
                  // {rawTag}
                </span>
              </div>

              {/* Paginação Monolítica Discreta */}
              <div className="font-mono text-sm font-bold tracking-[0.25em] text-zinc-400">
                {String(currentSlide).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
              </div>
            </div>

            {/* Núcleo Central: Headline Monumental + Divisória + Corpo */}
            <div className="space-y-8 my-auto">
              {/* TÍTULO PRINCIPAL (CLASH DISPLAY SOBERANO, SEM NENHUM CORTE) */}
              <h1
                className="font-clash font-extrabold text-white tracking-tight text-left drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
                style={{
                  fontSize: headlineStyle.fontSize,
                  lineHeight: headlineStyle.lineHeight,
                  letterSpacing: "-0.04em",
                }}
              >
                {renderMonoHighlight(rawHeadline)}
              </h1>

              {/* Incisão de Corte a Laser (Linha de Titânio) */}
              <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />

              {/* CORPO DE TEXTO CIRÚRGICO (INTER DIRETO) */}
              <p
                className="font-inter font-normal text-zinc-200 text-left"
                style={{
                  fontSize: is916 ? "30px" : "28px",
                  lineHeight: "1.68",
                }}
              >
                {renderMonoHighlight(rawBody)}
              </p>
            </div>

            {/* Base do Monólito: Métrica em Baixo-Relevo (Se houver dado numérico relevante) */}
            {detectedKpi ? (
              <div className="pt-6 border-t border-white/[0.12]">
                <div
                  className="p-6 rounded-3xl border border-white/15 flex items-center justify-between"
                  style={{
                    background: "rgba(0, 0, 0, 0.45)",
                    boxShadow: "inset 0 3px 12px rgba(0, 0, 0, 0.85)",
                  }}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold">
                    DADO QUANTITATIVO
                  </span>
                  <span className="font-clash text-3xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                    {detectedKpi}
                  </span>
                </div>
              </div>
            ) : (
              // Assinatura Silenciosa de Precisão na Base do Monólito
              <div className="pt-4 flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-white/[0.08]">
                <span className="tracking-[0.25em] uppercase font-bold text-zinc-300">
                  BLACK LINK
                </span>
                <span className="tracking-widest">
                  PRECISÃO // B2B
                </span>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
