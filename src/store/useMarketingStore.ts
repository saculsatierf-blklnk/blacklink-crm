import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CreativeFormat = "carousel" | "story" | "post";

export interface CreativeSlide {
  slideNumber: number;
  headline: string;
  bodyText: string;
  imageUrl?: string;
  visualPrompt?: string;
}

export interface GeneratedCreativeResult {
  id: string;
  theme: string;
  format: CreativeFormat;
  targetAudience: string;
  competitorsReferences?: string;
  hookHeadline: string;
  bodyCopy: string;
  ctaText: string;
  hashtags: string[];
  slides: CreativeSlide[];
  imageUrls: string[];
  createdAt: string;
  source: "n8n" | "ai_pipeline";
}

export interface AdPerformanceItem {
  id: string;
  creativeName: string;
  thumbnailUrl: string;
  format: CreativeFormat;
  campaignStatus: "active" | "learning" | "paused";
  dailyBudget: number; // R$
  spend?: number; // R$ gasto acumulado
  ctr: number; // %
  roas: number; // x
  impressions: number;
  clicks: number;
  conversions: number;
  scaleBadge?: string;
  lastRationale?: string;
}

export interface OptimizationLogEntry {
  id: string;
  timestamp: string;
  adSetId: string;
  adSetName: string;
  action: "scale" | "pause" | "maintain";
  previousBudget: number;
  newBudget: number;
  roas: number;
  ctr: number;
  spend: number;
  conversions: number;
  rationale: string;
}

export interface OptimizationSummary {
  totalEvaluated: number;
  scaledCount: number;
  pausedCount: number;
  maintainedCount: number;
  totalDailyBudgetBefore: number;
  totalDailyBudgetAfter: number;
  budgetDelta: number;
  consolidatedRoas: number;
  averageCtr: number;
}

export interface MarketingFormData {
  theme: string;
  targetAudience: string;
  competitorsReferences: string;
  format: CreativeFormat;
}

interface MarketingState {
  formData: MarketingFormData;
  isLoading: boolean;
  statusMessage: string;
  error: string | null;
  activeResult: GeneratedCreativeResult | null;
  history: GeneratedCreativeResult[];
  adCampaigns: AdPerformanceItem[];

  // Estado do Robô Autônomo de Otimização
  isOptimizing: boolean;
  lastOptimizationRun: string | null;
  optimizationSummary: OptimizationSummary | null;
  optimizationLogs: OptimizationLogEntry[];

  setFormData: (data: Partial<MarketingFormData>) => void;
  setFormat: (format: CreativeFormat) => void;
  generateCreatives: () => Promise<GeneratedCreativeResult | null>;
  setActiveResult: (result: GeneratedCreativeResult | null) => void;
  resetForm: () => void;

  // Ações do Agente de Tráfego
  fetchAdPerformance: () => Promise<void>;
  runOptimizationRobot: () => Promise<OptimizationSummary | null>;
  scaleSingleCampaign: (id: string) => Promise<void>;
  toggleCampaignStatus: (id: string) => Promise<void>;
}

const INITIAL_FORM_DATA: MarketingFormData = {
  theme: "",
  targetAudience: "",
  competitorsReferences: "",
  format: "carousel",
};

const BASE_CAMPAIGNS: AdPerformanceItem[] = [
  {
    id: "adset-bl-001",
    creativeName: "Carrossel: Os 5 Gargalos Ocultos do Funil B2B",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    format: "carousel",
    campaignStatus: "active",
    dailyBudget: 250.0,
    spend: 1845.5,
    ctr: 3.84,
    roas: 4.8,
    impressions: 42190,
    clicks: 1620,
    conversions: 38,
    scaleBadge: "VENCEDOR",
  },
  {
    id: "adset-bl-002",
    creativeName: "Story: O Fim das Planilhas de Prospecção Desalinhadas",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
    format: "story",
    campaignStatus: "active",
    dailyBudget: 180.0,
    spend: 1260.0,
    ctr: 4.12,
    roas: 5.2,
    impressions: 28400,
    clicks: 1170,
    conversions: 29,
    scaleBadge: "VENCEDOR",
  },
  {
    id: "adset-bl-003",
    creativeName: "Post Único: Dossiê Executivo de Conversão Enterprise",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80",
    format: "post",
    campaignStatus: "learning",
    dailyBudget: 120.0,
    spend: 420.0,
    ctr: 2.45,
    roas: 3.1,
    impressions: 11300,
    clicks: 276,
    conversions: 7,
  },
  {
    id: "adset-bl-004",
    creativeName: "Carrossel: Comparativo de Retenção & Radar Anti-Colisão",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80",
    format: "carousel",
    campaignStatus: "active",
    dailyBudget: 150.0,
    spend: 890.0,
    ctr: 2.68,
    roas: 3.9,
    impressions: 19800,
    clicks: 530,
    conversions: 14,
    scaleBadge: "VENCEDOR",
  },
  {
    id: "adset-bl-005",
    creativeName: "Story: Abordagens Desatualizadas de Outbound",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    format: "story",
    campaignStatus: "active",
    dailyBudget: 100.0,
    spend: 650.0,
    ctr: 0.79,
    roas: 1.4,
    impressions: 14200,
    clicks: 112,
    conversions: 2,
    scaleBadge: "SUB-PERFORMER",
  },
];

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set, get) => ({
      formData: INITIAL_FORM_DATA,
      isLoading: false,
      statusMessage: "",
      error: null,
      activeResult: null,
      history: [],
      adCampaigns: BASE_CAMPAIGNS,

      isOptimizing: false,
      lastOptimizationRun: null,
      optimizationSummary: null,
      optimizationLogs: [],

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setFormat: (format) =>
        set((state) => ({
          formData: { ...state.formData, format },
        })),

      setActiveResult: (result) => set({ activeResult: result }),

      resetForm: () => set({ formData: INITIAL_FORM_DATA, error: null }),

      generateCreatives: async () => {
        const { formData, history } = get();

        if (!formData.theme.trim()) {
          set({ error: "Por favor, defina o tema principal do criativo." });
          return null;
        }

        set({
          isLoading: true,
          error: null,
          statusMessage: "Disparando automação para o webhook do n8n...",
        });

        try {
          const statusTimer1 = setTimeout(() => {
            set({ statusMessage: "Processando persona e referências com IA..." });
          }, 800);

          const statusTimer2 = setTimeout(() => {
            set({ statusMessage: "Compondo carrosséis e copywriting persuasivo..." });
          }, 1800);

          const response = await fetch("/api/marketing/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          clearTimeout(statusTimer1);
          clearTimeout(statusTimer2);

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Falha na comunicação com o gerador n8n.");
          }

          const result: GeneratedCreativeResult = await response.json();

          set({
            isLoading: false,
            statusMessage: "",
            activeResult: result,
            history: [result, ...history.filter((h) => h.id !== result.id)].slice(0, 10),
          });

          return result;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Erro desconhecido ao gerar criativos.";
          set({
            isLoading: false,
            statusMessage: "",
            error: message,
          });
          return null;
        }
      },

      fetchAdPerformance: async () => {
        try {
          const res = await fetch("/api/marketing/ads/performance");
          if (!res.ok) return;
          const data = await res.json();
          if (data && Array.isArray(data.campaigns)) {
            const mappedCampaigns: AdPerformanceItem[] = data.campaigns.map((c: any) => ({
              id: c.id,
              creativeName: c.name,
              thumbnailUrl: c.thumbnailUrl,
              format: c.format,
              campaignStatus: c.status,
              dailyBudget: c.dailyBudget,
              spend: c.spend,
              ctr: c.ctr,
              roas: c.roas,
              impressions: c.impressions,
              clicks: c.clicks,
              conversions: c.conversions,
              scaleBadge:
                c.roas >= 3.5 && c.ctr >= 2.5
                  ? "VENCEDOR"
                  : c.roas < 2.0 || c.ctr < 1.0
                  ? "SUB-PERFORMER"
                  : undefined,
            }));

            set({ adCampaigns: mappedCampaigns });
          }
        } catch (e) {
          console.warn("Falha ao sincronizar métricas de anúncios com o servidor:", e);
        }
      },

      runOptimizationRobot: async () => {
        set({ isOptimizing: true, error: null });

        try {
          const res = await fetch("/api/marketing/ads/optimize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            throw new Error("Falha ao comunicar com o Robô de Otimização.");
          }

          const data = await res.json();

          if (!data.success) {
            throw new Error(data.error || "Erro no processamento da otimização.");
          }

          const mappedCampaigns: AdPerformanceItem[] = data.updatedCampaigns.map((c: any) => {
            const matchingLog = data.auditLogs?.find((l: any) => l.adSetId === c.id);
            return {
              id: c.id,
              creativeName: c.name,
              thumbnailUrl: c.thumbnailUrl,
              format: c.format,
              campaignStatus: c.status,
              dailyBudget: c.dailyBudget,
              spend: c.spend,
              ctr: c.ctr,
              roas: c.roas,
              impressions: c.impressions,
              clicks: c.clicks,
              conversions: c.conversions,
              scaleBadge:
                matchingLog?.action === "scale"
                  ? "ESCALADO (+20%)"
                  : matchingLog?.action === "pause"
                  ? "PAUSADO"
                  : undefined,
              lastRationale: matchingLog?.rationale,
            };
          });

          set({
            isOptimizing: false,
            adCampaigns: mappedCampaigns,
            lastOptimizationRun: data.executedAt,
            optimizationSummary: data.summary,
            optimizationLogs: data.auditLogs || [],
          });

          return data.summary;
        } catch (err: any) {
          set({
            isOptimizing: false,
            error: err?.message || "Erro ao rodar robô de otimização.",
          });
          return null;
        }
      },

      scaleSingleCampaign: async (id: string) => {
        const { adCampaigns } = get();
        const target = adCampaigns.find((c) => c.id === id);
        if (!target) return;

        const newBudget = Math.round(target.dailyBudget * 1.2 * 100) / 100;
        const updated = adCampaigns.map((c) =>
          c.id === id
            ? {
                ...c,
                dailyBudget: newBudget,
                campaignStatus: "active" as const,
                scaleBadge: "ESCALADO (+20%)",
                lastRationale: `Escala manual pontual: +20% aplicado (R$ ${target.dailyBudget.toFixed(2)} -> R$ ${newBudget.toFixed(2)}).`,
              }
            : c
        );

        set({ adCampaigns: updated });
      },

      toggleCampaignStatus: async (id: string) => {
        const { adCampaigns } = get();
        const target = adCampaigns.find((c) => c.id === id);
        if (!target) return;

        const nextStatus = target.campaignStatus === "paused" ? "active" : "paused";
        const updated = adCampaigns.map((c) =>
          c.id === id
            ? {
                ...c,
                campaignStatus: nextStatus as "active" | "paused",
                scaleBadge: nextStatus === "paused" ? "PAUSADO" : undefined,
              }
            : c
        );

        set({ adCampaigns: updated });
      },
    }),
    {
      name: "blacklink-marketing-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
