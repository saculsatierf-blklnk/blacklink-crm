import React from "react";
import { LayoutProps } from "./layoutTypes";

/**
 * Template Antigravity — Black Link (1.0)
 * Design Oficial: Extensão Física da Identidade Black Link (Elo de Corrente Forjado em Titânio)
 *
 * Filosofia:
 * - DIRETO. DISCRETO. PODEROSO.
 * - Zero sujeira visual: Sem barras de progresso ou nomes no topo (o próprio Instagram já possui).
 * - Sem copys clichês ou botões falsos na base.
 * - Fundo com a textura macro de metal/aço forjado da Black Link.
 * - Bloco de vidro titânio lapidado com margens imutáveis de 80px e tipografia soberana em Clash Display.
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

  const authorName = (config.authorName || "Black Link").trim();
  const authorHandle = (config.authorHandle || "@blacklink.com.br").trim().toLowerCase();

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
    if (isCover) {
      if (headlineLen <= 35) return { fontSize: "56px", lineHeight: "1.12" };
      if (headlineLen <= 60) return { fontSize: "46px", lineHeight: "1.15" };
      if (headlineLen <= 85) return { fontSize: "38px", lineHeight: "1.18" };
      return { fontSize: "32px", lineHeight: "1.22" };
    }
    if (headlineLen <= 40) return { fontSize: "50px", lineHeight: "1.14" };
    if (headlineLen <= 70) return { fontSize: "42px", lineHeight: "1.16" };
    if (headlineLen <= 95) return { fontSize: "36px", lineHeight: "1.20" };
    return { fontSize: "30px", lineHeight: "1.24" };
  })();

  // Renderizador de Destaque Monocromático de Alta Fidelidade (0% Saturação)
  const renderMonoHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className="text-white font-black underline decoration-white/50 underline-offset-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] inline"
          >
            {clean}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden select-none bg-[#030305] text-white">
      {/* ================================================================== */}
      {/* 1. FUNDO MONOCROMÁTICO COM TEXTURA MACRO DA LOGO BLACK LINK       */}
      {/* ================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Camada da Imagem Oficial da Corrente Black Link com Fusão Cinematográfica */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url('/brand/blacklink-chain.jpg')`,
            opacity: 0.18,
            filter: "grayscale(100%) contrast(140%) brightness(70%)",
            transform: is916 ? "scale(1.25) translateY(-5%)" : "scale(1.08)",
          }}
        />

        {/* Gradiente Radial Escuro de Estúdio (Foco no Centro) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(18, 19, 24, 0.4) 0%, rgba(3, 3, 5, 0.88) 65%, rgba(1, 1, 2, 0.98) 100%)",
          }}
        />

        {/* Feixe Volumétrico Superior Suave (Luz de Aço/Titânio) */}
        <div
          className="absolute -top-32 inset-x-12 h-[520px] blur-[140px] opacity-25 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(140, 145, 160, 0.15) 50%, transparent 80%)",
          }}
        />

        {/* Linhas Guias Verticais de 80px (Margem Imutável do Design System) */}
        <div className="absolute top-0 bottom-0 left-[80px] w-px bg-white/[0.04]" />
        <div className="absolute top-0 bottom-0 right-[80px] w-px bg-white/[0.04]" />
      </div>

      {/* ================================================================== */}
      {/* 2. ÁREA CENTRAL (SAFE ZONE LIMPA PARA INSTAGRAM STORIES & FEED)   */}
      {/* Zero poluição no topo (sem barras ou nomes duplicados)             */}
      {/* Zero poluição na base (sem copys clichês)                         */}
      {/* ================================================================== */}
      <div
        className={`relative z-10 w-full px-[80px] flex flex-col justify-center ${
          is916
            ? "my-auto py-28 max-w-[1080px]"
            : is45
            ? "my-auto py-16 max-w-[1080px]"
            : "my-auto py-12 max-w-[1080px]"
        }`}
      >
        {/* ================================================================ */}
        {/* O MONÓLITO BLACK LINK: Placa de Vidro Titânio Lapidada          */}
        {/* ================================================================ */}
        <div
          className="relative w-full rounded-[36px] overflow-hidden transition-all duration-300"
          style={{
            background:
              "linear-gradient(160deg, rgba(16, 17, 24, 0.78) 0%, rgba(8, 9, 13, 0.88) 100%)",
            backdropFilter: "blur(40px) saturate(140%)",
            WebkitBackdropFilter: "blur(40px) saturate(140%)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderTop: "2px solid rgba(255, 255, 255, 0.55)",
            boxShadow:
              "0 45px 90px -20px rgba(0, 0, 0, 0.95), 0 20px 40px rgba(0, 0, 0, 0.8), inset 0 1.5px 2px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Chanfro Superior de Reflexo de Corte a Laser */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

          {/* Conteúdo Interno Direto e Discreto */}
          <div className="p-12 md:p-14 space-y-7 text-left">
            
            {/* Topo Discreto: Elo da Corrente + Tag Cirúrgica */}
            <div className="flex items-center justify-between pb-5 border-b border-white/[0.10]">
              <div className="flex items-center gap-3.5">
                {/* Ícone Minimalista da Logo da Corrente */}
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/30 overflow-hidden flex items-center justify-center p-0.5 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/blacklink-chain.jpg"
                    alt="Black Link"
                    className="w-full h-full object-cover rounded-full grayscale brightness-125"
                  />
                </div>
                <span className="font-mono text-xs font-bold text-zinc-400 tracking-[0.25em] uppercase">
                  BLACK LINK // {rawTag}
                </span>
              </div>

              {/* Indicador de Lâmina Discreto e Silencioso */}
              <div className="font-mono text-xs font-bold text-zinc-500 tracking-widest">
                {String(currentSlide).padStart(2, "0")}/{String(totalSlides).padStart(2, "0")}
              </div>
            </div>

            {/* TÍTULO PRINCIPAL (HEADLINE COMPLETA, SEM CORTE) */}
            <div className="space-y-1">
              <h1
                className="font-clash font-extrabold text-white tracking-tight text-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                style={{
                  fontSize: headlineStyle.fontSize,
                  lineHeight: headlineStyle.lineHeight,
                  letterSpacing: "-0.035em",
                }}
              >
                {renderMonoHighlight(rawHeadline)}
              </h1>
            </div>

            {/* Linha Divisória de Precisão Industrial */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* CORPO DE TEXTO DIRETO (BODY COPY EM INTER) */}
            <div className="space-y-3">
              <p
                className="font-inter font-normal text-zinc-200 text-left"
                style={{
                  fontSize: isCover ? "26px" : "28px",
                  lineHeight: "1.65",
                }}
              >
                {renderMonoHighlight(rawBody)}
              </p>
            </div>

            {/* Destaque Numérico de Métrica (Apenas se existir número relevante) */}
            {detectedKpi && (
              <div className="pt-2">
                <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.06] border border-white/20 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold">
                    MÉTRICA CHAVE
                  </span>
                  <span className="font-clash text-2xl font-black text-white tracking-tight">
                    {detectedKpi}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
