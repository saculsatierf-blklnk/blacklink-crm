"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Columns3,
  Download,
  Filter,
  Layers,
  ListFilter,
  Loader2,
  Plus,
  RefreshCw,
  Smartphone,
  Sparkles,
  Target,
  Wand2,
  X,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMarketingStore,
  type EditorialPlanItem,
  type DailyActivityItem,
  type CreativeFormat,
} from "@/store/useMarketingStore";

export type PlanningViewMode = "diario" | "semanal" | "mensal";

interface AgendaDayDefinition {
  index: number;
  shortName: string; // SEG, TER, QUA...
  fullName: string; // Segunda-feira, etc.
  dateNumber: string; // 06, 07, 08...
  monthStr: string; // Out
  fullDateLabel: string; // Quarta-feira, 08 de Outubro de 2026
  dayLabel: string; // Quarta • 08/Out
  isToday: boolean;
  strategicFocus: string;
  defaultStage: "topo" | "meio" | "fundo";
  defaultActivities: DailyActivityItem[];
}

/**
 * 7 Dias Estruturados da Semana Atual (06 a 12 de Outubro de 2026)
 * Dia Atual: Quarta-feira, 08 de Outubro (HOJE - índice 2)
 */
const BASE_WEEK_DAYS: AgendaDayDefinition[] = [
  {
    index: 0,
    shortName: "SEG",
    fullName: "Segunda-feira",
    dateNumber: "06",
    monthStr: "Out",
    fullDateLabel: "Segunda-feira, 06 de Outubro de 2026",
    dayLabel: "Segunda • 06/Out",
    isToday: false,
    strategicFocus: "Topo de Funil • Atração & Quebra de Paradigma",
    defaultStage: "topo",
    defaultActivities: [
      {
        id: "act-seg-0830",
        time: "08:30",
        period: "manha",
        format: "story",
        funnelStage: "topo",
        theme: "Enquete Matinal: Qual o maior gargalo da sua operação comercial?",
        hookHeadline: "Você gasta mais tempo prospectando ou resolvendo ruído interno?",
        objective: "Ativação de engajamento matinal e validação das dores da audiência através de enquetes interativas.",
        ctaText: "Vote na enquete e veja o diagnóstico da nossa equipe ao meio-dia.",
        status: "pronto",
      },
      {
        id: "act-seg-1200",
        time: "12:00",
        period: "tarde",
        format: "carousel",
        funnelStage: "topo",
        theme: "Os 5 Gargalos Ocultos do Funil B2B",
        hookHeadline: "Sua operação não tem problema de geração de leads. O gargalo é outro.",
        objective: "Conscientização de decisores sobre vazamento de pipeline e falha no tempo de resposta.",
        ctaText: "Comente 'FUNIL' para receber o checklist de diagnóstico no seu direct.",
        status: "pronto",
      },
      {
        id: "act-seg-1800",
        time: "18:00",
        period: "noite",
        format: "story",
        funnelStage: "topo",
        theme: "Debriefing da Enquete & Resposta às Dores nos Stories",
        hookHeadline: "Mais de 65% votaram que o follow-up manual é o maior gargalo...",
        objective: "Validação social das respostas do dia e direcionamento para conversa privada no Direct.",
        ctaText: "Mande 'CHECKLIST' no direct para receber a planilha executiva.",
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
    strategicFocus: "Meio de Funil • Cadência & Processos de Outbound",
    defaultStage: "meio",
    defaultActivities: [
      {
        id: "act-ter-0830",
        time: "08:30",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Provocação: Follow-up Invasivo vs Presença Executiva Memorável",
        hookHeadline: "Se sua mensagem parece spam, o decisor deleta antes da 2ª linha.",
        objective: "Educação rápida sobre abordagem consultiva sem atrito com diretores e decisores.",
        ctaText: "Responda à pergunta: Quantos toques seu time faz antes de desistir?",
        status: "planejado",
      },
      {
        id: "act-ter-1200",
        time: "12:00",
        period: "tarde",
        format: "carousel",
        funnelStage: "meio",
        theme: "Como Estruturar uma Cadência de Outbound Sem Parecer Invasivo",
        hookHeadline: "A anatomia da sequência de 5 toques que gerou 34% de taxa de resposta executiva.",
        objective: "Posicionamento técnico de metodologia comercial moderna e sem agressividade rasa.",
        ctaText: "Salve este carrossel para estruturar os roteiros da sua equipe.",
        status: "planejado",
      },
      {
        id: "act-ter-1800",
        time: "18:00",
        period: "noite",
        format: "story",
        funnelStage: "meio",
        theme: "Caixinha de Dúvidas: Como prospectar contas enterprise sem cold call chata",
        hookHeadline: "Caixa aberta: qual a sua principal trava ao abordar contas grandes?",
        objective: "Geração de leads qualificados respondendo dúvidas técnicas nos Stories.",
        ctaText: "Deixe sua pergunta na caixinha para respondermos em vídeo.",
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
    strategicFocus: "Meio de Funil • Anti-Colisão & Blindagem de Território",
    defaultStage: "meio",
    defaultActivities: [
      {
        id: "act-qua-0830",
        time: "08:30",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Alerta Crítico: 2 hunters abordando o mesmo CFO ao mesmo tempo",
        hookHeadline: "Isso já aconteceu na sua equipe? Dois operadores disputando o mesmo decisor?",
        objective: "Identificação da dor crítica de desorganização e perda de credibilidade corporativa.",
        ctaText: "Vote na enquete: 'Já aconteceu aqui' ou 'Temos trava no sistema'.",
        status: "planejado",
      },
      {
        id: "act-qua-1200",
        time: "12:00",
        period: "tarde",
        format: "carousel",
        funnelStage: "meio",
        theme: "Anti-Colisão: Como 2 Hunters Abordaram o Mesmo CFO e Queimaram o Contrato",
        hookHeadline: "O erro amador de R$ 180k que acontece quando seu CRM não tem radar anti-duplicidade.",
        objective: "Apresentar a dor da falta de blindagem entre operadores comerciais e a solução de telemetria.",
        ctaText: "Salve este carrossel para revisar as travas de segurança da sua operação.",
        status: "planejado",
      },
      {
        id: "act-qua-1800",
        time: "18:00",
        period: "noite",
        format: "story",
        funnelStage: "meio",
        theme: "Bastidores do Radar Anti-Colisão & Demonstração da Trava em Tempo Real",
        hookHeadline: "Vários líderes pediram no direct para ver como a trava funciona na prática...",
        objective: "Demonstração de produto com alta retenção e chamada para demonstração guiada.",
        ctaText: "Envie 'RADAR' no Direct para receber um tour interativo em vídeo.",
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
    strategicFocus: "Meio de Funil • Burocracia vs Eficiência Operacional",
    defaultStage: "meio",
    defaultActivities: [
      {
        id: "act-qui-0830",
        time: "08:30",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Termômetro da Semana: Quantas horas seu time gasta preenchendo relatórios?",
        hookHeadline: "Vendedor de alta performance tem que estar falando com cliente, não em planilhas.",
        objective: "Quebra de padrão contra CRMs legados pesados que atrapalham o fechamento comercial.",
        ctaText: "Arraste o termômetro com a sua média semanal de horas burocráticas.",
        status: "planejado",
      },
      {
        id: "act-qui-1200",
        time: "12:00",
        period: "tarde",
        format: "post",
        funnelStage: "meio",
        theme: "O Custo Invisível da Burocracia Comercial: Métricas Reais de Desperdício",
        hookHeadline: "Por que equipes com sistemas ultrapassados perdem até 42% do tempo produtivo dos closers.",
        objective: "Apresentação de dados estatísticos densos e impacto direto no CAC da empresa.",
        ctaText: "Compartilhe este insight com o líder de operações da sua organização.",
        status: "planejado",
      },
      {
        id: "act-qui-1800",
        time: "18:00",
        period: "noite",
        format: "story",
        funnelStage: "meio",
        theme: "Teaser da Sexta-Feira: O Framework de 7 Lâminas para Carrosséis B2B",
        hookHeadline: "Amanhã vamos liberar o framework exato de 7 lâminas que usamos em clientes...",
        objective: "Geração de expectativa e ativação de lembrete para a publicação do dia seguinte.",
        ctaText: "Ative as notificações no perfil para conferir o carrossel amanhã às 12:00.",
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
    strategicFocus: "Meio de Funil • Autoridade Visual & Arquitetura de Conteúdo",
    defaultStage: "meio",
    defaultActivities: [
      {
        id: "act-sex-0830",
        time: "08:30",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Contraste de Posicionamento: Template genérico vs Apresentação Dark Industrial",
        hookHeadline: "Você fecharia um contrato de R$ 60k com uma marca com artes infantis no feed?",
        objective: "Conscientização executiva sobre o valor da percepção visual na precificação.",
        ctaText: "Vote: 'O design define o valor percebido' ou 'Conteúdo basta'.",
        status: "planejado",
      },
      {
        id: "act-sex-1200",
        time: "12:00",
        period: "tarde",
        format: "carousel",
        funnelStage: "meio",
        theme: "Arquitetura de Carrosséis B2B: O Framework de 7 Lâminas que Converte Decisores",
        hookHeadline: "Carrossel comum não vende para C-Level. Esta é a estrutura exata de retenção.",
        objective: "Educação técnica aprofundada e posicionamento como referência visual de alta conversão.",
        ctaText: "Envie este carrossel para o líder de marketing ou growth da sua empresa.",
        status: "planejado",
      },
      {
        id: "act-sex-1800",
        time: "18:00",
        period: "noite",
        format: "story",
        funnelStage: "fundo",
        theme: "Checklist de Sexta: Como deixar o pipeline pronto para bater a meta na próxima semana",
        hookHeadline: "Encerramento da semana com pipeline blindado e sem pontas soltas.",
        objective: "Consolidação de autoridade executiva e oferta de material complementar.",
        ctaText: "Mande 'FRAMEWORK' no Direct para receber o PDF em alta resolução.",
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
    strategicFocus: "Topo de Funil • Cultura, Liderança & Princípios de Escala",
    defaultStage: "topo",
    defaultActivities: [
      {
        id: "act-sab-0830",
        time: "08:30",
        period: "manha",
        format: "story",
        funnelStage: "topo",
        theme: "Café com Insights: 3 Princípios de Líderes Comerciais de Alta Performance",
        hookHeadline: "Disciplina de processo sempre supera a motivação momentânea.",
        objective: "Humanização de marca com foco em liderança, maturidade e cultura corporativa.",
        ctaText: "Qual princípio mais ressoa com o momento atual da sua empresa?",
        status: "planejado",
      },
      {
        id: "act-sab-1200",
        time: "12:00",
        period: "tarde",
        format: "post",
        funnelStage: "topo",
        theme: "Engenharia de Receita: Por Que Empresas Escaláveis Não Dependem de Heróis",
        hookHeadline: "Se sua empresa para quando seu melhor vendedor viaja, você tem um gargalo estrutural crítico.",
        objective: "Provocação executiva e reflexão estratégica de fim de semana para sócios e fundadores.",
        ctaText: "Salve esta reflexão para debater na reunião de diretoria da próxima semana.",
        status: "planejado",
      },
      {
        id: "act-sab-1800",
        time: "18:00",
        period: "noite",
        format: "story",
        funnelStage: "topo",
        theme: "Recomendação de Leitura: O Livro Essencial para Escalar Vendas B2B",
        hookHeadline: "A recomendação de leitura técnica para o final de semana...",
        objective: "Indicação de bibliografia estratégica e engajamento orgânico de comunidade.",
        ctaText: "Deixe sua recomendação de livro corporativo na caixinha.",
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
    strategicFocus: "Fundo de Funil • Planejamento & Abertura de Agenda da Semana",
    defaultStage: "fundo",
    defaultActivities: [
      {
        id: "act-dom-0830",
        time: "08:30",
        period: "manha",
        format: "story",
        funnelStage: "meio",
        theme: "Planejamento Estratégico: O que você priorizou para a semana que se inicia?",
        hookHeadline: "Quem alinha o domingo começa a segunda-feira executando sem hesitação.",
        objective: "Ativação de senso de prioridade e foco estratégico para a nova semana de trabalho.",
        ctaText: "Vote: 'Semana 100% planejada' ou 'Definindo metas agora'.",
        status: "planejado",
      },
      {
        id: "act-dom-1200",
        time: "12:00",
        period: "tarde",
        format: "carousel",
        funnelStage: "fundo",
        theme: "Demonstração Prática: Da Prospecção ao Faturamento em 1 Única Tela",
        hookHeadline: "Veja como funciona o fluxo de trabalho de uma operação comercial de elite.",
        objective: "Demonstração da plataforma e geração de reuniões qualificadas para a nova semana.",
        ctaText: "Toque no link da bio para solicitar uma demonstração executiva com nosso time.",
        status: "planejado",
      },
      {
        id: "act-dom-1800",
        time: "18:00",
        period: "noite",
        format: "story",
        funnelStage: "fundo",
        theme: "Abertura Oficial de Slots para Demonstração Executiva da Semana",
        hookHeadline: "Liberamos 5 vagas na agenda executiva para diagnóstico gratuito de pipeline...",
        objective: "Conversão direta para inbound agendando sessões de demonstração com tomadores de decisão.",
        ctaText: "Responda 'QUERO' agora para garantir seu slot na agenda desta semana.",
        status: "planejado",
      },
    ],
  },
];

const MONTH_WEEKS = [
  {
    week: 1,
    title: "Semana 1 • Atração & Quebra de Padrão",
    focus: "Topo de Funil (Viralização, Dores Críticas e Desmistificação de Problemas)",
    border: "border-sky-500/30",
    badge: "text-sky-300 bg-sky-500/10",
  },
  {
    week: 2,
    title: "Semana 2 • Autoridade & Métricas Reais",
    focus: "Meio de Funil (Frameworks Técnicos, Casos de Sucesso e Processos)",
    border: "border-amber-500/30",
    badge: "text-amber-300 bg-amber-500/10",
  },
  {
    week: 3,
    title: "Semana 3 • Diferenciação & Engenharia Reversa",
    focus: "Meio de Funil (Contra-posicionamento, Clichês de Mercado e Segredos de Escala)",
    border: "border-purple-500/30",
    badge: "text-purple-300 bg-purple-500/10",
  },
  {
    week: 4,
    title: "Semana 4 • Conversão Executiva & Demonstração",
    focus: "Fundo de Funil (Apresentação de Solução, Oferta Direta e Inbound)",
    border: "border-emerald-500/30",
    badge: "text-emerald-300 bg-emerald-500/10",
  },
];

export function EditorialPlanningView() {
  const {
    editorialPlan,
    isGeneratingPlan,
    generateEditorialPlan,
    selectPlanForCreation,
    addPlanItem,
    companyProfile,
    scheduledPosts,
    setSelectedFeedPost,
    setFeedViewMode,
  } = useMarketingStore();

  const [planningViewMode, setPlanningViewMode] = useState<PlanningViewMode>("diario");
  // Índice 2 = Quarta-feira 08/Out (HOJE)
  const [selectedAgendaDayIndex, setSelectedAgendaDayIndex] = useState<number>(2);
  const [funnelFilter, setFunnelFilter] = useState<"all" | "topo" | "meio" | "fundo">("all");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Form State
  const [newTheme, setNewTheme] = useState("");
  const [newHook, setNewHook] = useState("");
  const [newDayLabel, setNewDayLabel] = useState("");
  const [newFormat, setNewFormat] = useState<CreativeFormat>("carousel");
  const [newFunnelStage, setNewFunnelStage] = useState<"topo" | "meio" | "fundo">("meio");
  const [newObjective, setNewObjective] = useState("");
  const [newCta, setNewCta] = useState("");

  /**
   * Constrói a semana completa integrando as pautas existentes no store
   * nos horários nobres de cada dia (12:00) e mantendo as atividades matinais (08:30) e noturnas (18:00).
   */
  const weekAgenda = useMemo(() => {
    return BASE_WEEK_DAYS.map((baseDay) => {
      // Procura pauta correspondente em editorialPlan
      const matchedPlan = editorialPlan.find((item) => {
        const dNum = item.dayNumber;
        const dLab = (item.dayLabel || "").toLowerCase();
        return (
          dNum === baseDay.index + 1 ||
          dLab.includes(baseDay.shortName.toLowerCase()) ||
          dLab.includes(baseDay.dateNumber)
        );
      }) || (baseDay.index < editorialPlan.length ? editorialPlan[baseDay.index] : undefined);

      // Copia atividades padrão
      const activities = baseDay.defaultActivities.map((act) => {
        // Se for o horário nobre das 12:00 e houver uma pauta do store, atualiza com a pauta
        if (act.time === "12:00" && matchedPlan) {
          return {
            ...act,
            id: matchedPlan.id || act.id,
            theme: matchedPlan.theme || act.theme,
            hookHeadline: matchedPlan.hookHeadline || act.hookHeadline,
            format: matchedPlan.format || act.format,
            funnelStage: matchedPlan.funnelStage || act.funnelStage,
            objective: matchedPlan.objective || act.objective,
            ctaText: matchedPlan.ctaText || act.ctaText,
            status: matchedPlan.status || act.status,
          };
        }
        return act;
      });

      return {
        ...baseDay,
        mainPlanItem: matchedPlan,
        activities,
      };
    });
  }, [editorialPlan]);

  const selectedDay = weekAgenda[selectedAgendaDayIndex] || weekAgenda[2];

  // Atividades filtradas do dia selecionado
  const filteredDayActivities = useMemo(() => {
    if (funnelFilter === "all") return selectedDay.activities;
    return selectedDay.activities.filter((act) => act.funnelStage === funnelFilter);
  }, [selectedDay, funnelFilter]);

  /**
   * Ação Primária Obrigatória:
   * Leva diretamente para o Estúdio de Criação com o briefing carregado!
   */
  const handleProduceActivity = (
    dayLabel: string,
    activity: DailyActivityItem,
    mainPlan?: EditorialPlanItem
  ) => {
    const planItem: EditorialPlanItem = {
      id: activity.id,
      dayNumber: selectedDay.index + 1,
      dayLabel: `${dayLabel} • ${activity.time}`,
      theme: activity.theme,
      hookHeadline: activity.hookHeadline || activity.theme,
      format: activity.format,
      funnelStage: activity.funnelStage,
      objective: activity.objective,
      viralAngle: activity.objective,
      ctaText: activity.ctaText,
      status: "em_producao",
      scheduledTime: activity.time,
    };

    selectPlanForCreation(planItem);
  };

  const handleExportPlan = () => {
    const headers = [
      "Dia da Semana",
      "Horario",
      "Formato",
      "Estagio de Funil",
      "Tema da Publicacao",
      "Hook Magnetico (Slide 1)",
      "Objetivo Estrategico",
      "CTA Sugerida",
      "Status",
    ];

    const rows: string[][] = [];

    weekAgenda.forEach((day) => {
      day.activities.forEach((act) => {
        rows.push([
          `"${day.fullName} (${day.dateNumber}/Out)"`,
          `"${act.time}"`,
          `"${act.format}"`,
          `"${act.funnelStage}"`,
          `"${act.theme.replace(/"/g, '""')}"`,
          `"${act.hookHeadline.replace(/"/g, '""')}"`,
          `"${act.objective.replace(/"/g, '""')}"`,
          `"${act.ctaText.replace(/"/g, '""')}"`,
          `"${act.status || "planejado"}"`,
        ]);
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const brandFileName = (companyProfile.name || "blacklink")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `agenda_editorial_${brandFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadFeedback("Agenda e cronograma editorial exportados com sucesso em CSV!");
    setTimeout(() => setDownloadFeedback(null), 4000);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTheme.trim()) return;

    addPlanItem({
      dayNumber: editorialPlan.length + 1,
      dayLabel: newDayLabel.trim() || `Pauta #${editorialPlan.length + 1}`,
      theme: newTheme.trim(),
      hookHeadline: newHook.trim() || newTheme.trim(),
      format: newFormat,
      funnelStage: newFunnelStage,
      objective: newObjective.trim() || "Posicionamento e conversão B2B",
      viralAngle: "Ângulo de autoridade e dados práticos",
      ctaText: newCta.trim() || "Salve para consultar mais tarde",
      status: "planejado",
    });

    setIsAddingItem(false);
    setNewTheme("");
    setNewHook("");
    setNewDayLabel("");
    setNewObjective("");
    setNewCta("");
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Banner Superior Limpo com Controles Executivos */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 lg:p-8 shadow-2xl space-y-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                02
              </span>
              <h2 className="text-xl font-semibold text-white tracking-tight font-heading">
                Planejamento &amp; Cronograma Editorial
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans max-w-2xl">
              Selecione o dia na <strong>Agenda Diária</strong> para ver horários (Stories e Carrosséis) e produzir no estúdio com 1 clique, ou expanda para a <strong>Grade Semanal</strong> completa.
            </p>
          </div>

          {/* Botões Superiores de Exportação e Regeneração */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportPlan}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingPlan}
              onClick={() => generateEditorialPlan()}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Gerando Pautas...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-black" />
                  <span>Regenerar com IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {downloadFeedback && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-mono text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{downloadFeedback}</span>
          </div>
        )}

        {/* Barra de Controles: SELETOR DE VISÃO (Diária / Semanal / Mensal) + FILTRO DE FUNIL */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
          {/* Seletor de Visão (Tabs Apple / Linear) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Visão:
            </span>
            <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10">
              <button
                type="button"
                onClick={() => setPlanningViewMode("diario")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  planningViewMode === "diario"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Diária (Agenda)</span>
              </button>

              <button
                type="button"
                onClick={() => setPlanningViewMode("semanal")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  planningViewMode === "semanal"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Columns3 className="h-3.5 w-3.5" />
                <span>Semanal (Grade)</span>
              </button>

              <button
                type="button"
                onClick={() => setPlanningViewMode("mensal")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  planningViewMode === "mensal"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                <span>Mensal (4 Semanas)</span>
              </button>
            </div>
          </div>

          {/* Filtro de Funil e Botão + Nova Pauta */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
              {(["all", "topo", "meio", "fundo"] as const).map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setFunnelFilter(stage)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    funnelFilter === stage
                      ? "bg-white/15 text-white font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {stage === "all"
                    ? "Todos"
                    : stage === "topo"
                    ? "Topo"
                    : stage === "meio"
                    ? "Meio"
                    : "Fundo"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingItem ? "Fechar" : "+ Pauta"}</span>
            </button>
          </div>
        </div>

        {/* Formulário de Adição de Nova Pauta */}
        {isAddingItem && (
          <form
            onSubmit={handleAddNewItem}
            className="rounded-2xl border border-white/10 bg-black/50 p-5 space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold text-white">Adicionar Pauta Personalizada</span>
              <span className="text-[10px] font-mono text-zinc-400">Entrada Rápida</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Dia / Data</label>
                <input
                  type="text"
                  placeholder="Ex: Quarta • 08/Out"
                  value={newDayLabel}
                  onChange={(e) => setNewDayLabel(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Tema Principal *</label>
                <input
                  type="text"
                  placeholder="Ex: Como Reduzir o Ciclo de Vendas B2B em 40%"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Hook Headline (Gancho)</label>
                <input
                  type="text"
                  placeholder="Ex: Se sua equipe ainda gasta 3 horas preenchendo planilhas..."
                  value={newHook}
                  onChange={(e) => setNewHook(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Estágio de Funil</label>
                <select
                  value={newFunnelStage}
                  onChange={(e) => setNewFunnelStage(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-white/10 bg-black/60 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="topo" className="bg-[#0A0A0A]">Topo (Atração)</option>
                  <option value="meio" className="bg-[#0A0A0A]">Meio (Educação)</option>
                  <option value="fundo" className="bg-[#0A0A0A]">Fundo (Conversão)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                Salvar Pauta
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 1. VISÃO DIÁRIA COM AGENDA INTERATIVA DE DIAS                        */}
      {/* ==================================================================== */}
      {planningViewMode === "diario" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SELETOR INTERATIVO DE DIAS DA AGENDA (STRIP SEMANAL) */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Agenda Semanal • Clique no Dia para Ver os Horários
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Hoje é Quarta, 08/Out
              </span>
            </div>

            {/* Strip de 7 Botões de Dias */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {weekAgenda.map((day) => {
                const isSelected = day.index === selectedAgendaDayIndex;
                const isToday = day.isToday;

                return (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => setSelectedAgendaDayIndex(day.index)}
                    className={`relative flex flex-col items-center justify-center py-3 px-1 sm:px-2 rounded-xl border transition-all cursor-pointer group text-center ${
                      isSelected
                        ? "bg-white text-black border-white shadow-lg scale-[1.02]"
                        : isToday
                        ? "bg-emerald-500/10 border-emerald-500/40 text-white hover:border-emerald-500/60"
                        : "bg-black/30 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {/* Badge "HOJE" */}
                    {isToday && (
                      <span
                        className={`absolute -top-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-tight shadow-sm ${
                          isSelected
                            ? "bg-black text-emerald-400 border border-emerald-400/40"
                            : "bg-emerald-500 text-black"
                        }`}
                      >
                        Hoje
                      </span>
                    )}

                    <span
                      className={`text-[10px] sm:text-xs font-mono font-bold uppercase ${
                        isSelected ? "text-zinc-800" : isToday ? "text-emerald-300" : "text-zinc-400"
                      }`}
                    >
                      {day.shortName}
                    </span>

                    <span
                      className={`text-base sm:text-xl font-bold tracking-tight font-heading my-0.5 ${
                        isSelected ? "text-black" : "text-white"
                      }`}
                    >
                      {day.dateNumber}
                    </span>

                    {/* Indicadores de atividades programadas naquele dia */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        title="08:30 Story"
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-purple-600" : "bg-purple-400"
                        }`}
                      />
                      <span
                        title="12:00 Post Principal"
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-sky-600" : "bg-sky-400"
                        }`}
                      />
                      <span
                        title="18:00 Story"
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-purple-600" : "bg-purple-400"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CABEÇALHO DO DIA SELECIONADO */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                  {selectedDay.fullDateLabel}
                </h3>
                {selectedDay.isToday && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Dia Atual
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Foco Estratégico: <strong>{selectedDay.strategicFocus}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">
                {filteredDayActivities.length} Atividades Programadas
              </span>
              <button
                type="button"
                onClick={() => setPlanningViewMode("semanal")}
                className="text-xs font-mono text-zinc-400 hover:text-white underline cursor-pointer flex items-center gap-1 ml-2"
              >
                <span>Ver toda a semana</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* LINHA DO TEMPO DOS HORÁRIOS DO DIA SELECIONADO */}
          <div className="space-y-4">
            {filteredDayActivities.map((activity) => {
              const isStory = activity.format === "story";
              const isCarousel = activity.format === "carousel";
              const isPost = activity.format === "post";
              const isTopo = activity.funnelStage === "topo";
              const isMeio = activity.funnelStage === "meio";

              return (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4 hover:border-white/20 transition-all shadow-xl backdrop-blur-xl group"
                >
                  {/* Top Bar da Atividade com Horário e Formato */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-3">
                      {/* Badge de Horário em Destaque */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-mono text-xs font-bold shadow-inner">
                        <Clock className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{activity.time}</span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {activity.period === "manha"
                            ? "• Manhã"
                            : activity.period === "tarde"
                            ? "• Tarde (Horário Nobre)"
                            : "• Noite"}
                        </span>
                      </div>

                      {/* Badge de Formato */}
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                          isStory
                            ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                            : isCarousel
                            ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
                            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        {isStory ? (
                          <Smartphone className="h-3.5 w-3.5" />
                        ) : isCarousel ? (
                          <Layers className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {isStory
                            ? "Story (9:16)"
                            : isCarousel
                            ? "Carrossel (Feed)"
                            : "Post Único"}
                        </span>
                      </span>
                    </div>

                    {/* Badge de Estágio de Funil */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          isTopo
                            ? "border-sky-500/40 bg-sky-500/15 text-sky-300"
                            : isMeio
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        {isTopo ? "Topo (Atração)" : isMeio ? "Meio (Educação)" : "Fundo (Conversão)"}
                      </span>

                      {activity.status === "pronto" && (
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Pronto</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo: Tema e Gancho */}
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-white tracking-tight font-heading">
                      {activity.theme}
                    </h4>

                    <div className="rounded-xl bg-black/50 border border-white/5 p-3.5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                        {isStory ? "Gancho / Texto da Tela de Abertura:" : "Gancho de Retenção (Headline do Slide 1):"}
                      </span>
                      <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                        &ldquo;{activity.hookHeadline}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Grid de Objetivo e CTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-black/30 p-3 border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">
                        Objetivo Estratégico:
                      </span>
                      <p className="text-zinc-300 leading-relaxed">{activity.objective}</p>
                    </div>

                    <div className="rounded-xl bg-black/30 p-3 border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5 font-bold">
                        Chamada para Ação (CTA):
                      </span>
                      <p className="text-zinc-300 leading-relaxed">{activity.ctaText}</p>
                    </div>
                  </div>

                  {/* Rodapé com o BOTÃO DE AÇÃO OBRIGATÓRIO (PRODUZIR NO ESTÚDIO) */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400">
                      {isStory
                        ? "3 Lâminas verticais 9:16 geradas no estúdio"
                        : isCarousel
                        ? "Carrossel de alta retenção no feed"
                        : "Post de autoridade executiva"}
                    </span>

                    {/* BOTÃO PRIMÁRIO: PRODUZIR NO ESTÚDIO (NUNCA 'VER NAS PRÉVIAS') */}
                    <button
                      type="button"
                      onClick={() => handleProduceActivity(selectedDay.dayLabel, activity, selectedDay.mainPlanItem)}
                      className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg"
                    >
                      <Wand2 className="h-3.5 w-3.5 text-black" />
                      <span>
                        {isStory
                          ? "⚡ Produzir Story no Estúdio ➔"
                          : isCarousel
                          ? "⚡ Produzir Carrossel no Estúdio ➔"
                          : "⚡ Produzir Post no Estúdio ➔"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. VISÃO SEMANAL EXPANDIDA (Grade Completa Segunda a Domingo)       */}
      {/* ==================================================================== */}
      {planningViewMode === "semanal" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-white font-bold block">
                Grade Semanal de Publicações (Segunda a Domingo)
              </span>
              <span className="text-xs text-zinc-400">
                Visão panorâmica dos 7 dias com Stories e Posts integrados. Clique em qualquer card para produzir.
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Topo
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Meio
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Fundo
              </span>
            </div>
          </div>

          {/* Grid dos 7 Dias da Semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekAgenda.map((day) => {
              const isToday = day.isToday;
              const mainAct = day.activities.find((a) => a.time === "12:00") || day.activities[0];

              return (
                <div
                  key={day.index}
                  className={`rounded-2xl border p-5 space-y-4 transition-all shadow-md flex flex-col justify-between ${
                    isToday
                      ? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                            isToday
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-white/[0.06] text-white border-white/10"
                          }`}
                        >
                          {day.dayLabel}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-mono uppercase bg-emerald-500 text-black px-1.5 py-0.2 rounded font-extrabold">
                            Hoje
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAgendaDayIndex(day.index);
                          setPlanningViewMode("diario");
                        }}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        Ver Detalhes ➔
                      </button>
                    </div>

                    {/* Pauta Principal do Meio-Dia */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="text-emerald-400 font-bold">12:00 • Post Principal</span>
                        <span className="uppercase text-zinc-400">{mainAct.format}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white tracking-tight line-clamp-2 font-heading">
                        {mainAct.theme}
                      </h4>
                      <p className="text-xs text-zinc-300 bg-black/40 p-2.5 rounded-lg border border-white/5 line-clamp-2">
                        &ldquo;{mainAct.hookHeadline}&rdquo;
                      </p>
                    </div>

                    {/* Lista dos 3 Horários Programados do Dia */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                        Cadência do Dia ({day.activities.length} Atividades):
                      </span>
                      <div className="space-y-1">
                        {day.activities.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-center justify-between text-[11px] bg-black/30 px-2 py-1.5 rounded-md border border-white/5"
                          >
                            <span className="font-mono text-zinc-300 font-bold">{act.time}</span>
                            <span className="text-zinc-400 line-clamp-1 max-w-[130px] text-[10px]">
                              {act.format === "story" ? "Story: " : "Feed: "}
                              {act.theme}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleProduceActivity(day.dayLabel, act, day.mainPlanItem)}
                              className="text-[10px] font-semibold text-white hover:underline cursor-pointer"
                            >
                              Produzir ➔
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card com Botão Primário para Produzir */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400">
                      Foco: {day.strategicFocus.split("•")[0]}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleProduceActivity(day.dayLabel, mainAct, day.mainPlanItem)}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                    >
                      <Wand2 className="h-3 w-3" />
                      <span>Produzir no Estúdio ➔</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. VISÃO MENSAL (Calendário Estratégico 4 Semanas)                   */}
      {/* ==================================================================== */}
      {planningViewMode === "mensal" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Visão Mensal Estratégica (Ciclo de 4 Semanas de Crescimento)
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Total: 21 Atividades Programadas no Mês • Cobertura de Funil: 100%
            </span>
          </div>

          {/* 4 Blocos de Semanas Estratégicas do Mês */}
          <div className="space-y-4">
            {MONTH_WEEKS.map((weekInfo, weekIdx) => {
              const weekPlanItem = editorialPlan[weekIdx];

              return (
                <div
                  key={weekInfo.week}
                  className={`rounded-2xl border ${weekInfo.border} bg-white/[0.02] p-5 space-y-4 transition-all shadow-md`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                      <div>
                        <h4 className="text-sm font-semibold text-white tracking-tight font-heading">
                          {weekInfo.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-sans">{weekInfo.focus}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-md border border-white/10 ${weekInfo.badge}`}>
                      Semana {weekInfo.week} de 4
                    </span>
                  </div>

                  {weekPlanItem ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="space-y-1 md:col-span-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-400 font-bold">
                            {weekPlanItem.dayLabel}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-white">
                            {weekPlanItem.funnelStage}
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-white leading-snug">
                          {weekPlanItem.theme}
                        </h5>
                        <p className="text-xs text-zinc-300 line-clamp-1 italic">
                          &ldquo;{weekPlanItem.hookHeadline}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center justify-start md:justify-end gap-2.5 pt-2 md:pt-0">
                        {/* Botão Primário é SEMPRE Produzir no Estúdio */}
                        <button
                          type="button"
                          onClick={() => selectPlanForCreation(weekPlanItem)}
                          className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          <span>Produzir no Estúdio ➔</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-zinc-500 font-mono">
                      Pauta em elaboração para este período • Clique em &quot;+ Pauta&quot; para preencher.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
