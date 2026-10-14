"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const LUXURY_PALETTE = [
  { name: "Branco Puro", hex: "#FFFFFF" },
  { name: "Preto Carbono", hex: "#09090B" },
  { name: "Cinza Platina", hex: "#E4E4E7" },
  { name: "Cinza Zinco", hex: "#71717A" },
  { name: "Amber Gold", hex: "#F59E0B" },
  { name: "Cyber Sky", hex: "#38BDF8" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Purple Neon", hex: "#A855F7" },
  { name: "Crimson", hex: "#EF4444" },
  { name: "Midnight Blue", hex: "#1E3A8A" },
  { name: "Champagne", hex: "#FDE68A" },
  { name: "Ice Blue", hex: "#E0F2FE" },
];

const EXTENDED_SWATCHES = [
  "#000000", "#18181B", "#27272A", "#3F3F46", "#52525B", "#71717A", "#A1A1AA", "#D4D4D8", "#F4F4F5", "#FFFFFF",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#10B981", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899", "#F43F5E",
];

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [hexInput, setHexInput] = useState(value || "#FFFFFF");

  useEffect(() => {
    setHexInput(value || "#FFFFFF");
  }, [value]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (val.startsWith("#") && (val.length === 4 || val.length === 7)) {
      onChange(val);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Seletor Livre & Input Hexadecimal */}
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center gap-3">
          <label
            className="relative h-10 w-10 rounded-xl border border-white/20 shrink-0 cursor-pointer overflow-hidden shadow-inner flex items-center justify-center transition-transform hover:scale-105"
            style={{ backgroundColor: value }}
            title="Escolher cor no espectro livre"
          >
            <input
              type="color"
              value={value.startsWith("#") && value.length === 7 ? value : "#FFFFFF"}
              onChange={(e) => {
                setHexInput(e.target.value);
                onChange(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">
              Hexadecimal / Custom
            </span>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#FFFFFF"
              className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase text-white focus:border-sky-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Paleta Oficial BlackLink Luxury & Tech */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
          Cores Principais
        </span>
        <div className="grid grid-cols-4 gap-2">
          {LUXURY_PALETTE.map((swatch) => {
            const isSelected = value.toUpperCase() === swatch.hex.toUpperCase();
            return (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => {
                  setHexInput(swatch.hex);
                  onChange(swatch.hex);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? "border-sky-400 bg-sky-500/10 shadow-md ring-1 ring-sky-400/40"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
                }`}
                title={`${swatch.name} (${swatch.hex})`}
              >
                <div
                  className="h-6 w-6 rounded-full border border-white/20 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: swatch.hex }}
                >
                  {isSelected && (
                    <Check
                      className={`h-3 w-3 stroke-[3] ${
                        swatch.hex === "#FFFFFF" || swatch.hex === "#E4E4E7" || swatch.hex === "#FDE68A" || swatch.hex === "#E0F2FE"
                          ? "text-black"
                          : "text-white"
                      }`}
                    />
                  )}
                </div>
                <span className="text-[9px] font-mono text-zinc-400 group-hover:text-white mt-1.5 truncate max-w-full">
                  {swatch.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amostras Estendidas (Estilo Canva Grid) */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
          Todas as Cores
        </span>
        <div className="grid grid-cols-5 gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/10">
          {EXTENDED_SWATCHES.map((swatch) => {
            const isSelected = value.toUpperCase() === swatch.toUpperCase();
            return (
              <button
                key={swatch}
                type="button"
                onClick={() => {
                  setHexInput(swatch);
                  onChange(swatch);
                }}
                className={`h-7 w-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-black scale-110 border-white shadow-lg"
                    : "border-white/10 hover:scale-110"
                }`}
                style={{ backgroundColor: swatch }}
                title={swatch}
              >
                {isSelected && (
                  <Check
                    className={`h-3 w-3 stroke-[3] ${
                      swatch === "#FFFFFF" || swatch === "#F4F4F5" || swatch === "#D4D4D8"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
