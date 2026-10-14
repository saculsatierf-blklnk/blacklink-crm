"use client";

import React, { useRef } from "react";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarClose } from "../tool-sidebar-close";
import { ToolSidebarHeader } from "../tool-sidebar-header";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

const BLACKLINK_ASSETS = [
  { name: "Editorial Portrait", url: "/brand/blacklink-art-portrait.jpg" },
  { name: "Chrome Pins Luxo", url: "/brand/blacklink-art-pins.jpg" },
  { name: "3D Cursor Crystal", url: "/brand/blacklink-art-cursor-light.jpg" },
  { name: "Glass Model High-Fashion", url: "/brand/blacklink-art-glass-model.jpg" },
  { name: "Macro Glass Escultural", url: "/brand/blacklink-art-macro-glass.jpg" },
  { name: "Obsidian Dark Minimal", url: "/brand/blacklink-art-obsidian-dark.jpg" },
  { name: "Gradiente Suíço", url: "/brand/blacklink-art-gradient.jpg" },
  { name: "3D Keycap Monolith", url: "/brand/blacklink-3d-keycap.jpg" },
];

export const ImageSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ImageSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        editor?.addImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (activeTool !== "images") return null;

  return (
    <aside className="w-80 bg-[#121217] border-r border-white/10 flex flex-col h-full relative z-30 shrink-0 select-none animate-in slide-in-from-left duration-200">
      <ToolSidebarHeader
        title="Imagens & Uploads"
        description="Carregue suas próprias fotos ou selecione a arte conceitual oficial"
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Botão de Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm group"
        >
          <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Fazer Upload de Imagem</span>
        </button>

        {/* Galeria Conceitual BlackLink */}
        <div className="space-y-2.5">
          <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-sky-400" />
            <span>Biblioteca Oficial BlackLink</span>
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {BLACKLINK_ASSETS.map((asset) => (
              <div
                key={asset.url}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-square cursor-pointer transition-all hover:border-sky-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  <button
                    type="button"
                    onClick={() => editor?.addImage(asset.url)}
                    className="w-full py-1 text-[9px] font-mono uppercase font-bold bg-white text-black rounded shadow"
                  >
                    Inserir
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.setBackgroundImage(asset.url)}
                    className="w-full py-1 text-[9px] font-mono uppercase font-bold bg-sky-500 text-white rounded shadow"
                  >
                    Fundo
                  </button>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-[9px] font-mono text-zinc-300 truncate block">
                    {asset.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
