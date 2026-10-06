"use client";

import { useState } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Cpu,
  Flame,
  Grid,
  Layers,
  Smartphone,
  Sparkles,
  Target,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketingStore, type GrowthTab } from "@/store/useMarketingStore";
import { CompetitorsDiagnosticView } from "@/components/marketing/growth/CompetitorsDiagnosticView";
import { EditorialPlanningView } from "@/components/marketing/growth/EditorialPlanningView";
import { BlackLinkCarouselStudio } from "@/components/estudio/BlackLinkCarouselStudio";
import { InstagramFeedGridView } from "@/components/marketing/growth/InstagramFeedGridView";
import { AdPerformanceTable } from "@/components/marketing/AdPerformanceTable";
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

  const TABS: { id: GrowthTab; step: string; label: string; icon: any }[] = [
    {
      id: "diagnostico",
      step: "01",
      label: "Diagnóstico & Concorrentes",
      icon: Target,
    },
    {
      id: "planejamento",
      step: "02",
      label: "Planejamento & Cronograma",
      icon: Calendar,
    },
    {
      id: "estudio",
      step: "03",
      label: "Estúdio de Criação",
      icon: Wand2,
    },
    {
      id: "feed",
      step: "04",
      label: "Prévias do Instagram",
      icon: Smartphone,
    },
    {
      id: "performance",
      step: "05",
      label: "Performance & Métricas",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho do CRM de Growth & Marketing B2B */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white font-heading">
              CRM de Marketing &amp; Conteúdo B2B
            </h1>
            <span className="rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Diagnóstico ➔ Produção ➔ Feed
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-400 mt-1.5 leading-relaxed font-sans max-w-3xl">
            Esteira completa de inteligência: da análise de concorrentes e planejamento editorial à criação de carrosséis e vitrine visual do Instagram.
          </p>
        </div>

        {/* Ações Rápidas do Topo */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsManualUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload de Ativo</span>
          </button>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-xs font-mono text-zinc-300 flex items-center gap-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Motor 60fps &amp; Isolado</span>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback Global */}
      {globalFeedbackMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 text-xs font-mono text-emerald-300 flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{globalFeedbackMsg}</span>
        </div>
      )}

      {/* Segmented Control no Topo: 5 Etapas da Jornada de Marketing */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.08] p-1.5 shadow-2xl backdrop-blur-2xl w-full max-w-full overflow-x-auto">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-1.5 min-w-max">
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
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? "bg-white/20 text-white" : "text-zinc-500"
                  }`}>
                    {tab.step}
                  </span>
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>

                  {tab.id === "feed" && scheduledPosts.length > 0 && (
                    <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-1.5 py-0.2 text-[9px] font-mono font-bold text-sky-300">
                      {scheduledPosts.length}
                    </span>
                  )}
                  {tab.id === "planejamento" && editorialPlan.length > 0 && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-300">
                      {editorialPlan.length}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO DINÂMICO CONECTADO POR ETAPA */}
      <div className="relative">
        {/* Etapa 1: Diagnóstico da Empresa & Concorrentes */}
        {activeGrowthTab === "diagnostico" && (
          <div className="animate-in fade-in duration-200">
            <CompetitorsDiagnosticView />
          </div>
        )}

        {/* Etapa 2: Planejamento & Cronograma de Postagens */}
        {activeGrowthTab === "planejamento" && (
          <div className="animate-in fade-in duration-200">
            <EditorialPlanningView />
          </div>
        )}

        {/* Etapa 3: Estúdio de Criação (Canvas 1080px Isolado a 60fps) */}
        {activeGrowthTab === "estudio" && (
          <div className="animate-in fade-in duration-200">
            <BlackLinkCarouselStudio />
          </div>
        )}

        {/* Etapa 4: Feed & Vitrine do Instagram (Posts Prontos) */}
        {activeGrowthTab === "feed" && (
          <div className="animate-in fade-in duration-200">
            <InstagramFeedGridView />
          </div>
        )}

        {/* Etapa 5: Performance & Métricas de Tráfego Pago */}
        {activeGrowthTab === "performance" && (
          <div className="animate-in fade-in duration-200">
            <AdPerformanceTable />
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
