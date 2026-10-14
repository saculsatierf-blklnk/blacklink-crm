"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Copy,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Edit3,
  Globe,
  Layers,
  ArrowRight,
} from "lucide-react";
import { LinkedinIcon } from "./BrandIcons";
import {
  useMarketingStore,
  type ScheduledPost,
} from "@/store/useMarketingStore";
import { PostSlideDisplay } from "./PostSlideDisplay";
import { getPostVariant } from "./InstagramFeedGridView";
import {
  BLACKLINK_CAMPAIGN_PRESETS,
  type BlackLinkCampaignPreset,
} from "@/lib/marketing/blacklinkBrandBrain";
import {
  exportCarouselToPdf,
  exportSlideToPng,
  exportSlidesToZip,
} from "@/lib/marketing/blacklinkRenderEngine";

interface LinkedInFeedWorkspaceProps {
  onLoadPreset: (preset: BlackLinkCampaignPreset) => void;
  onSyncPresence: () => Promise<void>;
  isSyncingPresence: boolean;
}

export function LinkedInFeedWorkspace({
  onLoadPreset,
  onSyncPresence,
  isSyncingPresence,
}: LinkedInFeedWorkspaceProps) {
  const {
    scheduledPosts,
    companyProfile,
    updateScheduledPost,
  } = useMarketingStore();

  const [selectedPostId, setSelectedPostId] = useState<string>(
    scheduledPosts[0]?.id || "post-bl-01"
  );
  const [slideIdx, setSlideIdx] = useState<number>(0);
  const [isEditingArticle, setIsEditingArticle] = useState<boolean>(false);
  const [articleDraft, setArticleDraft] = useState<string>("");
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [showFullPostText, setShowFullPostText] = useState<boolean>(false);

  const selectedPost =
    scheduledPosts.find((p) => p.id === selectedPostId) || scheduledPosts[0];

  const totalSlides = selectedPost?.slides?.length || 1;
  const currentSlide = selectedPost?.slides?.[slideIdx] || selectedPost?.slides?.[0];
  const postIdx = scheduledPosts.findIndex((p) => p.id === selectedPost?.id);
  const currentVariant =
    currentSlide?.blackLinkVariant || getPostVariant(selectedPost, postIdx, slideIdx);

  const sanitizedSlide = {
    ...currentSlide,
    headline: currentSlide?.headline || selectedPost?.theme || "ENGENHARIA DA AUSÊNCIA",
    bodyText: currentSlide?.bodyText || selectedPost?.hookHeadline || "Sistemas B2B que eliminam atrito e elevam a margem.",
    tag: currentSlide?.tag || `0${slideIdx + 1} // DIRETRIZ B2B`,
    blackLinkVariant: currentVariant,
    imageUrl:
      (currentSlide?.imageUrl && !currentSlide.imageUrl.includes("render-slide"))
        ? currentSlide.imageUrl
        : (selectedPost?.imageUrls?.[0] && !selectedPost.imageUrls[0].includes("render-slide"))
        ? selectedPost.imageUrls[0]
        : undefined,
  };

  // Carrega rascunho de artigo executivo
  useEffect(() => {
    if (selectedPost) {
      const defaultText =
        selectedPost.linkedinPostText ||
        `${(selectedPost.theme || "ENGENHARIA DA AUSÊNCIA").toUpperCase()} // DIRETRIZ EXECUTIVA B2B\n\n${selectedPost.bodyCopy || selectedPost.postCaption || ""}\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: eliminamos ruído operacional e simplificamos a infraestrutura para que sua liderança foque estritamente em fechamento e expansão de margem.\n\n• Solução: ${selectedPost.theme || "Software Sob Medida"}\n• Diretriz: 0${(postIdx >= 0 ? postIdx : 0) + 1} // SISTEMA PROPRIETÁRIO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket`;
      setArticleDraft(defaultText);
      setSlideIdx(0);
      setIsEditingArticle(false);
    }
  }, [selectedPostId, selectedPost, postIdx]);

  const handleCopyArticle = () => {
    navigator.clipboard.writeText(articleDraft);
    setCopiedFeedback("📋 Artigo executivo copiado para a área de transferência!");
    setTimeout(() => setCopiedFeedback(null), 3500);
  };

  const handleSaveArticle = () => {
    if (!selectedPost) return;
    updateScheduledPost(selectedPost.id, {
      linkedinPostText: articleDraft,
    });
    setIsEditingArticle(false);
    setCopiedFeedback("💾 Artigo executivo salvo com sucesso!");
    setTimeout(() => setCopiedFeedback(null), 3000);
  };

  const handleDownloadPdf = async () => {
    if (!selectedPost) return;
    setIsDownloading(true);
    setCopiedFeedback("Gerando documento PDF de alta fidelidade para LinkedIn...");
    try {
      const slidesToExport = selectedPost.slides.map((s, idx) => {
        const v = s.blackLinkVariant || getPostVariant(selectedPost, postIdx, idx);
        return {
          payload: {
            headline: s.headline || selectedPost.theme,
            bodyText: s.bodyText || selectedPost.hookHeadline,
            tag: s.tag || `0${idx + 1} // DIRETRIZ`,
            blackLinkVariant: v,
            imageUrl:
              (s.imageUrl && !s.imageUrl.includes("render-slide"))
                ? s.imageUrl
                : (selectedPost.imageUrls?.[0] && !selectedPost.imageUrls[0].includes("render-slide"))
                ? selectedPost.imageUrls[0]
                : undefined,
            aspectRatio: "1:1" as const,
          },
          slideNumber: idx + 1,
          totalSlides: selectedPost.slides.length,
        };
      });

      await exportCarouselToPdf(
        slidesToExport,
        { name: companyProfile.name, handle: companyProfile.instagram },
        `blacklink_${selectedPost.id}_carrossel_linkedin.pdf`,
        (current, total, label) => {
          setCopiedFeedback(`[${current}/${total}] ${label}`);
        }
      );

      setCopiedFeedback("📄 Documento PDF corporativo pronto para publicação no LinkedIn!");
    } catch (err) {
      console.error("[LinkedInWorkspace] Erro ao exportar PDF:", err);
      setCopiedFeedback("Erro ao exportar PDF do carrossel.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setCopiedFeedback(null), 4000);
    }
  };

  const handleDownloadPngCurrentSlide = async () => {
    if (!selectedPost) return;
    setIsDownloading(true);
    setCopiedFeedback("Exportando lâmina atual em HD 1080p...");
    try {
      await exportSlideToPng(
        sanitizedSlide,
        { name: companyProfile.name, handle: companyProfile.instagram },
        slideIdx + 1,
        totalSlides,
        `blacklink_${selectedPost.id}_pagina_${slideIdx + 1}.png`
      );
      setCopiedFeedback("✨ Lâmina HD 1080p baixada!");
    } catch (err) {
      console.error("[LinkedInWorkspace] Erro ao exportar PNG:", err);
      setCopiedFeedback("Erro ao exportar imagem.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setCopiedFeedback(null), 3000);
    }
  };

  const handleDownloadAllZip = async () => {
    if (!selectedPost) return;
    setIsDownloading(true);
    setCopiedFeedback("Gerando ZIP com todas as lâminas HD...");
    try {
      const slidesToExport = selectedPost.slides.map((s, idx) => {
        const v = s.blackLinkVariant || getPostVariant(selectedPost, postIdx, idx);
        return {
          payload: {
            headline: s.headline || selectedPost.theme,
            bodyText: s.bodyText || selectedPost.hookHeadline,
            tag: s.tag || `0${idx + 1} // DIRETRIZ`,
            blackLinkVariant: v,
            imageUrl:
              (s.imageUrl && !s.imageUrl.includes("render-slide"))
                ? s.imageUrl
                : (selectedPost.imageUrls?.[0] && !selectedPost.imageUrls[0].includes("render-slide"))
                ? selectedPost.imageUrls[0]
                : undefined,
            aspectRatio: "1:1" as const,
          },
          fileName: `blacklink_${selectedPost.id}_pagina_${idx + 1}.png`,
          slideNumber: idx + 1,
          totalSlides: selectedPost.slides.length,
        };
      });

      await exportSlidesToZip(
        slidesToExport,
        { name: companyProfile.name, handle: companyProfile.instagram },
        `blacklink_${selectedPost.id}_laminas_hd.zip`,
        (current, total, label) => {
          setCopiedFeedback(`[${current}/${total}] ${label}`);
        }
      );
      setCopiedFeedback("📦 Todas as lâminas baixadas em ZIP!");
    } catch (err) {
      console.error("[LinkedInWorkspace] Erro ao exportar ZIP:", err);
      setCopiedFeedback("Erro ao exportar ZIP.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setCopiedFeedback(null), 3000);
    }
  };

  const handleRegenerateArticleWithGemini = async () => {
    if (!selectedPost) return;
    setIsRegenerating(true);
    setCopiedFeedback("Estrategista de IA criando artigo executivo sincronizado...");
    try {
      const res = await fetch("/api/marketing/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: `Crie um artigo thought-leadership executivo e de alto padrão para o LinkedIn para o post sobre "${selectedPost.theme}". Dores: eliminar ineficiências e planilhas, adotar a Engenharia da Ausência. CTA: demonstrar em blklnk.com. Formate sem jargões de afiliado, tom sóbrio de liderança C-Level.`,
          posts: scheduledPosts,
          focusedPostId: selectedPost.id,
          companyProfile,
          activeChannel: "linkedin",
          action: "chat",
        }),
      });

      const data = await res.json();
      if (data.success) {
        const update = data.suggestedUpdates?.[0];
        const newText =
          update?.linkedinPostText ||
          update?.caption ||
          data.reply;

        if (newText) {
          setArticleDraft(newText);
          updateScheduledPost(selectedPost.id, {
            linkedinPostText: newText,
          });
          setCopiedFeedback("✨ Artigo executivo sincronizado com o ecossistema Black Link!");
        }
      } else {
        setCopiedFeedback("Não foi possível gerar artigo com IA no momento.");
      }
    } catch (e) {
      console.error(e);
      setCopiedFeedback("Erro ao conectar com agente de IA.");
    } finally {
      setIsRegenerating(false);
      setTimeout(() => setCopiedFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Barra de Presença Digital Observável & Ações de Canal */}
      <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-r from-sky-950/40 via-zinc-950/80 to-black p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0077B5]/20 border border-[#0077B5]/40 text-[#0077B5] shadow-lg">
              <LinkedinIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  LinkedIn B2B Thought Leadership &amp; Carrosséis PDF
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Presença Observável Ativa
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Formato oficial de carrossel de PDF corporativo e teses executivas para decisores C-Level (CEOs, Diretores e Fundadores).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              type="button"
              disabled={isSyncingPresence}
              onClick={onSyncPresence}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-sky-300 transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="Sincronizar dados e posicionamento com blklnk.com e perfis digitais"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-sky-400 ${
                  isSyncingPresence ? "animate-spin" : ""
                }`}
              />
              <span>{isSyncingPresence ? "Sincronizando..." : "Sincronizar Atuação Digital"}</span>
            </button>

            {companyProfile.linkedinUrl && (
              <a
                href={companyProfile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
              >
                <span>Ver Perfil LinkedIn</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </a>
            )}
          </div>
        </div>

        {/* Linha de canais monitorados */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-zinc-500">Monitorando:</span>
            <span className="text-sky-300 flex items-center gap-1">
              <Globe className="h-3 w-3 text-sky-400" />
              {companyProfile.website || "blklnk.com"}
            </span>
            <span className="text-purple-300 flex items-center gap-1">
              <LinkedinIcon className="h-3 w-3 text-[#0077B5]" />
              {companyProfile.linkedinUrl?.replace(/https?:\/\/(www\.)?linkedin\.com\//, "") || "company/blacklink-holding"}
            </span>
          </div>

          <div className="text-zinc-500">
            Última Sincronização:{" "}
            <span className="text-zinc-300">
              {companyProfile.lastPresenceSync
                ? new Date(companyProfile.lastPresenceSync).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Agora"}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {copiedFeedback && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-mono text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-200 shadow-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{copiedFeedback}</span>
        </div>
      )}

      {/* 2. Seletor de Campanhas & Posts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
            Campanhas de Produto Black Link:
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            Clique para carregar artes &amp; artigos executivos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {BLACKLINK_CAMPAIGN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onLoadPreset(preset)}
              className="p-3 rounded-2xl border border-white/10 bg-black/60 hover:border-sky-500/40 hover:bg-sky-950/20 text-left transition-all cursor-pointer group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-sky-300 font-heading">
                  {preset.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">9 lâminas</span>
              </div>
              <p className="text-[10px] text-zinc-400 line-clamp-1 mt-1 group-hover:text-zinc-300 font-sans">
                {preset.headlineSummary}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de Post da Campanha (9 lâminas) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {scheduledPosts.map((post, idx) => {
          const isSelected = post.id === selectedPostId;
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => {
                setSelectedPostId(post.id);
                setSlideIdx(0);
              }}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-white text-black shadow-lg"
                  : "bg-black/50 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-[#0077B5]" : "bg-zinc-600"}`} />
              <span>0{idx + 1} • {post.theme || `Post ${idx + 1}`}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Área Principal: Visualizador do Post de LinkedIn + Editor Thought Leadership */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Mockup do LinkedIn Document Post */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden">
            {/* Header Corporativo do LinkedIn */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                  BL
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                      {companyProfile.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">• 1º</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans line-clamp-1">
                    Holding de Tecnologia B2B • Engenharia da Ausência • 14.850 seguidores
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Publicado recentemente • 🌐
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.06] border border-white/10 px-2.5 py-1 rounded-full">
                  Documento PDF
                </span>
              </div>
            </div>

            {/* Texto introdutório do Post (Snippet) */}
            <div className="px-5 pt-3 pb-2 text-xs text-zinc-300 font-sans leading-relaxed">
              <p className={showFullPostText ? "whitespace-pre-line" : "line-clamp-2 whitespace-pre-line"}>
                {articleDraft}
              </p>
              <button
                type="button"
                onClick={() => setShowFullPostText(!showFullPostText)}
                className="text-zinc-400 hover:text-white text-[11px] font-semibold mt-1 cursor-pointer"
              >
                {showFullPostText ? "ver menos" : "...ver mais"}
              </button>
            </div>

            {/* O Container do Documento PDF com Controles de Página */}
            <div className="relative bg-black border-y border-white/[0.08]">
              {/* Barra superior de informações do PDF */}
              <div className="px-4 py-2 bg-zinc-950/90 border-b border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2 text-zinc-300 truncate">
                  <FileText className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">
                    blacklink_{selectedPost?.id || "doc"}_executive_briefing.pdf
                  </span>
                </div>
                <div className="text-zinc-400 shrink-0 font-bold bg-white/[0.08] px-2 py-0.5 rounded">
                  {slideIdx + 1} / {totalSlides}
                </div>
              </div>

              {/* Lâmina Gráfica Real Renderizada em Alta Fidelidade */}
              <div className="relative aspect-square w-full max-w-[560px] mx-auto overflow-hidden bg-black shadow-inner">
                <PostSlideDisplay
                  slide={sanitizedSlide}
                  authorName={companyProfile.name}
                  authorHandle={companyProfile.instagram}
                  slideNumber={slideIdx + 1}
                  totalSlides={totalSlides}
                />

                {/* Setas de navegação direta sobre a arte */}
                {totalSlides > 1 && (
                  <>
                    {slideIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => setSlideIdx((prev) => Math.max(0, prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-xl backdrop-blur-md"
                        title="Lâmina anterior"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}

                    {slideIdx < totalSlides - 1 && (
                      <button
                        type="button"
                        onClick={() => setSlideIdx((prev) => Math.min(totalSlides - 1, prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-xl backdrop-blur-md"
                        title="Próxima lâmina"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Indicador de barra de progresso do PDF */}
              <div className="w-full h-1 bg-zinc-800">
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${((slideIdx + 1) / totalSlides) * 100}%` }}
                />
              </div>
            </div>

            {/* Barra de Engajamento Social do LinkedIn */}
            <div className="p-3 border-t border-white/[0.08] flex items-center justify-around text-xs text-zinc-400 font-sans">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Gostei</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Comentar</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Compartilhar</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Enviar</span>
              </button>
            </div>
          </div>

          {/* Botões de Ação para o Documento PDF & Artes */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              title="Baixar carrossel completo em PDF pronto para upload de Documento no LinkedIn"
            >
              <FileText className="h-4 w-4 text-[#0077B5]" />
              <span>{isDownloading ? "Processando..." : "Baixar Carrossel em PDF (LinkedIn Document)"}</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPngCurrentSlide}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              title="Baixar a imagem HD da página atual"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Página Atual HD</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadAllZip}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              title="Baixar todas as lâminas em arquivo ZIP"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Todas (ZIP)</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita: Editor de Artigo Thought Leadership & Telemetria C-Level */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#09090b] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Artigo Executivo Thought Leadership
                </h4>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  Texto denso e analítico para publicação no LinkedIn
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingArticle(!isEditingArticle)}
                  className="p-2 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Editar texto do artigo"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyArticle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-md"
                  title="Copiar artigo executivo"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            {/* Caixa de Texto do Artigo */}
            {isEditingArticle ? (
              <div className="space-y-2">
                <textarea
                  value={articleDraft}
                  onChange={(e) => setArticleDraft(e.target.value)}
                  rows={13}
                  className="w-full rounded-2xl border border-white/20 bg-black/70 p-3 text-xs text-white font-sans leading-relaxed focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                  placeholder="Escreva a tese executiva para decisores B2B..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingArticle(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveArticle}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Salvar Artigo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] max-h-[360px] overflow-y-auto scrollbar-thin">
                <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
                  {articleDraft}
                </p>
              </div>
            )}

            {/* Ação de IA: Regenerar com Gemini IA */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isRegenerating}
                onClick={handleRegenerateArticleWithGemini}
                className="w-full py-2.5 px-4 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-sky-300 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                {isRegenerating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                )}
                <span>{isRegenerating ? "Regenerando..." : "✨ Regenerar Artigo com Gemini IA (Sincronizado)"}</span>
              </button>
            </div>
          </div>

          {/* Cartão de Telemetria & Diretrizes Estratégicas B2B */}
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-5 space-y-3">
            <h5 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Diretriz Comercial Observável</span>
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            </h5>

            <div className="space-y-2 text-xs font-sans text-zinc-300">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Pilar Ativo:</strong> {selectedPost?.theme || "CRM OS & Inteligência de Vendas"}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Público Decisor:</strong> CEOs, Diretores Comerciais, Heads de Vendas e Fundadores B2B.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>CTA Executivo:</strong> Solicitar demonstração técnica em{" "}
                  <code className="text-sky-300 font-mono">blklnk.com</code>.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400 font-sans leading-relaxed">
              💡 <strong>Regra de Ouro do LinkedIn B2B:</strong> O LinkedIn recompensa carrosséis em formato PDF ("Document Post") com até 3.5x mais alcance orgânico entre tomadores de decisão corporativos do que links externos ou imagens estáticas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
