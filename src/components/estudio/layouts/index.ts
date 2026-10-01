import React from "react";
import { SlideLayout, LayoutProps } from "./layoutTypes";
import {
  BrutalistaLayout,
  TerminalLayout,
  WireframeBlueprintLayout,
  SystemErrorLayout,
  GlossyY2KLayout,
} from "./TechLayouts";
import {
  MinimalLayout,
  NotionDocLayout,
  MagazineCoverLayout,
  NewspaperBroadsheetLayout,
} from "./EditorialLayouts";
import {
  TweetLayout,
  SplitLayout,
  PodcastQuoteLayout,
  TestimonialReviewLayout,
  PolaroidRetroLayout,
} from "./SocialLayouts";
import {
  GlassFloatingLayout,
  DashboardAnalyticsLayout,
  ChecklistKanbanLayout,
  MacbookMockupLayout,
  StickyNoteLayout,
  AuraGradientLayout,
  BentoGridLayout,
} from "./DashboardLayouts";

export * from "./layoutTypes";
export * from "./CtaLayout";

export const LAYOUT_REGISTRY: Record<SlideLayout, React.FC<LayoutProps>> = {
  // 1-5: Tech & Dev
  brutalista: BrutalistaLayout,
  terminal: TerminalLayout,
  "wireframe-blueprint": WireframeBlueprintLayout,
  "system-error": SystemErrorLayout,
  "glossy-y2k": GlossyY2KLayout,

  // 6-9: Editorial & Mídia
  minimal: MinimalLayout,
  "notion-doc": NotionDocLayout,
  "magazine-cover": MagazineCoverLayout,
  "newspaper-broadsheet": NewspaperBroadsheetLayout,

  // 10-14: Social & Viral
  tweet: TweetLayout,
  split: SplitLayout,
  "podcast-quote": PodcastQuoteLayout,
  "testimonial-review": TestimonialReviewLayout,
  "polaroid-retro": PolaroidRetroLayout,

  // 15-21: SaaS & Dados
  "glass-floating": GlassFloatingLayout,
  "dashboard-analytics": DashboardAnalyticsLayout,
  "checklist-kanban": ChecklistKanbanLayout,
  "macbook-mockup": MacbookMockupLayout,
  "sticky-note": StickyNoteLayout,
  "aura-gradient": AuraGradientLayout,
  "bento-grid": BentoGridLayout,
};
