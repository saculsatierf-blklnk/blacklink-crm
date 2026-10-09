import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  BLACKLINK_PRODUCTS,
  BLACKLINK_BRAND_PROMPT_CONTEXT,
} from "@/lib/marketing/blacklinkBrandBrain";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function resolveImagePart(imageUrl?: string): { mimeType: string; data: string } | null {
  if (!imageUrl) return null;

  try {
    // Caso 1: Imagem em base64 (data:image/jpeg;base64,...)
    if (imageUrl.startsWith("data:")) {
      const matches = imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches[1] && matches[2]) {
        return {
          mimeType: matches[1],
          data: matches[2],
        };
      }
    }

    // Caso 2: Caminho local público (/brand/...)
    if (imageUrl.startsWith("/brand/") || imageUrl.startsWith("/images/")) {
      const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
      const fullPath = path.join(process.cwd(), "public", cleanPath);
      if (fs.existsSync(fullPath)) {
        const fileBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
        return {
          mimeType,
          data: fileBuffer.toString("base64"),
        };
      }
    }
  } catch (err) {
    console.warn("Não foi possível carregar imagem para visão computacional do Gemini:", err);
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userMessage = "",
      history = [],
      posts = [],
      focusedPostId,
      attachedImage,
      action = "chat",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    // 1. Localiza o post em foco para prover visão visual específica
    const focusedPost = (posts || []).find((p: any) => p.id === focusedPostId) || posts?.[0];
    const focusedSlide = focusedPost?.slides?.[0];
    const focusedImageUrl = focusedSlide?.imageUrl;

    // 2. Prepara partes visuais para o Gemini
    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];

    // Se o usuário anexou uma imagem no chat, ela tem prioridade
    const attachedPart = resolveImagePart(attachedImage);
    if (attachedPart) {
      imageParts.push({ inlineData: attachedPart });
    }

    // Se o post em foco tem imagem, adiciona para visão da IA
    if (!attachedPart && focusedImageUrl) {
      const postImagePart = resolveImagePart(focusedImageUrl);
      if (postImagePart) {
        imageParts.push({ inlineData: postImagePart });
      }
    }

    const productsCatalogText = BLACKLINK_PRODUCTS.map(
      (p) => `- ID "${p.id}": ${p.name} (${p.shortDesc}). Dor: ${p.painResolved}. CTA: ${p.directCta}`
    ).join("\n");

    const postsSummary = (posts || []).map((p: any, idx: number) => {
      const slide = p.slides?.[0] || {};
      const isFocused = p.id === focusedPostId ? " [POST SELECIONADO PELO USUÁRIO]" : "";
      return `[POST #${idx + 1} | ID: ${p.id}${isFocused}]
- Tema: ${p.theme || "Sem tema"}
- Headline da Imagem: "${slide.headline || p.hookHeadline || "Vazia"}"
- Tese de Apoio: "${slide.bodyText || "Vazia"}"
- Tag: "${slide.tag || "01 // CONCEITO"}"
- Estilo Gráfico: "${slide.blackLinkVariant || "3d-sculpture"}"
- Imagem: ${slide.imageUrl ? (slide.imageUrl.startsWith("data:") ? "Imagem Gerada com IA (base64)" : slide.imageUrl) : "Sem imagem (arte padrão)"}
- Legenda Instagram: "${(p.postCaption || p.bodyCopy || "").slice(0, 140)}..."`;
    }).join("\n\n");

    const conversationHistoryText = (history || [])
      .slice(-6)
      .map((m: any) => `${m.role === "user" ? "USUÁRIO" : "DIRETOR IA"}: ${m.content}`)
      .join("\n");

    let actionDirective = "";
    if (action === "align_crm_os") {
      actionDirective = "AÇÃO EXPRESSA: Realinhe os posts prioritários da grade para venderem o 'Black Link CRM OS' (Software Sob Medida e Telemetria B2B). Foco prático: eliminar planilhas, organizar pipeline e dar telemetria a holdings e empresas B2B.";
    } else if (action === "align_automacoes") {
      actionDirective = "AÇÃO EXPRESSA: Realinhe os posts prioritários da grade para venderem a 'Engenharia de Automações & I.A. Operacional', mostrando que trabalho braçal e mensagens manuais atrasadas custam receita e margem.";
    } else if (action === "audit_feed") {
      actionDirective = "AÇÃO EXPRESSA: Faça uma auditoria prática da grade de 9 posts. Diga a nota geral de coerência comercial com o site blklnk.com, aponte onde a copy está fraca e sugira melhorias imediatas.";
    } else if (action === "sharpen_brutalist") {
      actionDirective = "AÇÃO EXPRESSA: Eleve o padrão das headlines: títulos curtos, impactantes, em caixa alta, sem enrolação e sem clichês de marketing genérico.";
    }

    const hasVisualInput = imageParts.length > 0;

    const systemPrompt = `
${BLACKLINK_BRAND_PROMPT_CONTEXT}

SUA MISSÃO & CONDUTA:
Você é o Assistente Executivo e Estrategista de Marketing da Black Link (blklnk.com).
O usuário é o fundador ou operador da Black Link e está comandando o marketing da Black Link.

INSTRUÇÕES DE CLAREZA E COMPORTAMENTO (IMPORTANTE):
1. SEJA PRAGMÁTICO, DIRETO E PRECISO. Fale como um diretor de criação e estrategista de negócios real. NUNCA use termos pedantes, bizarros ou pomposos como "entropia operacional", "valuation de oito dígitos" ou "renúncia de soberania". Fale sobre resolver dores de empresas reais, gerar leads e fechar contratos de alto valor.
2. OBEDEÇA ESTRITAMENTE O QUE O USUÁRIO PEDE. Se ele pedir para mudar o título do post 1 para "X", mude para "X". Se pedir para mudar a imagem, indique a ação de imagem. Não desvie nem invente coisas que ele não pediu.
3. VISÃO COMPUTACIONAL ATIVA: ${hasVisualInput ? "Você ESTÁ RECEBENDO E ENXERGANDO A IMAGEM DO POST SELECIONADO / IMAGEM ANEXADA. Se o usuário perguntar sobre o visual, se a imagem está preta, o que tem nela ou como melhorá-la, descreva exatamente o que você vê nela." : "Nenhuma imagem foi anexada para este turno."}
4. REGRAS DA MARCA:
   - Zero posts sobre "cases" de clientes ou depoimentos.
   - Se houver pessoas em artes ou prompts, apenas pessoas negras retintas.
   - Foco nos produtos reais da Black Link (CRM OS, Automações com IA, Branding, Protocolo e Megaeventos).

CATÁLOGO DE PRODUTOS DA BLACK LINK:
${productsCatalogText}

POST ATUALMENTE SELECIONADO:
ID: "${focusedPost?.id || "Nenhum"}" | Tema: "${focusedPost?.theme || "Nenhum"}"

GRADE ATUAL DE POSTS NO FEED:
${postsSummary || "Nenhum post carregado."}

${actionDirective ? `\nCOMANDO DE AÇÃO PRIORITÁRIA:\n${actionDirective}\n` : ""}

HISTÓRICO DA CONVERSA RECENTE:
${conversationHistoryText || "Início de conversa."}

MENSAGEM / INSTRUÇÃO DO USUÁRIO:
"${userMessage || "Analise a grade e proponha alinhamento comercial."}"

RESPONDA ESTRITAMENTE EM JSON VÁLIDO (sem markdown ou texto fora das chaves) com este formato exato:
{
  "reply": "<sua resposta conversacional direta, amigável, cirúrgica e objetiva em markdown (sem jargões prolixos)>",
  "alignmentScore": <número de 0 a 100 indicando a aderência ao site blklnk.com>,
  "highlightedProduct": "<id do produto foco se houver>",
  "suggestedUpdates": [
    {
      "postId": "<ID exato do post, ex: 'post-bl-01'>",
      "headline": "<nova headline monumental em MAIÚSCULAS>",
      "bodyText": "<nova tese de apoio direta>",
      "tag": "<tag suíça, ex: '01 // TELEMETRIA'>",
      "caption": "<legenda completa para o Instagram com quebras de linha e CTA>",
      "blackLinkVariant": "<variante estética opcional se aplicável>",
      "rationale": "<1 frase explicando a melhoria>"
    }
  ],
  "imageAction": {
    "shouldGenerate": <true se o usuário pediu para mudar/gerar/regerar a imagem deste post, senão false>,
    "postId": "<ID do post, ex: '${focusedPost?.id || "post-bl-01"}'>",
    "variant": "<variante gráfica sugerida: '3d-cursor' | 'clean-ice' | 'clean-ice-box' | '3d-crystal' | 'pure-monumental' | '3d-liquid' | '3d-sculpture' | '3d-keycap' | 'swiss-box'>",
    "prompt": "<prompt descritivo para o gerador de imagem, respeitando a regra de modelos negros retintos se houver pessoas>",
    "explanation": "<explicação curta para o usuário>"
  }
}

Se a mensagem do usuário não exigir alteração de texto, retorne "suggestedUpdates": []. Se não exigir geração de imagem, retorne "imageAction": { "shouldGenerate": false }.
`;

    // Monta os parts da requisição do Gemini (texto + imagens se houver)
    const contentParts: Array<any> = [{ text: systemPrompt }];
    for (const imgPart of imageParts) {
      contentParts.push(imgPart);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: contentParts }],
        generationConfig: {
          temperature: 0.35, // Temperatura baixa para alta fidelidade e zero alucinação
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
