"use client";

import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  ChevronDown,
  Sliders,
  Sparkles,
  Palette,
} from "lucide-react";
import { ActiveTool, Editor, FONT_SIZE } from "../types";
import { isTextType } from "../utils";
import { FontSizeInput } from "./font-size-input";

interface ToolbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  selectedFormat: "1:1" | "4:5" | "9:16";
  onFormatChange: (fmt: "1:1" | "4:5" | "9:16") => void;
}

const FAST_SWATCHES = [
  { name: "Branco", color: "#FFFFFF" },
  { name: "Preto", color: "#09090B" },
  { name: "Amber", color: "#F59E0B" },
  { name: "Sky", color: "#38BDF8" },
  { name: "Emerald", color: "#10B981" },
  { name: "Purple", color: "#A855F7" },
  { name: "Crimson", color: "#EF4444" },
  { name: "Platina", color: "#E4E4E7" },
];

export const Toolbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  selectedFormat,
  onFormatChange,
}: ToolbarProps) => {
  const selectedObject = editor?.selectedObjects?.[0];
  const selectedType = selectedObject?.type;

  const isText = isTextType(selectedType);
  const isImage = selectedType === "image";
  const isShape = selectedObject && !isText && !isImage && selectedObject.name !== "clip";

  const fillColor = editor?.getActiveFillColor() || "#FFFFFF";
  const strokeColor = editor?.getActiveStrokeColor() || "#38BDF8";
  const fontFamily = editor?.getActiveFontFamily() || "Inter";
  const fontSize = editor?.getActiveFontSize() || FONT_SIZE;
  const fontWeight = editor?.getActiveFontWeight() || 400;
  const isBold = fontWeight >= 700;
  const fontStyle = editor?.getActiveFontStyle() || "normal";
  const isItalic = fontStyle === "italic";
  const isUnderline = editor?.getActiveFontUnderline() || false;
  const isLinethrough = editor?.getActiveFontLinethrough() || false;
  const textAlign = editor?.getActiveTextAlign() || "left";
  const opacity = editor?.getActiveOpacity() ?? 1;

  return (
    <div className="h-12 border-b border-white/10 bg-[#121217] px-4 flex items-center justify-between gap-3 overflow-x-auto shrink-0 z-20 text-xs select-none">
      {/* ------------------------------------------------------------------ */}
      {/* 1. SELEÇÃO DE TEXTO                                                */}
      {/* ------------------------------------------------------------------ */}
      {isText && (
        <div className="flex items-center gap-2 min-w-max">
          {/* Seletor de Família de Fonte (Abre Sidebar Fontes) */}
          <button
            type="button"
            onClick={() => onChangeActiveTool(activeTool === "font" ? "select" : "font")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              activeTool === "font"
                ? "border-sky-400 bg-sky-500/20 text-sky-300"
                : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            }`}
            title="Alterar Família da Fonte"
          >
            <span className="truncate max-w-[130px] font-semibold">
              {fontFamily.split(",")[0].replace(/['"]/g, "")}
            </span>
            <ChevronDown className="h-3 w-3 text-zinc-400 shrink-0" />
          </button>

          {/* Stepper de Tamanho da Fonte */}
          <FontSizeInput
            value={fontSize}
            onChange={(val) => editor?.changeFontSize(val)}
          />

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Botão de Cor Principal (Abre Sidebar de Preenchimento) */}
          <button
            type="button"
            onClick={() => onChangeActiveTool(activeTool === "fill" ? "select" : "fill")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              activeTool === "fill"
                ? "border-sky-400 bg-sky-500/20 shadow-md ring-1 ring-sky-400/40"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
            }`}
            title="Abrir Paleta Completa de Cores"
          >
            <div
              className="h-4 w-4 rounded border border-white/30 shadow-sm"
              style={{ backgroundColor: fillColor }}
            />
            <span className="text-[11px] font-mono text-zinc-300 uppercase">
              {fillColor.length <= 7 ? fillColor : "Cor"}
            </span>
          </button>

          {/* Swatches Rápidas de 1 Clique */}
          <div className="flex items-center gap-1 bg-white/[0.02] border border-white/10 rounded-lg p-0.5">
            {FAST_SWATCHES.map((swatch) => {
              const isCurr = fillColor.toUpperCase() === swatch.color.toUpperCase();
              return (
                <button
                  key={swatch.color}
                  type="button"
                  onClick={() => editor?.changeFillColor(swatch.color)}
                  className={`h-5 w-5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                    isCurr
                      ? "ring-2 ring-sky-400 ring-offset-1 ring-offset-black scale-110 border-white shadow"
                      : "border-white/20 hover:scale-110"
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  title={`${swatch.name} (${swatch.color})`}
                >
                  {isCurr && (
                    <span className={`text-[8px] font-bold ${swatch.color === "#FFFFFF" || swatch.color === "#E4E4E7" ? "text-black" : "text-white"}`}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Estilos: Negrito, Itálico, Sublinhado, Riscado */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => editor?.changeFontWeight(isBold ? 400 : 800)}
              className={`p-1.5 rounded transition-all ${
                isBold ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="Negrito"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor?.changeFontStyle(isItalic ? "normal" : "italic")}
              className={`p-1.5 rounded transition-all ${
                isItalic ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="Itálico"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor?.changeFontUnderline(!isUnderline)}
              className={`p-1.5 rounded transition-all ${
                isUnderline ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="Sublinhado"
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor?.changeFontLinethrough(!isLinethrough)}
              className={`p-1.5 rounded transition-all ${
                isLinethrough ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="Riscado"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Alinhamento de Texto */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => editor?.changeTextAlign("left")}
              className={`p-1.5 rounded transition-all ${
                textAlign === "left" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="Alinhar à Esquerda"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor?.changeTextAlign("center")}
              className={`p-1.5 rounded transition-all ${
                textAlign === "center" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="Centralizar"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor?.changeTextAlign("right")}
              className={`p-1.5 rounded transition-all ${
                textAlign === "right" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
              title="Alinhar à Direita"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. SELEÇÃO DE FORMA / ELEMENTO                                     */}
      {/* ------------------------------------------------------------------ */}
      {isShape && (
        <div className="flex items-center gap-3 min-w-max">
          {/* Preenchimento */}
          <button
            type="button"
            onClick={() => onChangeActiveTool(activeTool === "fill" ? "select" : "fill")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              activeTool === "fill"
                ? "border-sky-400 bg-sky-500/20 text-sky-300"
                : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            }`}
          >
            <span className="text-zinc-400">Preenchimento:</span>
            <div
              className="h-4 w-4 rounded border border-white/30"
              style={{ backgroundColor: fillColor }}
            />
          </button>

          {/* Contorno */}
          <button
            type="button"
            onClick={() => onChangeActiveTool(activeTool === "stroke-color" ? "select" : "stroke-color")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              activeTool === "stroke-color"
                ? "border-sky-400 bg-sky-500/20 text-sky-300"
                : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            }`}
          >
            <span className="text-zinc-400">Contorno:</span>
            <div
              className="h-4 w-4 rounded border border-white/30"
              style={{ backgroundColor: strokeColor }}
            />
          </button>

          {/* Espessura de Contorno */}
          <button
            type="button"
            onClick={() => onChangeActiveTool(activeTool === "stroke-width" ? "select" : "stroke-width")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              activeTool === "stroke-width"
                ? "border-sky-400 bg-sky-500/20 text-sky-300"
                : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            }`}
          >
            <span className="text-zinc-400">Espessura:</span>
            <span>{editor?.getActiveStrokeWidth() || 0}px</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. SELEÇÃO DE IMAGEM                                               */}
      {/* ------------------------------------------------------------------ */}
      {isImage && (
        <div className="flex items-center gap-2 min-w-max">
          <button
            type="button"
            onClick={() => onChangeActiveTool(activeTool === "filter" ? "select" : "filter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
              activeTool === "filter"
                ? "border-sky-400 bg-sky-500/20 text-sky-300"
                : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Filtros Fotográficos</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. NADA SELECIONADO: FUNDO & FORMATO DO CANVAS                     */}
      {/* ------------------------------------------------------------------ */}
      {!selectedObject && (
        <div className="flex items-center gap-4 text-xs min-w-max">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono flex items-center gap-1 text-zinc-400">
              <Palette className="h-3.5 w-3.5 text-sky-400" />
              <span>Fundo do Canvas:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {["#09090B", "#000000", "#18181B", "#F4F4F5", "#FFFFFF", "#38BDF8"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => editor?.changeBackground(c)}
                  className="h-5 w-5 rounded-full border border-white/20 transition-transform hover:scale-110 shadow-sm"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Formato Rápido */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-zinc-400 mr-1">Formato:</span>
            {(["1:1", "4:5", "9:16"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onFormatChange(fmt)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border transition-all ${
                  selectedFormat === fmt
                    ? "border-sky-400 bg-sky-500/20 text-sky-300"
                    : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. AÇÕES UNIVERSAIS DE OBJETO (LADO DIREITO)                       */}
      {/* ------------------------------------------------------------------ */}
      {selectedObject && (
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Opacidade */}
          <button
            type="button"
            onClick={() => onChangeActiveTool(activeTool === "opacity" ? "select" : "opacity")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
              activeTool === "opacity"
                ? "border-sky-400 bg-sky-500/20 text-sky-300"
                : "border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white"
            }`}
            title="Ajustar Opacidade"
          >
            <Sliders className="h-3 w-3 text-zinc-400" />
            <span>{Math.round(opacity * 100)}%</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Camadas (Trazer pra Frente / Enviar pra Trás) */}
          <button
            type="button"
            onClick={() => editor?.bringForward()}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Trazer para Frente"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.sendBackwards()}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Enviar para Trás"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Duplicar */}
          <button
            type="button"
            onClick={() => editor?.duplicate()}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Duplicar Objeto (Ctrl+D)"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Deletar */}
          <button
            type="button"
            onClick={() => editor?.delete()}
            className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
            title="Excluir Objeto (Delete / Backspace)"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
