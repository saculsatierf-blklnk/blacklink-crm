import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TourStep {
  id: string;
  target: string; // seletor data-tour="target"
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  badge?: string;
  actionUrl?: string;
  actionText?: string;
}

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: "brand",
    target: "sidebar-brand",
    title: "Bem-vindo ao Black Link CRM",
    badge: "Visão Geral",
    description:
      "Esta é a sua central de inteligência B2B. A barra lateral conecta o Dashboard analítico, a esteira de prospecção e as ferramentas operacionais do seu negócio.",
    placement: "right",
  },
  {
    id: "navigation",
    target: "sidebar-nav",
    title: "Navegação & Módulos",
    badge: "Módulos",
    description:
      "Navegue entre o Painel Executivo, a esteira de Leads B2B e o novo gerador autônomo de Marketing & Tráfego Pago.",
    placement: "right",
  },
  {
    id: "search",
    target: "header-search",
    title: "Busca Rápida de Contas",
    badge: "Localizador",
    description:
      "Encontre empresas, decisores, telefones ou e-mails em tempo real sem precisar navegar manualmente por listas.",
    placement: "bottom",
  },
  {
    id: "team",
    target: "header-team",
    title: "Gestão de Equipe & Permissões",
    badge: "Administração",
    description:
      "Como Administrador, você pode cadastrar outros administradores ou novos operadores comerciais, controlando quem gerencia cada conta.",
    placement: "bottom",
  },
  {
    id: "metrics",
    target: "metrics-grid",
    title: "Métricas Reais em Tabula Rasa",
    badge: "Indicadores",
    description:
      "Seus dados iniciam 100% limpos. O sistema calcula automaticamente o volume de leads ativos, taxa de conversão e o pipeline financeiro conforme as reuniões acontecem.",
    placement: "bottom",
  },
  {
    id: "new-lead",
    target: "dashboard-new-lead",
    title: "Cadastro com Radar Anti-Colisão",
    badge: "Ação Principal",
    description:
      "Adicione novas contas com máscara de telefone brasileira automática (+55 DDD 9XXXX-XXXX) e validação anti-duplicidade em tempo real.",
    placement: "left",
    actionUrl: "/leads",
    actionText: "Ir para a Esteira de Leads",
  },
];

export const KANBAN_TOUR_STEPS: TourStep[] = [
  {
    id: "kanban-new-lead",
    target: "kanban-new-lead",
    title: "Criar Lead na Esteira",
    badge: "Entrada de Contas",
    description:
      "Inicie o ciclo de prospecção inserindo o nome da empresa e os dados do decisor. O sistema atribui o operador responsável automaticamente.",
    placement: "bottom",
  },
  {
    id: "operator-filter",
    target: "kanban-operator-filter",
    title: "Silo de Propriedade",
    badge: "Filtro por Operador",
    description:
      "Isole a esteira de prospecção por operador (Hunter) ou visualize o panorama consolidado de todas as contas da organização.",
    placement: "bottom",
  },
  {
    id: "kanban-board",
    target: "kanban-columns",
    title: "Fases da Prospecção",
    badge: "Pipeline Visual",
    description:
      "Arraste os cards de leads entre 'Novo Lead', 'Em Prospecção' e 'Fechado'. Ao clicar em um card, você acessa a lista de cadência diária estilo iPhone.",
    placement: "top",
  },
];

interface TourState {
  isActive: boolean;
  currentStepIndex: number;
  steps: TourStep[];
  hasSeenTour: boolean;
  startTour: (steps?: TourStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  resetTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStepIndex: 0,
      steps: DASHBOARD_TOUR_STEPS,
      hasSeenTour: false,

      startTour: (customSteps) => {
        set({
          isActive: true,
          currentStepIndex: 0,
          steps: customSteps && customSteps.length > 0 ? customSteps : DASHBOARD_TOUR_STEPS,
        });
      },

      nextStep: () => {
        const { currentStepIndex, steps } = get();
        if (currentStepIndex < steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          set({ isActive: false, hasSeenTour: true });
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipTour: () => {
        set({ isActive: false, hasSeenTour: true });
      },

      resetTour: () => {
        set({
          isActive: true,
          currentStepIndex: 0,
          hasSeenTour: false,
          steps: DASHBOARD_TOUR_STEPS,
        });
      },
    }),
    {
      name: "blacklink-tour-storage",
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
