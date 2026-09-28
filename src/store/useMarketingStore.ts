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
  ctr: number; // %
  roas: number; // x
  impressions: number;
  clicks: number;
  conversions: number;
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

  setFormData: (data: Partial<MarketingFormData>) => void;
  setFormat: (format: CreativeFormat) => void;
  generateCreatives: () => Promise<GeneratedCreativeResult | null>;
  setActiveResult: (result: GeneratedCreativeResult | null) => void;
  resetForm: () => void;
}

const INITIAL_FORM_DATA: MarketingFormData = {
  theme: "",
  targetAudience: "",
  competitorsReferences: "",
  format: "carousel",
};

const BASE_CAMPAIGNS: AdPerformanceItem[] = [
  {
    id: "ad-01",
    creativeName: "Carrossel: Os 5 Gargalos Ocultos do Funil B2B",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    format: "carousel",
    campaignStatus: "active",
    dailyBudget: 250.0,
    ctr: 3.84,
    roas: 4.8,
    impressions: 42190,
    clicks: 1620,
    conversions: 38,
  },
  {
    id: "ad-02",
    creativeName: "Story: O Fim das Planilhas de Prospecção Desalinhadas",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    format: "story",
    campaignStatus: "active",
    dailyBudget: 180.0,
    ctr: 4.12,
    roas: 5.2,
    impressions: 28400,
    clicks: 1170,
    conversions: 29,
  },
  {
    id: "ad-03",
    creativeName: "Post Único: Dossiê Executivo de Conversão Enterprise",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    format: "post",
    campaignStatus: "learning",
    dailyBudget: 120.0,
    ctr: 2.45,
    roas: 3.1,
    impressions: 11300,
    clicks: 276,
    conversions: 7,
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
          // Atualiza etapas visuais para feedback de alta fidelidade
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
