"use client";

import React, { useState } from "react";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { ColorPicker } from "../color-picker";

interface DrawSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const DrawSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: DrawSidebarProps) => {
  const [brushWidth, setBrushWidth] = useState(4);
  const strokeColor = editor?.getActiveStrokeColor() || "#38BDF8";

  const onClose = () => {
    editor?.disableDrawingMode();
    onChangeActiveTool("select");
  };

  const handleWidthChange = (val: number) => {
    setBrushWidth(val);
    editor?.changeStrokeWidth(val);
  };

  const handleColorChange = (val: string) => {
    editor?.changeStrokeColor(val);
  };

  if (activeTool !== "draw") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Desenho Livre & Caneta"
        description="Desenhe livremente sobre o canvas com pincel vetorial"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Espessura do Pincel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-300">
              Espessura do Pincel
            </span>
            <span className="text-xs font-mono text-purple-400 font-bold">
              {brushWidth}px
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={brushWidth}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="w-full accent-purple-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Cor do Pincel */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-zinc-300 block">
            Cor do Pincel
          </span>
          <ColorPicker value={strokeColor} onChange={handleColorChange} />
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
