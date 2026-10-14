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
} from "../types";
import { useHistory } from "./use-history";
import { useClipboard } from "./use-clipboard";
import { useAutoResize } from "./use-auto-resize";
import { useCanvasEvents } from "./use-canvas-events";
import { useHotkeys } from "./use-hotkeys";
import { createFilter, downloadFile, isTextType, transformText } from "../utils";

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
    const options = generateSaveOptions(format);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);
    autoZoom();
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
    changeFontFamily: (value: string) => {
      setFontFamily(value);
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
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });
      canvas.renderAll();
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
        width: initialWidth.current,
        height: initialHeight.current,
        name: "clip",
        fill: "#09090B",
        selectable: false,
        hasControls: false,
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
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;

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
