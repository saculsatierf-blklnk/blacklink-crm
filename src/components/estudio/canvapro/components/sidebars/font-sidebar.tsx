"use client";

import React from "react";
import { ActiveTool, Editor, fonts } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { Check } from "lucide-react";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const currentFont = editor?.getActiveFontFamily();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  if (activeTool !== "font") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Tipografia & Fontes"
        description="Selecione a fonte do texto selecionado"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {fonts.map((f) => {
          const isSelected = currentFont === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => editor?.changeFontFamily(f.value)}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-all group ${
                isSelected
                  ? "border-sky-400 bg-sky-500/10 text-white shadow-md ring-1 ring-sky-400/30"
                  : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <div className="space-y-0.5">
                <span
                  className="text-base block truncate tracking-tight"
                  style={{ fontFamily: f.value }}
                >
                  {f.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {f.value.split(",")[0].replace(/['"]/g, "")}
                </span>
              </div>
              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-sky-400 flex items-center justify-center text-black shrink-0">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
