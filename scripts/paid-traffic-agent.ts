import "dotenv/config";
import {
  runAutonomousOptimization,
  DEFAULT_OPTIMIZATION_CONFIG,
  type OptimizationAuditLog,
} from "../src/lib/traffic-agent";
import { getMetaConfig } from "../src/lib/meta-ads";

const IS_ONCE_MODE = process.argv.includes("--once") || !process.argv.includes("--daemon");
const INTERVAL_SECONDS = Number(process.env.AGENT_INTERVAL_SECONDS) || 60;

// Paleta ANSI Dark Industrial
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const TITANIUM = "\x1b[37m";
const EMERALD = "\x1b[32m";
const AMBER = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";

function printBanner() {
  console.log(`
${BOLD}${TITANIUM}========================================================================${RESET}
${BOLD}${TITANIUM}  BLACK LINK CRM &bull; ROBÔ AUTÔNOMO DE OTIMIZAÇÃO DE TRÁFEGO PAGO${RESET}
${DIM}  Arquitetura Algorítmica de Escala &bull; Meta Ads API Graph v20.0${RESET}
${BOLD}${TITANIUM}========================================================================${RESET}`);
}

function formatCurrency(val: number): string {
  return `R$ ${val.toFixed(2)}`;
}

async function executeCycle(cycleNumber: number) {
  const timestamp = new Date().toLocaleTimeString("pt-BR", { hour12: false });
  console.log(`\n${BOLD}[${timestamp}] CICLO #${cycleNumber} &bull; ANALISANDO CONJUNTOS DE ANÚNCIOS...${RESET}`);

  const metaConfig = getMetaConfig();
  if (metaConfig.isConfigured) {
    console.log(`${CYAN}  &bull; Conexão Meta Ads ativa na conta: ${metaConfig.adAccountId}${RESET}`);
  } else {
    console.log(`${AMBER}  &bull; Modo Local/Sandbox ativo (Simulador de alta fidelidade Black Link)${RESET}`);
  }

  console.log(`${DIM}  &bull; Diretriz de Escala: ROAS >= ${DEFAULT_OPTIMIZATION_CONFIG.minRoasForScale}x E CTR >= ${DEFAULT_OPTIMIZATION_CONFIG.minCtrForScale}% (+20% Orçamento)${RESET}`);
  console.log(`${DIM}  &bull; Diretriz de Proteção: ROAS < ${DEFAULT_OPTIMIZATION_CONFIG.maxRoasForPause}x OU CTR < ${DEFAULT_OPTIMIZATION_CONFIG.maxCtrForPause}% (Pausa Imediata)${RESET}`);

  try {
    const result = await runAutonomousOptimization();

    console.log(`\n${BOLD}${TITANIUM}--- RELATÓRIO DE AUDITORIA EXECUTIVA ---${RESET}`);

    result.auditLogs.forEach((log: OptimizationAuditLog, idx: number) => {
      let badge = `${DIM}[MANTER]${RESET}`;
      let color = TITANIUM;

      if (log.action === "scale") {
        badge = `${BOLD}${EMERALD}[ESCALADO +20%]${RESET}`;
        color = EMERALD;
      } else if (log.action === "pause") {
        badge = `${BOLD}${RED}[PAUSADO]${RESET}`;
        color = RED;
      }

      console.log(`\n  ${idx + 1}. ${badge} ${BOLD}${log.adSetName}${RESET}`);
      console.log(`     ID: ${DIM}${log.adSetId}${RESET} | ROAS: ${color}${log.roas.toFixed(1)}x${RESET} | CTR: ${color}${log.ctr.toFixed(2)}%${RESET} | Gasto: ${formatCurrency(log.spend)}`);
      console.log(`     Orçamento: ${formatCurrency(log.previousBudget)} &rarr; ${BOLD}${formatCurrency(log.newBudget)}${RESET}`);
      console.log(`     Decisão: ${DIM}${log.rationale}${RESET}`);
    });

    console.log(`\n${BOLD}${TITANIUM}--- BALANÇO DE ALOCAÇÃO DE CAPITAL ---${RESET}`);
    console.log(`  &bull; Total de Conjuntos Avaliados: ${result.summary.totalEvaluated}`);
    console.log(`  &bull; Criativos Vencedores Escalados: ${EMERALD}${result.summary.scaledCount}${RESET}`);
    console.log(`  &bull; Sub-performers Pausados:        ${RED}${result.summary.pausedCount}${RESET}`);
    console.log(`  &bull; Conjuntos Mantidos em Linha:   ${TITANIUM}${result.summary.maintainedCount}${RESET}`);
    console.log(`  &bull; Investimento Diário Anterior:   ${formatCurrency(result.summary.totalDailyBudgetBefore)}`);
    console.log(`  &bull; Novo Investimento Diário:       ${BOLD}${formatCurrency(result.summary.totalDailyBudgetAfter)}${RESET} (${result.summary.budgetDelta >= 0 ? "+" : ""}${formatCurrency(result.summary.budgetDelta)})`);
    console.log(`  &bull; ROAS Consolidado:               ${EMERALD}${result.summary.consolidatedRoas.toFixed(1)}x${RESET}`);
    console.log(`  &bull; CTR Médio Ponderado:            ${CYAN}${result.summary.averageCtr.toFixed(2)}%${RESET}`);

    console.log(`\n${BOLD}${EMERALD}✓ Ciclo concluído com sucesso. Telemetria sincronizada.${RESET}`);
  } catch (err: any) {
    console.error(`\n${RED}✗ Falha na execução do ciclo: ${err?.message || err}${RESET}`);
  }
}

async function main() {
  printBanner();

  if (IS_ONCE_MODE) {
    await executeCycle(1);
    console.log(`\n${DIM}Execução única (--once) finalizada.${RESET}\n`);
    process.exit(0);
  }

  let cycle = 1;
  await executeCycle(cycle);

  console.log(`\n${DIM}Modo contínuo ativo. Próxima avaliação em ${INTERVAL_SECONDS} segundos... (Ctrl+C para encerrar)${RESET}`);

  setInterval(async () => {
    cycle++;
    await executeCycle(cycle);
  }, INTERVAL_SECONDS * 1000);
}

main().catch((err) => {
  console.error("Erro fatal no robô de tráfego pago:", err);
  process.exit(1);
});
