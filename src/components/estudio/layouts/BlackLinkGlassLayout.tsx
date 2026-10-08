import React from "react";
import { LayoutProps } from "./layoutTypes";

/**
 * Template Antigravity — Black Link (1.0)
 * Glassmorphism 4K Hiper-Realista em Resolução Nativa 1080px
 *
 * Conceito: Placa Tridimensional de Vidro Acrílico Lapidado Flutuando em Estúdio Escuro.
 * Todos os elementos são dimensionados para o canvas de 1080x1080 (ou 1080x1350 / 1080x1920),
 * garantindo legibilidade perfeita tanto em telas de alta densidade quanto no Instagram real.
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

  // Conteúdo das Lâminas (Sem clamp artificial que corta frases)
  const rawHeadline = (slide.headline || "").trim();
  const rawBody = (slide.bodyText || "").trim();
  const rawTag = (slide.tag || (isCover ? "MARCO ZERO" : isCta ? "CONVERSÃO" : "TESE TÉCNICA")).trim().toUpperCase();

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

  // Dimensionamento Dinâmico em Pixels Reais para Canvas de 1080px
  const headlineLen = rawHeadline.length;
  const headlineStyle = (() => {
    if (isCover) {
      if (headlineLen <= 35) return { fontSize: "56px", lineHeight: "1.12" };
      if (headlineLen <= 60) return { fontSize: "46px", lineHeight: "1.15" };
      if (headlineLen <= 80) return { fontSize: "38px", lineHeight: "1.18" };
      return { fontSize: "32px", lineHeight: "1.20" };
    }
    if (headlineLen <= 40) return { fontSize: "50px", lineHeight: "1.14" };
    if (headlineLen <= 70) return { fontSize: "42px", lineHeight: "1.16" };
    return { fontSize: "34px", lineHeight: "1.20" };
  })();

  // Renderizador de Destaque Monocromático (0% Saturação)
  const renderMonoHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className="text-white font-black underline decoration-white/60 underline-offset-8 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)] inline"
          >
            {clean}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-[#08090d] text-white">
      {/* ================================================================== */}
      {/* 1. ILUMINAÇÃO DE ESTÚDIO TRIDIMENSIONAL (LUXURY DARK STUDIO GLOW)  */}
      {/* Fundo com iluminação volumétrica para ativar o blur e a refração    */}
      {/* ================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Luz difusa zenital superior central */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 38%, rgba(255, 255, 255, 0.16) 0%, rgba(38, 42, 54, 0.45) 40%, rgba(8, 9, 13, 1) 85%)",
          }}
        />

        {/* Feixe volumétrico luminoso atrás da placa de vidro */}
        <div
          className="absolute top-1/4 -inset-x-20 h-[560px] blur-[130px] opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.32) 0%, rgba(130, 135, 160, 0.18) 45%, transparent 75%)",
          }}
        />

        {/* Glow de base do piso */}
        <div
          className="absolute -bottom-24 inset-x-0 h-72 blur-[100px] opacity-25"
          style={{
            background:
              "radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.28) 0%, transparent 70%)",
          }}
        />

        {/* Micro-textura de titânio acetinado */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.85) 1.5px, transparent 1.5px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Linhas guias imutáveis de safe area (80px) */}
        <div className="absolute top-0 bottom-0 left-[80px] w-px bg-white/[0.04]" />
        <div className="absolute top-0 bottom-0 right-[80px] w-px bg-white/[0.04]" />
      </div>

      {/* ================================================================== */}
      {/* 2. MOLDURA EXTERNA SUPERIOR DO INSTAGRAM                           */}
      {/* ================================================================== */}
      <header className={`relative z-10 w-full px-[80px] ${is916 ? "pt-24" : is45 ? "pt-14" : "pt-12"}`}>
        {/* Barra de Progresso Segmentada em Vidro Lapidado (8px de altura) */}
        <div className="flex items-center gap-3 w-full mb-5">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            const isPassed = idx + 1 <= currentSlide;
            return (
              <div
                key={idx}
                className="h-2 rounded-full flex-1 transition-all duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: isPassed ? "#ffffff" : "rgba(255, 255, 255, 0.18)",
                  boxShadow: isPassed ? "0 0 14px rgba(255, 255, 255, 0.85)" : "none",
                }}
              >
                {isPassed && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-white pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {/* Metadados Superiores (Referência @uix.vikram) */}
        <div className="flex items-center justify-between text-base font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="font-extrabold text-white tracking-widest text-lg">
              {authorHandle}
            </span>
          </div>

          <div className="flex items-center gap-3.5 text-base">
            <span className="tracking-widest uppercase text-zinc-400 text-sm font-bold">
              {isCover ? "MANIFESTO" : isCta ? "CONVERSÃO" : "TESE TÉCNICA"}
            </span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-white font-extrabold tracking-widest text-base">
              {String(currentSlide).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </span>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* 3. A PLACA MONUMENTAL DE VIDRO ACRÍLICO 3D (O CENTRO DO SLIDE)     */}
      {/* ================================================================== */}
      <main className={`relative z-20 w-full px-[80px] my-auto ${is916 ? "py-10" : is45 ? "py-6" : "py-4"}`}>
        <div
          className="relative w-full rounded-[40px] border overflow-hidden transition-all duration-300"
          style={{
            background:
              "linear-gradient(155deg, rgba(24, 26, 36, 0.82) 0%, rgba(12, 13, 19, 0.90) 100%)",
            backdropFilter: "blur(50px) saturate(180%)",
            WebkitBackdropFilter: "blur(50px) saturate(180%)",
            borderColor: "rgba(255, 255, 255, 0.24)",
            borderTopColor: "rgba(255, 255, 255, 0.75)",
            borderTopWidth: "2px",
            boxShadow:
              "0 50px 100px -20px rgba(0, 0, 0, 0.96), 0 25px 50px -10px rgba(0, 0, 0, 0.85), inset 0 2px 3px rgba(255, 255, 255, 0.55), inset 0 -3px 6px rgba(0, 0, 0, 0.65), inset 2px 0 3px rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Chanfro Especular Superior de Corte Óptico */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Faixa Diagonal de Refração a 45 Graus simulando Espessura de Vidro */}
          <div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none opacity-25"
            style={{
              background:
                "linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.35) 48%, rgba(255, 255, 255, 0.1) 52%, transparent 60%)",
            }}
          />

          {/* ============================================================== */}
          {/* CONTEÚDO INTEGRAL DA PLACA DE VIDRO (PROTAGONISTA DA LÂMINA)   */}
          {/* ============================================================== */}
          <div className="relative z-10 p-12 space-y-8 text-left">
            
            {/* Topo do Vidro: Perfil com Halo Luminoso 3D + Badge de Vidro */}
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.14]">
              <div className="flex items-center gap-5">
                {/* Avatar com Anel Halo Luminoso 3D reluzente */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/40 via-white/10 to-black text-white font-clash font-extrabold flex items-center justify-center text-2xl shadow-[0_0_28px_rgba(255,255,255,0.7)] ring-2 ring-white">
                    {authorName.charAt(0) || "B"}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-black flex items-center justify-center text-[10px] font-black text-black">
                    ✓
                  </span>
                </div>

                <div className="flex flex-col text-left leading-tight">
                  <span className="font-clash font-extrabold text-white text-2xl tracking-wide">
                    {authorName}
                  </span>
                  <span className="text-base font-mono text-zinc-400 mt-1">
                    {authorHandle}
                  </span>
                </div>
              </div>

              {/* Botão de Salvar / Selo 4K em Vidro */}
              <div className="flex items-center gap-3">
                <div className="px-5 py-2.5 rounded-full bg-white/[0.10] border border-white/30 backdrop-blur-xl text-zinc-100 text-sm font-mono font-bold flex items-center gap-2 shadow-sm">
                  <span>🔖</span>
                  <span>Salvo</span>
                </div>
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-white text-base font-bold">
                  ✻
                </div>
              </div>
            </div>

            {/* Pílulas Táteis de Vidro em Relevo (Inspiradas nas referências 2 e 3) */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-white/[0.12] border border-white/30 text-white text-xs font-mono font-black uppercase tracking-widest backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                ✦ {rawTag}
              </span>
              <span className="px-4 py-2 rounded-xl bg-black/50 border border-white/20 text-zinc-300 text-xs font-mono font-bold tracking-wider">
                B2B INTELLIGENCE
              </span>
              {detectedKpi && (
                <span className="px-4 py-2 rounded-xl bg-white/20 border border-white/40 text-white font-mono font-black text-xs tracking-widest shadow-sm">
                  MÉTRICA // {detectedKpi}
                </span>
              )}
            </div>

            {/* TÍTULO PRINCIPAL MONUMENTAL (HEADLINE COMPLETA SEM CORTE) */}
            <div className="space-y-2">
              <h1
                className="font-clash font-extrabold text-white tracking-tight text-left drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
                style={{
                  fontSize: headlineStyle.fontSize,
                  lineHeight: headlineStyle.lineHeight,
                  letterSpacing: "-0.035em",
                }}
              >
                {renderMonoHighlight(rawHeadline)}
              </h1>
            </div>

            {/* Linha Divisória Translúcida com Efeito de Vidro */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* CORPO DE TEXTO / INSIGHT EXECUTIVO */}
            <div className="space-y-3">
              <p
                className="font-inter font-normal text-zinc-100 text-left"
                style={{
                  fontSize: isCover ? "26px" : "28px",
                  lineHeight: "1.65",
                }}
              >
                {renderMonoHighlight(rawBody)}
              </p>
            </div>

            {/* BARRA DE AÇÕES TÁTEIS NA BASE DO CARD DE VIDRO */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-white/[0.14]">
              <div className="flex items-center gap-3">
                <div className="px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/25 text-sm font-mono text-zinc-100 flex items-center gap-2 transition-all shadow-sm">
                  <span>🔖</span>
                  <span className="font-bold">Salvar Lâmina</span>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/25 text-sm font-mono text-zinc-100 flex items-center gap-2 transition-all shadow-sm">
                  <span>↗</span>
                  <span className="font-bold">Compartilhar</span>
                </div>
              </div>

              {/* Botão de Destaque Tátil */}
              <div className="px-7 py-3.5 rounded-2xl bg-white text-black font-clash font-black text-base flex items-center gap-2.5 shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:bg-zinc-200 transition-all cursor-pointer">
                <span>{isCta ? "Acessar Plataforma Oficial" : "Acompanhar Tese"}</span>
                <span>→</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ================================================================== */}
      {/* 4. RODAPÉ EXTERNO DO INSTAGRAM                                     */}
      {/* ================================================================== */}
      <footer className={`relative z-10 w-full px-[80px] flex items-center justify-between text-base font-mono text-zinc-400 ${is916 ? "pb-24" : is45 ? "pb-14" : "pb-12"}`}>
        <div className="flex items-center gap-2.5">
          <span className="text-white font-extrabold text-base">Black Link OS</span>
          <span className="text-zinc-600 font-bold">•</span>
          <span className="text-zinc-400 text-sm">Diretrizes de Conversão B2B</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-200 font-extrabold text-base">
          <span>{isCta ? "Link na Bio ↗" : "Arraste para o Lado →"}</span>
        </div>
      </footer>
    </div>
  );
}
