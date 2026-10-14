import { fabric } from "fabric";
import { ITextboxOptions } from "fabric/fabric-impl";
import { CopyPosition } from "../layouts/layoutTypes";

export type { CopyPosition };

export const JSON_KEYS = [
  "name",
  "gradientAngle",
  "selectable",
  "hasControls",
  "linkData",
  "editable",
  "extensionType",
  "extension",
];

export const filters = [
  "none",
  "greyscale",
  "polaroid",
  "sepia",
  "kodachrome",
  "contrast",
  "brightness",
  "vintage",
  "technicolor",
  "pixelate",
  "invert",
  "blur",
  "blacknwhite",
  "vibrance",
];

export const fonts = [
  { name: "Clash Display", value: "'Clash Display', sans-serif" },
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Bebas Neue", value: "'Bebas Neue', cursive, sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Cinzel", value: "Cinzel, serif" },
  { name: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { name: "Impact", value: "Impact, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
];

export const brandPalette = [
  "#000000",
  "#09090B",
  "#18181B",
  "#27272A",
  "#52525B",
  "#A1A1AA",
  "#E4E4E7",
  "#FFFFFF",
  "#38BDF8", // Sky
  "#6366F1", // Indigo
  "#A855F7", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "transparent",
];

export type ActiveTool =
  | "select"
  | "templates"
  | "images"
  | "text"
  | "shapes"
  | "draw"
  | "settings"
  | "fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter";

export const selectionDependentTools: ActiveTool[] = [
  "fill",
  "font",
  "filter",
  "opacity",
  "stroke-color",
  "stroke-width",
];

export const FILL_COLOR = "#FFFFFF";
export const STROKE_COLOR = "#38BDF8";
export const STROKE_WIDTH = 2;
export const STROKE_DASH_ARRAY = [];
export const FONT_FAMILY = "Inter, sans-serif";
export const FONT_SIZE = 48;
export const FONT_WEIGHT = 700;

export const CIRCLE_OPTIONS = {
  radius: 180,
  left: 200,
  top: 200,
  fill: "rgba(255,255,255,0.1)",
  stroke: "#38BDF8",
  strokeWidth: 2,
};

export const RECTANGLE_OPTIONS = {
  left: 200,
  top: 200,
  fill: "rgba(255,255,255,0.08)",
  stroke: "rgba(255,255,255,0.2)",
  strokeWidth: 1,
  width: 380,
  height: 240,
  angle: 0,
  rx: 16,
  ry: 16,
};

export const TEXT_OPTIONS: ITextboxOptions = {
  left: 100,
  top: 100,
  fill: "#FFFFFF",
  fontSize: FONT_SIZE,
  fontFamily: FONT_FAMILY,
  fontWeight: FONT_WEIGHT,
  width: 600,
  editable: true,
};

export interface EditorHookProps {
  defaultState?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  clearSelectionCallback?: () => void;
  saveCallback?: (values: {
    json: string;
    height: number;
    width: number;
  }) => void;
}

export type BuildEditorProps = {
  undo: () => void;
  redo: () => void;
  save: (skip?: boolean) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  autoZoom: () => void;
  copy: () => void;
  paste: () => void;
  canvas: fabric.Canvas;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  selectedObjects: fabric.Object[];
  strokeDashArray: number[];
  fontFamily: string;
  setStrokeDashArray: (value: number[]) => void;
  setFillColor: (value: string) => void;
  setStrokeColor: (value: string) => void;
  setStrokeWidth: (value: number) => void;
  setFontFamily: (value: string) => void;
  copyPosition: CopyPosition;
  setCopyPositionState: (pos: CopyPosition) => void;
};

export interface Editor {
  savePng: () => void;
  saveJpg: () => void;
  saveSvg: () => void;
  saveJson: () => void;
  loadJson: (json: string) => void;
  exportDataUrl: (format?: "png" | "jpeg") => string;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  autoZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  getWorkspace: () => fabric.Rect | undefined;
  changeBackground: (value: string) => void;
  changeSize: (value: { width: number; height: number }) => void;
  enableDrawingMode: () => void;
  disableDrawingMode: () => void;
  onCopy: () => void;
  onPaste: () => void;
  changeImageFilter: (value: string) => void;
  addImage: (value: string) => Promise<fabric.Image>;
  setBackgroundImage: (value: string) => Promise<void>;
  delete: () => void;
  duplicate: () => void;
  changeFontSize: (value: number) => void;
  getActiveFontSize: () => number;
  changeTextAlign: (value: string) => void;
  getActiveTextAlign: () => string;
  changeFontUnderline: (value: boolean) => void;
  getActiveFontUnderline: () => boolean;
  changeFontLinethrough: (value: boolean) => void;
  getActiveFontLinethrough: () => boolean;
  changeFontStyle: (value: string) => void;
  getActiveFontStyle: () => string;
  changeFontWeight: (value: number) => void;
  getActiveFontWeight: () => number;
  getActiveFontFamily: () => string;
  changeFontFamily: (value: string) => void;
  addText: (value: string, options?: ITextboxOptions) => void;
  addHeading: (value?: string) => void;
  addSubheading: (value?: string) => void;
  addBodyText: (value?: string) => void;
  addBadge: (tagText?: string) => void;
  getActiveOpacity: () => number;
  changeOpacity: (value: number) => void;
  bringForward: () => void;
  sendBackwards: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  changeStrokeWidth: (value: number) => void;
  changeFillColor: (value: string) => void;
  changeStrokeColor: (value: string) => void;
  changeStrokeDashArray: (value: number[]) => void;
  addCircle: () => void;
  addSoftRectangle: () => void;
  addRectangle: () => void;
  addTriangle: () => void;
  addInverseTriangle: () => void;
  loadExactSlideLayout: (data: ExactSlideLayoutProps) => Promise<void>;
  setCopyPosition: (position: CopyPosition) => void;
  getActiveCopyPosition: () => CopyPosition;
  canvas: fabric.Canvas;
  getActiveFillColor: () => string;
  getActiveStrokeColor: () => string;
  getActiveStrokeWidth: () => number;
  getActiveStrokeDashArray: () => number[];
  selectedObjects: fabric.Object[];
}

export interface ExactSlideLayoutProps {
  headline: string;
  bodyText?: string;
  tag?: string;
  imageUrl?: string;
  variant?: any;
  contrastMode?: "auto" | "light" | "dark";
  copyPosition?: CopyPosition;
}
