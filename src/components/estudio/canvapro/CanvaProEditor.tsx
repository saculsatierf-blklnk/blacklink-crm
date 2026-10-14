"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
  ActiveTool,
  selectionDependentTools,
} from "./types";
import { useEditor } from "./hooks/use-editor";
import { Navbar } from "./components/navbar";
import { Sidebar } from "./components/sidebar";
import { Toolbar } from "./components/toolbar";
import { Footer } from "./components/footer";

// Sidebars Modulares do Canva Pro
import { TextSidebar } from "./components/sidebars/text-sidebar";
import { FontSidebar } from "./components/sidebars/font-sidebar";
import { FillColorSidebar } from "./components/sidebars/fill-color-sidebar";
import { StrokeColorSidebar } from "./components/sidebars/stroke-color-sidebar";
import { StrokeWidthSidebar } from "./components/sidebars/stroke-width-sidebar";
import { ShapeSidebar } from "./components/sidebars/shape-sidebar";
import { OpacitySidebar } from "./components/sidebars/opacity-sidebar";
import { FilterSidebar } from "./components/sidebars/filter-sidebar";
import { ImageSidebar } from "./components/sidebars/image-sidebar";
import { TemplateSidebar } from "./components/sidebars/template-sidebar";
import { DrawSidebar } from "./components/sidebars/draw-sidebar";
import { SettingsSidebar } from "./components/sidebars/settings-sidebar";

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

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"1:1" | "4:5" | "9:16">("1:1");

  // Callback de deseleção para recolher sidebars dependentes de seleção
  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultWidth: 1080,
    defaultHeight: selectedFormat === "1:1" ? 1080 : selectedFormat === "4:5" ? 1350 : 1920,
    clearSelectionCallback: onClearSelection,
  });

  // Inicializa o Fabric Canvas
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

  // Carrega os elementos do slide atual com fidelidade visual 100%
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

  const lastLoadedKeyRef = useRef<string>("");
  const currentKey = `${initialPost?.id || "empty"}-${activeSlideIdx}-${initialPost?.slides?.[activeSlideIdx]?.headline || ""}`;

  useEffect(() => {
    if (editor && initialPost && lastLoadedKeyRef.current !== currentKey) {
      lastLoadedKeyRef.current = currentKey;
      loadPostContent();
    }
  }, [editor, initialPost, currentKey, loadPostContent]);

  // Alteração de Formato do Canvas
  const handleFormatChange = (fmt: "1:1" | "4:5" | "9:16") => {
    if (!editor) return;
    setSelectedFormat(fmt);

    let w = 1080;
    let h = 1080;
    if (fmt === "4:5") h = 1350;
    if (fmt === "9:16") h = 1920;

    editor.changeSize({ width: w, height: h });
  };

  // Alternador de Ferramenta Ativa
  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        editor?.enableDrawingMode();
      }

      if (activeTool === "draw" && tool !== "draw") {
        editor?.disableDrawingMode();
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool, editor]
  );

  // Salvar no Feed 3x3 com Sincronização Bidirecional
  const handleSaveToFeed = (closeAfterSave = false) => {
    if (!editor) return;

    const renderedUrl = editor.exportDataUrl("png");

    const canvas = editor.canvas;
    const headlineObj = canvas?.getObjects().find((o) => o.name === "slide-headline") as fabric.Textbox | undefined;
    const bodyObj = canvas?.getObjects().find((o) => o.name === "slide-body") as fabric.Textbox | undefined;
    const tagObj = canvas?.getObjects().find((o) => o.name === "slide-tag") as fabric.Textbox | undefined;

    if (onSaveToFeed) {
      onSaveToFeed(renderedUrl, {
        copyPosition: editor.getActiveCopyPosition(),
        ...(headlineObj?.text ? { headline: headlineObj.text } : {}),
        ...(bodyObj?.text ? { bodyText: bodyObj.text } : {}),
        ...(tagObj?.text ? { tag: tagObj.text } : {}),
      });
    }

    setSaveSuccessMsg("✨ Post salvo e sincronizado com o Feed 3x3!");

    if (closeAfterSave && onClose) {
      setTimeout(() => {
        onClose();
      }, 350);
    } else {
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  const currentSlide = initialPost?.slides?.[activeSlideIdx];
  const workspace = editor?.getWorkspace();

  return (
    <div
      className={`flex flex-col h-full w-full bg-[#09090B] text-white border border-white/10 rounded-2xl overflow-hidden shadow-2xl select-none ${className}`}
    >
      {/* 1. TOP NAVBAR DO CANVA PRO */}
      <Navbar
        editor={editor}
        title={initialPost?.theme || "Design BlackLink"}
        activeSlideIdx={activeSlideIdx}
        totalSlides={initialPost?.slides?.length || 1}
        onSaveToFeed={onSaveToFeed ? () => handleSaveToFeed(false) : undefined}
        onSaveAndClose={onSaveToFeed && onClose ? () => handleSaveToFeed(true) : undefined}
        onClose={onClose}
        saveSuccessMsg={saveSuccessMsg}
      />

      {/* 2. BARRA DE FERRAMENTAS CONTEXTUAL DINÂMICA */}
      <Toolbar
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        selectedFormat={selectedFormat}
        onFormatChange={handleFormatChange}
      />

      {/* 3. CORPO CENTRAL: SIDEBAR DE FERRAMENTAS + PAINEL MODULAR + CANVAS WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar com Ícones das Ferramentas */}
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />

        {/* Sidebars Modulares das Ferramentas */}
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          currentHeadline={currentSlide?.headline}
          currentBodyText={currentSlide?.bodyText}
          currentTag={currentSlide?.tag}
        />
        <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          selectedFormat={selectedFormat}
          onFormatChange={handleFormatChange}
        />

        {/* Workspace do Canvas com Grid Técnico e AutoZoom */}
        <main
          ref={containerRef}
          className="flex-1 h-full bg-[#050507] relative overflow-hidden flex items-center justify-center p-6 select-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        >
          <canvas ref={canvasRef} className="rounded-lg shadow-2xl" />
        </main>
      </div>

      {/* 4. FOOTER COM CONTROLES DE ZOOM E DIMENSÕES */}
      <Footer
        editor={editor}
        width={workspace?.width || 1080}
        height={workspace?.height || 1080}
      />
    </div>
  );
}
