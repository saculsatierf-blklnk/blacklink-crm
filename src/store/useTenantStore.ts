import { create } from "zustand";

export interface Tenant {
  id: string;
  name: string;
  code: string;
  segment: string;
  activeContracts: number;
}

export type DealStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Deal {
  id: string;
  tenantId: string;
  title: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  value: number;
  stage: DealStage;
  serviceCategory:
    | "Engenharia de Software"
    | "Automações & Inteligência Artificial"
    | "Tráfego de Performance & Growth"
    | "Infraestrutura & Inteligência de Dados";
  probability: number;
  expectedCloseDate: string;
  owner: string;
  createdAt: string;
}

export interface LeadAccount {
  id: string;
  tenantId: string;
  companyName: string;
  decisionMaker: string;
  email: string;
  phone: string;
  annualRevenueTier: string;
  status: "Novo" | "Contatado" | "Em Qualificação" | "Proposta Enviada" | "Cliente Ativo";
  serviceOfInterest: string;
  lastInteraction: string;
}

interface TenantState {
  tenants: Tenant[];
  activeTenantId: string;
  currentView: "dashboard" | "pipeline" | "leads" | "portal" | "settings";
  deals: Deal[];
  leads: LeadAccount[];
  searchQuery: string;
  setActiveTenantId: (id: string) => void;
  setCurrentView: (view: "dashboard" | "pipeline" | "leads" | "portal" | "settings") => void;
  setSearchQuery: (query: string) => void;
  updateDealStage: (dealId: string, stage: DealStage) => void;
  addDeal: (deal: Omit<Deal, "id" | "createdAt">) => void;
  addLead: (lead: Omit<LeadAccount, "id" | "lastInteraction">) => void;
}

const initialTenants: Tenant[] = [
  {
    id: "tenant-hq",
    name: "Black Link HQ",
    code: "BLK-HQ",
    segment: "Operações Globais & Estratégia",
    activeContracts: 18,
  },
  {
    id: "tenant-tech",
    name: "Divisão de Engenharia & Software",
    code: "BLK-DEV",
    segment: "Sistemas Sob Medida & Cloud",
    activeContracts: 12,
  },
  {
    id: "tenant-data",
    name: "Divisão de Inteligência & Automações",
    code: "BLK-DATA",
    segment: "Pipelines de IA & Integrações",
    activeContracts: 9,
  },
  {
    id: "tenant-media",
    name: "Divisão de Performance & Mídia",
    code: "BLK-MEDIA",
    segment: "Aquisição High-Ticket & Cobertura",
    activeContracts: 15,
  },
];

const initialDeals: Deal[] = [
  {
    id: "deal-01",
    tenantId: "tenant-hq",
    title: "Plataforma de Trading Algorítmico",
    companyName: "Vanguard Asset Management",
    contactPerson: "Eduardo Menezes",
    contactEmail: "eduardo@vanguard.com.br",
    value: 180000,
    stage: "negotiation",
    serviceCategory: "Engenharia de Software",
    probability: 85,
    expectedCloseDate: "2026-10-25",
    owner: "Lucas S.",
    createdAt: "2026-09-01",
  },
  {
    id: "deal-02",
    tenantId: "tenant-tech",
    title: "SaaS de Conciliação Financeira Multi-tenant",
    companyName: "Nexus Capital Tech",
    contactPerson: "Camila Guimarães",
    contactEmail: "camila.g@nexuscap.io",
    value: 125000,
    stage: "proposal",
    serviceCategory: "Engenharia de Software",
    probability: 70,
    expectedCloseDate: "2026-11-05",
    owner: "Lucas S.",
    createdAt: "2026-09-08",
  },
  {
    id: "deal-03",
    tenantId: "tenant-data",
    title: "Automação Operacional com Agentes de IA",
    companyName: "Logix Supply Chain",
    contactPerson: "Rafael Albuquerque",
    contactEmail: "rafael@logixsupply.com",
    value: 95000,
    stage: "qualification",
    serviceCategory: "Automações & Inteligência Artificial",
    probability: 50,
    expectedCloseDate: "2026-11-18",
    owner: "Lucas S.",
    createdAt: "2026-09-12",
  },
  {
    id: "deal-04",
    tenantId: "tenant-media",
    title: "Ecossistema de Aquisição B2B High-Ticket",
    companyName: "OmniCorp Seguros",
    contactPerson: "Fernando Diniz",
    contactEmail: "fdiniz@omnicorp.com.br",
    value: 220000,
    stage: "won",
    serviceCategory: "Tráfego de Performance & Growth",
    probability: 100,
    expectedCloseDate: "2026-09-28",
    owner: "Lucas S.",
    createdAt: "2026-08-20",
  },
  {
    id: "deal-05",
    tenantId: "tenant-hq",
    title: "Infraestrutura de Nuvem e Microsserviços",
    companyName: "Aura Finanças Corporativas",
    contactPerson: "Renata Vasconcellos",
    contactEmail: "renata@aurafin.com",
    value: 140000,
    stage: "prospecting",
    serviceCategory: "Infraestrutura & Inteligência de Dados",
    probability: 30,
    expectedCloseDate: "2026-12-01",
    owner: "Lucas S.",
    createdAt: "2026-09-14",
  },
];

const initialLeads: LeadAccount[] = [
  {
    id: "lead-01",
    tenantId: "tenant-hq",
    companyName: "Vanguard Asset Management",
    decisionMaker: "Eduardo Menezes (CTO)",
    email: "eduardo@vanguard.com.br",
    phone: "+55 (11) 98842-1090",
    annualRevenueTier: "R$ 50M - R$ 100M",
    status: "Proposta Enviada",
    serviceOfInterest: "Engenharia de Software",
    lastInteraction: "2026-09-14",
  },
  {
    id: "lead-02",
    tenantId: "tenant-tech",
    companyName: "Nexus Capital Tech",
    decisionMaker: "Camila Guimarães (Head de Inovação)",
    email: "camila.g@nexuscap.io",
    phone: "+55 (11) 97721-4432",
    annualRevenueTier: "R$ 20M - R$ 50M",
    status: "Em Qualificação",
    serviceOfInterest: "Engenharia de Software",
    lastInteraction: "2026-09-15",
  },
  {
    id: "lead-03",
    tenantId: "tenant-data",
    companyName: "Logix Supply Chain",
    decisionMaker: "Rafael Albuquerque (COO)",
    email: "rafael@logixsupply.com",
    phone: "+55 (41) 99120-7761",
    annualRevenueTier: "R$ 100M+",
    status: "Em Qualificação",
    serviceOfInterest: "Automações & Inteligência Artificial",
    lastInteraction: "2026-09-12",
  },
  {
    id: "lead-04",
    tenantId: "tenant-media",
    companyName: "OmniCorp Seguros",
    decisionMaker: "Fernando Diniz (Diretor Comercial)",
    email: "fdiniz@omnicorp.com.br",
    phone: "+55 (11) 99876-0012",
    annualRevenueTier: "R$ 150M+",
    status: "Cliente Ativo",
    serviceOfInterest: "Tráfego de Performance & Growth",
    lastInteraction: "2026-09-13",
  },
  {
    id: "lead-05",
    tenantId: "tenant-hq",
    companyName: "Aura Finanças Corporativas",
    decisionMaker: "Renata Vasconcellos (CEO)",
    email: "renata@aurafin.com",
    phone: "+55 (21) 98112-9900",
    annualRevenueTier: "R$ 10M - R$ 30M",
    status: "Novo",
    serviceOfInterest: "Infraestrutura & Inteligência de Dados",
    lastInteraction: "2026-09-15",
  },
];

export const useTenantStore = create<TenantState>((set) => ({
  tenants: initialTenants,
  activeTenantId: "tenant-hq",
  currentView: "dashboard",
  deals: initialDeals,
  leads: initialLeads,
  searchQuery: "",

  setActiveTenantId: (id) => set({ activeTenantId: id }),
  setCurrentView: (view) => set({ currentView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  updateDealStage: (dealId, stage) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === dealId ? { ...deal, stage } : deal
      ),
    })),

  addDeal: (dealData) =>
    set((state) => {
      const newDeal: Deal = {
        ...dealData,
        id: `deal-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      return { deals: [newDeal, ...state.deals] };
    }),

  addLead: (leadData) =>
    set((state) => {
      const newLead: LeadAccount = {
        ...leadData,
        id: `lead-${Date.now()}`,
        lastInteraction: new Date().toISOString().split("T")[0],
      };
      return { leads: [newLead, ...state.leads] };
    }),
}));
