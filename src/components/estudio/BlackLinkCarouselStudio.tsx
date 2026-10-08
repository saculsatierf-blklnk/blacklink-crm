"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BlackLinkSlidePreview,
  SlideData,
  SlideDesignConfig,
  SlideTheme,
  SlideLayout,
  SlideFont,
  AspectRatio,
  SlidePattern,
  isLightColor,
  GlassDimensionMode,
} from "./BlackLinkSlidePreview";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import {
  useMarketingStore,
  type CompanyProfile,
  type EditorialPlanItem,
  type CreativeSlide,
} from "@/store/useMarketingStore";

const BRAND_STORAGE_KEY = "blacklink_studio_brand_memory";

const DEFAULT_CONFIG: SlideDesignConfig = {
  theme: "dark-industrial",
  layout: "black-link",
  glassDimensionMode: "3d-slab",
  font: "clash-display",
  aspectRatio: "1:1",
  pattern: "noise",
  fontSizeScale: 1.0,
  bgColor: "#030304",
  accentColor: "#ffffff",
  authorName: "Black Link",
  authorHandle: "@blacklink.b2b",
  authorAvatar: "",
  bgImage: "",
  bgOpacity: 25,
};

const B2B_PALETTES = [
  {
    name: "Black Link Mono",
    bgColor: "#030304",
    accentColor: "#ffffff",
    description: "Template Oficial Antigravity 1.0 • 0% Saturação",
  },
  {
    name: "Midnight Blue",
    bgColor: "#0b1329",
    accentColor: "#38bdf8",
    description: "SaaS Enterprise & FinTech",
  },
  {
    name: "Forest Green",
    bgColor: "#061a14",
    accentColor: "#10b981",
    description: "Growth & Sustentabilidade B2B",
  },
  {
    name: "Executive Crimson",
    bgColor: "#1c070c",
    accentColor: "#f43f5e",
    description: "Vendas Agressivas & Conversão",
  },
  {
    name: "Monochrome Dark",
    bgColor: "#09090b",
    accentColor: "#ffffff",
    description: "Brutalismo Minimalista Luxo",
  },
  {
    name: "Executive Clean",
    bgColor: "#f8fafc",
    accentColor: "#0f172a",
    description: "Editorial B2B Claro",
  },
  {
    name: "Cyber Neon",
    bgColor: "#050505",
    accentColor: "#a855f7",
    description: "Engenharia de Dados & IA",
  },
];

// Definição dos Modelos de Layout com Categorias e Ícones
const LAYOUT_DEFINITIONS: Array<{
  id: SlideLayout;
  label: string;
  desc: string;
  category: "tech" | "editorial" | "social" | "saas";
  icon: string;
}> = [
  // 0: Template Estrela Oficial Antigravity (Black Link 1.0)
  {
    id: "black-link",
    label: "Black Link",
    desc: "Antigravity 1.0 • Glassmorphism 4K Monocromático Tátil",
    category: "saas",
    icon: "✦",
  },

  // Tech & Dev (5)
  { id: "brutalista", label: "Brutalista", desc: "Tipografia Colossal", category: "tech", icon: "⚡" },
  { id: "terminal", label: "Terminal", desc: "macOS Dev Shell", category: "tech", icon: "❯" },
  { id: "wireframe-blueprint", label: "Blueprint", desc: "Esquema Técnico", category: "tech", icon: "📐" },
  { id: "system-error", label: "System Error", desc: "Alerta Crítico / Dor", category: "tech", icon: "⚠️" },
  { id: "glossy-y2k", label: "Glossy Y2K", desc: "Futurismo Metálico", category: "tech", icon: "✦" },

  // Editorial & Mídia (4)
  { id: "minimal", label: "Minimalista", desc: "Editorial Luxo B2B", category: "editorial", icon: "▫️" },
  { id: "notion-doc", label: "Notion Doc", desc: "Documento Limpo", category: "editorial", icon: "📄" },
  { id: "magazine-cover", label: "Magazine", desc: "Capa Estilo Forbes", category: "editorial", icon: "📰" },
  { id: "newspaper-broadsheet", label: "Broadsheet", desc: "Jornal Financeiro", category: "editorial", icon: "🗞️" },

  // Social & Viral (5)
  { id: "tweet", label: "Tweet Social", desc: "Thread Viral 𝕏", category: "social", icon: "💬" },
  { id: "split", label: "Split 50/50", desc: "Texto + Métrica", category: "social", icon: "⚖️" },
  { id: "podcast-quote", label: "Podcast Quote", desc: "Citação de Impacto", category: "social", icon: "🎙️" },
  { id: "testimonial-review", label: "Testimonial", desc: "Prova Social 5★", category: "social", icon: "★" },
  { id: "polaroid-retro", label: "Polaroid", desc: "Snapshot Retrô B2B", category: "social", icon: "📷" },

  // SaaS & Dados (8)
  { id: "glass-floating", label: "Glass 3D", desc: "Card Flutuante", category: "saas", icon: "💎" },
  { id: "dashboard-analytics", label: "Analytics BI", desc: "Métricas & Neon", category: "saas", icon: "📊" },
  { id: "checklist-kanban", label: "Kanban Sprint", desc: "Guia Passo-a-Passo", category: "saas", icon: "☑️" },
  { id: "macbook-mockup", label: "MacBook", desc: "Navegador Flutuante", category: "saas", icon: "💻" },
  { id: "sticky-note", label: "Sticky Note", desc: "Memo Post-It Amarelo", category: "saas", icon: "📌" },
  { id: "aura-gradient", label: "Aura Keynote", desc: "Apple Event Glow", category: "saas", icon: "🔮" },
  { id: "bento-grid", label: "Bento Grid", desc: "Trend Hunter B2B", category: "saas", icon: "🍱" },
  { id: "apple-mockup", label: "Apple Mockup", desc: "Device Enveloping", category: "saas", icon: "🖥️" },
];

// Definição das Famílias Tipográficas
const FONT_DEFINITIONS: Array<{
  id: SlideFont;
  label: string;
  style: string;
  category: "tech" | "modern" | "editorial";
}> = [
  // Tipografia Oficial Black Link
  { id: "clash-display", label: "Clash Display", style: "Design System Black Link", category: "modern" },

  // Tech / Código (5)
  { id: "space-grotesk", label: "Space Grotesk", style: "Brutalista Tech", category: "tech" },
  { id: "fira-code", label: "Fira Code", style: "Mono Ligaduras", category: "tech" },
  { id: "jetbrains-mono", label: "JetBrains Mono", style: "Developer Sans", category: "tech" },
  { id: "ibm-plex-mono", label: "IBM Plex Mono", style: "Industrial Tech", category: "tech" },
  { id: "roboto-mono", label: "Roboto Mono", style: "Geométrico Mono", category: "tech" },

  // SaaS / Modernas (10)
  { id: "jakarta", label: "Plus Jakarta", style: "Startup Moderna", category: "modern" },
  { id: "inter", label: "Inter UI", style: "Interface Limpa", category: "modern" },
  { id: "syne", label: "Syne", style: "High-Fashion Tech", category: "modern" },
  { id: "dm-sans", label: "DM Sans", style: "Corporativo B2B", category: "modern" },
  { id: "montserrat", label: "Montserrat", style: "Geometria Pura", category: "modern" },
  { id: "poppins", label: "Poppins", style: "Amigável & Moderno", category: "modern" },
  { id: "outfit", label: "Outfit", style: "SaaS Enterprise", category: "modern" },
  { id: "bebas-neue", label: "Bebas Neue", style: "Condensado Colossal", category: "modern" },
  { id: "oswald", label: "Oswald", style: "Título de Impacto", category: "modern" },
  { id: "bricolage", label: "Bricolage", style: "Elite Grotesque", category: "modern" },

  // Editorial / Luxo (6)
  { id: "playfair", label: "Playfair Display", style: "Editorial Luxo", category: "editorial" },
  { id: "merriweather", label: "Merriweather", style: "Leitura Longa", category: "editorial" },
  { id: "lora", label: "Lora", style: "Caligráfico Moderno", category: "editorial" },
  { id: "eb-garamond", label: "EB Garamond", style: "Herança Clássica", category: "editorial" },
  { id: "cinzel", label: "Cinzel", style: "Monumental Romano", category: "editorial" },
  { id: "crimson-pro", label: "Crimson Pro", style: "Publicação Literária", category: "editorial" },
];

/**
 * Funções Utilitárias para Garantia dos Limites Absolutos (Design System Black Link 1.0)
 * Headline: Máx 65 caracteres
 * BodyText: Máx 140 caracteres
 */
export function clampHeadline(text: string, max = 65): string {
  const clean = (text || "").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 3).trim() + "...";
}

export function clampBody(text: string, max = 140): string {
  const clean = (text || "").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 3).trim() + "...";
}

const INITIAL_SLIDES: SlideData[] = [
  {
    tag: "MARCO ZERO • MANIFESTO",
    headline: "Por que o mercado de **CRM B2B falhou**?",
    bodyText:
      "CRMs legados viraram cemitérios de dados lentos. Eles não ajudam a vender, apenas registram o passado.",
  },
  {
    tag: "A GRANDE MENTIRA",
    headline: "Planilhas e burocracia **destroem seus hunters**.",
    bodyText:
      "Empresas perdem milhões não por falta de leads, mas pelo atrito invisível entre o primeiro contato e o fechamento.",
  },
  {
    tag: "A NOVA ARQUITETURA",
    headline: "Um sistema que **pensa antes da sua equipe**.",
    bodyText:
      "Criamos a Black Link para substituir o improviso por telemetria preditiva e velocidade comercial autônoma.",
  },
  {
    tag: "NOSSO PADRÃO",
    headline: "Tolerância zero a atrito e **foco em conversão**.",
    bodyText:
      "Sem interfaces pesadas. Apenas inteligência em tempo real para transformar operadores em consultores de elite.",
  },
  {
    tag: "MEMBRO FUNDADOR",
    headline: "Seja bem-vindo à **fundação da Black Link**.",
    bodyText:
      "Salve este carrossel e siga @blacklink.com.br para acompanhar a revolução das vendas B2B desde o primeiro dia.",
  },
];

/**
 * Sintetizador Inteligente Instantâneo para Pautas do Planejamento (Stage 2 -> Stage 3)
 * Gera lâminas de altíssima fidelidade e conversão baseadas no perfil real do criador ou empresa.
 */
function synthesizeSlidesForPlan(
  plan: EditorialPlanItem,
  profile: CompanyProfile
): SlideData[] {
  const isInfluencer = profile.profileType === "influencer";
  const brand = profile.name?.trim() || "Black Link";
  const handle = profile.instagram?.trim() || "@oficial";
  const cleanTheme = plan.theme.trim();
  const rawHook = (plan.hookHeadline || cleanTheme).trim().replace(/^"|"$/g, "");
  const hook = rawHook.includes("**")
    ? rawHook
    : rawHook.length > 25
    ? rawHook.replace(/([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][a-záéíóúâêîôûãõç]+(\s+[a-záéíóúâêîôûãõç]+)?)$/, "**$1**")
    : `O Segredo de **${rawHook}**`;
  const cta = plan.ctaText?.trim() || "Salve este carrossel para consultar na sua próxima sessão de planejamento.";

  const rawSlides: SlideData[] = (() => {
    if (plan.format === "story") {
      return [
        {
          tag: "STORY • GANCHO & PERGUNTA",
          headline: hook,
          bodyText: "Responda à enquete ou caixinha: como sua operação lida com esse desafio hoje?",
        },
        {
          tag: "STORY • BASTIDORES",
          headline: "O que Ninguém Mostra nos **Bastidores**",
          bodyText: "A diferença entre operações que escalam e as que travam está na clareza dos processos.",
        },
        {
          tag: "STORY • PRÓXIMA AÇÃO",
          headline: "Envie **'DIRECT'** para Acessar",
          bodyText: `${cta} Responda a este story agora para receber os detalhes ou acesse o link na bio de ${handle}!`,
        },
      ];
    }

    if (plan.format === "post") {
      return [
        {
          tag: plan.funnelStage === "topo" ? "TESE EXECUTIVA" : "DIRETRIZ ESTRATÉGICA",
          headline: hook,
          bodyText: `Análise estratégica desenvolvida pela equipe da ${brand}. Salve esta diretriz para consultar com seu time e compartilhe com sua liderança.`,
        },
      ];
    }

    if (isInfluencer) {
      return [
        {
          tag: plan.funnelStage === "topo" ? "GANCHO VIRAL" : plan.funnelStage === "meio" ? "BASTIDORES" : "INTERAÇÃO",
          headline: hook,
          bodyText: `Relato autoral e bastidores reais de ${brand}. Arraste para o lado para conferir como tudo aconteceu.`,
        },
        {
          tag: "O PONTO DE VIRADA",
          headline: "O Momento em que **Tudo Fugiu do Controle**",
          bodyText: "Quando você acha que tudo está correndo no padrão, acontece aquele imprevisto que muda o rumo de tudo.",
        },
        {
          tag: "A REVELAÇÃO",
          headline: "A Regra Oculta que **Poucos Entendem**",
          bodyText: "Por trás de cada post viral existe muito mais teste, erro e insistência do que perfeição planejada.",
        },
        {
          tag: "O APRENDIZADO",
          headline: "O que Ficou de **Lição Real**",
          bodyText: "Manter sua autenticidade e conexão com quem te acompanha vale mais do que qualquer fórmula pronta de engajamento.",
        },
        {
          tag: "INTERAÇÃO DIRETA",
          headline: "Comente Aqui: O que **Você Faria**?",
          bodyText: `${cta} Siga ${handle} para acompanhar os bastidores e os próximos conteúdos sem filtro!`,
        },
      ];
    }

    const contextStr = ((profile.niche || "") + " " + (profile.products || "") + " " + brand + " " + cleanTheme).toLowerCase();
    const isMetalOrIndustry =
      contextStr.includes("metal") ||
      contextStr.includes("aço") ||
      contextStr.includes("aco") ||
      contextStr.includes("estrutur") ||
      contextStr.includes("obra") ||
      contextStr.includes("galpão") ||
      contextStr.includes("fabricação") ||
      contextStr.includes("indústria");

    if (isMetalOrIndustry) {
      return [
        {
          tag: "DIAGNÓSTICO TÉCNICO",
          headline: hook,
          bodyText: `Por que fornecedores sem controle dimensional rigoroso causam atrasos em cadeia e como a ${brand} blinda sua operação.`,
        },
        {
          tag: "O RISCO CRÍTICO",
          headline: "A Armadilha do **Preço Aparente vs Custo Real**",
          bodyText: "Economizar na fase inicial com fornecimento sem rastreabilidade pode dobrar o custo total com retrabalho no terreno.",
        },
        {
          tag: "ENGENHARIA DE PRECISÃO",
          headline: "Padronização e **Tolerância Zero a Falhas**",
          bodyText: "Processos fabris com checagem milimétrica garantem que cada peça chegue pronta para montagem limpa e sem adaptações.",
        },
        {
          tag: "CRONOGRAMA BLINDADO",
          headline: "Execução no Terreno com **Prazo Assegurado**",
          bodyText: "Alinhamento contínuo entre produção industrial e equipes de campo para que o cronograma seja rigorosamente cumprido.",
        },
        {
          tag: "SOLUÇÃO CORPORATIVA",
          headline: `Conecte-se com os Especialistas da **${brand}**`,
          bodyText: `${cta} Fale com nossos engenheiros pelo link da bio em ${handle} e receba um orçamento corporativo estruturado.`,
        },
      ];
    }

    const isManifesto =
      cleanTheme.toLowerCase().includes("manifesto") ||
      cleanTheme.toLowerCase().includes("marco zero") ||
      rawHook.toLowerCase().includes("falhou") ||
      rawHook.toLowerCase().includes("reinventado");

    if (isManifesto) {
      return [
        {
          tag: "MARCO ZERO • MANIFESTO",
          headline: "Por que o mercado de **CRM B2B falhou**?",
          bodyText: "CRMs legados viraram cemitérios de dados lentos. Eles não ajudam a vender, apenas registram o passado.",
        },
        {
          tag: "A GRANDE MENTIRA",
          headline: "Planilhas e burocracia **destroem seus hunters**.",
          bodyText: "Empresas perdem milhões não por falta de leads, mas pelo atrito invisível entre o primeiro contato e o fechamento.",
        },
        {
          tag: "A NOVA ARQUITETURA",
          headline: "Um sistema que **pensa antes da sua equipe**.",
          bodyText: "Criamos a Black Link para substituir o improviso por telemetria preditiva e velocidade comercial autônoma.",
        },
        {
          tag: "NOSSO PADRÃO",
          headline: "Tolerância zero a atrito e **foco em conversão**.",
          bodyText: "Sem interfaces pesadas. Apenas inteligência em tempo real para transformar operadores em consultores de elite.",
        },
        {
          tag: "MEMBRO FUNDADOR",
          headline: "Seja bem-vindo à **fundação da Black Link**.",
          bodyText: `${cta} Siga ${handle} e acompanhe a revolução das vendas B2B desde o primeiro dia.`,
        },
      ];
    }

    // Padrão Corporativo B2B
    return [
      {
        tag: plan.funnelStage === "topo" ? "TESE CENTRAL" : plan.funnelStage === "meio" ? "FRAMEWORK" : "CONVERSÃO",
        headline: hook,
        bodyText: `Diretrizes estratégicas elaboradas para decisores corporativos pela equipe da ${brand}.`,
      },
      {
        tag: "O GARGALO OCULTO",
        headline: "Onde a Maioria Comete o **Erro Fatal**",
        bodyText: "Processos manuais e ausência de alinhamento estratégico criam atrito silencioso e drenam a rentabilidade do negócio.",
      },
      {
        tag: "A ARQUITETURA",
        headline: "O Método Superior de **Alta Performance**",
        bodyText: "Substitua o improviso por uma esteira estruturada: dados centralizados, automação inteligente e foco no que gera retorno real.",
      },
      {
        tag: "EXECUÇÃO CIRÚRGICA",
        headline: "Implementação Rápida no **Terreno**",
        bodyText: `Aplique o objetivo desta pauta (${plan.objective}) através de etapas acionáveis que sua equipe consegue executar hoje mesmo.`,
      },
      {
        tag: "CALL TO ACTION",
        headline: `Pronto para Escalar com a **${brand}**?`,
        bodyText: `${cta} Siga ${handle} e compartilhe este carrossel com sua diretoria para acelerar seus resultados.`,
      },
    ];
  })();

  // Garante que todas as lâminas nasçam respeitando rigorosamente os hard limits (65 / 140)
  return rawSlides.map((s) => ({
    ...s,
    headline: clampHeadline(s.headline, 65),
    bodyText: clampBody(s.bodyText, 140),
  }));
}

export function BlackLinkCarouselStudio() {
  // Conexão com a Store de Growth Marketing
  const companyProfile = useMarketingStore((state) => state.companyProfile);
  const scheduledPosts = useMarketingStore((state) => state.scheduledPosts);
  const updateScheduledPost = useMarketingStore((state) => state.updateScheduledPost);
  const addManualPost = useMarketingStore((state) => state.addManualPost);
  const selectedPlanForCreation = useMarketingStore((state) => state.selectedPlanForCreation);
  const selectPlanForCreation = useMarketingStore((state) => state.selectPlanForCreation);
  const approveStudioArtToFeed = useMarketingStore((state) => state.approveStudioArtToFeed);
  const setActiveGrowthTab = useMarketingStore((state) => state.setActiveGrowthTab);
  const setFeedViewMode = useMarketingStore((state) => state.setFeedViewMode);
  const setSelectedFeedPost = useMarketingStore((state) => state.setSelectedFeedPost);

  // Estado do Visor Rápido do Instagram dentro do Estúdio
  const [showStudioVisorModal, setShowStudioVisorModal] = useState<boolean>(false);
  const [studioVisorSlideIdx, setStudioVisorSlideIdx] = useState<number>(0);

  // Estado Raiz: Configurações Paramétricas do Design
  const [designConfig, setDesignConfig] = useState<SlideDesignConfig>(() => ({
    ...DEFAULT_CONFIG,
    authorName: companyProfile.name || DEFAULT_CONFIG.authorName,
    authorHandle: companyProfile.instagram || DEFAULT_CONFIG.authorHandle,
  }));

  // Estado Raiz: Lâminas de Conteúdo do Carrossel
  const [slides, setSlides] = useState<SlideData[]>(INITIAL_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Estado Raiz: Aba Ativa do Inspetor ('design' aberta por padrão)
  const [activeTab, setActiveTab] = useState<"design" | "conteudo">("design");

  // Filtros de Categoria da UI
  const [layoutCategoryFilter, setLayoutCategoryFilter] = useState<"all" | "tech" | "editorial" | "social" | "saas">("all");
  const [fontCategoryFilter, setFontCategoryFilter] = useState<"tech" | "modern" | "editorial">("modern");

  // Estado Raiz: Exportação Gráfica
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");

  // Contexto Multi-Tenant do Banco de Dados
  const [tenantName, setTenantName] = useState<string>(companyProfile.name || "Black Link Enterprise");
  const [tenantId, setTenantId] = useState<string>("");

  // Estado do Modal de IA e Geração Fluida
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [aiTheme, setAiTheme] = useState<string>("");
  const [aiAudience, setAiAudience] = useState<string>("");
  const [aiCompetitors, setAiCompetitors] = useState<string>("");
  const [aiPositioning, setAiPositioning] = useState<string>("anti-consenso");
  const [competitorInsight, setCompetitorInsight] = useState<{
    competitorCliché: string;
    ourDifferentiator: string;
    layoutRationale: string;
    suggestedLayout?: string;
  } | null>(null);
  const [showCompetitorRadar, setShowCompetitorRadar] = useState<boolean>(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiErrorNotice, setAiErrorNotice] = useState<string>("");
  const [saveFeedToast, setSaveFeedToast] = useState<string | null>(null);

  // Estado da Legenda do Post (LinkedIn & Instagram Post Copy)
  const [postCaption, setPostCaption] = useState<string>(
    `Construir uma máquina de vendas B2B previsível exige mais do que intuição: exige arquitetura de processos e inteligência de dados.\n\nNeste carrossel, detalhamos os passos essenciais para reduzir gargalos de qualificação e acelerar o ciclo de fechamento comercial em empresas de alto crescimento.\n\nSalve este post para consultar com seu time e compartilhe com líderes que buscam escala com eficiência de capital.\n\n#VendasB2B #InteligenciaComercial #SaaS #Growth #BlackLinkCRM`
  );
  const [isCaptionOpen, setIsCaptionOpen] = useState<boolean>(true);
  const [hasCopiedCaption, setHasCopiedCaption] = useState<boolean>(false);

  // 1. Sincronização Automática com o Perfil da Empresa / Criador
  useEffect(() => {
    if (companyProfile.name && companyProfile.name !== "Black Link CRM") {
      setTenantName(companyProfile.name);
      setDesignConfig((prev) => ({
        ...prev,
        authorName: companyProfile.name,
        authorHandle: companyProfile.instagram || prev.authorHandle,
      }));
    }
  }, [companyProfile.name, companyProfile.instagram]);

  // 2. Sincronização Automática com a Pauta Selecionada (Stage 2 -> Stage 3)
  useEffect(() => {
    if (!selectedPlanForCreation) return;

    const brand = companyProfile.name?.trim() || "Black Link CRM";
    const handle = companyProfile.instagram?.trim() || "@blacklink.b2b";

    const isStory = selectedPlanForCreation.format === "story";
    setTenantName(brand);
    setDesignConfig((prev) => ({
      ...prev,
      authorName: brand,
      authorHandle: handle,
      aspectRatio: isStory ? "9:16" : prev.aspectRatio === "9:16" ? "1:1" : prev.aspectRatio,
    }));

    setAiTheme(selectedPlanForCreation.theme);
    setAiAudience(companyProfile.targetAudience || "Público do Nicho");

    // Procura se já existe um post sincronizado no Feed/Cronograma com lâminas prontas E válidas
    const matching = scheduledPosts.find(
      (p) =>
        (p.theme &&
          selectedPlanForCreation.theme &&
          p.theme.toLowerCase().trim() ===
            selectedPlanForCreation.theme.toLowerCase().trim()) ||
        (p.hookHeadline &&
          selectedPlanForCreation.hookHeadline &&
          p.hookHeadline.toLowerCase().trim() ===
            selectedPlanForCreation.hookHeadline.toLowerCase().trim()) ||
        p.id === selectedPlanForCreation.id
    );

    const hasValidSlides =
      matching &&
      Array.isArray(matching.slides) &&
      matching.slides.length > 0 &&
      matching.slides.some(
        (s) => s && (Boolean(s.headline?.trim()) || Boolean(s.bodyText?.trim()))
      );

    if (hasValidSlides && matching) {
      const formatted: SlideData[] = matching.slides.map((s, idx) => ({
        tag:
          s.tag?.trim() ||
          (idx === 0
            ? "GANCHO"
            : idx === matching.slides.length - 1
            ? "CTA"
            : `LÂMINA ${idx + 1}`),
        headline: clampHeadline(
          s.headline?.trim() ||
          selectedPlanForCreation.theme ||
          `Lâmina ${idx + 1}`,
          65
        ),
        bodyText: clampBody(
          s.bodyText?.trim() ||
          selectedPlanForCreation.objective ||
          "Diretrizes e dados essenciais desta lâmina.",
          140
        ),
      }));
      setSlides(formatted);
      setCurrentSlideIndex(0);
      if (matching.postCaption) {
        setPostCaption(matching.postCaption);
      }
    } else {
      // Sintetiza 5 lâminas personalizadas imediatamente para a pauta
      const tailored = synthesizeSlidesForPlan(selectedPlanForCreation, companyProfile);
      setSlides(tailored);
      setCurrentSlideIndex(0);

      const generatedCaption = `${selectedPlanForCreation.hookHeadline || selectedPlanForCreation.theme}\n\n${selectedPlanForCreation.theme}: Diretrizes práticas desenvolvidas especialmente para ${brand}.\n\n${selectedPlanForCreation.ctaText || "Salve este post"}\n\n#${brand.replace(/[^a-zA-Z0-9]/g, "")} #AltaPerformance #InstagramGrowth`;
      setPostCaption(generatedCaption);
    }
  }, [selectedPlanForCreation, companyProfile, scheduledPosts]);

  // Estado do Copiloto de Micro-Edição por Lâmina
  const [copilotLoadingSlide, setCopilotLoadingSlide] = useState<number | null>(null);
  const [copilotAction, setCopilotAction] = useState<"agressivo" | "encurtar" | "executivo" | null>(null);

  // Estado da Central de Publicação (Modal Fase 3)
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

  // Estado do Gatilho de Inbound & Automação (Loop de Captura)
  const [inboundKeyword, setInboundKeyword] = useState<string>("SCRIPT");
  const [inboundDestination, setInboundDestination] = useState<string>("Inbound / Para Qualificação");
  const [hasCopiedWebhookUrl, setHasCopiedWebhookUrl] = useState<boolean>(false);
  const [hasCopiedCampaignJson, setHasCopiedCampaignJson] = useState<boolean>(false);

  // Referência para o container de exportação offscreen
  const offscreenContainerRef = useRef<HTMLDivElement>(null);

  // Hidratação Multi-Tenant (Supabase DB com fallback para LocalStorage)
  useEffect(() => {
    let isMounted = true;

    // 1. Carrega rascunho salvo no localStorage primeiro
    try {
      const saved = localStorage.getItem(BRAND_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDesignConfig((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch {
      // Ignora leitura em ambientes restritos
    }

    // 2. Hidrata dados oficiais do Tenant via banco de dados (/api/tenant/brand-profile)
    async function hydrateTenantBrand() {
      try {
        const res = await fetch("/api/tenant/brand-profile");
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data.companyName) setTenantName(data.companyName);
          if (data.companyId) setTenantId(data.companyId);
          setDesignConfig((prev) => ({
            ...prev,
            authorName: data.authorName || data.companyName || prev.authorName,
            authorHandle: data.authorHandle || prev.authorHandle,
            authorAvatar: data.authorAvatar || prev.authorAvatar,
            accentColor: data.accentColor || prev.accentColor,
            bgColor: data.bgColor || prev.bgColor,
          }));
        }
      } catch (err) {
        console.warn("Tenant brand hydration fallback:", err);
      }
    }

    hydrateTenantBrand();

    return () => {
      isMounted = false;
    };
  }, []);

  // Atualização sincronizada do Design com persistência
  const updateDesignConfig = (partial: Partial<SlideDesignConfig>) => {
    setDesignConfig((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(
          BRAND_STORAGE_KEY,
          JSON.stringify({
            authorName: updated.authorName,
            authorHandle: updated.authorHandle,
            authorAvatar: updated.authorAvatar,
            bgColor: updated.bgColor,
            accentColor: updated.accentColor,
            font: updated.font,
            layout: updated.layout,
            pattern: updated.pattern,
            aspectRatio: updated.aspectRatio,
            fontSizeScale: updated.fontSizeScale,
          })
        );
      } catch {
        // Ignora erro de gravação
      }
      return updated;
    });
  };

  // Seletor Global de Temas (Theme Engine)
  const applyGlobalTheme = (theme: SlideTheme) => {
    if (theme === "dark-industrial") {
      updateDesignConfig({
        theme,
        bgColor: "#09090b",
        accentColor: "#38bdf8",
      });
    } else if (theme === "light-minimal") {
      updateDesignConfig({
        theme,
        bgColor: "#f8fafc",
        accentColor: "#0f172a",
      });
    } else if (theme === "neon-accent") {
      updateDesignConfig({
        theme,
        bgColor: "#050505",
        accentColor: "#10b981",
      });
    }
  };

  // Operações de Manipulação de Slides
  const handleAddSlide = () => {
    const newSlide: SlideData = {
      tag: `LÂMINA ${slides.length + 1}`,
      headline: "Novo **insight corporativo** de alto impacto",
      bodyText:
        "Insira aqui a diretriz estratégica ou dado técnico para engajar os tomadores de decisão da sua rede.",
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const handleRemoveSlide = () => {
    if (slides.length <= 1) return;
    const nextSlides = slides.filter((_, idx) => idx !== currentSlideIndex);
    setSlides(nextSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  const updateCurrentSlide = (field: keyof SlideData, value: string) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[currentSlideIndex] = {
        ...copy[currentSlideIndex],
        [field]: value,
      };
      return copy;
    });
  };

  // ==========================================================================
  // PIPELINE DE GERAÇÃO INTELIGENTE DE IA & SKELETON ENGINE
  // ==========================================================================
  const handleGenerateWithAI = async () => {
    if (!aiTheme.trim()) return;

    // Fecha o modal na hora e aciona o Skeleton Loader cinza no canvas
    setIsGeneratingAI(true);
    setShowAIModal(false);
    setAiErrorNotice("");

    try {
      const fullPrompt = aiAudience.trim()
        ? `${aiTheme.trim()} (Público-Alvo: ${aiAudience.trim()})`
        : aiTheme.trim();

      const response = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: aiTheme.trim(),
          targetAudience: aiAudience.trim() || companyProfile.targetAudience,
          competitorsReferences: aiCompetitors.trim(),
          positioningStrategy: aiPositioning,
          format: "carousel",
          brandName: companyProfile.name,
          brandHandle: companyProfile.instagram,
          isInfluencer: companyProfile.profileType === "influencer",
          niche: companyProfile.niche,
          products: companyProfile.products,
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta HTTP: código ${response.status}`);
      }

      // Leitura bruta do texto para proteção contra quebra de JSON
      const rawText = await response.text();
      let parsedData: any = null;

      try {
        parsedData = JSON.parse(rawText);
      } catch (jsonErr) {
        console.warn("Retorno da IA não é um JSON válido. Injetando fallback contextual:", jsonErr);
        const fallbackPlan: EditorialPlanItem = selectedPlanForCreation || {
          id: `p-${Date.now()}`,
          dayNumber: 1,
          dayLabel: "Hoje",
          theme: aiTheme,
          hookHeadline: aiTheme,
          format: "carousel",
          funnelStage: "meio",
          objective: "Autoridade e engajamento",
          viralAngle: "Ângulo de alto impacto",
          ctaText: "Salve este carrossel",
          status: "planejado",
        };
        const tailored = synthesizeSlidesForPlan(fallbackPlan, companyProfile);
        setSlides(tailored);
        setCurrentSlideIndex(0);
        setAiErrorNotice("Ajuste contextual aplicado com base nas diretrizes da marca.");
        return;
      }

      // Ingestão de Inteligência Competitiva de Instagram e Contra-Posicionamento
      if (parsedData?.competitorInsight) {
        setCompetitorInsight({
          ...parsedData.competitorInsight,
          suggestedLayout: parsedData.suggestedLayout,
        });
        setShowCompetitorRadar(true);
      }

      // Aplicação Automática do Layout Recomendado pela IA
      if (
        parsedData?.suggestedLayout &&
        LAYOUT_DEFINITIONS.some((l) => l.id === parsedData.suggestedLayout)
      ) {
        updateDesignConfig({
          layout: parsedData.suggestedLayout as SlideLayout,
        });
      }

      // Aplicação Automática da Fonte Recomendada pela IA
      if (
        parsedData?.suggestedFont &&
        FONT_DEFINITIONS.some((f) => f.id === parsedData.suggestedFont)
      ) {
        updateDesignConfig({
          font: parsedData.suggestedFont as SlideFont,
        });
      }

      // Sincroniza Marca no DesignConfig
      if (companyProfile.name && companyProfile.name !== "Black Link CRM") {
        updateDesignConfig({
          authorName: companyProfile.name,
          authorHandle: companyProfile.instagram || `@${companyProfile.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        });
      }

      // Validação da lista de slides recebida
      const incomingSlides =
        parsedData?.carouselSlides ||
        parsedData?.slides ||
        parsedData?.data?.slides;

      if (Array.isArray(incomingSlides) && incomingSlides.length > 0) {
        const formatted: SlideData[] = incomingSlides.map((s: any, idx: number) => ({
          tag: s.tag || (idx === 0 ? "GANCHO" : idx === incomingSlides.length - 1 ? "CTA" : `LÂMINA ${idx + 1}`),
          headline: clampHeadline(s.headline || s.title || `Insight ${idx + 1}`, 65),
          bodyText: clampBody(s.bodyText || s.body || s.content || "", 140),
        }));
        setSlides(formatted);
        setCurrentSlideIndex(0);

        // Ingestão da Legenda Persuasiva do Post (postCaption)
        const incomingCaption =
          parsedData?.postCaption ||
          parsedData?.caption ||
          (parsedData?.bodyCopy
            ? `${parsedData.bodyCopy}\n\n${parsedData.ctaText || ""}\n\n${(Array.isArray(parsedData.hashtags) ? parsedData.hashtags : []).join(" ")}`.trim()
            : "");

        if (incomingCaption) {
          setPostCaption(incomingCaption);
        }
      } else {
        throw new Error("Estrutura de slides ausente na resposta da IA.");
      }
    } catch (err: any) {
      console.error("Erro capturado na integração de IA:", err);
      // Fallback seguro inteligente: Gera lâminas contextuais da marca
      const fallbackPlan: EditorialPlanItem = selectedPlanForCreation || {
        id: `p-${Date.now()}`,
        dayNumber: 1,
        dayLabel: "Hoje",
        theme: aiTheme,
        hookHeadline: aiTheme,
        format: "carousel",
        funnelStage: "meio",
        objective: "Autoridade e engajamento",
        viralAngle: "Ângulo de alto impacto",
        ctaText: "Salve este carrossel",
        status: "planejado",
      };
      const tailored = synthesizeSlidesForPlan(fallbackPlan, companyProfile);
      setSlides(tailored);
      setCurrentSlideIndex(0);
      setAiErrorNotice("Lâminas contextuais foram aplicadas com sucesso para edição.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Sincronização e Salvamento no Feed e Vitrine (Stage 3 -> Stage 4)
  const handleSaveToFeed = () => {
    const title =
      selectedPlanForCreation?.theme ||
      aiTheme ||
      slides[0]?.headline.replace(/\*\*/g, "") ||
      "Carrossel Criado no Estúdio";
    const hook = slides[0]?.headline || title;

    const creativeSlides: CreativeSlide[] = slides.map((s, idx) => ({
      slideNumber: idx + 1,
      headline: s.headline,
      bodyText: s.bodyText,
      tag: s.tag,
      imageUrl: `/api/marketing/render-slide?slide=${idx + 1}&total=${slides.length}&headline=${encodeURIComponent(
        s.headline
      )}&body=${encodeURIComponent(s.bodyText)}&format=carousel`,
    }));

    const matching = scheduledPosts.find(
      (p) =>
        p.theme.toLowerCase().trim() === title.toLowerCase().trim() ||
        p.id === selectedPlanForCreation?.id
    );

    if (matching) {
      updateScheduledPost(matching.id, {
        slides: creativeSlides,
        postCaption,
        hookHeadline: hook,
        theme: title,
        format: designConfig.aspectRatio === "9:16" ? "story" : "carousel",
      });
    } else {
      addManualPost({
        id: `post-studio-${Date.now()}`,
        theme: title,
        format: designConfig.aspectRatio === "9:16" ? "story" : "carousel",
        scheduledDate: selectedPlanForCreation?.dayLabel || "Amanhã • 10:00",
        status: "awaiting_approval",
        hookHeadline: hook,
        bodyCopy: postCaption,
        ctaText: slides[slides.length - 1]?.bodyText || "Salve este carrossel",
        hashtags: (postCaption.match(/#\w+/g) || ["#AltaPerformance", "#BlackLink"]),
        postCaption,
        slides: creativeSlides,
        imageUrls: creativeSlides.map((s) => s.imageUrl || ""),
        createdAt: new Date().toISOString(),
      });
    }
    setSaveFeedToast("✓ Carrossel sincronizado com a Vitrine e Feed do Instagram com sucesso!");
    setTimeout(() => setSaveFeedToast(null), 3500);
  };

  // Aprovação Definitiva da Arte & Integração Direta com as Prévias do Instagram (Stage 3 -> Stage 4)
  const handleApproveArtAndGoToPreviews = () => {
    const title =
      selectedPlanForCreation?.theme ||
      aiTheme ||
      slides[0]?.headline.replace(/\*\*/g, "") ||
      "Carrossel Aprovado no Estúdio";
    const hook = slides[0]?.headline || title;

    const creativeSlides: CreativeSlide[] = slides.map((s, idx) => ({
      slideNumber: idx + 1,
      headline: s.headline,
      bodyText: s.bodyText,
      tag: s.tag,
      imageUrl: `/api/marketing/render-slide?slide=${idx + 1}&total=${slides.length}&headline=${encodeURIComponent(
        s.headline
      )}&body=${encodeURIComponent(s.bodyText)}&format=carousel`,
    }));

    const matching = scheduledPosts.find(
      (p) =>
        p.theme.toLowerCase().trim() === title.toLowerCase().trim() ||
        p.id === selectedPlanForCreation?.id
    );

    const approvedPost = approveStudioArtToFeed(
      {
        id: matching?.id || `post-art-${Date.now()}`,
        theme: title,
        format: designConfig.aspectRatio === "9:16" ? "story" : "carousel",
        scheduledDate: selectedPlanForCreation?.dayLabel || "Hoje • Aprovado",
        status: "scheduled",
        hookHeadline: hook,
        bodyCopy: postCaption,
        ctaText: slides[slides.length - 1]?.bodyText || "Salve este carrossel",
        hashtags: (postCaption.match(/#\w+/g) || ["#AltaPerformance", "#BlackLink"]),
        postCaption,
        slides: creativeSlides,
        imageUrls: creativeSlides.map((s) => s.imageUrl || ""),
      },
      selectedPlanForCreation?.id
    );

    setSelectedFeedPost(approvedPost);
    setFeedViewMode("visor");
    setActiveGrowthTab("feed");
  };

  // Gerenciador de Métricas e Curvas Bézier (B2B Chart Engine)
  const setSlideChartPreset = (preset: "mrr" | "cac" | "velocity" | "none") => {
    setSlides((prev) => {
      const copy = [...prev];
      if (preset === "mrr") {
        copy[currentSlideIndex] = {
          ...copy[currentSlideIndex],
          kpiHighlight: "+340% MRR",
          chartData: [
            { label: "Q1", value: 120 },
            { label: "Q2", value: 180 },
            { label: "Q3", value: 290 },
            { label: "Q4", value: 410 },
          ],
        };
      } else if (preset === "cac") {
        copy[currentSlideIndex] = {
          ...copy[currentSlideIndex],
          kpiHighlight: "-52% CAC",
          chartData: [
            { label: "Jan", value: 450 },
            { label: "Fev", value: 380 },
            { label: "Mar", value: 280 },
            { label: "Abr", value: 216 },
          ],
        };
      } else if (preset === "velocity") {
        copy[currentSlideIndex] = {
          ...copy[currentSlideIndex],
          kpiHighlight: "3.4x Velocidade",
          chartData: [
            { label: "W1", value: 15 },
            { label: "W2", value: 35 },
            { label: "W3", value: 65 },
            { label: "W4", value: 95 },
          ],
        };
      } else {
        copy[currentSlideIndex] = {
          ...copy[currentSlideIndex],
          kpiHighlight: undefined,
          chartData: undefined,
        };
      }
      return copy;
    });
  };

  // ==========================================================================
  // COPILOTO DE MICRO-EDIÇÃO POR LÂMINA (AI LOCAL / REWRITE ESTRATÉGICO)
  // ==========================================================================
  const handleCopilotRewrite = async (
    action: "agressivo" | "encurtar" | "executivo",
    slideIndex: number
  ) => {
    setCopilotLoadingSlide(slideIndex);
    setCopilotAction(action);

    const current = slides[slideIndex];
    if (!current) {
      setCopilotLoadingSlide(null);
      setCopilotAction(null);
      return;
    }

    try {
      const res = await fetch("/api/marketing/copilot/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          headline: current.headline,
          bodyText: current.bodyText,
          tag: current.tag,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.headline && data.bodyText) {
          setSlides((prev) => {
            const copy = [...prev];
            copy[slideIndex] = {
              ...copy[slideIndex],
              headline: data.headline,
              bodyText: data.bodyText,
            };
            return copy;
          });
          return;
        }
      }
      throw new Error("Resposta fora do formato esperado pelo copiloto");
    } catch (err) {
      console.warn("Copiloto local com fallback de segurança:", err);
      // Fallback algorítmico local para garantir que a UI sempre responda
      const rawH = (current.headline || "").replace(/\*\*/g, "");
      let nextH = current.headline;
      let nextB = current.bodyText;

      if (action === "agressivo") {
        nextH = `O custo oculto de ignorar **${rawH.split(" ").slice(0, 4).join(" ") || "este processo"}**: você está perdendo receita`;
        nextB = "A cada ciclo sem padronização, sua esteira vaza leads e queima CAC. O mercado B2B não tolera processos amadores. Implemente a mudança hoje ou ceda espaço para a concorrência.";
      } else if (action === "encurtar") {
        const words = rawH.split(" ").filter(Boolean);
        nextH = words.length > 5 ? `**${words.slice(0, 3).join(" ")}**: ${words.slice(3, 6).join(" ")}` : `**${rawH || "Ajuste Imediato"}** em escala`;
        nextB = current.bodyText.split(/[.!?]+/)[0] ? `${current.bodyText.split(/[.!?]+/)[0].trim()}. Menos atrito, maior conversão.` : "Elimine o atrito técnico agora.";
      } else if (action === "executivo") {
        nextH = `Maximizando a eficiência de capital: a tese de **${rawH.split(" ").slice(0, 4).join(" ") || "governança comercial"}**`;
        nextB = "Decisores corporativos priorizam blindagem dos unit economics e previsibilidade de caixa. Esta diretriz consolida a governança da esteira comercial.";
      }

      setSlides((prev) => {
        const copy = [...prev];
        copy[slideIndex] = {
          ...copy[slideIndex],
          headline: nextH,
          bodyText: nextB,
        };
        return copy;
      });
    } finally {
      setCopilotLoadingSlide(null);
      setCopilotAction(null);
    }
  };

  // Upload Local de Screenshot para Mockups Apple
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        updateDesignConfig({ screenshotImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Local de Avatar
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        updateDesignConfig({ authorAvatar: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Local de Fundo
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        updateDesignConfig({ bgImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================================================
  // MOTORES DE EXPORTAÇÃO GRÁFICA (DOWNLOAD UNITÁRIO, ZIP, PDF LINKEDIN)
  // ==========================================================================

  // 1. Download Unitário de Lâmina Atual (Single Slide Export)
  const handleDownloadSinglePng = async () => {
    try {
      setIsExporting(true);
      setExportMessage("Capturando lâmina atual em alta resolução (1080px)...");

      const is916 = designConfig.aspectRatio === "9:16";
      const is45 = designConfig.aspectRatio === "4:5";
      const targetWidth = 1080;
      const targetHeight = is916 ? 1920 : is45 ? 1350 : 1080;

      // Prioriza o container offscreen que já está em escala exata 1080px
      const offscreenNode = document.getElementById(`offscreen-slide-${currentSlideIndex}`);
      const node = offscreenNode || document.getElementById("blacklink-slide-canvas");
      if (!node) throw new Error("Elemento do slide não encontrado no DOM.");

      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: 1.0,
        width: targetWidth,
        height: targetHeight,
        cacheBust: true,
        style: {
          transform: "none",
          transformOrigin: "top left",
          position: "static",
        },
      });

      // Nome do arquivo: blacklink-slide-0X.png
      const slideNumberStr = String(currentSlideIndex + 1).padStart(2, "0");
      const filename = `blacklink-slide-${slideNumberStr}.png`;

      saveAs(dataUrl, filename);
    } catch (err) {
      console.error("Falha ao exportar imagem PNG da lâmina atual:", err);
      alert("Erro ao exportar a lâmina atual em PNG.");
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // 2. Exportação Completa em Pacote (.ZIP)
  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const zip = new JSZip();
      const folder = zip.folder("blacklink-carrossel") || zip;

      const is916 = designConfig.aspectRatio === "9:16";
      const is45 = designConfig.aspectRatio === "4:5";
      const targetWidth = 1080;
      const targetHeight = is916 ? 1920 : is45 ? 1350 : 1080;

      for (let i = 0; i < slides.length; i++) {
        setExportMessage(`Renderizando slide ${i + 1} de ${slides.length} (${targetWidth}x${targetHeight}px)...`);
        const slideNode = document.getElementById(`offscreen-slide-${i}`);
        if (slideNode) {
          const dataUrl = await htmlToImage.toPng(slideNode, {
            pixelRatio: 1.0,
            width: targetWidth,
            height: targetHeight,
            cacheBust: true,
            style: {
              transform: "none",
              transformOrigin: "top left",
              position: "static",
            },
          });
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          folder.file(`slide-${String(i + 1).padStart(2, "0")}.png`, base64Data, {
            base64: true,
          });
        }
      }

      setExportMessage("Compactando arquivo ZIP corporativo...");
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "blacklink-carrossel-b2b.zip");
    } catch (err) {
      console.error("Falha ao exportar arquivo ZIP:", err);
      alert("Erro ao gerar o pacote ZIP.");
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // 3. Exportação Gráfica: Documento PDF LinkedIn via jsPDF
  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const is916 = designConfig.aspectRatio === "9:16";
      const isPortrait = designConfig.aspectRatio === "4:5";
      const pdfWidth = 1080;
      const pdfHeight = is916 ? 1920 : isPortrait ? 1350 : 1080;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [pdfWidth, pdfHeight],
      });

      for (let i = 0; i < slides.length; i++) {
        setExportMessage(`Processando página PDF ${i + 1} de ${slides.length}...`);
        const slideNode = document.getElementById(`offscreen-slide-${i}`);
        if (slideNode) {
          const dataUrl = await htmlToImage.toPng(slideNode, {
            pixelRatio: 1.0,
            width: pdfWidth,
            height: pdfHeight,
            cacheBust: true,
            style: {
              transform: "none",
              transformOrigin: "top left",
              position: "static",
            },
          });

          if (i > 0) {
            pdf.addPage([pdfWidth, pdfHeight], "portrait");
          }

          pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
        }
      }

      setExportMessage("Finalizando documento PDF corporativo...");
      pdf.save("blacklink-carrossel-documento.pdf");
    } catch (err) {
      console.error("Falha ao exportar PDF:", err);
      alert("Erro ao gerar o documento PDF.");
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // Filtragem dos 20 Layouts
  const filteredLayouts =
    layoutCategoryFilter === "all"
      ? LAYOUT_DEFINITIONS
      : LAYOUT_DEFINITIONS.filter((l) => l.category === layoutCategoryFilter);

  // Filtragem das 20 Fontes
  const filteredFonts = FONT_DEFINITIONS.filter(
    (f) => f.category === fontCategoryFilter
  );

  return (
    <div className="w-full flex-1 flex flex-col p-4 md:p-8 lg:p-10 max-w-[1720px] mx-auto">
      {/* ==================================================================== */}
      {/* CABEÇALHO DO ESTÚDIO BLACK LINK                                      */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-xs font-mono font-bold uppercase rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              Tenant: {tenantName}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-zinc-400">
              Motor Gráfico v3.0 • 22 Layouts &amp; 21 Fontes
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Black Link Carousel Studio
          </h1>
          <p className="text-sm text-zinc-400">
            Arsenal paramétrico de alta fidelidade para carrosséis corporativos B2B virais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAIModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🪄 Gerar com IA</span>
          </button>

          <button
            onClick={() => {
              setStudioVisorSlideIdx(currentSlideIndex);
              setShowStudioVisorModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>📱 Visor Instagram</span>
          </button>

          <button
            onClick={handleApproveArtAndGoToPreviews}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-heading font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>✓ Aprovar &amp; Ir para Prévias ➔</span>
          </button>

          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Lâminas:</span>
            <span className="text-sm font-bold text-white font-mono">{slides.length}</span>
          </div>
        </div>
      </div>

      {/* Banner de Briefing Ativo Carregado do Planejamento */}
      {selectedPlanForCreation && (
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl">
          <div className="flex items-center gap-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
              ⚡
            </span>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                  Briefing Ativo • {selectedPlanForCreation.dayLabel}
                  {selectedPlanForCreation.scheduledTime ? ` às ${selectedPlanForCreation.scheduledTime}` : ""}
                </span>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                  {selectedPlanForCreation.format === "story" ? "Story (9:16)" : selectedPlanForCreation.format === "carousel" ? "Carrossel (1:1)" : "Post"}
                </span>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedPlanForCreation.funnelStage}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white tracking-tight">
                {selectedPlanForCreation.theme}
              </h4>
              {selectedPlanForCreation.hookHeadline && (
                <p className="text-[11px] text-zinc-300 line-clamp-1 italic">
                  Gancho: &ldquo;{selectedPlanForCreation.hookHeadline}&rdquo;
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setAiTheme(selectedPlanForCreation.theme);
                handleGenerateWithAI();
              }}
              disabled={isGeneratingAI}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold text-xs hover:bg-blue-500/30 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>🪄 Regenerar com IA</span>
            </button>
            <button
              onClick={handleApproveArtAndGoToPreviews}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>✓ Salvar Arte &amp; Ver no Feed ➔</span>
            </button>
            <button
              onClick={() => selectPlanForCreation(null)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Toast de Feedback de Salvamento no Feed */}
      {saveFeedToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-emerald-300 text-xs font-mono animate-in fade-in">
          <div className="flex items-center gap-2.5 font-bold">
            <span>✓</span>
            <span>{saveFeedToast}</span>
          </div>
          <button
            onClick={() => setSaveFeedToast(null)}
            className="text-emerald-400 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Aviso de Fallback de IA caso ativado */}
      {aiErrorNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-amber-200 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span>⚠️</span>
            <span>{aiErrorNotice}</span>
          </div>
          <button
            onClick={() => setAiErrorNotice("")}
            className="text-amber-400 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ÁREA DE TRABALHO: SPLIT VIEW (INSPETOR ESQUERDO & CANVAS DIREITO)    */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================================================================== */}
        {/* COLUNA ESQUERDA: INSPETOR PARAMÉTRICO (DESIGN & CONTEÚDO)          */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl p-6 md:p-7 space-y-6">
          {/* Seletor de Abas do Inspetor */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/50 border border-white/10">
            <button
              onClick={() => setActiveTab("design")}
              className={`py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "design"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Design & Estilo
            </button>
            <button
              onClick={() => setActiveTab("conteudo")}
              className={`py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "conteudo"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Conteúdo & Slides
            </button>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* ABA 1: DESIGN & ESTILO (FIGMA-LIKE PARAMETRIC INSPECTOR)         */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "design" && (
            <div className="space-y-6">
              {/* 1. SELETOR DE LAYOUTS MODULARES (20 MODELOS VIRAIS) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Biblioteca de Templates (22 Modelos)
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold capitalize">
                    {designConfig.layout}
                  </span>
                </div>

                {/* Banner Hero do Template Oficial: Black Link (Antigravity 1.0) */}
                <div className="p-4 rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-black to-black backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-mono font-extrabold uppercase shadow-sm">
                        ★ OFICIAL
                      </span>
                      <span className="text-xs font-bold text-white font-clash tracking-wide">
                        Template Black Link (Antigravity 1.0)
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      Glassmorphism 4K tátil, paleta 100% monocromática (0% saturação), tipografia Clash Display + Inter e margens imutáveis de 80px.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateDesignConfig({
                        layout: "black-link",
                        font: "clash-display",
                        bgColor: "#030304",
                        accentColor: "#ffffff",
                        pattern: "noise",
                        glassDimensionMode: designConfig.glassDimensionMode || "3d-slab",
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5 ${
                      designConfig.layout === "black-link"
                        ? "bg-white text-black border border-white"
                        : "bg-white/10 hover:bg-white text-white hover:text-black border border-white/20"
                    }`}
                  >
                    <span>{designConfig.layout === "black-link" ? "✓ Template Ativo" : "✦ Aplicar Template Black Link"}</span>
                  </button>
                </div>

                {/* Seletor de Dimensão Física 3D / Glassmorphism Black Link */}
                {designConfig.layout === "black-link" && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-xl shadow-lg space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">💎</span>
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                          Dimensão Espacial & Acabamento 3D
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                        {designConfig.glassDimensionMode === "3d-monolith"
                          ? "Chanfrado 45°"
                          : designConfig.glassDimensionMode === "floating-glass"
                          ? "Vidro 4K Zenital"
                          : "Placa 3D Acrílica"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: "3d-slab" as GlassDimensionMode,
                          name: "Placa 3D Acrílica",
                          badge: "Efeito Imagem 4",
                          desc: "Bordas ópticas chanfradas, halo luminoso e botões táteis",
                          icon: "✦",
                        },
                        {
                          id: "3d-monolith" as GlassDimensionMode,
                          name: "Monólito Chanfrado",
                          badge: "Efeito Imagem 5",
                          desc: "Facetas físicas a 45°, cavidade escavada e relevo",
                          icon: "⬡",
                        },
                        {
                          id: "floating-glass" as GlassDimensionMode,
                          name: "Vidro Flutuante 4K",
                          badge: "Efeito Imagens 1-3",
                          desc: "Refração zenital, blur profundo e emblema 4K",
                          icon: "◈",
                        },
                      ].map((dim) => {
                        const isSelected =
                          (designConfig.glassDimensionMode || "3d-slab") === dim.id;
                        return (
                          <button
                            key={dim.id}
                            type="button"
                            onClick={() =>
                              updateDesignConfig({ glassDimensionMode: dim.id })
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? "bg-white text-black border-white shadow-lg shadow-white/10"
                                : "bg-black/40 text-zinc-300 border-white/10 hover:border-white/30 hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold flex items-center gap-1 font-clash">
                                <span>{dim.icon}</span> {dim.name}
                              </span>
                              <span
                                className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? "bg-black text-white"
                                    : "bg-white/10 text-zinc-400"
                                }`}
                              >
                                {dim.badge}
                              </span>
                            </div>
                            <p
                              className={`text-[10px] leading-tight ${
                                isSelected ? "text-zinc-800" : "text-zinc-400"
                              }`}
                            >
                              {dim.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Categorias dos Layouts (Filtros Rápidos) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2.5 scrollbar-thin">
                  {[
                    { id: "all", label: "Todos (22)" },
                    { id: "tech", label: "Tech (5)" },
                    { id: "editorial", label: "Editorial (4)" },
                    { id: "social", label: "Social (5)" },
                    { id: "saas", label: "SaaS & BI (8)" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setLayoutCategoryFilter(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase shrink-0 transition-all cursor-pointer border ${
                        layoutCategoryFilter === cat.id
                          ? "bg-white text-black border-white shadow-sm"
                          : "bg-black/30 text-zinc-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Grid Rolável de 20 Layouts com Prévia Visual */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[310px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredLayouts.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updateDesignConfig({ layout: item.id })}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[70px] ${
                        designConfig.layout === item.id
                          ? "bg-white/20 border-white text-white shadow-md scale-[1.02]"
                          : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-base select-none">{item.icon}</span>
                        {designConfig.layout === item.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                        )}
                      </div>
                      <div>
                        <span className="block text-xs font-bold leading-tight truncate">
                          {item.label}
                        </span>
                        <span className="block text-[9px] text-zinc-500 truncate">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. DIMENSÃO DA LÂMINA (PROPORÇÃO / FORMATO B2B) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Dimensão da Lâmina
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                    {designConfig.aspectRatio === "9:16"
                      ? "9:16 (Stories/Reels 1080x1920)"
                      : designConfig.aspectRatio === "4:5"
                      ? "4:5 (Feed Retrato 1080x1350)"
                      : "1:1 (Feed Quadrado 1080x1080)"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "1:1", label: "1:1 Feed", sub: "1080×1080", icon: "⏹️" },
                    { id: "4:5", label: "4:5 Retrato", sub: "1080×1350", icon: "📱" },
                    { id: "9:16", label: "9:16 Stories", sub: "1080×1920", icon: "🎬" },
                  ].map((dim) => (
                    <button
                      key={dim.id}
                      onClick={() => updateDesignConfig({ aspectRatio: dim.id as AspectRatio })}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        designConfig.aspectRatio === dim.id
                          ? "bg-white/20 border-white text-white shadow-md scale-[1.02]"
                          : "bg-black/30 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <span className="text-base block mb-0.5">{dim.icon}</span>
                      <span className="block text-xs font-bold leading-tight truncate">
                        {dim.label}
                      </span>
                      <span className="block text-[9px] font-mono text-zinc-500 mt-0.5">
                        {dim.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. TEXTURAS DE FUNDO (PATTERN ENGINE CONDICIONAL) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Textura de Fundo (Pattern)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {designConfig.pattern}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: "solid-mesh", label: "Solid", icon: "✦" },
                      { id: "dots", label: "Dots", icon: "⁘" },
                      { id: "grid", label: "Grid", icon: "⌗" },
                      { id: "noise", label: "Noise", icon: "░" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => updateDesignConfig({ pattern: p.id as SlidePattern })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        designConfig.pattern === p.id
                          ? "bg-white/20 border-white text-white shadow-sm"
                          : "bg-black/30 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. SLIDER DE ZOOM DA FONTE (ESCALA TIPOGRÁFICA) */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Zoom da Fonte (Escala Tipográfica)
                  </label>
                  <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                    {Math.round((designConfig.fontSizeScale || 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={1.5}
                  step={0.05}
                  value={designConfig.fontSizeScale || 1.0}
                  onChange={(e) =>
                    updateDesignConfig({ fontSizeScale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>80% (Condensado)</span>
                  <span>100% (Padrão)</span>
                  <span>150% (Colossal)</span>
                </div>
              </div>

              {/* 4. ARSENAL TIPOGRÁFICO DE 20 FONTES COM ABAS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Arsenal Tipográfico (21 Fontes)
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400 capitalize">
                    {designConfig.font}
                  </span>
                </div>

                {/* Abas das Fontes */}
                <div className="grid grid-cols-3 p-1 rounded-xl bg-black/50 border border-white/10 mb-2.5">
                  {[
                    { id: "modern", label: "SaaS (10)" },
                    { id: "tech", label: "Tech (5)" },
                    { id: "editorial", label: "Editorial (6)" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFontCategoryFilter(tab.id as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        fontCategoryFilter === tab.id
                          ? "bg-white text-black shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Grid das Fontes Filtradas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredFonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => updateDesignConfig({ font: font.id })}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        designConfig.font === font.id
                          ? "bg-white/20 border-white text-white shadow-md scale-[1.02]"
                          : "bg-black/30 border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                      }`}
                    >
                      <span className="block text-xs font-bold truncate leading-tight">
                        {font.label}
                      </span>
                      <span className="block text-[9px] text-zinc-500 truncate mt-0.5">
                        {font.style}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. PALETAS B2B PRONTAS + CONTRASTE YIQ */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Paletas Corporativas B2B
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {isLightColor(designConfig.bgColor) ? "Contraste: Claro" : "Contraste: Escuro"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {B2B_PALETTES.map((pal, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        updateDesignConfig({
                          bgColor: pal.bgColor,
                          accentColor: pal.accentColor,
                        })
                      }
                      className="p-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/30 text-left transition-all flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <span
                          className="w-5 h-5 rounded-full border border-white/20"
                          style={{ backgroundColor: pal.bgColor }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-white/20"
                          style={{ backgroundColor: pal.accentColor }}
                        />
                      </div>
                      <div className="truncate leading-none">
                        <span className="block text-xs font-bold text-white truncate">
                          {pal.name}
                        </span>
                        <span className="text-[9px] text-zinc-400 truncate">
                          {pal.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. CONTROLES PERSONALIZADOS DE COR */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Cor de Fundo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.bgColor}
                      onChange={(e) => updateDesignConfig({ bgColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={designConfig.bgColor}
                      onChange={(e) => updateDesignConfig({ bgColor: e.target.value })}
                      className="flex-1 px-2 py-1 rounded bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Cor de Destaque
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designConfig.accentColor}
                      onChange={(e) => updateDesignConfig({ accentColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={designConfig.accentColor}
                      onChange={(e) => updateDesignConfig({ accentColor: e.target.value })}
                      className="flex-1 px-2 py-1 rounded bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 7. IDENTIDADE DO AUTOR E IMAGEM DE FUNDO */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Identidade do Autor & Marca
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">Memória Salva</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                      Nome de Exibição
                    </label>
                    <input
                      type="text"
                      value={designConfig.authorName}
                      onChange={(e) => updateDesignConfig({ authorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                      @Handle Social
                    </label>
                    <input
                      type="text"
                      value={designConfig.authorHandle}
                      onChange={(e) => updateDesignConfig({ authorHandle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    Foto do Autor (Avatar)
                  </label>
                  <div className="flex items-center gap-3">
                    {designConfig.authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={designConfig.authorAvatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">
                        BL
                      </div>
                    )}
                    <label className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white text-center cursor-pointer font-mono">
                      <span>Carregar Foto do Computador</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    Imagem de Fundo (Opcional)
                  </label>
                  <div className="space-y-2">
                    <label className="block w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white text-center cursor-pointer font-mono">
                      <span>Escolher Arquivo de Imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBgImageUpload}
                        className="hidden"
                      />
                    </label>

                    {designConfig.bgImage && (
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                          <span>Opacidade da Imagem</span>
                          <span>{designConfig.bgOpacity || 25}%</span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          value={designConfig.bgOpacity || 25}
                          onChange={(e) =>
                            updateDesignConfig({ bgOpacity: Number(e.target.value) })
                          }
                          className="w-full accent-white cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 8. SCREENSHOT DE SISTEMA (MOCKUP APPLE MACBOOK / IPHONE) */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase text-zinc-300 font-bold block">
                      Screenshot de Sistema (Apple Mockup)
                    </label>
                    {designConfig.screenshotImage && (
                      <button
                        type="button"
                        onClick={() => updateDesignConfig({ screenshotImage: undefined })}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Envelopa sua interface ou dashboard dentro de uma moldura de MacBook (Feed) ou iPhone (Stories) com reflexo de vidro realista.
                  </p>
                  <label className="block w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white text-center cursor-pointer font-mono transition-all">
                    <span>{designConfig.screenshotImage ? "✓ Substituir Screenshot de Sistema" : "Carregar Imagem de Sistema (.png / .jpg)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* ABA 2: CONTEÚDO & SLIDES                                         */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "conteudo" && (
            <div className="space-y-6">
              {/* Carrossel de Lâminas / Seletor de Slide */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Lista de Lâminas
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddSlide}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      + Novo Slide
                    </button>
                    <button
                      onClick={handleRemoveSlide}
                      disabled={slides.length <= 1}
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 disabled:opacity-30 text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all border cursor-pointer ${
                        currentSlideIndex === idx
                          ? "bg-white text-black border-white shadow-md"
                          : "bg-black/40 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {idx + 1 === slides.length && slides.length > 1
                        ? "CTA Final"
                        : `Slide ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor do Slide Ativo */}
              <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                    Tag / Categoria Superior
                  </label>
                  <input
                    type="text"
                    value={slides[currentSlideIndex]?.tag || ""}
                    onChange={(e) => updateCurrentSlide("tag", e.target.value)}
                    placeholder="Ex: INSIGHT B2B, MÉTRICA, CASE"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono uppercase text-zinc-400">
                      Título Principal (Headline)
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Use **palavra** para destacar
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={slides[currentSlideIndex]?.headline || ""}
                    onChange={(e) => updateCurrentSlide("headline", e.target.value)}
                    placeholder="Ex: Como gerar **+340% de retenção** em contratos corporativos"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-sm text-white focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                    Texto do Corpo (Body Text)
                  </label>
                  <textarea
                    rows={4}
                    value={slides[currentSlideIndex]?.bodyText || ""}
                    onChange={(e) => updateCurrentSlide("bodyText", e.target.value)}
                    placeholder="Insira o texto explicativo deste slide..."
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none leading-relaxed"
                  />
                </div>

                {/* MEDIDOR & AJUSTE DOS HARD LIMITS (DESIGN SYSTEM BLACK LINK 1.0) */}
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="text-white">✦</span>
                      <span>Limites Absolutos (Hard Limits):</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Antigravity 1.0 Spec
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div
                      className={`p-2 rounded-lg border ${
                        (slides[currentSlideIndex]?.headline?.length || 0) <= 65
                          ? "bg-white/[0.04] border-white/10 text-zinc-300"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      }`}
                    >
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Título (Máx 65):</span>
                      <span className="font-bold">
                        {slides[currentSlideIndex]?.headline?.length || 0} / 65
                      </span>
                      {(slides[currentSlideIndex]?.headline?.length || 0) > 65 && (
                        <span className="text-[9px] block text-amber-400 mt-0.5">⚠️ Excede limite</span>
                      )}
                    </div>

                    <div
                      className={`p-2 rounded-lg border ${
                        (slides[currentSlideIndex]?.bodyText?.length || 0) <= 140
                          ? "bg-white/[0.04] border-white/10 text-zinc-300"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      }`}
                    >
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Corpo (Máx 140):</span>
                      <span className="font-bold">
                        {slides[currentSlideIndex]?.bodyText?.length || 0} / 140
                      </span>
                      {(slides[currentSlideIndex]?.bodyText?.length || 0) > 140 && (
                        <span className="text-[9px] block text-amber-400 mt-0.5">⚠️ Excede limite</span>
                      )}
                    </div>
                  </div>

                  {((slides[currentSlideIndex]?.headline?.length || 0) > 65 ||
                    (slides[currentSlideIndex]?.bodyText?.length || 0) > 140) && (
                    <button
                      type="button"
                      onClick={() => {
                        const h = slides[currentSlideIndex]?.headline || "";
                        const b = slides[currentSlideIndex]?.bodyText || "";
                        updateCurrentSlide("headline", h.length > 65 ? h.slice(0, 62).trim() + "..." : h);
                        updateCurrentSlide("bodyText", b.length > 140 ? b.slice(0, 137).trim() + "..." : b);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>⚡ Ajustar Automaticamente aos Hard Limits (65 / 140 carac.)</span>
                    </button>
                  )}
                </div>

                {/* TOOLBAR FLUTUANTE DO COPILOTO DE MICRO-EDIÇÃO IA */}
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-2 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 font-bold">
                    <span className="text-xs">🤖</span>
                    <span>Copiloto de Lâmina:</span>
                    {copilotLoadingSlide === currentSlideIndex && (
                      <span className="w-2.5 h-2.5 rounded-full border border-cyan-400 border-t-transparent animate-spin inline-block ml-1" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopilotRewrite("agressivo", currentSlideIndex)}
                      disabled={copilotLoadingSlide === currentSlideIndex}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 hover:border-rose-500/40 text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      title="Reescreve focando em dor, urgência e perda de receita"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                      </svg>
                      <span>Agressivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopilotRewrite("encurtar", currentSlideIndex)}
                      disabled={copilotLoadingSlide === currentSlideIndex}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/20 hover:border-amber-500/40 text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      title="Reduz caracteres e simplifica a mensagem mantendo impacto"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3L13 9M9 15L3 21M9 9l6 6M17.5 12a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>Encurtar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopilotRewrite("executivo", currentSlideIndex)}
                      disabled={copilotLoadingSlide === currentSlideIndex}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-500/40 text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      title="Eleva o vocabulário para tom institucional C-Level"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M6 3h12l-2 5-4-2-4 2-2-5zm0 8l6 3 6-3v9a1 1 0 01-1 1H7a1 1 0 01-1-1v-9z" />
                      </svg>
                      <span>Executivo</span>
                    </button>
                  </div>
                </div>

                {/* DADOS VISUAIS (B2B CHART ENGINE MVP) */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase text-zinc-300 font-bold flex items-center gap-1.5">
                      <span>📊 Gráfico B2B (Data Curve)</span>
                    </label>
                    {slides[currentSlideIndex]?.kpiHighlight && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {slides[currentSlideIndex].kpiHighlight}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Injeta curvas de crescimento e métricas de impacto no quadrante do slide.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSlideChartPreset("mrr")}
                      className={`p-2 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                        slides[currentSlideIndex]?.kpiHighlight === "+340% MRR"
                          ? "bg-white/20 border-white text-white shadow-sm"
                          : "bg-black/50 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold text-white">+340% MRR</span>
                      <span className="block text-[9px] text-zinc-400">Tração B2B</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideChartPreset("cac")}
                      className={`p-2 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                        slides[currentSlideIndex]?.kpiHighlight === "-52% CAC"
                          ? "bg-white/20 border-white text-white shadow-sm"
                          : "bg-black/50 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold text-white">-52% CAC</span>
                      <span className="block text-[9px] text-zinc-400">Eficiência Unit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideChartPreset("velocity")}
                      className={`p-2 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                        slides[currentSlideIndex]?.kpiHighlight === "3.4x Velocidade"
                          ? "bg-white/20 border-white text-white shadow-sm"
                          : "bg-black/50 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold text-white">3.4x Velocidade</span>
                      <span className="block text-[9px] text-zinc-400">Pipeline Deal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideChartPreset("none")}
                      className={`p-2 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                        !slides[currentSlideIndex]?.chartData
                          ? "bg-white/20 border-white text-white shadow-sm"
                          : "bg-black/50 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold text-zinc-300">Sem Gráfico</span>
                      <span className="block text-[9px] text-zinc-500">Apenas Conteúdo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Controles de Navegação */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-mono font-bold text-white border border-white/10 cursor-pointer"
                >
                  ← Anterior
                </button>
                <span className="text-xs font-mono text-zinc-400">
                  {currentSlideIndex + 1} de {slides.length}
                </span>
                <button
                  onClick={() =>
                    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))
                  }
                  disabled={currentSlideIndex === slides.length - 1}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-mono font-bold text-white border border-white/10 cursor-pointer"
                >
                  Próximo →
                </button>
              </div>

              {/* PAINEL COLAPSÁVEL: LEGENDA DO POST (LINKEDIN / INSTAGRAM) */}
              <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden transition-all mt-4">
                <div className="p-3.5 flex items-center justify-between gap-3 bg-white/[0.03] border-b border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsCaptionOpen((prev) => !prev)}
                    className="flex items-center gap-2 text-left cursor-pointer flex-1"
                  >
                    <span className="text-base select-none">📝</span>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Legenda do Post (LinkedIn / Instagram)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {isCaptionOpen ? "▲ Recolher" : "▼ Expandir"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(postCaption);
                      setHasCopiedCaption(true);
                      setTimeout(() => setHasCopiedCaption(false), 2500);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      hasCopiedCaption
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
                    }`}
                  >
                    <span>{hasCopiedCaption ? "✓" : "📋"}</span>
                    <span>{hasCopiedCaption ? "Copiado!" : "Copiar Legenda"}</span>
                  </button>
                </div>

                {isCaptionOpen && (
                  <div className="p-4 space-y-3 animate-in fade-in duration-200">
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      Texto persuasivo completo gerado para acompanhar a publicação. Edite livremente ou copie para o clipboard com 1 clique.
                    </p>

                    <textarea
                      rows={6}
                      value={postCaption}
                      onChange={(e) => setPostCaption(e.target.value)}
                      placeholder="Cole ou redija aqui a legenda do post..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-zinc-200 focus:outline-none focus:border-white/30 leading-relaxed font-mono"
                    />

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                      <span>{postCaption.length} caracteres • {postCaption.split(/\s+/).filter(Boolean).length} palavras</span>
                      <span className="text-cyan-400">
                        {(postCaption.match(/#\w+/g) || []).length} hashtags
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* PAINEL TÁTICO: GATILHO DE INBOUND (AUTOMAÇÃO DE CAPTURA) */}
              <div className="rounded-2xl bg-black/60 border border-emerald-500/25 p-4 md:p-5 space-y-4 shadow-xl relative overflow-hidden backdrop-blur-xl mt-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg select-none p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      🧲
                    </span>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Gatilho de Inbound (Automação)</span>
                        <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Loop Ativo
                        </span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        Conexão direta com esteira de vendas B2B
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const endpointUrl = typeof window !== "undefined"
                        ? `${window.location.origin}/api/crm/inbound-webhook`
                        : "/api/crm/inbound-webhook";
                      navigator.clipboard.writeText(endpointUrl);
                      setHasCopiedWebhookUrl(true);
                      setTimeout(() => setHasCopiedWebhookUrl(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-zinc-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Copiar URL do Webhook para ManyChat / n8n / Meta"
                  >
                    <span>{hasCopiedWebhookUrl ? "✓" : "🔗"}</span>
                    <span>{hasCopiedWebhookUrl ? "URL Copiada!" : "URL Webhook"}</span>
                  </button>
                </div>

                {/* 1. Input: Palavra-Chave de Captura */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Palavra-Chave de Captura
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Disparo no comentário
                    </span>
                  </div>
                  <input
                    type="text"
                    value={inboundKeyword}
                    onChange={(e) => setInboundKeyword(e.target.value.toUpperCase())}
                    placeholder="Ex: SCRIPT, PDF, CRM, AUDITORIA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs uppercase tracking-widest focus:outline-none focus:border-emerald-400"
                  />

                  {/* Quick Chips de Palavra-Chave */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["SCRIPT", "PDF", "PLAYBOOK", "CRM", "AUDITORIA"].map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => setInboundKeyword(kw)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer border ${
                          inboundKeyword === kw
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                            : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                        }`}
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Seletor Visual: Destino no Kanban */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Destino do Lead no Kanban
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Tag: 🏷️ Capturado via Estúdio
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: "Inbound / Para Qualificação", desc: "Primeira coluna (Filtro SDR)" },
                      { id: "Novos Leads", desc: "Esteira padrão de entrada" },
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setInboundDestination(col.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          inboundDestination === col.id
                            ? "bg-emerald-500/15 border-emerald-500/40 text-white shadow-sm"
                            : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-mono font-bold leading-tight">
                            {col.id}
                          </span>
                          {inboundDestination === col.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {col.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumo da Automação n8n/ManyChat */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[10px] font-mono text-zinc-400 leading-relaxed space-y-1">
                  <div className="text-zinc-300 font-bold flex items-center gap-1.5">
                    <span>⚡ Como funciona o Loop:</span>
                  </div>
                  <p>
                    O carrossel convida: <span className="text-white font-bold">&quot;Comente {inboundKeyword}&quot;</span>. Quando o seguidor comenta no Instagram ou LinkedIn, seu fluxo no n8n dispara uma DM e envia um POST para <span className="text-emerald-300 font-bold">/api/crm/inbound-webhook</span>, criando o card em <span className="text-white font-bold">&quot;{inboundDestination}&quot;</span> com a tag <span className="text-emerald-400 font-bold">🏷️ Capturado via Estúdio</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* COLUNA DIREITA: VISUALIZADOR DA LÂMINA & EXPORTAÇÕES               */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* ================================================================ */}
          {/* RADAR DE INTELIGÊNCIA COMPETITIVA // INSTAGRAM COUNTER-POSITIONING */}
          {/* ================================================================ */}
          {competitorInsight && (
            <div className="w-full mb-6 p-4 md:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black/80 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                  <span className="text-xs font-mono font-black text-cyan-300 tracking-wider uppercase">
                    📡 Radar Competitivo de Instagram // Contra-Posicionamento
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {competitorInsight.suggestedLayout && designConfig.layout !== competitorInsight.suggestedLayout && (
                    <button
                      type="button"
                      onClick={() => updateDesignConfig({ layout: competitorInsight.suggestedLayout as SlideLayout })}
                      className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Aplicar Layout Recomendado ({competitorInsight.suggestedLayout})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCompetitorRadar(!showCompetitorRadar)}
                    className="text-zinc-400 hover:text-white text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 transition-colors cursor-pointer"
                  >
                    {showCompetitorRadar ? "Recolher ▲" : "Expandir ▼"}
                  </button>
                </div>
              </div>

              {showCompetitorRadar && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3.5 text-xs font-mono">
                  {/* Card 1: O que a concorrência faz */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-red-500/25 space-y-1.5 shadow-md">
                    <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1.5">
                      <span>⚠️</span> Clichê dos Concorrentes no Feed:
                    </span>
                    <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                      {competitorInsight.competitorCliché}
                    </p>
                  </div>

                  {/* Card 2: Como nos contra-posicionamos */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/25 space-y-1.5 shadow-md">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>🎯</span> Nosso Contra-Posicionamento:
                    </span>
                    <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                      {competitorInsight.ourDifferentiator}
                    </p>
                  </div>

                  {/* Card 3: Estética e Quebra de Padrão */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/25 space-y-1.5 shadow-md">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                      <span>🎨</span> Estética Visual Recomendada:
                    </span>
                    <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                      <span className="font-bold text-white uppercase">{competitorInsight.suggestedLayout || designConfig.layout}</span>: {competitorInsight.layoutRationale}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BARRA SUPERIOR DO VISUALIZADOR: SELETOR DE TEMAS & PROPORÇÃO */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 bg-black/40 border border-white/10 p-3 rounded-2xl backdrop-blur-xl">
            {/* SELETOR VISUAL DE TEMAS (THEME ENGINE) */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
              {(
                [
                  { id: "dark-industrial", label: "Dark Industrial" },
                  { id: "light-minimal", label: "Light Minimal" },
                  { id: "neon-accent", label: "Neon Accent" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyGlobalTheme(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    designConfig.theme === t.id
                      ? "bg-white text-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* SELETOR DE PROPORÇÃO (ASPECT RATIO) */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => updateDesignConfig({ aspectRatio: "1:1" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  designConfig.aspectRatio === "1:1"
                    ? "bg-white text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                1:1 Quadrado
              </button>
              <button
                onClick={() => updateDesignConfig({ aspectRatio: "4:5" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  designConfig.aspectRatio === "4:5"
                    ? "bg-white text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                4:5 Retrato
              </button>
              <button
                onClick={() => updateDesignConfig({ aspectRatio: "9:16" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  designConfig.aspectRatio === "9:16"
                    ? "bg-white text-black shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                9:16 Stories
              </button>
            </div>

            {/* CONTROLES RÁPIDOS DE NAVEGAÇÃO */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center justify-center font-bold border border-white/10 cursor-pointer"
              >
                ‹
              </button>
              <span className="text-xs font-mono text-zinc-300 font-bold px-1">
                {currentSlideIndex + 1}/{slides.length}
              </span>
              <button
                onClick={() =>
                  setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))
                }
                disabled={currentSlideIndex === slides.length - 1}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center justify-center font-bold border border-white/10 cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>

          {/* CANVAS CONTAINER DE VISUALIZAÇÃO INTERATIVA */}
          <div className="w-full flex items-center justify-center p-3 md:p-6 rounded-3xl bg-black/60 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="w-full flex items-center justify-center transition-all duration-300">
              <BlackLinkSlidePreview
                slide={
                  (slides && slides.length > 0 && slides[currentSlideIndex]) ||
                  (slides && slides[0]) ||
                  INITIAL_SLIDES[0]
                }
                currentSlide={Math.max(1, currentSlideIndex + 1)}
                totalSlides={Math.max(1, slides?.length || 1)}
                config={designConfig}
                canvasId="blacklink-slide-canvas"
                isLoadingAI={isGeneratingAI}
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* CENTRAL DE PUBLICAÇÃO & DISTRIBUIÇÃO B2B (BASE DO CANVAS)         */}
          {/* ================================================================ */}
          <div className="w-full mt-6 p-5 md:p-6 rounded-3xl bg-black/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                    <span>Central de Publicação &amp; Distribuição</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-semibold border border-white/10">
                      Pipeline API v2.0
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Tenant: <span className="text-white font-bold">{tenantName}</span> • Distribuição Multi-Canal
                  </p>
                </div>
              </div>

              {/* Badges de Canais Prontos */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  LinkedIn Ready
                </span>
                <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Meta v20.0
                </span>
              </div>
            </div>

            {/* Ações: Botão Principal Colossal + Downloads Secundários */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* BOTÃO COLOSSAL PRINCIPAL: LANÇAR CAMPANHA (API) */}
              <button
                type="button"
                onClick={() => setShowPublishModal(true)}
                className="group relative flex-1 py-4 px-6 rounded-2xl text-white text-xs md:text-sm font-mono font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 overflow-hidden border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${designConfig.accentColor} 0%, #3b82f6 50%, #1d4ed8 100%)`,
                  boxShadow: `0 8px 30px -5px ${designConfig.accentColor}66`,
                }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <span className="text-base">🚀</span>
                <span className="drop-shadow-sm font-black">Lançar Campanha (API)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/30 border border-white/20 text-white font-bold">
                  Autônomo
                </span>
              </button>

              {/* BOTÕES SECUNDÁRIOS E ELEGANTES */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSinglePng}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold border border-white/15 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  title="Baixar apenas o slide atual em 1080px"
                >
                  <span>⬇ Lâmina Atual</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold border border-white/15 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  title="Baixar todas as lâminas em arquivo ZIP"
                >
                  <span>📦 ZIP</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white/90 hover:bg-white text-black text-xs font-mono font-bold border border-white/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  title="Gerar PDF multi-página pronto para postar como documento no LinkedIn"
                >
                  <span>📄 PDF LinkedIn</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Visual de Exportação em Andamento */}
          {isExporting && (
            <div className="w-full mt-3 p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-200 text-xs font-mono flex items-center justify-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>{exportMessage || "Processando renderização gráfica..."}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL DE GERAÇÃO INTELIGENTE DE IA / ZERO ATRITO & PIPELINE B2B       */}
      {/* ==================================================================== */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#0d0e12] border border-white/15 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🪄</span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Gerador de Carrosséis Estratégicos
                </h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-zinc-400 hover:text-white text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Eliminamos o atrito técnico: defina o Tema e o Público-Alvo. O pipeline corporativo processa o conteúdo em segundo plano e renderiza skeletons em tempo real na tela.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 block mb-1.5 font-bold">
                  1. Tema Central ou Tese B2B
                </label>
                <input
                  type="text"
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                  placeholder="Ex: Playbook para encurtar o ciclo de vendas corporativas..."
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    2. Público-Alvo / ICP
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">Chips Rápidos</span>
                </div>
                <input
                  type="text"
                  value={aiAudience}
                  onChange={(e) => setAiAudience(e.target.value)}
                  placeholder="Ex: Fundadores de SaaS, Diretores de Vendas (CRO)..."
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-white/30"
                />

                {/* Quick Chips para ICP */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "Fundadores de SaaS",
                    "Diretores Comerciais (CRO)",
                    "Agências & Consultorias",
                    "FinTechs & Enterprise",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAiAudience(chip)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                        aiAudience === chip
                          ? "bg-white text-black border-white font-bold"
                          : "bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Instagram / Concorrentes de Referência */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    3. Instagram / Concorrentes de Referência
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">Análise de Feed</span>
                </div>
                <input
                  type="text"
                  value={aiCompetitors}
                  onChange={(e) => setAiCompetitors(e.target.value)}
                  placeholder="Ex: @concorrente_a, @concorrente_b ou perfis tradicionais do nicho..."
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                />

                {/* Quick Chips para Concorrentes */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "@concorrentes_do_feed",
                    "Perfis Tradicionais de CRM",
                    "Infoprodutores Genéricos",
                    "Agências Tradicionais",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAiCompetitors(chip)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                        aiCompetitors === chip
                          ? "bg-cyan-400 text-black border-cyan-400 font-bold"
                          : "bg-white/5 text-zinc-400 border-white/10 hover:text-cyan-300 hover:bg-white/10"
                      }`}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Ângulo de Contra-Posicionamento (Quebra de Padrão) */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 block mb-2 font-bold">
                  4. Ângulo de Contra-Posicionamento no Feed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "anti-consenso",
                      icon: "⚡",
                      title: "Anti-Consenso",
                      desc: "Desmascara clichês e dicas rasas",
                    },
                    {
                      id: "c-level",
                      icon: "👔",
                      title: "C-Level & Métricas",
                      desc: "Autoridade densa com dados reais",
                    },
                    {
                      id: "pragmatico",
                      icon: "🎯",
                      title: "Pragmático",
                      desc: "Execução cirúrgica sem rodeios",
                    },
                    {
                      id: "disruptivo",
                      icon: "🔮",
                      title: "Disruptivo",
                      desc: "Posiciona concorrentes como obsoletos",
                    },
                  ].map((strategy) => (
                    <button
                      key={strategy.id}
                      type="button"
                      onClick={() => setAiPositioning(strategy.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        aiPositioning === strategy.id
                          ? "bg-white/15 border-white text-white shadow-lg shadow-white/5"
                          : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{strategy.icon}</span>
                        <span className={aiPositioning === strategy.id ? "text-white" : "text-zinc-300"}>
                          {strategy.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 leading-tight">
                        {strategy.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleGenerateWithAI}
                disabled={!aiTheme.trim()}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>⚡ Disparar em Background</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL DE LANÇAMENTO DE CAMPANHA (FASE 3: OAUTH SOCIAL EM BREVE)      */}
      {/* ==================================================================== */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0c0d12] border border-white/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-2xl bg-white/5 border border-white/10">🚀</span>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Lançar Campanha (API de Distribuição)
                  </h3>
                  <span className="text-xs font-mono text-cyan-400">
                    Fase 3 • Orquestração Multi-Canal
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center font-mono cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Aviso de Integração Social em Breve */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Integração Social em Breve (Fase 3)</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                A infraestrutura de empacotamento paramétrico está concluída. Na Fase 3, ao plugar os tokens OAuth corporativos do LinkedIn e da Meta, este botão disparará a publicação automática sem necessidade de download manual.
              </p>
            </div>

            {/* Resumo do Ativo a ser Distribuído */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-mono text-xs">
              <div className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                Dossiê da Campanha Pronta
              </div>
              <div className="grid grid-cols-2 gap-3 text-zinc-300">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-500 text-[10px] block">Tenant Conectado:</span>
                  <span className="text-white font-bold truncate block">{tenantName}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-500 text-[10px] block">Lâminas do Carrossel:</span>
                  <span className="text-white font-bold block">{slides.length} lâminas ({designConfig.aspectRatio})</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-500 text-[10px] block">Legenda (Post Copy):</span>
                  <span className="text-emerald-400 font-bold block">✓ Pronta ({postCaption.length} carac.)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-zinc-500 text-[10px] block">Gatilho de Inbound:</span>
                  <span className="text-emerald-300 font-bold block">&quot;{inboundKeyword}&quot; → {inboundDestination}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 col-span-2">
                  <span className="text-zinc-500 text-[10px] block">Endpoint do Webhook (POST):</span>
                  <span className="text-cyan-400 font-mono text-[11px] block truncate">
                    {typeof window !== "undefined" ? `${window.location.origin}/api/crm/inbound-webhook` : "/api/crm/inbound-webhook"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Imediatas: Download, Cópia de Legenda ou JSON para Automação n8n */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const campaignPayload = {
                    tenantId,
                    tenantName,
                    campaignOrigin: "Black Link Carousel Studio",
                    inboundKeyword,
                    inboundDestination,
                    inboundWebhookUrl: typeof window !== "undefined"
                      ? `${window.location.origin}/api/crm/inbound-webhook`
                      : "/api/crm/inbound-webhook",
                    aspectRatio: designConfig.aspectRatio,
                    totalSlides: slides.length,
                    postCaption,
                    slides,
                  };
                  navigator.clipboard.writeText(JSON.stringify(campaignPayload, null, 2));
                  setHasCopiedCampaignJson(true);
                  setTimeout(() => setHasCopiedCampaignJson(false), 2000);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Copia o JSON estruturado para plugar no n8n ou ManyChat"
              >
                <span>{hasCopiedCampaignJson ? "✓ Payload Copiado!" : "🧲 Copiar JSON (n8n/ManyChat)"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(postCaption);
                  setHasCopiedCaption(true);
                  setTimeout(() => setHasCopiedCaption(false), 2000);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{hasCopiedCaption ? "✓ Legenda Copiada!" : "📋 Copiar Legenda"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  handleDownloadPdf();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Baixar PDF para Postar Agora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL DE VISOR DE SMARTPHONE INSTAGRAM (PRÉVIA RÁPIDA NO ESTÚDIO)   */}
      {/* ==================================================================== */}
      {showStudioVisorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0C0C0E] border border-white/20 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[95vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-white/10 text-base">📱</span>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    Visor de Instagram • Simulador
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Prévia em tempo real das artes ativas
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStudioVisorModal(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center font-mono cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Mockup iPhone */}
            <div className="relative rounded-[38px] border-[4px] border-[#2A2B30] bg-black p-2.5 shadow-2xl overflow-hidden space-y-3">
              {/* Dynamic Island & Status Bar */}
              <div className="flex items-center justify-between px-3 text-[10px] font-semibold text-white">
                <span>9:41</span>
                <div className="w-20 h-4 bg-black rounded-full border border-white/10 mx-auto" />
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Instagram Top Bar */}
              <div className="flex items-center justify-between px-2 pt-1 text-white">
                <span className="font-serif italic font-bold text-sm tracking-tight">Instagram</span>
                <div className="flex items-center gap-2 text-xs">
                  <span>♡</span>
                  <span>✉</span>
                </div>
              </div>

              {/* Post Header */}
              <div className="flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                      {designConfig.authorName ? designConfig.authorName.slice(0, 2).toUpperCase() : "BL"}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white text-[11px]">
                        {designConfig.authorHandle?.replace(/^@/, "") || "blacklink.b2b"}
                      </span>
                      <span className="text-[9px] text-sky-400 font-bold">✓</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 block -mt-0.5">Áudio Original</span>
                  </div>
                </div>
                <span className="text-zinc-400">•••</span>
              </div>

              {/* Slide Display com aspect ratio */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 border border-white/5 flex items-center justify-center">
                <div className="w-full h-full scale-[0.32] origin-top-left absolute top-0 left-0" style={{ width: "1080px", height: "1080px" }}>
                  <BlackLinkSlidePreview
                    slide={slides[studioVisorSlideIdx] || slides[0]}
                    currentSlide={studioVisorSlideIdx + 1}
                    totalSlides={slides.length}
                    config={designConfig}
                    canvasId="studio-visor-preview"
                    scaleMode="manual"
                  />
                </div>

                {/* Setas de navegação no visor */}
                {studioVisorSlideIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => setStudioVisorSlideIdx(studioVisorSlideIdx - 1)}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-1 text-white border border-white/10 z-20 cursor-pointer"
                  >
                    ‹
                  </button>
                )}
                {studioVisorSlideIdx < slides.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setStudioVisorSlideIdx(studioVisorSlideIdx + 1)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-1 text-white border border-white/10 z-20 cursor-pointer"
                  >
                    ›
                  </button>
                )}

                {/* Pill contador */}
                <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-mono font-bold text-white z-20">
                  {studioVisorSlideIdx + 1}/{slides.length}
                </div>
              </div>

              {/* Instagram Action Row */}
              <div className="flex items-center justify-between px-2 text-white">
                <div className="flex items-center gap-3 text-sm">
                  <span>♡</span>
                  <span>💬</span>
                  <span>↗</span>
                </div>
                <div className="flex items-center gap-1">
                  {slides.map((_, dot) => (
                    <span
                      key={dot}
                      className={`h-1 rounded-full transition-all ${
                        dot === studioVisorSlideIdx ? "w-2.5 bg-sky-400" : "w-1 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">☖</span>
              </div>

              {/* Caption Preview */}
              <div className="px-2 text-[10px] text-zinc-300 line-clamp-3">
                <strong className="text-white mr-1">
                  {designConfig.authorHandle?.replace(/^@/, "") || "blacklink.b2b"}
                </strong>
                <span>{postCaption}</span>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowStudioVisorModal(false);
                  handleApproveArtAndGoToPreviews();
                }}
                className="w-full flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-heading font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>✓ Aprovar Arte &amp; Ir para Prévias ➔</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStudioVisorModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Voltar ao Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONTAINER OFFSCREEN DE ALTA RESOLUÇÃO (PARA ZIP & PDF NATIVO)        */}
      {/* ==================================================================== */}
      <div
        ref={offscreenContainerRef}
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 overflow-hidden"
      >
        {slides.map((s, idx) => (
          <div
            key={idx}
            style={{
              width: "1080px",
              height:
                designConfig.aspectRatio === "9:16"
                  ? "1920px"
                  : designConfig.aspectRatio === "4:5"
                  ? "1350px"
                  : "1080px",
            }}
          >
            <BlackLinkSlidePreview
              slide={s}
              currentSlide={idx + 1}
              totalSlides={slides.length}
              config={designConfig}
              canvasId={`offscreen-slide-${idx}`}
              scaleMode="export"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
