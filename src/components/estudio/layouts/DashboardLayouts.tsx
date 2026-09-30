import React from "react";
import { LayoutProps } from "./layoutTypes";

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
