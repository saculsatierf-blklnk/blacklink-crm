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
    title: "Cold Call & Qualificação",
    description: "Mapeamento inicial de dores e identificação de decisores",
  },
  {
    id: "step-2",
    dayNumber: 2,
    dayOffset: 1,
    dayLabel: "Dia 2",
    shortAction: "E-mail Executivo",
    title: "E-mail Executivo de Abordagem",
    description: "Envio de proposta de valor e contextualização de mercado",
  },
  {
    id: "step-3",
    dayNumber: 3,
    dayOffset: 2,
    dayLabel: "Dia 3",
    shortAction: "Interação LinkedIn",
    title: "Conexão & Interação no LinkedIn",
    description: "Aproximação com os líderes da conta no ambiente corporativo",
  },
  {
    id: "step-4",
    dayNumber: 5,
    dayOffset: 4,
    dayLabel: "Dia 5",
    shortAction: "Follow-up 1",
    title: "Follow-up 1 (Cold Call + Mensagem)",
    description: "Retomada de contato para agendamento de demonstração",
  },
  {
    id: "step-5",
    dayNumber: 7,
    dayOffset: 6,
    dayLabel: "Dia 7",
    shortAction: "Estudo de Caso",
    title: "Envio de Estudo de Caso & ROI",
    description: "Apresentação de resultados obtidos em contas similares",
  },
  {
    id: "step-6",
    dayNumber: 10,
    dayOffset: 9,
    dayLabel: "Dia 10",
    shortAction: "Breakup Call",
    title: "Breakup Call / Encerramento",
    description: "Última tentativa de alinhamento antes do arquivamento",
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
    badgeClass: "border-glass-border bg-carbon-muted/50 text-sub font-medium",
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
    badgeClass = "border-glass-border bg-void/60 text-sub font-medium";
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
  const contactName = name || "Prezado(a)";
  const companyName = company || "sua organização";
  const roleTitle = role || "Executivo";
  const estimatedDealValue = value || "alto impacto";

  return `Olá ${contactName}, tudo bem? Notei que a ${companyName} vem estruturando novas iniciativas comerciais no mercado corporativo.

Como ${roleTitle}, você provavelmente busca mitigar gargalos operacionais e acelerar a captação de clientes B2B de alto valor.

Desenvolvemos uma estrutura sob medida com potencial de retorno estimado na ordem de ${estimatedDealValue}.

Você teria 10 minutos nesta quinta-feira para conversarmos sobre como aplicar essa estratégia na ${companyName}?`;
}
