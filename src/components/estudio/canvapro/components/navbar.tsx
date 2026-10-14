"use client";

import React, { useState } from "react";
import {
  Undo2,
  Redo2,
  Download,
  CheckCircle2,
  X,
  FileCode,
  Image as ImageIcon,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Editor } from "../types";

interface NavbarProps {
  editor: Editor | undefined;
  title?: string;
  activeSlideIdx?: number;
  totalSlides?: number;
  onSaveToFeed?: () => void;
  onClose?: () => void;
  saveSuccessMsg?: string | null;
}

export const Navbar = ({
  editor,
  title = "Canva Pro Studio",
  activeSlideIdx = 0,
  totalSlides = 1,
  onSaveToFeed,
  onClose,
  saveSuccessMsg,
}: NavbarProps) => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  const canUndo = editor?.canUndo() || false;
  const canRedo = editor?.canRedo() || false;

  return (
    <header className="h-14 border-b border-white/10 bg-[#0c0c10] px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Lado Esquerdo: Marca & Indicador de Slide */}
      <div className="flex items-center gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Fechar Editor"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                CANVA PRO STUDIO
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                PRO 2026
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block truncate max-w-[200px] sm:max-w-[320px]">
              {title} • Slide #{activeSlideIdx + 1}
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

        {/* Histórico: Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor?.onUndo()}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg border transition-colors ${
              canUndo
                ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] cursor-pointer"
                : "border-transparent text-zinc-600 cursor-not-allowed opacity-40"
            }`}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.onRedo()}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg border transition-colors ${
              canRedo
                ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] cursor-pointer"
                : "border-transparent text-zinc-600 cursor-not-allowed opacity-40"
            }`}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mensagem de Feedback de Salvamento */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono animate-in fade-in">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Lado Direito: Download & Salvar no Feed */}
      <div className="flex items-center gap-2">
        {/* Menu Exportar / Download */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Exportar</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/15 bg-[#121217] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-1">
              <button
                type="button"
                onClick={() => {
                  editor?.savePng();
                  setIsExportOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono text-left text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5 text-sky-400" />
                <span>Baixar PNG (1080p)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.saveJpg();
                  setIsExportOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono text-left text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                <span>Baixar JPEG</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.saveSvg();
                  setIsExportOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono text-left text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                <FileCode className="h-3.5 w-3.5 text-purple-400" />
                <span>Baixar Vetor SVG</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor?.saveJson();
                  setIsExportOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono text-left text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                <span>Exportar JSON Fabric</span>
              </button>
            </div>
          )}
        </div>

        {/* Salvar no Feed 3x3 */}
        {onSaveToFeed && (
          <button
            type="button"
            onClick={onSaveToFeed}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-emerald-500/50 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 text-xs font-mono font-bold text-emerald-300 transition-all shadow-md ring-1 ring-emerald-500/40 cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Salvar no Feed 3x3</span>
          </button>
        )}
      </div>
    </header>
  );
};
