import React from "react";
import { LayoutProps, GlassDimensionMode } from "./layoutTypes";

/**
 * Função inteligente de clamp que respeita limites de palavras (evita cortar no meio de palavras)
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
 * Glassmorphism Hiper-Realista 4K com Dimensão Física 3D
 *
 * Inspirado nos padrões de ponta de design tridimensional:
 * 1. Placa de Vidro 3D Suspenso (3D Glass Slab) — Perspectiva espacial, espessura acrílica de refração e botões táteis
 * 2. Monólito Chanfrado 3D (3D Monolith) — Facetas anguladas, cavidades em baixo-relevo e profundidade escultural
 * 3. Vidro Flutuante Atmosférico (Floating Glass) — Refração sobre iluminação difusa zenital e minimalismo Apple
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
  const dimensionMode: GlassDimensionMode = config.glassDimensionMode || "3d-slab";

  // Hard Limits com Proteção de Quebra de Palavras
  const rawHeadline = (slide.headline || "").trim();
  const safeHeadline = smartClamp(rawHeadline, 65);

  const rawBody = (slide.bodyText || "").trim();
  const safeBody = smartClamp(rawBody, 140);

  const rawTag = (slide.tag || (isCover ? "MARCO ZERO" : isCta ? "PRÓXIMO PASSO" : "DIRETRIZ"))
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
  const verticalPaddingClass = is916 ? "py-24" : is45 ? "py-14" : "py-10";

  // Dimensionamento Dinâmico de Tipografia para Clash Display
  const headlineLength = safeHeadline.length;
  const getHeadlineFontSize = () => {
    if (isCover) {
      if (headlineLength <= 35) return `clamp(2.6rem, calc(3.3rem * ${scale}), 5.0rem)`;
      if (headlineLength <= 50) return `clamp(2.2rem, calc(2.7rem * ${scale}), 4.2rem)`;
      return `clamp(1.9rem, calc(2.3rem * ${scale}), 3.6rem)`;
    }
    if (headlineLength <= 40) return `clamp(2.1rem, calc(2.6rem * ${scale}), 4.0rem)`;
    return `clamp(1.8rem, calc(2.2rem * ${scale}), 3.4rem)`;
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
            className="text-white font-extrabold underline decoration-white/50 underline-offset-8 drop-shadow-[0_0_24px_rgba(255,255,255,0.6)] inline"
          >
            {clean}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-[#030306] text-white">
      {/* ================================================================== */}
      {/* CAMADA 1: FUNDO ATMOSFÉRICO CINEMATOGRÁFICO COM REFRAÇÃO ÓPTICA    */}
      {/* ================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Luz difusa zenital fria no topo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 90% at 50% -10%, rgba(255,255,255,0.18) 0%, rgba(35,35,45,0.45) 35%, rgba(3,3,6,1) 85%)",
          }}
        />

        {/* Feixe volumétrico central que cria o contraste de refração através do vidro */}
        <div
          className="absolute top-1/4 inset-x-12 h-96 blur-[110px] opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.22) 0%, rgba(100,100,120,0.15) 45%, transparent 75%)",
          }}
        />

        {/* Glow sutil inferior para sustentação de profundidade 3D */}
        <div
          className="absolute -bottom-24 inset-x-8 h-72 blur-[100px] opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Micro-grão SVG de alta densidade (sensação física de titânio fosco/jateado) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-screen pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="glass3DNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#glass3DNoise)" />
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
        {/* CABEÇALHO DO TEMPLATE: Barra Segmentada + Metadados de Marca    */}
        {/* ================================================================ */}
        <header className="space-y-4">
          {/* Barra de Progresso Segmentada em Vidro Lapidado */}
          <div className="flex items-center gap-2.5 w-full">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isPassed = idx + 1 <= currentSlide;
              return (
                <div
                  key={idx}
                  className="h-1.5 rounded-full flex-1 transition-all duration-300 relative overflow-hidden"
                  style={{
                    backgroundColor: isPassed ? "#ffffff" : "rgba(255, 255, 255, 0.15)",
                    boxShadow: isPassed ? "0 0 12px rgba(255, 255, 255, 0.7)" : "none",
                  }}
                >
                  {isPassed && (
                    <div className="absolute inset-x-0 top-0 h-px bg-white/60 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Linha de Identidade & Ícone Estrela Asterisco (Inspirado nas referências) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              {/* Badge em Cápsula de Vidro Translúcido com LED */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/25 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-100 uppercase">
                  {rawTag}
                </span>
              </div>

              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                {isCover ? "EDIÇÃO 01" : `LÂMINA ${String(currentSlide).padStart(2, "0")}`}
              </span>
            </div>

            {/* Estrela/Emblema Geométrica 3D e Paginação */}
            <div className="flex items-center gap-3">
              <span className="text-white text-base leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
                ✻
              </span>
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
        {/* NÚCLEO CENTRAL DO SLIDE (ESTRUTURA 3D COM DIMENSÃO REAL)        */}
        {/* ================================================================ */}
        <main className="my-auto space-y-6 md:space-y-8">
          
          {/* TÍTULO PRINCIPAL MONOLÍTICO EM CLASH DISPLAY */}
          <div className="space-y-2">
            <h1
              className="font-clash font-extrabold text-white tracking-tight leading-[1.09] text-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
              style={{
                fontSize: getHeadlineFontSize(),
                letterSpacing: "-0.03em",
              }}
            >
              {renderMonoHighlight(safeHeadline)}
            </h1>
          </div>

          {/* ============================================================== */}
          {/* O CARTÃO DE VIDRO 3D (3 MODOS: SLAB 3D, MONÓLITO, OU FLOATING) */}
          {/* ============================================================== */}
          
          {/* ------------------------------------------------------------ */}
          {/* MODO 1: 3D GLASS SLAB (INSPIRADO NA REFERÊNCIA DA MÃO COM VIDRO) */}
          {/* ------------------------------------------------------------ */}
          {dimensionMode === "3d-slab" && (
            <div
              className="relative rounded-[2.2rem] border backdrop-blur-[45px] overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: "rgba(18, 19, 26, 0.62)",
                transform: "perspective(1200px) rotateX(2.5deg) rotateY(-1.5deg) translateZ(0)",
                borderColor: "rgba(255, 255, 255, 0.32)",
                boxShadow:
                  "0 50px 100px -20px rgba(0, 0, 0, 0.95), 0 25px 50px -10px rgba(0, 0, 0, 0.8), inset 0 2px 2px rgba(255, 255, 255, 0.55), inset 0 -2px 4px rgba(0, 0, 0, 0.5), inset 2px 0 3px rgba(255, 255, 255, 0.25), inset -2px 0 3px rgba(0, 0, 0, 0.25)",
              }}
            >
              {/* Chanfro de reflexo especular na borda superior (Borda física de vidro) */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

              {/* Reflexo diagonal sutil de luz atravessando a espessura da placa */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 30%, transparent 70%)",
                }}
              />

              {/* Conteúdo interno da Placa de Vidro 3D */}
              <div className="relative z-10 p-7 md:p-9 space-y-6 text-left">
                
                {/* Header da Placa 3D: Perfil com Anel de Luz (Inspirado na imagem 4) + Botão de Fechar Vidro */}
                <div className="flex items-center justify-between border-b border-white/[0.12] pb-4">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar com Anel Halo Luminoso 3D */}
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-white text-black font-clash font-extrabold flex items-center justify-center text-sm shadow-[0_0_20px_rgba(255,255,255,0.6)] ring-2 ring-white/90">
                        {authorName.charAt(0) || "B"}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-black flex items-center justify-center text-[7px] font-bold text-black">
                        ✓
                      </span>
                    </div>

                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-clash font-bold text-white text-sm tracking-wide">
                        {authorName}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {authorHandle}
                      </span>
                    </div>
                  </div>

                  {/* Telemetria / Stats em Colunas (Inspirado na referência 4) */}
                  <div className="flex items-center gap-4 text-center font-mono">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">
                        {isCover ? "01" : String(currentSlide).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] uppercase text-zinc-400 block tracking-widest">
                        LÂMINA
                      </span>
                    </div>
                    <span className="text-zinc-600 text-xs">/</span>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-300 block">
                        {detectedKpi || "4K"}
                      </span>
                      <span className="text-[8px] uppercase text-zinc-400 block tracking-widest">
                        DADO
                      </span>
                    </div>
                    {/* Botão Ícone X em Vidro */}
                    <span className="ml-1 px-2 py-1 rounded-lg bg-white/10 text-zinc-300 text-[10px] font-bold border border-white/20">
                      ✕
                    </span>
                  </div>
                </div>

                {/* Corpo de Texto em Inter com Máxima Clareza */}
                <div className="space-y-3">
                  <p
                    className="font-inter font-normal text-zinc-100 leading-relaxed text-left"
                    style={{
                      fontSize: `clamp(1.15rem, calc(1.35rem * ${scale}), 1.95rem)`,
                      lineHeight: 1.65,
                    }}
                  >
                    {renderMonoHighlight(safeBody)}
                  </p>
                </div>

                {/* Botões Táteis Flutuantes de Vidro (Inspirados nas referências 2 e 4: Ikuti / Kirim Pesan) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.12]">
                  <div className="flex items-center gap-2">
                    <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] border border-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 shadow-sm">
                      <span>🔖</span>
                      <span className="text-[11px] font-bold">Salvar Lâmina</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] border border-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 shadow-sm">
                      <span>↗</span>
                      <span className="text-[11px] font-bold">Compartilhar</span>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-white text-black font-clash font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    <span>{isCta ? "Acessar Plataforma" : "Acompanhar Tese"}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* MODO 2: 3D MONOLITH (INSPIRADO NA REFERÊNCIA DO KIOSK CHANFRADO) */}
          {/* ------------------------------------------------------------ */}
          {dimensionMode === "3d-monolith" && (
            <div
              className="relative rounded-[2.5rem] border backdrop-blur-[50px] overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: "rgba(22, 23, 30, 0.85)",
                borderColor: "rgba(255, 255, 255, 0.28)",
                transform: "perspective(1200px) rotateX(3deg) rotateY(1.5deg)",
                boxShadow:
                  "0 45px 90px -20px rgba(0, 0, 0, 0.95), 0 20px 40px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -4px 8px rgba(0,0,0,0.7)",
              }}
            >
              {/* Faceta de chanfro 3D na borda superior */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              <div className="p-8 md:p-10 space-y-6 text-left">
                {/* Header Monólito: Compartimento em Baixo-Relevo */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <span className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">
                      ESPECIFICAÇÃO // DADOS 3D
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-[10px] font-mono text-zinc-400">
                    FACETA 45°
                  </span>
                </div>

                {/* Cavidade Rebaixada (como as prateleiras da referência 5) */}
                {detectedKpi ? (
                  <div
                    className="p-6 rounded-2xl border border-white/15 space-y-3"
                    style={{
                      backgroundColor: "rgba(10, 11, 15, 0.85)",
                      boxShadow: "inset 0 4px 14px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-clash font-extrabold text-white text-4xl sm:text-5xl tracking-tighter block drop-shadow-md">
                        {detectedKpi}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        TELEMETRIA REBAIXADA
                      </span>
                    </div>
                    <p
                      className="font-inter font-normal text-zinc-200 leading-relaxed"
                      style={{ fontSize: `clamp(1.1rem, calc(1.3rem * ${scale}), 1.85rem)` }}
                    >
                      {renderMonoHighlight(safeBody)}
                    </p>
                  </div>
                ) : (
                  <div
                    className="p-6 rounded-2xl border border-white/15 space-y-2"
                    style={{
                      backgroundColor: "rgba(10, 11, 15, 0.85)",
                      boxShadow: "inset 0 4px 14px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
                  >
                    <p
                      className="font-inter font-normal text-zinc-200 leading-relaxed"
                      style={{ fontSize: `clamp(1.15rem, calc(1.35rem * ${scale}), 1.95rem)` }}
                    >
                      {renderMonoHighlight(safeBody)}
                    </p>
                  </div>
                )}

                {/* Botão Extrudado no Estilo Hardware Kiosk */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {authorName} • {authorHandle}
                  </span>
                  <div
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-clash font-bold text-xs flex items-center gap-2 cursor-pointer"
                    style={{
                      boxShadow: "0 4px 0 #18181b, 0 10px 20px rgba(0,0,0,0.7)",
                    }}
                  >
                    <span>{isCta ? "Avançar" : "Mais Detalhes"}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* MODO 3: FLOATING GLASS (INSPIRADO NAS REFERÊNCIAS 1, 2 E 3)   */}
          {/* ------------------------------------------------------------ */}
          {dimensionMode === "floating-glass" && (
            <div
              className="relative rounded-[2.5rem] border border-white/20 backdrop-blur-[55px] overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: "rgba(14, 15, 20, 0.65)",
                boxShadow:
                  "0 45px 90px -20px rgba(0, 0, 0, 0.95), inset 0 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Chanfro de luz especular */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

              <div className="p-8 md:p-10 space-y-6 text-left">
                {/* Header Estilo Imagens 1 e 3: Pills ovais + Asterisco */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/20 text-[10px] font-mono text-zinc-200 font-bold uppercase tracking-wider">
                      4K RESOLUTION
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/20 text-[10px] font-mono text-zinc-200 font-bold uppercase tracking-wider hidden sm:inline">
                      ULTRA HD
                    </span>
                  </div>
                  <span className="text-white text-xl leading-none">✻</span>
                </div>

                {/* Corpo do Cartão */}
                <p
                  className="font-inter font-normal text-zinc-100 leading-relaxed text-left"
                  style={{
                    fontSize: `clamp(1.15rem, calc(1.35rem * ${scale}), 1.95rem)`,
                    lineHeight: 1.65,
                  }}
                >
                  {renderMonoHighlight(safeBody)}
                </p>

                {/* Rodapé Interno com Pílula Redonda (>) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs font-mono text-zinc-400">
                  <span>{authorHandle}</span>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span>Deslizar</span>
                    <span className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-[11px]">
                      &gt;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ================================================================ */}
        {/* RODAPÉ ESTRUTURAL DO SLIDE: Assinatura + Seta de Deslize        */}
        {/* ================================================================ */}
        <footer className="flex items-center justify-between border-t border-white/[0.12] pt-4 text-xs font-mono">
          {/* Identificação do Autor */}
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

          {/* Pista de Deslize ou Conclusão */}
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
