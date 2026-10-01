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
    <div className="flex flex-col flex-grow justify-center items-center h-full gap-8 text-center max-w-3xl mx-auto">
      <div
        className="w-16 h-2 rounded-full"
        style={{ backgroundColor: config.accentColor }}
      />
      <h1
        className={`font-bold tracking-tight leading-snug ${textPrimaryClass}`}
        style={{
          fontSize: `clamp(2.2rem, calc(3rem * ${scale}), 5rem)`,
        }}
      >
        {renderHighlightedText(slide.headline, config.accentColor)}
      </h1>
      <p
        className={`font-normal leading-relaxed max-w-xl ${textSecondaryClass}`}
        style={{
          fontSize: `clamp(1.15rem, calc(1.4rem * ${scale}), 2.2rem)`,
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
    <div className="w-full h-full flex-grow flex flex-col justify-between p-10 rounded-3xl bg-[#fafafa] text-zinc-900 border border-zinc-200/80 shadow-xl text-left relative overflow-hidden">
      {/* Notion Doc Breadcrumbs & Icon */}
      <div className="flex items-center gap-3 mb-6 text-sm text-zinc-500 font-sans border-b border-zinc-200/70 pb-4">
        <span className="text-xl select-none">📄</span>
        <span className="font-medium text-zinc-700">Black Link</span>
        <span>/</span>
        <span className="text-zinc-600">Estratégia B2B</span>
        <span>/</span>
        <span className="text-zinc-900 font-semibold truncate">
          {slide.tag || "Insight"}
        </span>
      </div>

      {/* Notion Doc Serif Title */}
      <div className="my-auto space-y-6">
        <h1
          className="font-playfair font-black text-zinc-950 tracking-tight leading-snug"
          style={{
            fontSize: `clamp(2rem, calc(2.7rem * ${scale}), 4.5rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        {/* Callout Box com Destaque Notion */}
        <div className="p-6 rounded-2xl bg-zinc-100/90 border-l-4 border-zinc-500 space-y-3">
          <div className="flex items-start gap-3.5">
            <span className="text-lg select-none">💡</span>
            <p
              className="text-zinc-700 leading-relaxed font-sans text-sm md:text-base"
              style={{
                fontSize: `clamp(1.05rem, calc(1.25rem * ${scale}), 1.8rem)`,
              }}
            >
              {renderHighlightedText(slide.bodyText, config.accentColor)}
            </p>
          </div>
        </div>
      </div>

      {/* Propriedades do Documento Notion */}
      <div className="flex items-center gap-6 text-xs text-zinc-400 font-mono pt-4 border-t border-zinc-200/70 mt-3">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
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
      className="w-full h-full flex-grow flex flex-col justify-between p-10 rounded-3xl text-left relative overflow-hidden shadow-2xl border"
      style={{
        backgroundColor: isLight ? "#f4f4f5" : "#08090c",
        borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)",
      }}
    >
      {/* Top Masthead Revista */}
      <div className="flex items-center justify-between border-b-2 border-current pb-4">
        <span className="font-serif font-black tracking-widest text-3xl md:text-4xl uppercase">
          BLACK LINK
        </span>
        <div className="text-right font-mono text-xs leading-tight">
          <span className="block font-bold">EDIÇÃO ESPECIAL</span>
          <span className="opacity-70">VOL. 24 // OUTUBRO</span>
        </div>
      </div>

      {/* Center Hero Content with Avatar cut-out style */}
      <div className="my-auto py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-4 z-10">
          <span
            className="inline-block px-3.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider text-black bg-white"
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
              fontSize: `clamp(2.2rem, calc(3rem * ${scale}), 5rem)`,
            }}
          >
            {renderHighlightedText(slide.headline, config.accentColor)}
          </h1>

          <p className="font-sans font-medium text-sm md:text-base leading-relaxed opacity-90 max-w-md">
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
              className="w-36 h-36 md:w-44 md:h-44 rounded-3xl object-cover shadow-2xl border-4 border-white/20 filter contrast-125"
            />
          ) : (
            <div
              className="w-36 h-36 md:w-44 md:h-44 rounded-3xl flex items-center justify-center font-black text-5xl shadow-2xl border-4 border-white/20"
              style={{ backgroundColor: config.accentColor, color: "#ffffff" }}
            >
              BL
            </div>
          )}
        </div>
      </div>

      {/* Barcode & Magazine Issue Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-current/20 font-mono text-xs">
        <div className="flex items-center gap-3">
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
    <div className="w-full h-full flex-grow flex flex-col justify-between p-10 rounded-3xl bg-[#f5f1ea] text-[#1c1917] border border-[#d6cfc4] shadow-xl text-left font-serif relative overflow-hidden">
      {/* Newspaper Masthead */}
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h3 className="font-serif font-black tracking-widest text-3xl md:text-4xl uppercase">
          THE FINANCIAL JOURNAL
        </h3>
        <div className="flex items-center justify-between text-xs font-sans text-stone-600 border-t border-b border-stone-300 py-1 mt-1.5 font-semibold uppercase">
          <span>SÃO PAULO • BRASIL</span>
          <span>EDIÇÃO DE NEGÓCIOS & TECNOLOGIA</span>
          <span>CIRCULAÇÃO NACIONAL</span>
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-4 my-auto">
        <h1
          className="font-serif font-black tracking-tight leading-tight text-stone-950 text-center"
          style={{
            fontSize: `clamp(1.9rem, calc(2.6rem * ${scale}), 4.4rem)`,
          }}
        >
          {renderHighlightedText(slide.headline, config.accentColor)}
        </h1>

        {/* Double divider */}
        <div className="border-t border-b border-black py-0.5" />

        {/* 2-Column Newspaper Article with Drop Cap */}
        <div
          className={`${
            config.aspectRatio === "9:16"
              ? "flex flex-col gap-6"
              : "grid grid-cols-1 md:grid-cols-2 gap-6"
          } text-sm leading-relaxed text-stone-800 font-serif`}
        >
          <div>
            <span className="float-left text-5xl md:text-6xl font-serif font-black leading-none mr-3 text-stone-950 uppercase">
              {firstLetter}
            </span>
            <p className="inline">
              {renderHighlightedText(restOfBody, config.accentColor)}
            </p>
          </div>
          <div className="p-4 bg-[#ebe5db] rounded-xl border-l-4 border-stone-900 text-xs font-sans text-stone-700 italic">
            &ldquo;A precisão na tomada de decisão corporativa separa líderes de mercado dos concorrentes estagnados.&rdquo;
            <span className="block mt-2 font-bold font-mono not-italic text-xs text-stone-900">
              — Análise Especial Black Link
            </span>
          </div>
        </div>
      </div>

      {/* Newspaper Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-t border-stone-300 pt-3 mt-3">
        <span>CADERNO DE MERCADO // PÁG. 03</span>
        <span>BLACK LINK CRM FINANCIAL EDITORIAL</span>
      </div>
    </div>
  );
}
