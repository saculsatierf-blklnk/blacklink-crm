import React from "react";
import { LayoutProps } from "./layoutTypes";

// 1. Brutalista Tech (Industrial / High-Impact B2B)
export function BrutalistaLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="flex flex-col flex-grow justify-center h-full gap-6 text-left select-none max-w-4xl">
      {/* Industrial Mono Tag */}
      <div className="flex items-center gap-3">
        <span
          className="px-3.5 py-1 rounded font-mono text-xs font-black uppercase tracking-widest border"
          style={{
            backgroundColor: `${config.accentColor}18`,
            borderColor: `${config.accentColor}40`,
            color: config.accentColor,
          }}
        >
          {slide.tag || "BRUTALIST PROTOCOL"}
        </span>
        <span
          className={`text-[11px] font-mono tracking-widest uppercase opacity-40 ${
            isLight ? "text-black" : "text-white"
          }`}
        >
          SYS // 01
        </span>
      </div>

      {/* Colossal Headline */}
      <h1
        className={`font-black uppercase tracking-tight leading-[1.04] ${textPrimaryClass}`}
        style={{
          fontSize: `clamp(2.4rem, calc(3.4rem * ${scale}), 5.8rem)`,
        }}
      >
        {renderHighlightedText(slide.headline, config.accentColor)}
      </h1>

      {/* Industrial Divider Bar */}
      <div className="flex items-center gap-2 my-1">
        <div
          className="h-2 w-28 rounded-full"
          style={{ backgroundColor: config.accentColor }}
        />
        <div
          className="h-2 w-4 rounded-full opacity-40"
          style={{ backgroundColor: config.accentColor }}
        />
      </div>

      {/* Body Copy */}
      <p
        className={`font-normal leading-relaxed max-w-2xl ${textSecondaryClass}`}
        style={{
          fontSize: `clamp(1.2rem, calc(1.45rem * ${scale}), 2.3rem)`,
          lineHeight: 1.6,
        }}
      >
        {renderHighlightedText(slide.bodyText, config.accentColor)}
      </p>
    </div>
  );
}

// 2. Terminal macOS Shell
export function TerminalLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  textMutedClass,
  borderClass,
  cardBgClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex-grow flex flex-col justify-center p-4">
      <div
        className={`w-full rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-md text-left ${borderClass}`}
        style={{
          backgroundColor: isLight ? "#ffffff" : "#0d0e12",
        }}
      >
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-b ${borderClass}`}
          style={{
            backgroundColor: isLight ? "#f4f4f5" : "#16171d",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className={`text-xs font-mono font-medium tracking-tight ${textMutedClass}`}>
            bash ~ blacklink-b2b
          </span>
          <div className="w-14" />
        </div>

        <div className="p-8 md:p-10 font-mono space-y-6">
          <div className="flex items-center gap-2.5 text-sm">
            <span style={{ color: config.accentColor }}>❯</span>
            <span className={textMutedClass}>exec blacklink-insight --strict</span>
          </div>

          <h2
            className={`font-bold tracking-tight leading-snug ${textPrimaryClass}`}
            style={{
              fontSize: `clamp(1.8rem, calc(2.4rem * ${scale}), 3.8rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h2>

          <div
            className={`p-5 rounded-2xl border-l-4 space-y-3 ${cardBgClass}`}
            style={{
              borderLeftColor: config.accentColor,
            }}
          >
            <p className={`font-normal leading-relaxed text-sm md:text-base ${textSecondaryClass}`}>
              {renderHighlightedText(slide.bodyText, config.accentColor)}
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-sm" style={{ color: config.accentColor }}>
            <span>[STATUS: 200 OK]</span>
            <span className="w-2.5 h-5 bg-current animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Wireframe / Blueprint (Esquema de Engenharia de Software)
export function WireframeBlueprintLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div
      className="w-full h-full flex-grow flex flex-col justify-between p-10 rounded-3xl text-left font-mono relative overflow-hidden border border-blue-400/40 shadow-2xl"
      style={{
        backgroundColor: "#071426",
        color: "#ffffff",
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    >
      {/* Blueprint Header Specs */}
      <div className="flex items-center justify-between border-b border-blue-400/30 pb-4 text-xs text-blue-300">
        <span className="font-bold tracking-wider">📐 BLUEPRINT // ESQUEMA TÉCNICO</span>
        <span className="text-xs text-blue-400/80">REV. 2.4 • ISO-9001</span>
      </div>

      {/* Main Technical Specs Content */}
      <div className="my-auto space-y-6 py-4">
        <div className="inline-block px-3.5 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/40 text-xs text-blue-300 tracking-widest uppercase">
          {slide.tag || "ESPECIFICAÇÃO DE ENGENHARIA"}
        </div>

        <h1
          className="font-bold tracking-tight leading-tight text-white"
          style={{
            fontSize: `clamp(2rem, calc(2.7rem * ${scale}), 4.2rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, "#38bdf8")}
        </h1>

        <div className="p-6 rounded-2xl bg-blue-950/60 border border-blue-400/30 text-blue-100 text-sm md:text-base leading-relaxed backdrop-blur-sm">
          {renderHighlightedText(slide.bodyText, "#38bdf8")}
        </div>
      </div>

      {/* Blueprint Technical Footer Coordinates */}
      <div className="flex items-center justify-between pt-4 border-t border-blue-400/30 text-xs text-blue-400 font-mono">
        <span>X: 104.28 // Y: 89.14</span>
        <span>STATUS: HOMOLOGADO</span>
      </div>
    </div>
  );
}

// 4. System Error / Warning (Alerta Crítico / Dor do Cliente)
export function SystemErrorLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex-grow flex flex-col justify-center items-center text-center p-10 rounded-3xl bg-zinc-950 border border-red-500/40 shadow-2xl relative overflow-hidden">
      {/* Background Warning Glow */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

      {/* Error Badge Icon */}
      <div className="w-20 h-20 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-4xl text-red-400 mb-6 shadow-lg shadow-red-500/20 animate-pulse">
        ⚠️
      </div>

      <span className="font-mono text-sm uppercase tracking-widest text-red-400 font-bold mb-3">
        {slide.tag || "CRITICAL SYSTEM WARNING: GARGALO OPERACIONAL"}
      </span>

      <h1
        className="font-black text-white tracking-tight leading-tight max-w-2xl mb-6"
        style={{
          fontSize: `clamp(2rem, calc(2.8rem * ${scale}), 4.5rem)`,
        }}
      >
        {renderHighlightedText(slide.headline, "#ef4444")}
      </h1>

      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 max-w-xl text-zinc-300 text-sm md:text-base leading-relaxed mb-6">
        {renderHighlightedText(slide.bodyText, "#fca5a5")}
      </div>

      <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300">
        COD: 0x80042109 • IMPACTO NEGATIVO IMEDIATO
      </div>
    </div>
  );
}

// 5. Glossy Y2K (Estética Tecnológica Futurista Anos 2000)
export function GlossyY2KLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div
      className="w-full h-full flex-grow flex flex-col justify-between p-10 rounded-3xl text-left relative overflow-hidden shadow-2xl border"
      style={{
        background: "linear-gradient(135deg, #09090e 0%, #161a2e 50%, #0d0f1a 100%)",
        borderColor: "rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Aquatic / Chrome Reflective Orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />

      {/* Glossy Y2K Pill Badge */}
      <div className="flex items-center justify-between z-10">
        <span
          className="px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase border shadow-inner"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)",
            borderColor: "rgba(255,255,255,0.3)",
            color: "#67e8f9",
          }}
        >
          {slide.tag || "CYBER • Y2K 2000"}
        </span>
        <span className="text-cyan-400 font-mono text-sm">✦ ✦ ✦</span>
      </div>

      {/* Main Headline */}
      <div className="my-auto space-y-6 z-10">
        <h1
          className="font-black tracking-tight leading-tight uppercase text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(180deg, #ffffff 30%, #a5f3fc 100%)",
            fontSize: `clamp(2rem, calc(2.8rem * ${scale}), 4.5rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, "#38bdf8")}
        </h1>

        <div
          className="p-6 rounded-2xl border backdrop-blur-xl shadow-lg"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)",
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <p
            className="text-zinc-200 leading-relaxed font-sans text-sm md:text-base"
            style={{
              fontSize: `clamp(1.05rem, calc(1.3rem * ${scale}), 1.8rem)`,
            }}
          >
            {renderHighlightedText(slide.bodyText, "#67e8f9")}
          </p>
        </div>
      </div>

      {/* Y2K Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-cyan-300/80 z-10 border-t border-white/10 pt-4">
        <span>FUTURE TECH INTERFACE</span>
        <span>BLACK LINK CYBER</span>
      </div>
    </div>
  );
}
