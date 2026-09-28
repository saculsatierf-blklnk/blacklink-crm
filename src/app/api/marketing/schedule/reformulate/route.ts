import { NextRequest, NextResponse } from "next/server";
import type { ScheduledPost } from "@/store/useMarketingStore";

export const dynamic = "force-dynamic";

/**
 * Endpoint de reformulação de criativos e cópias orientada pelo feedback do cliente
 * Integração com o webhook do n8n e motor estratégico com renderização de lâminas atualizadas.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, originalAsset, feedback } = body;

    if (!postId || !feedback) {
      return NextResponse.json(
        { error: "Os parâmetros 'postId' e 'feedback' são obrigatórios." },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    // 1. Se o Webhook do n8n estiver configurado, despacha a solicitação de refação
    if (n8nWebhookUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const n8nRes = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reformulate",
            postId,
            originalAsset,
            feedbackDirective: feedback,
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (n8nRes.ok) {
          const n8nData = await n8nRes.json();
          if (n8nData.hookHeadline && n8nData.slides) {
            return NextResponse.json({
              success: true,
              updatedPost: {
                ...originalAsset,
                hookHeadline: n8nData.hookHeadline,
                bodyCopy: n8nData.bodyCopy || originalAsset.bodyCopy,
                ctaText: n8nData.ctaText || originalAsset.ctaText,
                slides: n8nData.slides,
                imageUrls: n8nData.imageUrls || originalAsset.imageUrls,
                status: "awaiting_approval",
                reformulationFeedback: feedback,
                lastReformulatedAt: new Date().toISOString(),
              },
            });
          }
        }
      } catch (webhookErr) {
        console.warn("Webhook n8n indisponível para refação, utilizando motor nativo:", webhookErr);
      }
    }

    // 2. Motor Estratégico Nativo de Refação
    // Ajusta o tom de voz e as lâminas baseado na diretriz do cliente
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const scheme = request.headers.get("x-forwarded-proto") === "https" ? "https" : "http";
    const baseUrl = `${scheme}://${host}`;

    const originalTheme = originalAsset?.theme || "Estratégia Comercial B2B";
    const format = originalAsset?.format || "carousel";
    const isAggressive = feedback.toLowerCase().includes("agressiv") || feedback.toLowerCase().includes("impacto");
    const isDirect = feedback.toLowerCase().includes("direto") || feedback.toLowerCase().includes("curt");

    let revisedHeadline = isAggressive
      ? `PARE DE PERDER MILHÕES: O Diagnóstico Definitivo de ${originalTheme}`
      : `Nova Abordagem: Como Escalar ${originalTheme} com Alta Eficiência`;

    let revisedBodyCopy = `${originalAsset?.bodyCopy || ""}\n\n[Revisão solicitada pelo cliente: "${feedback}"]\n\nAbordagem reestruturada com foco em tração direta, conversão qualificada e eliminação de pontos cegos operacionais.`;

    const totalSlides = originalAsset?.slides?.length || 5;

    // Atualiza os slides aplicando o feedback e gerando novas lâminas visuais
    const revisedSlides = (originalAsset?.slides || []).map((slide: any, idx: number) => {
      const slideNum = slide.slideNumber || idx + 1;
      let newHeadline = slide.headline;
      let newBody = slide.bodyText;

      if (slideNum === 1) {
        newHeadline = revisedHeadline;
        newBody = `Diretriz aplicada: ${feedback}. Foco imediato na dor do decisor enterprise.`;
      } else if (slideNum === totalSlides) {
        newHeadline = "Decisão Executiva";
        newBody = "Fale diretamente com os especialistas da Black Link e assuma o controle do seu pipeline.";
      } else {
        newHeadline = `Fase 0${slideNum}: Precisão Operacional`;
      }

      const query = new URLSearchParams({
        slide: String(slideNum),
        total: String(totalSlides),
        headline: newHeadline,
        body: newBody,
        format,
        theme: originalTheme,
      });

      const imageUrl = `${baseUrl}/api/marketing/render-slide?${query.toString()}`;

      return {
        ...slide,
        headline: newHeadline,
        bodyText: newBody,
        imageUrl,
      };
    });

    const updatedPost: ScheduledPost = {
      ...originalAsset,
      id: postId,
      theme: originalTheme,
      format,
      hookHeadline: revisedHeadline,
      bodyCopy: revisedBodyCopy,
      slides: revisedSlides,
      imageUrls: revisedSlides.map((s: any) => s.imageUrl),
      status: "awaiting_approval",
      reformulationFeedback: feedback,
      lastReformulatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      updatedPost,
      message: "Ativo reformulado com sucesso de acordo com a diretriz do cliente.",
    });
  } catch (error: any) {
    console.error("Erro ao reformular ativo:", error);
    return NextResponse.json(
      { error: "Falha interna ao processar a reformulação do ativo." },
      { status: 500 }
    );
  }
}
