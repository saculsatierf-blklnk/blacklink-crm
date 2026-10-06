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
  Share2,
  Smartphone,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMarketingStore,
  type ScheduledPost,
  type CreativeSlide,
} from "@/store/useMarketingStore";
import { ManualAssetUploadModal } from "@/components/marketing/ManualAssetUploadModal";

export function InstagramFeedGridView() {
  const {
    scheduledPosts,
    companyProfile,
    feedViewMode,
    setFeedViewMode,
    selectedFeedPost,
    setSelectedFeedPost,
    updateScheduledPost,
    setActiveGrowthTab,
    selectPlanForCreation,
    editorialPlan,
  } = useMarketingStore();

  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string>("");
  const [isEditingCaptionMode, setIsEditingCaptionMode] = useState<boolean>(false);
  const [expandedFeedCaptions, setExpandedFeedCaptions] = useState<Record<string, boolean>>({});

  // Slide index por post no modo feed vertical
  const [feedSlideIndexes, setFeedSlideIndexes] = useState<Record<string, number>>({});

  // Estados específicos do Visor de Smartphone (iPhone)
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
    setIsEditingCaptionMode(false);
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

  const handleSaveCaptionEdit = () => {
    if (!selectedFeedPost) return;
    updateScheduledPost(selectedFeedPost.id, {
      postCaption: editingCaption,
      bodyCopy: editingCaption,
    });
    setIsEditingCaptionMode(false);
    setCopiedFeedback("Legenda do post atualizada!");
    setTimeout(() => setCopiedFeedback(null), 3000);
  };

  const handleDownloadAllSlides = (post: ScheduledPost) => {
    // Baixa a lâmina atual diretamente
    const slide = post.slides[activeSlideIdx] || post.slides[0];
    if (slide?.imageUrl) {
      const link = document.createElement("a");
      link.href = slide.imageUrl;
      link.download = `blacklink_${post.id}_slide_${(slide.slideNumber || 1)}.png`;
      link.target = "_blank";
      link.click();
    }
    setCopiedFeedback(`Lâmina #${activeSlideIdx + 1} baixada com sucesso!`);
    setTimeout(() => setCopiedFeedback(null), 3000);
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
                {companyProfile.instagram?.replace(/^@/, "") || "blacklink.b2b"}
              </h2>
              <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-sky-300">
                Verificado Oficial
              </span>

              <div className="flex items-center gap-2 sm:ml-auto">
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
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-mono text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{copiedFeedback}</span>
          </div>
        )}

        {/* Stories Highlights (Destaques Circulares) */}
        <div className="flex items-center gap-6 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {[
            { label: "Estúdio IA", icon: "✨" },
            { label: "Pipeline", icon: "⚡" },
            { label: "Carrosséis", icon: "💎" },
            { label: "Cases B2B", icon: "📈" },
            { label: "Depoimentos", icon: "⭐" },
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

        {/* Seletor de Modo de Exibição (Visor Smartphone vs Grade vs Feed Scroll) */}
        <div className="flex items-center justify-center border-t border-white/[0.08] pt-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-black/50 p-1.5 border border-white/10 shadow-lg">
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
              onClick={() => setFeedViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                feedViewMode === "grid"
                  ? "bg-white/[0.15] text-white font-semibold shadow-sm border border-white/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grade de Perfil (3x3)</span>
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

      {/* MODO 0: VISOR DE SMARTPHONE (IPHONE REAL INTERATIVO) */}
      {feedViewMode === "visor" && visorActivePost && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          {/* Coluna Esquerda/Centro: O iPhone 16 Pro Mockup (Visor Interativo) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Seletor Rápido de Pauta no Topo do Visor */}
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
              {/* Moldura Interna de Vidro / Tela */}
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

                {/* 3. Post Header (Perfil, Nome, Selo, Três Pontos) */}
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
                          {companyProfile.instagram?.replace(/^@/, "") || "blacklink.b2b"}
                        </span>
                        <span className="text-[9px] text-sky-400 font-bold">✓</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block -mt-0.5">Áudio Original • Retenção B2B</span>
                    </div>
                  </div>
                  <button type="button" className="text-zinc-400 hover:text-white p-1">
                    •••
                  </button>
                </div>

                {/* 4. Canvas da Lâmina / Carrossel com Navegação Interativa */}
                <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden flex items-center justify-center select-none">
                  {visorActivePost.slides[visorSlideIdx]?.imageUrl ? (
                    <img
                      src={visorActivePost.slides[visorSlideIdx].imageUrl}
                      alt="Slide"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col justify-between p-6 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-left">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                        <span>Lâmina {visorSlideIdx + 1} de {visorActivePost.slides.length}</span>
                        <span>{companyProfile.name}</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-white font-heading leading-tight">
                          {visorActivePost.slides[visorSlideIdx]?.headline || visorActivePost.theme}
                        </h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {visorActivePost.slides[visorSlideIdx]?.bodyText || visorActivePost.hookHeadline}
                        </p>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500">
                        {companyProfile.instagram || "@blacklink.b2b"}
                      </div>
                    </div>
                  )}

                  {/* Setas de Troca de Lâmina no Visor */}
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

                  {/* Contador de Slides no Canto Superior */}
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-mono font-bold text-white backdrop-blur-md border border-white/10">
                    {visorSlideIdx + 1}/{visorActivePost.slides.length}
                  </div>
                </div>

                {/* 5. Barra de Engajamento do Instagram */}
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

                    {/* Bolinhas de Paginação do Carrossel */}
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
                      {companyProfile.instagram?.replace(/^@/, "") || "blacklink.b2b"}
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

          {/* Coluna Direita: Dossiê Executivo, Controle de Pautas & Ações */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card com Metadados da Arte Aprovada */}
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 lg:p-7 backdrop-blur-2xl space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    ✓ Status: Aprovado &amp; Pronto para Publicação
                  </span>
                  <h3 className="text-base font-bold text-white font-heading">
                    {visorActivePost.theme}
                  </h3>
                </div>

                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[10px] font-mono font-bold text-emerald-300">
                  {visorActivePost.scheduledDate}
                </span>
              </div>

              {/* Lâminas em Miniatura para Seleção Direta */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Lâminas do Carrossel ({visorActivePost.slides.length} Lâminas)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {visorActivePost.slides.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVisorSlideIdx(idx)}
                      className={`h-14 w-14 rounded-xl border overflow-hidden shrink-0 transition-all cursor-pointer ${
                        idx === visorSlideIdx
                          ? "border-sky-400 ring-2 ring-sky-400/30 scale-105"
                          : "border-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900 p-1 text-[9px] font-mono text-white text-center">
                        <span className="font-bold">#{idx + 1}</span>
                        <span className="text-[7px] text-zinc-400 line-clamp-1">{s.tag || `Slide ${idx + 1}`}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor / Visualizador da Legenda */}
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

              {/* Botões de Ação da Coluna Direita */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    const matchingPlan = editorialPlan.find(
                      (p) =>
                        p.theme.toLowerCase().trim() === visorActivePost.theme.toLowerCase().trim() ||
                        p.id === visorActivePost.id
                    );
                    selectPlanForCreation(matchingPlan || null);
                    setActiveGrowthTab("estudio");
                  }}
                  className="w-full sm:flex-1 py-2.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Reeditar no Estúdio</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadAllSlides(visorActivePost)}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar Lâmina HD</span>
                </button>
              </div>
            </div>

            {/* Carrossel de Outros Posts na Mesa de Aprovação */}
            {scheduledPosts.length > 1 && (
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
                          {post.scheduledDate} • {post.slides.length} lâminas
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                        {post.id === visorActivePost.id ? "● No Visor" : "Ver ➔"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODO 1: GRADE 3x3 DO PERFIL (VISUAL HARMONY) */}
      {feedViewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {scheduledPosts.map((post) => {
            const firstSlide = post.slides[0];
            const totalSlides = post.slides.length || 1;

            return (
              <div
                key={post.id}
                onClick={() => handleOpenPostModal(post)}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#09090b] cursor-pointer shadow-lg hover:border-white/30 transition-all duration-300"
              >
                {/* Capa da Primeira Lâmina */}
                {firstSlide?.imageUrl ? (
                  <img
                    src={firstSlide.imageUrl}
                    alt={post.theme}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col justify-between p-6 bg-gradient-to-br from-zinc-900 to-black text-left">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">
                      Slide 01 • Capa
                    </span>
                    <h4 className="text-base font-bold text-white font-heading line-clamp-3">
                      {firstSlide?.headline || post.theme}
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {companyProfile.name}
                    </span>
                  </div>
                )}

                {/* Ícone de Carrossel no Canto Superior Direito */}
                <div className="absolute top-3 right-3 rounded-md bg-black/60 p-1.5 backdrop-blur-md border border-white/10 text-white shadow-md">
                  <Layers className="h-3.5 w-3.5" />
                </div>

                {/* Badge de Status no Canto Superior Esquerdo */}
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-mono font-semibold text-zinc-300 backdrop-blur-md border border-white/10">
                    {post.scheduledDate}
                  </span>
                </div>

                {/* Overlay com Curtidas & Comentários no Hover */}
                <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-semibold text-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 fill-white" />
                    <span>428</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 fill-white" />
                    <span>39</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODO 2: FEED VERTICAL (SCROLL REAL DO APP) */}
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
                {/* Header do Post no Feed */}
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
                          {companyProfile.instagram?.replace(/^@/, "") || "blacklink.b2b"}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-400">{post.scheduledDate}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">Publicação Patrocinada / Orgânica B2B</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenPostModal(post)}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Carrossel de Imagem / Lâmina Navegável */}
                <div className="relative aspect-square w-full overflow-hidden bg-black flex items-center justify-center">
                  {currentSlide?.imageUrl ? (
                    <img
                      src={currentSlide.imageUrl}
                      alt={currentSlide.headline}
                      className="h-full w-full object-cover select-none"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col justify-between p-8 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-left">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
                        <span>Lâmina {currentIdx + 1} de {totalSlides}</span>
                        <span>{companyProfile.name}</span>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-white font-heading">
                          {currentSlide?.headline || post.theme}
                        </h3>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          {currentSlide?.bodyText || post.hookHeadline}
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Arraste para o lado ➔
                      </div>
                    </div>
                  )}

                  {/* Botões de Navegação Anterior / Próximo do Carrossel */}
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

                  {/* Contador de Lâminas Flutuante */}
                  <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-white backdrop-blur-md border border-white/10">
                    {currentIdx + 1}/{totalSlides}
                  </div>
                </div>

                {/* Barra de Ações do Instagram */}
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

                    {/* Indicador de Bolinhas do Carrossel */}
                    <div className="flex items-center gap-1">
                      {post.slides.map((_, dotIdx) => (
                        <span
                          key={dotIdx}
                          className={`h-1.5 rounded-full transition-all ${
                            dotIdx === currentIdx
                              ? "w-3 bg-sky-400"
                              : "w-1.5 bg-white/30"
                          }`}
                        />
                      ))}
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

                  {/* Legenda com Toggle de "Mais..." */}
                  <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                    <span className="font-bold text-white mr-2">
                      {companyProfile.instagram?.replace(/^@/, "") || "blacklink.b2b"}
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

                  {/* Ações Rápidas do Card */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/[0.08] text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleOpenPostModal(post)}
                      className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Ver Dossiê / Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadAllSlides(post)}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>Baixar Lâmina</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DOSSIÊ DO POST / EDIÇÃO COMPLETA */}
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
              className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0C0C0E] p-6 lg:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                    Dossiê do Carrossel • Instagram
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

              {/* Grid: Carrossel à esquerda e Editor à direita */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Visualizador do Carrossel */}
                <div className="space-y-3">
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                    {selectedFeedPost.slides[activeSlideIdx]?.imageUrl ? (
                      <img
                        src={selectedFeedPost.slides[activeSlideIdx].imageUrl}
                        alt="Slide"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <span className="text-xs font-mono text-zinc-500">
                          Lâmina #{activeSlideIdx + 1}
                        </span>
                        <h4 className="text-base font-bold text-white font-heading">
                          {selectedFeedPost.slides[activeSlideIdx]?.headline}
                        </h4>
                        <p className="text-xs text-zinc-300">
                          {selectedFeedPost.slides[activeSlideIdx]?.bodyText}
                        </p>
                      </div>
                    )}

                    {activeSlideIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveSlideIdx(activeSlideIdx - 1)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-md border border-white/10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}

                    {activeSlideIdx < selectedFeedPost.slides.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveSlideIdx(activeSlideIdx + 1)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-md border border-white/10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Miniaturas de Lâminas */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedFeedPost.slides.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlideIdx(idx)}
                        className={`h-12 w-12 rounded-lg border overflow-hidden shrink-0 transition-all ${
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
                </div>

                {/* Editor de Legenda & Ações */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                        Legenda &amp; Copy do Post
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
                      rows={9}
                      value={editingCaption}
                      onChange={(e) => setEditingCaption(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-xs text-white leading-relaxed focus:border-white/30 focus:outline-none font-sans"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveCaptionEdit}
                      className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
                    >
                      Salvar Alterações
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadAllSlides(selectedFeedPost)}
                      className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Baixar Lâmina</span>
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
    </div>
  );
}
