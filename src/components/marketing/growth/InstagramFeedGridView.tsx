"use client";

import { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Grid,
  Heart,
  Image as ImageIcon,
  Layers,
  List,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Smartphone,
  Sparkles,
  Wand2,
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMarketingStore,
  type ScheduledPost,
  type CreativeSlide,
} from "@/store/useMarketingStore";
import { ManualAssetUploadModal } from "@/components/marketing/ManualAssetUploadModal";
import { PostSlideDisplay } from "./PostSlideDisplay";
import { type BlackLinkStyleVariant } from "@/components/estudio/layouts/layoutTypes";
import * as htmlToImage from "html-to-image";

const VARIANT_OPTIONS: Array<{
  id: BlackLinkStyleVariant;
  label: string;
  badge: string;
  desc: string;
}> = [
  {
    id: "swiss-box",
    label: "Swiss Gradient",
    badge: "📐 Swiss Box",
    desc: "Gradiente atmosférico com Bounding Box",
  },
  {
    id: "3d-keycap",
    label: "3D Keycap",
    badge: "⌨️ 3D Keycap",
    desc: "Tecla ESC de vidro óptico cáustico",
  },
  {
    id: "3d-crystal",
    label: "Chrome Pins",
    badge: "⛓️ Chrome Pins",
    desc: "Alfinetes de cromo e correntes no fundo claro",
  },
  {
    id: "pure-monumental",
    label: "Editorial Model",
    badge: "👤 Editorial",
    desc: "Retrato editorial masculino alta moda",
  },
  {
    id: "3d-cursor",
    label: "Chrome Cursor",
    badge: "🖱️ 3D Cursor",
    desc: "Seta cromada sobre estúdio de porcelana",
  },
  {
    id: "3d-liquid",
    label: "Fluted Glass",
    badge: "🕶️ Fluted Glass",
    desc: "Modelo através de vidro canelado texturizado",
  },
  {
    id: "3d-sculpture",
    label: "Macro Glass",
    badge: "🌊 Macro Glass",
    desc: "Fita fluida de vidro e mercúrio óptico",
  },
  {
    id: "clean-ice",
    label: "Obsidian Geode",
    badge: "💎 Obsidian",
    desc: "Geodo negro com correntes e alfinetes de cromo",
  },
  {
    id: "clean-ice-box",
    label: "Ice Box",
    badge: "❄️ Ice Box",
    desc: "Bounding box técnica no fundo gelo",
  },
];

export function InstagramFeedGridView() {
  const {
    scheduledPosts,
    companyProfile,
    feedViewMode,
    setFeedViewMode,
    selectedFeedPost,
    setSelectedFeedPost,
    updateScheduledPost,
    resetToOfficialFoundationPosts,
    setActiveGrowthTab,
    selectPlanForCreation,
    editorialPlan,
  } = useMarketingStore();

  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  // Estados de edição completa no Modal
  const [modalTab, setModalTab] = useState<"creative" | "caption">("creative");
  const [editingCaption, setEditingCaption] = useState<string>("");
  const [editingHeadline, setEditingHeadline] = useState<string>("");
  const [editingBodyText, setEditingBodyText] = useState<string>("");
  const [editingTag, setEditingTag] = useState<string>("");
  const [editingVariant, setEditingVariant] = useState<BlackLinkStyleVariant>("3d-sculpture");
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Estados do Feed Vertical & Visor
  const [expandedFeedCaptions, setExpandedFeedCaptions] = useState<Record<string, boolean>>({});
  const [feedSlideIndexes, setFeedSlideIndexes] = useState<Record<string, number>>({});
  const visorActivePost = selectedFeedPost || scheduledPosts[0] || null;
  const [visorSlideIdx, setVisorSlideIdx] = useState<number>(0);
  const [visorLiked, setVisorLiked] = useState<boolean>(false);
  const [visorSaved, setVisorSaved] = useState<boolean>(false);
  const [isVisorCaptionExpanded, setIsVisorCaptionExpanded] = useState<boolean>(false);

  const getInitials = (name?: string, handle?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (handle && handle.trim()) {
      const clean = handle.replace(/[@._]/g, "");
      return clean.slice(0, 2).toUpperCase();
    }
    return "BL";
  };

  const handleOpenPostModal = (post: ScheduledPost) => {
    setSelectedFeedPost(post);
    setActiveSlideIdx(0);
    setEditingCaption(post.postCaption || post.bodyCopy || "");

    const firstSlide = post.slides[0];
    setEditingHeadline(firstSlide?.headline || post.theme || "");
    setEditingBodyText(firstSlide?.bodyText || post.hookHeadline || "");
    setEditingTag(firstSlide?.tag || "01 // ESTRATÉGIA");
    setEditingVariant(firstSlide?.blackLinkVariant || "3d-sculpture");
    setModalTab("creative");
  };

  const handleCopyCaption = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFeedback("Legenda copiada para a área de transferência!");
      setTimeout(() => setCopiedFeedback(null), 3000);
    } catch {
      // Fallback
    }
  };

  const handleSavePostEdits = () => {
    if (!selectedFeedPost) return;

    const currentSlides = [...selectedFeedPost.slides];
    const targetSlide = currentSlides[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };

    currentSlides[activeSlideIdx] = {
      ...targetSlide,
      headline: editingHeadline,
      bodyText: editingBodyText,
      tag: editingTag,
      blackLinkVariant: editingVariant,
    };

    updateScheduledPost(selectedFeedPost.id, {
      postCaption: editingCaption,
      bodyCopy: editingCaption,
      hookHeadline: editingHeadline,
      theme: activeSlideIdx === 0 ? editingHeadline : selectedFeedPost.theme,
      slides: currentSlides,
    });

    setCopiedFeedback("Alterações salvas com sucesso!");
    setTimeout(() => setCopiedFeedback(null), 3000);
  };

  const handleCopilotRewrite = async (action: "agressivo" | "encurtar" | "executivo") => {
    setIsCopilotLoading(true);
    try {
      const res = await fetch("/api/marketing/copilot/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          headline: editingHeadline,
          bodyText: editingBodyText,
          tag: editingTag,
        }),
      });
      const data = await res.json();
      if (data.headline) setEditingHeadline(data.headline);
      if (data.bodyText) setEditingBodyText(data.bodyText);
      setCopiedFeedback(`Texto aprimorado: modo ${action.toUpperCase()}!`);
      setTimeout(() => setCopiedFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleDownloadHd = async (post: ScheduledPost) => {
    setIsDownloading(true);
    try {
      const offscreenNode = document.getElementById(`export-canvas-${post.id}`);
      if (offscreenNode) {
        const dataUrl = await htmlToImage.toPng(offscreenNode, {
          pixelRatio: 1.0,
          width: 1080,
          height: 1080,
          cacheBust: true,
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `blacklink_${post.id}.png`;
        link.click();
        setCopiedFeedback("Arte 1080p baixada em alta resolução!");
      } else {
        const slide = post.slides[activeSlideIdx] || post.slides[0];
        if (slide?.imageUrl) {
          const link = document.createElement("a");
          link.href = slide.imageUrl;
          link.download = `blacklink_${post.id}.png`;
          link.target = "_blank";
          link.click();
          setCopiedFeedback("Arte baixada com sucesso!");
        }
      }
    } catch (err) {
      console.error(err);
      setCopiedFeedback("Erro ao renderizar imagem.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setCopiedFeedback(null), 3000);
    }
  };

  const toggleFeedCaption = (postId: string) => {
    setExpandedFeedCaptions((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const setFeedSlide = (postId: string, newIdx: number) => {
    setFeedSlideIndexes((prev) => ({
      ...prev,
      [postId]: newIdx,
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER DO PERFIL ESTILO INSTAGRAM */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-7 lg:p-9 shadow-2xl space-y-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/[0.08] pb-6">
          {/* Avatar com Anel Gradiente de Stories */}
          <div className="relative shrink-0">
            <div className="p-1 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-xl">
              <div className="p-0.5 rounded-full bg-black">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-black text-white font-heading font-bold text-xl sm:text-2xl border border-white/20 shadow-inner">
                  {getInitials(companyProfile.name, companyProfile.instagram)}
                </div>
              </div>
            </div>
            <span className="absolute bottom-0 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          {/* Dados do Perfil */}
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                {companyProfile.instagram?.replace(/^@/, "") || "blacklink.tech"}
              </h2>
              <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-sky-300">
                Verificado Oficial
              </span>

              <div className="flex items-center gap-2 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    resetToOfficialFoundationPosts();
                    setCopiedFeedback("Grade Oficial de 9 Posts restaurada com sucesso!");
                    setTimeout(() => setCopiedFeedback(null), 3000);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] px-3.5 py-2 text-xs font-semibold text-white transition-all cursor-pointer shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>✦ 9 Posts Oficiais</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo Post</span>
                </button>
              </div>
            </div>

            {/* Métricas do Perfil */}
            <div className="flex items-center justify-center sm:justify-start gap-6 text-xs text-zinc-300 font-sans">
              <div>
                <strong className="text-white font-semibold font-mono">{scheduledPosts.length}</strong> publicações
              </div>
              <div>
                <strong className="text-white font-semibold font-mono">14.8k</strong> seguidores
              </div>
              <div>
                <strong className="text-white font-semibold font-mono">180</strong> seguindo
              </div>
            </div>

            {/* Bio Executiva B2B */}
            <div className="text-xs text-zinc-300 font-sans leading-relaxed max-w-xl">
              <div className="font-semibold text-white">{companyProfile.name}</div>
              <div className="text-zinc-400 font-medium">{companyProfile.niche}</div>
              {companyProfile.bio ? (
                <div className="text-zinc-300 whitespace-pre-line mt-1.5 leading-relaxed font-sans">
                  {companyProfile.bio}
                </div>
              ) : (
                <div className="text-zinc-400 mt-0.5">
                  {companyProfile.products?.slice(0, 90)}...
                </div>
              )}
              {companyProfile.website && (
                <a
                  href={
                    companyProfile.website.startsWith("http")
                      ? companyProfile.website
                      : `https://${companyProfile.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:underline font-mono text-[11px] mt-1.5"
                >
                  <span>{companyProfile.website.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {copiedFeedback && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-mono text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{copiedFeedback}</span>
          </div>
        )}

        {/* Stories Highlights (Destaques Circulares) */}
        <div className="flex items-center gap-6 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {[
            { label: "Black Link OS", icon: "⚡" },
            { label: "Grade 3x3", icon: "📐" },
            { label: "Cases B2B", icon: "📈" },
            { label: "Diretrizes", icon: "💎" },
            { label: "Telemetria", icon: "🔬" },
          ].map((hl) => (
            <div key={hl.label} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
              <div className="p-0.5 rounded-full border border-white/20 group-hover:border-white/50 transition-colors">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] text-lg">
                  {hl.icon}
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 group-hover:text-white font-sans transition-colors">
                {hl.label}
              </span>
            </div>
          ))}
        </div>

        {/* Seletor de Modo de Exibição */}
        <div className="flex items-center justify-center border-t border-white/[0.08] pt-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-black/50 p-1.5 border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => setFeedViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                feedViewMode === "grid"
                  ? "bg-white/[0.15] text-white font-semibold shadow-sm border border-white/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grade de Perfil (3x3 Macro)</span>
            </button>

            <button
              type="button"
              onClick={() => setFeedViewMode("visor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                feedViewMode === "visor"
                  ? "bg-white/[0.15] text-white font-semibold shadow-sm border border-white/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-sky-400" />
              <span>Visor Smartphone (iPhone)</span>
            </button>

            <button
              type="button"
              onClick={() => setFeedViewMode("feed")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                feedViewMode === "feed"
                  ? "bg-white/[0.15] text-white font-semibold shadow-sm border border-white/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Feed Vertical (Scroll)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODO 1: GRADE 3x3 DO PERFIL (VISUAL HARMONY MACRO) */}
      {feedViewMode === "grid" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Grade de Lançamento Black Link (Mosaico 3x3)
              </h3>
              <p className="text-xs text-zinc-400">
                Clique em qualquer post para editar a copy do criativo, a legenda ou trocar o ritmo visual.
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              9 Posts Oficiais de Fundação
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {scheduledPosts.map((post, postIdx) => {
              const firstSlide = post.slides[0];
              const totalSlides = post.slides.length || 1;
              const fallbackVariants: BlackLinkStyleVariant[] = [
                "swiss-box",
                "3d-keycap",
                "3d-crystal",
                "pure-monumental",
                "3d-cursor",
                "3d-liquid",
                "clean-ice-box",
                "3d-sculpture",
                "clean-ice",
              ];
              const variant =
                firstSlide?.blackLinkVariant ||
                fallbackVariants[postIdx % fallbackVariants.length];
              const variantInfo =
                VARIANT_OPTIONS.find((v) => v.id === variant) || VARIANT_OPTIONS[0];

              const sanitizedSlide = {
                ...firstSlide,
                headline: firstSlide?.headline || post.theme,
                bodyText: firstSlide?.bodyText || post.hookHeadline,
                tag: firstSlide?.tag || `0${postIdx + 1} // DIRETRIZ`,
                blackLinkVariant: variant,
                imageUrl:
                  firstSlide?.imageUrl && !firstSlide.imageUrl.includes("render-slide")
                    ? firstSlide.imageUrl
                    : undefined,
              };

              return (
                <div
                  key={post.id}
                  onClick={() => handleOpenPostModal(post)}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#09090b] cursor-pointer shadow-lg hover:border-white/40 transition-all duration-300"
                >
                  {/* Arte Gráfica Real da Lâmina */}
                  <PostSlideDisplay
                    slide={sanitizedSlide}
                    authorName={companyProfile.name}
                    authorHandle={companyProfile.instagram}
                    slideNumber={1}
                    totalSlides={totalSlides}
                  />

                  {/* Ícone sutil de Carrossel no Canto Superior Direito se tiver mais de 1 lâmina */}
                  {totalSlides > 1 && (
                    <div className="absolute top-3 right-3 rounded-md bg-black/60 p-1.5 backdrop-blur-md border border-white/15 text-white/80 shadow-md pointer-events-none">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Overlay Editorial no Hover (Revela Informações de Curadoria) */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white backdrop-blur-sm">
                    {/* Topo do Hover: Data e Variação */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-mono font-semibold text-zinc-300 border border-white/15 backdrop-blur-md">
                        {post.scheduledDate}
                      </span>
                      <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[9px] font-mono font-bold text-white border border-white/20">
                        {variantInfo.badge}
                      </span>
                    </div>

                    {/* Centro do Hover: Métricas */}
                    <div className="flex items-center justify-center gap-5 text-sm font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4 fill-white" />
                        <span>428</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4 fill-white" />
                        <span>39</span>
                      </div>
                    </div>

                    {/* Base do Hover: Botão de Edição */}
                    <div className="flex justify-center">
                      <span className="text-[10px] font-mono text-zinc-200 uppercase tracking-widest bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full border border-white/20 transition-colors">
                        Editar Arte &amp; Copy ➔
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODO 0: VISOR DE SMARTPHONE (IPHONE REAL INTERATIVO) */}
      {feedViewMode === "visor" && visorActivePost && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          {/* Coluna Esquerda/Centro: O iPhone 16 Pro Mockup */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-sm mb-4 flex items-center justify-between px-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                📱 Visor Interativo • Instagram Feed
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                ✓ Arte Aprovada
              </span>
            </div>

            {/* Carcaça do iPhone Titanium com Dynamic Island */}
            <div className="relative w-full max-w-[370px] rounded-[52px] border-[5px] border-[#2A2B30] bg-[#000000] p-3 shadow-2xl ring-1 ring-white/10 shadow-black/80 overflow-hidden">
              <div className="rounded-[42px] bg-black overflow-hidden flex flex-col justify-between border border-white/5 min-h-[680px]">
                {/* 1. iOS Status Bar & Dynamic Island */}
                <div className="pt-3 px-6 pb-2 flex items-center justify-between text-white text-[11px] font-semibold select-none">
                  <span>9:41</span>
                  <div className="w-24 h-5 bg-black rounded-full border border-white/10 flex items-center justify-between px-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-zinc-400">BlackLink</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <span className="w-4 h-2 rounded-sm border border-white/70 flex items-center p-0.5">
                      <span className="w-full h-full bg-white rounded-2xs" />
                    </span>
                  </div>
                </div>

                {/* 2. Instagram Top App Bar */}
                <div className="px-4 py-2 flex items-center justify-between text-white border-b border-white/[0.06]">
                  <div className="flex items-center gap-1">
                    <span className="font-serif italic font-bold text-base tracking-tight">Instagram</span>
                    <span className="text-[9px] text-zinc-400">▼</span>
                  </div>
                  <div className="flex items-center gap-4 text-base">
                    <button type="button" className="text-zinc-300 hover:text-white cursor-pointer">♡</button>
                    <div className="relative cursor-pointer">
                      <span>✉</span>
                      <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        2
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Post Header */}
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                      <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                        {getInitials(companyProfile.name, companyProfile.instagram)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white tracking-tight">
                          {companyProfile.instagram?.replace(/^@/, "") || "blacklink.tech"}
                        </span>
                        <span className="text-[9px] text-sky-400 font-bold">✓</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block -mt-0.5">Áudio Original • Retenção B2B</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenPostModal(visorActivePost)}
                    className="text-zinc-400 hover:text-white p-1 text-xs font-mono"
                  >
                    •••
                  </button>
                </div>

                {/* 4. Canvas da Lâmina no Visor */}
                <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden flex items-center justify-center select-none">
                  {(() => {
                    const rawVisorSlide =
                      visorActivePost.slides[visorSlideIdx] || visorActivePost.slides[0];
                    const visorSlide = {
                      ...rawVisorSlide,
                      headline: rawVisorSlide?.headline || visorActivePost.theme,
                      bodyText: rawVisorSlide?.bodyText || visorActivePost.hookHeadline,
                      tag: rawVisorSlide?.tag || "01 // DIRETRIZ",
                      blackLinkVariant:
                        rawVisorSlide?.blackLinkVariant ||
                        visorActivePost.slides[0]?.blackLinkVariant ||
                        "3d-sculpture",
                      imageUrl:
                        rawVisorSlide?.imageUrl && !rawVisorSlide.imageUrl.includes("render-slide")
                          ? rawVisorSlide.imageUrl
                          : undefined,
                    };
                    return (
                      <PostSlideDisplay
                        slide={visorSlide}
                        authorName={companyProfile.name}
                        authorHandle={companyProfile.instagram}
                        slideNumber={visorSlideIdx + 1}
                        totalSlides={visorActivePost.slides.length}
                      />
                    );
                  })()}

                  {/* Setas de Troca de Lâmina se houver mais de uma */}
                  {visorSlideIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => setVisorSlideIdx(visorSlideIdx - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center justify-center text-sm hover:bg-black/80 transition-all cursor-pointer shadow-lg"
                    >
                      ‹
                    </button>
                  )}

                  {visorSlideIdx < visorActivePost.slides.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setVisorSlideIdx(visorSlideIdx + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center justify-center text-sm hover:bg-black/80 transition-all cursor-pointer shadow-lg"
                    >
                      ›
                    </button>
                  )}

                  {/* Contador no Topo se for carrossel */}
                  {visorActivePost.slides.length > 1 && (
                    <div className="absolute top-2.5 right-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-mono font-bold text-white backdrop-blur-md border border-white/10">
                      {visorSlideIdx + 1}/{visorActivePost.slides.length}
                    </div>
                  )}
                </div>

                {/* 5. Barra de Engajamento */}
                <div className="px-3.5 pt-2.5 space-y-2">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => setVisorLiked(!visorLiked)}
                        className={`transition-transform active:scale-125 cursor-pointer ${
                          visorLiked ? "text-rose-500 fill-rose-500" : "hover:text-rose-400"
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${visorLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                      <button type="button" className="hover:text-zinc-300 cursor-pointer">
                        <MessageCircle className="h-5 w-5" />
                      </button>
                      <button type="button" className="hover:text-zinc-300 cursor-pointer">
                        <Send className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {visorActivePost.slides.length > 1 && (
                      <div className="flex items-center gap-1">
                        {visorActivePost.slides.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setVisorSlideIdx(dotIdx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              dotIdx === visorSlideIdx ? "w-3 bg-sky-400" : "w-1.5 bg-white/30"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setVisorSaved(!visorSaved)}
                      className={`cursor-pointer ${visorSaved ? "text-amber-400 fill-amber-400" : "hover:text-zinc-300"}`}
                    >
                      <Bookmark className={`h-5 w-5 ${visorSaved ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  </div>

                  {/* Curtidas */}
                  <div className="text-[11px] text-white font-semibold">
                    Curtido por <span className="font-bold">c-level.growth</span> e outras <span className="font-bold">{visorLiked ? 429 : 428} pessoas</span>
                  </div>

                  {/* Legenda com toggle */}
                  <div className="text-[11px] text-zinc-300 leading-relaxed font-sans pb-1">
                    <strong className="text-white mr-1.5">
                      {companyProfile.instagram?.replace(/^@/, "") || "blacklink.tech"}
                    </strong>
                    {isVisorCaptionExpanded ? (
                      <span className="whitespace-pre-line">{visorActivePost.postCaption || visorActivePost.bodyCopy}</span>
                    ) : (
                      <span>{(visorActivePost.postCaption || visorActivePost.bodyCopy || "").slice(0, 85)}...</span>
                    )}

                    {(visorActivePost.postCaption || visorActivePost.bodyCopy || "").length > 85 && (
                      <button
                        type="button"
                        onClick={() => setIsVisorCaptionExpanded(!isVisorCaptionExpanded)}
                        className="text-zinc-500 hover:text-zinc-300 ml-1 font-medium cursor-pointer"
                      >
                        {isVisorCaptionExpanded ? "menos" : "mais"}
                      </button>
                    )}
                  </div>
                </div>

                {/* 6. Instagram Bottom Navigation */}
                <div className="mt-auto pt-2 pb-3 px-6 border-t border-white/[0.06] flex items-center justify-between text-white text-base">
                  <span className="font-bold cursor-pointer">⌂</span>
                  <span className="cursor-pointer">🔍</span>
                  <span className="cursor-pointer">⊞</span>
                  <span className="cursor-pointer">▶</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[9px] font-bold cursor-pointer">
                    {getInitials(companyProfile.name, companyProfile.instagram)}
                  </div>
                </div>

                {/* 7. Home Indicator iOS */}
                <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mb-2" />
              </div>
            </div>
          </div>

          {/* Coluna Direita: Painel Executivo do Post */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 lg:p-7 backdrop-blur-2xl space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    ✓ Status: Aprovado para Publicação
                  </span>
                  <h3 className="text-base font-bold text-white font-heading">
                    {visorActivePost.theme}
                  </h3>
                </div>

                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[10px] font-mono font-bold text-emerald-300">
                  {visorActivePost.scheduledDate}
                </span>
              </div>

              {/* Botões Rápidos de Variação Rítmica */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Variação Rítmica do Feed
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {VARIANT_OPTIONS.map((opt) => {
                    const currentVar = visorActivePost.slides[0]?.blackLinkVariant || "3d-sculpture";
                    const isSelected = currentVar === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          const updatedSlides = [...visorActivePost.slides];
                          updatedSlides[0] = {
                            ...updatedSlides[0],
                            blackLinkVariant: opt.id,
                          };
                          updateScheduledPost(visorActivePost.id, { slides: updatedSlides });
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white/15 border-white text-white font-semibold shadow-inner"
                            : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="text-[11px] font-bold font-mono truncate">{opt.badge}</div>
                        <div className="text-[8px] text-zinc-500 line-clamp-1">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legenda do Post */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                    Copy &amp; Legenda do Post
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyCaption(visorActivePost.postCaption || visorActivePost.bodyCopy)}
                    className="text-[10px] font-mono text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copiar Legenda</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-zinc-300 leading-relaxed font-sans max-h-40 overflow-y-auto whitespace-pre-line">
                  {visorActivePost.postCaption || visorActivePost.bodyCopy}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => handleOpenPostModal(visorActivePost)}
                  className="w-full sm:flex-1 py-2.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Editar Criativo &amp; Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadHd(visorActivePost)}
                  disabled={isDownloading}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isDownloading ? "Renderizando..." : "Baixar Arte 1080p"}</span>
                </button>
              </div>
            </div>

            {/* Alternador de Posts */}
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-2xl space-y-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                Alternar Post no Visor ({scheduledPosts.length} posts prontos)
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedFeedPost(post);
                      setVisorSlideIdx(0);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      post.id === visorActivePost.id
                        ? "bg-white/10 border-sky-400 shadow-sm"
                        : "bg-white/[0.02] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate font-heading">
                        {post.theme}
                      </h5>
                      <span className="text-[10px] font-mono text-zinc-400 block truncate">
                        {post.scheduledDate} • {post.slides[0]?.blackLinkVariant || "3d-sculpture"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                      {post.id === visorActivePost.id ? "● No Visor" : "Ver ➔"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODO 2: FEED VERTICAL (SCROLL) */}
      {feedViewMode === "feed" && (
        <div className="max-w-xl mx-auto space-y-8">
          {scheduledPosts.map((post) => {
            const currentIdx = feedSlideIndexes[post.id] || 0;
            const currentSlide = post.slides[currentIdx] || post.slides[0];
            const totalSlides = post.slides.length || 1;
            const isCaptionExpanded = expandedFeedCaptions[post.id] || false;
            const caption = post.postCaption || post.bodyCopy || "";

            return (
              <div
                key={post.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#09090b] shadow-2xl space-y-4 pb-5"
              >
                {/* Header do Post */}
                <div className="flex items-center justify-between px-5 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-white font-bold text-xs">
                        {getInitials(companyProfile.name, companyProfile.instagram)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {companyProfile.instagram?.replace(/^@/, "") || "blacklink.tech"}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-400">{post.scheduledDate}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">Publicação Oficial B2B</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenPostModal(post)}
                    className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Carrossel de Imagem / Lâmina Navegável */}
                <div className="relative aspect-square w-full overflow-hidden bg-black flex items-center justify-center">
                  {(() => {
                    const sanitizedFeedSlide = {
                      ...currentSlide,
                      headline: currentSlide?.headline || post.theme,
                      bodyText: currentSlide?.bodyText || post.hookHeadline,
                      tag: currentSlide?.tag || "01 // DIRETRIZ",
                      blackLinkVariant: currentSlide?.blackLinkVariant || "3d-sculpture",
                      imageUrl:
                        currentSlide?.imageUrl && !currentSlide.imageUrl.includes("render-slide")
                          ? currentSlide.imageUrl
                          : undefined,
                    };
                    return (
                      <PostSlideDisplay
                        slide={sanitizedFeedSlide}
                        authorName={companyProfile.name}
                        authorHandle={companyProfile.instagram}
                        slideNumber={currentIdx + 1}
                        totalSlides={totalSlides}
                      />
                    );
                  })()}

                  {currentIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => setFeedSlide(post.id, currentIdx - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 hover:bg-black/90 transition-all cursor-pointer shadow-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}

                  {currentIdx < totalSlides - 1 && (
                    <button
                      type="button"
                      onClick={() => setFeedSlide(post.id, currentIdx + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 hover:bg-black/90 transition-all cursor-pointer shadow-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}

                  {totalSlides > 1 && (
                    <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-white backdrop-blur-md border border-white/10">
                      {currentIdx + 1}/{totalSlides}
                    </div>
                  )}
                </div>

                {/* Barra de Ações */}
                <div className="px-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-white">
                      <button type="button" className="hover:text-rose-500 transition-colors cursor-pointer">
                        <Heart className="h-5 w-5" />
                      </button>
                      <button type="button" className="hover:text-zinc-300 transition-colors cursor-pointer">
                        <MessageCircle className="h-5 w-5" />
                      </button>
                      <button type="button" className="hover:text-zinc-300 transition-colors cursor-pointer">
                        <Send className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCaption(caption)}
                        title="Copiar Legenda"
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button type="button" className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1">
                        <Bookmark className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-white font-semibold">
                    Curtido por <span className="font-bold">c-level.growth</span> e outras <span className="font-bold">392 pessoas</span>
                  </div>

                  <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                    <span className="font-bold text-white mr-2">
                      {companyProfile.instagram?.replace(/^@/, "") || "blacklink.tech"}
                    </span>
                    {isCaptionExpanded ? (
                      <span className="whitespace-pre-line">{caption}</span>
                    ) : (
                      <span>{caption.slice(0, 110)}...</span>
                    )}

                    {caption.length > 110 && (
                      <button
                        type="button"
                        onClick={() => toggleFeedCaption(post.id)}
                        className="text-zinc-500 hover:text-zinc-300 ml-1.5 font-medium cursor-pointer"
                      >
                        {isCaptionExpanded ? "menos" : "mais"}
                      </button>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/[0.08] text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleOpenPostModal(post)}
                      className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Editar Criativo &amp; Copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadHd(post)}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>Baixar Arte 1080p</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE EDIÇÃO COMPLETA: CRIATIVO & COPY */}
      <AnimatePresence>
        {selectedFeedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeedPost(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0C0C0E] p-6 lg:p-8 shadow-2xl space-y-6"
            >
              {/* Top Header do Modal */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                    Estúdio de Post Único • Black Link
                  </span>
                  <h3 className="text-base font-semibold text-white font-heading">
                    {selectedFeedPost.theme}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFeedPost(null)}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Grid 2 Colunas: Lâmina ao vivo à esquerda e Controles à direita */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Coluna Esquerda: Preview da Arte em Tempo Real */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                    <PostSlideDisplay
                      slide={{
                        headline: editingHeadline,
                        bodyText: editingBodyText,
                        tag: editingTag,
                        blackLinkVariant: editingVariant,
                        imageUrl:
                          selectedFeedPost.slides[activeSlideIdx]?.imageUrl &&
                          !selectedFeedPost.slides[activeSlideIdx]?.imageUrl?.includes("render-slide")
                            ? selectedFeedPost.slides[activeSlideIdx]?.imageUrl
                            : undefined,
                      }}
                      authorName={companyProfile.name}
                      authorHandle={companyProfile.instagram}
                      slideNumber={activeSlideIdx + 1}
                      totalSlides={selectedFeedPost.slides.length}
                    />
                  </div>

                  {/* Seletor de Lâminas caso seja carrossel */}
                  {selectedFeedPost.slides.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {selectedFeedPost.slides.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveSlideIdx(idx);
                            setEditingHeadline(s.headline || "");
                            setEditingBodyText(s.bodyText || "");
                            setEditingTag(s.tag || `0${idx + 1} // DIRETRIZ`);
                            setEditingVariant(s.blackLinkVariant || "3d-sculpture");
                          }}
                          className={`h-12 w-12 rounded-lg border overflow-hidden shrink-0 transition-all cursor-pointer ${
                            idx === activeSlideIdx
                              ? "border-sky-400 scale-105"
                              : "border-white/10 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-[10px] font-mono text-white">
                            #{idx + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[11px] font-mono text-zinc-500 text-center">
                    Visualização renderizada em tempo real na proporção 1:1 (1080x1080px)
                  </div>
                </div>

                {/* Coluna Direita: Editor de Copy & Variação Visual */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Seletor de Abas (Arte Gráfica vs Legenda) */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <button
                      type="button"
                      onClick={() => setModalTab("creative")}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        modalTab === "creative"
                          ? "bg-white text-black shadow-md"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Arte Gráfica (Criativo)
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalTab("caption")}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        modalTab === "caption"
                          ? "bg-white text-black shadow-md"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Legenda do Instagram
                    </button>
                  </div>

                  {/* ABA 1: ARTE GRÁFICA & TIPOGRAFIA */}
                  {modalTab === "creative" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Variação Rítmica (Grid 3x3) */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                          Variação Rítmica de Design
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {VARIANT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setEditingVariant(opt.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                editingVariant === opt.id
                                  ? "bg-white/15 border-white text-white font-semibold shadow-inner"
                                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                              }`}
                            >
                              <div className="text-xs font-bold font-mono">{opt.badge}</div>
                              <div className="text-[10px] text-zinc-400 line-clamp-1">{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Headline Monumental */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                            Headline Monumental (Clash Display)
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {editingHeadline.length} carac.
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editingHeadline}
                          onChange={(e) => setEditingHeadline(e.target.value)}
                          placeholder="Ex: ARQUITETURA DE ESCALA COMERCIAL"
                          className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-white font-bold font-heading uppercase focus:border-white/30 focus:outline-none"
                        />
                      </div>

                      {/* Tese / Linha de Apoio */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                            Tese / Linha de Apoio (Inter)
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {editingBodyText.length} carac.
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={editingBodyText}
                          onChange={(e) => setEditingBodyText(e.target.value)}
                          placeholder="Ex: Eliminamos o atrito invisível entre a abordagem e o fechamento corporativo."
                          className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-zinc-200 leading-relaxed font-sans focus:border-white/30 focus:outline-none"
                        />
                      </div>

                      {/* Tag Editorial Suíça */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                          Tag Editorial Suíça
                        </label>
                        <input
                          type="text"
                          value={editingTag}
                          onChange={(e) => setEditingTag(e.target.value)}
                          placeholder="Ex: 01 // ESTRATÉGIA"
                          className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs text-white font-mono uppercase focus:border-white/30 focus:outline-none"
                        />
                      </div>

                      {/* Micro-Copiloto IA */}
                      <div className="space-y-2 pt-1 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-sky-400" />
                            <span>Micro-Copiloto de Copy</span>
                          </span>
                          {isCopilotLoading && (
                            <span className="text-[10px] font-mono text-sky-400 animate-pulse">
                              Aprimorando...
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={isCopilotLoading}
                            onClick={() => handleCopilotRewrite("agressivo")}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                          >
                            ⚡ Mais Agressivo
                          </button>
                          <button
                            type="button"
                            disabled={isCopilotLoading}
                            onClick={() => handleCopilotRewrite("encurtar")}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                          >
                            ✂️ Encurtar
                          </button>
                          <button
                            type="button"
                            disabled={isCopilotLoading}
                            onClick={() => handleCopilotRewrite("executivo")}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                          >
                            👔 Mais Executivo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ABA 2: LEGENDA DO INSTAGRAM */}
                  {modalTab === "caption" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                            Legenda Completa do Instagram
                          </label>
                          <button
                            type="button"
                            onClick={() => handleCopyCaption(editingCaption)}
                            className="text-[10px] font-mono text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copiar Legenda</span>
                          </button>
                        </div>

                        <textarea
                          rows={11}
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          placeholder="Cole ou escreva a legenda do Instagram com hashtags e CTA..."
                          className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-xs text-white leading-relaxed font-sans focus:border-white/30 focus:outline-none"
                        />
                      </div>

                      <div className="text-[11px] font-mono text-zinc-500">
                        {editingCaption.length} caracteres • Quebras de linha executivas mantidas.
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação do Rodapé */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleSavePostEdits}
                      className="w-full sm:flex-1 py-2.5 rounded-xl bg-white px-4 text-xs font-bold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Salvar Alterações</span>
                    </button>

                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownloadHd(selectedFeedPost)}
                      className="w-full sm:flex-1 py-2.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] px-4 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{isDownloading ? "Renderizando..." : "Baixar Arte 1080p"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const matchingPlan = editorialPlan.find(
                          (p) =>
                            p.theme.toLowerCase().trim() === selectedFeedPost.theme.toLowerCase().trim() ||
                            p.id === selectedFeedPost.id
                        );
                        selectPlanForCreation(matchingPlan || null);
                        setSelectedFeedPost(null);
                        setActiveGrowthTab("estudio");
                      }}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Estúdio</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Upload Manual */}
      <ManualAssetUploadModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => {
          setCopiedFeedback("Post adicionado à grade com sucesso!");
          setTimeout(() => setCopiedFeedback(null), 3000);
        }}
      />

      {/* Contêineres offscreen ocultos para renderização em HD 1080px */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0 select-none">
        {scheduledPosts.map((p, pIdx) => {
          const s = p.slides[0];
          const sanitized = {
            ...s,
            headline: s?.headline || p.theme,
            bodyText: s?.bodyText || p.hookHeadline,
            tag: s?.tag || `0${pIdx + 1} // DIRETRIZ`,
            blackLinkVariant: s?.blackLinkVariant || "3d-sculpture",
            imageUrl:
              s?.imageUrl && !s.imageUrl.includes("render-slide")
                ? s.imageUrl
                : undefined,
          };
          return (
            <PostSlideDisplay
              key={p.id}
              id={`export-canvas-${p.id}`}
              slide={sanitized}
              authorName={companyProfile.name}
              authorHandle={companyProfile.instagram}
              slideNumber={1}
              totalSlides={p.slides.length}
              exportMode={true}
            />
          );
        })}
      </div>
    </div>
  );
}
