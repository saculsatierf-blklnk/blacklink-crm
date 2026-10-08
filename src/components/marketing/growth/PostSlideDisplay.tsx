"use client";

import React, { useRef, useState, useEffect } from "react";
import { BlackLinkGlassLayout } from "@/components/estudio/layouts/BlackLinkGlassLayout";
import {
  type SlideData,
  type SlideDesignConfig,
  type BlackLinkStyleVariant,
  type AspectRatio,
} from "@/components/estudio/layouts/layoutTypes";

interface PostSlideDisplayProps {
  slide?: {
    headline?: string;
    bodyText?: string;
    tag?: string;
    imageUrl?: string;
    blackLinkVariant?: BlackLinkStyleVariant;
  };
  aspectRatio?: AspectRatio;
  authorName?: string;
  authorHandle?: string;
  slideNumber?: number;
  totalSlides?: number;
  className?: string;
  id?: string;
  exportMode?: boolean;
}

export function PostSlideDisplay({
  slide,
  aspectRatio = "1:1",
  authorName = "Black Link",
  authorHandle = "@blacklink.com.br",
  slideNumber = 1,
  totalSlides = 1,
  className = "",
  id,
  exportMode = false,
}: PostSlideDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.32);

  const canvasWidth = 1080;
  const canvasHeight = aspectRatio === "9:16" ? 1920 : aspectRatio === "4:5" ? 1350 : 1080;

  useEffect(() => {
    if (exportMode) return;
    if (!containerRef.current) return;

    const updateScale = () => {
      if (containerRef.current) {
        const measuredWidth = containerRef.current.clientWidth;
        if (measuredWidth > 0) {
          setScale(measuredWidth / canvasWidth);
        }
      }
    };

    updateScale();
    const observer = new ResizeObserver(() => updateScale());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [canvasWidth, exportMode]);

  // Se tiver imagem pré-renderizada ou enviada pelo usuário
  if (slide?.imageUrl) {
    return (
      <div className={`relative w-full h-full overflow-hidden select-none bg-black ${className}`}>
        <img
          src={slide.imageUrl}
          alt={slide.headline || "Black Link Creative"}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>
    );
  }

  const variant: BlackLinkStyleVariant = slide?.blackLinkVariant || "3d-sculpture";

  const slideConfig: SlideDesignConfig = {
    theme: "dark-industrial",
    font: "clash-display",
    layout: "black-link",
    aspectRatio,
    pattern: "solid-mesh",
    fontSizeScale: 1.0,
    bgColor: variant === "clean-ice" ? "#ececec" : "#030305",
    accentColor: "#ffffff",
    authorName,
    authorHandle,
    authorAvatar: "",
    blackLinkVariant: variant,
  };

  const slideData: SlideData = {
    id: `slide-${slideNumber}`,
    headline: slide?.headline || "ARQUITETURA DE ESCALA COMERCIAL",
    bodyText: slide?.bodyText || "Eliminamos o atrito invisível no pipeline comercial.",
    tag: slide?.tag || "ESTRATÉGIA",
    blackLinkVariant: variant,
  };

  const dummyLayoutProps = {
    slide: slideData,
    config: slideConfig,
    scale: 1,
    isLight: variant === "clean-ice",
    textPrimaryClass: variant === "clean-ice" ? "text-black" : "text-white",
    textSecondaryClass: "text-zinc-400",
    textMutedClass: "text-zinc-500",
    borderClass: "border-white/10",
    cardBgClass: "bg-black",
    renderHighlightedText: (txt: string) => txt,
    currentSlide: slideNumber,
    totalSlides,
  };

  if (exportMode) {
    return (
      <div
        id={id}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          minWidth: `${canvasWidth}px`,
          minHeight: `${canvasHeight}px`,
        }}
        className={`relative overflow-hidden select-none ${className}`}
      >
        <BlackLinkGlassLayout {...dummyLayoutProps} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      <div
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <BlackLinkGlassLayout {...dummyLayoutProps} />
      </div>
    </div>
  );
}
