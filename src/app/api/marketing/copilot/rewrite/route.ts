import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CopilotAction = "agressivo" | "encurtar" | "executivo";

interface RewriteRequest {
  action: CopilotAction;
  headline?: string;
  bodyText?: string;
  tag?: string;
}

/**
 * Endpoint de Micro-Edição Inteligente por Lâmina (Copiloto AI Local)
 * Permite reescrever headline e bodyText sob diretrizes estratégicas específicas (Agressivo, Encurtar, Executivo).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RewriteRequest;
    const { action, headline = "", bodyText = "", tag = "" } = body;

    if (!action) {
      return NextResponse.json(
        { error: "O parâmetro 'action' (agressivo, encurtar, executivo) é obrigatório." },
        { status: 400 }
      );
    }

    const cleanHeadline = headline.trim();
    const cleanBodyText = bodyText.trim();

    // Remove asteriscos para processamento limpo se houver
    const rawHeadline = cleanHeadline.replace(/\*\*/g, "");

    let newHeadline = cleanHeadline;
    let newBodyText = cleanBodyText;

    if (action === "agressivo") {
      // Foco em dor extrema, fricção comercial e custo de inércia
      if (rawHeadline) {
        newHeadline = `O custo oculto de ignorar **${rawHeadline.split(" ").slice(0, 4).join(" ")}**: você está perdendo negócios`;
      } else {
        newHeadline = "Pare de queimar CAC: o gargalo invisível que trava seu faturamento";
      }

      newBodyText = cleanBodyText
        ? `A cada ciclo sem correção, sua operação queima margem e desperdiça leads qualificados. O mercado corporativo não tolera ineficiência: ajuste este pilar hoje ou ceda espaço para a concorrência.`
        : `A cada ciclo sem correção, sua operação queima margem e desperdiça leads qualificados. O mercado corporativo não tolera ineficiência: ajuste este pilar hoje ou ceda espaço para a concorrência.`;
    } else if (action === "encurtar") {
      // Redução cirúrgica de caracteres mantendo a essência e o punch
      const words = rawHeadline.split(" ").filter(Boolean);
      if (words.length > 5) {
        newHeadline = `**${words.slice(0, 3).join(" ")}**: ${words.slice(3, 7).join(" ")}`;
      } else if (words.length > 0) {
        newHeadline = `**${words.join(" ")}** em escala`;
      } else {
        newHeadline = "**Decisão imediata**: foco em tração rápida";
      }

      if (cleanBodyText) {
        // Pega as primeiras duas sentenças ou comprime
        const sentences = cleanBodyText.split(/[.!?]+/).filter(Boolean);
        newBodyText = sentences.length > 0 ? `${sentences[0].trim()}. Menos atrito, maior conversão.` : cleanBodyText;
      } else {
        newBodyText = "Elimine o atrito técnico e acelere o fechamento.";
      }
    } else if (action === "executivo") {
      // Elevação para o vocabulário de Diretoria e C-Level (Valuation, Unit Economics, Governança)
      if (rawHeadline) {
        newHeadline = `Maximizando a eficiência de capital: a tese de **${rawHeadline.split(" ").slice(0, 4).join(" ")}**`;
      } else {
        newHeadline = "Previsibilidade de receita e governança comercial em escala";
      }

      newBodyText = `Decisores estratégicos priorizam a blindagem dos unit economics e previsibilidade de caixa. A padronização desta diretriz consolida a governança da esteira e destrava valuation no longo prazo.`;
    }

    return NextResponse.json({
      success: true,
      action,
      headline: newHeadline,
      bodyText: newBodyText,
      tag: tag || undefined,
    });
  } catch (err: unknown) {
    console.error("Erro no copiloto de micro-edição:", err);
    return NextResponse.json(
      { error: "Falha interna ao processar a micro-edição da lâmina." },
      { status: 500 }
    );
  }
}
