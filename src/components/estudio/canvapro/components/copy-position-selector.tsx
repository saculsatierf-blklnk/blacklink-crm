"use client";

import React from "react";
import { Editor, CopyPosition } from "../types";
import { LayoutGrid } from "lucide-react";

interface CopyPositionSelectorProps {
  editor: Editor | undefined;
  className?: string;
  showLabels?: boolean;
}

export const COPY_POSITIONS: {
  id: CopyPosition;
  label: string;
  shortLabel: string;
  icon: string;
  title: string;
}[] = [
  { id: "top-left", label: "Esq. Cima", shortLabel: "TL", icon: "↖", title: "Esquerda Superior (Topo)" },
  { id: "top-right", label: "Dir. Cima", shortLabel: "TR", icon: "↗", title: "Direita Superior (Topo)" },
  { id: "center", label: "Centro", shortLabel: "C", icon: "▪", title: "Centralizado (Miolo)" },
  { id: "bottom-left", label: "Esq. Baixo", shortLabel: "BL", icon: "↙", title: "Esquerda Inferior (Base)" },
  { id: "bottom-right", label: "Dir. Baixo", shortLabel: "BR", icon: "↘", title: "Direita Inferior (Base)" },
];

export const CopyPositionSelector: React.FC<CopyPositionSelectorProps> = ({
  editor,
  className = "",
  showLabels = true,
}) => {
  const currentPos = editor?.getActiveCopyPosition() || "top-left";

  return (
    <div
      className={`flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-lg p-0.5 shrink-0 ${className}`}
      title="Posicionamento Automático da Copy (Layout Suíço)"
    >
      <div className="flex items-center gap-1 px-1.5 text-zinc-400 select-none">
        <LayoutGrid className="h-3 w-3 text-sky-400 shrink-0" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider hidden lg:inline">
          Posição:
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        {COPY_POSITIONS.map((pos) => {
          const isSelected = currentPos === pos.id;
          return (
            <button
              key={pos.id}
              type="button"
              onClick={() => editor?.setCopyPosition(pos.id)}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? "bg-sky-500 text-white shadow ring-1 ring-sky-400"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
              title={`${pos.title} — clique para reposicionar automaticamente`}
            >
              <span className="text-xs leading-none font-sans">{pos.icon}</span>
              {showLabels && (
                <span className="text-[10px] hidden xl:inline">{pos.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
