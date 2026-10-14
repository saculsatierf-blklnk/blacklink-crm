"use client";

import React from "react";
import { ActiveTool, Editor, STROKE_COLOR } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { ColorPicker } from "../color-picker";

interface StrokeColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const StrokeColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeColorSidebarProps) => {
  const value = editor?.getActiveStrokeColor() || STROKE_COLOR;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (val: string) => {
    editor?.changeStrokeColor(val);
  };

  if (activeTool !== "stroke-color") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Cor do Contorno"
        description="Ajuste a cor da borda do elemento selecionado"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <ColorPicker value={value} onChange={onChange} />
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
