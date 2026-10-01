import React from "react";

export type SlideTheme = "dark-industrial" | "light-minimal" | "neon-accent";

export type SlideLayout =
  // 1-5: Tech & Código
  | "brutalista"
  | "terminal"
  | "wireframe-blueprint"
  | "system-error"
  | "glossy-y2k"
  // 6-9: Editorial & Mídia
  | "minimal"
  | "notion-doc"
  | "magazine-cover"
  | "newspaper-broadsheet"
  // 10-14: Social & Viral
  | "tweet"
  | "split"
  | "podcast-quote"
  | "testimonial-review"
  | "polaroid-retro"
  // 15-21: SaaS & Dados
  | "glass-floating"
  | "dashboard-analytics"
  | "checklist-kanban"
  | "macbook-mockup"
  | "sticky-note"
  | "aura-gradient"
  | "bento-grid";

export type SlideFont =
  // Tech / Código
  | "space-grotesk"
  | "fira-code"
  | "jetbrains-mono"
  | "ibm-plex-mono"
  | "roboto-mono"
  // SaaS / Modernas
  | "jakarta"
  | "inter"
  | "syne"
  | "dm-sans"
  | "montserrat"
  | "poppins"
  | "outfit"
  | "bebas-neue"
  | "oswald"
  | "bricolage"
  // Editorial / Luxo
  | "playfair"
  | "merriweather"
  | "lora"
  | "eb-garamond"
  | "cinzel"
  | "crimson-pro";

export type AspectRatio = "1:1" | "4:5";

export type SlidePattern = "solid-mesh" | "dots" | "grid" | "noise";

export interface SlideData {
  id?: string;
  headline: string;
  bodyText: string;
  category?: string;
  tag?: string;
}

export interface SlideDesignConfig {
  theme: SlideTheme;
  layout: SlideLayout;
  font: SlideFont;
  aspectRatio: AspectRatio;
  pattern: SlidePattern;
  fontSizeScale: number; // 0.8 a 1.5 (padrão 1.0)
  bgColor: string;
  accentColor: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  bgImage?: string;
  bgOpacity?: number;
}

export interface LayoutProps {
  slide: SlideData;
  config: SlideDesignConfig;
  scale: number;
  isLight: boolean;
  textPrimaryClass: string;
  textSecondaryClass: string;
  textMutedClass: string;
  borderClass: string;
  cardBgClass: string;
  renderHighlightedText: (text: string, accentColor: string) => React.ReactNode;
  currentSlide?: number;
}
