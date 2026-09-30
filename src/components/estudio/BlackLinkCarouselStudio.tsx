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
} from "./BlackLinkSlidePreview";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

const BRAND_STORAGE_KEY = "blacklink_studio_brand_memory";

const DEFAULT_CONFIG: SlideDesignConfig = {
  theme: "dark-industrial",
  layout: "brutalista",
  font: "space-grotesk",
  aspectRatio: "1:1",
  pattern: "dots",
  fontSizeScale: 1.0,
  bgColor: "#09090b",
  accentColor: "#38bdf8",
  authorName: "Black Link CRM",
  authorHandle: "@blacklink.b2b",
  authorAvatar: "",
  bgImage: "",
  bgOpacity: 25,
};

const B2B_PALETTES = [
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

const PRESET_TEMPLATES = [
  {
    title: "Autoridade B2B (Métricas & Retenção)",
    slides: [
      {
        tag: "DIAGNÓSTICO B2B",
        headline: "Por que 82% dos **Leads Qualificados** esfriam em 48 horas?",
        bodyText:
          "Sem um fluxo de inteligência preditiva e acompanhamento estruturado, a sua equipe perde negócios antes da primeira demonstração.",
      },
      {
        tag: "O ERRO CRÍTICO",
        headline: "Planilhas e CRMs lentos **destroem o tempo de resposta**.",
        bodyText:
          "Empresas de alto crescimento não toleram atrito operacional. O tempo entre o primeiro clique e a abordagem comercial define a taxa de vitória.",
      },
      {
        tag: "A ARQUITETURA",
        headline: "Automação de alto impacto e **dados centralizados**.",
        bodyText:
          "Integrar inteligência analítica em tempo real transforma operadores em consultores estratégicos de fechamento.",
      },
      {
        tag: "RESULTADOS",
        headline: "Redução de **64% no ciclo de fechamento** das contas corporativas.",
        bodyText:
          "A Black Link entrega visibilidade holística e controle rigoroso sobre cada etapa do pipeline comercial.",
      },
      {
        tag: "CALL TO ACTION",
        headline: "Pronto para escalar sua **operação corporativa**?",
        bodyText:
          "Salve este carrossel e compartilhe com sua diretoria para revolucionar seus fluxos de receita agora.",
      },
    ],
  },
  {
    title: "Cases de Sucesso (Crescimento Agressivo)",
    slides: [
      {
        tag: "CASE ENTERPRISE",
        headline: "Como geramos **+340% de retenção** em contratos corporativos.",
        bodyText:
          "Um mergulho técnico no modelo de previsibilidade operacional e engajamento que transformou uma operação tradicional.",
      },
      {
        tag: "PONTO DE INFLEXÃO",
        headline: "Identificando o **gargalo invisível** no funil de vendas.",
        bodyText:
          "Mais de 40% das oportunidades morriam por falta de visibilidade nos estágios intermediários do relacionamento.",
      },
      {
        tag: "A SOLUÇÃO",
        headline: "Implementação de **painéis preditivos e alertas em tempo real**.",
        bodyText:
          "A equipe comercial passou a agir proativamente em contas com risco de evasão, revertendo perdas milionárias.",
      },
      {
        tag: "BENCHMARK",
        headline: "Eficiência operacional multiplicada por **3.2x em 90 dias**.",
        bodyText:
          "Menos trabalho manual, zero retrabalho de cadastro e máxima assertividade nas decisões de fechamento.",
      },
      {
        tag: "PRÓXIMO PASSO",
        headline: "Aplique este mesmo **método comprovado** na sua empresa.",
        bodyText:
          "Conecte-se com especialistas da Black Link e descubra o potencial reprimido da sua carteira comercial.",
      },
    ],
  },
  {
    title: "Engenharia & Tech (Brutalismo Industrial)",
    slides: [
      {
        tag: "TECH OVERVIEW",
        headline: "A anatomia de uma **arquitetura de dados resiliente**.",
        bodyText:
          "Microsserviços, cache em camadas e tolerância a falhas: os pilares inegociáveis de um SaaS de alto volume.",
      },
      {
        tag: "LATÊNCIA ZERO",
        headline: "Otimizando consultas para **menos de 45ms** sob carga extrema.",
        bodyText:
          "Indexes precisos, pipelines otimizados e refração gráfica garantem respostas instantâneas mesmo com milhões de eventos.",
      },
      {
        tag: "SEGURANÇA ENTERPRISE",
        headline: "Isolamento total de dados e **criptografia de ponta a ponta**.",
        bodyText:
          "Políticas de acesso em nível de linha (RLS) e auditorias automatizadas para conformidade corporativa rigorosa.",
      },
      {
        tag: "STACK MODERNA",
        headline: "Next.js, Tailwind v4 e **motores gráficos parametrizados**.",
        bodyText:
          "Desenvolvimento frontend sem concessões: estética Apple Glassmorphism aliada a tempo de carregamento estelar.",
      },
      {
        tag: "JUNTE-SE À BLACK LINK",
        headline: "Construa o futuro da **inteligência corporativa** conosco.",
        bodyText:
          "Siga nosso perfil para análises de código, arquitetura de sistemas e engenharia de alto desempenho.",
      },
    ],
  },
];

export function BlackLinkCarouselStudio() {
  // Estado do Wizard / Etapas
  const [step, setStep] = useState<1 | 2>(1);

  // Formulário do Wizard
  const [wizardTheme, setWizardTheme] = useState("Como escalar vendas B2B com automação e inteligência de dados");
  const [wizardTarget, setWizardTarget] = useState("Líderes Comerciais, Fundadores SaaS e Heads de Growth");
  const [wizardTone, setWizardTone] = useState("Brutalista Técnico e Autoritário");
  const [wizardSlideCount, setWizardSlideCount] = useState<number>(5);

  // Configuração Paramétrica do Design (Figma-Like)
  const [designConfig, setDesignConfig] = useState<SlideDesignConfig>(DEFAULT_CONFIG);

  // Lista de Slides Atuais
  const [slides, setSlides] = useState<SlideData[]>(PRESET_TEMPLATES[0].slides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Aba ativa do Inspetor: 'conteudo' | 'design'
  const [activeTab, setActiveTab] = useState<"conteudo" | "design">("design");

  // Estado de Exportação em Execução
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");

  // Referência para o container de exportação offscreen
  const offscreenContainerRef = useRef<HTMLDivElement>(null);

  // Carregar configurações de marca do LocalStorage no carregamento inicial
  useEffect(() => {
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
      // Ignora falhas de leitura
    }
  }, []);

  // Salvar memória de marca no LocalStorage
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
        // Ignora erros de escrita local
      }
      return updated;
    });
  };

  // Alternador de Temas Globais (Theme Engine)
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

  // Gerar Slides a partir do Wizard
  const handleGenerateCarousel = () => {
    const generated: SlideData[] = [];
    const count = wizardSlideCount;

    for (let i = 1; i <= count; i++) {
      if (i === 1) {
        generated.push({
          tag: "TEMA CENTRAL",
          headline: `O guia definitivo sobre **${wizardTheme}**`,
          bodyText: `Estratégias estruturadas para ${wizardTarget} dominarem o mercado corporativo com previsibilidade e controle absoluto.`,
        });
      } else if (i === count) {
        generated.push({
          tag: "CHAMADA FINAL",
          headline: "Gostou deste **insight de valor**?",
          bodyText:
            "Salve este carrossel para consulta da equipe e siga nosso canal para acompanhar as próximas análises.",
        });
      } else {
        generated.push({
          tag: `DIRETRIZ ${String(i - 1).padStart(2, "0")}`,
          headline: `Princípio essencial número ${i - 1}: **Execução sem atrito**`,
          bodyText: `Implementação prática com foco em tom ${wizardTone.toLowerCase()}. A precisão operacional define a vitória no ambiente B2B.`,
        });
      }
    }

    setSlides(generated);
    setCurrentSlideIndex(0);
    setStep(2);
  };

  // Adicionar Nova Lâmina
  const handleAddSlide = () => {
    const newSlide: SlideData = {
      tag: `LÂMINA ${slides.length + 1}`,
      headline: "Novo **insight corporativo** a ser explorado",
      bodyText:
        "Insira aqui o detalhamento técnico ou estratégico para engajar sua audiência corporativa com clareza.",
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  // Remover Lâmina Atual
  const handleRemoveSlide = () => {
    if (slides.length <= 1) return;
    const nextSlides = slides.filter((_, idx) => idx !== currentSlideIndex);
    setSlides(nextSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  // Atualizar Conteúdo do Slide Atual
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

  // Upload de Imagem de Avatar via Leitura Local (FileReader)
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

  // Upload de Imagem de Fundo
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
  // MOTORES DE EXPORTAÇÃO GRÁFICA (PNG, ZIP, PDF LINKEDIN)
  // ==========================================================================

  // 1. Download de Lâmina Única (PNG)
  const handleDownloadSinglePng = async () => {
    try {
      setIsExporting(true);
      setExportMessage("Renderizando lâmina em alta definição...");
      const node = document.getElementById("blacklink-slide-canvas");
      if (!node) throw new Error("Elemento do slide não encontrado no DOM.");

      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: 2.5,
        cacheBust: true,
      });

      saveAs(dataUrl, `blacklink-slide-${currentSlideIndex + 1}.png`);
    } catch (err) {
      console.error("Falha ao exportar imagem PNG:", err);
      alert("Ocorreu um erro ao exportar a lâmina. Verifique o console.");
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // 2. Download do Carrossel Completo em ZIP
  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const zip = new JSZip();
      const folder = zip.folder("blacklink-carrossel") || zip;

      // Iterar e capturar cada lâmina individualmente
      for (let i = 0; i < slides.length; i++) {
        setExportMessage(`Renderizando slide ${i + 1} de ${slides.length}...`);
        const slideNode = document.getElementById(`offscreen-slide-${i}`);
        if (slideNode) {
          const dataUrl = await htmlToImage.toPng(slideNode, {
            pixelRatio: 2.0,
            cacheBust: true,
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
      alert("Ocorreu um erro ao gerar o pacote ZIP.");
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // 3. Download do Carrossel em PDF Oficial para LinkedIn
  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);

      const isPortrait = designConfig.aspectRatio === "4:5";
      const pdfWidth = 1080;
      const pdfHeight = isPortrait ? 1350 : 1080;

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
            pixelRatio: 2.0,
            cacheBust: true,
          });

          if (i > 0) {
            pdf.addPage([pdfWidth, pdfHeight], "portrait");
          }

          pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
        }
      }

      setExportMessage("Gerando documento PDF para o LinkedIn...");
      pdf.save("blacklink-carrossel-linkedin.pdf");
    } catch (err) {
      console.error("Falha ao exportar PDF:", err);
      alert("Ocorreu um erro ao gerar o documento PDF.");
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col p-4 md:p-8 lg:p-10 max-w-[1720px] mx-auto">
      {/* ==================================================================== */}
      {/* CABEÇALHO DO ESTÚDIO BLACK LINK                                      */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-xs font-mono font-bold uppercase rounded-full bg-white/10 border border-white/15 text-zinc-300">
              Ambiente Isolado • Sandbox Studio
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-zinc-400">Motor Gráfico v2.5</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Black Link Carousel Studio
          </h1>
          <p className="text-sm text-zinc-400">
            Criação de alta fidelidade de carrosséis institucionais B2B para LinkedIn e Instagram.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
            >
              ← Reiniciar com Wizard
            </button>
          )}

          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Lâminas Ativas:</span>
            <span className="text-sm font-bold text-white font-mono">{slides.length}</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ETAPA 1: WIZARD & PRESETS DE ACELERAÇÃO                              */}
      {/* ==================================================================== */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Formulário do Wizard */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-1">
                Assistente de Criação Estruturada
              </h2>
              <p className="text-sm text-zinc-400">
                Configure os parâmetros de comunicação para gerar a espinha dorsal do seu carrossel.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Tema Central / Tese do Carrossel
                </label>
                <input
                  type="text"
                  value={wizardTheme}
                  onChange={(e) => setWizardTheme(e.target.value)}
                  placeholder="Ex: Como estruturar uma esteira de vendas B2B previsível"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Público-Alvo Corporativo
                  </label>
                  <input
                    type="text"
                    value={wizardTarget}
                    onChange={(e) => setWizardTarget(e.target.value)}
                    placeholder="Ex: CEOs, Diretores Comerciais, Fundadores SaaS"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Tom de Voz
                  </label>
                  <select
                    value={wizardTone}
                    onChange={(e) => setWizardTone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="Brutalista Técnico e Autoritário">
                      Brutalista Técnico e Autoritário
                    </option>
                    <option value="Editorial Minimalista e Sofisticado">
                      Editorial Minimalista e Sofisticado
                    </option>
                    <option value="Direto e Focado em Métricas">
                      Direto e Focado em Métricas
                    </option>
                    <option value="Educativo e Passo a Passo">
                      Educativo e Passo a Passo
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Quantidade de Lâminas (Slides)
                  </label>
                  <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                    {wizardSlideCount} Slides
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={7}
                  value={wizardSlideCount}
                  onChange={(e) => setWizardSlideCount(Number(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-1">
                  <span>3 (Síntese)</span>
                  <span>5 (Ideal LinkedIn)</span>
                  <span>7 (Deep-Dive)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateCarousel}
              className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-sm uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Gerar Estrutura de Carrossel</span>
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Coluna Direita: Modelos e Templates Prontos */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border border-white/10 bg-white/5 rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold mb-3">
                Templates de Aceleração Prontos
              </h3>
              <p className="text-xs text-zinc-400 mb-5">
                Escolha uma estrutura validada de alta retenção para entrar direto na edição visual.
              </p>

              <div className="space-y-3">
                {PRESET_TEMPLATES.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSlides(preset.slides);
                      setCurrentSlideIndex(0);
                      setStep(2);
                    }}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-white/30 cursor-pointer transition-all hover:translate-x-1"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white tracking-tight">
                        {preset.title}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {preset.slides.length} slides
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {preset.slides[0].headline.replace(/\*\*/g, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 font-bold">
                💡
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <p className="text-white font-semibold">Dica de Retenção B2B</p>
                <p>
                  Use o recurso de negrito duplo (<code className="text-zinc-200">**palavra**</code>)
                  nos títulos para colorir termos-chave com a cor de destaque da sua marca.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ETAPA 2: O ESTÚDIO COMPLETO (SPLIT VIEW FIGMA-LIKE)                 */}
      {/* ==================================================================== */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================================================================ */}
          {/* COLUNA ESQUERDA: INSPETOR PARAMÉTRICO DE DESIGN & CONTEÚDO       */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl p-6 md:p-7 space-y-6">
            {/* Navegador de Abas do Inspetor */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/50 border border-white/10">
              <button
                onClick={() => setActiveTab("design")}
                className={`py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  activeTab === "design"
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Design & Estilo
              </button>
              <button
                onClick={() => setActiveTab("conteudo")}
                className={`py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  activeTab === "conteudo"
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Conteúdo & Slides
              </button>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* ABA 1: DESIGN & ESTILO (FIGMA INSPECTOR ENGINE)                */}
            {/* -------------------------------------------------------------- */}
            {activeTab === "design" && (
              <div className="space-y-6">
                {/* 1. SELETOR DE LAYOUTS MODULARES */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Motor de Layout
                    </label>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {designConfig.layout}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(
                      [
                        { id: "brutalista", label: "Brutalista", desc: "Tipografia Colossal" },
                        { id: "minimal", label: "Minimal", desc: "Editorial Luxo" },
                        { id: "tweet", label: "Tweet Social", desc: "Thread Viral" },
                        { id: "split", label: "Split 50/50", desc: "Texto + Métrica" },
                        { id: "terminal", label: "Terminal", desc: "macOS Shell" },
                        { id: "glass-floating", label: "Glass 3D", desc: "Card Flutuante" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateDesignConfig({ layout: item.id })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          designConfig.layout === item.id
                            ? "bg-white/15 border-white text-white shadow-md scale-[1.02]"
                            : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <span className="block text-xs font-bold leading-tight">
                          {item.label}
                        </span>
                        <span className="block text-[10px] text-zinc-400 mt-0.5 truncate">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. TEXTURAS DE FUNDO (PATTERN ENGINE) */}
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
                        { id: "solid-mesh", label: "Solid Mesh", icon: "✦" },
                        { id: "dots", label: "Dots", icon: "⁘" },
                        { id: "grid", label: "Grid Tech", icon: "⌗" },
                        { id: "noise", label: "Noise Grain", icon: "░" },
                      ] as const
                    ).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => updateDesignConfig({ pattern: p.id })}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
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

                {/* 3. PALETAS B2B PRONTAS + CONTRASTE YIQ */}
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
                        className="p-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/30 text-left transition-all flex items-center gap-2.5"
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

                {/* 4. CONTROLES PERSONALIZADOS DE COR */}
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

                {/* 5. ESCALA TIPOGRÁFICA (SLIDER ZOOM) */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Escala Tipográfica (Zoom)
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
                    className="w-full accent-white"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>80% (Condensado)</span>
                    <span>100% (Padrão)</span>
                    <span>150% (Colossal)</span>
                  </div>
                </div>

                {/* 6. FAMÍLIA TIPOGRÁFICA */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold block mb-3">
                    Família Tipográfica
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "space-grotesk", label: "Space Grotesk", style: "Brutalista Tech" },
                        { id: "playfair", label: "Playfair Display", style: "Editorial Luxo" },
                        { id: "jakarta", label: "Plus Jakarta", style: "Startup Moderna" },
                        { id: "inter", label: "Inter UI", style: "Clássico B2B" },
                      ] as const
                    ).map((font) => (
                      <button
                        key={font.id}
                        onClick={() => updateDesignConfig({ font: font.id })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          designConfig.font === font.id
                            ? "bg-white/15 border-white text-white shadow-md"
                            : "bg-black/30 border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                        }`}
                      >
                        <span className="block text-xs font-bold">{font.label}</span>
                        <span className="block text-[10px] text-zinc-500">{font.style}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. CONFIGURAÇÕES DA MARCA & AUTOR */}
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
                      Imagem de Fundo Personalizada (Opcional)
                    </label>
                    <div className="space-y-2">
                      <label className="block w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white text-center cursor-pointer font-mono">
                        <span>Escolher Arquivo de Fundo</span>
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
                            className="w-full accent-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* ABA 2: CONTEÚDO & SLIDES                                       */}
            {/* -------------------------------------------------------------- */}
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
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-colors"
                      >
                        + Novo Slide
                      </button>
                      <button
                        onClick={handleRemoveSlide}
                        disabled={slides.length <= 1}
                        className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 disabled:opacity-30 text-xs font-mono font-bold transition-colors"
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
                        className={`px-3 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all border ${
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
                </div>

                {/* Controles de Navegação */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentSlideIndex === 0}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-mono font-bold text-white border border-white/10"
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
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-mono font-bold text-white border border-white/10"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* COLUNA DIREITA: VISUALIZADOR DA LÂMINA & AÇÕES DE EXPORTAÇÃO     */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* BARRA SUPERIOR DO VISUALIZADOR: THEME ENGINE & CONTROLES */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    designConfig.aspectRatio === "1:1"
                      ? "bg-white text-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  1:1 Quadrado
                </button>
                <button
                  onClick={() => updateDesignConfig({ aspectRatio: "4:5" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    designConfig.aspectRatio === "4:5"
                      ? "bg-white text-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  4:5 Retrato
                </button>
              </div>

              {/* CONTROLES RÁPIDOS DE NAVEGAÇÃO */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center justify-center font-bold border border-white/10"
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
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white flex items-center justify-center font-bold border border-white/10"
                >
                  ›
                </button>
              </div>
            </div>

            {/* CANVAS CONTAINER DE VISUALIZAÇÃO INTERATIVA */}
            <div className="w-full flex items-center justify-center p-3 md:p-6 rounded-3xl bg-black/60 border border-white/10 shadow-2xl relative">
              <div
                className={`w-full transition-all duration-300 ${
                  designConfig.aspectRatio === "4:5"
                    ? "max-w-[440px]"
                    : "max-w-[490px]"
                }`}
              >
                <BlackLinkSlidePreview
                  slide={slides[currentSlideIndex]}
                  currentSlide={currentSlideIndex + 1}
                  totalSlides={slides.length}
                  config={designConfig}
                  canvasId="blacklink-slide-canvas"
                />
              </div>
            </div>

            {/* BARRA DE EXPORTAÇÃO CORPORATIVA */}
            <div className="w-full mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-xs font-mono uppercase text-zinc-400 block">
                  Exportação de Alta Resolução
                </span>
                <span className="text-sm font-bold text-white">
                  Downloads Oficiais B2B
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleDownloadSinglePng}
                  disabled={isExporting}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold border border-white/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  Baixar Slide (.PNG)
                </button>

                <button
                  onClick={handleDownloadZip}
                  disabled={isExporting}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold border border-white/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  Exportar Pacote (.ZIP)
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-black uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <span>Exportar LinkedIn (.PDF)</span>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.5a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
                  </svg>
                </button>
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
              height: designConfig.aspectRatio === "4:5" ? "1350px" : "1080px",
            }}
          >
            <BlackLinkSlidePreview
              slide={s}
              currentSlide={idx + 1}
              totalSlides={slides.length}
              config={designConfig}
              canvasId={`offscreen-slide-${idx}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
