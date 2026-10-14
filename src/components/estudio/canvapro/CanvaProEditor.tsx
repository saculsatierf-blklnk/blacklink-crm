"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  Type,
  Square,
  Circle,
  Triangle,
  Image as ImageIcon,
  Layers,
  Download,
  Save,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Copy,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Upload,
  X,
  Sliders,
  Palette,
  CheckCircle2,
  PenTool,
  Grid,
  ChevronDown,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { useEditor } from "./hooks/use-editor";
import {
  ActiveTool,
  brandPalette,
  filters,
  fonts,
  FONT_SIZE,
} from "./types";
import { isTextType } from "./utils";
import type { ScheduledPost, CreativeSlide } from "@/store/useMarketingStore";

interface CanvaProEditorProps {
  initialPost?: ScheduledPost | null;
  activeSlideIdx?: number;
  onSaveToFeed?: (renderedImageUrl: string, updatedSlide?: Partial<CreativeSlide>) => void;
  onClose?: () => void;
  className?: string;
}

export function CanvaProEditor({
  initialPost,
  activeSlideIdx = 0,
  onSaveToFeed,
  onClose,
  className = "",
}: CanvaProEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTool, setActiveTool] = useState<ActiveTool>("text");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"1:1" | "4:5" | "9:16">("1:1");
  const [customColor, setCustomColor] = useState("#FFFFFF");

  const { init, editor } = useEditor({
    defaultWidth: 1080,
    defaultHeight: selectedFormat === "1:1" ? 1080 : selectedFormat === "4:5" ? 1350 : 1920,
  });

  // Inicializa o canvas do Fabric após montar o DOM
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
      selectionColor: "rgba(56, 189, 248, 0.15)",
      selectionBorderColor: "#38BDF8",
      selectionLineWidth: 1.5,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  // Carrega os elementos do post atual mantendo a posição e visual EXATOS da lâmina
  const loadPostContent = useCallback(async () => {
    if (!editor || !initialPost) return;

    const slide = initialPost.slides?.[activeSlideIdx] || initialPost.slides?.[0];
    if (!slide) return;

    await editor.loadExactSlideLayout({
      headline: slide.headline || initialPost.theme || "RIGOR TIPOGRÁFICO INTERNACIONAL",
      bodyText: slide.bodyText || initialPost.hookHeadline || "",
      tag: slide.tag || "03 // ESTÉTICA",
      imageUrl: slide.imageUrl || initialPost.imageUrls?.[0],
      variant: slide.blackLinkVariant,
      contrastMode: slide.contrastMode,
      copyPosition: slide.copyPosition,
    });
  }, [activeSlideIdx, editor, initialPost]);

  // Quando o editor estiver pronto e o post for fornecido, carrega com fidelidade 100%
  const lastLoadedKeyRef = useRef<string>("");
  const currentKey = `${initialPost?.id || "empty"}-${activeSlideIdx}-${initialPost?.slides?.[activeSlideIdx]?.headline || ""}`;

  useEffect(() => {
    if (editor && initialPost && lastLoadedKeyRef.current !== currentKey) {
      lastLoadedKeyRef.current = currentKey;
      loadPostContent();
    }
  }, [editor, initialPost, currentKey, loadPostContent]);

  // Formato do Canvas (Quadrado 1:1, Retrato 4:5, Stories 9:16)
  const handleFormatChange = (fmt: "1:1" | "4:5" | "9:16") => {
    if (!editor) return;
    setSelectedFormat(fmt);

    let w = 1080;
    let h = 1080;
    if (fmt === "4:5") h = 1350;
    if (fmt === "9:16") h = 1920;

    editor.changeSize({ width: w, height: h });
  };

  // Upload manual de imagem do computador para o Canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        editor.addImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Salvar alterações e sincronizar com o Feed 3x3 do CRM
  const handleSaveToFeed = () => {
    if (!editor) return;

    const renderedUrl = editor.exportDataUrl("png");

    const canvas = editor.canvas;
    const headlineObj = canvas?.getObjects().find((o) => o.name === "slide-headline") as fabric.Textbox | undefined;
    const bodyObj = canvas?.getObjects().find((o) => o.name === "slide-body") as fabric.Textbox | undefined;
    const tagObj = canvas?.getObjects().find((o) => o.name === "slide-tag") as fabric.Textbox | undefined;

    if (onSaveToFeed) {
      onSaveToFeed(renderedUrl, {
        imageUrl: renderedUrl,
        ...(headlineObj?.text ? { headline: headlineObj.text } : {}),
        ...(bodyObj?.text ? { bodyText: bodyObj.text } : {}),
        ...(tagObj?.text ? { tag: tagObj.text } : {}),
      });
    }

    setSaveSuccessMsg("✨ Post atualizado com sucesso no Feed 3x3!");
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Informações do objeto selecionado atualmente
  const selectedObject = editor?.selectedObjects?.[0];
  const isText = isTextType(selectedObject?.type);
  const isImage = selectedObject?.type === "image";
  const isShape = selectedObject && !isText && !isImage && selectedObject.name !== "clip";

  return (
    <div className={`flex flex-col h-full w-full bg-[#09090B] text-white border border-white/10 rounded-2xl overflow-hidden shadow-2xl select-none ${className}`}>
      {/* ------------------------------------------------------------- */}
      {/* HEADER SUPERIOR DO CANVA PRO STUDIO                          */}
      {/* ------------------------------------------------------------- */}
      <header className="h-14 border-b border-white/10 bg-[#0d0d10] px-4 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-md">
              C+
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-clash font-extrabold text-sm tracking-wide text-white">
                  CANVA PRO STUDIO
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-300 font-bold">
                  BLACK LINK
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Formato do Canvas */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleFormatChange("1:1")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                selectedFormat === "1:1"
                  ? "bg-white text-black font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Feed 1:1
            </button>
            <button
              type="button"
              onClick={() => handleFormatChange("4:5")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                selectedFormat === "4:5"
                  ? "bg-white text-black font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Retrato 4:5
            </button>
            <button
              type="button"
              onClick={() => handleFormatChange("9:16")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                selectedFormat === "9:16"
                  ? "bg-white text-black font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Stories 9:16
            </button>
          </div>
        </div>

        {/* Controles Centrais: Desfazer / Refazer / Zoom */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!editor?.canUndo()}
            onClick={() => editor?.onUndo()}
            title="Desfazer (Ctrl+Z)"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!editor?.canRedo()}
            onClick={() => editor?.onRedo()}
            title="Refazer (Ctrl+Y)"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            type="button"
            onClick={() => editor?.zoomOut()}
            title="Reduzir Zoom"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.resetZoom()}
            title="Ajustar à Tela"
            className="px-2 py-1 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            Auto
          </button>
          <button
            type="button"
            onClick={() => editor?.zoomIn()}
            title="Aumentar Zoom"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Ações de Exportação & Salvar no Feed */}
        <div className="flex items-center gap-2">
          {initialPost && (
            <button
              type="button"
              onClick={loadPostContent}
              title="Recarregar texto e imagem originais do post"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/10 text-xs text-zinc-300 font-mono transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Resetar</span>
            </button>
          )}

          {/* Download PNG */}
          <button
            type="button"
            onClick={() => editor?.savePng()}
            title="Baixar imagem em alta resolução"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono font-medium text-white transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Baixar PNG</span>
          </button>

          {/* Salvar & Atualizar no Feed 3x3 */}
          {onSaveToFeed && (
            <button
              type="button"
              onClick={handleSaveToFeed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-xs font-mono font-bold text-emerald-300 transition-all shadow-md ring-1 ring-emerald-500/30"
            >
              <Save className="h-3.5 w-3.5 text-emerald-400" />
              <span>Salvar no Feed</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* Alerta de Feedback de Sucesso */}
      {saveSuccessMsg && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between gap-2 z-20 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-400/80 hover:text-emerald-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BARRA DE FERRAMENTAS CONTEXTUAL (DURANTE SELEÇÃO)              */}
      {/* ------------------------------------------------------------- */}
      <div className="h-11 border-b border-white/10 bg-[#121217] px-4 flex items-center justify-between gap-3 overflow-x-auto shrink-0 z-20 text-xs">
        {/* Quando TEXTO está selecionado */}
        {isText && (
          <div className="flex items-center gap-2 min-w-max">
            {/* Família da Fonte */}
            <select
              value={editor?.getActiveFontFamily() || fonts[0].value}
              onChange={(e) => editor?.changeFontFamily(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer font-sans"
            >
              {fonts.map((f) => (
                <option key={f.name} value={f.value} className="bg-zinc-900 text-white">
                  {f.name}
                </option>
              ))}
            </select>

            <div className="h-4 w-px bg-white/10" />

            {/* Tamanho da Fonte */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-lg px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => {
                  const curr = editor?.getActiveFontSize() || FONT_SIZE;
                  editor?.changeFontSize(Math.max(12, curr - 4));
                }}
                className="px-1 text-zinc-400 hover:text-white font-bold"
              >
                -
              </button>
              <span className="font-mono text-[11px] min-w-6 text-center text-white font-bold">
                {editor?.getActiveFontSize()}
              </span>
              <button
                type="button"
                onClick={() => {
                  const curr = editor?.getActiveFontSize() || FONT_SIZE;
                  editor?.changeFontSize(curr + 4);
                }}
                className="px-1 text-zinc-400 hover:text-white font-bold"
              >
                +
              </button>
            </div>

            {/* Seletor & Swatches Rápidas de Cor do Texto (1 Clique) */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1">
              <span className="text-[10px] font-mono text-zinc-400 hidden xl:inline">Cor:</span>
              
              {/* Swatches Rápidas em 1 Clique */}
              <div className="flex items-center gap-1">
                {[
                  { name: "Branco Puro", color: "#FFFFFF" },
                  { name: "Preto Carbono", color: "#09090B" },
                  { name: "Amber Gold", color: "#F59E0B" },
                  { name: "Cyber Sky", color: "#38BDF8" },
                  { name: "Emerald", color: "#10B981" },
                  { name: "Purple Neon", color: "#A855F7" },
                  { name: "Crimson", color: "#EF4444" },
                  { name: "Cinza Platina", color: "#E4E4E7" },
                ].map((swatch) => {
                  const activeColor = (editor?.getActiveFillColor() || "").toUpperCase();
                  const isCurrent = activeColor === swatch.color.toUpperCase();
                  return (
                    <button
                      key={swatch.color}
                      type="button"
                      onClick={() => editor?.changeFillColor(swatch.color)}
                      title={`${swatch.name} (${swatch.color})`}
                      className={`h-5 w-5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? "ring-2 ring-sky-400 ring-offset-1 ring-offset-black scale-110 border-white shadow-md"
                          : "border-white/20 hover:scale-110"
                      }`}
                      style={{ backgroundColor: swatch.color }}
                    >
                      {isCurrent && (
                        <span className={`text-[8px] font-bold ${swatch.color === "#FFFFFF" || swatch.color === "#E4E4E7" ? "text-black" : "text-white"}`}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Seletor Livre (Color Wheel) */}
              <label
                className="relative flex items-center justify-center h-5 w-5 rounded-full border border-white/30 bg-gradient-to-tr from-pink-500 via-amber-400 to-sky-400 cursor-pointer hover:scale-110 transition-transform shadow-sm ml-0.5"
                title="Paleta Completa / Cor Customizada"
              >
                <input
                  type="color"
                  value={editor?.getActiveFillColor() || "#FFFFFF"}
                  onChange={(e) => editor?.changeFillColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>

              {/* Input Hex */}
              <input
                type="text"
                value={editor?.getActiveFillColor() || "#FFFFFF"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("#") && (val.length === 4 || val.length === 7)) {
                    editor?.changeFillColor(val);
                  }
                }}
                className="w-16 bg-black/40 border border-white/10 rounded px-1 text-[10px] font-mono text-zinc-300 text-center uppercase focus:border-sky-400 focus:outline-none"
                placeholder="#HEX"
                title="Código Hexadecimal da Cor"
              />
            </div>

            <div className="h-4 w-px bg-white/10" />

            {/* Estilos: Negrito, Itálico, Sublinhado, Riscado */}
            <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => {
                  const isBold = (editor?.getActiveFontWeight() || 400) >= 700;
                  editor?.changeFontWeight(isBold ? 400 : 800);
                }}
                className={`p-1.5 rounded transition-all ${
                  (editor?.getActiveFontWeight() || 400) >= 700
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Negrito"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const isItalic = editor?.getActiveFontStyle() === "italic";
                  editor?.changeFontStyle(isItalic ? "normal" : "italic");
                }}
                className={`p-1.5 rounded transition-all ${
                  editor?.getActiveFontStyle() === "italic"
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Itálico"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const isUnderline = editor?.getActiveFontUnderline() || false;
                  editor?.changeFontUnderline(!isUnderline);
                }}
                className={`p-1.5 rounded transition-all ${
                  editor?.getActiveFontUnderline()
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Sublinhado"
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Alinhamento */}
            <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => editor?.changeTextAlign("left")}
                className={`p-1.5 rounded transition-all ${
                  editor?.getActiveTextAlign() === "left"
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Alinhar à Esquerda"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor?.changeTextAlign("center")}
                className={`p-1.5 rounded transition-all ${
                  editor?.getActiveTextAlign() === "center"
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Alinhar ao Centro"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor?.changeTextAlign("right")}
                className={`p-1.5 rounded transition-all ${
                  editor?.getActiveTextAlign() === "right"
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Alinhar à Direita"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quando FORMA / ELEMENTO está selecionado */}
        {isShape && (
          <div className="flex items-center gap-3 min-w-max">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400">Preenchimento:</span>
              <input
                type="color"
                value={editor?.getActiveFillColor() || "#FFFFFF"}
                onChange={(e) => editor?.changeFillColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400">Borda:</span>
              <input
                type="color"
                value={editor?.getActiveStrokeColor() || "#38BDF8"}
                onChange={(e) => editor?.changeStrokeColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <select
                value={editor?.getActiveStrokeWidth() || 1}
                onChange={(e) => editor?.changeStrokeWidth(Number(e.target.value))}
                className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-mono text-white"
              >
                <option value={0}>0px</option>
                <option value={1}>1px</option>
                <option value={2}>2px</option>
                <option value={4}>4px</option>
                <option value={8}>8px</option>
              </select>
            </div>
          </div>
        )}

        {/* Quando IMAGEM está selecionada */}
        {isImage && (
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-mono text-zinc-400">Filtro de Imagem:</span>
            <div className="flex items-center gap-1">
              {["none", "greyscale", "contrast", "brightness", "vintage", "blur"].map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => editor?.changeImageFilter(flt)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono uppercase border border-white/10 bg-white/[0.04] hover:bg-white/10 text-zinc-300"
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quando NADA está selecionado: Controles de Fundo do Canvas */}
        {!selectedObject && (
          <div className="flex items-center gap-3 text-zinc-400 text-xs">
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
        )}

        {/* Ações Universais de Objeto (Opacidade, Ordem de Camadas, Duplicar, Deletar) */}
        {selectedObject && (
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Opacidade */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
              <span className="text-[10px] font-mono text-zinc-400">Opacidade:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={editor?.getActiveOpacity() ?? 1}
                onChange={(e) => editor?.changeOpacity(parseFloat(e.target.value))}
                className="w-16 accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Camadas */}
            <button
              type="button"
              onClick={() => editor?.bringForward()}
              title="Trazer para Frente"
              className="px-2 py-1 rounded text-[11px] font-mono bg-white/[0.04] hover:bg-white/10 border border-white/10 text-zinc-300"
            >
              Frente ↑
            </button>
            <button
              type="button"
              onClick={() => editor?.sendBackwards()}
              title="Enviar para Trás"
              className="px-2 py-1 rounded text-[11px] font-mono bg-white/[0.04] hover:bg-white/10 border border-white/10 text-zinc-300"
            >
              Atrás ↓
            </button>

            {/* Duplicar */}
            <button
              type="button"
              onClick={() => editor?.duplicate()}
              title="Duplicar Objeto (Ctrl+C, Ctrl+V)"
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Copy className="h-4 w-4" />
            </button>

            {/* Deletar */}
            <button
              type="button"
              onClick={() => editor?.delete()}
              title="Excluir Elemento (Delete)"
              className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CORPO PRINCIPAL: BARRA LATERAL + ÁREA DO CANVAS                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* BARRA LATERAL DE FERRAMENTAS (ESTILO CANVA PRO) */}
        <aside className="w-16 bg-[#0c0c0f] border-r border-white/10 flex flex-col items-center py-3 gap-2 shrink-0 z-10">
          <button
            type="button"
            onClick={() => setActiveTool(activeTool === "text" ? "select" : "text")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
              activeTool === "text"
                ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Type className="h-5 w-5" />
            <span className="text-[9px] font-mono mt-1">Texto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(activeTool === "shapes" ? "select" : "shapes")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
              activeTool === "shapes"
                ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Square className="h-5 w-5" />
            <span className="text-[9px] font-mono mt-1">Formas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(activeTool === "images" ? "select" : "images")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
              activeTool === "images"
                ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-[9px] font-mono mt-1">Imagens</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(activeTool === "templates" ? "select" : "templates")}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
              activeTool === "templates"
                ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-[9px] font-mono mt-1">Presets</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeTool === "draw") {
                editor?.disableDrawingMode();
                setActiveTool("select");
              } else {
                editor?.enableDrawingMode();
                setActiveTool("draw");
              }
            }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
              activeTool === "draw"
                ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <PenTool className="h-5 w-5" />
            <span className="text-[9px] font-mono mt-1">Desenhar</span>
          </button>
        </aside>

        {/* PAINEL LATERAL EXPANSÍVEL (CONTEÚDO DA FERRAMENTA ATIVA) */}
        {activeTool !== "select" && (
          <div className="w-72 bg-[#121217] border-r border-white/10 p-4 overflow-y-auto shrink-0 z-10 flex flex-col gap-4 animate-in slide-in-from-left duration-200">
            {/* PAINEL DE TEXTO */}
            {activeTool === "text" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Type className="h-4 w-4 text-sky-400" />
                    <span>Adicionar Tipografia</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTool("select")}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => editor?.addHeading()}
                    className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/50 transition-all cursor-pointer group"
                  >
                    <span className="text-lg font-clash font-extrabold uppercase tracking-tight block text-white group-hover:text-sky-300">
                      TÍTULO MONUMENTAL
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Clash Display 72px • Editorial Bold
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editor?.addSubheading()}
                    className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/50 transition-all cursor-pointer group"
                  >
                    <span className="text-sm font-sans font-semibold block text-zinc-200 group-hover:text-sky-300">
                      Subtítulo de Posicionamento
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Inter 36px • SemiBold
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editor?.addBodyText()}
                    className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/50 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-sans text-zinc-400 block group-hover:text-zinc-200">
                      Parágrafo de tese e narrativa corporativa para explicar argumentos de venda.
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Inter 24px • Regular
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editor?.addBadge()}
                    className="w-full text-left p-3 rounded-xl border border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-mono font-bold uppercase tracking-wider block text-sky-300">
                      TAG // BADGE TÉCNICO
                    </span>
                    <span className="text-[10px] font-mono text-sky-400/70">
                      JetBrains Mono 14px • Pill
                    </span>
                  </button>
                </div>

                {/* PALETA DE CORES RÁPIDA PARA TEXTO */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-zinc-300">
                      Cores Rápidas de Copy
                    </span>
                    <span className="text-[10px] font-mono text-sky-400">
                      {editor?.getActiveFillColor() || "#FFFFFF"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: "Branco Puro", color: "#FFFFFF" },
                      { name: "Preto Carbono", color: "#09090B" },
                      { name: "Amber Gold", color: "#F59E0B" },
                      { name: "Cyber Sky", color: "#38BDF8" },
                      { name: "Emerald", color: "#10B981" },
                      { name: "Purple Neon", color: "#A855F7" },
                      { name: "Crimson", color: "#EF4444" },
                      { name: "Cinza Platina", color: "#E4E4E7" },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => editor?.changeFillColor(swatch.color)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-sky-400/40 transition-all text-left cursor-pointer group"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0 group-hover:scale-110 transition-transform shadow-sm"
                          style={{ backgroundColor: swatch.color }}
                        />
                        <span className="text-[10px] font-mono text-zinc-300 group-hover:text-white truncate">
                          {swatch.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAINEL DE FORMAS E ELEMENTOS */}
            {activeTool === "shapes" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Square className="h-4 w-4 text-sky-400" />
                    <span>Elementos &amp; Formas</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTool("select")}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => editor?.addSoftRectangle()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <div className="w-12 h-8 rounded-lg border-2 border-sky-400/80 bg-sky-500/20 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-300">Card Arredondado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editor?.addRectangle()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <div className="w-12 h-8 border-2 border-zinc-400 bg-zinc-500/20 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-300">Retângulo Suíço</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editor?.addCircle()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-400 bg-indigo-500/20 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-300">Círculo / Glow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editor?.addTriangle()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <Triangle className="h-9 w-9 text-amber-400 mb-1" />
                    <span className="text-[10px] font-mono text-zinc-300">Triângulo</span>
                  </button>
                </div>
              </div>
            )}

            {/* PAINEL DE IMAGENS E ATIVOS */}
            {activeTool === "images" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-sky-400" />
                    <span>Upload &amp; Ativos 3D</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTool("select")}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Botão de Upload Local */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-3 rounded-xl border border-dashed border-sky-400/50 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Subir Imagem do Mac / PC</span>
                </button>

                {/* Galeria de Ativos Oficiais BlackLink */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-bold block">
                    Ativos BlackLink 3D
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Cromo Líquido", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
                      { name: "Obsidian Dark", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80" },
                      { name: "Cubo de Vidro", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
                      { name: "Retrato Editorial", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
                    ].map((asset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => editor?.addImage(asset.url)}
                        className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-sky-400 transition-all cursor-pointer text-left aspect-video"
                      >
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] font-mono text-white font-medium">
                            {asset.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAINEL DE PRESETS & RECARGA DO POST */}
            {activeTool === "templates" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-sky-400" />
                    <span>Presets de Design</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTool("select")}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {initialPost && (
                  <button
                    type="button"
                    onClick={loadPostContent}
                    className="w-full p-3 rounded-xl border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Carregar Conteúdo do Post Atual</span>
                  </button>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                    Estilos Editoriais Recomendados
                  </span>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs">
                      <span className="font-bold text-white block">✦ Tipografia Flutuante</span>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Texto puro monumental sem balões, flutuando sobre a imagem com sombras nítidas.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs">
                      <span className="font-bold text-white block">✦ Swiss Brutalism</span>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Grades assimétricas, tags em código mono e linhas estruturais de precisão.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ÁREA CENTRAL DE RENDERIZAÇÃO DO CANVAS (CANVA WORKSPACE)      */}
        {/* ------------------------------------------------------------- */}
        <div
          ref={containerRef}
          className="flex-1 h-full w-full bg-[#0a0a0c] relative flex items-center justify-center overflow-hidden p-6"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        >
          <canvas ref={canvasRef} className="block shadow-2xl rounded-sm" />

          {/* Indicador de Resolução no Canto Inferior */}
          <div className="absolute bottom-3 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono text-zinc-400 flex items-center gap-2 pointer-events-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {selectedFormat === "1:1"
                ? "1080 x 1080 px (1:1)"
                : selectedFormat === "4:5"
                ? "1080 x 1350 px (4:5)"
                : "1080 x 1920 px (9:16)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
