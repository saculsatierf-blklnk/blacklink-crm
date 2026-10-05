import React from "react";
import { LayoutProps } from "./layoutTypes";
import { B2BChart } from "../B2BChart";

// 15. Glass Floating 3D (Card Flutuante em Vidro de Alta Resolução)
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
    <div className="flex flex-col flex-grow items-center justify-center h-full p-6 text-left select-none relative">
      {/* Ambient Depth Orbs */}
      <div
        className="absolute top-1/4 -left-12 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-40"
        style={{ backgroundColor: config.accentColor }}
      />
      <div
        className="absolute bottom-1/4 -right-12 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-25"
        style={{ backgroundColor: isLight ? "#000000" : "#ffffff" }}
      />

      <div
        className={`w-full max-w-2xl p-12 md:p-14 rounded-[2.5rem] border shadow-2xl backdrop-blur-3xl text-left relative overflow-hidden transition-all duration-300 ${borderClass}`}
        style={{
          backgroundColor: isLight
            ? "rgba(255, 255, 255, 0.85)"
            : "rgba(12, 13, 18, 0.78)",
          boxShadow: isLight
            ? "0 30px 60px -15px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
            : `0 35px 70px -15px rgba(0, 0, 0, 0.8), 0 0 40px ${config.accentColor}18, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
        }}
      >
        {/* Specular Top Hairline */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest border shadow-sm"
              style={{
                backgroundColor: `${config.accentColor}18`,
                borderColor: `${config.accentColor}40`,
                color: config.accentColor,
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: config.accentColor }}
              />
              {slide.tag || "INSIGHT ESTRATÉGICO"}
            </span>
          </div>

          <h1
            className={`font-black tracking-tight leading-[1.12] ${textPrimaryClass}`}
            style={{
              fontSize: `clamp(2.2rem, calc(2.9rem * ${scale}), 4.8rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h1>

          <p
            className={`font-normal leading-relaxed ${textSecondaryClass}`}
            style={{
              fontSize: `clamp(1.15rem, calc(1.4rem * ${scale}), 2.2rem)`,
              lineHeight: 1.6,
            }}
          >
            {renderHighlightedText(slide.bodyText, config.accentColor)}
          </p>
        </div>
      </div>
    </div>
  );
}

// 16. Dashboard / Analytics (Painel BI com Gráficos e Telemetria Neon Dinâmica)
export function DashboardAnalyticsLayout({
  slide,
  config,
  scale,
  textPrimaryClass,
  textSecondaryClass,
  textMutedClass,
  renderHighlightedText,
}: LayoutProps) {
  const accent = config.accentColor || "#38bdf8";

  return (
    <div
      className="w-full h-full flex-grow flex flex-col justify-between p-10 md:p-12 rounded-[2.5rem] bg-[#08090d] border shadow-2xl relative overflow-hidden text-left font-mono select-none"
      style={{
        borderColor: `${accent}40`,
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 50px ${accent}15`,
      }}
    >
      {/* Background Soft Neon Glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[130px] pointer-events-none opacity-25"
        style={{ backgroundColor: accent }}
      />

      {/* Top BI Header */}
      <div
        className="flex items-center justify-between border-b pb-4 z-10"
        style={{ borderColor: `${accent}25` }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full animate-pulse shadow-sm"
            style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
          />
          <span
            className="text-xs md:text-sm font-bold tracking-wider uppercase font-mono"
            style={{ color: accent }}
          >
            RADAR B2B // TELEMETRIA DE ALTO NÍVEL
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono tracking-widest">
          SISTEMA SINCRONIZADO
        </span>
      </div>

      {/* Center KPI & Headline */}
      <div className="my-auto space-y-6 py-4 z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div
            className="p-4 rounded-2xl bg-black/60 border backdrop-blur-md"
            style={{ borderColor: `${accent}25` }}
          >
            <span className="block text-[11px] text-zinc-400 uppercase tracking-wider">EFICIÊNCIA</span>
            <span className="text-2xl md:text-3xl font-black" style={{ color: accent }}>+342%</span>
          </div>
          <div
            className="p-4 rounded-2xl bg-black/60 border backdrop-blur-md"
            style={{ borderColor: `${accent}25` }}
          >
            <span className="block text-[11px] text-zinc-400 uppercase tracking-wider">RESPOSTA</span>
            <span className="text-2xl md:text-3xl font-black text-emerald-400">18ms</span>
          </div>
          <div
            className="p-4 rounded-2xl bg-black/60 border backdrop-blur-md"
            style={{ borderColor: `${accent}25` }}
          >
            <span className="block text-[11px] text-zinc-400 uppercase tracking-wider">RETENÇÃO</span>
            <span className="text-2xl md:text-3xl font-black text-white">99.4%</span>
          </div>
        </div>

        <h1
          className={`font-black tracking-tight leading-[1.12] ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.9rem, calc(2.6rem * ${scale}), 4.2rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, accent)}
        </h1>

        <p
          className={`text-sm md:text-base leading-relaxed ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(1.05rem, calc(1.3rem * ${scale}), 2rem)`,
            lineHeight: 1.6,
          }}
        >
          {renderHighlightedText(slide.bodyText, accent)}
        </p>

        {/* Dynamic Accent SVG Area Sparkline */}
        <div
          className="w-full h-16 bg-black/50 rounded-2xl p-3 border flex items-end overflow-hidden"
          style={{ borderColor: `${accent}25` }}
        >
          <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dashboardSparkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
                <stop offset="100%" stopColor={accent} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0 35 Q30 18, 60 26 T120 10 T160 16 T200 4 L200 40 L0 40 Z"
              fill="url(#dashboardSparkGradient)"
            />
            <path
              d="M0 35 Q30 18, 60 26 T120 10 T160 16 T200 4"
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* BI Footer */}
      <div
        className="flex items-center justify-between text-xs border-t pt-3 z-10"
        style={{ borderColor: `${accent}25`, color: `${accent}bb` }}
      >
        <span>PIPELINE: ATIVO • DADOS REAIS</span>
        <span className={textMutedClass}>BLACK LINK // DECISÃO C-LEVEL</span>
      </div>
    </div>
  );
}

// 17. Checklist / Kanban (Colunas & Passo a Passo)
export function ChecklistKanbanLayout({
  slide,
  config,
  scale,
  textPrimaryClass,
  textSecondaryClass,
  borderClass,
  cardBgClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div
      className={`w-full h-full flex-grow flex flex-col justify-between p-10 rounded-3xl border shadow-xl backdrop-blur-md text-left ${cardBgClass} ${borderClass}`}
    >
      {/* Header com Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-current/10">
        <span
          className="text-xs font-mono uppercase font-bold tracking-widest px-3 py-1 rounded"
          style={{ backgroundColor: `${config.accentColor}20`, color: config.accentColor }}
        >
          {slide.tag || "FRAMEWORK DE EXECUÇÃO"}
        </span>
        <span className="text-xs font-mono opacity-70">STATUS: EM PROGRESSO</span>
      </div>

      {/* Headline */}
      <div className="my-auto space-y-6">
        <h1
          className={`font-black tracking-tight leading-snug ${textPrimaryClass}`}
          style={{
            fontSize: `clamp(1.8rem, calc(2.5rem * ${scale}), 4rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        <p className={`text-sm md:text-base leading-relaxed ${textSecondaryClass}`}>
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>

        {/* 3 Step Kanban Cards / Checklist */}
        <div className="space-y-3 pt-2">
          {[
            { step: "01", title: "Diagnóstico e Mapeamento de Gargalos", done: true },
            { step: "02", title: "Automação da Esteira Comercial", done: true },
            { step: "03", title: "Escala com Inteligência de Dados", done: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-3.5 rounded-2xl border ${borderClass} ${
                item.done ? "bg-emerald-500/10" : "bg-black/20"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                  item.done ? "bg-emerald-500 text-black" : "border border-zinc-500 text-zinc-500"
                }`}
              >
                {item.done ? "✓" : item.step}
              </div>
              <span className={`text-sm font-medium ${item.done ? textPrimaryClass : "opacity-60"}`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs font-mono opacity-60 pt-3 border-t border-current/10">
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
  textPrimaryClass,
  textSecondaryClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex-grow flex flex-col items-center justify-center p-6">
      {/* MacBook Screen Window */}
      <div className="w-full max-w-3xl rounded-3xl border border-white/20 shadow-2xl bg-zinc-950 overflow-hidden text-left relative">
        {/* Browser Top Chrome Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
          </div>

          <div className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-zinc-800 text-xs font-mono text-zinc-300 max-w-[260px] truncate">
            <span className="text-zinc-500">🔒</span>
            <span>app.blacklink.com.br/insight</span>
          </div>

          <div className="w-10" />
        </div>

        {/* Viewport Content */}
        <div className="p-8 md:p-10 space-y-6 bg-zinc-950">
          {slide.tag && (
            <span
              className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded"
              style={{ backgroundColor: `${config.accentColor}25`, color: config.accentColor }}
            >
              {slide.tag}
            </span>
          )}

          <h1
            className={`font-black tracking-tight leading-tight ${textPrimaryClass}`}
            style={{
              fontSize: `clamp(1.8rem, calc(2.4rem * ${scale}), 3.8rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h1>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <p className={`text-sm md:text-base leading-relaxed ${textSecondaryClass}`}>
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
    <div className="w-full h-full flex-grow flex flex-col items-center justify-center p-8 bg-[#e5e7eb] rounded-3xl relative overflow-hidden">
      {/* Desk Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Yellow Sticky Note Card */}
      <div className="w-full max-w-xl bg-[#fef08a] text-zinc-900 p-10 rounded-sm shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300 relative text-left border-t-8 border-[#fde047]">
        {/* Push Pin Icon */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-600 shadow-md border-2 border-white flex items-center justify-center text-xs text-white">
          📌
        </div>

        <span className="text-xs font-mono uppercase tracking-widest font-bold text-amber-800 block mb-3">
          {slide.tag || "MEMO EXECUTIVO // URGENTE"}
        </span>

        <h1
          className="font-black tracking-tight leading-snug mb-4 text-zinc-950 font-sans"
          style={{
            fontSize: `clamp(1.8rem, calc(2.4rem * ${scale}), 3.8rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, "#d97706")}
        </h1>

        <p
          className="text-zinc-800 font-sans leading-relaxed text-sm md:text-base"
          style={{
            fontSize: `clamp(1.05rem, calc(1.25rem * ${scale}), 1.8rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, "#b45309")}
        </p>

        <div className="pt-6 mt-6 border-t border-amber-300/80 flex items-center justify-between text-xs font-mono text-amber-900">
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
    <div className="w-full h-full flex-grow flex flex-col justify-center items-center text-center p-10 rounded-3xl bg-black text-white relative overflow-hidden shadow-2xl">
      {/* Massive Glowing Aura Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/35 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/30 blur-[140px] pointer-events-none" />
      <div className="absolute center w-64 h-64 rounded-full bg-emerald-500/25 blur-[120px] pointer-events-none" />

      {/* Aura Pill Badge */}
      <div className="z-10 mb-6">
        <span
          className="px-5 py-2 rounded-full text-xs font-mono font-bold tracking-widest uppercase border backdrop-blur-xl shadow-lg"
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
      <div className="z-10 max-w-2xl mx-auto space-y-6">
        <h1
          className="font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl"
          style={{
            fontSize: `clamp(2.4rem, calc(3.4rem * ${scale}), 5.5rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        <p
          className="text-zinc-300 font-normal leading-relaxed max-w-lg mx-auto drop-shadow-lg"
          style={{
            fontSize: `clamp(1.15rem, calc(1.4rem * ${scale}), 2.2rem)`,
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
      <div className="w-full h-full flex flex-col gap-6 font-bricolage animate-pulse">
        <div className="flex-[1.2] bg-white/10 rounded-[2.5rem] p-10 border border-white/10 flex flex-col justify-center space-y-4">
          <div className="w-32 h-5 bg-white/20 rounded-full" />
          <div className="w-3/4 h-12 bg-white/20 rounded-2xl" />
          <div className="w-1/2 h-12 bg-white/20 rounded-2xl" />
        </div>
        <div className="flex-1 grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white/10 rounded-[2.5rem] p-8 border border-white/10 space-y-4">
            <div className="w-full h-5 bg-white/20 rounded-full" />
            <div className="w-5/6 h-5 bg-white/20 rounded-full" />
            <div className="w-4/6 h-5 bg-white/20 rounded-full" />
          </div>
          <div className="bg-white/10 rounded-[2.5rem] p-6 border border-white/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-grow flex flex-col gap-6 font-bricolage select-none text-left">
      {/* Quadrante Superior: Headline */}
      <div
        className={`${
          is916 ? "flex-[1.2]" : "flex-[1.2]"
        } backdrop-blur-xl rounded-[2.5rem] p-10 border flex flex-col justify-center relative overflow-hidden transition-colors duration-200 ${
          isLight
            ? "bg-white/60 border-black/10 text-zinc-950"
            : "bg-black/30 border-white/15 text-white"
        }`}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${config.accentColor}30` }}
        />
        <span
          className="text-sm font-mono mb-3 uppercase tracking-widest font-bold"
          style={{ color: config.accentColor }}
        >
          {slide.tag || "INSIGHT"}
        </span>
        <h2
          className={`font-black leading-tight tracking-tight ${
            isLight ? "text-zinc-950" : "text-white"
          }`}
          style={{
            fontSize: `clamp(2rem, calc(2.75rem * ${scale}), 4.5rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h2>
      </div>

      {/* Quadrantes Inferiores: Grid (1:1 / 4:5) ou Stack Vertical Elegante (9:16) */}
      <div className={`flex-1 ${is916 ? "flex flex-col gap-6" : "grid grid-cols-3 gap-6"}`}>
        {/* Box 1: Body Copy com Marca d'Água do Slide + B2B Chart opcional */}
        <div
          className={`${
            is916 ? "flex-1" : "col-span-2"
          } backdrop-blur-xl rounded-[2.5rem] p-10 border flex flex-col justify-center relative overflow-hidden transition-colors duration-200 ${
            isLight
              ? "bg-white/60 border-black/10"
              : "bg-black/30 border-white/15"
          }`}
        >
          <span
            className={`absolute -bottom-6 -right-2 text-8xl md:text-9xl font-black select-none pointer-events-none font-mono ${
              isLight ? "text-black/5" : "text-white/5"
            }`}
          >
            {String(currentSlide || 1).padStart(2, "0")}
          </span>

          {slide.chartData && slide.chartData.length > 0 ? (
            <div className="relative z-10 w-full my-auto space-y-4">
              <p
                className={`font-normal leading-relaxed ${
                  isLight ? "text-zinc-800" : "text-zinc-200"
                }`}
                style={{
                  fontSize: `clamp(1rem, calc(1.2rem * ${scale}), 1.8rem)`,
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
                fontSize: `clamp(1.1rem, calc(1.4rem * ${scale}), 2.2rem)`,
              }}
            >
              {renderHighlightedText(slide.bodyText, config.accentColor)}
            </p>
          )}
        </div>

        {/* Box 2: Card Executivo de Takeaway / Status Tático */}
        <div
          className={`${
            is916 ? "py-6 px-8 flex-row justify-between" : "p-8 flex-col justify-between"
          } backdrop-blur-xl rounded-[2.5rem] border flex items-center transition-colors duration-200 relative overflow-hidden ${
            isLight
              ? "bg-white/70 border-black/10"
              : "bg-black/40 border-white/15"
          }`}
          style={{
            boxShadow: isLight
              ? "0 10px 30px rgba(0,0,0,0.05)"
              : `0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
            style={{ backgroundColor: config.accentColor }}
          />

          <div className="flex items-center gap-3.5 z-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl shadow-md border"
              style={{
                backgroundColor: `${config.accentColor}20`,
                borderColor: `${config.accentColor}40`,
                color: config.accentColor,
              }}
            >
              ✦
            </div>
            <div className="text-left">
              <span
                className={`text-xs font-mono font-bold uppercase tracking-wider block ${
                  isLight ? "text-zinc-950" : "text-white"
                }`}
              >
                {is916 ? "DIRETRIZ DE AÇÃO" : "KEY TAKEAWAY"}
              </span>
              <span
                className={`text-[11px] font-mono tracking-tight block ${
                  isLight ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                ESTRATÉGIA B2B
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: config.accentColor }}
            />
            <span
              className={`text-[11px] font-mono uppercase tracking-widest font-bold ${
                isLight ? "text-zinc-700" : "text-zinc-300"
              }`}
            >
              {is916 ? "DESLIZE ❯" : "APLICAR"}
            </span>
          </div>
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
  textPrimaryClass,
  textSecondaryClass,
  renderHighlightedText,
  isLoadingAI,
}: LayoutProps) {
  const is916 = config.aspectRatio === "9:16";

  if (isLoadingAI) {
    return (
      <div className="w-full h-full flex flex-col justify-center gap-8 p-6 animate-pulse">
        <div className="h-6 w-36 bg-white/10 rounded-full" />
        <div className="h-12 w-3/4 bg-white/10 rounded-2xl" />
        <div className="flex-1 bg-white/5 rounded-3xl border border-white/10" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-grow flex flex-col justify-between items-center text-center p-6 relative">
      {/* Top Headline & Tag */}
      <div className="space-y-3 max-w-2xl mx-auto z-10 mb-3">
        {slide.tag && (
          <span
            className="inline-block px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-sm"
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
            fontSize: `clamp(1.8rem, calc(2.4rem * ${scale}), 3.8rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>
        <p
          className={`text-sm md:text-base font-normal leading-relaxed line-clamp-2 ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(1rem, calc(1.25rem * ${scale}), 1.8rem)`,
          }}
        >
          {renderHighlightedText(slide.bodyText, config.accentColor)}
        </p>
      </div>

      {/* Floating Apple Device Mockup */}
      <div className="w-full flex-1 flex items-center justify-center my-auto relative z-10">
        {is916 ? (
          /* iPhone 16 Pro Vector Mockup Frame */
          <div className="relative w-full max-w-[360px] aspect-[9/18] rounded-[3.2rem] p-4 bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border-4 border-zinc-600/60 shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
            {/* Dynamic Island */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-black z-30 flex items-center justify-end px-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80 animate-pulse" />
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
            <div className="w-full h-full rounded-[2.6rem] bg-zinc-950 overflow-hidden flex items-center justify-center relative">
              {config.screenshotImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.screenshotImage}
                  alt="Screenshot do Sistema"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                /* Fallback SaaS Dashboard UI Vector */
                <div className="w-full h-full p-6 flex flex-col justify-between text-left font-sans bg-gradient-to-b from-zinc-900 to-black text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 pt-8">
                    <span className="text-xs font-bold font-mono text-zinc-300">BLACK LINK OS</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-3 py-6">
                    <span className="text-xs font-mono text-zinc-400">MRR ATIVO</span>
                    <span className="text-2xl font-black block" style={{ color: config.accentColor }}>
                      R$ 348.900
                    </span>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: "78%", backgroundColor: config.accentColor }}
                      />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
                    STATUS: 99.8% DISPONIBILIDADE
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MacBook Pro Vector Mockup Frame */
          <div className="relative w-full max-w-2xl rounded-3xl p-3 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Screen Glass Glare Sheen */}
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)",
              }}
            />

            {/* macOS Chrome Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 rounded-t-2xl z-10 relative">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-zinc-800 text-xs font-mono text-zinc-400">
                <span>🔒</span>
                <span>app.blacklink.com.br/telemetria</span>
              </div>
              <div className="w-10" />
            </div>

            {/* MacBook Screen Display */}
            <div className="w-full aspect-[16/10] bg-zinc-950 rounded-b-2xl overflow-hidden relative flex items-center justify-center">
              {config.screenshotImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.screenshotImage}
                  alt="Screenshot do Sistema"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                /* Fallback SaaS Dashboard UI Vector */
                <div className="w-full h-full p-8 flex flex-col justify-between text-left font-sans bg-zinc-950 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-sm font-bold font-mono text-zinc-200">BLACK LINK ANALYTICS</span>
                    <span className="text-xs font-mono text-emerald-400">● LIVE PIPELINE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 my-auto">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-xs text-zinc-400 block font-mono">RETENÇÃO</span>
                      <span className="text-xl font-black" style={{ color: config.accentColor }}>
                        98.4%
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-xs text-zinc-400 block font-mono">CONVERSÃO</span>
                      <span className="text-xl font-black text-emerald-400">+342%</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-xs text-zinc-400 block font-mono">DEAL SIZE</span>
                      <span className="text-xl font-black text-white">R$ 140K</span>
                    </div>
                  </div>
                  <div className="h-12 w-full bg-white/5 rounded-2xl border border-white/10 flex items-center px-4 justify-between text-xs font-mono text-zinc-400">
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
