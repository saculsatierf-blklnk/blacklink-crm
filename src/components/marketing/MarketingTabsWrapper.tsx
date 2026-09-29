"use client";

import { Calendar, Sparkles } from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";
import { CreativeStudioWizard } from "@/components/marketing/studio/CreativeStudioWizard";
import { AdPerformanceTable } from "@/components/marketing/AdPerformanceTable";
import { MarketingScheduleView } from "@/components/marketing/MarketingScheduleView";

export function MarketingTabsWrapper() {
  const { activeMarketingTab, setActiveMarketingTab, scheduledPosts } = useMarketingStore();

  const pendingApprovalsCount = scheduledPosts.filter(
    (p) => p.status === "awaiting_approval"
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Seletor de Sub-abas Estilo Apple Glass Segmented Control */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl w-fit shadow-xl shadow-black/40">
        <button
          type="button"
          onClick={() => setActiveMarketingTab("studio")}
          className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs transition-all duration-300 cursor-pointer ${
            activeMarketingTab === "studio"
              ? "bg-white/[0.12] border border-white/20 text-white font-semibold shadow-sm tracking-tight"
              : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span>Estúdio de Criação & Tráfego</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMarketingTab("schedule")}
          className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs transition-all duration-300 cursor-pointer ${
            activeMarketingTab === "schedule"
              ? "bg-white/[0.12] border border-white/20 text-white font-semibold shadow-sm tracking-tight"
              : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-white" />
          <span>Cronograma & Aprovação</span>
          {pendingApprovalsCount > 0 && (
            <span className="ml-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              {pendingApprovalsCount} pendente{pendingApprovalsCount > 1 ? "s" : ""}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
      {activeMarketingTab === "studio" ? (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* ESTÚDIO DE CO-CRIAÇÃO PROGRESSIVA WIZARD 3 ETAPAS */}
          <CreativeStudioWizard />

          {/* MONITORAMENTO & ROBÔ DE TRÁFEGO PAGO */}
          <div className="pt-6 border-t border-white/10">
            <AdPerformanceTable />
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <MarketingScheduleView />
        </div>
      )}
    </div>
  );
}
