import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CreativeFormat = "carousel" | "story" | "post";

export type PostApprovalStatus =
  | "awaiting_approval"
  | "reformulation_requested"
  | "scheduled"
  | "published";

export interface CreativeSlide {
  slideNumber: number;
  headline: string;
  bodyText: string;
  imageUrl?: string;
  visualPrompt?: string;
  tag?: string;
}

export interface CompetitorInsightData {
  competitorCliché: string;
  ourDifferentiator: string;
  layoutRationale: string;
}

export interface GeneratedCreativeResult {
  id: string;
  theme: string;
  format: CreativeFormat;
  targetAudience: string;
  competitorsReferences?: string;
  positioningStrategy?: string;
  nicheValueProposition?: string;
  suggestedLayout?: string;
  suggestedFont?: string;
  suggestedTheme?: string;
  competitorInsight?: CompetitorInsightData;
  hookHeadline: string;
  bodyCopy: string;
  ctaText: string;
  hashtags: string[];
  postCaption?: string;
  slides: CreativeSlide[];
  imageUrls: string[];
  createdAt: string;
  source: "n8n" | "ai_pipeline" | "gemini_direct" | "dynamic_synthesizer";
}

export interface ScheduledPost {
  id: string;
  theme: string;
  format: CreativeFormat;
  sourceType?: "ai_generated" | "manual";
  targetAudience?: string;
  nicheValueProposition?: string;
  scheduledDate: string; // "2026-10-01 10:00" ou ISO
  status: PostApprovalStatus;
  hookHeadline: string;
  bodyCopy: string;
  ctaText: string;
  hashtags: string[];
  postCaption?: string;
  slides: CreativeSlide[];
  imageUrls: string[];
  reformulationFeedback?: string;
  lastReformulatedAt?: string;
  publishedAt?: string;
  metaPostId?: string;
  createdAt: string;
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
  nicheValueProposition: string;
  theme: string;
  targetAudience: string;
  competitorsReferences: string;
  format: CreativeFormat;
}

export type GrowthTab =
  | "diagnostico"
  | "planejamento"
  | "estudio"
  | "feed"
  | "performance";

export interface CompanyProfile {
  name: string;
  instagram: string;
  website: string;
  niche: string;
  products: string;
  targetAudience: string;
  bio?: string;
  tagline?: string;
  profileType?: "company" | "influencer";
}

export interface CompetitorItem {
  id: string;
  name: string;
  handle: string;
  level: "direct" | "indirect" | "leader";
  strength: string;
  vulnerabilityOrCliché: string;
  differentiator: string;
}

export interface ViralMethodAngle {
  id: string;
  hookPattern: string;
  viralMechanism: string;
  whyItWorks: string;
  suggestedFormat: "carousel" | "post";
}

export interface CompetitorsDiagnostic {
  executiveSummary: string;
  competitors: CompetitorItem[];
  viralMethods: ViralMethodAngle[];
  lastAnalyzedAt: string | null;
}

export interface DailyActivityItem {
  id: string;
  time: string; // Horário calculado pelo Agente Especialista de IA
  period: "manha" | "tarde" | "noite";
  format: CreativeFormat; // "story" | "carousel" | "post"
  theme: string;
  hookHeadline: string;
  objective: string;
  ctaText: string;
  funnelStage: "topo" | "meio" | "fundo";
  status?: "planejado" | "em_producao" | "pronto";
  briefingNotes?: string;
  aiRationale?: string; // Motivo algorítmico do Agente de IA para a escolha do horário e formato
}

export interface CadenceStrategy {
  agentRole: string;
  strategyName: string;
  rationale: string;
  peakEngagementWindows: string[];
  recommendedVolume: string;
  targetPersonaHabits: string;
  lastOptimizedAt: string;
}

export interface AgendaDay {
  index: number;
  shortName: string;
  fullName: string;
  dateNumber: string;
  monthStr: string;
  fullDateLabel: string;
  dayLabel: string;
  isToday: boolean;
  strategicFocus: string;
  activities: DailyActivityItem[];
}

export interface EditorialPlanItem {
  id: string;
  dayNumber: number;
  dayLabel: string;
  theme: string;
  hookHeadline: string;
  format: CreativeFormat;
  funnelStage: "topo" | "meio" | "fundo";
  objective: string;
  viralAngle: string;
  ctaText: string;
  status: "planejado" | "em_producao" | "pronto";
  scheduledTime?: string;
  activities?: DailyActivityItem[];
}

export type FeedViewMode = "grid" | "feed" | "visor";

interface MarketingState {
  // Navegação da Jornada de Growth Marketing B2B
  activeGrowthTab: GrowthTab;
  setActiveGrowthTab: (tab: GrowthTab) => void;

  // 1. Diagnóstico da Empresa & Concorrentes
  companyProfile: CompanyProfile;
  setCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  competitorsDiagnostic: CompetitorsDiagnostic;
  isAnalyzingCompetitors: boolean;
  analyzeCompanyAndCompetitors: () => Promise<void>;

  // 2. Planejamento Estratégico, Cronograma & Agente de Cadência Editorial
  editorialPlan: EditorialPlanItem[];
  isGeneratingPlan: boolean;
  generateEditorialPlan: () => Promise<void>;
  selectedPlanForCreation: EditorialPlanItem | null;
  selectPlanForCreation: (plan: EditorialPlanItem | null) => void;
  addPlanItem: (item: Omit<EditorialPlanItem, "id">) => void;
  updatePlanItem: (id: string, updates: Partial<EditorialPlanItem>) => void;

  // Agente Especialista em Cadência Editorial & Algoritmo do Instagram
  cadenceStrategy: CadenceStrategy;
  weeklyAgenda: AgendaDay[];
  isOptimizingCadence: boolean;
  optimizeCadenceWithAI: () => Promise<void>;
  updateDayActivity: (
    dayIndex: number,
    activityId: string,
    updates: Partial<DailyActivityItem>
  ) => void;

  // 4. Feed & Vitrine do Instagram (Prévias)
  feedViewMode: FeedViewMode;
  setFeedViewMode: (mode: FeedViewMode) => void;
  selectedFeedPost: ScheduledPost | null;
  setSelectedFeedPost: (post: ScheduledPost | null) => void;
  updateScheduledPost: (id: string, updates: Partial<ScheduledPost>) => void;
  approveStudioArtToFeed: (
    postData: Partial<ScheduledPost>,
    planId?: string
  ) => ScheduledPost;

  // Navegação Legada
  activeMarketingTab: "studio" | "schedule" | "carousel-studio";
  setActiveMarketingTab: (tab: "studio" | "schedule" | "carousel-studio") => void;

  // Wizard de Co-criação Estilo CarrosseIA (3 Etapas)
  currentWizardStep: 1 | 2 | 3;
  setWizardStep: (step: 1 | 2 | 3) => void;
  activeEditingSlideIndex: number;
  setActiveEditingSlideIndex: (index: number) => void;
  draftCarousel: ScheduledPost | null;
  setDraftCarousel: (draft: ScheduledPost | null) => void;
  updateDraftSlide: (
    slideIndex: number,
    field: "headline" | "bodyText",
    value: string
  ) => void;
  updateDraftCaption: (caption: string) => void;
  updateDraftHashtags: (hashtags: string[]) => void;
  saveDraftToSchedule: (scheduledDate?: string) => Promise<boolean>;
  resetStudioWizard: () => void;

  formData: MarketingFormData;
  isLoading: boolean;
  statusMessage: string;
  error: string | null;
  activeResult: GeneratedCreativeResult | null;
  history: GeneratedCreativeResult[];
  adCampaigns: AdPerformanceItem[];

  // Cronograma de Aprovação Multi-tenant
  scheduledPosts: ScheduledPost[];
  isApprovingPostId: string | null;
  isReformulatingPostId: string | null;

  // Robô de Otimização Autônoma
  isOptimizing: boolean;
  lastOptimizationRun: string | null;
  optimizationSummary: OptimizationSummary | null;
  optimizationLogs: OptimizationLogEntry[];

  // Ações do Gerador
  setFormData: (data: Partial<MarketingFormData>) => void;
  setFormat: (format: CreativeFormat) => void;
  generateCreatives: () => Promise<GeneratedCreativeResult | null>;
  setActiveResult: (result: GeneratedCreativeResult | null) => void;
  resetForm: () => void;

  // Ações do Cronograma & Aprovação
  approvePost: (id: string) => Promise<boolean>;
  updateCaption: (id: string, newText: string) => void;
  requestReformulation: (id: string, feedback: string) => Promise<boolean>;
  addManualPost: (newPost: ScheduledPost) => void;

  // Ações do Agente de Tráfego
  fetchAdPerformance: () => Promise<void>;
  runOptimizationRobot: () => Promise<OptimizationSummary | null>;
  scaleSingleCampaign: (id: string) => Promise<void>;
  toggleCampaignStatus: (id: string) => Promise<void>;
}

const INITIAL_FORM_DATA: MarketingFormData = {
  nicheValueProposition: "Inteligência comercial B2B e automação de prospecção sem colisões de equipe",
  theme: "Como Dominar Contas Enterprise sem Perder Margem Operacional",
  targetAudience: "Diretores Comerciais, CEOs e Heads de Vendas B2B",
  competitorsReferences: "Comunicação minimalista em Dark Industrial, dados densos e sem jargões rasos",
  format: "carousel",
};

const INITIAL_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: "post-sch-01",
    theme: "Os 5 Gargalos Ocultos do Funil B2B",
    format: "carousel",
    targetAudience: "Decisores B2B, CEOs e Diretores Comerciais",
    scheduledDate: "Amanhã • 10:00",
    status: "awaiting_approval",
    hookHeadline: "Como Dominar os Gargalos Ocultos do Funil B2B sem Queimar Margem",
    bodyCopy:
      "A maioria das operações corporativas trava por falta de clareza nos gargalos de esteira.\n\nQuando alinhamos inteligência de dados, cadência de tarefas e blindagem de território, o ciclo médio de fechamento cai pela metade.\n\nConfira os 5 passos estratégicos neste carrossel para implementar agora na sua empresa.",
    ctaText: "Salve este carrossel para consultar na sua próxima reunião de alinhamento comercial.",
    hashtags: ["#VendasB2B", "#BlackLink", "#InteligenciaComercial", "#GestaoEnterprise"],
    slides: [
      {
        slideNumber: 1,
        headline: "O Diagnóstico Real do Funil B2B",
        bodyText: "Por que 80% das empresas continuam utilizando métodos obsoletos de prospecção e como virar o jogo.",
        imageUrl:
          "/api/marketing/render-slide?slide=1&total=5&headline=O+Diagnostico+Real+do+Funil+B2B&body=Por+que+80+das+empresas+continuam+utilizando+metodos+obsoletos+de+prospeccao+e+como+virar+o+jogo.&format=carousel",
      },
      {
        slideNumber: 2,
        headline: "Ponto Crítico: Silos & Colisões",
        bodyText: "Sem radar anti-colisão, seus hunters abordam os mesmos decisores, queimando a reputação corporativa.",
        imageUrl:
          "/api/marketing/render-slide?slide=2&total=5&headline=Ponto+Critico+Silos+e+Colisoes&body=Sem+radar+anti-colisao+seus+hunters+abordam+os+mesmos+decisores.&format=carousel",
      },
      {
        slideNumber: 3,
        headline: "A Regra de Ouro da Cadência",
        bodyText: "Follow-ups espaçados em estilo minimalista para garantir presença executiva sem invasão.",
        imageUrl:
          "/api/marketing/render-slide?slide=3&total=5&headline=A+Regra+de+Ouro+da+Cadencia&body=Follow-ups+espacados+em+estilo+minimalista+para+garantir+presenca.&format=carousel",
      },
      {
        slideNumber: 4,
        headline: "Passagem de Bastão Blindada",
        bodyText: "A transição entre o pré-vendas (SDR) e o Closer não pode perder telemetria de notas ou dores do cliente.",
        imageUrl:
          "/api/marketing/render-slide?slide=4&total=5&headline=Passagem+de+Bastao+Blindada&body=A+transicao+entre+SDR+e+Closer+nao+pode+perder+telemetria.&format=carousel",
      },
      {
        slideNumber: 5,
        headline: "Próxima Ação Executiva",
        bodyText: "Estruture sua máquina de conversão no Black Link CRM e escale suas operações de tráfego pago.",
        imageUrl:
          "/api/marketing/render-slide?slide=5&total=5&headline=Proxima+Acao+Executiva&body=Estruture+sua+maquina+de+conversao+no+Black+Link+CRM.&format=carousel",
      },
    ],
    imageUrls: [
      "/api/marketing/render-slide?slide=1&total=5&headline=O+Diagnostico+Real+do+Funil+B2B&body=Por+que+80+das+empresas+continuam+utilizando+metodos+obsoletos+de+prospeccao+e+como+virar+o+jogo.&format=carousel",
      "/api/marketing/render-slide?slide=2&total=5&headline=Ponto+Critico+Silos+e+Colisoes&body=Sem+radar+anti-colisao+seus+hunters+abordam+os+mesmos+decisores.&format=carousel",
      "/api/marketing/render-slide?slide=3&total=5&headline=A+Regra+de+Ouro+da+Cadencia&body=Follow-ups+espacados+em+estilo+minimalista+para+garantir+presenca.&format=carousel",
      "/api/marketing/render-slide?slide=4&total=5&headline=Passagem+de+Bastao+Blindada&body=A+transicao+entre+SDR+e+Closer+nao+pode+perder+telemetria.&format=carousel",
      "/api/marketing/render-slide?slide=5&total=5&headline=Proxima+Acao+Executiva&body=Estruture+sua+maquina+de+conversao+no+Black+Link+CRM.&format=carousel",
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "post-sch-02",
    theme: "O Fim das Planilhas de Prospecção Desalinhadas",
    format: "story",
    targetAudience: "Heads de Vendas e Diretores Comerciais",
    scheduledDate: "Quarta • 15:00",
    status: "scheduled",
    hookHeadline: "A Verdade que Ninguém Conta sobre Planilhas Comerciais",
    bodyCopy:
      "Se o seu time comercial passa mais tempo preenchendo planilhas do que conversando com decisores, a sua operação está sangrando margem.\n\nToque no link da bio para entender como virar a chave hoje.",
    ctaText: "Responda a este story com 'ESTRATÉGIA' para receber o diagnóstico no Direct.",
    hashtags: ["#OperacaoComercial", "#VendasB2B", "#BlackLink", "#Produtividade"],
    slides: [
      {
        slideNumber: 1,
        headline: "Pare de perder contas qualificadas.",
        bodyText: "O mercado corporativo mudou. O controle em planilhas gera pontos cegos críticos.",
        imageUrl:
          "/api/marketing/render-slide?slide=1&total=3&headline=Pare+de+perder+contas+qualificadas&body=O+mercado+corporativo+mudou.+Controle+em+planilhas+gera+pontos+cegos.&format=story",
      },
      {
        slideNumber: 2,
        headline: "Cadência Diária em Ação",
        bodyText: "Execute tarefas pontuais com hora marcada direto na esteira de prospecção.",
        imageUrl:
          "/api/marketing/render-slide?slide=2&total=3&headline=Cadencia+Diaria+em+Acao&body=Execute+tarefas+pontuais+com+hora+marcada+direto+na+esteira.&format=story",
      },
      {
        slideNumber: 3,
        headline: "Pipeline Blindado",
        bodyText: "Fale diretamente com os especialistas do ecossistema Black Link.",
        imageUrl:
          "/api/marketing/render-slide?slide=3&total=3&headline=Pipeline+Blindado&body=Fale+diretamente+com+os+especialistas+do+ecossistema+Black+Link.&format=story",
      },
    ],
    imageUrls: [
      "/api/marketing/render-slide?slide=1&total=3&headline=Pare+de+perder+contas+qualificadas&body=O+mercado+corporativo+mudou.+Controle+em+planilhas+gera+pontos+cegos.&format=story",
      "/api/marketing/render-slide?slide=2&total=3&headline=Cadencia+Diaria+em+Acao&body=Execute+tarefas+pontuais+com+hora+marcada+direto+na+esteira.&format=story",
      "/api/marketing/render-slide?slide=3&total=3&headline=Pipeline+Blindado&body=Fale+diretamente+com+os+especialistas+do+ecossistema+Black+Link.&format=story",
    ],
    metaPostId: "meta_ig_agendado_984712",
    createdAt: new Date().toISOString(),
  },
  {
    id: "post-sch-03",
    theme: "Dossiê Executivo de Conversão Enterprise",
    format: "post",
    targetAudience: "Diretores Financeiros (CFOs) e CEOs",
    scheduledDate: "Sexta • 09:30",
    status: "reformulation_requested",
    hookHeadline: "Dossiê Estratégico: O Retorno Real sobre CAC em Contas Enterprise",
    bodyCopy:
      "Em mercados corporativos altamente competitivos, o que separa os líderes dos retardatários não é o volume de leads brutos, mas a densidade da qualificação.\n\nAo focar em contas estratégicas, construímos um funil previsível onde cada reunião possui fit real.",
    ctaText: "Comente 'ESCALA' para receber o dossiê executivo completo.",
    hashtags: ["#FinanceiroB2B", "#CAC", "#BlackLink", "#EnterpriseGrowth"],
    reformulationFeedback:
      "Troque o foco de pré-vendas para alinhamento com Diretores Financeiros (CFO) e enfatize retorno sobre investimento comprovado.",
    slides: [
      {
        slideNumber: 1,
        headline: "Retorno sobre Investimento Enterprise",
        bodyText: "Como mitigar o risco de aquisição de clientes com telemetria preditiva de negócios.",
        imageUrl:
          "/api/marketing/render-slide?slide=1&total=1&headline=Retorno+sobre+Investimento+Enterprise&body=Como+mitigar+o+risco+de+aquisicao+de+clientes+com+telemetria+preditiva.&format=post",
      },
    ],
    imageUrls: [
      "/api/marketing/render-slide?slide=1&total=1&headline=Retorno+sobre+Investimento+Enterprise&body=Como+mitigar+o+risco+de+aquisicao+de+clientes+com+telemetria+preditiva.&format=post",
    ],
    createdAt: new Date().toISOString(),
  },
];

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

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: "",
  instagram: "",
  website: "",
  niche: "",
  products: "",
  targetAudience: "",
  bio: "",
  tagline: "",
  profileType: "company",
};

const DEFAULT_DIAGNOSTIC: CompetitorsDiagnostic = {
  executiveSummary:
    "O mercado de prospecção e marketing B2B está saturado de 'dicas genéricas' e layouts padronizados de templates Canva. Para se destacar e viralizar com alta autoridade, a Black Link deve focar no ângulo 'Engenharia de Receita & Dados Densos', quebrando o clichê do coach de vendas e apresentando números de pipeline reais, telas de sistemas e contra-posicionamento direto contra CRMs lentos e burocráticos.",
  competitors: [
    {
      id: "comp-1",
      name: "HubSpot / Salesforce Ecosystem",
      handle: "@salesforce @hubspot",
      level: "leader",
      strength: "Reconhecimento massivo de marca e ecossistema integrado.",
      vulnerabilityOrCliché:
        "Complexidade extrema, custo em dólar proibitivo e postagens corporativas burocráticas sem apelo emocional.",
      differentiator:
        "Black Link: Foco brutal em execução ágil, sem fricção, estúdio de IA integrado nativo e Dark Mode de alta conversão.",
    },
    {
      id: "comp-2",
      name: "CRMs Nacionais Tradicionais",
      handle: "@rdstation @ploomescrm",
      level: "direct",
      strength: "Base instalada no Brasil e canais de inbound consolidados.",
      vulnerabilityOrCliché:
        "Comunicação visual infantil/colorida, templates repetitivos e ausência de motor de IA criativa autônoma.",
      differentiator:
        "Black Link: Visual 'Dark Industrial' sofisticado para decisores C-Level, com esteira de cadência e anti-colisão em tempo real.",
    },
    {
      id: "comp-3",
      name: "Agências de Outbound & Cold Mail",
      handle: "@growth_b2b_agency",
      level: "indirect",
      strength: "Discurso agressivo de geração de leads.",
      vulnerabilityOrCliché:
        "Promessas milagrosas de '100 leads por dia' que desgastam a reputação do domínio corporativo.",
      differentiator:
        "Black Link: Blindagem de domínio corporativo, telemetria preditiva e hand-off direto para fechamento comercial.",
    },
  ],
  viralMethods: [
    {
      id: "vm-1",
      hookPattern: "Os 5 Erros Críticos que Destroem seu CAC no B2B",
      viralMechanism: "Diagnóstico de Sangria Financeira",
      whyItWorks: "Decisores não se movem por novidades, mas por medo de perder dinheiro e ineficiência oculta.",
      suggestedFormat: "carousel",
    },
    {
      id: "vm-2",
      hookPattern: "Por que Empresas de 8 Dígitos Estão Abandonando CRMs Legados",
      viralMechanism: "Contra-Consenso & Tendência Oculta",
      whyItWorks: "Gera curiosidade imediata ao questionar um padrão de mercado estabelecido.",
      suggestedFormat: "carousel",
    },
    {
      id: "vm-3",
      hookPattern: "O Script de Abordagem que Gerou R$ 420k em Retainers (Sem Cold Call Chata)",
      viralMechanism: "Engenharia Reversa de Sucesso Real",
      whyItWorks: "Profissionais B2B salvam carrosséis com roteiros práticos para copiar e testar com a equipe.",
      suggestedFormat: "carousel",
    },
  ],
  lastAnalyzedAt: "05/10/2026 14:00",
};

const DEFAULT_EDITORIAL_PLAN: EditorialPlanItem[] = [
  {
    id: "plan-1",
    dayNumber: 1,
    dayLabel: "Segunda • 06/Out",
    theme: "Os 5 Gargalos Ocultos do Funil B2B",
    hookHeadline: "Sua operação não tem problema de geração de leads. O gargalo é outro.",
    format: "carousel",
    funnelStage: "topo",
    objective: "Atração e conscientização de decisores sobre vazamento de pipeline.",
    viralAngle: "Quebra de paradigma sobre volume vs qualificação real.",
    ctaText: "Comente 'FUNIL' para receber o checklist de diagnóstico.",
    status: "pronto",
  },
  {
    id: "plan-2",
    dayNumber: 2,
    dayLabel: "Quarta • 08/Out",
    theme: "Anti-Colisão: Como 2 Hunters Abordaram o Mesmo CFO e Queimaram o Contrato",
    hookHeadline: "O erro amador de R$ 180k que acontece quando seu CRM não tem radar anti-duplicidade.",
    format: "carousel",
    funnelStage: "meio",
    objective: "Apresentar a dor da falta de blindagem entre operadores comerciais.",
    viralAngle: "Storytelling de bastidores com números reais de perda de receita.",
    ctaText: "Salve este post para revisar as travas de segurança do seu time.",
    status: "planejado",
  },
  {
    id: "plan-3",
    dayNumber: 3,
    dayLabel: "Sexta • 10/Out",
    theme: "Arquitetura de Carrosséis B2B: O Framework de 7 Lâminas que Converte Decisores",
    hookHeadline: "Carrossel de Canva colorido não vende para C-Level. Esta é a estrutura exata de retenção.",
    format: "carousel",
    funnelStage: "meio",
    objective: "Educação técnica e posicionamento da Black Link como referência visual.",
    viralAngle: "Desconstrução de framework passo a passo para salvar e aplicar.",
    ctaText: "Envie este carrossel para o líder de marketing da sua empresa.",
    status: "planejado",
  },
  {
    id: "plan-4",
    dayNumber: 4,
    dayLabel: "Terça • 14/Out",
    theme: "Demonstração Prática: Da Prospecção ao Faturamento em 1 Única Tela",
    hookHeadline: "Veja como funciona o fluxo de trabalho de um time de vendas de elite.",
    format: "carousel",
    funnelStage: "fundo",
    objective: "Demonstração da plataforma Black Link CRM e geração de reuniões qualificadas.",
    viralAngle: "Telas de alta fidelidade e dados ao vivo (Glassmorphism).",
    ctaText: "Toque no link da bio para solicitar uma demonstração executiva.",
    status: "planejado",
  },
];

export const DEFAULT_CADENCE_STRATEGY: CadenceStrategy = {
  agentRole: "Agente Especialista em Cadência & Algoritmo Editorial",
  strategyName: "Cadência Executiva B2B • Retenção de Tomadores de Decisão",
  rationale:
    "Com base em dados de telemetria e comportamento digital de decisores corporativos, a abertura dos Stories às 07:50 atinge o público antes das reuniões de alinhamento. O consumo de carrosséis técnicos no feed atinge o ápice no intervalo de almoço (11:55), quando há maior disponibilidade para leitura profunda. O encerramento do expediente (17:45) concentra a maior taxa de conversão em respostas de Direct.",
  peakEngagementWindows: [
    "07:50 - 08:30 • Abertura Executiva (Menor Concorrência)",
    "11:55 - 13:00 • Pico de Leitura & Salvamentos no Feed",
    "17:45 - 19:15 • Fechamento de Dia & Conversão em Direct",
  ],
  recommendedVolume: "14 Stories de Engajamento + 4 Carrosséis Técnicos + 1 Post Único",
  targetPersonaHabits:
    "Tomadores de decisão corporativos e líderes B2B com consumo ágil de Stories matinais e tempo de leitura concentrado no meio-dia.",
  lastOptimizedAt: "08/10/2026 11:40",
};

export const DEFAULT_WEEKLY_AGENDA: AgendaDay[] = [
  {
    index: 0,
    shortName: "SEG",
    fullName: "Segunda-feira",
    dateNumber: "06",
    monthStr: "Out",
    fullDateLabel: "Segunda-feira, 06 de Outubro de 2026",
    dayLabel: "Segunda • 06/Out",
    isToday: false,
    strategicFocus: "Ativação & Quebra de Padrão Semanal",
    activities: [
      {
        id: "act-seg-1",
        time: "07:50",
        period: "manha",
        format: "story",
        funnelStage: "topo",
        theme: "Enquete de Abertura: Diagnóstico de Gargalos Comerciais",
        hookHeadline: "Você gasta mais tempo prospectando ou resolvendo ruído interno?",
        objective: "Ativação de engajamento matinal sem atrito e coleta de intenção da audiência.",
        ctaText: "Vote na enquete e ative o lembrete para a análise do meio-dia.",
        aiRationale: "Calibrado para as 07:50 pelo Agente de IA: momento em que líderes checam o smartphone antes do expediente, gerando alta taxa de abertura nos Stories.",
        status: "pronto",
      },
      {
        id: "act-seg-2",
        time: "11:55",
        period: "tarde",
        format: "carousel",
        funnelStage: "topo",
        theme: "Os 5 Gargalos Ocultos do Funil B2B",
        hookHeadline: "Sua operação não tem problema de geração de leads. O gargalo é outro.",
        objective: "Conscientização de decisores sobre vazamento de pipeline e falha no tempo de resposta.",
        ctaText: "Comente 'FUNIL' para receber o checklist de diagnóstico no seu direct.",
        aiRationale: "Prescrito para as 11:55: pausa do almoço com pico de retenção no feed, momento ideal para carrosséis de 5 a 7 lâminas com dados densos.",
        status: "pronto",
      },
      {
        id: "act-seg-3",
        time: "17:45",
        period: "noite",
        format: "story",
        funnelStage: "topo",
        theme: "Debriefing da Enquete & Resposta às Dores nos Stories",
        hookHeadline: "Mais de 65% votaram que o follow-up manual é o maior gargalo...",
        objective: "Validação social das respostas do dia e direcionamento para conversa privada no Direct.",
        ctaText: "Mande 'CHECKLIST' no direct para receber a planilha executiva.",
        aiRationale: "Definido para as 17:45: encerramento do expediente corporativo, onde diretores respondem a Directs com menor pressão de tarefas imediatas.",
        status: "pronto",
      },
    ],
  },
  {
    index: 1,
    shortName: "TER",
    fullName: "Terça-feira",
    dateNumber: "07",
    monthStr: "Out",
    fullDateLabel: "Terça-feira, 07 de Outubro de 2026",
    dayLabel: "Terça • 07/Out",
    isToday: false,
    strategicFocus: "Processos & Engenharia de Outbound",
    activities: [
      {
        id: "act-ter-1",
        time: "08:10",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Provocação: Follow-up Invasivo vs Presença Executiva Memorável",
        hookHeadline: "Se sua mensagem parece spam, o decisor deleta antes da 2ª linha.",
        objective: "Educação rápida sobre abordagem consultiva sem atrito com diretores e decisores.",
        ctaText: "Responda à pergunta: Quantos toques seu time faz antes de desistir?",
        aiRationale: "Calibrado para as 08:10: intervalo entre o café e a primeira reunião, com alta absorção de perguntas provocativas.",
        status: "planejado",
      },
      {
        id: "act-ter-2",
        time: "12:15",
        period: "tarde",
        format: "carousel",
        funnelStage: "meio",
        theme: "Como Estruturar uma Cadência de Outbound Sem Parecer Invasivo",
        hookHeadline: "A anatomia da sequência de 5 toques que gerou 34% de taxa de resposta executiva.",
        objective: "Posicionamento técnico de metodologia comercial moderna e sem agressividade rasa.",
        ctaText: "Salve este carrossel para estruturar os roteiros da sua equipe.",
        aiRationale: "Agendado para as 12:15: horário de máxima entrega algorítmica para posts técnicos que demandam salvamento.",
        status: "planejado",
      },
      {
        id: "act-ter-3",
        time: "18:05",
        period: "noite",
        format: "story",
        funnelStage: "meio",
        theme: "Caixinha de Dúvidas: Como prospectar contas enterprise sem cold call chata",
        hookHeadline: "Caixa aberta: qual a sua principal trava ao abordar contas grandes?",
        objective: "Geração de leads qualificados respondendo dúvidas técnicas nos Stories.",
        ctaText: "Deixe sua pergunta na caixinha para respondermos em vídeo.",
        aiRationale: "Prescrito para as 18:05: alta adesão a caixinhas de perguntas após o encerramento das atividades comerciais.",
        status: "planejado",
      },
    ],
  },
  {
    index: 2,
    shortName: "QUA",
    fullName: "Quarta-feira",
    dateNumber: "08",
    monthStr: "Out",
    fullDateLabel: "Quarta-feira, 08 de Outubro de 2026 (HOJE)",
    dayLabel: "Quarta • 08/Out",
    isToday: true,
    strategicFocus: "Anti-Colisão & Blindagem de Operação (HOJE)",
    activities: [
      {
        id: "act-qua-1",
        time: "07:45",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Alerta Crítico: 2 hunters abordando o mesmo CFO ao mesmo tempo",
        hookHeadline: "Isso já aconteceu na sua equipe? Dois operadores disputando o mesmo decisor?",
        objective: "Identificação da dor crítica de desorganização e perda de credibilidade corporativa.",
        ctaText: "Vote na enquete: 'Já aconteceu aqui' ou 'Temos trava no sistema'.",
        aiRationale: "Calibrado para as 07:45: quebra de rotina matinal com dor operacional real de liderança comercial.",
        status: "planejado",
      },
      {
        id: "act-qua-2",
        time: "11:45",
        period: "tarde",
        format: "carousel",
        funnelStage: "meio",
        theme: "Anti-Colisão: Como 2 Hunters Abordaram o Mesmo CFO e Queimaram o Contrato",
        hookHeadline: "O erro amador de R$ 180k que acontece quando seu CRM não tem radar anti-duplicidade.",
        objective: "Apresentar a dor da falta de blindagem entre operadores comerciais e a solução de telemetria.",
        ctaText: "Salve este carrossel para revisar as travas de segurança da sua operação.",
        aiRationale: "Prescrito para as 11:45 pelo Agente de IA: quarta-feira ao meio-dia é o ponto de maior engajamento semanal para temas de gestão e ferramentas B2B.",
        status: "planejado",
      },
      {
        id: "act-qua-3",
        time: "17:30",
        period: "noite",
        format: "story",
        funnelStage: "meio",
        theme: "Bastidores do Radar Anti-Colisão & Demonstração da Trava em Tempo Real",
        hookHeadline: "Vários líderes pediram no direct para ver como a trava funciona na prática...",
        objective: "Demonstração de produto com alta retenção e chamada para demonstração guiada.",
        ctaText: "Envie 'RADAR' no Direct para receber um tour interativo em vídeo.",
        aiRationale: "Agendado para as 17:30: momento ideal para converter interesse do carrossel do meio-dia em conversas diretas no Direct.",
        status: "planejado",
      },
    ],
  },
  {
    index: 3,
    shortName: "QUI",
    fullName: "Quinta-feira",
    dateNumber: "09",
    monthStr: "Out",
    fullDateLabel: "Quinta-feira, 09 de Outubro de 2026",
    dayLabel: "Quinta • 09/Out",
    isToday: false,
    strategicFocus: "Burocracia vs Eficiência Operacional",
    activities: [
      {
        id: "act-qui-1",
        time: "08:00",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Termômetro da Semana: Quantas horas seu time gasta preenchendo relatórios?",
        hookHeadline: "Vendedor de alta performance tem que estar falando com cliente, não em planilhas.",
        objective: "Quebra de padrão contra CRMs legados pesados que atrapalham o fechamento comercial.",
        ctaText: "Arraste o termômetro com a sua média semanal de horas burocráticas.",
        aiRationale: "Calibrado para as 08:00: uso do adesivo interativo de termômetro que eleva a relevância algorítmica da conta.",
        status: "planejado",
      },
      {
        id: "act-qui-2",
        time: "12:00",
        period: "tarde",
        format: "post",
        funnelStage: "meio",
        theme: "O Custo Invisível da Burocracia Comercial: Métricas Reais de Desperdício",
        hookHeadline: "Por que equipes com sistemas ultrapassados perdem até 42% do tempo produtivo dos closers.",
        objective: "Apresentação de dados estatísticos densos e impacto direto no CAC da empresa.",
        ctaText: "Compartilhe este insight com o líder de operações da sua organização.",
        aiRationale: "Agendado para as 12:00: formato de post único de dados/gráfico para variar o ritmo visual do feed após dois carrosséis seguidos.",
        status: "planejado",
      },
      {
        id: "act-qui-3",
        time: "18:15",
        period: "noite",
        format: "story",
        funnelStage: "meio",
        theme: "Teaser da Sexta-Feira: O Framework de 7 Lâminas para Carrosséis B2B",
        hookHeadline: "Amanhã vamos liberar o framework exato de 7 lâminas que usamos em clientes...",
        objective: "Geração de expectativa e ativação de lembrete para a publicação do dia seguinte.",
        ctaText: "Ative as notificações no perfil para conferir o carrossel amanhã às 12:00.",
        aiRationale: "Prescrito para as 18:15: gatilho de antecipação que aquece a audiência para a publicação principal de sexta.",
        status: "planejado",
      },
    ],
  },
  {
    index: 4,
    shortName: "SEX",
    fullName: "Sexta-feira",
    dateNumber: "10",
    monthStr: "Out",
    fullDateLabel: "Sexta-feira, 10 de Outubro de 2026",
    dayLabel: "Sexta • 10/Out",
    isToday: false,
    strategicFocus: "Autoridade Visual & Frameworks Técnicos",
    activities: [
      {
        id: "act-sex-1",
        time: "07:40",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Contraste de Posicionamento: Template genérico vs Apresentação Dark Industrial",
        hookHeadline: "Você fecharia um contrato de R$ 60k com uma marca com artes infantis no feed?",
        objective: "Conscientização executiva sobre o valor da percepção visual na precificação.",
        ctaText: "Vote: 'O design define o valor percebido' ou 'Conteúdo basta'.",
        aiRationale: "Calibrado para as 07:40: sexta-feira matinal tem alta dispersão, exigindo provocações visuais curtas e diretas.",
        status: "planejado",
      },
      {
        id: "act-sex-2",
        time: "11:30",
        period: "tarde",
        format: "carousel",
        funnelStage: "meio",
        theme: "Arquitetura de Carrosséis B2B: O Framework de 7 Lâminas que Converte Decisores",
        hookHeadline: "Carrossel comum não vende para C-Level. Esta é a estrutura exata de retenção.",
        objective: "Educação técnica aprofundada e posicionamento como referência visual de alta conversão.",
        ctaText: "Envie este carrossel para o líder de marketing ou growth da sua empresa.",
        aiRationale: "Prescrito para as 11:30: na sexta-feira, o almoço se antecipa; postar às 11:30 maximiza o alcance antes do encerramento da semana.",
        status: "planejado",
      },
      {
        id: "act-sex-3",
        time: "17:15",
        period: "noite",
        format: "story",
        funnelStage: "fundo",
        theme: "Checklist de Sexta: Como deixar o pipeline pronto para bater a meta na próxima semana",
        hookHeadline: "Encerramento da semana com pipeline blindado e sem pontas soltas.",
        objective: "Consolidação de autoridade executiva e oferta de material complementar.",
        ctaText: "Mande 'FRAMEWORK' no Direct para receber o PDF em alta resolução.",
        aiRationale: "Agendado para as 17:15: horário de 'fechar o computador' na sexta, com pico de retenção rápida em materiais para a semana seguinte.",
        status: "planejado",
      },
    ],
  },
  {
    index: 5,
    shortName: "SÁB",
    fullName: "Sábado",
    dateNumber: "11",
    monthStr: "Out",
    fullDateLabel: "Sábado, 11 de Outubro de 2026",
    dayLabel: "Sábado • 11/Out",
    isToday: false,
    strategicFocus: "Cultura, Princípios & Liderança",
    activities: [
      {
        id: "act-sab-1",
        time: "09:30",
        period: "manha",
        format: "story",
        funnelStage: "topo",
        theme: "Café com Insights: 3 Princípios de Líderes Comerciais de Alta Performance",
        hookHeadline: "Disciplina de processo sempre supera a motivação momentânea.",
        objective: "Humanização de marca com foco em liderança, maturidade e cultura corporativa.",
        ctaText: "Qual princípio mais ressoa com o momento atual da sua empresa?",
        aiRationale: "Calibrado para as 09:30: fim de semana possui despertar mais tardio; postar antes das 09:00 gera queima de alcance no sábado.",
        status: "planejado",
      },
      {
        id: "act-sab-2",
        time: "12:30",
        period: "tarde",
        format: "post",
        funnelStage: "topo",
        theme: "Engenharia de Receita: Por Que Empresas Escaláveis Não Dependem de Heróis",
        hookHeadline: "Se sua empresa para quando seu melhor vendedor viaja, você tem um gargalo estrutural crítico.",
        objective: "Provocação executiva e reflexão estratégica de fim de semana para sócios e fundadores.",
        ctaText: "Salve esta reflexão para debater na reunião de diretoria da próxima semana.",
        aiRationale: "Prescrito para as 12:30: post de autoridade reflexiva de fim de semana com alto compartilhamento via Direct.",
        status: "planejado",
      },
      {
        id: "act-sab-3",
        time: "19:00",
        period: "noite",
        format: "story",
        funnelStage: "topo",
        theme: "Recomendação de Leitura: O Livro Essencial para Escalar Vendas B2B",
        hookHeadline: "A recomendação de leitura técnica para o final de semana...",
        objective: "Indicação de bibliografia estratégica e engajamento orgânico de comunidade.",
        ctaText: "Deixe sua recomendação de livro corporativo na caixinha.",
        aiRationale: "Agendado para as 19:00: momento de desaceleração e busca por conteúdos de autodesenvolvimento.",
        status: "planejado",
      },
    ],
  },
  {
    index: 6,
    shortName: "DOM",
    fullName: "Domingo",
    dateNumber: "12",
    monthStr: "Out",
    fullDateLabel: "Domingo, 12 de Outubro de 2026",
    dayLabel: "Domingo • 12/Out",
    isToday: false,
    strategicFocus: "Planejamento & Abertura da Semana",
    activities: [
      {
        id: "act-dom-1",
        time: "10:15",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Planejamento Estratégico: O que você priorizou para a semana que se inicia?",
        hookHeadline: "Quem alinha o domingo começa a segunda-feira executando sem hesitação.",
        objective: "Ativação de senso de prioridade e foco estratégico para a nova semana de trabalho.",
        ctaText: "Vote: 'Semana 100% planejada' ou 'Definindo metas agora'.",
        aiRationale: "Calibrado para as 10:15: domingo de manhã propício para reflexão de planejamento da semana que vai iniciar.",
        status: "planejado",
      },
      {
        id: "act-dom-2",
        time: "13:00",
        period: "tarde",
        format: "carousel",
        funnelStage: "fundo",
        theme: "Demonstração Prática: Da Prospecção ao Faturamento em 1 Única Tela",
        hookHeadline: "Veja como funciona o fluxo de trabalho de uma operação comercial de elite.",
        objective: "Demonstração da plataforma e geração de reuniões qualificadas para a nova semana.",
        ctaText: "Toque no link da bio para solicitar uma demonstração executiva com nosso time.",
        aiRationale: "Prescrito para as 13:00: domingo após o almoço concentra o maior índice de leitura calma e navegação pré-segunda-feira.",
        status: "planejado",
      },
      {
        id: "act-dom-3",
        time: "19:45",
        period: "noite",
        format: "story",
        funnelStage: "fundo",
        theme: "Abertura Oficial de Slots para Demonstração Executiva da Semana",
        hookHeadline: "Liberamos 5 vagas na agenda executiva para diagnóstico gratuito de pipeline...",
        objective: "Conversão direta para inbound agendando sessões de demonstração com tomadores de decisão.",
        ctaText: "Responda 'QUERO' agora para garantir seu slot na agenda desta semana.",
        aiRationale: "Definido para as 19:45: 'efeito domingo à noite', onde executivos sentem a ansiedade da semana e agendam soluções para seus problemas de negócio.",
        status: "planejado",
      },
    ],
  },
];

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set, get) => ({
      // Jornada de Growth Marketing B2B (5 Etapas)
      activeGrowthTab: "diagnostico",
      setActiveGrowthTab: (tab) => set({ activeGrowthTab: tab }),

      // 1. Diagnóstico da Empresa & Concorrentes
      companyProfile: DEFAULT_COMPANY_PROFILE,
      setCompanyProfile: (profile) =>
        set((state) => ({ companyProfile: { ...state.companyProfile, ...profile } })),
      competitorsDiagnostic: DEFAULT_DIAGNOSTIC,
      isAnalyzingCompetitors: false,
      analyzeCompanyAndCompetitors: async () => {
        set({ isAnalyzingCompetitors: true });
        const { companyProfile } = get();

        // Sanitização contra contaminação cruzada se o site for diferente de Black Link
        const cleanProfile = { ...companyProfile };
        const webLower = (cleanProfile.website || "").toLowerCase();
        if (webLower && !webLower.includes("blacklink") && !webLower.includes("blklnk")) {
          if (cleanProfile.name === "Black Link CRM" || cleanProfile.name === "Black Link") {
            cleanProfile.name = "";
          }
          if (cleanProfile.instagram === "@blacklink.b2b") {
            cleanProfile.instagram = "";
          }
          if (cleanProfile.niche?.includes("SaaS Enterprise")) {
            cleanProfile.niche = "";
          }
          if (cleanProfile.products?.includes("Plataforma CRM")) {
            cleanProfile.products = "";
          }
        }

        try {
          const res = await fetch("/api/marketing/diagnostic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanProfile),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              set((state) => ({
                companyProfile: {
                  ...state.companyProfile,
                  ...data.companyProfile,
                },
                competitorsDiagnostic: data.diagnostic,
                editorialPlan:
                  Array.isArray(data.editorialPlan) && data.editorialPlan.length > 0
                    ? data.editorialPlan
                    : state.editorialPlan,
                scheduledPosts:
                  Array.isArray(data.scheduledPosts) && data.scheduledPosts.length > 0
                    ? [...data.scheduledPosts, ...state.scheduledPosts.slice(4)]
                    : state.scheduledPosts,
                isAnalyzingCompetitors: false,
              }));
              return;
            }
          }
        } catch (err) {
          console.warn("Aviso ao conectar com endpoint de diagnóstico de IA:", err);
        }

        // Fallback local se a chamada falhar
        const updatedDiagnostic: CompetitorsDiagnostic = {
          ...DEFAULT_DIAGNOSTIC,
          executiveSummary: `Análise estratégica para ${companyProfile.name || "a empresa"} (${companyProfile.instagram || "@instagram"}): Foco em contra-posicionamento e diferenciação visual no feed contra a média dos concorrentes.`,
          lastAnalyzedAt: new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        set({
          competitorsDiagnostic: updatedDiagnostic,
          isAnalyzingCompetitors: false,
        });
      },

      // 2. Planejamento Estratégico & Cronograma
      editorialPlan: DEFAULT_EDITORIAL_PLAN,
      isGeneratingPlan: false,
      generateEditorialPlan: async () => {
        set({ isGeneratingPlan: true });
        const { companyProfile } = get();

        try {
          const res = await fetch("/api/marketing/diagnostic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(companyProfile),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.editorialPlan) && data.editorialPlan.length > 0) {
              set((state) => ({
                editorialPlan: data.editorialPlan,
                scheduledPosts:
                  Array.isArray(data.scheduledPosts) && data.scheduledPosts.length > 0
                    ? [...data.scheduledPosts, ...state.scheduledPosts.slice(4)]
                    : state.scheduledPosts,
                isGeneratingPlan: false,
              }));
              return;
            }
          }
        } catch (err) {
          console.warn("Aviso ao regenerar planejamento editorial:", err);
        }

        await new Promise((r) => setTimeout(r, 800));
        set({ isGeneratingPlan: false });
      },
      selectedPlanForCreation: null,
      selectPlanForCreation: (plan) => {
        set({
          selectedPlanForCreation: plan,
          activeGrowthTab: "estudio",
        });
        if (plan) {
          get().setFormData({
            theme: plan.theme,
            targetAudience: "Decisores B2B, CEOs e Diretores Comerciais",
            format: plan.format,
          });
        }
      },
      addPlanItem: (item) => {
        const newItem: EditorialPlanItem = {
          ...item,
          id: `plan-${Date.now()}`,
        };
        set((s) => ({ editorialPlan: [...s.editorialPlan, newItem] }));
      },
      updatePlanItem: (id, updates) => {
        set((s) => ({
          editorialPlan: s.editorialPlan.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      // Agente Especialista em Cadência Editorial & Algoritmo do Instagram
      cadenceStrategy: DEFAULT_CADENCE_STRATEGY,
      weeklyAgenda: DEFAULT_WEEKLY_AGENDA,
      isOptimizingCadence: false,
      optimizeCadenceWithAI: async () => {
        set({ isOptimizingCadence: true });
        const { companyProfile } = get();

        try {
          const res = await fetch("/api/marketing/cadence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(companyProfile),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.weeklyAgenda && data.cadenceStrategy) {
              set({
                weeklyAgenda: data.weeklyAgenda,
                cadenceStrategy: data.cadenceStrategy,
                isOptimizingCadence: false,
              });
              return;
            }
          }
        } catch (err) {
          console.warn("Aviso ao otimizar cadência com o Agente de IA:", err);
        }

        await new Promise((r) => setTimeout(r, 600));
        set({ isOptimizingCadence: false });
      },
      updateDayActivity: (dayIndex, activityId, updates) => {
        set((state) => ({
          weeklyAgenda: state.weeklyAgenda.map((day) => {
            if (day.index !== dayIndex) return day;
            return {
              ...day,
              activities: day.activities.map((act) =>
                act.id === activityId ? { ...act, ...updates } : act
              ),
            };
          }),
        }));
      },

      // 4. Feed & Vitrine do Instagram (Prévias)
      feedViewMode: "visor",
      setFeedViewMode: (mode) => set({ feedViewMode: mode }),
      selectedFeedPost: null,
      setSelectedFeedPost: (post) => set({ selectedFeedPost: post }),
      updateScheduledPost: (id, updates) => {
        set((state) => ({
          scheduledPosts: state.scheduledPosts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          selectedFeedPost:
            state.selectedFeedPost?.id === id
              ? { ...state.selectedFeedPost, ...updates }
              : state.selectedFeedPost,
        }));
      },
      approveStudioArtToFeed: (postData, planId) => {
        const state = get();
        const existingId = postData.id;
        const existingPost = state.scheduledPosts.find(
          (p) =>
            (existingId && p.id === existingId) ||
            (postData.theme &&
              p.theme.toLowerCase().trim() === postData.theme.toLowerCase().trim())
        );

        const finalPost: ScheduledPost = {
          id: existingPost?.id || postData.id || `post-art-${Date.now()}`,
          theme: postData.theme || "Carrossel Aprovado no Estúdio",
          format: postData.format || "carousel",
          scheduledDate:
            postData.scheduledDate || existingPost?.scheduledDate || "Hoje • Aprovado",
          status: "scheduled",
          hookHeadline: postData.hookHeadline || postData.theme || "",
          bodyCopy: postData.bodyCopy || postData.postCaption || "",
          ctaText: postData.ctaText || "Salve este carrossel",
          hashtags: postData.hashtags || ["#AltaPerformance", "#BlackLink"],
          postCaption: postData.postCaption || postData.bodyCopy || "",
          slides: postData.slides || [],
          imageUrls:
            postData.imageUrls ||
            (postData.slides || []).map((s) => s.imageUrl || ""),
          createdAt: existingPost?.createdAt || new Date().toISOString(),
        };

        let updatedScheduledPosts: ScheduledPost[];
        if (existingPost) {
          updatedScheduledPosts = state.scheduledPosts.map((p) =>
            p.id === existingPost.id ? finalPost : p
          );
        } else {
          updatedScheduledPosts = [finalPost, ...state.scheduledPosts];
        }

        const targetPlanId = planId || state.selectedPlanForCreation?.id;
        const updatedEditorialPlan = state.editorialPlan.map((item) => {
          if (
            (targetPlanId && item.id === targetPlanId) ||
            (finalPost.theme &&
              item.theme.toLowerCase().trim() ===
                finalPost.theme.toLowerCase().trim())
          ) {
            return { ...item, status: "pronto" as const };
          }
          return item;
        });

        set({
          scheduledPosts: updatedScheduledPosts,
          editorialPlan: updatedEditorialPlan,
          selectedFeedPost: finalPost,
          feedViewMode: "visor",
          activeGrowthTab: "feed",
        });

        return finalPost;
      },

      activeMarketingTab: "studio",
      setActiveMarketingTab: (tab) => set({ activeMarketingTab: tab }),

      // Wizard Estilo CarrosseIA (3 Etapas)
      currentWizardStep: 1,
      setWizardStep: (step) => set({ currentWizardStep: step }),
      activeEditingSlideIndex: 0,
      setActiveEditingSlideIndex: (index) => set({ activeEditingSlideIndex: index }),
      draftCarousel: null,
      setDraftCarousel: (draft) => set({ draftCarousel: draft }),

      updateDraftSlide: (slideIndex, field, value) => {
        const { draftCarousel } = get();
        if (!draftCarousel || !draftCarousel.slides) return;

        const updatedSlides = draftCarousel.slides.map((slide, idx) => {
          if (idx !== slideIndex) return slide;
          const updatedSlide = { ...slide, [field]: value };

          // Atualiza a URL do render-slide para preview dinâmico
          const query = new URLSearchParams({
            slide: String(updatedSlide.slideNumber || idx + 1),
            total: String(draftCarousel.slides.length),
            headline: updatedSlide.headline || "",
            body: updatedSlide.bodyText || "",
            format: draftCarousel.format || "carousel",
            theme: draftCarousel.theme || "",
          });
          updatedSlide.imageUrl = `/api/marketing/render-slide?${query.toString()}`;
          return updatedSlide;
        });

        const updatedImageUrls = updatedSlides.map((s) => s.imageUrl || "");

        set({
          draftCarousel: {
            ...draftCarousel,
            slides: updatedSlides,
            imageUrls: updatedImageUrls,
            hookHeadline:
              slideIndex === 0 && field === "headline"
                ? value
                : draftCarousel.hookHeadline,
          },
        });
      },

      updateDraftCaption: (caption) => {
        const { draftCarousel } = get();
        if (!draftCarousel) return;
        set({
          draftCarousel: {
            ...draftCarousel,
            bodyCopy: caption,
          },
        });
      },

      updateDraftHashtags: (hashtags) => {
        const { draftCarousel } = get();
        if (!draftCarousel) return;
        set({
          draftCarousel: {
            ...draftCarousel,
            hashtags,
          },
        });
      },

      saveDraftToSchedule: async (scheduledDate) => {
        const { draftCarousel, scheduledPosts } = get();
        if (!draftCarousel) return false;

        const dateToSave =
          scheduledDate || draftCarousel.scheduledDate || "Amanhã • 10:00";
        const finalPost: ScheduledPost = {
          ...draftCarousel,
          scheduledDate: dateToSave,
          status: "awaiting_approval",
          createdAt: new Date().toISOString(),
        };

        try {
          await fetch("/api/marketing/schedule/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post: finalPost }),
          });
        } catch (e) {
          console.warn("Aviso ao persistir post no Supabase:", e);
        }

        set({
          scheduledPosts: [finalPost, ...scheduledPosts],
          draftCarousel: null,
          currentWizardStep: 1,
          activeMarketingTab: "schedule", // Redireciona para a aba Cronograma & Aprovação
        });

        return true;
      },

      resetStudioWizard: () => {
        set({
          currentWizardStep: 1,
          draftCarousel: null,
          activeEditingSlideIndex: 0,
        });
      },

      formData: INITIAL_FORM_DATA,
      isLoading: false,
      statusMessage: "",
      error: null,
      activeResult: null,
      history: [],
      adCampaigns: BASE_CAMPAIGNS,

      // Cronograma & Aprovação
      scheduledPosts: INITIAL_SCHEDULED_POSTS,
      isApprovingPostId: null,
      isReformulatingPostId: null,

      // Robô de Otimização Autônoma
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
          statusMessage: "Disparando briefing para a IA e automador n8n...",
        });

        try {
          const statusTimer1 = setTimeout(() => {
            set({ statusMessage: "Processando proposta de valor e personas B2B..." });
          }, 800);

          const statusTimer2 = setTimeout(() => {
            set({ statusMessage: "Construindo lâminas e copywriting persuasivo..." });
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

          // Constrói o rascunho de trabalho no estúdio (Etapa 2)
          const newDraft: ScheduledPost = {
            id: `post-draft-${Date.now()}`,
            theme: result.theme,
            format: result.format,
            targetAudience: result.targetAudience,
            nicheValueProposition: formData.nicheValueProposition,
            scheduledDate: "Amanhã • 10:00",
            status: "awaiting_approval",
            hookHeadline: result.hookHeadline,
            bodyCopy: result.bodyCopy,
            ctaText: result.ctaText,
            hashtags: result.hashtags,
            slides: result.slides,
            imageUrls: result.imageUrls,
            createdAt: new Date().toISOString(),
          };

          set({
            isLoading: false,
            statusMessage: "",
            activeResult: result,
            draftCarousel: newDraft,
            currentWizardStep: 2, // Transita automaticamente para a Etapa 2
            activeEditingSlideIndex: 0,
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

      approvePost: async (id: string) => {
        const { scheduledPosts } = get();
        const post = scheduledPosts.find((p) => p.id === id);
        if (!post) return false;

        set({ isApprovingPostId: id, error: null });

        try {
          const res = await fetch("/api/marketing/schedule/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              postId: post.id,
              imageUrls: post.imageUrls,
              caption: `${post.hookHeadline}\n\n${post.bodyCopy}\n\n${post.ctaText}\n\n${post.hashtags.join(" ")}`,
              format: post.format,
              scheduledTime: post.scheduledDate,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || "Falha ao registrar agendamento na Meta Graph API.");
          }

          const updated = scheduledPosts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "scheduled" as PostApprovalStatus,
                  metaPostId: data.metaPostId || `meta_ig_${Date.now()}`,
                  publishedAt: new Date().toISOString(),
                }
              : p
          );

          set({
            isApprovingPostId: null,
            scheduledPosts: updated,
          });

          return true;
        } catch (err: any) {
          console.error("Erro ao aprovar post:", err);
          const updated = scheduledPosts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "scheduled" as PostApprovalStatus,
                  metaPostId: `meta_local_${Date.now()}`,
                }
              : p
          );
          set({
            isApprovingPostId: null,
            scheduledPosts: updated,
          });
          return true;
        }
      },

      updateCaption: (id: string, newText: string) => {
        const { scheduledPosts } = get();
        const updated = scheduledPosts.map((p) =>
          p.id === id ? { ...p, bodyCopy: newText } : p
        );
        set({ scheduledPosts: updated });
      },

      requestReformulation: async (id: string, feedback: string) => {
        const { scheduledPosts } = get();
        const post = scheduledPosts.find((p) => p.id === id);
        if (!post) return false;

        set({
          isReformulatingPostId: id,
          isLoading: true,
          statusMessage: "Enviando diretrizes de refação ao pipeline de IA...",
          error: null,
        });

        const initialUpdate = scheduledPosts.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "reformulation_requested" as PostApprovalStatus,
                reformulationFeedback: feedback,
              }
            : p
        );
        set({ scheduledPosts: initialUpdate });

        try {
          const res = await fetch("/api/marketing/schedule/reformulate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              postId: post.id,
              originalAsset: post,
              feedback,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.success || !data.updatedPost) {
            throw new Error(data.error || "Falha na reformulação do ativo.");
          }

          const finalUpdate = scheduledPosts.map((p) =>
            p.id === id ? { ...data.updatedPost } : p
          );

          set({
            isReformulatingPostId: null,
            isLoading: false,
            statusMessage: "",
            scheduledPosts: finalUpdate,
          });

          return true;
        } catch (err: any) {
          console.error("Erro na requisição de reformulação:", err);
          set({
            isReformulatingPostId: null,
            isLoading: false,
            statusMessage: "",
            error: err?.message || "Erro ao solicitar refação ao n8n.",
          });
          return false;
        }
      },

      addManualPost: (newPost: ScheduledPost) => {
        const { scheduledPosts } = get();
        set({
          scheduledPosts: [newPost, ...scheduledPosts],
        });
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
      name: "blacklink-marketing-storage-v4",
      version: 4,
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
