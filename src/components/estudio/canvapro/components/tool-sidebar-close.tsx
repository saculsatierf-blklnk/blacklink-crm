"use client";

import React from "react";
import { ChevronsLeft } from "lucide-react";

interface ToolSidebarCloseProps {
  onClick: () => void;
}

export const ToolSidebarClose = ({ onClick }: ToolSidebarCloseProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute -right-[1.5rem] top-1/2 -translate-y-1/2 h-14 w-6 bg-[#16161d] border-y border-r border-white/15 rounded-r-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-white/[0.12] transition-colors group z-50"
      title="Recolher painel"
    >
      <ChevronsLeft className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
    </button>
  );
};
