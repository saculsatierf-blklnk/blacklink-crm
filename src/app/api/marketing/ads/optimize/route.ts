import { NextRequest, NextResponse } from "next/server";
import { runAutonomousOptimization, type OptimizationRuleConfig } from "@/lib/traffic-agent";

export const dynamic = "force-dynamic";

/**
 * Aciona o Robô de Otimização Autônoma para aplicar a regra de escala (+20%)
 * em criativos vencedores e pausar conjuntos sub-performers.
 */
export async function POST(request: NextRequest) {
  try {
    let customConfig: Partial<OptimizationRuleConfig> | undefined;

    try {
      const body = await request.json();
      if (body && typeof body === "object") {
        customConfig = body;
      }
    } catch {
      // Corpo vazio é perfeitamente válido, usa parâmetros padrão
    }

    const optimizationResult = await runAutonomousOptimization(customConfig);

    return NextResponse.json({
      success: true,
      ...optimizationResult,
    });
  } catch (error: any) {
    console.error("Erro na execução do Robô de Otimização Autônoma:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro desconhecido ao processar escala algorítmica de anúncios.",
      },
      { status: 500 }
    );
  }
}
