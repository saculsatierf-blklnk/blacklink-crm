"use client";

import { useEffect } from "react";
import { CanvaProEditor } from "./CanvaProEditor";
import type { ScheduledPost, CreativeSlide } from "@/store/useMarketingStore";

interface CanvaProModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: ScheduledPost | null;
  activeSlideIdx?: number;
  onSaveToFeed?: (renderedImageUrl: string, updatedSlide?: Partial<CreativeSlide>) => void;
}

export function CanvaProModal({
  isOpen,
  onClose,
  post,
  activeSlideIdx = 0,
  onSaveToFeed,
}: CanvaProModalProps) {
  // Fecha no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full h-[96vh] max-w-[1600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-[#09090B]">
        <CanvaProEditor
          initialPost={post}
          activeSlideIdx={activeSlideIdx}
          onSaveToFeed={onSaveToFeed}
          onClose={onClose}
          className="h-full w-full rounded-none border-0"
        />
      </div>
    </div>
  );
}
