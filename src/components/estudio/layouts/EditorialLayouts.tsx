import React from "react";
import { LayoutProps } from "./layoutTypes";

// 6. Minimal Editorial Luxo
export function MinimalLayout({
  slide,
  config,
  scale,
  textPrimaryClass,
  textSecondaryClass,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full gap-5 text-center max-w-lg mx-auto">
      <div
        className="w-8 h-1 rounded-full"
        style={{ backgroundColor: config.accentColor }}
      />
      <h1
        className={`font-bold tracking-tight leading-snug ${textPrimaryClass}`}
        style={{
          fontSize: `clamp(1.6rem, calc(2.2rem * ${scale}), 3.5rem)`,
        }}
      >
        {renderHighlightedText(slide.headline, config.accentColor)}
      </h1>
      <p
        className={`font-normal leading-relaxed max-w-md ${textSecondaryClass}`}
        style={{
          fontSize: `clamp(0.95rem, calc(1.1rem * ${scale}), 1.5rem)`,
        }}
      >
        {renderHighlightedText(slide.bodyText, config.accentColor)}
      </p>
    </div>
  );
}

// 7. Notion Doc (Documento Limpo)
export function NotionDocLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-[#fafafa] text-zinc-900 border border-zinc-200/80 shadow-xl text-left relative overflow-hidden">
      {/* Notion Doc Breadcrumbs & Icon */}
      <div className="flex items-center gap-2 mb-4 text-xs text-zinc-500 font-sans border-b border-zinc-200/70 pb-3">
        <span className="text-base select-none">📄</span>
        <span className="font-medium text-zinc-700">Black Link</span>
        <span>/</span>
        <span className="text-zinc-600">Estratégia B2B</span>
        <span>/</span>
        <span className="text-zinc-900 font-semibold truncate">
          {slide.tag || "Insight"}
        </span>
      </div>

      {/* Notion Doc Serif Title */}
      <div className="my-auto space-y-4">
        <h1
          className="font-playfair font-black text-zinc-950 tracking-tight leading-snug"
          style={{
            fontSize: `clamp(1.5rem, calc(2.1rem * ${scale}), 3.4rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        {/* Callout Box com Destaque Notion */}
        <div className="p-4 rounded-xl bg-zinc-100/90 border-l-4 border-zinc-500 space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="text-sm select-none">💡</span>
            <p
              className="text-zinc-700 leading-relaxed font-sans text-xs md:text-sm"
              style={{
                fontSize: `clamp(0.85rem, calc(1rem * ${scale}), 1.4rem)`,
              }}
            >
              {renderHighlightedText(slide.bodyText, config.accentColor)}
            </p>
          </div>
        </div>
      </div>

      {/* Propriedades do Documento Notion */}
      <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono pt-3 border-t border-zinc-200/70 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Status: Concluído
        </span>
        <span>•</span>
        <span>Autor: {config.authorName}</span>
      </div>
    </div>
  );
}

// 8. Magazine Cover (Capa de Revista Forbes / B2B)
export function MagazineCoverLayout({
  slide,
  config,
  scale,
  isLight,
  renderHighlightedText,
}: LayoutProps) {
  return (
    <div
      className="w-full h-full flex flex-col justify-between p-6 md:p-8 rounded-2xl text-left relative overflow-hidden shadow-2xl border"
      style={{
        backgroundColor: isLight ? "#f4f4f5" : "#08090c",
        borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)",
      }}
    >
      {/* Top Masthead Revista */}
      <div className="flex items-center justify-between border-b-2 border-current pb-2">
        <span className="font-serif font-black tracking-widest text-2xl md:text-3xl uppercase">
          BLACK LINK
        </span>
        <div className="text-right font-mono text-[10px] leading-tight">
          <span className="block font-bold">EDIÇÃO ESPECIAL</span>
          <span className="opacity-70">VOL. 24 // OUTUBRO</span>
        </div>
      </div>

      {/* Center Hero Content with Avatar cut-out style */}
      <div className="my-auto py-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 space-y-3 z-10">
          <span
            className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider text-black bg-white"
            style={{
              backgroundColor: config.accentColor,
              color: isLight ? "#000000" : "#ffffff",
            }}
          >
            {slide.tag || "MATÉRIA DE CAPA"}
          </span>

          <h1
            className="font-serif font-black uppercase tracking-tight leading-[1.05]"
            style={{
              fontSize: `clamp(1.6rem, calc(2.2rem * ${scale}), 3.6rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h1>

          <p className="font-sans font-medium text-xs md:text-sm leading-relaxed opacity-90 max-w-sm">
            {renderHighlightedText(slide.bodyText, config.accentColor)}
          </p>
        </div>

        {/* Right Author Portrait Cut-Out */}
        <div className="md:col-span-4 flex items-center justify-center">
          {config.authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.authorAvatar}
              alt={config.authorName}
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-2xl border-2 border-white/20 filter contrast-125"
            />
          ) : (
            <div
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl flex items-center justify-center font-black text-4xl shadow-2xl border-2 border-white/20"
              style={{ backgroundColor: config.accentColor, color: "#ffffff" }}
            >
              BL
            </div>
          )}
        </div>
      </div>

      {/* Barcode & Magazine Issue Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-current/20 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="tracking-widest font-bold">|||| | ||||| ||| ||||</span>
          <span>B2B-LEADERSHIP-INDEX</span>
        </div>
        <span>R$ 49,90 // BRASIL</span>
      </div>
    </div>
  );
}

// 9. Newspaper Broadsheet (Jornal Financeiro Tradicional WSJ)
export function NewspaperBroadsheetLayout({
  slide,
  config,
  scale,
  renderHighlightedText,
}: LayoutProps) {
  const firstLetter = slide.bodyText ? slide.bodyText.charAt(0) : "A";
  const restOfBody = slide.bodyText ? slide.bodyText.slice(1) : "";

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-[#f5f1ea] text-[#1c1917] border border-[#d6cfc4] shadow-xl text-left font-serif relative overflow-hidden">
      {/* Newspaper Masthead */}
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <h3 className="font-serif font-black tracking-widest text-2xl md:text-3xl uppercase">
          THE FINANCIAL JOURNAL
        </h3>
        <div className="flex items-center justify-between text-[10px] font-sans text-stone-600 border-t border-b border-stone-300 py-0.5 mt-1 font-semibold uppercase">
          <span>SÃO PAULO • BRASIL</span>
          <span>EDIÇÃO DE NEGÓCIOS & TECNOLOGIA</span>
          <span>CIRCULAÇÃO NACIONAL</span>
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-3 my-auto">
        <h1
          className="font-serif font-black tracking-tight leading-tight text-stone-950 text-center"
          style={{
            fontSize: `clamp(1.4rem, calc(2rem * ${scale}), 3.2rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        {/* Double divider */}
        <div className="border-t border-b border-black py-0.5" />

        {/* 2-Column Newspaper Article with Drop Cap (Stack em 9:16) */}
        <div
          className={`${
            config.aspectRatio === "9:16"
              ? "flex flex-col gap-4"
              : "grid grid-cols-1 md:grid-cols-2 gap-4"
          } text-xs leading-relaxed text-stone-800 font-serif`}
        >
          <div>
            <span className="float-left text-4xl md:text-5xl font-serif font-black leading-none mr-2 text-stone-950 uppercase">
              {firstLetter}
            </span>
            <p className="inline">
              {renderHighlightedText(restOfBody, config.accentColor)}
            </p>
          </div>
          <div className="p-3 bg-[#ebe5db] rounded border-l-2 border-stone-900 text-[11px] font-sans text-stone-700 italic">
            &ldquo;A precisão na tomada de decisão corporativa separa líderes de mercado dos concorrentes estagnados.&rdquo;
            <span className="block mt-2 font-bold font-mono not-italic text-[10px] text-stone-900">
              — Análise Especial Black Link
            </span>
          </div>
        </div>
      </div>

      {/* Newspaper Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 border-t border-stone-300 pt-2 mt-2">
        <span>CADERNO DE MERCADO // PÁG. 03</span>
        <span>BLACK LINK CRM FINANCIAL EDITORIAL</span>
      </div>
    </div>
  );
}
