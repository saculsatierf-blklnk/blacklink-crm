"use client";

import { Compass, Sparkles } from "lucide-react";
import { useTourStore, type TourStep } from "@/store/useTourStore";

interface StartTourButtonProps {
  steps?: TourStep[];
  variant?: "primary" | "secondary" | "subtle";
  label?: string;
}

export function StartTourButton({
  steps,
  variant = "primary",
  label = "Iniciar Tour Interativo",
}: StartTourButtonProps) {
  const startTour = useTourStore((state) => state.startTour);

  const handleClick = () => {
    startTour(steps);
  };

  if (variant === "subtle") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 text-xs font-mono text-accent hover:text-platinum transition-colors cursor-pointer"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex h-8 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-3 text-xs font-mono text-sub hover:text-platinum hover:border-accent/40 transition-all cursor-pointer shadow-sm"
      >
        <Compass className="h-3.5 w-3.5 text-accent" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-9 items-center gap-2 rounded-md bg-accent px-3.5 text-xs font-mono font-bold text-void hover:bg-accent-hover transition-all cursor-pointer shadow-lg active:scale-95"
    >
      <Compass className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
