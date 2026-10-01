import { NextRequest, NextResponse } from "next/server";
import type { GeneratedCreativeResult, CreativeSlide } from "@/store/useMarketingStore";
import { db } from "@/db/db";
import { scheduledPosts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { resolveTenantCompanyId } from "@/lib/auth/tenant";

export const dynamic = "force-dynamic";

/**
 * Endpoint de integração com o webhook do n8n para geração autônoma de criativos e copies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      theme,
      targetAudience,
      competitorsReferences,
      nicheValueProposition,
      format = "carousel",
      recentContext: explicitContext,
    } = body;

    if (!theme || typeof theme !== "string" || !theme.trim()) {
      return NextResponse.json(
        { error: "O tema principal é obrigatório para a geração de criativos." },
        { status: 400 }
      );
    }

    // 1. Roteamento Estrito para a Rota de Webhook n8n
    // Preserva a base da URL (localhost ou remota) e assegura o path /webhook/
    const rawWebhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      "http://localhost:5678/webhook/blacklink-marketing-generate";
    const n8nWebhookUrl = rawWebhookUrl.replace("/webhook-test/", "/webhook/");

    // 2. Injeção de Contexto (Evitar Amnésia da IA)
    // Resgata os temas e headlines das últimas 3 campanhas geradas neste Tenant no Supabase
    let recentContext = explicitContext || "Nenhum histórico recente";
    try {
      const tenantCompanyId = await resolveTenantCompanyId();
      if (tenantCompanyId) {
        const recentCampaigns = await db
          .select({
            theme: scheduledPosts.theme,
            hookHeadline: scheduledPosts.hookHeadline,
          })
          .from(scheduledPosts)
          .where(eq(scheduledPosts.companyId, tenantCompanyId))
          .orderBy(desc(scheduledPosts.createdAt))
          .limit(3);

        if (recentCampaigns.length > 0) {
          recentContext = recentCampaigns
            .map((c, i) => `${i + 1}. Tema: "${c.theme}" (Headline: "${c.hookHeadline}")`)
            .join(" | ");
        }
      }
    } catch (historyErr) {
      console.warn("Aviso ao resgatar histórico recente de campanhas para contexto:", historyErr);
    }

    // 3. Se a URL do n8n estiver configurada, despacha para a rota de produção do n8n
    if (n8nWebhookUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const n8nPayload = {
          theme,
          recentContext,
          nicheValueProposition: nicheValueProposition || "Inteligência comercial e conversão B2B",
          targetAudience: targetAudience || "Decisores B2B (CEOs, Diretores Comerciais, Heads de Vendas)",
          competitorsReferences: competitorsReferences || "Nenhuma informada",
          format,
          timestamp: new Date().toISOString(),
        };

        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "BlackLink-CRM-Agent/2.0",
          },
          body: JSON.stringify(n8nPayload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (n8nResponse.ok) {
          const n8nData = await n8nResponse.json();

          // Se o n8n já responder no formato esperado, formata e retorna
          if (n8nData.hookHeadline && n8nData.bodyCopy) {
            const formattedResult: GeneratedCreativeResult = {
              id: `cr-${Date.now()}`,
              theme,
              format,
              targetAudience: targetAudience || "Decisores B2B",
              competitorsReferences,
              hookHeadline: n8nData.hookHeadline,
              bodyCopy: n8nData.bodyCopy,
              ctaText: n8nData.ctaText || "Clique no link da bio e solicite um dossiê executivo.",
              hashtags: Array.isArray(n8nData.hashtags)
                ? n8nData.hashtags
                : ["#VendasB2B", "#BlackLink", "#InteligenciaComercial", "#SaaS"],
              postCaption:
                n8nData.postCaption ||
                `${n8nData.bodyCopy}\n\n${n8nData.ctaText || "Clique no link da bio e solicite um dossiê executivo."}\n\n${(Array.isArray(n8nData.hashtags) ? n8nData.hashtags : ["#VendasB2B", "#BlackLink", "#InteligenciaComercial", "#SaaS"]).join(" ")}`.trim(),
              slides: Array.isArray(n8nData.slides) ? n8nData.slides : [],
              imageUrls: Array.isArray(n8nData.imageUrls) ? n8nData.imageUrls : [],
              createdAt: new Date().toISOString(),
              source: "n8n",
            };

            return NextResponse.json(formattedResult);
          }
        } else {
          console.warn("Webhook n8n retornou status diferente de 200:", n8nResponse.status);
        }
      } catch (webhookErr) {
        console.warn("Falha ou timeout no webhook n8n, utilizando gerador nativo do Black Link:", webhookErr);
      }
    }

    // 4. Gerador Nativo Estratégico (Fallback / Standalone de Alta Fidelidade)
    // Produz estrutura completa de carrossel, story ou post único com copywriting executivo B2B
    const cleanTheme = theme.trim();
    const audience = targetAudience?.trim() || "Decisores B2B, Diretores Comerciais e Fundadores";

    let slides: CreativeSlide[] = [];
    let hookHeadline = "";
    let bodyCopy = "";
    let ctaText = "";
    let imageUrls: string[] = [];

    if (format === "carousel") {
      hookHeadline = `Como Dominar ${cleanTheme} sem Perder Eficiência Comercial`;
      bodyCopy = `A maioria das operações comerciais trava por falta de clareza nos gargalos de esteira.\n\nQuando alinhamos inteligência de dados, cadência de tarefas e blindagem de território, o ciclo médio de fechamento cai pela metade.\n\nConfira os 5 passos estratégicos neste carrossel para implementar agora na sua empresa.`;
      ctaText = "Salve este carrossel para consultar na sua próxima reunião de alinhamento comercial.";

      slides = [
        {
          slideNumber: 1,
          headline: `O Diagnóstico Real de ${cleanTheme}`,
          bodyText: "Por que 80% das empresas continuam utilizando métodos obsoletos de prospecção e como virar o jogo.",
          imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
          visualPrompt: "Dark minimal industrial geometric architecture, contrast graphite and titanium",
        },
        {
          slideNumber: 2,
          headline: "Ponto Crítico: Silos & Colisões",
          bodyText: "Sem radar anti-colisão, seus hunters abordam os mesmos decisores, queimando a reputação corporativa.",
          imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
          visualPrompt: "Monochrome brutalist structure with subtle light rays",
        },
        {
          slideNumber: 3,
          headline: "A Regra de Ouro da Cadência",
          bodyText: "Follow-ups espaçados em estilo iPhone: listas diárias, semanais e mensais para garantir presença sem invasão.",
          imageUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
          visualPrompt: "Minimal dark workspace, typography focus, ultra high resolution",
        },
        {
          slideNumber: 4,
          headline: "Passagem de Bastão Blindada",
          bodyText: "A transição entre o pré-vendas (SDR) e o Closer não pode perder telemetria de notas ou dores do cliente.",
          imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
          visualPrompt: "Cybersecurity datacenter, dark matte titanium panels",
        },
        {
          slideNumber: 5,
          headline: "Próxima Ação Executiva",
          bodyText: "Estruture sua máquina de conversão no Black Link CRM e escale suas operações de tráfego pago.",
          imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
          visualPrompt: "Black Link typography layout, pure black background #030303",
        },
      ];

      imageUrls = slides.map((s) => s.imageUrl || "");
    } else if (format === "story") {
      hookHeadline = `A Verdade que Ninguém Conta sobre ${cleanTheme}`;
      bodyCopy = `Se o seu time comercial passa mais tempo preenchendo planilhas do que conversando com decisores, a sua operação está sangrando margem.\n\nArraste para cima para entender como virar a chave hoje.`;
      ctaText = "Responda a este story com 'ESTRATÉGIA' para receber o plano de ação no Direct.";

      slides = [
        {
          slideNumber: 1,
          headline: "Pare de perder contas qualificadas.",
          bodyText: `O mercado corporativo mudou. ${cleanTheme} exige precisão milimétrica.`,
          imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        },
        {
          slideNumber: 2,
          headline: "Cadência Diária em Ação",
          bodyText: "Execute tarefas pontuais com hora marcada direto na esteira de prospecção.",
          imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
        },
        {
          slideNumber: 3,
          headline: "Toque para destravar seu Pipeline",
          bodyText: "Fale diretamente com os especialistas do ecossistema Black Link.",
          imageUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        },
      ];

      imageUrls = slides.map((s) => s.imageUrl || "");
    } else {
      // Post único
      hookHeadline = `${cleanTheme}: O Dossiê Estratégico de Escala B2B`;
      bodyCopy = `Em mercados corporativos altamente competitivos, o que separa os líderes dos retardatários não é o volume de leads brutos, mas a densidade da qualificação.\n\nAo focar em ${cleanTheme}, construímos um funil previsível onde cada reunião agendada possui fit real e orçamento aprovado.\n\nPrincipais pilares:\n1. Mapeamento de decisores em radar único.\n2. Cadência de contatos não-invasiva.\n3. Dossiê lateral com telemetria de notas.\n\nQual é a sua maior trava hoje ao prospectar contas enterprise?`;
      ctaText = "Comente 'ESCALA' para receber o modelo completo de abordagem.";

      slides = [
        {
          slideNumber: 1,
          headline: cleanTheme,
          bodyText: "Dossiê Executivo Black Link B2B",
          imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        },
      ];

      imageUrls = [slides[0].imageUrl || ""];
    }

    const result: GeneratedCreativeResult = {
      id: `cr-${Date.now()}`,
      theme: cleanTheme,
      format,
      targetAudience: audience,
      competitorsReferences,
      hookHeadline,
      bodyCopy,
      ctaText,
      hashtags: [
        `#${cleanTheme.replace(/\s+/g, "")}`,
        "#VendasB2B",
        "#BlackLink",
        "#GestaoComercial",
        "#TrafegoPago",
        "#Growth",
      ],
      postCaption: `${bodyCopy}\n\n${ctaText}\n\n#${cleanTheme.replace(/\s+/g, "")} #VendasB2B #BlackLink #GestaoComercial #Growth`,
      slides,
      imageUrls,
      createdAt: new Date().toISOString(),
      source: n8nWebhookUrl ? "n8n" : "ai_pipeline",
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Erro no gerador de marketing:", err);
    return NextResponse.json(
      { error: "Falha interna ao processar o criativo de marketing." },
      { status: 500 }
    );
  }
}
