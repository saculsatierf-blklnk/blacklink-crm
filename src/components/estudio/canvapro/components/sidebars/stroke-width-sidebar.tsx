"use client";

import React from "react";
import { ActiveTool, Editor, STROKE_WIDTH } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";

interface StrokeWidthSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const StrokeWidthSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeWidthSidebarProps) => {
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;
  const dashArray = editor?.getActiveStrokeDashArray() || [];
  const isDashed = dashArray.length > 0;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  if (activeTool !== "stroke-width") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Espessura & Estilo de Linha"
        description="Ajuste a largura e o traçado da borda"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Slider de Largura */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300">
              Espessura da Borda
            </span>
            <span className="text-xs font-mono text-sky-400 font-bold">
              {widthValue}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            step="1"
            value={widthValue}
            onChange={(e) => editor?.changeStrokeWidth(Number(e.target.value))}
            className="w-full accent-sky-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>0px (Sem borda)</span>
            <span>16px</span>
            <span>32px</span>
          </div>
        </div>

        {/* Estilo do Traçado (Sólido vs Tracejado) */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <span className="text-xs font-mono font-bold uppercase text-zinc-300 block">
            Tipo de Traçado
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => editor?.changeStrokeDashArray([])}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                !isDashed
                  ? "border-sky-400 bg-sky-500/10 text-sky-300"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08]"
              }`}
            >
              <div className="w-16 h-0.5 bg-current" />
              <span className="text-[10px] font-mono">Linha Sólida</span>
            </button>
            <button
              type="button"
              onClick={() => editor?.changeStrokeDashArray([8, 8])}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDashed
                  ? "border-sky-400 bg-sky-500/10 text-sky-300"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08]"
              }`}
            >
              <div className="w-16 h-0.5 border-b border-dashed border-current" />
              <span className="text-[10px] font-mono">Tracejado</span>
            </button>
          </div>
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
