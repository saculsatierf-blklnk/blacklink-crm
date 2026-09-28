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
    <div className="space-y-6">
      {/* Seletor de Sub-abas Estilo Dark Industrial */}
      <div className="flex items-center gap-2 border-b border-glass-border/70 pb-3">
        <button
          type="button"
          onClick={() => setActiveMarketingTab("studio")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono transition-all cursor-pointer ${
            activeMarketingTab === "studio"
              ? "bg-carbon border border-glass-highlight text-platinum font-bold shadow-lg"
              : "border border-transparent text-sub hover:text-platinum hover:bg-carbon/40"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Estúdio de Criação & Tráfego</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMarketingTab("schedule")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono transition-all cursor-pointer ${
            activeMarketingTab === "schedule"
              ? "bg-carbon border border-glass-highlight text-platinum font-bold shadow-lg"
              : "border border-transparent text-sub hover:text-platinum hover:bg-carbon/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-accent" />
          <span>Cronograma & Aprovação</span>
          {pendingApprovalsCount > 0 && (
            <span className="ml-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.2 text-[10px] font-bold text-amber-400">
              {pendingApprovalsCount} pendente{pendingApprovalsCount > 1 ? "s" : ""}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
      {activeMarketingTab === "studio" ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* ESTÚDIO DE CO-CRIAÇÃO PROGRESSIVA WIZARD 3 ETAPAS */}
          <CreativeStudioWizard />

          {/* MONITORAMENTO & ROBÔ DE TRÁFEGO PAGO */}
          <div className="pt-4 border-t border-glass-border/70">
            <AdPerformanceTable />
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          <MarketingScheduleView />
        </div>
      )}
    </div>
  );
}
