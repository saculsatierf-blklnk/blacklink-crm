"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Sparkles, UploadCloud } from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";
import { CreativeStudioWizard } from "@/components/marketing/studio/CreativeStudioWizard";
import { AdPerformanceTable } from "@/components/marketing/AdPerformanceTable";
import { MarketingScheduleView } from "@/components/marketing/MarketingScheduleView";
import { ManualAssetUploadModal } from "./ManualAssetUploadModal";

export function MarketingTabsWrapper() {
  const { activeMarketingTab, setActiveMarketingTab, scheduledPosts } = useMarketingStore();
  const [isManualUploadOpen, setIsManualUploadOpen] = useState(false);
  const [globalSuccessMsg, setGlobalSuccessMsg] = useState<string | null>(null);

  const pendingApprovalsCount = scheduledPosts.filter(
    (p) => p.status === "awaiting_approval"
  ).length;

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Header Contextual com Flexbox (Padrão Apple SaaS Enterprise) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08] pb-8 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Criativos Autônomos &amp; Marketing
            </h1>
            <span className="rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Pipeline n8n &amp; Meta v20.0
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-2xl">
            Estúdio de co-criação de carrosséis de alta retenção com IA, mesa de aprovação multi-tenant e orquestração de tráfego pago integrada.
          </p>
        </div>

        {/* Botões de Ação Global do Header Contextual */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setIsManualUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 px-5 py-3 text-xs font-semibold text-white transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>+ Upload Manual de Ativo</span>
          </button>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-xs font-mono text-zinc-300 flex items-center gap-2.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mesa de Aprovação Ativa</span>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback Global se Disparado */}
      {globalSuccessMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 text-xs font-mono text-emerald-300 flex items-center gap-2.5 animate-fadeIn backdrop-blur-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{globalSuccessMsg}</span>
        </div>
      )}

      {/* Seletor de Sub-abas Estilo Apple Glass Segmented Control com Respiro Extremo */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.08] p-1.5 shadow-2xl backdrop-blur-2xl w-fit">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMarketingTab("studio")}
            className={`flex items-center gap-2.5 rounded-xl px-6 py-3 text-xs transition-all duration-300 cursor-pointer ${
              activeMarketingTab === "studio"
                ? "bg-white/[0.12] border border-white/20 text-white font-semibold shadow-sm tracking-tight"
                : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span>Estúdio de Criação &amp; Tráfego</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMarketingTab("schedule")}
            className={`flex items-center gap-2.5 rounded-xl px-6 py-3 text-xs transition-all duration-300 cursor-pointer ${
              activeMarketingTab === "schedule"
                ? "bg-white/[0.12] border border-white/20 text-white font-semibold shadow-sm tracking-tight"
                : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Calendar className="h-4 w-4 text-white" />
            <span>Cronograma &amp; Aprovação</span>
            {pendingApprovalsCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                {pendingApprovalsCount} pendente{pendingApprovalsCount > 1 ? "s" : ""}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico Baseado na Sub-Aba Ativa */}
      {activeMarketingTab === "studio" ? (
        <div className="space-y-16 animate-in fade-in duration-300">
          {/* ESTÚDIO DE CO-CRIAÇÃO PROGRESSIVA WIZARD 3 ETAPAS */}
          <CreativeStudioWizard />

          {/* MONITORAMENTO & ROBÔ DE TRÁFEGO PAGO */}
          <div className="pt-8 border-t border-white/[0.08]">
            <AdPerformanceTable />
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <MarketingScheduleView />
        </div>
      )}

      {/* Modal de Upload Manual Global */}
      <ManualAssetUploadModal
        isOpen={isManualUploadOpen}
        onClose={() => setIsManualUploadOpen(false)}
        onSuccess={() => {
          setGlobalSuccessMsg("Ativo manual adicionado à esteira de aprovação com sucesso!");
          setTimeout(() => setGlobalSuccessMsg(null), 4000);
        }}
      />
    </div>
  );
}
