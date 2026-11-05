export interface CadenceStep {
  id: string;
  dayNumber: number;
  dayOffset: number; // Dias a partir de createdAt (ex: Dia 1 = 0 dias, Dia 2 = 1 dia)
  dayLabel: string;
  shortAction: string;
  title: string;
  description: string;
}

export const CADENCE_STEPS: CadenceStep[] = [
  {
    id: "step-1",
    dayNumber: 1,
    dayOffset: 0,
    dayLabel: "Dia 1",
    shortAction: "Cold Call",
    title: "1º Contato (Cold Call / Apresentação)",
    description: "Contato inicial de apresentação da Gofer Metais e validação de decisor",
  },
  {
    id: "step-2",
    dayNumber: 1,
    dayOffset: 0,
    dayLabel: "Dia 1",
    shortAction: "Envio Catálogo",
    title: "Envio de Catálogo & Tabela (WhatsApp / E-mail)",
    description: "Envio imediato da linha de tubos, perfis e chapas por WhatsApp ou E-mail",
  },
  {
    id: "step-3",
    dayNumber: 2,
    dayOffset: 1,
    dayLabel: "Dia 2",
    shortAction: "Follow-up 24h",
    title: "Follow-up 24h (Ligação / WhatsApp)",
    description: "Confirmação de recebimento do catálogo e sondagem de demandas abertas",
  },
  {
    id: "step-4",
    dayNumber: 4,
    dayOffset: 3,
    dayLabel: "Dia 4",
    shortAction: "Gatilho Promoção",
    title: "Gatilho de Oportunidade (Tubos & Perfis)",
    description: "Oferta pontual de oportunidade para puxar cotação sem compromisso",
  },
  {
    id: "step-5",
    dayNumber: 7,
    dayOffset: 6,
    dayLabel: "Dia 7",
    shortAction: "Cotação Base",
    title: "Cotação Base & Fechamento",
    description: "Envio de valores com prazo de entrega e rota de carga",
  },
  {
    id: "step-6",
    dayNumber: 10,
    dayOffset: 9,
    dayLabel: "Dia 10",
    shortAction: "Follow-up Final",
    title: "Follow-up Final de Posicionamento",
    description: "Garantir segunda via de fornecimento para próximas compras",
  },
];

export type StepTemporalType = "completed" | "today" | "overdue" | "future";

export interface StepTemporalStatus {
  type: StepTemporalType;
  tag: string; // Ex: "[Hoje]", "[Atrasado]", "[Concluído]", "[Em 2 dias]"
  targetDate: Date;
  daysLate?: number;
  badgeClass: string;
}

/**
 * Normaliza uma data para a meia-noite (00:00:00.000) no horário local
 */
export function toStartOfDay(date: Date | string): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Calcula o status temporal de uma etapa de cadência relativa à data de criação do lead
 */
export function calculateStepTemporalStatus(
  createdAt: Date | string,
  dayOffset: number,
  isCompleted: boolean,
  now: Date = new Date()
): StepTemporalStatus {
  const createdDate = toStartOfDay(createdAt);
  const nowDate = toStartOfDay(now);

  // Data alvo prevista para a realização do passo
  const targetDate = new Date(createdDate);
  targetDate.setDate(targetDate.getDate() + dayOffset);

  if (isCompleted) {
    return {
      type: "completed",
      tag: "Concluído",
      targetDate,
      badgeClass:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold",
    };
  }

  const diffTime = nowDate.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      type: "today",
      tag: "Hoje",
      targetDate,
      badgeClass:
        "border-amber-400/40 bg-amber-400/15 text-amber-300 font-bold animate-pulse",
    };
  }

  if (diffDays > 0) {
    return {
      type: "overdue",
      tag: diffDays === 1 ? "Atrasado (1d)" : `Atrasado (${diffDays}d)`,
      targetDate,
      daysLate: diffDays,
      badgeClass:
        "border-rose-500/40 bg-rose-500/15 text-rose-400 font-bold",
    };
  }

  // diffDays < 0 (futuro)
  const daysUntil = Math.abs(diffDays);
  return {
    type: "future",
    tag: daysUntil === 1 ? "Em 1 dia" : `Em ${daysUntil} dias`,
    targetDate,
    badgeClass: "border-[#2e2e2e] bg-[#141414] text-[#afafaf] font-medium",
  };
}

export interface NextCadenceActionInfo {
  actionText: string;
  temporalTag: string;
  type: StepTemporalType;
  badgeClass: string;
  fullLabel: string;
}

/**
 * Determina a Próxima Ação da Cadência para o card externo do Kanban
 */
export function getNextCadenceAction(
  createdAt: Date | string,
  completedStepIds: string[],
  leadStatus?: string,
  now: Date = new Date()
): NextCadenceActionInfo {
  if (leadStatus === "closed") {
    return {
      actionText: "Negociação Concluída",
      temporalTag: "Fechado",
      type: "completed",
      badgeClass: "border-accent/40 bg-accent/15 text-accent font-semibold",
      fullLabel: "Conta Fechada",
    };
  }

  // Localiza a primeira etapa não concluída na sequência
  const nextStep = CADENCE_STEPS.find((step) => !completedStepIds.includes(step.id));

  if (!nextStep) {
    return {
      actionText: "Cadência Concluída",
      temporalTag: "Finalizado",
      type: "completed",
      badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold",
      fullLabel: "Cadência 100% Concluída",
    };
  }

  const temporalStatus = calculateStepTemporalStatus(
    createdAt,
    nextStep.dayOffset,
    false,
    now
  );

  let badgeClass = "";
  if (temporalStatus.type === "overdue") {
    badgeClass = "border-rose-500/40 bg-rose-500/15 text-rose-400 font-semibold";
  } else if (temporalStatus.type === "today") {
    badgeClass = "border-amber-400/40 bg-amber-400/15 text-amber-300 font-semibold";
  } else {
    badgeClass = "border-[#2e2e2e] bg-[#141414] text-[#afafaf] font-medium";
  }

  return {
    actionText: nextStep.shortAction,
    temporalTag: temporalStatus.tag,
    type: temporalStatus.type,
    badgeClass,
    fullLabel: `${nextStep.shortAction} • ${temporalStatus.tag}`,
  };
}

/**
 * Helper para extrair Nome e Empresa a partir da string bruta de leadName
 */
export function parseLeadInfo(rawName: string): { name: string; company: string } {
  const match = rawName.match(/^(.*?)(?:\s*\((.*?)\))?$/);
  const name = match?.[1]?.trim() || rawName;
  const company = match?.[2]?.trim() || "Empresa B2B";
  return { name, company };
}

/**
 * Constrói o texto do script padrão imediatamente interpolado para um lead
 */
export function buildDefaultInterpolatedScript({
  name,
  company,
  role,
  value,
}: {
  name: string;
  company: string;
  role: string;
  value: string;
}): string {
  const contactName = name || company || "Prezado(a)";
  return `Olá, ${contactName}! Aqui é o Lucas da Gofer Metais.
Somos distribuidores de aço e o meu objetivo hoje é claro: quero ter a oportunidade de participar da sua próxima cotação de tubos, chapas e perfis.
Segue o nosso catálogo em anexo. Podemos enviar os nossos valores sem compromisso na sua próxima demanda?`;
}

/**
 * Verifica se o lead teve alguma atividade concluída hoje ou se não tem pendências para hoje
 * (ex: já ligou e enviou e-mail hoje, e o próximo passo é para amanhã/futuro)
 */
export function isLeadCompletedToday(lead: {
  createdAt?: Date | string;
  cadenceState?: any;
  notes?: Array<{ createdAt?: string | Date; text?: string }>;
  status?: string;
}): boolean {
  if (!lead) return false;
  const cadence = lead.cadenceState || {};
  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  // 1. Teve registro de conclusão explícito hoje
  if (cadence.lastCompletedAt) {
    const compDate = new Date(cadence.lastCompletedAt);
    if (
      !isNaN(compDate.getTime()) &&
      compDate.getDate() === todayDate &&
      compDate.getMonth() === todayMonth &&
      compDate.getFullYear() === todayYear
    ) {
      return true;
    }
  }

  // 2. Anotação registrada hoje (qualquer nota adicionada hoje pelo operador indica que o lead foi trabalhado)
  if (Array.isArray(lead.notes) && lead.notes.length > 0) {
    const latest = lead.notes[0];
    if (latest?.createdAt) {
      const nDate = new Date(latest.createdAt);
      if (
        !isNaN(nDate.getTime()) &&
        nDate.getDate() === todayDate &&
        nDate.getMonth() === todayMonth &&
        nDate.getFullYear() === todayYear
      ) {
        return true;
      }
    }
  }

  // 3. Se o lead tem etapas concluídas (ou está em negociação) e a PRÓXIMA ação é futura (amanhã ou próximos dias):
  // Significa que as tarefas de hoje já foram cumpridas! Não deve ficar no topo pendente.
  const completedSteps: string[] = cadence.completedSteps || [];
  if (completedSteps.length > 0 && lead.createdAt) {
    const nextAction = getNextCadenceAction(lead.createdAt, completedSteps, lead.status, now);
    if (nextAction.type === "future" || nextAction.type === "completed") {
      return true;
    }
  }

  return false;
}

/**
 * Retorna o horário formatado (ex: 14:32) da última atividade concluída hoje
 */
export function getLastCompletedTime(lead: {
  cadenceState?: any;
  notes?: Array<{ createdAt?: string | Date }>;
}): string | null {
  if (!lead) return null;
  const cadence = lead.cadenceState || {};
  const rawTs = cadence.lastCompletedAt || (lead.notes && lead.notes[0]?.createdAt);
  if (!rawTs) return null;

  const d = new Date(rawTs);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  return null;
}


