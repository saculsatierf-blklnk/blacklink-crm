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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho do Card Centralizado */}
      <div className="rounded-xl border border-glass-border bg-carbon p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="border-b border-glass-border/70 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-void">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold font-mono uppercase tracking-wider text-platinum">
                Briefing Estratégico & Setup da Campanha
              </h2>
            </div>
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">
              Etapa 1 de 3
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Defina o nicho, as dores do decisor corporativo e as referências visuais para o motor de IA estruturar o criativo.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
            {error}
          </div>
        )}

        {/* Shimmer Effect de Carregamento Simulando Digitação da IA */}
        {isLoading ? (
          <div className="space-y-6 py-6 animate-pulse">
            <div className="rounded-xl border border-accent/30 bg-void/90 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <span className="text-sm font-mono font-bold text-platinum">
                  {statusMessage || "O motor de IA está estruturando o criativo..."}
                </span>
              </div>

              {/* Linhas de Shimmer Efeito Digitação */}
              <div className="space-y-3 pt-2">
                <div className="h-4 bg-carbon-muted rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-carbon-muted/70 rounded w-full animate-pulse" />
                <div className="h-3 bg-carbon-muted/50 rounded w-5/6 animate-pulse" />
                <div className="h-3 bg-carbon-muted/40 rounded w-2/3 animate-pulse" />
              </div>

              <div className="grid grid-cols-5 gap-2 pt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className="h-16 rounded border border-glass-border/40 bg-carbon/50 flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-[10px] font-mono text-sub">Slide 0{s}</span>
                    <div className="h-1.5 w-6 bg-accent/40 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-mono text-sub text-center pt-2">
                Formatando tese de conversão, diretrizes visuais Dark Industrial e chamadas para ação...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo 1: Nicho & Proposta de Valor (Textarea) */}
            <div className="space-y-1.5">
              <label
                htmlFor="nicheValueProposition"
                className="text-xs font-mono font-semibold uppercase tracking-wider text-sub flex items-center gap-1.5"
              >
                <Target className="h-3.5 w-3.5 text-accent" />
                <span>Nicho & Proposta de Valor</span>
                <span className="text-accent">*</span>
              </label>
              <textarea
                id="nicheValueProposition"
                rows={2}
                value={formData.nicheValueProposition}
                onChange={(e) => setFormData({ nicheValueProposition: e.target.value })}
                placeholder="Ex: Plataforma de inteligência comercial para empresas B2B. Reduzimos o ciclo de vendas e eliminamos colisões de prospecção."
                className="w-full rounded-lg border border-glass-border bg-void/70 p-3 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none focus:ring-1 focus:ring-accent/50 resize-y"
              />
            </div>

            {/* Campo 2: Tema Principal (Input) */}
            <div className="space-y-1.5">
              <label
                htmlFor="theme"
                className="text-xs font-mono font-semibold uppercase tracking-wider text-sub flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-accent" />
                <span>Tema Principal do Criativo</span>
                <span className="text-accent">*</span>
              </label>
              <input
                id="theme"
                type="text"
                required
                value={formData.theme}
                onChange={(e) => setFormData({ theme: e.target.value })}
                placeholder="Ex: Como Escalar Vendas B2B sem Queimar Margem Operacional"
                className="w-full rounded-lg border border-glass-border bg-void/70 p-3 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>

            {/* Grid Duplo: Público-Alvo e Referências */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Campo 3: Público-Alvo (Input) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="targetAudience"
                  className="text-xs font-mono font-semibold uppercase tracking-wider text-sub flex items-center gap-1.5"
                >
                  <Megaphone className="h-3.5 w-3.5 text-accent" />
                  <span>Público-Alvo / ICP</span>
                </label>
                <input
                  id="targetAudience"
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ targetAudience: e.target.value })}
                  placeholder="Ex: CEOs, Diretores Comerciais, Heads de Vendas B2B"
                  className="w-full rounded-lg border border-glass-border bg-void/70 p-3 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>

              {/* Campo 4: Referências / Concorrentes (Input) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="competitorsReferences"
                  className="text-xs font-mono font-semibold uppercase tracking-wider text-sub flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>Referências & Tom de Voz</span>
                </label>
                <input
                  id="competitorsReferences"
                  type="text"
                  value={formData.competitorsReferences}
                  onChange={(e) => setFormData({ competitorsReferences: e.target.value })}
                  placeholder="Ex: Visual brutalista dark, dados densos, tom executivo"
                  className="w-full rounded-lg border border-glass-border bg-void/70 p-3 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>
            </div>

            {/* Campo 5: Formato Desejado (Toggle Cards) */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-sub">
                Formato do Ativo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.format === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormat(opt.id)}
                      className={`relative flex flex-col p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-accent bg-accent/10 shadow-lg shadow-accent/5"
                          : "border-glass-border bg-void/40 hover:border-glass-highlight hover:bg-void/70"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isSelected ? "text-accent" : "text-sub"
                          }`}
                        />
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-mono ${
                            isSelected
                              ? "bg-accent text-void font-bold"
                              : "bg-carbon-muted text-sub"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <span className="font-semibold text-xs text-platinum">
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-sub mt-0.5 leading-tight">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão de Disparo da IA */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading || !formData.theme.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-xs font-bold font-mono text-void hover:bg-platinum transition-all cursor-pointer shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="h-4 w-4 fill-void" />
                <span>Gerar Estrutura com IA</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
