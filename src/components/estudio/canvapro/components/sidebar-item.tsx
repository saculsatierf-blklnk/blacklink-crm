"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full aspect-square flex flex-col items-center justify-center py-3 px-1 transition-all cursor-pointer border-l-2 text-center group ${
        isActive
          ? "border-sky-400 bg-white/[0.08] text-sky-300"
          : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.04]"
      }`}
    >
      <Icon className={`h-5 w-5 stroke-[1.8] shrink-0 transition-transform group-hover:scale-110 ${
        isActive ? "text-sky-400" : "text-zinc-400 group-hover:text-white"
      }`} />
      <span className="mt-1.5 text-[10px] font-mono tracking-tight font-medium">
        {label}
      </span>
    </button>
  );
};
