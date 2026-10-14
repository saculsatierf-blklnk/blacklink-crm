"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface FontSizeInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const FontSizeInput = ({ value, onChange }: FontSizeInputProps) => {
  const increment = () => onChange(Math.min(240, value + 2));
  const decrement = () => onChange(Math.max(8, value - 2));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed);
    }
  };

  return (
    <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-lg overflow-hidden h-7">
      <button
        type="button"
        onClick={decrement}
        className="px-2 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Diminuir tamanho da fonte"
      >
        <Minus className="h-3 w-3" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        className="w-10 h-full bg-transparent text-center font-mono text-xs text-white focus:outline-none border-x border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        title="Tamanho da fonte em px"
      />
      <button
        type="button"
        onClick={increment}
        className="px-2 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Aumentar tamanho da fonte"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
};
