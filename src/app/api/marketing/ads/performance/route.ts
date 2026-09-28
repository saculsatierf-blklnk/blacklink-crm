import { NextRequest, NextResponse } from "next/server";
import { fetchMetaAdSets, getMetaConfig } from "@/lib/meta-ads";

export const dynamic = "force-dynamic";

/**
 * Retorna as métricas consolidadas e conjuntos de anúncios monitorados pelo agente de tráfego
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") || undefined;

    const config = getMetaConfig();
    const campaigns = await fetchMetaAdSets(accountId);

    // Métricas agregadas
    const totalDailyBudget = campaigns.reduce((acc, curr) => acc + curr.dailyBudget, 0);
    const totalSpend = campaigns.reduce((acc, curr) => acc + curr.spend, 0);
    const totalImpressions = campaigns.reduce((acc, curr) => acc + curr.impressions, 0);
    const totalClicks = campaigns.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalConversions = campaigns.reduce((acc, curr) => acc + curr.conversions, 0);

    const weightedAvgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgRoas =
      campaigns.length > 0
        ? campaigns.reduce((acc, curr) => acc + curr.roas, 0) / campaigns.length
        : 0;

    const activeCount = campaigns.filter((c) => c.status === "active").length;
    const learningCount = campaigns.filter((c) => c.status === "learning").length;
    const pausedCount = campaigns.filter((c) => c.status === "paused").length;

    return NextResponse.json({
      metaConfigured: config.isConfigured,
      accountId: config.adAccountId || "sandbox-blacklink",
      metrics: {
        totalDailyBudget: Math.round(totalDailyBudget * 100) / 100,
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalImpressions,
        totalClicks,
        totalConversions,
        weightedAvgCtr: Math.round(weightedAvgCtr * 100) / 100,
        avgRoas: Math.round(avgRoas * 10) / 10,
        activeCount,
        learningCount,
        pausedCount,
      },
      campaigns,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao obter telemetria de tráfego pago:", error);
    return NextResponse.json(
      { error: "Falha interna ao recuperar dados da esteira de tráfego pago." },
      { status: 500 }
    );
  }
}
