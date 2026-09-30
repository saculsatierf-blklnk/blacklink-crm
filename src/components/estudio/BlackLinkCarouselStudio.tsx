"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Loader2,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
  Type,
  Upload,
  User,
  Wand2,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  BlackLinkSlidePreview,
  type SlideTheme,
  type SlideLayout,
  type SlideFont,
  type AspectRatio,
  type SlidePattern,
  type SlideDesignConfig,
  isLightColor,
} from "./BlackLinkSlidePreview";

interface SlideData {
  slideNumber: number;
  headline: string;
  bodyText: string;
}

const BRAND_STORAGE_KEY = "blacklink_studio_brand_memory";

const B2B_PALETTES = [
  {
    name: "Midnight Blue",
    desc: "Tech & Enterprise",
    bgColor: "#0a1128",
    accentColor: "#38bdf8",
  },
  {
    name: "Forest Green",
    desc: "Finanças & ESG",
    bgColor: "#061a14",
    accentColor: "#34d399",
  },
  {
    name: "Executive Crimson",
    desc: "Autoridade & Luxo",
    bgColor: "#18080a",
    accentColor: "#fb7185",
  },
  {
    name: "Monochrome Dark",
    desc: "Brutalista Preto",
    bgColor: "#050505",
    accentColor: "#ffffff",
  },
  {
    name: "Executive Clean",
    desc: "Minimalista Claro",
    bgColor: "#f8f9fa",
    accentColor: "#0f172a",
  },
  {
    name: "Cyber Neon",
    desc: "Alta Conversão",
    bgColor: "#000000",
    accentColor: "#22d3ee",
  },
];

const PATTERN_OPTIONS: {
  id: SlidePattern;
  name: string;
  desc: string;
  badge: string;
}[] = [
  {
    id: "solid-mesh",
    name: "Solid / Mesh",
    desc: "Gradiente radial suave",
    badge: "Oficial",
  },
  {
    id: "dots",
    name: "Dots",
    desc: "Padrão pontilhado técnico",
    badge: "Clean",
  },
  {
    id: "grid",
    name: "Grid",
    desc: "Grade técnica industrial",
    badge: "Tech",
  },
  {
    id: "noise",
    name: "Noise / Grain",
    desc: "Textura impressa editorial",
    badge: "Luxo",
  },
];

const LAYOUT_OPTIONS: {
  id: SlideLayout;
  title: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: "brutalista",
    title: "Brutalista",
    desc: "Padrão B2B colossal",
    icon: "🏛️",
  },
  {
    id: "minimal",
    title: "Minimalista",
    desc: "Centralizado & Luxo",
    icon: "✨",
  },
  {
    id: "tweet",
    title: "Thread / 𝕏",
    desc: "Simulação do Twitter",
    icon: "💬",
  },
  {
    id: "split",
    title: "Split (50/50)",
    desc: "Texto + Imagem Total",
    icon: "🌗",
  },
  {
    id: "terminal",
    title: "Terminal Tech",
    desc: "macOS Dev / Código",
    icon: "💻",
  },
  {
    id: "glass-floating",
    title: "Glass Floating",
    desc: "Card 3D em Profundidade",
    icon: "🧊",
  },
];

export function BlackLinkCarouselStudio() {
  // Wizard de 2 etapas isoladas
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Motor de Temas
  const [selectedTheme, setSelectedTheme] = useState("dark-industrial");

  // Abas do Painel de Edição (Coluna Esquerda)
  const [activeEditorTab, setActiveEditorTab] = useState<"conteudo" | "design">(
    "conteudo"
  );

  // Painel de Design Paramétrico (Nível Figma / Taplio)
  const [designConfig, setDesignConfig] = useState<SlideDesignConfig>({
    layout: "brutalista",
    font: "space-grotesk",
    aspectRatio: "1:1",
    pattern: "solid-mesh",
    fontSizeScale: 100,
    bgColor: "#050505",
    accentColor: "#10b981",
    authorName: "Lucas Satierf",
    authorHandle: "@lucasblacklink",
    authorAvatar: "",
    bgImage: "",
    bgOpacity: 25,
  });

  // Persistência de Marca (Brand Memory via LocalStorage): Hidratação Inicial no Mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(BRAND_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDesignConfig((prev) => ({
          ...prev,
          bgColor: parsed.bgColor !== undefined ? parsed.bgColor : prev.bgColor,
          accentColor:
            parsed.accentColor !== undefined ? parsed.accentColor : prev.accentColor,
          authorAvatar:
            parsed.authorAvatar !== undefined ? parsed.authorAvatar : prev.authorAvatar,
          authorName:
            parsed.authorName !== undefined ? parsed.authorName : prev.authorName,
          authorHandle:
            parsed.authorHandle !== undefined ? parsed.authorHandle : prev.authorHandle,
          pattern: parsed.pattern !== undefined ? parsed.pattern : prev.pattern,
          fontSizeScale:
            parsed.fontSizeScale !== undefined ? parsed.fontSizeScale : prev.fontSizeScale,
          layout: parsed.layout !== undefined ? parsed.layout : prev.layout,
          font: parsed.font !== undefined ? parsed.font : prev.font,
          aspectRatio:
            parsed.aspectRatio !== undefined ? parsed.aspectRatio : prev.aspectRatio,
        }));
      }
    } catch (err) {
      console.error("Falha ao recuperar memória de marca do localStorage:", err);
    }
  }, []);

  // Persistência Imediata de Marca no LocalStorage sempre que houver alteração
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const memory = {
        bgColor: designConfig.bgColor,
        accentColor: designConfig.accentColor,
        authorAvatar: designConfig.authorAvatar,
        authorName: designConfig.authorName,
        authorHandle: designConfig.authorHandle,
        pattern: designConfig.pattern,
        fontSizeScale: designConfig.fontSizeScale,
        layout: designConfig.layout,
        font: designConfig.font,
        aspectRatio: designConfig.aspectRatio,
      };
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(memory));
    } catch (err) {
      console.error("Falha ao salvar memória de marca no localStorage:", err);
    }
  }, [
    designConfig.bgColor,
    designConfig.accentColor,
    designConfig.authorAvatar,
    designConfig.authorName,
    designConfig.authorHandle,
    designConfig.pattern,
    designConfig.fontSizeScale,
    designConfig.layout,
    designConfig.font,
    designConfig.aspectRatio,
  ]);

  // Form states (Etapa 1: Briefing Direto)
  const [theme, setTheme] = useState("");
  const [copyAngle, setCopyAngle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Slides gerados (Etapa 2: Split-View)
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);

  // Estados de exportação
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Referências para inputs de arquivos ocultos
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  // Alternância sincronizada de tema clássico
  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    if (themeId === "dark-industrial") {
      setDesignConfig((prev) => ({
        ...prev,
        bgColor: "#050505",
        accentColor: "#10b981",
      }));
    } else if (themeId === "light-minimal") {
      setDesignConfig((prev) => ({
        ...prev,
        bgColor: "#fafafa",
        accentColor: "#09090b",
      }));
    } else if (themeId === "neon-accent") {
      setDesignConfig((prev) => ({
        ...prev,
        bgColor: "#000000",
        accentColor: "#34d399",
      }));
    }
  };

  // Upload e conversão em base64 da foto do autor
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDesignConfig((prev) => ({
            ...prev,
            authorAvatar: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload e conversão em base64 da imagem de fundo
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDesignConfig((prev) => ({
            ...prev,
            bgImage: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Disparo de geração (conecta com a API /api/marketing/generate)
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: theme.trim(),
          nicheValueProposition:
            copyAngle.trim() || "Inteligência comercial e conversão B2B",
          format: "carousel",
        }),
      });

      if (!res.ok) {
        throw new Error("Falha ao se comunicar com o motor de geração de criativos.");
      }

      const data = await res.json();

      if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
        setSlides(data.slides);
      } else {
        // Fallback estruturado de alta fidelidade
        setSlides([
          {
            slideNumber: 1,
            headline: data.hookHeadline || `Como Dominar **${theme}** sem Perder Margem`,
            bodyText:
              "Por que operações corporativas travam nos gargalos de esteira e como a **blindagem de pipeline** reduz o ciclo médio pela metade.",
          },
          {
            slideNumber: 2,
            headline: "O Gargalo Oculto da **Esteira B2B**",
            bodyText:
              "Sem radar de proteção territorial e inteligência preditiva, os hunters canibalizam contas e degradam o ticket médio.",
          },
          {
            slideNumber: 3,
            headline: "A Regra de Ouro da **Cadência**",
            bodyText:
              "Follow-ups orquestrados mantêm **presença executiva** sem criar fricção com o decisor de compra.",
          },
          {
            slideNumber: 4,
            headline: "Passagem de Bastão **Blindada**",
            bodyText:
              "A transição entre pré-vendas e Closer deve preservar 100% das notas e o histórico de interações do lead.",
          },
          {
            slideNumber: 5,
            headline: "Pronto para Escalar sua **Operação B2B**?",
            bodyText:
              "Salve este conteúdo para consultar nos próximos fechamentos e compartilhe com sua diretoria comercial para blindar a esteira.",
          },
        ]);
      }

      setActiveSlideIndex(0);
      setCurrentStep(2);
    } catch (err: unknown) {
      console.error("Erro na geração do carrossel Black Link:", err);
      setGenerationError(
        "Não foi possível processar a geração no momento. Tente novamente em instantes."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const updateActiveSlide = (field: "headline" | "bodyText", value: string) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, [field]: value } : s))
    );
  };

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const handleCopyJson = () => {
    const payload = JSON.stringify(
      {
        theme,
        copyAngle,
        selectedTheme,
        designConfig,
        slides,
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  // Exportação física em ZIP (Imagens em 1080x1080 ou 1080x1350)
  const handleDownloadZip = async () => {
    if (slides.length === 0 || isExportingZip || isExportingPdf) return;

    setIsExportingZip(true);
    setExportFeedback("Capturando lâminas em alta resolução...");

    try {
      const isPortrait = designConfig.aspectRatio === "4:5";
      const slideWidth = 1080;
      const slideHeight = isPortrait ? 1350 : 1080;
      const zip = new JSZip();

      for (let i = 0; i < slides.length; i++) {
        setExportFeedback(`Capturando lâmina ${i + 1} de ${slides.length}...`);
        const element = document.getElementById(`export-slide-node-${i}`);
        if (element) {
          const dataUrl = await toPng(element, {
            width: slideWidth,
            height: slideHeight,
            pixelRatio: 1,
            cacheBust: true,
          });

          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          const slideNumberStr = String(i + 1).padStart(2, "0");
          zip.file(`slide-${slideNumberStr}.png`, base64Data, { base64: true });
        }
      }

      setExportFeedback("Compactando arquivo ZIP...");
      const zipBlob = await zip.generateAsync({ type: "blob" });

      const safeThemeName = theme
        ? theme
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .slice(0, 30)
        : "blacklink";

      saveAs(zipBlob, `carrossel-${safeThemeName}.zip`);
      setExportFeedback("Download ZIP concluído com sucesso!");
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err: unknown) {
      console.error("Falha ao exportar carrossel em ZIP:", err);
      setExportFeedback("Erro ao exportar ZIP. Tente novamente.");
      setTimeout(() => setExportFeedback(null), 4000);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Exportação nativa para LinkedIn (Documento PDF Multi-Páginas)
  const handleDownloadPdf = async () => {
    if (slides.length === 0 || isExportingZip || isExportingPdf) return;

    setIsExportingPdf(true);
    setExportFeedback("Iniciando conversão para LinkedIn (PDF)...");

    try {
      const isPortrait = designConfig.aspectRatio === "4:5";
      const slideWidth = 1080;
      const slideHeight = isPortrait ? 1350 : 1080;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [slideWidth, slideHeight],
        hotfixes: ["px_scaling"],
      });

      for (let i = 0; i < slides.length; i++) {
        setExportFeedback(`Renderizando lâmina ${i + 1} de ${slides.length} no PDF...`);
        const element = document.getElementById(`export-slide-node-${i}`);
        if (element) {
          const dataUrl = await toPng(element, {
            width: slideWidth,
            height: slideHeight,
            pixelRatio: 1,
            cacheBust: true,
          });

          if (i > 0) {
            pdf.addPage([slideWidth, slideHeight], "portrait");
          }
          pdf.addImage(dataUrl, "PNG", 0, 0, slideWidth, slideHeight, undefined, "FAST");
        }
      }

      setExportFeedback("Finalizando documento PDF do LinkedIn...");
      const safeThemeName = theme
        ? theme
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .slice(0, 30)
        : "blacklink";

      pdf.save(`carrossel-${safeThemeName}-linkedin.pdf`);
      setExportFeedback("PDF para LinkedIn baixado com sucesso!");
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err: unknown) {
      console.error("Falha ao exportar PDF para LinkedIn:", err);
      setExportFeedback("Erro ao exportar PDF. Tente novamente.");
      setTimeout(() => setExportFeedback(null), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const currentSlideData = slides[activeSlideIndex] || {
    slideNumber: 1,
    headline: theme ? `Como Dominar **${theme}**` : "Como Dominar **Contas Enterprise**",
    bodyText: copyAngle || "A estrutura executiva de alta densidade B2B.",
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* NÓS DOM ESCONDIDOS PARA CAPTURA EM ALTA RESOLUÇÃO (ZIP & PDF LINKEDIN) */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 overflow-hidden"
        aria-hidden="true"
      >
        {slides.map((s, idx) => (
          <div
            key={idx}
            id={`export-slide-node-${idx}`}
            style={{
              width: "1080px",
              height: designConfig.aspectRatio === "4:5" ? "1350px" : "1080px",
              minWidth: "1080px",
              minHeight: designConfig.aspectRatio === "4:5" ? "1350px" : "1080px",
            }}
            className="bg-black"
          >
            <BlackLinkSlidePreview
              headline={s.headline}
              bodyText={s.bodyText}
              currentSlide={idx + 1}
              totalSlides={slides.length}
              theme={selectedTheme}
              designConfig={designConfig}
              isExportMode={true}
            />
          </div>
        ))}
      </div>

      {/* Top Banner de Identificação do Sandbox */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08] pb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-medium tracking-tight text-white">
              Estúdio Black Link
            </h1>
            <span className="rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1 text-[10px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Motor Nível Figma / Taplio
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-2xl">
            Laboratório brutalista de alta fidelidade com texturas paramétricas (Grid/Dots/Noise), contraste YIQ inteligente, layouts assimétricos e exportação nativa para LinkedIn.
          </p>
        </div>

        {/* Indicador de Etapa Atual */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              currentStep === 1
                ? "border-white/30 bg-white/[0.1] text-white font-semibold"
                : "border-white/10 bg-black/20 text-zinc-400"
            }`}
          >
            <span>01. Briefing Direto</span>
          </div>

          <span className="text-zinc-600 font-mono">→</span>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              currentStep === 2
                ? "border-white/30 bg-white/[0.1] text-white font-semibold"
                : "border-white/10 bg-black/20 text-zinc-400"
            }`}
          >
            <span>02. Split-View Studio</span>
          </div>
        </div>
      </div>

      {/* ETAPA 1: O BRIEFING DIRETO (2 CAMPOS APENAS) */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-8 lg:p-10">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-white">
                  Briefing Direto
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Defina o tema e a diretriz central. A IA estruturará as 5 lâminas no formato institucional.
                </p>
              </div>
              <Wand2 className="h-5 w-5 text-zinc-400" />
            </div>

            {generationError && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-xs text-red-300 font-mono">
                {generationError}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Campo 1: Tema Principal */}
              <div>
                <label
                  htmlFor="studioTheme"
                  className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3"
                >
                  Tema Principal <span className="text-white">*</span>
                </label>
                <input
                  id="studioTheme"
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Como Dominar Contas Enterprise sem Perder Margem Operacional"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>

              {/* Campo 2: Diretriz de Copy / Ângulo */}
              <div>
                <label
                  htmlFor="studioCopyAngle"
                  className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3"
                >
                  Diretriz de Copy / Ângulo <span className="text-zinc-600">(Opcional)</span>
                </label>
                <textarea
                  id="studioCopyAngle"
                  rows={4}
                  value={copyAngle}
                  onChange={(e) => setCopyAngle(e.target.value)}
                  placeholder="Ex: Focar na dor do diretor comercial que perde contas por falta de cadência estruturada e atrito interno entre equipes..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors resize-y leading-relaxed font-sans"
                />
              </div>

              {/* Botão Primário de Disparo */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isGenerating || !theme.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-xs font-semibold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      <span>Gerando Carrossel Black Link...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-black" />
                      <span>Gerar Carrossel Black Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ETAPA 2: O ESTÚDIO SPLIT-VIEW (PAINEL DE DESIGN PARAMÉTRICO NÍVEL FIGMA) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* GRID SPLIT-VIEW (12 COLUNAS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-12">
            {/* COLUNA ESQUERDA (5 Colunas): PAINEL DE INSPEÇÃO [ CONTEÚDO ] & [ DESIGN & ESTILO ] */}
            <div className="col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl space-y-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Header da Coluna */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                  <div>
                    <h2 className="text-2xl font-medium tracking-tight text-white">
                      Inspetor de Design
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Controle paramétrico de texturas, contrastes e layouts.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-mono text-emerald-300 font-semibold">
                    Figma Engine
                  </span>
                </div>

                {/* ABAS VISUAIS: [ CONTEÚDO ] & [ DESIGN & ESTILO ] */}
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveEditorTab("conteudo")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      activeEditorTab === "conteudo"
                        ? "bg-white/15 text-white shadow-lg border border-white/10"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Conteúdo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveEditorTab("design")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      activeEditorTab === "design"
                        ? "bg-white/15 text-white shadow-lg border border-white/10"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>Design &amp; Estilo</span>
                  </button>
                </div>

                {/* ======================================================== */}
                {/* ABA 1: CONTEÚDO (SLIDE A SLIDE) */}
                {/* ======================================================== */}
                {activeEditorTab === "conteudo" && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Seletor de Lâminas (Pills) */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                        Lâmina Selecionada
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {slides.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`flex items-center justify-center h-10 px-4 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                              activeSlideIndex === idx
                                ? "border-white bg-white text-black font-bold shadow-lg"
                                : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            Lâmina {String(idx + 1).padStart(2, "0")}
                            {idx === slides.length - 1 && " (CTA)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Headline do Slide */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="slideHeadlineInput"
                          className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500"
                        >
                          Headline da Lâmina
                        </label>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Use <code className="text-emerald-400">**palavra**</code> para destacar
                        </span>
                      </div>
                      <input
                        id="slideHeadlineInput"
                        type="text"
                        value={currentSlideData.headline}
                        onChange={(e) => updateActiveSlide("headline", e.target.value)}
                        placeholder="Ex: Como Dominar **Contas Enterprise** sem Perder Margem"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Body Text do Slide */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="slideBodyTextInput"
                          className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500"
                        >
                          Texto Explicativo / BodyText
                        </label>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Destaque com <code className="text-emerald-400">**texto**</code>
                        </span>
                      </div>
                      <textarea
                        id="slideBodyTextInput"
                        rows={4}
                        value={currentSlideData.bodyText}
                        onChange={(e) => updateActiveSlide("bodyText", e.target.value)}
                        placeholder="Desenvolva o raciocínio estratégico da lâmina..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none transition-colors resize-y leading-relaxed font-sans"
                      />
                    </div>

                    {/* Navegação entre Lâminas */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Anterior</span>
                      </button>

                      <span className="text-xs font-mono text-zinc-400">
                        {activeSlideIndex + 1} de {slides.length}
                      </span>

                      <button
                        type="button"
                        onClick={handleNextSlide}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                      >
                        <span>Próximo</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Botões Auxiliares */}
                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Novo Briefing</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {hasCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copiar JSON</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* ABA 2: DESIGN & ESTILO (PAINEL DE INSPEÇÃO COMPLETO) */}
                {/* ======================================================== */}
                {activeEditorTab === "design" && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* 1. TEXTURAS DE FUNDO (PATTERNS & NOISE) */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                        Textura de Fundo (Pattern Engine)
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {PATTERN_OPTIONS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              setDesignConfig((prev) => ({
                                ...prev,
                                pattern: p.id,
                              }))
                            }
                            className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              designConfig.pattern === p.id
                                ? "border-white bg-white/10 text-white font-semibold shadow-md"
                                : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-medium">{p.name}</span>
                              <span className="text-[9px] font-mono uppercase text-zinc-500">
                                {p.badge}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 mt-1 leading-snug">
                              {p.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. BIBLIOTECA DE LAYOUTS (FIGMA VARIABILITY) */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                        Estrutura de Layout (6 Opções)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {LAYOUT_OPTIONS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setDesignConfig((prev) => ({
                                ...prev,
                                layout: item.id,
                              }))
                            }
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              designConfig.layout === item.id
                                ? "border-white bg-white/10 text-white font-bold shadow-lg"
                                : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <span className="text-base mb-1">{item.icon}</span>
                            <span className="text-[11px] font-semibold leading-tight">
                              {item.title}
                            </span>
                            <span className="text-[8px] text-zinc-500 mt-0.5 line-clamp-1">
                              {item.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. PALETAS PRONTAS B2B + CONTROLE CUSTOMIZADO */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                        Paletas Corporativas B2B
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {B2B_PALETTES.map((pal) => (
                          <button
                            key={pal.name}
                            type="button"
                            onClick={() =>
                              setDesignConfig((prev) => ({
                                ...prev,
                                bgColor: pal.bgColor,
                                accentColor: pal.accentColor,
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              designConfig.bgColor === pal.bgColor &&
                              designConfig.accentColor === pal.accentColor
                                ? "border-white bg-white/10 text-white shadow-md"
                                : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: pal.bgColor }}
                              />
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: pal.accentColor }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold leading-tight">
                              {pal.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Color Pickers */}
                      <div className="grid grid-cols-2 gap-4 p-3 rounded-xl border border-white/[0.08] bg-black/30">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-1.5">
                            Fundo Custom
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={designConfig.bgColor || "#050505"}
                              onChange={(e) =>
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  bgColor: e.target.value,
                                }))
                              }
                              className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={designConfig.bgColor || "#050505"}
                              onChange={(e) =>
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  bgColor: e.target.value,
                                }))
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-1.5">
                            Destaque (Accent)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={designConfig.accentColor || "#10b981"}
                              onChange={(e) =>
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  accentColor: e.target.value,
                                }))
                              }
                              className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={designConfig.accentColor || "#10b981"}
                              onChange={(e) =>
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  accentColor: e.target.value,
                                }))
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. ESCALA DA TIPOGRAFIA (SLIDER 80% A 150%) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                          Zoom Tipográfico (Ajuste de Quebra)
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-zinc-200 font-bold">
                            {designConfig.fontSizeScale || 100}%
                          </span>
                          {designConfig.fontSizeScale !== 100 && (
                            <button
                              type="button"
                              onClick={() =>
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  fontSizeScale: 100,
                                }))
                              }
                              className="text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer font-mono"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="150"
                        step="5"
                        value={designConfig.fontSizeScale || 100}
                        onChange={(e) =>
                          setDesignConfig((prev) => ({
                            ...prev,
                            fontSizeScale: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-1">
                        <span>80% (Denso)</span>
                        <span>100% (Padrão)</span>
                        <span>150% (Colossal)</span>
                      </div>
                    </div>

                    {/* 5. PROPORÇÃO & DIMENSÃO */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                        Proporção de Tela
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setDesignConfig((prev) => ({
                              ...prev,
                              aspectRatio: "1:1",
                            }))
                          }
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                            designConfig.aspectRatio === "1:1"
                              ? "border-white bg-white/10 text-white font-bold shadow-md"
                              : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span className="text-sm font-semibold">1:1 Quadrado</span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">1080 × 1080 px</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDesignConfig((prev) => ({
                              ...prev,
                              aspectRatio: "4:5",
                            }))
                          }
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                            designConfig.aspectRatio === "4:5"
                              ? "border-white bg-white/10 text-white font-bold shadow-md"
                              : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span className="text-sm font-semibold">4:5 Retrato</span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">LinkedIn / IG (1080 × 1350)</span>
                        </button>
                      </div>
                    </div>

                    {/* 6. MOTOR TIPOGRÁFICO */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                        Família Tipográfica
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          {
                            id: "space-grotesk" as SlideFont,
                            name: "Space Grotesk",
                            desc: "Brutalista / Tech",
                            fontClass: "font-space-grotesk",
                          },
                          {
                            id: "playfair" as SlideFont,
                            name: "Playfair Display",
                            desc: "Editorial / Luxo B2B",
                            fontClass: "font-playfair",
                          },
                          {
                            id: "jakarta" as SlideFont,
                            name: "Plus Jakarta",
                            desc: "Startup Moderna",
                            fontClass: "font-jakarta",
                          },
                          {
                            id: "inter" as SlideFont,
                            name: "Inter",
                            desc: "UI / Tweet Social",
                            fontClass: "font-inter",
                          },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() =>
                              setDesignConfig((prev) => ({
                                ...prev,
                                font: f.id,
                              }))
                            }
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              designConfig.font === f.id
                                ? "border-white bg-white/10 text-white font-semibold shadow-md"
                                : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <div className={`text-xs ${f.fontClass}`}>{f.name}</div>
                            <div className="text-[9px] text-zinc-500 mt-0.5">{f.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 7. UPLOAD DE ASSETS */}
                    <div className="space-y-4 pt-2 border-t border-white/[0.08]">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                            Autor (Foto, Nome e Handle)
                          </label>
                          {designConfig.authorAvatar && (
                            <button
                              type="button"
                              onClick={() =>
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  authorAvatar: "",
                                }))
                              }
                              className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                            >
                              Remover Foto
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer shrink-0"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>{designConfig.authorAvatar ? "Trocar" : "Foto"}</span>
                          </button>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />

                          <input
                            type="text"
                            value={designConfig.authorName || ""}
                            onChange={(e) =>
                              setDesignConfig((prev) => ({
                                ...prev,
                                authorName: e.target.value,
                              }))
                            }
                            placeholder="Nome"
                            className="w-1/2 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                          />

                          <input
                            type="text"
                            value={designConfig.authorHandle || ""}
                            onChange={(e) =>
                              setDesignConfig((prev) => ({
                                ...prev,
                                authorHandle: e.target.value,
                              }))
                            }
                            placeholder="@handle"
                            className="w-1/2 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Imagem de Fundo & Opacidade */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                            Imagem de Fundo &amp; Opacidade
                          </label>
                          {designConfig.bgImage && (
                            <button
                              type="button"
                              onClick={() =>
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  bgImage: "",
                                }))
                              }
                              className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                            >
                              Remover Fundo
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => bgImageInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] cursor-pointer shrink-0"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>{designConfig.bgImage ? "Alterar" : "Upload"}</span>
                          </button>
                          <input
                            ref={bgImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBgImageUpload}
                            className="hidden"
                          />

                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">Opacidade:</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={designConfig.bgOpacity}
                              onChange={(e) =>
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  bgOpacity: Number(e.target.value),
                                }))
                              }
                              className="w-full accent-emerald-400 cursor-pointer"
                            />
                            <span className="text-[10px] font-mono text-zinc-400 shrink-0 w-8 text-right">
                              {designConfig.bgOpacity}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BOTÕES DE EXPORTAÇÃO B2B (ZIP & LINKEDIN PDF) */}
                <div className="pt-6 border-t border-white/[0.08] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isExportingZip || isExportingPdf}
                      onClick={handleDownloadZip}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-4 py-3.5 text-xs font-semibold text-white hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isExportingZip ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Gerando ZIP...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 text-white" />
                          <span>Baixar (ZIP)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isExportingZip || isExportingPdf}
                      onClick={handleDownloadPdf}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-xs font-semibold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                    >
                      {isExportingPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-black" />
                          <span>Criando PDF...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 text-black" />
                          <span>📄 Baixar para LinkedIn (PDF)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {exportFeedback && (
                    <div className="text-center text-[11px] font-mono text-emerald-400 animate-fadeIn pt-1">
                      {exportFeedback}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA (7 Colunas): LÂMINA EM TEMPO REAL COM O MOTOR FIGMA ATIVO */}
            <div className="col-span-12 lg:col-span-7 relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl sticky top-24 space-y-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Header do Preview */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                  <div>
                    <h3 className="text-2xl font-medium tracking-tight text-white">
                      Lâmina em Tempo Real
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Layout: <span className="text-zinc-200 font-mono capitalize">{designConfig.layout}</span> • Textura: <span className="text-zinc-200 font-mono capitalize">{designConfig.pattern}</span> • Zoom: <span className="text-zinc-200 font-mono">{designConfig.fontSizeScale || 100}%</span>.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-mono text-emerald-300 font-semibold">
                    {designConfig.aspectRatio === "4:5" ? "1080x1350 Ready" : "1080x1080 Ready"}
                  </span>
                </div>

                {/* SELETOR DE TEMAS (THEME ENGINE) */}
                <div className="flex items-center justify-between mb-6 bg-black/40 p-2 rounded-2xl border border-white/10 w-fit">
                  {[
                    { id: "dark-industrial", label: "Dark Industrial" },
                    { id: "light-minimal", label: "Light Minimal" },
                    { id: "neon-accent", label: "Neon Accent" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        selectedTheme === t.id
                          ? "bg-white/10 text-white shadow-lg border border-white/10"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Renderizador Oficial Black Link (Canvas Adaptativo) */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl group flex items-center justify-center">
                  <BlackLinkSlidePreview
                    headline={currentSlideData.headline}
                    bodyText={currentSlideData.bodyText}
                    currentSlide={activeSlideIndex + 1}
                    totalSlides={slides.length || 5}
                    theme={selectedTheme}
                    designConfig={designConfig}
                  />

                  {/* Setas de Navegação Sobrepostas */}
                  {slides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        title="Lâmina Anterior"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl z-30"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        title="Próxima Lâmina"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl z-30"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Ações de Download no Rodapé do Preview */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Contraste: {isLightColor(designConfig.bgColor) ? "Claro (Texto Escuro)" : "Escuro (Texto Branco)"} • {designConfig.aspectRatio === "4:5" ? "1080 × 1350 px" : "1080 × 1080 px"}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isExportingZip || isExportingPdf}
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>LinkedIn (PDF)</span>
                    </button>

                    <span className="text-zinc-700">•</span>

                    <button
                      type="button"
                      disabled={isExportingZip || isExportingPdf}
                      onClick={handleDownloadZip}
                      className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>ZIP</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
