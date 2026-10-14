"use client";

import React, { useState, useEffect } from "react";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { ColorPicker } from "../color-picker";
import { Sliders } from "lucide-react";

interface SettingsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  selectedFormat: "1:1" | "4:5" | "9:16";
  onFormatChange: (fmt: "1:1" | "4:5" | "9:16") => void;
}

export const SettingsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  selectedFormat,
  onFormatChange,
}: SettingsSidebarProps) => {
  const workspace = editor?.getWorkspace();
  const [bgColor, setBgColor] = useState("#09090B");

  useEffect(() => {
    if (workspace?.fill) {
      setBgColor(workspace.fill as string);
    }
  }, [workspace]);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleBgChange = (color: string) => {
    setBgColor(color);
    editor?.changeBackground(color);
  };

  if (activeTool !== "settings") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Configurações do Canvas"
        description="Formato, dimensões e cor de fundo do workspace"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Formatos do Post */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-sky-400" />
            <span>Formato do Post</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "1:1", label: "1:1 Quadrado", dims: "1080×1080" },
              { id: "4:5", label: "4:5 Retrato", dims: "1080×1350" },
              { id: "9:16", label: "9:16 Stories", dims: "1080×1920" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFormatChange(f.id as any)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  selectedFormat === f.id
                    ? "border-sky-400 bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/40"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08]"
                }`}
              >
                <span className="text-xs font-mono font-bold">{f.id}</span>
                <span className="text-[9px] font-mono text-zinc-500 mt-1">{f.dims}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cor de Fundo do Workspace */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-zinc-300 block">
            Cor de Fundo do Canvas
          </span>
          <ColorPicker value={bgColor} onChange={handleBgChange} />
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
