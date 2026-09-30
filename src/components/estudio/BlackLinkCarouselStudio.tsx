"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Layers,
  Loader2,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  BlackLinkSlidePreview,
  type SlideTheme,
} from "./BlackLinkSlidePreview";

interface SlideData {
  slideNumber: number;
  headline: string;
  bodyText: string;
}

const THEME_OPTIONS: {
  id: SlideTheme;
  label: string;
  badge: string;
  previewClass: string;
}[] = [
  {
    id: "dark-industrial",
    label: "Dark Industrial",
    badge: "Oficial",
    previewClass: "bg-black border-white/20 text-white",
  },
  {
    id: "light-minimal",
    label: "Light Minimal",
    badge: "Clean B2B",
    previewClass: "bg-zinc-100 border-zinc-300 text-zinc-900",
  },
  {
    id: "neon-accent",
    label: "Neon Accent",
    badge: "Gradiente",
    previewClass: "bg-black border-emerald-500/40 text-emerald-400",
  },
];

export function BlackLinkCarouselStudio() {
  // Wizard de 2 etapas isoladas
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Motor de Temas
  const [selectedTheme, setSelectedTheme] = useState<SlideTheme>("dark-industrial");

  // Form states (Etapa 1: Briefing Direto)
  const [theme, setTheme] = useState("");
  const [copyAngle, setCopyAngle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Slides gerados (Etapa 2: Split-View)
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);

  // Estado de exportação física em ZIP
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

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
            headline: data.hookHeadline || `O Diagnóstico Real de ${theme}`,
            bodyText:
              "Por que 80% das empresas continuam utilizando métodos obsoletos de prospecção e como virar o jogo.",
          },
          {
            slideNumber: 2,
            headline: "O Gargalo Oculto da Esteira",
            bodyText:
              "Sem radar anti-colisão e telemetria única, seus hunters abordam os mesmos decisores e queimam margem.",
          },
          {
            slideNumber: 3,
            headline: "A Regra de Ouro da Cadência",
            bodyText:
              "Follow-ups espaçados e orquestrados para manter presença executiva contínua sem gerar atrito com o cliente.",
          },
          {
            slideNumber: 4,
            headline: "Passagem de Bastão Blindada",
            bodyText:
              "A transição entre o pré-vendas e o Closer não pode perder notas, dores ou histórico de interações.",
          },
          {
            slideNumber: 5,
            headline: "Ação Imediata de Escala",
            bodyText:
              "Implemente a infraestrutura do Black Link CRM e consolide seu domínio em contas enterprise.",
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
        slides,
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  // Exportação física em alta resolução (1080x1080) compactada em ZIP
  const handleDownloadZip = async () => {
    if (slides.length === 0 || isExporting) return;

    setIsExporting(true);
    setExportFeedback("Capturando lâminas em 1080x1080...");

    try {
      const zip = new JSZip();

      // Itera por cada lâmina montada no nó DOM invisível de alta resolução
      for (let i = 0; i < slides.length; i++) {
        const element = document.getElementById(`export-slide-node-${i}`);
        if (element) {
          const dataUrl = await toPng(element, {
            width: 1080,
            height: 1080,
            pixelRatio: 1,
            cacheBust: true,
          });

          // Remove o cabeçalho dataUrl para obter o base64 puro
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
      setExportFeedback("Download concluído com sucesso!");
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err: unknown) {
      console.error("Falha ao exportar carrossel em ZIP:", err);
      setExportFeedback("Erro ao exportar. Tente novamente.");
      setTimeout(() => setExportFeedback(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const currentSlideData = slides[activeSlideIndex] || {
    slideNumber: 1,
    headline: theme || "Como Dominar Contas Enterprise",
    bodyText: copyAngle || "A estrutura executiva de alta densidade B2B.",
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* NÓS DOM ESCONDIDOS PARA CAPTURA EM 1080x1080 VIA HTML-TO-IMAGE */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 overflow-hidden"
        aria-hidden="true"
      >
        {slides.map((s, idx) => (
          <div
            key={idx}
            id={`export-slide-node-${idx}`}
            className="w-[1080px] h-[1080px] min-w-[1080px] min-h-[1080px] bg-black"
          >
            <BlackLinkSlidePreview
              headline={s.headline}
              bodyText={s.bodyText}
              currentSlide={idx + 1}
              totalSlides={slides.length}
              theme={selectedTheme}
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
              Sandbox Isolado • 1:1
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-2xl">
            Laboratório brutalista de alta fidelidade para criação de carrosséis institucionais, alternância de temas estéticos e download em ZIP de alta resolução.
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
            <span>02. Split-View Live</span>
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

      {/* ETAPA 2: O ESTÚDIO SPLIT-VIEW (EDIÇÃO AO VIVO COM MOTOR DE TEMAS E EXPORTAÇÃO) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* BARRA SUPERIOR: MOTOR DE TEMAS (THEME ENGINE) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-4">
            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-medium text-white tracking-tight">
                Design System da Lâmina:
              </span>
            </div>

            {/* Seletor de Temas (Pills) */}
            <div className="flex flex-wrap items-center gap-2">
              {THEME_OPTIONS.map((t) => {
                const isActive = selectedTheme === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-white/40 bg-white/[0.15] text-white font-semibold shadow-sm"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full border ${t.previewClass}`}
                    />
                    <span>{t.label}</span>
                    <span className="text-[9px] font-mono uppercase text-zinc-500">
                      {t.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GRID SPLIT-VIEW (12 COLUNAS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-12">
            {/* COLUNA ESQUERDA (5 Colunas): CONTROLES DE EDIÇÃO DIRETA & DOWNLOAD */}
            <div className="col-span-12 lg:col-span-5 relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl space-y-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Header da Coluna de Edição */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                  <div>
                    <h2 className="text-2xl font-medium tracking-tight text-white">
                      Edição Direta
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Lâmina {activeSlideIndex + 1} de {slides.length} selecionada.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Novo Briefing</span>
                  </button>
                </div>

                {/* Seletor Rápido de Lâminas (Pills) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`h-10 flex-1 min-w-[48px] rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center ${
                        activeSlideIndex === idx
                          ? "border-white/40 bg-white/[0.15] text-white ring-1 ring-white/30 shadow-md"
                          : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      0{idx + 1}
                    </button>
                  ))}
                </div>

                {/* Edição da Headline */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                    Headline da Lâmina {activeSlideIndex + 1}
                  </label>
                  <textarea
                    rows={3}
                    value={currentSlideData.headline}
                    onChange={(e) => updateActiveSlide("headline", e.target.value)}
                    placeholder="Título colossal da lâmina..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors leading-relaxed font-sans resize-y"
                  />
                </div>

                {/* Edição do BodyText */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3">
                    Texto Explicativo / BodyText
                  </label>
                  <textarea
                    rows={4}
                    value={currentSlideData.bodyText}
                    onChange={(e) => updateActiveSlide("bodyText", e.target.value)}
                    placeholder="Texto explicativo denso..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors leading-relaxed font-sans resize-y"
                  />
                </div>

                {/* Controles de Navegação Entre Lâminas */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                    title="Copiar JSON com os textos das lâminas"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 font-mono">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* BOTÃO PRIMÁRIO DE EXPORTAÇÃO FÍSICA (ZIP) */}
                <div className="pt-4 border-t border-white/[0.08] space-y-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleDownloadZip}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white px-6 py-4 text-xs font-semibold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.25)] disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        <span>Processando 1080x1080...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 text-black" />
                        <span>⬇️ Baixar Carrossel (ZIP)</span>
                      </>
                    )}
                  </button>

                  {exportFeedback && (
                    <div className="text-center text-[11px] font-mono text-emerald-400 animate-fadeIn">
                      {exportFeedback}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA (7 Colunas): LÂMINA EM TEMPO REAL COM O TEMA APLICADO */}
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
                      Renderizador oficial Black Link (1:1). Tema ativo:{" "}
                      <span className="text-zinc-200 capitalize font-mono">
                        {selectedTheme.replace("-", " ")}
                      </span>
                      .
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-mono text-emerald-300 font-semibold">
                    1080x1080 Ready
                  </span>
                </div>

                {/* Renderizador Oficial Black Link 1:1 */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl group flex items-center justify-center">
                  <BlackLinkSlidePreview
                    headline={currentSlideData.headline}
                    bodyText={currentSlideData.bodyText}
                    currentSlide={activeSlideIndex + 1}
                    totalSlides={slides.length || 5}
                    theme={selectedTheme}
                  />

                  {/* Setas de Navegação Sobrepostas */}
                  {slides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        title="Lâmina Anterior"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl z-20"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        title="Próxima Lâmina"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-xl z-20"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Botão Secundário de Download no Rodapé do Preview */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Resolução de saída: 1080x1080 px (.PNG)
                  </span>

                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleDownloadZip}
                    className="flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Direto (ZIP)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
