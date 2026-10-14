"use client";

import React from "react";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { Plus } from "lucide-react";

interface TextSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

const FAST_COLORS = [
  { name: "Branco Puro", color: "#FFFFFF" },
  { name: "Preto Carbono", color: "#09090B" },
  { name: "Amber Gold", color: "#F59E0B" },
  { name: "Cyber Sky", color: "#38BDF8" },
  { name: "Emerald", color: "#10B981" },
  { name: "Purple Neon", color: "#A855F7" },
  { name: "Crimson", color: "#EF4444" },
  { name: "Cinza Platina", color: "#E4E4E7" },
];

export const TextSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  if (activeTool !== "text") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Tipografia & Textos"
        description="Adicione blocos de texto ou altere cores rapidamente"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Adicionar Tipografia Editorial */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => editor?.addHeading()}
            className="w-full text-left p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/50 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <span className="text-lg font-clash font-extrabold uppercase tracking-tight block text-white group-hover:text-sky-300">
                TÍTULO MONUMENTAL
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Clash Display 72px • Editorial Bold
              </span>
            </div>
            <Plus className="h-4 w-4 text-zinc-500 group-hover:text-sky-400" />
          </button>

          <button
            type="button"
            onClick={() => editor?.addSubheading()}
            className="w-full text-left p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/50 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <span className="text-sm font-sans font-semibold block text-zinc-200 group-hover:text-sky-300">
                Subtítulo de Posicionamento
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Inter 36px • SemiBold
              </span>
            </div>
            <Plus className="h-4 w-4 text-zinc-500 group-hover:text-sky-400" />
          </button>

          <button
            type="button"
            onClick={() => editor?.addBodyText()}
            className="w-full text-left p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/50 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-sans text-zinc-300 block group-hover:text-white">
                Parágrafo narrativo B2B
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Inter 24px • Regular
              </span>
            </div>
            <Plus className="h-4 w-4 text-zinc-500 group-hover:text-sky-400" />
          </button>

          <button
            type="button"
            onClick={() => editor?.addBadge()}
            className="w-full text-left p-3.5 rounded-xl border border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider block text-sky-300">
                TAG // BADGE TÉCNICO
              </span>
              <span className="text-[10px] font-mono text-sky-400/70">
                JetBrains Mono 14px • Pill
              </span>
            </div>
            <Plus className="h-4 w-4 text-sky-400" />
          </button>
        </div>

        {/* Cores Rápidas para Textos (1 Clique) */}
        <div className="pt-4 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300">
              Cores Rápidas da Copy
            </span>
            <button
              type="button"
              onClick={() => onChangeActiveTool("fill")}
              className="text-[10px] font-mono text-sky-400 hover:underline cursor-pointer"
            >
              Paleta completa →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FAST_COLORS.map((swatch) => (
              <button
                key={swatch.color}
                type="button"
                onClick={() => editor?.changeFillColor(swatch.color)}
                className="flex items-center gap-2 p-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/40 transition-all text-left cursor-pointer group"
              >
                <span
                  className="h-4 w-4 rounded-full border border-white/20 shrink-0 group-hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: swatch.color }}
                />
                <span className="text-[11px] font-mono text-zinc-300 group-hover:text-white truncate">
                  {swatch.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
