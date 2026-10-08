import React from "react";
import { LayoutProps } from "./layoutTypes";

/**
 * Template Antigravity — Black Link (1.0)
 * Glassmorphism Hiper-Realista 3D Monocromático (0% Saturação)
 *
 * Filosofia & Padrão de Estúdio Internacional:
 * - DIRETO. DISCRETO. SOBERANO.
 * - Fundo com Escultura Arquitetônica 3D de Titânio Forjado e Vidro Líquido (Zero saturação).
 * - Monólito de Vidro Acrílico de Alta Densidade com Refração Óptica Física sobre a cena.
 * - Margens de 80px imutáveis do Design System.
 * - Safe Zone 100% limpa (sem interferência com a UI nativa do Instagram no topo e rodapé).
 * - Tipografia Monumental Clash Display + Inter sem cortes de texto.
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

  // Conteúdo das Lâminas (Texto 100% íntegro)
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

  // Imagem de Fundo de Estúdio 3D Oficial da Black Link (Escultura Titânio + Vidro Líquido)
  const bgImageSrc = is916 ? "/brand/blacklink-bg-story.jpg" : "/brand/blacklink-bg-square.jpg";

  // Dimensionamento Dinâmico Proporcional da Headline (Resolução Nativa 1080px)
  const headlineLen = rawHeadline.length;
  const headlineStyle = (() => {
    if (is916) {
      if (headlineLen <= 35) return { fontSize: "64px", lineHeight: "1.12" };
      if (headlineLen <= 65) return { fontSize: "52px", lineHeight: "1.15" };
      if (headlineLen <= 95) return { fontSize: "44px", lineHeight: "1.18" };
      return { fontSize: "36px", lineHeight: "1.22" };
    }
    if (isCover) {
      if (headlineLen <= 35) return { fontSize: "58px", lineHeight: "1.12" };
      if (headlineLen <= 65) return { fontSize: "48px", lineHeight: "1.15" };
      if (headlineLen <= 90) return { fontSize: "40px", lineHeight: "1.18" };
      return { fontSize: "34px", lineHeight: "1.22" };
    }
    if (headlineLen <= 40) return { fontSize: "52px", lineHeight: "1.14" };
    if (headlineLen <= 70) return { fontSize: "44px", lineHeight: "1.16" };
    if (headlineLen <= 95) return { fontSize: "36px", lineHeight: "1.20" };
    return { fontSize: "32px", lineHeight: "1.24" };
  })();

  // Renderizador de Destaque Monocromático de Alta Fidelidade (Luz Especular Pura)
  const renderMonoHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className="text-white font-black underline decoration-white/60 underline-offset-[12px] drop-shadow-[0_0_30px_rgba(255,255,255,0.7)] inline"
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
      {/* 1. FUNDO DE ESTÚDIO 3D REAL (TITÂNIO FORJADO + VIDRO LÍQUIDO)     */}
      {/* ================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Render 3D de Estúdio Cinematográfico Monocromático */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url('${bgImageSrc}')`,
            filter: "contrast(115%) brightness(65%) grayscale(100%)",
            transform: is916 ? "scale(1.08)" : "scale(1.05)",
          }}
        />

        {/* Vinheta Óptica de Profundidade de Campo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0, 0, 0, 0.45) 0%, rgba(2, 2, 4, 0.85) 65%, rgba(0, 0, 1, 0.98) 100%)",
          }}
        />

        {/* Luz Zenital Suave de Softbox */}
        <div
          className="absolute -top-32 inset-x-0 h-[500px] blur-[120px] opacity-35 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.35) 0%, transparent 75%)",
          }}
        />

        {/* Linhas Guias Imutáveis de 80px (Safe Area Oficial) */}
        <div className="absolute top-0 bottom-0 left-[80px] w-px bg-white/[0.04]" />
        <div className="absolute top-0 bottom-0 right-[80px] w-px bg-white/[0.04]" />
      </div>

      {/* ================================================================== */}
      {/* 2. O MONÓLITO DE VIDRO ACÍLICO 3D (REFRAÇÃO E DENSIDADE FÍSICA)    */}
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
            // Refração do Vidro Fumê com Reflexo da Escultura 3D de Fundo
            background:
              "linear-gradient(160deg, rgba(22, 24, 34, 0.72) 0%, rgba(10, 11, 17, 0.84) 50%, rgba(3, 4, 7, 0.92) 100%)",
            backdropFilter: "blur(55px) saturate(180%) contrast(125%)",
            WebkitBackdropFilter: "blur(55px) saturate(180%) contrast(125%)",
            
            // Borda Óptica de Vidro com Chanfro Especular
            border: "1.5px solid rgba(255, 255, 255, 0.22)",
            borderTop: "2.5px solid rgba(255, 255, 255, 0.85)",
            
            // Cascata de Sombras 3D: Oclusão + Espessura de Borda
            boxShadow:
              "0 50px 120px -20px rgba(0, 0, 0, 0.98), 0 25px 60px -10px rgba(0, 0, 0, 0.9), inset 0 2px 2px rgba(255, 255, 255, 0.65), inset 0 -4px 8px rgba(0, 0, 0, 0.8), inset 2px 0 3px rgba(255, 255, 255, 0.2), inset -2px 0 3px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Chanfro de Reflexo Zenital Superior de Corte a Laser */}
          <div
            className="absolute inset-x-0 top-0 h-[2.5px] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.8) 25%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 75%, transparent 95%)",
            }}
          />

          {/* Faixa Diagonal de Reflexo Especular de Estúdio (Softbox Sheen) */}
          <div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none opacity-25 mix-blend-screen"
            style={{
              background:
                "linear-gradient(135deg, transparent 38%, rgba(255, 255, 255, 0.3) 48%, rgba(255, 255, 255, 0.05) 54%, transparent 64%)",
            }}
          />

          {/* ============================================================== */}
          {/* CONTEÚDO INTEGRAL DENTRO DO MONÓLITO                           */}
          {/* ============================================================== */}
          <div className="relative z-10 p-14 md:p-18 flex flex-col justify-between flex-1 text-left space-y-10">
            
            {/* Topo do Monólito: Pill de Vidro com Marcador Técnico */}
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.12]">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.08] border border-white/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
                <span className="font-mono text-xs font-black tracking-[0.3em] text-white uppercase">
                  {rawTag}
                </span>
              </div>

              {/* Paginação Discreta em Vidro */}
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

              {/* Incisão de Corte de Vidro (Linha Translúcida) */}
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
                  className="p-6 rounded-3xl border border-white/20 flex items-center justify-between"
                  style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    boxShadow: "inset 0 3px 12px rgba(0, 0, 0, 0.9)",
                  }}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold">
                    DADO QUANTITATIVO
                  </span>
                  <span className="font-clash text-3xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
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
