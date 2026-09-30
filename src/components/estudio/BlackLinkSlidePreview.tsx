"use client";

import React from "react";

interface BlackLinkSlidePreviewProps {
  headline: string;
  bodyText: string;
  currentSlide?: number;
  totalSlides?: number;
  className?: string;
}

/**
 * Renderizador Hardcoded Oficial Black Link (Padrão Ouro)
 * Canvas visual 1:1 brutalista e de alta densidade B2B.
 */
export function BlackLinkSlidePreview({
  headline,
  bodyText,
  currentSlide = 1,
  totalSlides = 5,
  className = "",
}: BlackLinkSlidePreviewProps) {
  const formattedSlide = String(currentSlide).padStart(2, "0");
  const formattedTotal = String(totalSlides).padStart(2, "0");

  const cleanHeadline =
    headline?.trim() || "Como Dominar Contas Enterprise sem Perder Margem";
  const cleanBodyText =
    bodyText?.trim() ||
    "A maioria das operações corporativas trava por falta de clareza nos gargalos de esteira. Quando alinhamos inteligência de dados e blindagem de território, o ciclo médio cai pela metade.";

  return (
    <div
      className={`relative aspect-square w-full rounded-3xl border border-white/[0.08] bg-[#050505] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#050505] to-[#050505] overflow-hidden select-none shadow-2xl transition-all ${className}`}
    >
      {/* Linha sutil de refração superior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Grid e Padding Interno Brutalista */}
      <div className="flex flex-col justify-between h-full p-8 sm:p-10 lg:p-12 relative z-10">
        {/* Topo (Header) */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 font-sans">
            BLACK LINK • CRM
          </span>

          <span className="font-mono text-xs sm:text-sm text-zinc-400 tracking-wider font-medium">
            [ {formattedSlide} / {formattedTotal} ]
          </span>
        </div>

        {/* Centro (Body): Totalmente alinhado à esquerda */}
        <div className="flex-1 flex flex-col justify-center text-left my-auto py-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white leading-[1.1] mb-6 line-clamp-4">
            {cleanHeadline}
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-[90%] font-normal line-clamp-6">
            {cleanBodyText}
          </p>
        </div>

        {/* Rodapé (Footer) */}
        <div className="border-t border-white/10 pt-6 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-sans tracking-wide text-zinc-400 font-normal">
            Inteligência B2B &amp; Automação
          </span>

          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
            {currentSlide < totalSlides ? "Arraste →" : "Fim do Conteúdo"}
          </span>
        </div>
      </div>
    </div>
  );
}
