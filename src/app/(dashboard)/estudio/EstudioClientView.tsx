"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Smartphone,
  Target,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMarketingStore, type GrowthTab } from "@/store/useMarketingStore";
import { CompetitorsDiagnosticView } from "@/components/marketing/growth/CompetitorsDiagnosticView";
import { EditorialPlanningView } from "@/components/marketing/growth/EditorialPlanningView";
import { InstagramFeedGridView } from "@/components/marketing/growth/InstagramFeedGridView";
import { ManualAssetUploadModal } from "@/components/marketing/ManualAssetUploadModal";

export function EstudioClientView() {
  const {
    activeGrowthTab,
    setActiveGrowthTab,
    scheduledPosts,
    editorialPlan,
  } = useMarketingStore();

  const [isManualUploadOpen, setIsManualUploadOpen] = useState(false);
  const [globalFeedbackMsg, setGlobalFeedbackMsg] = useState<string | null>(null);

  // 3 Pilares Naturais do Marketing: Vitrine 3x3 (Home), Cronograma de Datas e Diagnóstico Estratégico
  const TABS: { id: GrowthTab; label: string; icon: any; count?: number }[] = [
    {
      id: "feed",
      label: "✦ Vitrine 3x3 (Feed)",
      icon: Smartphone,
      count: scheduledPosts.length,
    },
    {
      id: "planejamento",
      label: "📅 Cronograma & Datas",
      icon: Calendar,
      count: editorialPlan.length,
    },
    {
      id: "diagnostico",
      label: "🎯 Diagnóstico & IA",
      icon: Target,
    },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Cabeçalho Executivo Limpo & Focado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
              Marketing &amp; Presença Visual
            </h1>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-0.5 text-[10px] font-mono tracking-widest text-sky-300 font-bold uppercase flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              <span>Motor Gemini IA</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans max-w-2xl">
            Mosaico oficial de 9 artes de alto luxo (Arina TVA), agenda editorial de datas e inteligência de contra-ataque a concorrentes.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsManualUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 cursor-pointer shadow-md"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload Manual</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback Global */}
      {globalFeedbackMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 text-xs font-mono text-emerald-300 flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{globalFeedbackMsg}</span>
        </div>
      )}

      {/* Navegação Clara em 3 Pilares Naturais */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.08] p-1.5 shadow-xl backdrop-blur-2xl">
          <div className="relative z-10 flex items-center gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeGrowthTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGrowthTab(tab.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="growthTabActivePill"
                      className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 shadow-sm"
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-zinc-300" />
                    <span>{tab.label}</span>

                    {typeof tab.count === "number" && tab.count > 0 && (
                      <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-zinc-400 border border-white/10"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTEÚDO DO PILAR SELECIONADO */}
      <div className="relative">
        {/* Pilar 1: Vitrine 3x3 do Instagram (Tela Principal) */}
        {activeGrowthTab === "feed" && (
          <div className="animate-in fade-in duration-200">
            <InstagramFeedGridView />
          </div>
        )}

        {/* Pilar 2: Planejamento & Cronograma de Datas */}
        {activeGrowthTab === "planejamento" && (
          <div className="animate-in fade-in duration-200">
            <EditorialPlanningView />
          </div>
        )}

        {/* Pilar 3: Diagnóstico da Empresa & Concorrentes */}
        {activeGrowthTab === "diagnostico" && (
          <div className="animate-in fade-in duration-200">
            <CompetitorsDiagnosticView />
          </div>
        )}
      </div>

      {/* Modal de Upload Manual Global */}
      <ManualAssetUploadModal
        isOpen={isManualUploadOpen}
        onClose={() => setIsManualUploadOpen(false)}
        onSuccess={() => {
          setGlobalFeedbackMsg("Ativo manual inserido com sucesso na grade do Instagram!");
          setTimeout(() => setGlobalFeedbackMsg(null), 4000);
        }}
      />
    </div>
  );
}
