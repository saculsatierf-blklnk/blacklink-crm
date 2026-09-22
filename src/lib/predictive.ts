export interface TelemetryTrigger {
  type:
    | "proposal_view_120s"
    | "internal_forward_multithread"
    | "pricing_page_recurrent"
    | "case_study_view"
    | "silence_post_pitch_48h";
  label: string;
  weight: number;
}

export const TELEMETRY_WEIGHTS: Record<string, { label: string; weight: number }> = {
  proposal_view_120s: {
    label: "Abertura e permanência na proposta (> 120s)",
    weight: 40,
  },
  internal_forward_multithread: {
    label: "Encaminhamento interno (Multi-threading)",
    weight: 25,
  },
  pricing_page_recurrent: {
    label: "Acesso recorrente à página de preços",
    weight: 20,
  },
  case_study_view: {
    label: "Visualização de Estudo de Caso",
    weight: 15,
  },
  silence_post_pitch_48h: {
    label: "Silêncio pós-apresentação (> 48h sem resposta)",
    weight: -30,
  },
};

export type DealZone = "closing" | "traction" | "nurturing";

export interface NextBestAction {
  score: number;
  zone: DealZone;
  zoneLabel: string;
  command: string;
  subtitle: string;
  badgeClass: string;
  scriptRecommendation: string;
}

/**
 * Calcula o Deal Momentum Score baseado nos eventos de telemetria ponderados
 */
export function calculateDealScore(
  events: Array<{ type: string; weight?: number }>,
  baseScore: number = 50
): number {
  if (!events || events.length === 0) return baseScore;

  const totalDelta = events.reduce((acc, curr) => {
    const predefined = TELEMETRY_WEIGHTS[curr.type]?.weight;
    const weight = typeof curr.weight === "number" ? curr.weight : predefined || 0;
    return acc + weight;
  }, 0);

  const rawScore = baseScore + totalDelta;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * Avalia o score e retorna o comando imperativo da Matriz de Decisão (NBA)
 */
export function resolveNextBestAction(
  score: number,
  params?: {
    name?: string;
    company?: string;
    latestObjection?: string;
  }
): NextBestAction {
  const contactName = params?.name || "Prezado(a)";
  const companyName = params?.company || "sua empresa";
  const objection = params?.latestObjection || "Aprovação orçamentária do CFO";

  if (score > 85) {
    return {
      score,
      zone: "closing",
      zoneLabel: "Zona de Fechamento",
      command: "LIGAÇÃO DIRETA",
      subtitle: "Prioridade Máxima • Alta Propensão de Fechamento",
      badgeClass:
        "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 font-bold",
      scriptRecommendation: `Roteiro de Contorno para ${contactName} (${companyName}):
"Olá ${contactName}, preparei um sumário de ROI com payback estimado inferior a 60 dias para sanar o ponto sobre '${objection}'. Posso te apresentar os números agora em 5 minutos para liberarmos o onboarding da ${companyName}?"`,
    };
  }

  if (score >= 65) {
    return {
      score,
      zone: "traction",
      zoneLabel: "Zona de Tração",
      command: "MENSAGEM DE ÁUDIO ASSÍNCRONA",
      subtitle: "Engajamento Positivo • Gancho via WhatsApp/LinkedIn",
      badgeClass:
        "border-amber-400/50 bg-amber-400/15 text-amber-300 font-bold",
      scriptRecommendation: `Gancho de Áudio Executivo (WhatsApp):
"Olá ${contactName}, vi que a equipe da ${companyName} revisou a estrutura da nossa proposta e os benchmarks de mercado. Gravei este áudio rápido para tirar qualquer dúvida técnica sobre o cronograma de implementação. Me avise se fizer sentido alinharmos hoje."`,
    };
  }

  return {
    score,
    zone: "nurturing",
    zoneLabel: "Zona de Nutrição",
    command: "MANTER EM CADÊNCIA AUTOMATIZADA",
    subtitle: "Baixo Sinal de Compra • Agente Autônomo em Execução",
    badgeClass: "border-glass-border bg-void/60 text-sub font-medium",
    scriptRecommendation: `Fluxo Autônomo Ativo:
A conta permanece sob o ciclo de nutrição do Agente Autônomo Zero-Touch, liberando a atenção do Closer para oportunidades na Zona de Fechamento.`,
  };
}
