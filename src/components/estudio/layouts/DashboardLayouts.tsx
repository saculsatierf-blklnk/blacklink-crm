import React from "react";
import { LayoutProps } from "./layoutTypes";
import { B2BChart } from "../B2BChart";

// 15. Glass Floating 3D (Card Flutuante em Vidro)
export function GlassFloatingLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  borderClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="flex items-center justify-center h-full p-2">
      <div
        className={`w-full max-w-xl p-8 rounded-3xl border shadow-2xl backdrop-blur-2xl text-left relative overflow-hidden ${borderClass}`}
        style={{
          backgroundColor: isLight ? "rgba(255, 255, 255, 0.88)" : "rgba(10, 10, 12, 0.78)",
          boxShadow: isLight
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div
          className="absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${config.accentColor}30` }}
        />
        <div className="relative z-10 space-y-4">
          {slide.tag && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${config.accentColor}25`,
                color: config.accentColor,
              }}
            >
              {slide.tag}
            </span>
          )}
          <h1
            className={`font-extrabold tracking-tight leading-tight ${textPrimaryClass}`}
            style={{
              fontSize: `clamp(1.45rem, calc(2rem * ${scale}), 3.2rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h1>
          <p
            className={`font-normal leading-relaxed ${textSecondaryClass}`}
            style={{
              fontSize: `clamp(0.95rem, calc(1.1rem * ${scale}), 1.5rem)`,
            }}
          >
            {renderHighlightedText(slide.bodyText, config.accentColor)}
          </p>
        </div>
      </div>
    </div>
  );
}

// 16. Dashboard / Analytics (Painel BI com Gráficos Falsos e Bordas Neon)
export function DashboardAnalyticsLayout({
  slide,
  config,
  scale,
  textPrimaryClass,
  textSecondaryClass,
  textMutedClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-[#090b10] border border-cyan-500/30 shadow-2xl relative overflow-hidden text-left font-mono">
      {/* Background Soft Neon Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Top BI Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">
            BLACK LINK BI // ANALYTICS SUITE
          </span>
        </div>
        <span className="text-[10px] text-zinc-400">TELEMETRIA ATIVA</span>
      </div>

      {/* Center KPI & Headline */}
      <div className="my-auto space-y-4 py-2 z-10">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <span className="block text-[9px] text-zinc-400">CONVERSÃO B2B</span>
            <span className="text-lg font-black text-cyan-400">+342%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <span className="block text-[9px] text-zinc-400">LATÊNCIA</span>
            <span className="text-lg font-black text-emerald-400">18ms</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
            <span className="block text-[9px] text-zinc-400">RETENÇÃO</span>
            <span className="text-lg font-black text-white">99.4%</span>
          </div>
        </div>

        <h1
          className={`font-black tracking-tight leading-tight ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.4rem, calc(1.9rem * ${scale}), 3.2rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        <p
          className={`text-xs md:text-sm leading-relaxed ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(0.85rem, calc(1rem * ${scale}), 1.35rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>

        {/* Fake Mini SVG Area Chart */}
        <div className="w-full h-12 bg-black/40 rounded-xl p-2 border border-cyan-500/20 flex items-end">
          <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
            <path
              d="M0 35 Q30 20, 60 28 T120 12 T160 18 T200 4 L200 40 L0 40 Z"
              fill="rgba(6, 182, 212, 0.2)"
            />
            <path
              d="M0 35 Q30 20, 60 28 T120 12 T160 18 T200 4"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* BI Footer */}
      <div className="flex items-center justify-between text-[10px] text-cyan-400/80 border-t border-cyan-500/20 pt-2 z-10">
        <span>DATA PIPELINE: SINCRONIZADO</span>
        <span className={textMutedClass}>v2.5 PREDICTIVE ENGINE</span>
      </div>
    </div>
  );
}

// 17. Checklist / Kanban (Colunas & Passo a Passo)
export function ChecklistKanbanLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  borderClass,
  cardBgClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-6 md:p-8 rounded-2xl border shadow-xl backdrop-blur-md text-left ${cardBgClass} ${borderClass}`}
    >
      {/* Header com Tag */}
      <div className="flex items-center justify-between pb-2 border-b border-current/10">
        <span
          className="text-xs font-mono uppercase font-bold tracking-widest px-2.5 py-1 rounded"
          style={{ backgroundColor: `${config.accentColor}20`, color: config.accentColor }}
        >
          {slide.tag || "FRAMEWORK DE EXECUÇÃO"}
        </span>
        <span className="text-[10px] font-mono opacity-70">STATUS: EM PROGRESSO</span>
      </div>

      {/* Headline */}
      <div className="my-auto space-y-4">
        <h1
          className={`font-black tracking-tight leading-snug ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.4rem, calc(1.95rem * ${scale}), 3.2rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        <p className={`text-xs md:text-sm leading-relaxed ${textSecondaryClass}`}>
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>

        {/* 3 Step Kanban Cards / Checklist */}
        <div className="space-y-2 pt-2">
          {[
            { step: "01", title: "Diagnóstico e Mapeamento de Gargalos", done: true },
            { step: "02", title: "Automação da Esteira Comercial", done: true },
            { step: "03", title: "Escala com Inteligência de Dados", done: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-xl border ${borderClass} ${
                item.done ? "bg-emerald-500/10" : "bg-black/20"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                  item.done ? "bg-emerald-500 text-black" : "border border-zinc-500 text-zinc-500"
                }`}
              >
                {item.done ? "✓" : item.step}
              </div>
              <span className={`text-xs font-medium ${item.done ? textPrimaryClass : "opacity-60"}`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] font-mono opacity-60 pt-2 border-t border-current/10">
        KANBAN EXECUTION SPRINT • BLACK LINK
      </div>
    </div>
  );
}

// 18. MacBook Mockup (Tela de Navegador / Notebook Flutuante)
export function MacbookMockupLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-2 md:p-4">
      {/* MacBook Screen Window */}
      <div className="w-full max-w-xl rounded-2xl border border-white/20 shadow-2xl bg-zinc-950 overflow-hidden text-left relative">
        {/* Browser Top Chrome Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="flex items-center gap-1 px-4 py-1 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-300 max-w-[200px] truncate">
            <span className="text-zinc-500">🔒</span>
            <span>app.blacklink.com.br/insight</span>
          </div>

          <div className="w-8" />
        </div>

        {/* Viewport Content */}
        <div className="p-6 md:p-8 space-y-4 bg-zinc-950">
          {slide.tag && (
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ backgroundColor: `${config.accentColor}25`, color: config.accentColor }}
            >
              {slide.tag}
            </span>
          )}

          <h1
            className={`font-black tracking-tight leading-tight ${textPrimaryClass}`}
            style={{
              fontSize: `clamp(1.35rem, calc(1.85rem * ${scale}), 2.8rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h1>

          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <p className={`text-xs md:text-sm leading-relaxed ${textSecondaryClass}`}>
              {renderHighlightedText(slide.bodyText, config.accentColor)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 19. Sticky Note (Post-It Amarelo com Leve Rotação)
export function StickyNoteLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-[#e5e7eb] rounded-2xl relative overflow-hidden">
      {/* Desk Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Yellow Sticky Note Card */}
      <div className="w-full max-w-md bg-[#fef08a] text-zinc-900 p-6 md:p-8 rounded-sm shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300 relative text-left border-t-8 border-[#fde047]">
        {/* Push Pin Icon */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-600 shadow-md border-2 border-white flex items-center justify-center text-[10px] text-white">
          📌
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-800 block mb-2">
          {slide.tag || "MEMO EXECUTIVO // URGENTE"}
        </span>

        <h1
          className="font-black tracking-tight leading-snug mb-3 text-zinc-950 font-sans"
          style={{
            fontSize: `clamp(1.35rem, calc(1.85rem * ${scale}), 2.8rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, "#d97706")}
        </h1>

        <p
          className="text-zinc-800 font-sans leading-relaxed text-xs md:text-sm"
          style={{
            fontSize: `clamp(0.85rem, calc(1rem * ${scale}), 1.35rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, "#b45309")}
        </p>

        <div className="pt-4 mt-4 border-t border-amber-300/80 flex items-center justify-between text-[10px] font-mono text-amber-900">
          <span>DE: {config.authorName}</span>
          <span>BLACK LINK MEMO</span>
        </div>
      </div>
    </div>
  );
}

// 20. Aura Gradient (Estilo Apple Event com Esferas Borradas)
export function AuraGradientLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 md:p-8 rounded-2xl bg-black text-white relative overflow-hidden shadow-2xl">
      {/* Massive Glowing Aura Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/35 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-cyan-500/30 blur-[120px] pointer-events-none" />
      <div className="absolute center w-48 h-48 rounded-full bg-emerald-500/25 blur-[100px] pointer-events-none" />

      {/* Aura Pill Badge */}
      <div className="z-10 mb-5">
        <span
          className="px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase border backdrop-blur-xl shadow-lg"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
          }}
        >
          {slide.tag || "APPLE EVENT // KEYNOTE"}
        </span>
      </div>

      {/* Central Colossal Text */}
      <div className="z-10 max-w-xl mx-auto space-y-4">
        <h1
          className="font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl"
          style={{
            fontSize: `clamp(1.75rem, calc(2.4rem * ${scale}), 3.8rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        <p
          className="text-zinc-300 font-normal leading-relaxed max-w-md mx-auto drop-shadow-lg"
          style={{
            fontSize: `clamp(0.95rem, calc(1.15rem * ${scale}), 1.55rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </div>
    </div>
  );
}

// 21. Bento Grid (Trend Hunter B2B - Bento Box com 3 Quadrantes Táteis)
export function BentoGridLayout({
  slide,
  config,
  scale,
  isLight,
  renderHighlightedText,
  currentSlide,
  isLoadingAI,
}: LayoutProps) {
  const is916 = config.aspectRatio === "9:16";

  // Skeletons de carregamento da IA
  if (isLoadingAI) {
    return (
      <div className="w-full h-full flex flex-col gap-4 font-bricolage animate-pulse">
        <div className="flex-[1.2] bg-white/10 rounded-[2rem] p-8 border border-white/10 flex flex-col justify-center space-y-3">
          <div className="w-24 h-4 bg-white/20 rounded-full" />
          <div className="w-3/4 h-8 bg-white/20 rounded-xl" />
          <div className="w-1/2 h-8 bg-white/20 rounded-xl" />
        </div>
        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white/10 rounded-[2rem] p-6 border border-white/10 space-y-3">
            <div className="w-full h-4 bg-white/20 rounded-full" />
            <div className="w-5/6 h-4 bg-white/20 rounded-full" />
            <div className="w-4/6 h-4 bg-white/20 rounded-full" />
          </div>
          <div className="bg-white/10 rounded-[2rem] p-4 border border-white/10 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 font-bricolage select-none text-left">
      {/* Quadrante Superior: Headline */}
      <div
        className={`${
          is916 ? "flex-[1.1] md:flex-[1.2]" : "flex-[1.2]"
        } backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border flex flex-col justify-center relative overflow-hidden transition-colors duration-200 ${
          isLight
            ? "bg-white/60 border-black/10 text-zinc-950"
            : "bg-black/30 border-white/15 text-white"
        }`}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${config.accentColor}30` }}
        />
        <span
          className="text-xs font-mono mb-2 uppercase tracking-widest font-bold"
          style={{ color: config.accentColor }}
        >
          {slide.tag || "INSIGHT"}
        </span>
        <h2
          className={`font-black leading-tight tracking-tight ${
            isLight ? "text-zinc-950" : "text-white"
          }`}
          style={{
            fontSize: `clamp(1.35rem, calc(1.85rem * ${scale}), 3rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h2>
      </div>

      {/* Quadrantes Inferiores: Grid (1:1 / 4:5) ou Stack Vertical Elegante (9:16) */}
      <div className={`flex-1 ${is916 ? "flex flex-col gap-4" : "grid grid-cols-3 gap-4"}`}>
        {/* Box 1: Body Copy com Marca d'Água do Slide + B2B Chart opcional */}
        <div
          className={`${
            is916 ? "flex-1" : "col-span-2"
          } backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border flex flex-col justify-center relative overflow-hidden transition-colors duration-200 ${
            isLight
              ? "bg-white/60 border-black/10"
              : "bg-black/30 border-white/15"
          }`}
        >
          <span
            className={`absolute -bottom-4 -right-2 text-7xl md:text-8xl font-black select-none pointer-events-none font-mono ${
              isLight ? "text-black/5" : "text-white/5"
            }`}
          >
            {String(currentSlide || 1).padStart(2, "0")}
          </span>

          {slide.chartData && slide.chartData.length > 0 ? (
            <div className="relative z-10 w-full my-auto space-y-2">
              <p
                className={`font-normal leading-relaxed ${
                  isLight ? "text-zinc-800" : "text-zinc-200"
                }`}
                style={{
                  fontSize: `clamp(0.8rem, calc(0.95rem * ${scale}), 1.2rem)`,
                }}
              >
                {renderHighlightedText(slide.bodyText, config.accentColor)}
              </p>
              <B2BChart
                data={slide.chartData}
                accentColor={config.accentColor}
                isLight={isLight}
                kpiHighlight={slide.kpiHighlight}
              />
            </div>
          ) : (
            <p
              className={`relative z-10 leading-relaxed font-normal ${
                isLight ? "text-zinc-800" : "text-zinc-200"
              }`}
              style={{
                fontSize: `clamp(0.85rem, calc(1.05rem * ${scale}), 1.35rem)`,
              }}
            >
              {renderHighlightedText(slide.bodyText, config.accentColor)}
            </p>
          )}
        </div>

        {/* Box 2: Elemento Visual/Ação Dinâmica (Stack em 9:16) */}
        <div
          className={`${
            is916 ? "py-4 px-6 flex-row justify-between" : "p-4 flex-col justify-center"
          } backdrop-blur-xl rounded-[2rem] border flex items-center text-center transition-colors duration-200 ${
            isLight
              ? "bg-white/60 border-black/10"
              : "bg-black/30 border-white/15"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center animate-[spin_4s_linear_infinite]"
              style={{ borderColor: `${config.accentColor}60` }}
            >
              <span className="text-lg" style={{ color: config.accentColor }}>
                ✦
              </span>
            </div>
            {is916 && (
              <span
                className={`text-xs font-mono font-bold text-left uppercase tracking-wider ${
                  isLight ? "text-zinc-900" : "text-white"
                }`}
              >
                Key Takeaway B2B
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${
              isLight ? "text-zinc-600" : "text-zinc-400"
            }`}
          >
            {is916 ? "Deslize para ver mais" : "Takeaway"}
          </span>
        </div>
      </div>
    </div>
  );
}

// 22. Apple Mockup (Device Enveloping - MacBook / iPhone com Glare de Vidro)
export function AppleMockupLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  renderHighlightedText,
  isLoadingAI,
}: LayoutProps) {
  const is916 = config.aspectRatio === "9:16";

  if (isLoadingAI) {
    return (
      <div className="w-full h-full flex flex-col justify-center gap-6 p-4 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded-full" />
        <div className="h-10 w-3/4 bg-white/10 rounded-2xl" />
        <div className="flex-1 bg-white/5 rounded-3xl border border-white/10" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between items-center text-center p-2 md:p-4 relative">
      {/* Top Headline & Tag */}
      <div className="space-y-2 max-w-xl mx-auto z-10 mb-2">
        {slide.tag && (
          <span
            className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm"
            style={{
              backgroundColor: `${config.accentColor}20`,
              borderColor: `${config.accentColor}40`,
              color: config.accentColor,
            }}
          >
            {slide.tag}
          </span>
        )}
        <h1
          className={`font-black tracking-tight leading-tight ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.25rem, calc(1.75rem * ${scale}), 2.8rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>
        <p
          className={`text-xs md:text-sm font-normal leading-relaxed line-clamp-2 ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(0.8rem, calc(0.95rem * ${scale}), 1.25rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </div>

      {/* Floating Apple Device Mockup */}
      <div className="w-full flex-1 flex items-center justify-center my-auto relative z-10 max-h-[75%]">
        {is916 ? (
          /* iPhone 16 Pro Vector Mockup Frame */
          <div className="relative w-full max-w-[280px] aspect-[9/18] rounded-[2.8rem] p-3 bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border-4 border-zinc-600/60 shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black z-30 flex items-center justify-end px-2">
              <span className="w-2 h-2 rounded-full bg-blue-500/80 animate-pulse" />
            </div>

            {/* Screen Glass Glare Sheen */}
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)",
              }}
            />

            {/* Device Screen Content */}
            <div className="w-full h-full rounded-[2.2rem] bg-zinc-950 overflow-hidden flex items-center justify-center relative">
              {config.screenshotImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.screenshotImage}
                  alt="Screenshot do Sistema"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                /* Fallback SaaS Dashboard UI Vector */
                <div className="w-full h-full p-4 flex flex-col justify-between text-left font-sans bg-gradient-to-b from-zinc-900 to-black text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 pt-6">
                    <span className="text-[10px] font-bold font-mono text-zinc-300">BLACK LINK OS</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-2 py-4">
                    <span className="text-[9px] font-mono text-zinc-400">MRR ATIVO</span>
                    <span className="text-xl font-black block" style={{ color: config.accentColor }}>
                      R$ 348.900
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: "78%", backgroundColor: config.accentColor }}
                      />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-300">
                    STATUS: 99.8% DISPONIBILIDADE
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MacBook Pro Vector Mockup Frame */
          <div className="relative w-full max-w-lg rounded-2xl p-2 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Screen Glass Glare Sheen */}
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)",
              }}
            />

            {/* macOS Chrome Header Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 rounded-t-xl z-10 relative">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-400">
                <span>🔒</span>
                <span>app.blacklink.com.br/telemetria</span>
              </div>
              <div className="w-8" />
            </div>

            {/* MacBook Screen Display */}
            <div className="w-full aspect-[16/10] bg-zinc-950 rounded-b-xl overflow-hidden relative flex items-center justify-center">
              {config.screenshotImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.screenshotImage}
                  alt="Screenshot do Sistema"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                /* Fallback SaaS Dashboard UI Vector */
                <div className="w-full h-full p-6 flex flex-col justify-between text-left font-sans bg-zinc-950 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold font-mono text-zinc-200">BLACK LINK ANALYTICS</span>
                    <span className="text-[10px] font-mono text-emerald-400">● LIVE PIPELINE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 my-auto">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9px] text-zinc-400 block font-mono">RETENÇÃO</span>
                      <span className="text-lg font-black" style={{ color: config.accentColor }}>
                        98.4%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9px] text-zinc-400 block font-mono">CONVERSÃO</span>
                      <span className="text-lg font-black text-emerald-400">+342%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[9px] text-zinc-400 block font-mono">DEAL SIZE</span>
                      <span className="text-lg font-black text-white">R$ 140K</span>
                    </div>
                  </div>
                  <div className="h-10 w-full bg-white/5 rounded-xl border border-white/10 flex items-center px-3 justify-between text-[10px] font-mono text-zinc-400">
                    <span>TELEMETRIA SINCRONIZADA</span>
                    <span style={{ color: config.accentColor }}>LATÊNCIA: 14ms</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
