"use client";

import React from "react";

export interface B2BChartPoint {
  label: string;
  value: number;
}

export interface B2BChartProps {
  data?: B2BChartPoint[] | number[];
  accentColor?: string;
  isLight?: boolean;
  kpiHighlight?: string;
  className?: string;
}

/**
 * Componente de Gráficos de Dados Corporativos B2B em SVG Puro
 * Gera curvas suaves de Bézier, gradiente de área e marcadores táteis de métricas.
 */
export function B2BChart({
  data = [
    { label: "M1", value: 24 },
    { label: "M2", value: 48 },
    { label: "M3", value: 65 },
    { label: "M4", value: 92 },
    { label: "M5", value: 135 },
    { label: "M6", value: 180 },
  ],
  accentColor = "#38bdf8",
  isLight = false,
  kpiHighlight,
  className = "",
}: B2BChartProps) {
  // Normalização dos pontos
  const points: B2BChartPoint[] = (
    Array.isArray(data) && data.length > 0 ? data : [20, 50, 90, 160]
  ).map((item, idx) => {
    if (typeof item === "number") {
      return { label: `P${idx + 1}`, value: item };
    }
    return item;
  });

  const width = 400;
  const height = 150;
  const paddingX = 30;
  const paddingTop = 25;
  const paddingBottom = 30;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal === minVal ? 1 : maxVal - minVal;

  // Cálculo das coordenadas cartesianas
  const coords = points.map((p, idx) => {
    const x = paddingX + (idx / (points.length - 1 || 1)) * innerWidth;
    const normalizedY = (p.value - minVal) / range;
    const y = paddingTop + innerHeight - normalizedY * innerHeight;
    return { x, y, label: p.label, value: p.value };
  });

  // Geração do caminho suave de Bézier (Catmull-Rom / Cubic Bézier)
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const linePath = generateSmoothPath(coords);
  const areaBottomY = paddingTop + innerHeight;
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${areaBottomY} L ${coords[0].x} ${areaBottomY} Z`;

  const lastCoord = coords[coords.length - 1];
  const gradientId = `b2b-chart-grad-${Math.abs(
    accentColor.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  )}`;

  return (
    <div
      className={`w-full rounded-2xl p-4 border backdrop-blur-md relative overflow-hidden select-none ${
        isLight
          ? "bg-white/70 border-black/10 text-zinc-950"
          : "bg-black/40 border-white/10 text-white"
      } ${className}`}
    >
      {/* Top Header / KPI Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="text-[10px] font-mono uppercase tracking-widest font-bold"
            style={{ color: accentColor }}
          >
            MÉTRICAS DE TRAÇÃO // TELEMETRIA
          </span>
        </div>

        {kpiHighlight && (
          <span
            className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full border shadow-sm"
            style={{
              backgroundColor: `${accentColor}20`,
              borderColor: `${accentColor}40`,
              color: accentColor,
            }}
          >
            {kpiHighlight}
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="w-full relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
              <stop offset="80%" stopColor={accentColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade Horizontais */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + innerHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + innerHeight / 2}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={areaBottomY}
            x2={width - paddingX}
            y2={areaBottomY}
            stroke="currentColor"
            strokeOpacity="0.15"
          />

          {/* Preenchimento de Área com Gradiente */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Linha Vetorial de Tendência */}
          <path
            d={linePath}
            fill="none"
            stroke={accentColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pontos de Dados */}
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={i === coords.length - 1 ? 5 : 3.5}
              fill={isLight ? "#ffffff" : "#09090b"}
              stroke={accentColor}
              strokeWidth={i === coords.length - 1 ? "3" : "2"}
            />
          ))}

          {/* Glow no Último Ponto */}
          {lastCoord && (
            <circle
              cx={lastCoord.x}
              cy={lastCoord.y}
              r="8"
              fill={accentColor}
              opacity="0.3"
              className="animate-pulse"
            />
          )}

          {/* Rótulos no Eixo X */}
          {coords.map((c, i) => (
            <text
              key={i}
              x={c.x}
              y={areaBottomY + 16}
              textAnchor="middle"
              className="text-[9px] font-mono fill-current opacity-60 font-semibold"
            >
              {c.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
