/**
 * Robô Autônomo de Otimização de Tráfego Pago - Black Link CRM
 *
 * Executa as diretrizes algorítmicas de escala para anúncios de alta performance:
 * 1. Escala Vencedora: Se ROAS >= 3.5x e CTR >= 2.5%, aumenta o orçamento diário em 20%.
 * 2. Proteção de Capital: Se ROAS < 2.0x ou CTR < 1.0% (com volume mínimo validado), pausa o conjunto.
 * 3. Manutenção: Conjuntos no envelope padrão continuam em monitoramento ativo.
 */

import {
  fetchMetaAdSets,
  updateMetaAdSetBudget,
  updateMetaAdSetStatus,
  type MetaAdSetRecord,
} from "./meta-ads";

export interface OptimizationRuleConfig {
  minRoasForScale: number; // Padrão: 3.5x
  minCtrForScale: number; // Padrão: 2.5%
  maxRoasForPause: number; // Padrão: 2.0x
  maxCtrForPause: number; // Padrão: 1.0%
  scaleBudgetFactor: number; // Padrão: 1.20 (+20%)
  minImpressionsForDecision: number; // Padrão: 1000 (validação amostral)
}

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationRuleConfig = {
  minRoasForScale: 3.5,
  minCtrForScale: 2.5,
  maxRoasForPause: 2.0,
  maxCtrForPause: 1.0,
  scaleBudgetFactor: 1.2,
  minImpressionsForDecision: 1000,
};

export type DecisionType = "scale" | "pause" | "maintain";

export interface OptimizationAuditLog {
  id: string;
  timestamp: string;
  adSetId: string;
  adSetName: string;
  action: DecisionType;
  previousBudget: number;
  newBudget: number;
  roas: number;
  ctr: number;
  spend: number;
  conversions: number;
  rationale: string;
}

export interface OptimizationRunResult {
  summary: {
    totalEvaluated: number;
    scaledCount: number;
    pausedCount: number;
    maintainedCount: number;
    totalDailyBudgetBefore: number;
    totalDailyBudgetAfter: number;
    budgetDelta: number;
    consolidatedRoas: number;
    averageCtr: number;
  };
  auditLogs: OptimizationAuditLog[];
  updatedCampaigns: MetaAdSetRecord[];
  executedAt: string;
}

/**
 * Avalia um conjunto de anúncios individual e retorna a ação recomendada
 */
export function evaluateAdSet(
  adSet: MetaAdSetRecord,
  config: OptimizationRuleConfig = DEFAULT_OPTIMIZATION_CONFIG
): {
  action: DecisionType;
  newBudget: number;
  newStatus: "active" | "paused" | "learning";
  rationale: string;
} {
  const { roas, ctr, dailyBudget, impressions } = adSet;

  // 1. Regra de Escala Vencedora (+20% de Orçamento Diário)
  // Requisito: ROAS >= 3.5x E CTR >= 2.50%
  if (roas >= config.minRoasForScale && ctr >= config.minCtrForScale) {
    const scaledBudget = Math.round(dailyBudget * config.scaleBudgetFactor * 100) / 100;
    return {
      action: "scale",
      newBudget: scaledBudget,
      newStatus: "active",
      rationale: `Escala ativada: ROAS de ${roas.toFixed(1)}x (meta >= ${config.minRoasForScale}x) e CTR de ${ctr.toFixed(2)}% (meta >= ${config.minCtrForScale}%). Orçamento diário ampliado em +20% (R$ ${dailyBudget.toFixed(2)} -> R$ ${scaledBudget.toFixed(2)}).`,
    };
  }

  // 2. Regra de Proteção de Caixa (Pausar Conjunto Sub-performer)
  // Requisito: ROAS < 2.0x OU CTR < 1.00% após amostragem mínima de impressões
  const hasSampleSignificance = impressions >= config.minImpressionsForDecision;

  if (hasSampleSignificance && (roas < config.maxRoasForPause || ctr < config.maxCtrForPause)) {
    const causeList: string[] = [];
    if (roas < config.maxRoasForPause) {
      causeList.push(`ROAS ${roas.toFixed(1)}x abaixo do piso ${config.maxRoasForPause}x`);
    }
    if (ctr < config.maxCtrForPause) {
      causeList.push(`CTR ${ctr.toFixed(2)}% abaixo do piso ${config.maxCtrForPause}%`);
    }

    return {
      action: "pause",
      newBudget: dailyBudget,
      newStatus: "paused",
      rationale: `Pausa imediata: ${causeList.join(" e ")}. Conjunto desativado para estancar sangria de verba publicitária.`,
    };
  }

  // 3. Manutenção no Envelope Operacional
  return {
    action: "maintain",
    newBudget: dailyBudget,
    newStatus: adSet.status,
    rationale: `Métricas estáveis (ROAS ${roas.toFixed(1)}x, CTR ${ctr.toFixed(2)}%). Mantendo conjunto em observação contínua.`,
  };
}

/**
 * Executa o ciclo completo de otimização em todas as campanhas
 */
export async function runAutonomousOptimization(
  customConfig?: Partial<OptimizationRuleConfig>
): Promise<OptimizationRunResult> {
  const config: OptimizationRuleConfig = {
    ...DEFAULT_OPTIMIZATION_CONFIG,
    ...customConfig,
  };

  const adSets = await fetchMetaAdSets();
  const auditLogs: OptimizationAuditLog[] = [];
  const updatedCampaigns: MetaAdSetRecord[] = [];

  let scaledCount = 0;
  let pausedCount = 0;
  let maintainedCount = 0;
  let totalDailyBudgetBefore = 0;
  let totalDailyBudgetAfter = 0;

  for (const ad of adSets) {
    totalDailyBudgetBefore += ad.dailyBudget;
    const evaluation = evaluateAdSet(ad, config);

    let updatedAd: MetaAdSetRecord = { ...ad };

    if (evaluation.action === "scale") {
      scaledCount++;
      await updateMetaAdSetBudget(ad.id, evaluation.newBudget);
      updatedAd.dailyBudget = evaluation.newBudget;
      updatedAd.status = "active";
    } else if (evaluation.action === "pause") {
      pausedCount++;
      await updateMetaAdSetStatus(ad.id, "paused");
      updatedAd.status = "paused";
    } else {
      maintainedCount++;
    }

    totalDailyBudgetAfter += updatedAd.dailyBudget;
    updatedCampaigns.push(updatedAd);

    auditLogs.push({
      id: `log-${Date.now()}-${ad.id}`,
      timestamp: new Date().toISOString(),
      adSetId: ad.id,
      adSetName: ad.name,
      action: evaluation.action,
      previousBudget: ad.dailyBudget,
      newBudget: updatedAd.dailyBudget,
      roas: ad.roas,
      ctr: ad.ctr,
      spend: ad.spend,
      conversions: ad.conversions,
      rationale: evaluation.rationale,
    });
  }

  // Cálculo de indicadores consolidados
  const totalImpressions = updatedCampaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = updatedCampaigns.reduce((acc, c) => acc + c.clicks, 0);
  const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const consolidatedRoas =
    updatedCampaigns.length > 0
      ? updatedCampaigns.reduce((acc, c) => acc + c.roas, 0) / updatedCampaigns.length
      : 0;

  return {
    summary: {
      totalEvaluated: adSets.length,
      scaledCount,
      pausedCount,
      maintainedCount,
      totalDailyBudgetBefore: Math.round(totalDailyBudgetBefore * 100) / 100,
      totalDailyBudgetAfter: Math.round(totalDailyBudgetAfter * 100) / 100,
      budgetDelta: Math.round((totalDailyBudgetAfter - totalDailyBudgetBefore) * 100) / 100,
      consolidatedRoas: Math.round(consolidatedRoas * 10) / 10,
      averageCtr: Math.round(averageCtr * 100) / 100,
    },
    auditLogs,
    updatedCampaigns,
    executedAt: new Date().toISOString(),
  };
}
