import { fabric } from "fabric";
import { useCallback, useState, useMemo, useRef } from "react";
import {
  Editor,
  FILL_COLOR,
  STROKE_WIDTH,
  STROKE_COLOR,
  CIRCLE_OPTIONS,
  RECTANGLE_OPTIONS,
  BuildEditorProps,
  EditorHookProps,
  STROKE_DASH_ARRAY,
  TEXT_OPTIONS,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  JSON_KEYS,
  ExactSlideLayoutProps,
  CopyPosition,
} from "../types";
import { useHistory } from "./use-history";
import { useClipboard } from "./use-clipboard";
import { useAutoResize } from "./use-auto-resize";
import { useCanvasEvents } from "./use-canvas-events";
import { useHotkeys } from "./use-hotkeys";
import { createFilter, downloadFile, isTextType, transformText } from "../utils";

function resolveFallbackImage(variant: string): string {
  switch (variant) {
    case "swiss-box":
      return "/brand/blacklink-art-gradient.jpg";
    case "3d-keycap":
      return "/brand/blacklink-3d-keycap.jpg";
    case "3d-crystal":
      return "/brand/blacklink-art-pins.jpg";
    case "pure-monumental":
      return "/brand/blacklink-art-portrait.jpg";
    case "3d-cursor":
      return "/brand/blacklink-art-cursor-light.jpg";
    case "3d-liquid":
      return "/brand/blacklink-art-glass-model.jpg";
    case "3d-sculpture":
      return "/brand/blacklink-art-macro-glass.jpg";
    case "clean-ice":
      return "/brand/blacklink-art-obsidian-dark.jpg";
    case "clean-ice-box":
      return "/brand/blacklink-art-cursor-light.jpg";
    default:
      return "/brand/blacklink-art-portrait.jpg";
  }
}

const buildEditor = ({
  save,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  copy,
  paste,
  canvas,
  fillColor,
  fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
  copyPosition,
  setCopyPositionState,
}: BuildEditorProps): Editor => {
  const getWorkspace = () => {
    return canvas
      .getObjects()
      .find((object) => object.name === "clip") as fabric.Rect | undefined;
  };

  const generateSaveOptions = (format: "png" | "jpeg" = "png") => {
    const workspace = getWorkspace();
    const width = workspace?.width || 1080;
    const height = workspace?.height || 1080;
    const left = workspace?.left || 0;
    const top = workspace?.top || 0;

    return {
      name: "BlackLink-Post",
      format,
      quality: 1,
      width,
      height,
      left,
      top,
    };
  };

  const exportDataUrl = (format: "png" | "jpeg" = "png"): string => {
    const workspace = getWorkspace();
    const width = workspace?.width || 1080;
    const height = workspace?.height || 1080;
    const left = workspace?.left || 0;
    const top = workspace?.top || 0;

    const prevWidth = canvas.getWidth();
    const prevHeight = canvas.getHeight();
    const prevTransform = canvas.viewportTransform ? [...canvas.viewportTransform] : null;
    const prevClip = canvas.clipPath;
    const activeObjects = canvas.getActiveObjects();

    // Desativa seleção e clipPath para renderização limpa do buffer
    canvas.discardActiveObject();
    canvas.clipPath = undefined as any;

    // Redimensiona o canvas para a resolução real do post (1080p) e compensa o offset
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.setViewportTransform([1, 0, 0, 1, -left, -top]);
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({
      format: format === "jpeg" ? "jpeg" : "png",
      quality: 1,
    });

    // Restaura o tamanho do container DOM, clipPath, seleção e viewport
    canvas.setWidth(prevWidth);
    canvas.setHeight(prevHeight);
    canvas.clipPath = prevClip;
    if (activeObjects.length > 0) {
      if (activeObjects.length === 1) {
        canvas.setActiveObject(activeObjects[0]);
      } else {
        const sel = new fabric.ActiveSelection(activeObjects, { canvas });
        canvas.setActiveObject(sel);
      }
    }
    if (prevTransform) {
      canvas.setViewportTransform(prevTransform);
    }
    autoZoom();
    canvas.requestRenderAll();

    return dataUrl;
  };

  const savePng = () => {
    const dataUrl = exportDataUrl("png");
    downloadFile(dataUrl, `blacklink-design-${Date.now()}`, "png");
  };

  const saveJpg = () => {
    const dataUrl = exportDataUrl("jpeg");
    downloadFile(dataUrl, `blacklink-design-${Date.now()}`, "jpg");
  };

  const saveSvg = () => {
    const options = generateSaveOptions();
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);
    downloadFile(dataUrl, `blacklink-design-${Date.now()}`, "svg");
    autoZoom();
  };

  const saveJson = async () => {
    const dataUrl = canvas.toJSON(JSON_KEYS);
    await transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t")
    )}`;
    downloadFile(fileString, `blacklink-design-${Date.now()}`, "json");
  };

  const loadJson = (json: string) => {
    try {
      const data = JSON.parse(json);
      canvas.loadFromJSON(data, () => {
        autoZoom();
      });
    } catch (e) {
      console.error("Falha ao carregar JSON no canvas", e);
    }
  };

  const center = (object: fabric.Object) => {
    const workspace = getWorkspace();
    const centerPoint = workspace?.getCenterPoint();
    if (!centerPoint) return;
    // @ts-ignore
    canvas._centerObject(object, centerPoint);
  };

  const addToCanvas = (object: fabric.Object) => {
    center(object);
    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
  };

  return {
    savePng,
    saveJpg,
    saveSvg,
    saveJson,
    loadJson,
    exportDataUrl,
    canUndo,
    canRedo,
    autoZoom,
    getWorkspace,
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.08;
      const centerPt = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(centerPt.left, centerPt.top),
        zoomRatio > 2 ? 2 : zoomRatio
      );
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.08;
      const centerPt = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(centerPt.left, centerPt.top),
        zoomRatio < 0.15 ? 0.15 : zoomRatio
      );
    },
    resetZoom: () => {
      autoZoom();
    },
    changeSize: (value: { width: number; height: number }) => {
      const workspace = getWorkspace();
      workspace?.set(value);
      autoZoom();
      save();
    },
    changeBackground: (value: string) => {
      const workspace = getWorkspace();
      workspace?.set({ fill: value });
      canvas.renderAll();
      save();
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
    },
    onUndo: () => undo(),
    onRedo: () => redo(),
    onCopy: () => copy(),
    onPaste: () => paste(),
    duplicate: () => {
      copy();
      paste();
    },
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;
          const effect = createFilter(value);
          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
      save();
    },
    addImage: (value: string) => {
      return new Promise<fabric.Image>((resolve, reject) => {
        fabric.Image.fromURL(
          value,
          (image) => {
            if (!image) {
              reject(new Error("Falha ao carregar imagem"));
              return;
            }
            const workspace = getWorkspace();
            const w = workspace?.width || 1080;
            const h = workspace?.height || 1080;

            // Scale to fit workspace if larger
            if ((image.width || 0) > w || (image.height || 0) > h) {
              image.scaleToWidth(w * 0.75);
            }

            addToCanvas(image);
            resolve(image);
          },
          { crossOrigin: "anonymous" }
        );
      });
    },
    setBackgroundImage: (value: string) => {
      return new Promise<void>((resolve, reject) => {
        fabric.Image.fromURL(
          value,
          (image) => {
            if (!image) {
              reject(new Error("Falha ao carregar imagem de fundo"));
              return;
            }
            const workspace = getWorkspace();
            const w = workspace?.width || 1080;
            const h = workspace?.height || 1080;

            image.set({
              left: workspace?.left || 0,
              top: workspace?.top || 0,
              originX: "left",
              originY: "top",
              selectable: true,
              name: "bg-image",
            });

            // Scale image to cover workspace
            const scaleX = w / (image.width || 1);
            const scaleY = h / (image.height || 1);
            const scale = Math.max(scaleX, scaleY);
            image.scale(scale);

            // Add and send to back (right above workspace)
            canvas.add(image);
            // Move behind other elements but above workspace clip
            image.moveTo(1);
            canvas.requestRenderAll();
            save();
            resolve();
          },
          { crossOrigin: "anonymous" }
        );
      });
    },
    delete: () => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.name !== "clip") {
          canvas.remove(object);
        }
      });
      canvas.discardActiveObject();
      canvas.renderAll();
      save();
    },
    addText: (value, options) => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        fontFamily,
        ...options,
      });
      addToCanvas(object);
    },
    addHeading: (value = "TÍTULO MONUMENTAL") => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fontSize: 72,
        fontWeight: 800,
        fontFamily: "'Clash Display', sans-serif",
        lineHeight: 1.05,
        fill: "#FFFFFF",
        width: 780,
      });
      addToCanvas(object);
    },
    addSubheading: (value = "Subtítulo de Posicionamento Estratégico") => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fontSize: 36,
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.25,
        fill: "#E4E4E7",
        width: 680,
      });
      addToCanvas(object);
    },
    addBodyText: (
      value = "Texto complementar e narrativa corporativa. O alinhamento perfeito entre estética visual e engenharia de vendas."
    ) => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fontSize: 24,
        fontWeight: 400,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.45,
        fill: "#A1A1AA",
        width: 600,
      });
      addToCanvas(object);
    },
    addBadge: (tagText = "DIAGNÓSTICO // BLACK LINK") => {
      const object = new fabric.Textbox(tagText, {
        ...TEXT_OPTIONS,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        fill: "#38BDF8",
        width: 320,
        backgroundColor: "rgba(56, 189, 248, 0.12)",
        textAlign: "center",
      });
      addToCanvas(object);
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return 1;
      return selectedObject.get("opacity") ?? 1;
    },
    changeFontSize: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ fontSize: value });
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return FONT_SIZE;
      // @ts-ignore
      return selectedObject.get("fontSize") || FONT_SIZE;
    },
    changeTextAlign: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ textAlign: value });
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return "left";
      // @ts-ignore
      return selectedObject.get("textAlign") || "left";
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return false;
      // @ts-ignore
      return selectedObject.get("underline") || false;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return false;
      // @ts-ignore
      return selectedObject.get("linethrough") || false;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ fontStyle: value });
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return "normal";
      // @ts-ignore
      return selectedObject.get("fontStyle") || "normal";
    },
    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ fontWeight: value });
        }
      });
      canvas.renderAll();
      save();
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity: value });
      });
      canvas.renderAll();
      save();
    },
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringForward(object);
      });
      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
      save();
    },
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendBackwards(object);
      });
      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
      save();
    },
    bringToFront: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringToFront(object);
      });
      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
      save();
    },
    sendToBack: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendToBack(object);
      });
      const workspace = getWorkspace();
      workspace?.sendToBack();
      canvas.renderAll();
      save();
    },
    changeFontFamily: async (value: string) => {
      setFontFamily(value);
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.load(`700 32px "${value}"`);
          await document.fonts.ready;
        } catch (e) {
          // ignore
        }
      }
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ fontFamily: value });
        }
      });
      canvas.renderAll();
      save();
    },
    changeFillColor: (value: string) => {
      setFillColor(value);
      const activeObjs = canvas.getActiveObjects();
      if (activeObjs.length > 0) {
        activeObjs.forEach((object) => {
          object.set({ fill: value });
          // @ts-ignore
          if (object.isEditing) {
            // @ts-ignore
            object.setSelectionStyles({ fill: value });
          }
        });
      } else {
        const headline = canvas.getObjects().find((obj) => obj.name === "slide-headline" || isTextType(obj.type));
        if (headline) {
          headline.set({ fill: value });
          canvas.setActiveObject(headline);
        }
      }
      canvas.requestRenderAll();
      save();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          object.set({ fill: value });
          return;
        }
        object.set({ stroke: value });
      });
      canvas.freeDrawingBrush.color = value;
      canvas.renderAll();
      save();
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      canvas.freeDrawingBrush.width = value;
      canvas.renderAll();
      save();
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
      });
      canvas.renderAll();
      save();
    },
    addCircle: () => {
      const object = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor || "rgba(255,255,255,0.1)",
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
      addToCanvas(object);
    },
    addSoftRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 24,
        ry: 24,
        fill: fillColor || "rgba(255,255,255,0.08)",
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
      addToCanvas(object);
    },
    addRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 0,
        ry: 0,
        fill: fillColor || "rgba(255,255,255,0.08)",
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
      addToCanvas(object);
    },
    addTriangle: () => {
      const object = new fabric.Triangle({
        left: 200,
        top: 200,
        width: 300,
        height: 300,
        fill: fillColor || "rgba(255,255,255,0.1)",
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
      addToCanvas(object);
    },
    addInverseTriangle: () => {
      const object = new fabric.Triangle({
        left: 200,
        top: 200,
        width: 300,
        height: 300,
        angle: 180,
        fill: fillColor || "rgba(255,255,255,0.1)",
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
      addToCanvas(object);
    },
    loadExactSlideLayout: async (data: ExactSlideLayoutProps) => {
      // 1. Limpa todos os objetos que não sejam o workspace clip
      const existing = canvas.getObjects().filter((obj) => obj.name !== "clip");
      existing.forEach((obj) => canvas.remove(obj));

      const workspace = getWorkspace();
      const w = workspace?.width || 1080;
      const h = workspace?.height || 1080;
      const wsLeft = workspace?.left ?? 0;
      const wsTop = workspace?.top ?? 0;

      // 2. Determina contraste e posicionamento idênticos ao BlackLinkGlassLayout
      const variant = data.variant || "3d-cursor";
      const isLight = (() => {
        if (data.contrastMode === "dark") return true;
        if (data.contrastMode === "light") return false;
        return variant === "3d-crystal" || variant === "3d-cursor" || variant === "clean-ice-box";
      })();

      const copyPos: CopyPosition = (() => {
        if (data.copyPosition === "center") return "center";
        if (data.copyPosition === "bottom-left") return "bottom-left";
        if (data.copyPosition === "bottom-right") return "bottom-right";
        if (data.copyPosition === "top-left") return "top-left";
        if (data.copyPosition === "top-right") return "top-right";
        if (
          variant === "pure-monumental" ||
          variant === "3d-liquid" ||
          variant === "3d-sculpture" ||
          variant === "clean-ice"
        ) {
          return "bottom-left";
        }
        return "top-left";
      })();

      setCopyPositionState(copyPos);

      // 3. Carrega Imagem de Fundo cobrindo perfeitamente o workspace
      const imageSrc =
        data.imageUrl &&
        !data.imageUrl.startsWith("data:image") &&
        !data.imageUrl.includes("render-slide") &&
        !data.imageUrl.includes("pollinations.ai")
          ? data.imageUrl
          : resolveFallbackImage(variant);

      if (imageSrc) {
        await new Promise<void>((resolve) => {
          fabric.Image.fromURL(
            imageSrc,
            (img) => {
              if (img && img.width && img.height) {
                const scale = Math.max(w / img.width, h / img.height);
                img.set({
                  left: wsLeft + (w - img.width * scale) / 2,
                  top: wsTop + (h - img.height * scale) / 2,
                  originX: "left",
                  originY: "top",
                  scaleX: scale,
                  scaleY: scale,
                  selectable: false,
                  evented: false,
                  name: "slide-bg",
                });
                canvas.add(img);
                img.moveTo(1);
              }
              resolve();
            },
            { crossOrigin: "anonymous" }
          );
        });
      }

      // Pré-carrega fontes autênticas com document.fonts.load para evitar fallback para Arial
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await Promise.all([
            document.fonts.load("700 46px 'Clash Display'"),
            document.fonts.load("700 12px 'JetBrains Mono'"),
            document.fonts.load("500 15px 'Inter'"),
          ]);
          await document.fonts.ready;
        } catch (err) {
          console.warn("Fonts preload in Canva Pro:", err);
        }
      }

      // 4. Header Editorial Suíço (DESIGN.BLACKLINK // 2026)
      const headerBrand = new fabric.Text("DESIGN.BLACKLINK", {
        left: wsLeft + 60,
        top: wsTop + 48,
        fontSize: 12,
        fontFamily: "JetBrains Mono",
        fontWeight: 700,
        charSpacing: 280,
        fill: isLight ? "#09090B" : "#FFFFFF",
        opacity: 0.85,
        selectable: true,
        name: "slide-header-brand",
      });
      canvas.add(headerBrand);

      const headerYear = new fabric.Text("2026", {
        left: wsLeft + w - 60,
        top: wsTop + 48,
        originX: "right",
        fontSize: 12,
        fontFamily: "JetBrains Mono",
        fontWeight: 700,
        charSpacing: 250,
        fill: isLight ? "#09090B" : "#FFFFFF",
        opacity: 0.85,
        selectable: true,
        name: "slide-header-year",
      });
      canvas.add(headerYear);

      // 5. Rodapé: Seta Suíça ↗
      const isArrowLeft = copyPos === "bottom-right";
      const arrowLeft = isArrowLeft ? wsLeft + 60 : wsLeft + w - 60 - 44;
      const arrowTextLeft = isArrowLeft ? wsLeft + 60 + 22 : wsLeft + w - 60 - 22;

      const arrowBg = new fabric.Circle({
        left: arrowLeft,
        top: wsTop + h - 48 - 44,
        radius: 22,
        fill: isLight ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.6)",
        stroke: isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)",
        strokeWidth: 1,
        selectable: true,
        name: "slide-footer-arrow-bg",
      });
      const arrowText = new fabric.Text("↗", {
        left: arrowTextLeft,
        top: wsTop + h - 48 - 22,
        originX: "center",
        originY: "center",
        fontSize: 18,
        fontFamily: "sans-serif",
        fontWeight: "700",
        fill: isLight ? "#000000" : "#FFFFFF",
        selectable: true,
        name: "slide-footer-arrow",
      });
      canvas.add(arrowBg);
      canvas.add(arrowText);

      // 6. Bloco Editorial Tipográfico (Tag + Headline + BodyText)
      const headlineRaw = (data.headline || "RIGOR TIPOGRÁFICO INTERNACIONAL").trim().toUpperCase();
      const len = headlineRaw.length;
      const headlineFontSize = len <= 15 ? 46 : len <= 30 ? 38 : len <= 50 ? 32 : 26;

      const hasTag = Boolean(data.tag);
      const hasBody = Boolean(data.bodyText);
      const estHeadlineLines = Math.max(1, Math.ceil(headlineRaw.length / 22));
      const estHeadlineHeight = estHeadlineLines * (headlineFontSize * 1.15);
      const estTotalHeight = (hasTag ? 38 : 0) + estHeadlineHeight + (hasBody ? 54 : 0);

      let startTop = 148;
      if (copyPos === "bottom-left" || copyPos === "bottom-right") {
        startTop = Math.max(148, h - 110 - estTotalHeight);
      } else if (copyPos === "center") {
        startTop = Math.max(148, (h - estTotalHeight) / 2);
      }

      const isRight = copyPos === "top-right" || copyPos === "bottom-right";
      const isCenter = copyPos === "center";
      const originX: "left" | "center" | "right" = isCenter ? "center" : isRight ? "right" : "left";
      const textAlign: "left" | "center" | "right" = isCenter ? "center" : isRight ? "right" : "left";
      const posX = isCenter ? wsLeft + w / 2 : isRight ? wsLeft + w - 60 : wsLeft + 60;

      // Tag
      if (data.tag) {
        const tagObj = new fabric.Textbox(data.tag.toUpperCase(), {
          left: posX,
          top: wsTop + startTop,
          originX: originX,
          textAlign: textAlign,
          fontSize: 11,
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          charSpacing: 250,
          fill: isLight ? "#09090B" : "#FFFFFF",
          backgroundColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
          padding: 6,
          width: Math.min(360, data.tag.length * 11 + 32),
          editable: true,
          name: "slide-tag",
        });
        canvas.add(tagObj);
        startTop += (tagObj.height || 28) + 14;
      }

      // Headline (com sombra volumétrica idêntica à BlackLinkGlassLayout)
      const headlineObj = new fabric.Textbox(headlineRaw, {
        left: posX,
        top: wsTop + startTop,
        originX: originX,
        textAlign: textAlign,
        width: 620,
        fontSize: headlineFontSize,
        fontFamily: "Clash Display",
        fontWeight: 700,
        lineHeight: 1.08,
        charSpacing: -20,
        fill: isLight ? "#09090B" : "#FFFFFF",
        shadow: new fabric.Shadow({
          color: isLight ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.95)",
          blur: isLight ? 2 : 28,
          offsetY: isLight ? 1 : 4,
        }),
        editable: true,
        name: "slide-headline",
      });
      canvas.add(headlineObj);
      startTop += (headlineObj.height || 80) + 14;

      // Body Text
      if (data.bodyText) {
        const bodyObj = new fabric.Textbox(data.bodyText, {
          left: posX,
          top: wsTop + startTop,
          originX: originX,
          textAlign: textAlign,
          width: 500,
          fontSize: 15,
          fontFamily: "Inter",
          fontWeight: 500,
          lineHeight: 1.45,
          fill: isLight ? "#27272A" : "#E4E4E7",
          shadow: new fabric.Shadow({
            color: isLight ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.9)",
            blur: isLight ? 1 : 14,
            offsetY: isLight ? 1 : 2,
          }),
          editable: true,
          name: "slide-body",
        });
        canvas.add(bodyObj);
      }

      // Ativa o Headline para edição imediata
      canvas.setActiveObject(headlineObj);
      canvas.requestRenderAll();
      autoZoom();
      save();
    },
    setCopyPosition: (pos: CopyPosition) => {
      setCopyPositionState(pos);

      const workspace = getWorkspace();
      const w = workspace?.width || 1080;
      const h = workspace?.height || 1080;
      const wsLeft = workspace?.left ?? 0;
      const wsTop = workspace?.top ?? 0;

      // Procura os objetos editoriais do slide
      const tagObj = canvas.getObjects().find((obj) => obj.name === "slide-tag") as fabric.Textbox | undefined;
      const headlineObj = canvas.getObjects().find((obj) => obj.name === "slide-headline") as fabric.Textbox | undefined;
      const bodyObj = canvas.getObjects().find((obj) => obj.name === "slide-body") as fabric.Textbox | undefined;
      const arrowBg = canvas.getObjects().find((obj) => obj.name === "slide-footer-arrow-bg") as fabric.Circle | undefined;
      const arrowText = canvas.getObjects().find((obj) => obj.name === "slide-footer-arrow") as fabric.Text | undefined;

      const textGroup: fabric.Textbox[] = [];
      if (tagObj) textGroup.push(tagObj);
      if (headlineObj) textGroup.push(headlineObj);
      if (bodyObj) textGroup.push(bodyObj);

      if (textGroup.length === 0) {
        // Fallback: seleciona textos no canvas
        const texts = (selectedObjects.length > 0 ? selectedObjects : canvas.getObjects())
          .filter((obj) => isTextType(obj.type)) as fabric.Textbox[];
        if (texts.length > 0) {
          texts.sort((a, b) => (a.top ?? 0) - (b.top ?? 0));
          textGroup.push(...texts);
        }
      }

      if (textGroup.length === 0) return;

      // Calcula a altura acumulada
      let totalHeight = 0;
      textGroup.forEach((t, idx) => {
        const itemH = t.getScaledHeight ? t.getScaledHeight() : (t.height || 40);
        totalHeight += itemH + (idx < textGroup.length - 1 ? 14 : 0);
      });

      const isRight = pos === "top-right" || pos === "bottom-right";
      const isCenter = pos === "center";
      const originX: "left" | "center" | "right" = isCenter ? "center" : isRight ? "right" : "left";
      const textAlign: "left" | "center" | "right" = isCenter ? "center" : isRight ? "right" : "left";
      const targetX = isCenter ? wsLeft + w / 2 : isRight ? wsLeft + w - 60 : wsLeft + 60;

      let startTop = wsTop + 148;
      if (pos === "bottom-left" || pos === "bottom-right") {
        startTop = wsTop + Math.max(148, h - 110 - totalHeight);
      } else if (pos === "center") {
        startTop = wsTop + Math.max(148, (h - totalHeight) / 2);
      }

      let currentTop = startTop;
      textGroup.forEach((item) => {
        item.set({
          left: targetX,
          top: currentTop,
          originX: originX,
          textAlign: textAlign,
        });
        item.setCoords();
        const itemH = item.getScaledHeight ? item.getScaledHeight() : (item.height || 40);
        currentTop += itemH + 14;
      });

      // Reposiciona a seta do rodapé se necessário
      if (arrowBg && arrowText) {
        if (pos === "bottom-right") {
          arrowBg.set({ left: wsLeft + 60 });
          arrowText.set({ left: wsLeft + 60 + 22 });
        } else {
          arrowBg.set({ left: wsLeft + w - 60 - 44 });
          arrowText.set({ left: wsLeft + w - 60 - 22 });
        }
        arrowBg.setCoords();
        arrowText.setCoords();
      }

      canvas.requestRenderAll();
      save();
    },
    getActiveCopyPosition: () => copyPosition,
    canvas,
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return FONT_WEIGHT;
      // @ts-ignore
      return selectedObject.get("fontWeight") || FONT_WEIGHT;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return fontFamily;
      // @ts-ignore
      return selectedObject.get("fontFamily") || fontFamily;
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return fillColor;
      return (selectedObject.get("fill") as string) || fillColor;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return strokeColor;
      return (selectedObject.get("stroke") as string) || strokeColor;
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return strokeWidth;
      return (selectedObject.get("strokeWidth") as number) || strokeWidth;
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return strokeDashArray;
      return (
        (selectedObject.get("strokeDashArray") as number[]) || strokeDashArray
      );
    },
    selectedObjects,
  };
};

export const useEditor = ({
  defaultState,
  defaultHeight = 1080,
  defaultWidth = 1080,
  clearSelectionCallback,
  saveCallback,
}: EditorHookProps) => {
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [fillColor, setFillColor] = useState(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] =
    useState<number[]>(STROKE_DASH_ARRAY);
  const [copyPosition, setCopyPositionState] =
    useState<CopyPosition>("top-left");

  const {
    save,
    canRedo,
    canUndo,
    undo,
    redo,
    canvasHistory,
    setHistoryIndex,
  } = useHistory({
    canvas,
    saveCallback,
  });

  const { copy, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  useHotkeys({
    undo,
    redo,
    copy,
    paste,
    save,
    canvas,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeWidth,
        strokeColor,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
        copyPosition,
        setCopyPositionState,
      });
    }
    return undefined;
  }, [
    canRedo,
    canUndo,
    undo,
    redo,
    save,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily,
    copyPosition,
  ]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        cornerColor: "#FFFFFF",
        cornerStyle: "circle",
        borderColor: "#38BDF8",
        borderScaleFactor: 2,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#38BDF8",
        cornerSize: 10,
      });

      const initialWorkspace = new fabric.Rect({
        left: 0,
        top: 0,
        width: initialWidth.current,
        height: initialHeight.current,
        name: "clip",
        fill: "#09090B",
        selectable: false,
        hasControls: false,
        hoverCursor: "default",
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.85)",
          blur: 32,
          offsetX: 0,
          offsetY: 8,
        }),
      });

      initialCanvas.setWidth(initialContainer.offsetWidth);
      initialCanvas.setHeight(initialContainer.offsetHeight);

      initialCanvas.add(initialWorkspace);

      initialWorkspace.clone((cloned: fabric.Rect) => {
        cloned.set({
          left: 0,
          top: 0,
          absolutePositioned: true,
        });
        initialCanvas.clipPath = cloned;
      });

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      const currentState = JSON.stringify(initialCanvas.toJSON(JSON_KEYS));
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
    },
    [canvasHistory, setHistoryIndex]
  );

  return { init, editor };
};
