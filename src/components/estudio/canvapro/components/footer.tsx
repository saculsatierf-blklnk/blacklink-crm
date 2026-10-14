"use client";

import React from "react";
import { Minimize, ZoomIn, ZoomOut } from "lucide-react";
import { Editor } from "../types";

interface FooterProps {
  editor: Editor | undefined;
  width?: number;
  height?: number;
}

export const Footer = ({ editor, width = 1080, height = 1080 }: FooterProps) => {
  return (
    <footer className="h-11 border-t border-white/10 bg-[#0c0c10] w-full flex items-center justify-between overflow-x-auto z-30 px-4 shrink-0 select-none text-xs">
      {/* Dimensões em tempo real do workspace */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Canvas:</span>
        <span className="text-zinc-200 font-semibold">{width} × {height} px</span>
        <span className="text-zinc-500">• 100% Vetorial</span>
      </div>

      {/* Controles de Zoom */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor?.zoomOut()}
          className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="Diminuir Zoom"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor?.zoomIn()}
          className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="Aumentar Zoom"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor?.autoZoom()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors text-[11px] font-mono"
          title="Ajustar à Tela (Fit)"
        >
          <Minimize className="h-3.5 w-3.5" />
          <span>Ajustar à Tela</span>
        </button>
      </div>
    </footer>
  );
};
