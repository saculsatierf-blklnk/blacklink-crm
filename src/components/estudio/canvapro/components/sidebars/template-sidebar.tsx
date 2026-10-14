"use client";

import React from "react";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { LayoutTemplate } from "lucide-react";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  currentHeadline?: string;
  currentBodyText?: string;
  currentTag?: string;
}

const TEMPLATES = [
  {
    id: "pure-monumental",
    title: "Editorial Monumental",
    desc: "Retrato high-fashion com tipografia monumental na base",
    variant: "pure-monumental",
    contrastMode: "light" as const,
    copyPosition: "bottom-left" as const,
  },
  {
    id: "3d-crystal",
    title: "Chrome Pins Luxo",
    desc: "Fundo porcelana gelo com pins metálicos e contraste preto",
    variant: "3d-crystal",
    contrastMode: "dark" as const,
    copyPosition: "top-left" as const,
  },
  {
    id: "3d-cursor",
    title: "3D Cursor Minimal",
    desc: "Objeto 3D escultural centralizado e tipografia no topo",
    variant: "3d-cursor",
    contrastMode: "dark" as const,
    copyPosition: "top-left" as const,
  },
  {
    id: "3d-liquid",
    title: "Glass Model Líquido",
    desc: "Vidro orgânico e alta moda com contraste profundo",
    variant: "3d-liquid",
    contrastMode: "light" as const,
    copyPosition: "bottom-left" as const,
  },
  {
    id: "clean-ice",
    title: "Obsidian Dark Monolith",
    desc: "Fundo preto profundo com textura brutalista",
    variant: "clean-ice",
    contrastMode: "light" as const,
    copyPosition: "bottom-left" as const,
  },
  {
    id: "swiss-box",
    title: "Gradiente Suíço B2B",
    desc: "Mesh gradient com diagramação tipográfica internacional",
    variant: "swiss-box",
    contrastMode: "light" as const,
    copyPosition: "top-left" as const,
  },
];

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  currentHeadline = "RIGOR TIPOGRÁFICO INTERNACIONAL",
  currentBodyText = "A estética dos conglomerados globais adaptada ao seu B2B.",
  currentTag = "03 // ESTÉTICA",
}: TemplateSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleApplyTemplate = async (tmpl: typeof TEMPLATES[0]) => {
    if (!editor) return;
    await editor.loadExactSlideLayout({
      headline: currentHeadline,
      bodyText: currentBodyText,
      tag: currentTag,
      variant: tmpl.variant,
      contrastMode: tmpl.contrastMode,
      copyPosition: tmpl.copyPosition,
    });
    onChangeActiveTool("select");
  };

  if (activeTool !== "templates") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Templates & Presets"
        description="Aplique a diagramação e arte das referências internacionais"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => handleApplyTemplate(tmpl)}
            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/50 text-left transition-all cursor-pointer group space-y-1 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-white group-hover:text-sky-300">
                {tmpl.title}
              </span>
              <LayoutTemplate className="h-3.5 w-3.5 text-zinc-500 group-hover:text-sky-400" />
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-tight">
              {tmpl.desc}
            </p>
          </button>
        ))}
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
