"use client";

import React from "react";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { Square, Circle, Triangle } from "lucide-react";

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  if (activeTool !== "shapes") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Formas & Elementos"
        description="Insira formas vetoriais geométricas no design"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => editor?.addSoftRectangle()}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/40 transition-all cursor-pointer group"
          >
            <div className="h-12 w-16 rounded-xl border-2 border-dashed border-sky-400/70 bg-sky-500/10 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-mono text-zinc-300 group-hover:text-white">
              Card Arredondado
            </span>
          </button>

          <button
            type="button"
            onClick={() => editor?.addRectangle()}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/40 transition-all cursor-pointer group"
          >
            <div className="h-12 w-16 border-2 border-zinc-400 bg-white/5 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-mono text-zinc-300 group-hover:text-white">
              Retângulo Suíço
            </span>
          </button>

          <button
            type="button"
            onClick={() => editor?.addCircle()}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/40 transition-all cursor-pointer group"
          >
            <Circle className="h-12 w-12 text-zinc-400 group-hover:text-sky-300 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-mono text-zinc-300 group-hover:text-white">
              Círculo / Badges
            </span>
          </button>

          <button
            type="button"
            onClick={() => editor?.addTriangle()}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/40 transition-all cursor-pointer group"
          >
            <Triangle className="h-12 w-12 text-zinc-400 group-hover:text-sky-300 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-mono text-zinc-300 group-hover:text-white">
              Triângulo
            </span>
          </button>

          <button
            type="button"
            onClick={() => editor?.addInverseTriangle()}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/40 transition-all cursor-pointer group"
          >
            <Triangle className="h-12 w-12 text-zinc-400 group-hover:text-sky-300 mb-2 rotate-180 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] font-mono text-zinc-300 group-hover:text-white">
              Triângulo Invertido
            </span>
          </button>
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
