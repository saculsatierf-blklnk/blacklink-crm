"use client";

import React from "react";
import { ActiveTool, Editor, filters } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { Sparkles } from "lucide-react";

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const FilterSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FilterSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  if (activeTool !== "filter") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Filtros de Imagem"
        description="Aplique efeitos fotográficos na imagem selecionada"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => editor?.changeImageFilter(filter)}
            className="w-full p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/40 text-left cursor-pointer transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-mono font-bold uppercase text-white group-hover:text-sky-300 block">
                {filter === "none" ? "Original (Sem Filtro)" : filter}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Efeito fotográfico Fabric
              </span>
            </div>
            <Sparkles className="h-4 w-4 text-zinc-600 group-hover:text-sky-400" />
          </button>
        ))}
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
