"use client";

import { useState } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Layers,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketingStore } from "@/store/useMarketingStore";
import { BlackLinkCarouselStudio } from "@/components/estudio/BlackLinkCarouselStudio";
import { MarketingScheduleView } from "@/components/marketing/MarketingScheduleView";
import { AdPerformanceTable } from "@/components/marketing/AdPerformanceTable";
import { ManualAssetUploadModal } from "@/components/marketing/ManualAssetUploadModal";

type EstudioTab = "criar" | "aprovacoes" | "performance";

export function EstudioClientView() {
  const [activeTab, setActiveTab] = useState<EstudioTab>("criar");
  const [isManualUploadOpen, setIsManualUploadOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const scheduledPosts = useMarketingStore((state) => state.scheduledPosts);
  const pendingApprovalsCount = scheduledPosts.filter(
    (p) => p.status === "awaiting_approval"
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho do Estúdio Unificado com Glassmorphism Apple */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white font-heading">
              Estúdio de IA &amp; Marketing
            </h1>
            <span className="rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Pipeline n8n &amp; Meta v20.0
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-400 mt-1.5 leading-relaxed font-sans max-w-3xl">
            Ambiente unificado para geração de carrosséis B2B com IA, moderação editorial de campanhas e monitoramento de tráfego pago.
          </p>
        </div>

        {/* Ações Rápidas do Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsManualUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Manual</span>
          </button>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-xs font-mono text-zinc-300 flex items-center gap-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Motor de Renderização 60fps</span>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 text-xs font-mono text-emerald-300 flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Segmented Control no Topo: [Criar] | [Aprovações] | [Performance] */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.08] p-1.5 shadow-2xl backdrop-blur-2xl w-fit">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-1.5">
          {/* Tab 1: Criar */}
          <button
            type="button"
            onClick={() => setActiveTab("criar")}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === "criar" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "criar" && (
              <motion.div
                layoutId="estudioActiveTabPill"
                className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 shadow-sm"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-white" />
              <span>Criar (Estúdio de Carrosséis)</span>
            </span>
          </button>

          {/* Tab 2: Aprovações */}
          <button
            type="button"
            onClick={() => setActiveTab("aprovacoes")}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === "aprovacoes" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "aprovacoes" && (
              <motion.div
                layoutId="estudioActiveTabPill"
                className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 shadow-sm"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white" />
              <span>Aprovações &amp; Cronograma</span>
              {pendingApprovalsCount > 0 && (
                <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  {pendingApprovalsCount}
                </span>
              )}
            </span>
          </button>

          {/* Tab 3: Performance */}
          <button
            type="button"
            onClick={() => setActiveTab("performance")}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === "performance" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "performance" && (
              <motion.div
                layoutId="estudioActiveTabPill"
                className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 shadow-sm"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-white" />
              <span>Performance de Anúncios</span>
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo Isolado por Aba para Garantir 60fps Constantes no Canvas */}
      <div className="relative">
        {activeTab === "criar" && (
          <div className="animate-in fade-in duration-200">
            {/* O Canvas e estado de renderização gráfica ficam isolados nesta árvore */}
            <BlackLinkCarouselStudio />
          </div>
        )}

        {activeTab === "aprovacoes" && (
          <div className="animate-in fade-in duration-200">
            <MarketingScheduleView />
          </div>
        )}

        {activeTab === "performance" && (
          <div className="animate-in fade-in duration-200">
            <AdPerformanceTable />
          </div>
        )}
      </div>

      {/* Modal de Upload Manual */}
      <ManualAssetUploadModal
        isOpen={isManualUploadOpen}
        onClose={() => setIsManualUploadOpen(false)}
        onSuccess={() => {
          setFeedbackMsg("Ativo manual adicionado com sucesso!");
          setTimeout(() => setFeedbackMsg(null), 4000);
        }}
      />
    </div>
  );
}
