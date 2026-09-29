"use client";

import {
  FileText,
  Layers,
  LayoutGrid,
  Loader2,
  Megaphone,
  Smartphone,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useMarketingStore, type CreativeFormat } from "@/store/useMarketingStore";

const FORMAT_OPTIONS: {
  id: CreativeFormat;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}[] = [
  {
    id: "carousel",
    label: "Carrossel B2B",
    description: "5 lâminas progressivas com gancho e ancoragem visual",
    icon: Layers,
    badge: "Alta Retenção",
  },
  {
    id: "story",
    label: "Sequência de Stories",
    description: "3 telas verticais com narrativa e CTA para direct",
    icon: Smartphone,
    badge: "Engajamento Direto",
  },
  {
    id: "post",
    label: "Post Único Executivo",
    description: "Lâmina única de impacto + dossiê de autoridade",
    icon: LayoutGrid,
    badge: "Posicionamento",
  },
];

export function Step1BriefingSetup() {
  const {
    formData,
    isLoading,
    statusMessage,
    error,
    setFormData,
    setFormat,
    generateCreatives,
  } = useMarketingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateCreatives();
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-300 mb-12">
      {error && (
        <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-xs text-red-300 font-mono">
          {error}
        </div>
      )}

      {/* Grid de 12 Colunas: Elimina Scroll Infinito no Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA (7 Colunas): Briefing Estratégico & Posicionamento */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 shadow-2xl shadow-black/50 space-y-6">
          {/* Card Header Obrigatório */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black shadow-sm">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Briefing Estratégico &amp; Posicionamento
              </h2>
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Etapa 01 / 03
            </span>
          </div>

          {/* Campo 1: Nicho & Proposta de Valor */}
          <div className="space-y-2">
            <label
              htmlFor="nicheValueProposition"
              className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2"
            >
              Nicho &amp; Proposta de Valor <span className="text-white">*</span>
            </label>
            <textarea
              id="nicheValueProposition"
              rows={3}
              value={formData.nicheValueProposition}
              onChange={(e) => setFormData({ nicheValueProposition: e.target.value })}
              placeholder="Ex: Plataforma de inteligência comercial para empresas B2B. Reduzimos o ciclo de vendas e eliminamos colisões de prospecção."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200 resize-y leading-relaxed"
            />
          </div>

          {/* Campo 2: Tema Principal */}
          <div className="space-y-2">
            <label
              htmlFor="theme"
              className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2"
            >
              Tema Principal do Criativo <span className="text-white">*</span>
            </label>
            <input
              id="theme"
              type="text"
              required
              value={formData.theme}
              onChange={(e) => setFormData({ theme: e.target.value })}
              placeholder="Ex: Como Escalar Vendas B2B sem Queimar Margem Operacional"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
            />
          </div>

          {/* Grid Duplo de 2 Colunas: Público-Alvo e Referências */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Campo 3: Público-Alvo */}
            <div className="space-y-2">
              <label
                htmlFor="targetAudience"
                className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2"
              >
                Público-Alvo / ICP
              </label>
              <input
                id="targetAudience"
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ targetAudience: e.target.value })}
                placeholder="Ex: CEOs, Heads de Vendas B2B"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
              />
            </div>

            {/* Campo 4: Referências / Concorrentes */}
            <div className="space-y-2">
              <label
                htmlFor="competitorsReferences"
                className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2"
              >
                Referências &amp; Tom de Voz
              </label>
              <input
                id="competitorsReferences"
                type="text"
                value={formData.competitorsReferences}
                onChange={(e) => setFormData({ competitorsReferences: e.target.value })}
                placeholder="Ex: Dark industrial brutalista, tom executivo"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (5 Colunas): Formato do Ativo & Motor de IA */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          {/* Card: Formato & Arquitetura do Ativo */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 shadow-2xl shadow-black/50 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black shadow-sm">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Formato do Ativo
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Diretriz Visual
              </span>
            </div>

            {/* Opções de Formato */}
            <div className="space-y-3">
              {FORMAT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.format === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormat(opt.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "border-white/40 bg-white/[0.12] shadow-xl shadow-black/40 ring-1 ring-white/20"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${
                          isSelected ? "bg-white text-black" : "bg-white/[0.06] text-zinc-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs text-white tracking-tight">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {opt.description}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 ml-3 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${
                        isSelected
                          ? "bg-white text-black"
                          : "bg-white/[0.06] text-zinc-400 border border-white/10"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card: Motor de IA & Ação de Disparo */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 shadow-2xl shadow-black/50 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Motor de IA &amp; Geração
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold">
                n8n Ativo
              </span>
            </div>

            {isLoading ? (
              /* Shimmer Effect Apple Glass Simulando Digitação da IA */
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3 text-white">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span className="text-xs font-semibold tracking-tight">
                    {statusMessage || "Estruturando teses e diretrizes..."}
                  </span>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="h-3.5 bg-white/[0.08] rounded-full w-4/5 animate-pulse" />
                  <div className="h-3 bg-white/[0.05] rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-white/[0.04] rounded-full w-3/4 animate-pulse" />
                </div>

                <div className="grid grid-cols-5 gap-2 pt-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className="h-14 rounded-lg border border-white/10 bg-white/[0.03] flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-[9px] font-mono text-zinc-500">0{s}</span>
                      <div className="h-1 w-5 bg-white/30 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-xs font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Modelo de Linguagem:</span>
                    <span className="text-white font-semibold">Gemini Pro</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Renderizador Gráfico:</span>
                    <span className="text-white font-semibold">SVG Canvas Engine</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destino:</span>
                    <span className="text-white font-semibold">Estúdio Slide a Slide</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.theme.trim()}
                  className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-tight hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap className="h-4 w-4 fill-black" />
                  <span>Gerar Estrutura com IA</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
