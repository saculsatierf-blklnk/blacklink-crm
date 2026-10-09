import { NextRequest, NextResponse } from "next/server";
import {
  BLACKLINK_PRODUCTS,
  BLACKLINK_BRAND_PROMPT_CONTEXT,
} from "@/lib/marketing/blacklinkBrandBrain";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userMessage = "",
      history = [],
      posts = [],
      companyProfile,
      action = "chat",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    const productsCatalogText = BLACKLINK_PRODUCTS.map(
      (p) => `- ID "${p.id}": ${p.name} (${p.shortDesc}). Dor: ${p.painResolved}. CTA: ${p.directCta}`
    ).join("\n");

    const postsSummary = (posts || []).map((p: any, idx: number) => {
      const slide = p.slides?.[0] || {};
      return `[POST #${idx + 1} | ID: ${p.id}]
- Tema: ${p.theme || "Sem tema"}
- Headline da Imagem: "${slide.headline || p.hookHeadline || "Vazia"}"
- Tese de Apoio: "${slide.bodyText || "Vazia"}"
- Tag: "${slide.tag || "01 // CONCEITO"}"
- Estilo Gráfico: "${slide.blackLinkVariant || "3d-sculpture"}"
- Legenda Instagram: "${(p.postCaption || p.bodyCopy || "").slice(0, 140)}..."`;
    }).join("\n\n");

    const conversationHistoryText = (history || [])
      .slice(-6)
      .map((m: any) => `${m.role === "user" ? "USUÁRIO" : "DIRETOR IA"}: ${m.content}`)
      .join("\n");

    let actionDirective = "";
    if (action === "align_crm_os") {
      actionDirective = "AÇÃO EXPRESSA: Realinhe os posts prioritários da grade para venderem massivamente o 'Black Link CRM OS' (Software Sob Medida e Telemetria B2B), expondo o prejuízo do controle via planilhas e a soberania de ter um software proprietário.";
    } else if (action === "align_automacoes") {
      actionDirective = "AÇÃO EXPRESSA: Realinhe os posts prioritários da grade para venderem a 'Engenharia de Automações & I.A. Operacional', expondo que trabalho manual de digitação e resposta de leads é obsolescência e perda de margem.";
    } else if (action === "audit_feed") {
      actionDirective = "AÇÃO EXPRESSA: Faça uma auditoria cirúrgica da grade completa de 9 posts. Diga a nota geral de aderência ao posicionamento da Black Link (blklnk.com), aponte onde há fraquezas ou tédio, e forneça melhorias diretas.";
    } else if (action === "sharpen_brutalist") {
      actionDirective = "AÇÃO EXPRESSA: Eleve o tom de todas as headlines e teses para o padrão Brutalista Suíço de Alto Luxo (curto, cortante, autoridade incontestável, zero frases genéricas de coach).";
    }

    const systemPrompt = `
${BLACKLINK_BRAND_PROMPT_CONTEXT}

SUA IDENTIDADE & MISSÃO:
Você é o DIRETOR EXECUTIVO DE GROWTH & ESTRATÉGIA SOBERANA DA BLACK LINK (Arina).
O usuário está conversando e solicitando alterações diretamente para a BLACK LINK (o ecossistema de blklnk.com e do Black Link CRM).

DIRETRIZES FUNDAMENTAIS:
1. FOCO TOTAL NA BLACK LINK: Você conhece intimamente o site https://blklnk.com, o conceito da "Engenharia da Ausência" e os produtos digitais proprietários da holding.
2. NUNCA mencione nem crie posts sobre "cases" de terceiros ou depoimentos de clientes. O posicionamento é de manifesto de autoridade técnica proprietária.
3. Se sugerir pessoas em criativos, a regra é estrita: apenas modelos negros retintos, estética de alta costura e cinema.
4. Se o usuário pedir para mudar, adaptar, realinhar ou auditar a grade, você deve responder com estratégia de alto nível E FORNECER O OBJETO "suggestedUpdates" com as alterações exatas para os posts correspondentes.

CATÁLOGO DE PRODUTOS DA BLACK LINK:
${productsCatalogText}

GRADE ATUAL DE POSTS NO FEED (9 POSTS):
${postsSummary || "Nenhum post carregado no momento."}

${actionDirective ? `\nCOMANDO DE AÇÃO PRIORITÁRIA:\n${actionDirective}\n` : ""}

HISTÓRICO DA CONVERSA RECENTE:
${conversationHistoryText || "Início de conversa."}

MENSAGEM / INSTRUÇÃO DO USUÁRIO:
"${userMessage || "Avalie a grade e proponha alinhamento estratégico."}"

RESPONDA ESTRITAMENTE EM JSON VÁLIDO (sem markdown fora das chaves) com o formato exato:
{
  "reply": "<sua resposta conversacional direta, elegante, cirúrgica e inspiradora como Diretor de Marketing da Black Link (em markdown formatado, parágrafos curtos, sem enrolação)>",
  "alignmentScore": <número de 0 a 100 indicando a aderência atual da grade ao padrão blklnk.com>,
  "highlightedProduct": "<id do produto foco, ex: 'crm-os', 'automacoes-ia', 'marketing-branding', 'protocolo-simulador' ou 'megaeventos'>",
  "suggestedUpdates": [
    {
      "postId": "<ID exato do post, ex: 'post-bl-01'>",
      "headline": "<nova headline monumental em MAIÚSCULAS>",
      "bodyText": "<nova tese de apoio cirúrgica>",
      "tag": "<tag suíça, ex: '01 // TELEMETRIA'>",
      "caption": "<legenda completa e magnética para o Instagram com CTA imperativo>",
      "blackLinkVariant": "<variante estética opcional: '3d-sculpture' | '3d-liquid' | 'clean-ice' | 'clean-ice-box' | '3d-crystal' | '3d-keycap' | 'pure-monumental' | '3d-cursor'>",
      "rationale": "<1 frase explicando por que essa alteração converte mais>"
    }
  ]
}

Se a mensagem do usuário for apenas uma dúvida conceitual e não exigir alteração nos posts, retorne "suggestedUpdates": []. Se exigir alteração, forneça os posts com os dados refinados prontos para aplicação.
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("[Gemini Marketing Agent Error]:", errText);
      return NextResponse.json(
        { error: `Erro na API do Gemini: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: "Resposta vazia do agente de IA." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawText);

    return NextResponse.json({
      success: true,
      ...parsed,
    });
  } catch (err: unknown) {
    console.error("Erro no Agente de Marketing da Black Link:", err);
    return NextResponse.json(
      { error: "Falha interna ao processar comando com o Agente de Marketing." },
      { status: 500 }
    );
  }
}
