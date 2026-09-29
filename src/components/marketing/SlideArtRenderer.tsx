"use client";

import React from "react";

interface SlideArtRendererProps {
  headline: string;
  bodyText: string;
  slideNumber?: number;
  totalSlides?: number;
  format?: "carousel" | "story" | "post";
  tenantName?: string;
  niche?: string;
  className?: string;
}

/**
 * Motor de Renderização de Criativos B2B (Dark Industrial)
 * Implementa a estética de alta densidade especificada para o Black Link CRM.
 * Garante que apenas headline e bodyText sejam renderizados no canvas visual.
 */
export function SlideArtRenderer({
  headline,
  bodyText,
  slideNumber = 1,
  totalSlides = 5,
  format = "carousel",
  tenantName = "BLACK LINK",
  niche,
  className = "",
}: SlideArtRendererProps) {
  const isStory = format === "story";
  const slideIndexStr = String(slideNumber).padStart(2, "0");
  const totalSlidesStr = String(totalSlides).padStart(2, "0");

  const cleanHeadline = headline?.trim() || "Diagnóstico Estratégico B2B";
  const cleanBodyText =
    bodyText?.trim() ||
    "Alinhamento executivo de prospecção, qualificação de demanda e esteira comercial blindada.";

  return (
    <div
      className={`relative w-full ${
        isStory ? "aspect-[9/16]" : "aspect-square"
      } rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black overflow-hidden flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 select-none shadow-2xl transition-all ${className}`}
    >
      {/* Grade Geométrica e Linha de Luz Superior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* 1. TOP (Header): Tenant/Marca à esquerda, Contador à direita */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <span className="tracking-widest text-xs sm:text-sm text-zinc-400 font-mono uppercase font-semibold">
            {tenantName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 font-mono text-xs sm:text-sm text-zinc-300 font-medium">
            {slideIndexStr}/{totalSlidesStr}
          </span>
        </div>
      </div>

      {/* 2. MIDDLE (Conteúdo): Headline colossal e bodyText */}
      <div className="relative z-10 flex-1 flex flex-col justify-center text-left my-auto py-4 sm:py-6">
        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white leading-tight mb-4 sm:mb-6 line-clamp-4">
          {cleanHeadline}
        </h3>

        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-[85%] line-clamp-6 font-normal">
          {cleanBodyText}
        </p>
      </div>

      {/* 3. BOTTOM (Footer): Linha divisória sutil com assinatura B2B */}
      <div className="relative z-10 border-t border-white/10 pt-4 sm:pt-6 flex items-center justify-between text-zinc-500 font-mono text-[10px] sm:text-xs">
        <span className="tracking-widest uppercase truncate max-w-[65%]">
          {niche ? `${niche} • BLACK LINK` : "B2B GROWTH & DEMAND GEN"}
        </span>

        <span className="tracking-wider text-zinc-400">
          {slideNumber < totalSlides ? "ARRASTE →" : "SALVE ESTE CONTEÚDO"}
        </span>
      </div>
    </div>
  );
}
