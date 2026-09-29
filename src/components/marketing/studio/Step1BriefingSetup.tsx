"use client";

import { useState } from "react";
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Container Principal Apple Glassmorphism */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/60 space-y-8">
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Briefing Estratégico & Setup
              </h2>
            </div>
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Etapa 1 de 3
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Defina o nicho, as dores do decisor corporativo e as referências visuais para o motor de IA estruturar o criativo.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 font-mono">
            {error}
          </div>
        )}

        {/* Shimmer Effect Apple Glass Simulando Digitação da IA */}
        {isLoading ? (
          <div className="space-y-6 py-6 animate-pulse">
            <div className="rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-xl p-8 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span className="text-sm font-semibold tracking-tight text-white">
                  {statusMessage || "O motor de IA está estruturando o criativo..."}
                </span>
              </div>

              {/* Linhas de Shimmer Efeito Digitação */}
              <div className="space-y-3 pt-2">
                <div className="h-4 bg-white/[0.08] rounded-full w-3/4 animate-pulse" />
                <div className="h-3.5 bg-white/[0.05] rounded-full w-full animate-pulse" />
                <div className="h-3.5 bg-white/[0.04] rounded-full w-5/6 animate-pulse" />
                <div className="h-3 bg-white/[0.03] rounded-full w-2/3 animate-pulse" />
              </div>

              <div className="grid grid-cols-5 gap-3 pt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className="h-20 rounded-xl border border-white/10 bg-white/[0.03] flex flex-col items-center justify-center gap-1.5"
                  >
                    <span className="text-[10px] font-mono text-zinc-500">Slide 0{s}</span>
                    <div className="h-1.5 w-7 bg-white/30 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-mono text-zinc-400 text-center pt-2">
                Formatando tese de conversão, diretrizes visuais e chamadas para ação...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo 1: Nicho & Proposta de Valor */}
            <div className="space-y-2">
              <label
                htmlFor="nicheValueProposition"
                className="text-xs font-semibold tracking-tight text-zinc-300 flex items-center gap-2"
              >
                <Target className="h-3.5 w-3.5 text-white" />
                <span>Nicho & Proposta de Valor</span>
                <span className="text-white">*</span>
              </label>
              <textarea
                id="nicheValueProposition"
                rows={2}
                value={formData.nicheValueProposition}
                onChange={(e) => setFormData({ nicheValueProposition: e.target.value })}
                placeholder="Ex: Plataforma de inteligência comercial para empresas B2B. Reduzimos o ciclo de vendas e eliminamos colisões de prospecção."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200 resize-y"
              />
            </div>

            {/* Campo 2: Tema Principal */}
            <div className="space-y-2">
              <label
                htmlFor="theme"
                className="text-xs font-semibold tracking-tight text-zinc-300 flex items-center gap-2"
              >
                <FileText className="h-3.5 w-3.5 text-white" />
                <span>Tema Principal do Criativo</span>
                <span className="text-white">*</span>
              </label>
              <input
                id="theme"
                type="text"
                required
                value={formData.theme}
                onChange={(e) => setFormData({ theme: e.target.value })}
                placeholder="Ex: Como Escalar Vendas B2B sem Queimar Margem Operacional"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
              />
            </div>

            {/* Grid Duplo: Público-Alvo e Referências */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Campo 3: Público-Alvo */}
              <div className="space-y-2">
                <label
                  htmlFor="targetAudience"
                  className="text-xs font-semibold tracking-tight text-zinc-300 flex items-center gap-2"
                >
                  <Megaphone className="h-3.5 w-3.5 text-white" />
                  <span>Público-Alvo / ICP</span>
                </label>
                <input
                  id="targetAudience"
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ targetAudience: e.target.value })}
                  placeholder="Ex: CEOs, Diretores Comerciais, Heads de Vendas B2B"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
                />
              </div>

              {/* Campo 4: Referências / Concorrentes */}
              <div className="space-y-2">
                <label
                  htmlFor="competitorsReferences"
                  className="text-xs font-semibold tracking-tight text-zinc-300 flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  <span>Referências & Tom de Voz</span>
                </label>
                <input
                  id="competitorsReferences"
                  type="text"
                  value={formData.competitorsReferences}
                  onChange={(e) => setFormData({ competitorsReferences: e.target.value })}
                  placeholder="Ex: Visual brutalista dark, dados densos, tom executivo"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Campo 5: Formato Desejado (Toggle Cards Apple Squircle) */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-semibold tracking-tight text-zinc-300">
                Formato do Ativo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.format === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormat(opt.id)}
                      className={`relative flex flex-col p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-white/40 bg-white/[0.10] shadow-xl shadow-black/40 ring-1 ring-white/20"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <Icon
                          className={`h-4 w-4 ${
                            isSelected ? "text-white" : "text-zinc-400"
                          }`}
                        />
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${
                            isSelected
                              ? "bg-white text-black"
                              : "bg-white/[0.06] text-zinc-400 border border-white/10"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <span className="font-semibold text-xs text-white tracking-tight">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-1 leading-snug">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão de Disparo da IA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.theme.trim()}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold text-xs tracking-tight hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="h-4 w-4 fill-black" />
                <span>Gerar Estrutura com IA</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
