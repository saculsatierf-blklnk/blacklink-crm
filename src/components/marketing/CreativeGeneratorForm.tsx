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
    description: "5 slides com retenção, gancho e ancoragem visual",
    icon: Layers,
    badge: "Mais Eficiente",
  },
  {
    id: "story",
    label: "Sequência de Stories",
    description: "3 telas verticais com narrativa e CTA direto",
    icon: Smartphone,
    badge: "Direto no Direct",
  },
  {
    id: "post",
    label: "Post Único Executivo",
    description: "Imagem estática + copy denso para autoridade",
    icon: LayoutGrid,
    badge: "Autoridade",
  },
];

export function CreativeGeneratorForm() {
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
    <div className="rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Cabeçalho do Painel de Input */}
      <div className="flex items-center justify-between border-b border-glass-border/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-void font-bold">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
              Agente de Criativos & Mídia
            </h2>
            <p className="text-xs text-sub">
              Configuração autônoma integrada ao webhook do n8n.
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Pipeline n8n Conectado
        </span>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo 1: Tema Principal */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-platinum">
            Tema Principal da Campanha <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Como reduzir em 40% o ciclo de fechamento em vendas complexas"
            value={formData.theme}
            onChange={(e) => setFormData({ theme: e.target.value })}
            disabled={isLoading}
            className="h-10 w-full rounded-md border border-glass-border bg-void/80 px-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors disabled:opacity-50"
          />
          <p className="text-[11px] text-sub">
            O gancho central que orientará a narrativa visual e a copy dos criativos.
          </p>
        </div>

        {/* Campo 2: Público-Alvo */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-platinum flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-accent" />
            <span>Público-Alvo & Decisor (Persona B2B)</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Diretores Comerciais, Heads de Vendas e CEOs de empresas de tecnologia"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ targetAudience: e.target.value })}
            disabled={isLoading}
            className="h-10 w-full rounded-md border border-glass-border bg-void/80 px-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>

        {/* Campo 3: Concorrentes & Referências */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-platinum">
            Concorrentes & Referências Estratégicas
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Comunicação minimalista estilo Stripe, contraponto com planilhas manuais e métodos obsoletos"
            value={formData.competitorsReferences}
            onChange={(e) => setFormData({ competitorsReferences: e.target.value })}
            disabled={isLoading}
            className="w-full rounded-md border border-glass-border bg-void/80 p-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors disabled:opacity-50 resize-none"
          />
        </div>

        {/* Campo 4: Seleção do Formato Desejado */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-platinum">
            Formato Desejado
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {FORMAT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = formData.format === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormat(opt.id)}
                  disabled={isLoading}
                  className={`flex flex-col text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "border-accent bg-carbon-muted text-platinum shadow-md"
                      : "border-glass-border bg-void/50 text-sub hover:text-platinum hover:bg-carbon-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-accent" : "text-sub"}`} />
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-void border border-glass-border text-sub">
                      {opt.badge}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-platinum mb-0.5">
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-sub leading-snug">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Disparo */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !formData.theme.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-mono font-bold text-void transition-all hover:bg-accent-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-void" />
                <span>{statusMessage || "Processando com n8n & IA..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-void" />
                <span>Gerar Estratégia e Criativos</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
