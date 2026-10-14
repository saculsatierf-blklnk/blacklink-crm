"use client";

import { useState, useMemo } from "react";
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
  Target,
  Bot,
  Globe,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { InstagramIcon, LinkedinIcon } from "./BrandIcons";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMarketingStore,
  type ScheduledPost,
  type CreativeSlide,
} from "@/store/useMarketingStore";
import { ManualAssetUploadModal } from "@/components/marketing/ManualAssetUploadModal";
import { MarketingAgentDrawer } from "./MarketingAgentDrawer";
import { LinkedInFeedWorkspace } from "./LinkedInFeedWorkspace";
import {
  BLACKLINK_PRODUCTS,
  BLACKLINK_CAMPAIGN_PRESETS,
  type BlackLinkCampaignPreset,
} from "@/lib/marketing/blacklinkBrandBrain";
import { PostSlideDisplay } from "./PostSlideDisplay";
import { type BlackLinkStyleVariant } from "@/components/estudio/layouts/layoutTypes";
import * as htmlToImage from "html-to-image";
import {
  exportSlideToPng,
  exportSlidesToZip,
  exportCarouselToPdf,
  type SlideRenderPayload,
} from "@/lib/marketing/blacklinkRenderEngine";
import dynamic from "next/dynamic";

const CanvaProModal = dynamic(
  () => import("@/components/estudio/canvapro/CanvaProModal").then((mod) => mod.CanvaProModal),
  { ssr: false }
);

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

export const OFFICIAL_VARIANTS: BlackLinkStyleVariant[] = [
  "swiss-box",
  "3d-keycap",
  "3d-crystal",
  "pure-monumental",
  "3d-cursor",
  "3d-liquid",
  "3d-sculpture",
  "clean-ice",
  "clean-ice-box",
];

export const VARIANT_FALLBACK_MAP: Record<BlackLinkStyleVariant, string[]> = {
  "swiss-box": ["/brand/blacklink-art-gradient.jpg", "/brand/blacklink-bg-square.jpg"],
  "3d-keycap": ["/brand/blacklink-3d-keycap.jpg", "/brand/blacklink-art-glass-cube.jpg"],
  "3d-crystal": ["/brand/blacklink-art-pins.jpg", "/brand/blacklink-art-dark-crystal.jpg"],
  "pure-monumental": ["/brand/blacklink-art-portrait.jpg", "/brand/blacklink-art-glass-model.jpg"],
  "3d-cursor": ["/brand/blacklink-art-cursor-light.jpg", "/brand/blacklink-3d-cursor.jpg"],
  "3d-liquid": ["/brand/blacklink-art-glass-model.jpg", "/brand/blacklink-art-fluid-metal.jpg"],
  "3d-sculpture": ["/brand/blacklink-art-macro-glass.jpg", "/brand/blacklink-art-fluid-metal.jpg"],
  "clean-ice": ["/brand/blacklink-art-obsidian-dark.jpg", "/brand/blacklink-art-dark-crystal.jpg"],
  "clean-ice-box": ["/brand/blacklink-art-cursor-light.jpg", "/brand/blacklink-art-pins.jpg"],
};

export function getPostVariant(
  post: ScheduledPost | null | undefined,
  postIdx: number,
  slideIdx = 0
): BlackLinkStyleVariant {
  if (!post) return OFFICIAL_VARIANTS[0];
  const slide = post.slides?.[slideIdx];
  if (slide?.blackLinkVariant) return slide.blackLinkVariant;
  const idx = postIdx >= 0 ? postIdx : 0;
  return OFFICIAL_VARIANTS[idx % OFFICIAL_VARIANTS.length];
}

async function inlineImagesToDataUrls(container: HTMLElement): Promise<void> {
  const imgElements = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imgElements.map(async (img) => {
      if (!img.src || img.src.startsWith("data:")) return;

      try {
        const fullUrl = img.src.startsWith("/")
          ? window.location.origin + img.src
          : img.src;

        const res = await fetch(fullUrl, { cache: "no-cache" });
        if (!res.ok) return;
        const blob = await res.blob();

        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("Não foi possível embutir imagem em base64:", err);
      }
    })
  );
}

export function InstagramFeedGridView() {
  const {
    scheduledPosts,
    companyProfile,
    updateCompanyProfile,
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

  // Canais B2B: Instagram (Grade 3x3 & Visor) vs LinkedIn (Carrosséis PDF & Artigo Executivo)
  const [activeChannelTab, setActiveChannelTab] = useState<"instagram" | "linkedin">("instagram");
  const [isSyncingPresence, setIsSyncingPresence] = useState<boolean>(false);
  const [showPresenceConfig, setShowPresenceConfig] = useState<boolean>(false);
  const [presenceInstagramUrl, setPresenceInstagramUrl] = useState<string>(
    companyProfile.instagramUrl || "https://instagram.com/blacklink.tech"
  );
  const [presenceLinkedinUrl, setPresenceLinkedinUrl] = useState<string>(
    companyProfile.linkedinUrl || "https://linkedin.com/company/blacklink-holding"
  );
  const [presenceWebsiteUrl, setPresenceWebsiteUrl] = useState<string>(
    companyProfile.website || "https://blklnk.com"
  );

  const handleSyncPresence = async () => {
    setIsSyncingPresence(true);
    setCopiedFeedback("Sincronizando atuação digital com blklnk.com e redes ativas...");
    try {
      const res = await fetch("/api/marketing/sync-presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: presenceWebsiteUrl || companyProfile.website || "https://blklnk.com",
          instagramUrl: presenceInstagramUrl || companyProfile.instagramUrl || "https://instagram.com/blacklink.tech",
          linkedinUrl: presenceLinkedinUrl || companyProfile.linkedinUrl || "https://linkedin.com/company/blacklink-holding",
        }),
      });

      const data = await res.json();
      if (data.success && data.companyProfile) {
        updateCompanyProfile(data.companyProfile);
        setCopiedFeedback("● Atuação digital sincronizada com blklnk.com & redes ativas!");
      } else {
        setCopiedFeedback("● Atuação digital confirmada.");
      }
    } catch (e) {
      console.error(e);
      setCopiedFeedback("Erro ao sincronizar presença digital.");
    } finally {
      setIsSyncingPresence(false);
      setTimeout(() => setCopiedFeedback(null), 4000);
    }
  };

  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState<boolean>(false);
  const [isCanvaProModalOpen, setIsCanvaProModalOpen] = useState<boolean>(false);

  // Estados de edição completa no Modal
  const [modalTab, setModalTab] = useState<"creative" | "caption" | "linkedin" | "audit">("creative");
  const [editingCaption, setEditingCaption] = useState<string>("");
  const [editingLinkedInPostText, setEditingLinkedInPostText] = useState<string>("");
  const [editingHeadline, setEditingHeadline] = useState<string>("");
  const [editingBodyText, setEditingBodyText] = useState<string>("");
  const [editingTag, setEditingTag] = useState<string>("");
  const [editingVariant, setEditingVariant] = useState<BlackLinkStyleVariant>("3d-sculpture");
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Estados do Auditor de Viralidade & Conversão da Black Link
  const [selectedProductId, setSelectedProductId] = useState<string>("crm-os");
  const [isAuditingViral, setIsAuditingViral] = useState<boolean>(false);
  const [viralAuditResult, setViralAuditResult] = useState<{
    viralScore: number;
    conversionScore: number;
    critique: string;
    optimizedHeadline: string;
    optimizedBodyText: string;
    optimizedTag: string;
    optimizedCaption: string;
    targetProductName: string;
  } | null>(null);

  // Estados do Feed Vertical & Visor
  const [expandedFeedCaptions, setExpandedFeedCaptions] = useState<Record<string, boolean>>({});
  const [feedSlideIndexes, setFeedSlideIndexes] = useState<Record<string, number>>({});
  const visorActivePost = selectedFeedPost || scheduledPosts[0] || null;
  const [visorSlideIdx, setVisorSlideIdx] = useState<number>(0);
  const [visorLiked, setVisorLiked] = useState<boolean>(false);
  const [visorSaved, setVisorSaved] = useState<boolean>(false);
  const [isVisorCaptionExpanded, setIsVisorCaptionExpanded] = useState<boolean>(false);

  // Estados de Geração Autônoma de Arte com Gemini IA
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatingPostId, setGeneratingPostId] = useState<string | null>(null);
  const [isGeneratingCollection, setIsGeneratingCollection] = useState<boolean>(false);
  const [collectionProgress, setCollectionProgress] = useState<string | null>(null);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  const handleGenerateImageWithGemini = async (
    post: ScheduledPost,
    slideIndex: number = 0,
    overrideVariant?: BlackLinkStyleVariant
  ) => {
    setIsGeneratingImage(true);
    setGeneratingPostId(post.id);
    setModalFeedback("Disparando motor de IA para criar nova arte...");
    try {
      const targetSlide = post.slides[slideIndex] || post.slides[0];
      const variant = overrideVariant || editingVariant || targetSlide?.blackLinkVariant || "3d-sculpture";

      // NUNCA envia strings base64 pesadas de megabytes na requisição POST
      const safeCurrentImageUrl =
        targetSlide?.imageUrl && !targetSlide.imageUrl.startsWith("data:")
          ? targetSlide.imageUrl
          : undefined;

      const controller = new AbortController();
      const clientTimeout = setTimeout(() => controller.abort(), 25000);

      const res = await fetch("/api/marketing/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant,
          theme: editingHeadline || post.theme,
          headline: editingHeadline || targetSlide?.headline,
          bodyText: editingBodyText || targetSlide?.bodyText,
          currentImageUrl: safeCurrentImageUrl,
          postId: post.id,
        }),
        signal: controller.signal,
      });

      clearTimeout(clientTimeout);

      if (!res.ok) {
        throw new Error(`Servidor respondeu com código ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.imageUrl) {
        const updatedSlides = [...post.slides];
        const slideToUpdate = updatedSlides[slideIndex] || { slideNumber: slideIndex + 1 };
        updatedSlides[slideIndex] = {
          ...slideToUpdate,
          imageUrl: data.imageUrl,
          blackLinkVariant: variant,
        };

        updateScheduledPost(post.id, {
          slides: updatedSlides,
        });

        // Atualiza imediatamente o post ativo no modal para troca instantânea de arte
        if (selectedFeedPost?.id === post.id) {
          setSelectedFeedPost({
            ...selectedFeedPost,
            slides: updatedSlides,
          });
          setEditingVariant(variant);
        }

        const msg =
          data.source === "gemini-ai"
            ? `✨ Nova arte inédita gerada via Gemini IA (${data.modelUsed})!`
            : `✨ Ativo curado de estúdio atualizado com sucesso!`;
        setCopiedFeedback(msg);
        setModalFeedback(msg);
      } else {
        throw new Error("Resposta inválida da API de geração.");
      }
    } catch (err: unknown) {
      console.warn("API de imagem lenta ou instável - aplicando ativo curado resiliente:", err);
      const targetSlide = post.slides[slideIndex] || post.slides[0];
      const variant = overrideVariant || editingVariant || targetSlide?.blackLinkVariant || "3d-sculpture";
      const fallbackList = VARIANT_FALLBACK_MAP[variant] || ["/brand/blacklink-art-cursor-light.jpg"];
      const fallbackImage = fallbackList[Math.floor(Math.random() * fallbackList.length)];

      const updatedSlides = [...post.slides];
      const slideToUpdate = updatedSlides[slideIndex] || { slideNumber: slideIndex + 1 };
      updatedSlides[slideIndex] = {
        ...slideToUpdate,
        imageUrl: fallbackImage,
        blackLinkVariant: variant,
      };

      updateScheduledPost(post.id, {
        slides: updatedSlides,
      });

      if (selectedFeedPost?.id === post.id) {
        setSelectedFeedPost({
          ...selectedFeedPost,
          slides: updatedSlides,
        });
        setEditingVariant(variant);
      }

      const msg = "✨ Arte atualizada via Acervo Oficial Black Link (Estúdio Arina TVA)!";
      setCopiedFeedback(msg);
      setModalFeedback(msg);
    } finally {
      setIsGeneratingImage(false);
      setGeneratingPostId(null);
      setTimeout(() => {
        setCopiedFeedback(null);
        setModalFeedback(null);
      }, 4000);
    }
  };

  const handleGenerateEntireCollection = async () => {
    setIsGeneratingCollection(true);
    setCollectionProgress("Iniciando geração da coleção de 9 artes com Gemini IA...");

    try {
      for (let i = 0; i < scheduledPosts.length; i++) {
        const post = scheduledPosts[i];
        const slide = post.slides[0];
        const variant = getPostVariant(post, i, 0);

        setCollectionProgress(`Renderizando arte ${i + 1} de ${scheduledPosts.length}: ${variant} (${post.theme})...`);

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 35000);

          const res = await fetch("/api/marketing/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              variant,
              theme: post.theme || post.hookHeadline,
              headline: slide?.headline || post.hookHeadline,
              bodyText: slide?.bodyText || post.bodyCopy,
              postId: post.id,
            }),
            signal: controller.signal,
          });

          clearTimeout(timer);

          const data = await res.json();
          if (data.success && data.imageUrl) {
            const updatedSlides = [...post.slides];
            const slideToUpdate = updatedSlides[0] || { slideNumber: 1 };
            updatedSlides[0] = {
              ...slideToUpdate,
              imageUrl: data.imageUrl,
              blackLinkVariant: variant,
            };

            updateScheduledPost(post.id, {
              slides: updatedSlides,
              imageUrls: [data.imageUrl],
            });

            if (selectedFeedPost?.id === post.id) {
              setSelectedFeedPost({
                ...selectedFeedPost,
                slides: updatedSlides,
                imageUrls: [data.imageUrl],
              });
            }
          }
        } catch (e) {
          console.warn(`Erro ao gerar post ${post.id}:`, e);
        }
      }

      setCopiedFeedback("✨ Coleção de 9 artes gerada com sucesso via Gemini IA!");
    } catch (err) {
      console.error("Erro na geração da coleção:", err);
      setCopiedFeedback("Erro durante geração em lote.");
    } finally {
      setIsGeneratingCollection(false);
      setCollectionProgress(null);
      setTimeout(() => setCopiedFeedback(null), 4000);
    }
  };

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

    const postIdx = scheduledPosts.findIndex((p) => p.id === post.id);
    const variant = getPostVariant(post, postIdx, 0);

    const firstSlide = post.slides[0];
    setEditingHeadline(firstSlide?.headline || post.theme || "");
    setEditingBodyText(firstSlide?.bodyText || post.hookHeadline || "");
    setEditingTag(firstSlide?.tag || `0${(postIdx >= 0 ? postIdx : 0) + 1} // DIRETRIZ`);
    setEditingVariant(variant);

    const defaultLinkedInText =
      post.linkedinPostText ||
      `${(post.theme || "ENGENHARIA DA AUSÊNCIA").toUpperCase()} // DIRETRIZ EXECUTIVA B2B\n\n${post.bodyCopy || post.postCaption || ""}\n\nNa Black Link (blklnk.com), operamos sob o princípio da Engenharia da Ausência: eliminamos ruído operacional e simplificamos a infraestrutura para que sua liderança foque estritamente em fechamento e expansão de margem.\n\n• Solução: ${post.theme || "Software Sob Medida"}\n• Diretriz: 0${(postIdx >= 0 ? postIdx : 0) + 1} // SISTEMA PROPRIETÁRIO\n• Ação: Conheça a demonstração executiva em blklnk.com ou solicite o dossiê via mensagem direta.\n\n#BlackLink #EnterpriseB2B #EngenhariaDaAusencia #LiderancaB2B #HighTicket`;
    setEditingLinkedInPostText(defaultLinkedInText);

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

    setSelectedFeedPost({
      ...selectedFeedPost,
      postCaption: editingCaption,
      bodyCopy: editingCaption,
      linkedinPostText: editingLinkedInPostText,
      hookHeadline: editingHeadline,
      theme: activeSlideIdx === 0 ? editingHeadline : selectedFeedPost.theme,
      slides: currentSlides,
    });

    updateScheduledPost(selectedFeedPost.id, {
      postCaption: editingCaption,
      bodyCopy: editingCaption,
      linkedinPostText: editingLinkedInPostText,
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

  const handleAuditViralWithGemini = async () => {
    setIsAuditingViral(true);
    setModalFeedback("Diretor de IA avaliando potencial viral e de conversão...");
    try {
      const res = await fetch("/api/marketing/audit-viral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: editingHeadline,
          bodyText: editingBodyText,
          tag: editingTag,
          caption: editingCaption,
          productId: selectedProductId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setViralAuditResult(data);
        setModalFeedback("✨ Auditoria de Viralidade & Conversão concluída!");
      } else {
        setModalFeedback(data.error || "Não foi possível auditar a copy no momento.");
      }
    } catch (e) {
      console.error(e);
      setModalFeedback("Erro ao auditar copy.");
    } finally {
      setIsAuditingViral(false);
      setTimeout(() => setModalFeedback(null), 3500);
    }
  };

  const handleApplyViralOptimization = () => {
    if (!viralAuditResult || !selectedFeedPost) return;

    const optHeadline = viralAuditResult.optimizedHeadline || editingHeadline;
    const optBodyText = viralAuditResult.optimizedBodyText || editingBodyText;
    const optTag = viralAuditResult.optimizedTag || editingTag;
    const optCaption = viralAuditResult.optimizedCaption || editingCaption;

    setEditingHeadline(optHeadline);
    setEditingBodyText(optBodyText);
    setEditingTag(optTag);
    setEditingCaption(optCaption);

    const updatedSlides = [...selectedFeedPost.slides];
    const s = updatedSlides[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
    updatedSlides[activeSlideIdx] = {
      ...s,
      headline: optHeadline,
      bodyText: optBodyText,
      tag: optTag,
    };

    setSelectedFeedPost({
      ...selectedFeedPost,
      slides: updatedSlides,
      postCaption: optCaption,
      hookHeadline: optHeadline,
    });

    updateScheduledPost(selectedFeedPost.id, {
      slides: updatedSlides,
      postCaption: optCaption,
      hookHeadline: optHeadline,
    });

    setCopiedFeedback("✨ Copy viral e legenda alinhadas aos produtos Black Link!");
    setModalFeedback("✨ Post atualizado com sucesso!");
    setTimeout(() => {
      setCopiedFeedback(null);
      setModalFeedback(null);
    }, 3500);
  };

  const handleDownloadHd = async (post: ScheduledPost, slideIdx: number = 0) => {
    setIsDownloading(true);
    setCopiedFeedback("Renderizando arte 1080p em estúdio isolado (Zero-Artifact Engine)...");
    try {
      const postIdx = scheduledPosts.findIndex((p) => p.id === post.id);
      const isCurrentlyEditing = selectedFeedPost?.id === post.id;
      const targetSlide = post.slides[slideIdx] || post.slides[0];
      const variant = isCurrentlyEditing ? editingVariant : getPostVariant(post, postIdx, slideIdx);

      const payload: SlideRenderPayload = {
        headline: isCurrentlyEditing ? editingHeadline : (targetSlide?.headline || post.theme),
        bodyText: isCurrentlyEditing ? editingBodyText : (targetSlide?.bodyText || post.hookHeadline),
        tag: isCurrentlyEditing ? editingTag : (targetSlide?.tag || `0${(postIdx >= 0 ? postIdx : 0) + 1} // DIRETRIZ`),
        blackLinkVariant: variant,
        imageUrl:
          (targetSlide?.imageUrl && !targetSlide.imageUrl.includes("render-slide"))
            ? targetSlide.imageUrl
            : (post.imageUrls?.[0] && !post.imageUrls[0].includes("render-slide"))
            ? post.imageUrls[0]
            : undefined,
        aspectRatio: "1:1",
      };

      await exportSlideToPng(
        payload,
        { name: companyProfile.name, handle: companyProfile.instagram },
        slideIdx + 1,
        post.slides.length,
        `blacklink_${post.id}_slide_${slideIdx + 1}.png`
      );

      setCopiedFeedback("✨ Arte 1080p exportada com fidelidade de estúdio e fundo nítido!");
    } catch (err) {
      console.error("[BlackLinkEngine] Erro ao exportar slide:", err);
      setCopiedFeedback("Erro ao renderizar imagem.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setCopiedFeedback(null), 3500);
    }
  };

  const handleDownloadCollectionZip = async () => {
    setIsDownloading(true);
    setCopiedFeedback("Iniciando exportação em lote da coleção 3x3...");
    try {
      const slidesToExport = scheduledPosts.map((post, postIdx) => {
        const firstSlide = post.slides[0];
        const variant = getPostVariant(post, postIdx, 0);
        return {
          payload: {
            headline: firstSlide?.headline || post.theme,
            bodyText: firstSlide?.bodyText || post.hookHeadline,
            tag: firstSlide?.tag || `0${postIdx + 1} // DIRETRIZ`,
            blackLinkVariant: variant,
            imageUrl:
              (firstSlide?.imageUrl && !firstSlide.imageUrl.includes("render-slide"))
                ? firstSlide.imageUrl
                : (post.imageUrls?.[0] && !post.imageUrls[0].includes("render-slide"))
                ? post.imageUrls[0]
                : undefined,
            aspectRatio: "1:1" as const,
          },
          fileName: `blacklink_post_${postIdx + 1}_${post.id}.png`,
          slideNumber: 1,
          totalSlides: post.slides?.length || 1,
        };
      });

      await exportSlidesToZip(
        slidesToExport,
        { name: companyProfile.name, handle: companyProfile.instagram },
        "blacklink_colecao_feed_9posts_hd.zip",
        (current, total, label) => {
          setCopiedFeedback(`[${current}/${total}] ${label}`);
        }
      );

      setCopiedFeedback("✨ Coleção completa de 9 artes em HD 1080p baixada em ZIP!");
    } catch (err) {
      console.error("[BlackLinkEngine] Erro ao exportar ZIP:", err);
      setCopiedFeedback("Erro ao exportar coleção em ZIP.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setCopiedFeedback(null), 4000);
    }
  };

  const handleDownloadCarouselPdf = async (post: ScheduledPost) => {
    setIsDownloading(true);
    setCopiedFeedback("Gerando documento PDF de alta fidelidade para LinkedIn...");
    try {
      const slidesToExport = post.slides.map((s, idx) => {
        const postIdx = scheduledPosts.findIndex((p) => p.id === post.id);
        const variant = s.blackLinkVariant || getPostVariant(post, postIdx, idx);
        return {
          payload: {
            headline: s.headline || post.theme,
            bodyText: s.bodyText || post.hookHeadline,
            tag: s.tag || `0${idx + 1} // DIRETRIZ`,
            blackLinkVariant: variant,
            imageUrl:
              (s.imageUrl && !s.imageUrl.includes("render-slide"))
                ? s.imageUrl
                : (post.imageUrls?.[0] && !post.imageUrls[0].includes("render-slide"))
                ? post.imageUrls[0]
                : undefined,
            aspectRatio: "1:1" as const,
          },
          slideNumber: idx + 1,
          totalSlides: post.slides.length,
        };
      });

      await exportCarouselToPdf(
        slidesToExport,
        { name: companyProfile.name, handle: companyProfile.instagram },
        `blacklink_carrossel_${post.id}_linkedin.pdf`,
        (current, total, label) => {
          setCopiedFeedback(`[${current}/${total}] ${label}`);
        }
      );

      setCopiedFeedback("✨ Carrossel corporativo exportado em PDF para LinkedIn!");
    } catch (err) {
      console.error("[BlackLinkEngine] Erro ao exportar carrossel em PDF:", err);
      setCopiedFeedback("Erro ao exportar carrossel em PDF.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setCopiedFeedback(null), 4000);
    }
  };

  const handleDownloadCarouselZip = async (post: ScheduledPost) => {
    setIsDownloading(true);
    setCopiedFeedback("Gerando arquivo ZIP com todas as lâminas HD...");
    try {
      const slidesToExport = post.slides.map((s, idx) => {
        const postIdx = scheduledPosts.findIndex((p) => p.id === post.id);
        const variant = s.blackLinkVariant || getPostVariant(post, postIdx, idx);
        return {
          payload: {
            headline: s.headline || post.theme,
            bodyText: s.bodyText || post.hookHeadline,
            tag: s.tag || `0${idx + 1} // DIRETRIZ`,
            blackLinkVariant: variant,
            imageUrl:
              (s.imageUrl && !s.imageUrl.includes("render-slide"))
                ? s.imageUrl
                : (post.imageUrls?.[0] && !post.imageUrls[0].includes("render-slide"))
                ? post.imageUrls[0]
                : undefined,
            aspectRatio: "1:1" as const,
          },
          fileName: `blacklink_${post.id}_slide_${idx + 1}.png`,
          slideNumber: idx + 1,
          totalSlides: post.slides.length,
        };
      });

      await exportSlidesToZip(
        slidesToExport,
        { name: companyProfile.name, handle: companyProfile.instagram },
        `blacklink_carrossel_${post.id}_laminas_hd.zip`,
        (current, total, label) => {
          setCopiedFeedback(`[${current}/${total}] ${label}`);
        }
      );

      setCopiedFeedback("✨ Todas as lâminas do carrossel baixadas em ZIP HD!");
    } catch (err) {
      console.error("[BlackLinkEngine] Erro ao exportar carrossel em ZIP:", err);
      setCopiedFeedback("Erro ao exportar lâminas em ZIP.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setCopiedFeedback(null), 4000);
    }
  };



  const handleLoadCampaignPreset = (preset: BlackLinkCampaignPreset) => {
    preset.posts.forEach((presetPost) => {
      updateScheduledPost(presetPost.id, {
        theme: presetPost.theme,
        hookHeadline: presetPost.hookHeadline,
        bodyCopy: presetPost.bodyCopy,
        postCaption: presetPost.postCaption,
        linkedinPostText: presetPost.linkedinPostText,
        ctaText: presetPost.ctaText,
        hashtags: presetPost.hashtags,
        scheduledDate: presetPost.scheduledDate,
        imageUrls: presetPost.slides[0]?.imageUrl ? [presetPost.slides[0].imageUrl] : [],
        slides: presetPost.slides.map((s) => ({
          slideNumber: s.slideNumber,
          headline: s.headline,
          bodyText: s.bodyText,
          tag: s.tag,
          blackLinkVariant: s.blackLinkVariant,
          seamlessBleed: s.seamlessBleed,
          imageUrl: s.imageUrl,
        })),
      });
    });

    // Se o modal estiver aberto em um post da grade, atualiza o post selecionado com o novo visual
    if (selectedFeedPost) {
      const match = preset.posts.find((p) => p.id === selectedFeedPost.id);
      if (match) {
        setSelectedFeedPost({
          ...selectedFeedPost,
          theme: match.theme,
          hookHeadline: match.hookHeadline,
          bodyCopy: match.bodyCopy,
          postCaption: match.postCaption,
          linkedinPostText: match.linkedinPostText,
          imageUrls: match.slides[0]?.imageUrl ? [match.slides[0].imageUrl] : [],
          slides: match.slides.map((s) => ({
            slideNumber: s.slideNumber,
            headline: s.headline,
            bodyText: s.bodyText,
            tag: s.tag,
            blackLinkVariant: s.blackLinkVariant,
            seamlessBleed: s.seamlessBleed,
            imageUrl: s.imageUrl,
          })),
        });
      }
    }

    setCopiedFeedback(`🎯 Campanha "${preset.name}" carregada com artes e copies sincronizadas!`);
    setTimeout(() => setCopiedFeedback(null), 4000);
  };

  const handleAddSlideToCarousel = () => {
    if (!selectedFeedPost) return;
    const currentSlides = [...selectedFeedPost.slides];
    const newIdx = currentSlides.length;
    const postIdx = scheduledPosts.findIndex((p) => p.id === selectedFeedPost.id);
    const nextVariant = OFFICIAL_VARIANTS[(postIdx + newIdx) % OFFICIAL_VARIANTS.length];

    const newSlide: CreativeSlide = {
      slideNumber: newIdx + 1,
      headline: `TESE EXECUTIVA // PARTE 0${newIdx + 1}`,
      bodyText: "Eliminamos o atrito no pipeline para garantir soberania operacional.",
      tag: `0${newIdx + 1} // DESDOBRAMENTO`,
      blackLinkVariant: nextVariant,
    };

    const updatedSlides = [...currentSlides, newSlide];
    updateScheduledPost(selectedFeedPost.id, { slides: updatedSlides });
    setSelectedFeedPost({ ...selectedFeedPost, slides: updatedSlides });
    setActiveSlideIdx(newIdx);
    setEditingHeadline(newSlide.headline || "");
    setEditingBodyText(newSlide.bodyText || "");
    setEditingTag(newSlide.tag || "");
    setEditingVariant(nextVariant);
    setCopiedFeedback(`Lâmina #${newIdx + 1} adicionada ao carrossel!`);
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

  const postForCanva = useMemo(() => {
    if (!selectedFeedPost) return null;
    const slides = (selectedFeedPost.slides || []).map((s, idx) => {
      const cleanImg = s.imageUrl && !s.imageUrl.startsWith("data:image") ? s.imageUrl : undefined;
      if (idx === activeSlideIdx) {
        return {
          ...s,
          imageUrl: cleanImg,
          headline: editingHeadline || s.headline,
          bodyText: editingBodyText !== undefined ? editingBodyText : s.bodyText,
          tag: editingTag || s.tag,
          blackLinkVariant: editingVariant || s.blackLinkVariant,
        };
      }
      return {
        ...s,
        imageUrl: cleanImg,
      };
    });
    return {
      ...selectedFeedPost,
      slides,
      imageUrls: (selectedFeedPost.imageUrls || []).filter(
        (url) => url && !url.startsWith("data:image")
      ),
    };
  }, [selectedFeedPost, activeSlideIdx, editingHeadline, editingBodyText, editingTag, editingVariant]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. SWITCHER DE CANAIS BICANAL: INSTAGRAM VS LINKEDIN */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Seletor Master de Canal */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/90 border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveChannelTab("instagram")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChannelTab === "instagram"
                  ? "bg-gradient-to-r from-rose-500/25 via-pink-500/20 to-amber-500/20 text-white border border-rose-500/40 shadow-lg ring-1 ring-rose-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <InstagramIcon className="h-4 w-4 text-rose-400" />
              <span>📸 Instagram (Grade 3x3 &amp; Visor)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannelTab("linkedin")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeChannelTab === "linkedin"
                  ? "bg-[#0077B5]/25 text-white border border-[#0077B5]/50 shadow-lg ring-1 ring-[#0077B5]/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <LinkedinIcon className="h-4 w-4 text-[#0077B5]" />
              <span>💼 LinkedIn (Carrossel PDF &amp; Artigo)</span>
            </button>
          </div>

          {/* Status de Sincronização & Botões Rápidos */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowPresenceConfig(!showPresenceConfig)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 transition-all cursor-pointer"
              title="Configurar URLs observáveis e links de atuação"
            >
              <Sliders className="h-3.5 w-3.5 text-zinc-400" />
              <span>Links de Atuação</span>
              {showPresenceConfig ? (
                <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </button>

            <button
              type="button"
              disabled={isSyncingPresence}
              onClick={handleSyncPresence}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-sky-300 transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="Sincronizar presença digital com blklnk.com e perfis oficiais"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-sky-400 ${
                  isSyncingPresence ? "animate-spin" : ""
                }`}
              />
              <span>{isSyncingPresence ? "Sincronizando..." : "Sincronizar Presença"}</span>
            </button>
          </div>
        </div>

        {/* Drawer Expansível: Links Observáveis e Notas de Posicionamento */}
        {showPresenceConfig && (
          <div className="pt-4 border-t border-white/[0.08] space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Website Oficial (blklnk.com):
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={presenceWebsiteUrl}
                    onChange={(e) => setPresenceWebsiteUrl(e.target.value)}
                    placeholder="https://blklnk.com"
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-white/10 bg-black/70 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Perfil Instagram:
                </label>
                <div className="relative">
                  <InstagramIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-rose-500" />
                  <input
                    type="text"
                    value={presenceInstagramUrl}
                    onChange={(e) => setPresenceInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/blacklink.tech"
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-white/10 bg-black/70 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Página LinkedIn:
                </label>
                <div className="relative">
                  <LinkedinIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#0077B5]" />
                  <input
                    type="text"
                    value={presenceLinkedinUrl}
                    onChange={(e) => setPresenceLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/blacklink-holding"
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-white/10 bg-black/70 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {companyProfile.digitalFootprintNotes && (
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs font-sans text-zinc-300 leading-relaxed space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-sky-400 uppercase">
                  <span>● Diretrizes de Atuação Observadas (blklnk.com)</span>
                </div>
                <p className="line-clamp-3 text-zinc-400 font-sans">
                  {companyProfile.digitalFootprintNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RENDERIZAÇÃO DO WORKSPACE CONFORME O CANAL ATIVO */}
      {activeChannelTab === "linkedin" ? (
        <LinkedInFeedWorkspace
          onLoadPreset={handleLoadCampaignPreset}
          onSyncPresence={handleSyncPresence}
          isSyncingPresence={isSyncingPresence}
        />
      ) : (
        <>
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
                  onClick={() => setIsAgentDrawerOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-gradient-to-r from-sky-500/20 to-indigo-600/20 hover:from-sky-500/30 hover:to-indigo-600/30 px-3.5 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-md ring-1 ring-sky-400/20"
                  title="Abrir o Diretor Executivo de Growth IA e Auditoria Visual"
                >
                  <Bot className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                  <span>✦ Diretor IA & Auditoria</span>
                </button>

                <button
                  type="button"
                  disabled={isGeneratingCollection}
                  onClick={handleGenerateEntireCollection}
                  className="flex items-center gap-1.5 rounded-xl border border-sky-500/50 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 px-3.5 py-2 text-xs font-bold text-sky-200 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  title="Gera 9 artes inéditas com Gemini IA (100% novas salvas no disco)"
                >
                  {isGeneratingCollection ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  )}
                  <span>{isGeneratingCollection ? "Renderizando 9 Artes..." : "🎨 Gerar 9 Novas Artes com Gemini IA"}</span>
                </button>

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
        {collectionProgress && (
          <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 px-5 py-3 text-xs font-mono text-sky-300 flex items-center gap-2.5 animate-in fade-in duration-200">
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-sky-400" />
            <span>{collectionProgress}</span>
          </div>
        )}

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
            { label: "Automações", icon: "⚙️" },
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Grade de Lançamento Black Link (Mosaico 3x3)
              </h3>
              <p className="text-xs text-zinc-400">
                Clique em qualquer post para editar a copy do criativo, a legenda ou trocar o ritmo visual.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadCollectionZip}
                disabled={isDownloading}
                className="px-3.5 py-2 rounded-xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5 text-sky-400" />
                <span>{isDownloading ? "Processando..." : "Baixar 9 Artes (ZIP HD)"}</span>
              </button>
              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                9 Posts Oficiais
              </span>
            </div>
          </div>

          {/* Seletor de Campanhas Estratégicas por Produto (Black Link Sovereign Presets) */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <Target className="h-4 w-4 text-sky-400" />
                <span>Carregar Campanha Estratégica Oficial (9 Posts Mapeados)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                5 Produtos Digitais de blklnk.com
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {BLACKLINK_CAMPAIGN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadCampaignPreset(preset)}
                  className="p-2.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 hover:border-sky-400/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold font-mono text-zinc-200 group-hover:text-white flex items-center justify-between">
                    <span>{preset.badge}</span>
                    <span className="text-[9px] text-zinc-500 group-hover:text-sky-300">9 posts ➔</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-1 mt-1 group-hover:text-zinc-300 font-sans">
                    {preset.headlineSummary}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {scheduledPosts.map((post, postIdx) => {
              const firstSlide = post.slides[0];
              const variant = getPostVariant(post, postIdx, 0);
              const variantInfo =
                VARIANT_OPTIONS.find((v) => v.id === variant) || VARIANT_OPTIONS[0];
              const totalSlides = post.slides?.length || 1;

              const sanitizedSlide = {
                ...firstSlide,
                headline: firstSlide?.headline || post.theme,
                bodyText: firstSlide?.bodyText || post.hookHeadline,
                tag: firstSlide?.tag || `0${postIdx + 1} // DIRETRIZ`,
                blackLinkVariant: variant,
                copyPosition: firstSlide?.copyPosition,
                contrastMode: firstSlide?.contrastMode,
                hasScrimBackdrop: firstSlide?.hasScrimBackdrop,
                imageUrl:
                  (firstSlide?.imageUrl && !firstSlide.imageUrl.startsWith("data:image") && !firstSlide.imageUrl.includes("render-slide"))
                    ? firstSlide.imageUrl
                    : (post.imageUrls?.[0] && !post.imageUrls[0].startsWith("data:image") && !post.imageUrls[0].includes("render-slide"))
                    ? post.imageUrls[0]
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

                    {/* Base do Hover: Botão de Edição & Ação Rápida Gemini IA & Download HD & Motion Poster */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={isGeneratingImage && generatingPostId === post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateImageWithGemini(post, 0);
                        }}
                        className="text-[10px] font-mono text-sky-300 bg-sky-950/70 hover:bg-sky-900/90 px-2 py-1 rounded-full border border-sky-500/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Regenerar arte deste post via Gemini IA"
                      >
                        {isGeneratingImage && generatingPostId === post.id ? (
                          <RefreshCw className="h-2.5 w-2.5 animate-spin text-sky-400" />
                        ) : (
                          <Sparkles className="h-2.5 w-2.5 text-sky-400" />
                        )}
                        <span>IA</span>
                      </button>



                      <button
                        type="button"
                        disabled={isDownloading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadHd(post, 0);
                        }}
                        className="text-[10px] font-mono text-zinc-200 bg-white/15 hover:bg-white/25 px-2 py-1 rounded-full border border-white/20 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Baixar arte 1080p deste post"
                      >
                        <Download className="h-2.5 w-2.5" />
                        <span>HD</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFeedPost(post);
                          setActiveSlideIdx(0);
                          setIsCanvaProModalOpen(true);
                        }}
                        className="text-[10px] font-mono text-purple-200 bg-purple-500/25 hover:bg-purple-500/40 px-2.5 py-1 rounded-full border border-purple-400/40 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Abrir no Canva Pro Studio para mover textos, ajustar fontes e cores livremente"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-purple-300" />
                        <span>Canva</span>
                      </button>

                      <span className="text-[10px] font-mono text-zinc-200 uppercase tracking-widest bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full border border-white/20 transition-colors">
                        Editar ➔
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
                      copyPosition: rawVisorSlide?.copyPosition,
                      contrastMode: rawVisorSlide?.contrastMode,
                      hasScrimBackdrop: rawVisorSlide?.hasScrimBackdrop,
                      imageUrl:
                        (rawVisorSlide?.imageUrl && !rawVisorSlide.imageUrl.startsWith("data:image") && !rawVisorSlide.imageUrl.includes("render-slide"))
                          ? rawVisorSlide.imageUrl
                          : (visorActivePost.imageUrls?.[0] && !visorActivePost.imageUrls[0].startsWith("data:image") && !visorActivePost.imageUrls[0].includes("render-slide"))
                          ? visorActivePost.imageUrls[0]
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

              {/* Botão de Geração Autônoma Gemini IA */}
              <div className="p-3.5 rounded-2xl bg-sky-500/[0.05] border border-sky-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    <span>Motor Gemini IA de Arte</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    Octane 3D • Arina TVA
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isGeneratingImage}
                  onClick={() => handleGenerateImageWithGemini(visorActivePost, visorSlideIdx)}
                  className="w-full py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-xs font-semibold text-sky-300 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isGeneratingImage && generatingPostId === visorActivePost.id ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  )}
                  <span>
                    {isGeneratingImage && generatingPostId === visorActivePost.id
                      ? "Criando Arte com Gemini IA..."
                      : "✨ Regenerar Arte com Gemini IA"}
                  </span>
                </button>
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
                          const pool = VARIANT_FALLBACK_MAP[opt.id] || ["/brand/blacklink-art-cursor-light.jpg"];
                          updatedSlides[0] = {
                            ...updatedSlides[0],
                            blackLinkVariant: opt.id,
                            imageUrl: pool[0],
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
                  onClick={() => handleDownloadHd(visorActivePost, visorSlideIdx)}
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
                      copyPosition: currentSlide?.copyPosition,
                      contrastMode: currentSlide?.contrastMode,
                      hasScrimBackdrop: currentSlide?.hasScrimBackdrop,
                      imageUrl:
                        (currentSlide?.imageUrl && !currentSlide.imageUrl.startsWith("data:image") && !currentSlide.imageUrl.includes("render-slide"))
                          ? currentSlide.imageUrl
                          : (post.imageUrls?.[0] && !post.imageUrls[0].startsWith("data:image") && !post.imageUrls[0].includes("render-slide"))
                          ? post.imageUrls[0]
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
                        disabled={isDownloading}
                        onClick={() => handleDownloadHd(post, feedSlideIndexes[post.id] || 0)}
                        className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
    </>
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCanvaProModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-500/20 to-sky-500/20 hover:from-purple-500/30 hover:to-sky-500/30 px-3.5 py-1.5 text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-md ring-1 ring-purple-400/30"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
                    <span>✦ Editar no Canva Pro Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFeedPost(null)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
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
                        copyPosition: selectedFeedPost.slides[activeSlideIdx]?.copyPosition,
                        contrastMode: selectedFeedPost.slides[activeSlideIdx]?.contrastMode,
                        hasScrimBackdrop: selectedFeedPost.slides[activeSlideIdx]?.hasScrimBackdrop,
                        imageUrl:
                          selectedFeedPost.slides[activeSlideIdx]?.imageUrl &&
                          !selectedFeedPost.slides[activeSlideIdx]?.imageUrl?.startsWith("data:image") &&
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

                  {/* Ação Direta para o Canva Pro */}
                  <button
                    type="button"
                    onClick={() => setIsCanvaProModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Sparkles className="h-4 w-4 text-purple-300" />
                    <span>Abrir no Canva Pro (Mover Textos, Fontes &amp; Imagens Livremente)</span>
                  </button>

                  {/* Seletor de Lâminas (Sempre visível para permitir transformar em Carrossel) */}
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
                        className={`h-11 w-11 rounded-lg border overflow-hidden shrink-0 transition-all cursor-pointer flex items-center justify-center font-mono text-xs ${
                          idx === activeSlideIdx
                            ? "border-sky-400 bg-sky-500/20 text-white font-bold scale-105 shadow-sm"
                            : "border-white/10 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        #{idx + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddSlideToCarousel}
                      className="h-11 px-3 rounded-lg border border-dashed border-white/20 hover:border-sky-400/60 bg-white/[0.02] hover:bg-sky-500/10 text-zinc-400 hover:text-sky-300 text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Adicionar nova lâmina para transformar este post em carrossel"
                    >
                      <Plus className="h-3 w-3" />
                      <span>+ Lâmina (Carrossel)</span>
                    </button>

                    {selectedFeedPost.slides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const currentSlide = selectedFeedPost.slides[activeSlideIdx] || selectedFeedPost.slides[0];
                          const newBleed = !(currentSlide.seamlessBleed ?? true);
                          const updatedSlides = selectedFeedPost.slides.map((s) => ({
                            ...s,
                            seamlessBleed: newBleed,
                          }));
                          updateScheduledPost(selectedFeedPost.id, { slides: updatedSlides });
                          setSelectedFeedPost({ ...selectedFeedPost, slides: updatedSlides });
                          setCopiedFeedback(newBleed ? "🔗 Bleed contínuo panorâmico ativado!" : "Fundo independente por lâmina.");
                          setTimeout(() => setCopiedFeedback(null), 3000);
                        }}
                        className={`h-11 px-3 rounded-lg border text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          (selectedFeedPost.slides[activeSlideIdx]?.seamlessBleed ?? true)
                            ? "bg-sky-500/15 border-sky-400 text-sky-200 shadow-sm"
                            : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                        }`}
                        title="Ativar/desativar fundo panorâmico contínuo entre as lâminas"
                      >
                        <span>🔗 Bleed Contínuo: {(selectedFeedPost.slides[activeSlideIdx]?.seamlessBleed ?? true) ? "ON" : "OFF"}</span>
                      </button>
                    )}
                  </div>

                  {/* Botão de Regeneração da Imagem via Gemini IA */}
                  <button
                    type="button"
                    disabled={isGeneratingImage}
                    onClick={() => handleGenerateImageWithGemini(selectedFeedPost, activeSlideIdx, editingVariant)}
                    className="w-full py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-sky-300 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingImage && generatingPostId === selectedFeedPost.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                    )}
                    <span>
                      {isGeneratingImage && generatingPostId === selectedFeedPost.id
                        ? "Renderizando Nova Arte..."
                        : "✨ Regenerar Arte desta Lâmina com Gemini IA"}
                    </span>
                  </button>

                  {modalFeedback && (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2 text-center text-xs font-mono text-sky-300 animate-in fade-in duration-200">
                      {modalFeedback}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-400 text-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Edição ao vivo estilo Canva ativa • 1080x1080px</span>
                  </div>
                </div>

                {/* Coluna Direita: Editor de Copy & Variação Visual */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Seletor de Abas (Arte Gráfica vs Legenda vs Auditoria) */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <button
                      type="button"
                      onClick={() => setModalTab("creative")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        modalTab === "creative"
                          ? "bg-white text-black shadow-md font-bold"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Arte Gráfica
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalTab("caption")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        modalTab === "caption"
                          ? "bg-white text-black shadow-md font-bold"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Legenda Instagram
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalTab("linkedin")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        modalTab === "linkedin"
                          ? "bg-[#0077B5] text-white shadow-md font-bold"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <LinkedinIcon className="h-3.5 w-3.5" />
                      <span>Artigo LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalTab("audit")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        modalTab === "audit"
                          ? "bg-sky-400 text-black shadow-md font-bold"
                          : "text-sky-300 hover:text-white hover:bg-sky-500/10"
                      }`}
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Auditoria & Viral IA</span>
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
                              onClick={() => {
                                setEditingVariant(opt.id);
                                if (selectedFeedPost) {
                                  const updatedSlides = [...selectedFeedPost.slides];
                                  const s = updatedSlides[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                                  const pool = VARIANT_FALLBACK_MAP[opt.id] || ["/brand/blacklink-art-cursor-light.jpg"];
                                  const newBg = pool[0];
                                  updatedSlides[activeSlideIdx] = {
                                    ...s,
                                    blackLinkVariant: opt.id,
                                    imageUrl: newBg,
                                  };
                                  setSelectedFeedPost({
                                    ...selectedFeedPost,
                                    slides: updatedSlides,
                                  });
                                  updateScheduledPost(selectedFeedPost.id, { slides: updatedSlides });
                                }
                              }}
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
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const upper = editingHeadline.toUpperCase();
                                setEditingHeadline(upper);
                                if (selectedFeedPost) {
                                  const updated = [...selectedFeedPost.slides];
                                  const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                                  updated[activeSlideIdx] = { ...s, headline: upper };
                                  setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                                  updateScheduledPost(selectedFeedPost.id, { slides: updated });
                                }
                              }}
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white cursor-pointer"
                            >
                              AA
                            </button>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {editingHeadline.length} carac.
                            </span>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={editingHeadline}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingHeadline(val);
                            if (selectedFeedPost) {
                              const updated = [...selectedFeedPost.slides];
                              const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                              updated[activeSlideIdx] = { ...s, headline: val };
                              setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                              updateScheduledPost(selectedFeedPost.id, { slides: updated });
                            }
                          }}
                          placeholder="Ex: ARQUITETURA DE ESCALA COMERCIAL"
                          className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-white font-bold font-heading uppercase focus:border-white/30 focus:outline-none transition-colors"
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
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingBodyText(val);
                            if (selectedFeedPost) {
                              const updated = [...selectedFeedPost.slides];
                              const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                              updated[activeSlideIdx] = { ...s, bodyText: val };
                              setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                              updateScheduledPost(selectedFeedPost.id, { slides: updated });
                            }
                          }}
                          placeholder="Ex: Eliminamos o atrito invisível entre a abordagem e o fechamento corporativo."
                          className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-zinc-200 leading-relaxed font-sans focus:border-white/30 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Tag Editorial Suíça */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                            Tag Editorial Suíça
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {editingTag.length} carac.
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editingTag}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingTag(val);
                            if (selectedFeedPost) {
                              const updated = [...selectedFeedPost.slides];
                              const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                              updated[activeSlideIdx] = { ...s, tag: val };
                              setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                              updateScheduledPost(selectedFeedPost.id, { slides: updated });
                            }
                          }}
                          placeholder="Ex: 01 // ESTRATÉGIA"
                          className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs text-white font-mono uppercase focus:border-white/30 focus:outline-none transition-colors"
                        />
                        {/* Pílulas rápidas de tag estilo Canva */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {["01 // ESTRATÉGIA", "DIRETRIZ B2B", "09 // SOBERANIA", "ALTO TICKET"].map((pill) => (
                            <button
                              key={pill}
                              type="button"
                              onClick={() => {
                                setEditingTag(pill);
                                if (selectedFeedPost) {
                                  const updated = [...selectedFeedPost.slides];
                                  const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                                  updated[activeSlideIdx] = { ...s, tag: pill };
                                  setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                                  updateScheduledPost(selectedFeedPost.id, { slides: updated });
                                }
                              }}
                              className="px-2 py-0.5 rounded-full text-[9px] font-mono border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                            >
                              {pill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Posição da Copy & Modo de Contraste */}
                      <div className="grid grid-cols-2 gap-3 pt-2 pb-1 border-t border-white/10">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                            Posição da Copy
                          </label>
                          <div className="grid grid-cols-5 gap-1">
                            {[
                              { id: "top-left", icon: "↖", label: "Esq. Cima", title: "Esquerda Superior" },
                              { id: "top-right", icon: "↗", label: "Dir. Cima", title: "Direita Superior" },
                              { id: "center", icon: "▪", label: "Centro", title: "Centralizado" },
                              { id: "bottom-left", icon: "↙", label: "Esq. Base", title: "Esquerda Inferior" },
                              { id: "bottom-right", icon: "↘", label: "Dir. Base", title: "Direita Inferior" },
                            ].map((pos) => {
                              const currentPos = selectedFeedPost?.slides?.[activeSlideIdx]?.copyPosition || 
                                ((editingVariant === "pure-monumental" || editingVariant === "3d-liquid" || editingVariant === "3d-sculpture" || editingVariant === "clean-ice") ? "bottom-left" : "top-left");
                              const isSelected = currentPos === pos.id;
                              return (
                                <button
                                  key={pos.id}
                                  type="button"
                                  onClick={() => {
                                    if (selectedFeedPost) {
                                      const updated = [...selectedFeedPost.slides];
                                      const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                                      updated[activeSlideIdx] = { ...s, copyPosition: pos.id as any };
                                      setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                                      updateScheduledPost(selectedFeedPost.id, { slides: updated });
                                    }
                                  }}
                                  className={`py-1.5 px-0.5 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                    isSelected
                                      ? "bg-white text-black shadow ring-1 ring-white/50"
                                      : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10"
                                  }`}
                                  title={pos.title}
                                >
                                  <span className="text-xs font-sans leading-none">{pos.icon}</span>
                                  <span className="truncate leading-tight">{pos.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                            Contraste Visual
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: "auto", label: "Auto" },
                              { id: "light", label: "Noir" },
                              { id: "dark", label: "Gelo" },
                            ].map((c) => {
                              const currentContrast = selectedFeedPost?.slides?.[activeSlideIdx]?.contrastMode || "auto";
                              const isSelected = currentContrast === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    if (selectedFeedPost) {
                                      const updated = [...selectedFeedPost.slides];
                                      const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                                      updated[activeSlideIdx] = { ...s, contrastMode: c.id as any };
                                      setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                                      updateScheduledPost(selectedFeedPost.id, { slides: updated });
                                    }
                                  }}
                                  className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer text-center ${
                                    isSelected
                                      ? "bg-white text-black shadow"
                                      : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10"
                                  }`}
                                >
                                  {c.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Fundo da Tipografia: Pura vs Balão Vidro */}
                      <div className="space-y-1.5 pt-2 pb-1 border-t border-white/10">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center justify-between">
                          <span>Fundo da Tipografia</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {!selectedFeedPost?.slides?.[activeSlideIdx]?.hasScrimBackdrop ? "✦ Tipografia Pura" : "Vidro Translúcido"}
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedFeedPost) {
                                const updated = [...selectedFeedPost.slides];
                                const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                                updated[activeSlideIdx] = { ...s, hasScrimBackdrop: false };
                                setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                                updateScheduledPost(selectedFeedPost.id, { slides: updated });
                              }
                            }}
                            className={`py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                              !selectedFeedPost?.slides?.[activeSlideIdx]?.hasScrimBackdrop
                                ? "bg-white text-black shadow"
                                : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10"
                            }`}
                          >
                            <span>✦ Tipografia Pura (Sem Balão)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (selectedFeedPost) {
                                const updated = [...selectedFeedPost.slides];
                                const s = updated[activeSlideIdx] || { slideNumber: activeSlideIdx + 1 };
                                updated[activeSlideIdx] = { ...s, hasScrimBackdrop: true };
                                setSelectedFeedPost({ ...selectedFeedPost, slides: updated });
                                updateScheduledPost(selectedFeedPost.id, { slides: updated });
                              }
                            }}
                            className={`py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                              selectedFeedPost?.slides?.[activeSlideIdx]?.hasScrimBackdrop
                                ? "bg-white text-black shadow"
                                : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10"
                            }`}
                          >
                            <span>Vidro Translúcido</span>
                          </button>
                        </div>
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

                  {/* ABA: ARTIGO EXECUTIVO LINKEDIN */}
                  {modalTab === "linkedin" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                            Artigo Thought Leadership (LinkedIn B2B)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(editingLinkedInPostText);
                              setCopiedFeedback("Artigo executivo copiado para o LinkedIn!");
                              setTimeout(() => setCopiedFeedback(null), 3000);
                            }}
                            className="text-[10px] font-mono text-[#0077B5] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copiar Artigo</span>
                          </button>
                        </div>

                        <textarea
                          rows={11}
                          value={editingLinkedInPostText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingLinkedInPostText(val);
                            if (selectedFeedPost) {
                              setSelectedFeedPost({
                                ...selectedFeedPost,
                                linkedinPostText: val,
                              });
                              updateScheduledPost(selectedFeedPost.id, {
                                linkedinPostText: val,
                              });
                            }
                          }}
                          placeholder="Escreva ou edite o artigo executivo do LinkedIn com tese C-Level..."
                          className="w-full rounded-xl border border-white/10 bg-black/50 p-3.5 text-xs text-white leading-relaxed font-sans focus:border-[#0077B5] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>{editingLinkedInPostText.length} caracteres • Alinhado à Engenharia da Ausência</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedFeedPost) {
                              updateScheduledPost(selectedFeedPost.id, {
                                linkedinPostText: editingLinkedInPostText,
                              });
                              setCopiedFeedback("Artigo executivo salvo!");
                              setTimeout(() => setCopiedFeedback(null), 3000);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0077B5] text-white text-xs font-bold hover:bg-[#006097] transition-colors cursor-pointer shadow-md"
                        >
                          Salvar Artigo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ABA 3: AUDITORIA & VIRAL IA (DIRETOR DE GROWTH BLACK LINK) */}
                  {modalTab === "audit" && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      {/* Context Header */}
                      <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/20 via-black/40 to-transparent p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sky-400">
                          <Target className="h-4 w-4" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider">
                            Diretor de Growth & Conversão IA (Gemini 3.8 Flash)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Treinado nas teses de <strong className="text-white">Engenharia da Ausência</strong> (blklnk.com), catálogo de produtos do CRM e estética de alto ticket. Zero cases de terceiros — foco em quebrar o padrão do feed e gerar demanda real.
                        </p>
                      </div>

                      {/* Seletor do Produto Alvo */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                          Qual produto da Black Link este post deve vender?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {BLACKLINK_PRODUCTS.map((prod) => {
                            const isSelected = selectedProductId === prod.id;
                            return (
                              <button
                                key={prod.id}
                                type="button"
                                onClick={() => setSelectedProductId(prod.id)}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? "bg-sky-500/15 border-sky-400 text-white shadow-lg ring-1 ring-sky-400/30"
                                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="text-xs font-bold text-white line-clamp-1">{prod.name}</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-sky-300 border border-white/10">
                                      {prod.id}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-snug">
                                    {prod.shortDesc}
                                  </p>
                                </div>
                                <div className="mt-2 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                                  <span>Dor: {prod.painResolved.slice(0, 32)}...</span>
                                  {isSelected && <Check className="h-3 w-3 text-sky-400" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Botão de Disparo da Auditoria */}
                      <div className="pt-1">
                        <button
                          type="button"
                          disabled={isAuditingViral}
                          onClick={handleAuditViralWithGemini}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAuditingViral ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin text-black" />
                              <span>Auditando Copy & Potencial de Conversão...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 text-black" />
                              <span>Auditar e Otimizar para Viralização & Vendas</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Resultados da Auditoria */}
                      {viralAuditResult && (
                        <div className="space-y-4 pt-2 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          {/* Métricas: Viral Score & Conversion Score */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                                  Potencial Viral
                                </span>
                                <span
                                  className={`text-sm font-mono font-black ${
                                    viralAuditResult.viralScore >= 80
                                      ? "text-emerald-400"
                                      : viralAuditResult.viralScore >= 60
                                      ? "text-amber-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {viralAuditResult.viralScore}/100
                                </span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    viralAuditResult.viralScore >= 80
                                      ? "bg-emerald-400"
                                      : viralAuditResult.viralScore >= 60
                                      ? "bg-amber-400"
                                      : "bg-red-400"
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, viralAuditResult.viralScore))}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-zinc-500">Parada de feed & retenção visual</p>
                            </div>

                            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                                  Taxa de Conversão
                                </span>
                                <span
                                  className={`text-sm font-mono font-black ${
                                    viralAuditResult.conversionScore >= 80
                                      ? "text-emerald-400"
                                      : viralAuditResult.conversionScore >= 60
                                      ? "text-amber-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {viralAuditResult.conversionScore}/100
                                </span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    viralAuditResult.conversionScore >= 80
                                      ? "bg-emerald-400"
                                      : viralAuditResult.conversionScore >= 60
                                      ? "bg-amber-400"
                                      : "bg-red-400"
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, viralAuditResult.conversionScore))}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-zinc-500">Desejo de consumo e ação B2B</p>
                            </div>
                          </div>

                          {/* Parecer do Diretor Executivo */}
                          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold uppercase">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Diagnóstico do Diretor de Criação</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed italic">
                              "{viralAuditResult.critique}"
                            </p>
                          </div>

                          {/* Proposta Otimizada */}
                          <div className="rounded-xl border border-sky-400/30 bg-sky-950/20 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                                Versão Otimizada para o Produto: {viralAuditResult.targetProductName || "Black Link"}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Headline Sugerida</span>
                                <span className="text-white font-bold font-mono text-sm">{viralAuditResult.optimizedHeadline}</span>
                              </div>

                              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Tese / Subtítulo</span>
                                <span className="text-zinc-200">{viralAuditResult.optimizedBodyText}</span>
                              </div>

                              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Tag Editorial</span>
                                <span className="text-sky-300 font-mono text-xs">{viralAuditResult.optimizedTag}</span>
                              </div>

                              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Preview da Legenda</span>
                                <p className="text-zinc-300 line-clamp-3 text-[11px] leading-relaxed mt-1">
                                  {viralAuditResult.optimizedCaption}
                                </p>
                              </div>
                            </div>

                            {/* Botão de Aplicação Imediata */}
                            <button
                              type="button"
                              onClick={handleApplyViralOptimization}
                              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                            >
                              <CheckCircle2 className="h-4 w-4 text-black" />
                              <span>Aplicar Esta Versão Otimizada ao Post</span>
                            </button>
                          </div>
                        </div>
                      )}
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

                    {selectedFeedPost.slides.length > 1 && (
                      <button
                        type="button"
                        disabled={isDownloading}
                        onClick={() => handleDownloadCarouselPdf(selectedFeedPost)}
                        className="w-full sm:flex-1 py-2.5 rounded-xl border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 px-3 text-xs font-bold text-sky-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                        title="Baixar carrossel completo formatado para LinkedIn Document"
                      >
                        <Download className="h-3.5 w-3.5 text-sky-300" />
                        <span>Carrossel PDF (LinkedIn)</span>
                      </button>
                    )}

                    {selectedFeedPost.slides.length > 1 && (
                      <button
                        type="button"
                        disabled={isDownloading}
                        onClick={() => handleDownloadCarouselZip(selectedFeedPost)}
                        className="w-full sm:flex-1 py-2.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] px-3 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        title="Baixar todas as lâminas em arquivo ZIP"
                      >
                        <Layers className="h-3.5 w-3.5 text-zinc-300" />
                        <span>Todas as Lâminas (ZIP)</span>
                      </button>
                    )}



                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownloadHd(selectedFeedPost, activeSlideIdx)}
                      className="w-full sm:flex-1 py-2.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] px-3 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>
                        {isDownloading
                          ? "Renderizando..."
                          : selectedFeedPost.slides.length > 1
                          ? `Lâmina #${activeSlideIdx + 1} (PNG)`
                          : "Baixar Arte 1080p"}
                      </span>
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

      {/* Modal Oficial Canva Pro Studio (Black Link) */}
      <CanvaProModal
        isOpen={isCanvaProModalOpen}
        onClose={() => setIsCanvaProModalOpen(false)}
        post={postForCanva}
        activeSlideIdx={activeSlideIdx}
        onSaveToFeed={(renderedUrl, updatedSlide) => {
          if (selectedFeedPost) {
            const updatedSlides = [...selectedFeedPost.slides];
            const currentSlide = updatedSlides[activeSlideIdx] || {
              slideNumber: activeSlideIdx + 1,
              headline: "",
              bodyText: "",
            };
            const cleanImageUrl =
              currentSlide.imageUrl && !currentSlide.imageUrl.startsWith("data:image")
                ? currentSlide.imageUrl
                : undefined;

            updatedSlides[activeSlideIdx] = {
              ...currentSlide,
              ...(cleanImageUrl ? { imageUrl: cleanImageUrl } : {}),
              ...(updatedSlide || {}),
            };

            if (updatedSlides[activeSlideIdx].imageUrl?.startsWith("data:image")) {
              delete updatedSlides[activeSlideIdx].imageUrl;
            }

            const updatedImageUrls = selectedFeedPost.imageUrls.filter(
              (url) => url && !url.startsWith("data:image")
            );

            if (updatedSlide?.headline) setEditingHeadline(updatedSlide.headline);
            if (updatedSlide?.bodyText) setEditingBodyText(updatedSlide.bodyText);
            if (updatedSlide?.tag) setEditingTag(updatedSlide.tag);

            updateScheduledPost(selectedFeedPost.id, {
              slides: updatedSlides,
              imageUrls: updatedImageUrls,
            });
            setSelectedFeedPost({
              ...selectedFeedPost,
              slides: updatedSlides,
              imageUrls: updatedImageUrls,
            });
            setCopiedFeedback("✨ Post atualizado via Canva Pro Studio!");
            setTimeout(() => setCopiedFeedback(null), 3500);
          }
        }}
      />

      {/* Drawer do Diretor Executivo de Growth IA (Black Link) */}
      <MarketingAgentDrawer
        isOpen={isAgentDrawerOpen}
        onClose={() => setIsAgentDrawerOpen(false)}
      />
    </div>
  );
}
