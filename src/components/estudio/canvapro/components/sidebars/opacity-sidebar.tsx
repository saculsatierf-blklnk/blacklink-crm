"use client";

import React from "react";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";

interface OpacitySidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const OpacitySidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: OpacitySidebarProps) => {
  const currentOpacity = editor?.getActiveOpacity() ?? 1;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  if (activeTool !== "opacity") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Transparência & Opacidade"
        description="Ajuste a visibilidade do elemento selecionado"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300">
              Opacidade
            </span>
            <span className="text-xs font-mono text-sky-400 font-bold">
              {Math.round(currentOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={currentOpacity}
            onChange={(e) => editor?.changeOpacity(Number(e.target.value))}
            className="w-full accent-sky-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>5% (Quase invisível)</span>
            <span>50%</span>
            <span>100% (Sólido)</span>
          </div>
        </div>

        {/* Presets Rápidos */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <span className="text-xs font-mono font-bold uppercase text-zinc-300 block">
            Níveis Rápidos
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[0.25, 0.5, 0.75, 1].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => editor?.changeOpacity(lvl)}
                className={`p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  Math.abs(currentOpacity - lvl) < 0.05
                    ? "border-sky-400 bg-sky-500/10 text-sky-300"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08]"
                }`}
              >
                {Math.round(lvl * 100)}%
              </button>
            ))}
          </div>
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
