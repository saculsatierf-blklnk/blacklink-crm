"use client";

import React from "react";
import { X } from "lucide-react";

interface ToolSidebarHeaderProps {
  title: string;
  description?: string;
  onClose?: () => void;
}

export const ToolSidebarHeader = ({
  title,
  description,
  onClose,
}: ToolSidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-white/10 flex items-start justify-between gap-2 shrink-0">
      <div className="space-y-0.5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-zinc-400 font-sans">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="Fechar painel"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
