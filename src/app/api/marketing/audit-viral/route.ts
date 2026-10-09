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
    const { headline = "", bodyText = "", tag = "", caption = "", productId } = body;

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no servidor." },
        { status: 500 }
      );
    }

    const selectedProduct =
      BLACKLINK_PRODUCTS.find((p) => p.id === productId) || BLACKLINK_PRODUCTS[0];

    const productsCatalogText = BLACKLINK_PRODUCTS.map(
      (p) => `- ID "${p.id}": ${p.name} (${p.shortDesc}). Dor: ${p.painResolved}. CTA: ${p.directCta}`
    ).join("\n");

    const systemPrompt = `
${BLACKLINK_BRAND_PROMPT_CONTEXT}

SUA MISSÃO:
Você é o Diretor Executivo de Growth, Copywriting e Estratégia da Black Link.
Você deve AUDITAR e ELEVAR um criativo/post para que ele atinja dois objetivos simultâneos:
1. ALTA VIRALIDADE: Fazer o lead parar no feed, quebrar o padrão mental e gerar retenção/compartilhamento imediato entre fundadores e decisores.
2. ALTA CONVERSÃO: Não ser apenas "frase bonita vazia". Conduzir o leitor com lucidez brutal a desejar as soluções e produtos digitais da Black Link, especificamente: "${selectedProduct.name}".
3. REGRA ABSOLUTA: NUNCA crie posts ou menções sobre "cases" de terceiros ou depoimentos genéricos. O tom é de manifesto de autoridade soberana e engenharia de infraestrutura.

CATÁLOGO DE PRODUTOS DA BLACK LINK:
${productsCatalogText}

POST ATUAL A SER AUDITADO:
- Headline (Título da Imagem): "${headline || "Não preenchido"}"
- Tese / Apoio (Subtítulo): "${bodyText || "Não preenchido"}"
- Tag Suíça: "${tag || "Não preenchido"}"
- Legenda Atual: "${caption || "Não preenchida"}"
- Produto Foco para Conversão: "${selectedProduct.name}"

RESPONDA ESTRITAMENTE EM JSON VÁLIDO (sem markdown ou texto extra fora das chaves) com esta estrutura exata:
{
  "viralScore": <número inteiro de 0 a 100>,
  "conversionScore": <número inteiro de 0 a 100>,
  "critique": "<análise cirúrgica e sem rodeios de 2 a 3 frases: o que está fraco, o que está forte e por que precisa de mais tração>",
  "optimizedHeadline": "<título monumental de NO MÁXIMO 2 A 4 PALAVRAS em MAIÚSCULAS, padrão suíço limpo Arina TVA (ex: 'SOBERANIA B2B', 'TELEMETRIA TOTAL', 'ENGENHARIA DA AUSÊNCIA'). NUNCA frases longas ou orações inteiras com ponto final!>",
  "optimizedBodyText": "<apoio ultra-curto de 1 frase concisa de até 8 a 10 palavras conectada ao problema>",
  "optimizedTag": "<tag no formato '0X // CONCEITO', ex: '01 // SOBERANIA' ou '03 // INFRAESTRUTURA'>",
  "optimizedCaption": "<legenda completa e magnética para o Instagram com quebras de linha elegantes, sem clichês, apresentando a tese, aprofundando a dor, apresentando a solução da Black Link e finalizando com um CTA imperativo e elegante para o link da bio ou Direct>",
  "targetProductName": "${selectedProduct.name}"
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

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
      console.error("[Gemini Audit Error]:", errText);
      return NextResponse.json(
        { error: `Erro na API do Gemini: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: "Resposta vazia do modelo de IA." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawText);

    return NextResponse.json({
      success: true,
      ...parsed,
    });
  } catch (err: unknown) {
    console.error("Erro ao auditar viralidade com Gemini:", err);
    return NextResponse.json(
      { error: "Falha interna ao analisar viralidade e conversão." },
      { status: 500 }
    );
  }
}
