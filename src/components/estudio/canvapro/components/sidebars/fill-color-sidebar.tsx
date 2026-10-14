"use client";

import React from "react";
import { ActiveTool, Editor, FILL_COLOR } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { ColorPicker } from "../color-picker";

interface FillColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const FillColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FillColorSidebarProps) => {
  const value = editor?.getActiveFillColor() || FILL_COLOR;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (val: string) => {
    editor?.changeFillColor(val);
  };

  if (activeTool !== "fill") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Cor de Preenchimento"
        description="Altere a cor da tipografia ou forma selecionada"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <ColorPicker value={value} onChange={onChange} />
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
