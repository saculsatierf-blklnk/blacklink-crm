import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  BLACKLINK_PRODUCTS,
  BLACKLINK_BRAND_PROMPT_CONTEXT,
} from "@/lib/marketing/blacklinkBrandBrain";
import { db } from "@/db";
import { leads } from "@/db/schema";

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
      companyProfile,
      activeChannel = "instagram",
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

    let crmTelemetryContext = "";
    try {
      const realLeads = await db.select().from(leads).limit(25);
      const totalLeads = realLeads.length;
      const inNegotiation = realLeads.filter((l) => l.status === "negotiation").length;
      const newLeads = realLeads.filter((l) => l.status === "new").length;
      const closedLeads = realLeads.filter((l) => l.status === "closed").length;
      const avgScore = totalLeads > 0 ? Math.round(realLeads.reduce((acc, l) => acc + (l.dealScore || 0), 0) / totalLeads) : 50;

      const leadInsights = realLeads.map((l) => {
        const notesText = Array.isArray(l.notes) ? (l.notes as any[]).map((n) => n.text).join(" | ") : "";
        return `- Lead: "${l.leadName}" (Origem: ${l.origin || "Inbound"}, Status: ${l.status}, Deal Score: ${l.dealScore}/100). ${notesText ? `Notas: ${notesText.slice(0, 100)}` : ""}`;
      }).join("\n");

      crmTelemetryContext = `
DADOS VIVOS DA TELEMETRIA DO CRM (BANCO DE DADOS EM TEMPO REAL):
- Volume de Leads Recentes no Pipeline: ${totalLeads}
- Leads Novos Aguardando Qualificação: ${newLeads}
- Negociações Ativas no Pipeline: ${inNegotiation}
- Negócios Fechados: ${closedLeads}
- Média de Deal Score (Qualificação Comercial): ${avgScore}/100
- Amostra Real de Negócios no Pipeline:
${leadInsights || "Pipeline em fase inicial de atração de leads."}
`;
    } catch (err) {
      console.warn("Telemetria do CRM não pôde ser lida no momento:", err);
    }

    let actionDirective = "";
    if (action === "audit_visual_grid" || action === "audit_feed") {
      actionDirective = `AÇÃO EXPRESSA: AUDITORIA VISUAL AVANÇADA DA GRADE 3X3 & DIREÇÃO DE ARTE EXECUTIVA (PADRÃO ARINA TVA / LUXO SUÍÇO).
Você é o Diretor de Arte e Estrategista Visual inspecionando o feed do Instagram formado por 9 posições.
Sua missão é inspecionar friamente:
1. RITMO E HARMONIA DE CORES NA GRADE 3X3:
   - Em design brutalista de alto luxo, a grade de 9 posts DEVE intercalar fundos escuros (Obsidian/Noir) e fundos claros (Porcelain/Ice) em um ritmo geométrico harmônico.
   - Padrão oficial recomendado da Black Link:
     * Post 3 (Canto inferior direito): Fundo Claro Porcelana ('3d-crystal' com Chrome Pins)
     * Post 5 (CENTRO ABSOLUTO DA GRADE): Fundo Claro Porcelana ('3d-cursor' com Cursor Cromado)
     * Post 9 (Canto superior direito): Fundo Claro Gelo ('clean-ice-box' Bounding Box Técnica)
     * Posts 1, 2, 4, 6, 7, 8: Fundos Escuros Profundos (Noir/Obsidian/Retrato Editorial/Fluted Glass)
   - Se a grade tiver blocos desequilibrados, proponha a reordenação das variantes em 'suggestedUpdates'.
2. LEGIBILIDADE E CONTRASTE DE TEXTO:
   - O texto NUNCA pode ter a mesma cor que o fundo ou sumir em sombras/reflexos!
   - Em fundos claros (porcelana), o texto deve ser PRETO PURO (#09090B) protegido por escudo de vidro fosco porcelana.
   - Em fundos escuros (noir), o texto deve ser BRANCO PURO (#FFFFFF) protegido por escudo de vidro fosco obsidian.
   - Forneça em 'suggestedUpdates' o 'contrastMode' ('dark' para texto preto sobre fundo claro, 'light' para texto branco sobre fundo escuro).
3. POSICIONAMENTO DA COPY (copyPosition):
   - Avalie onde o objeto 3D ou modelo principal está para que a copy nunca tampe o elemento visual.
   - Atribua 'copyPosition' para cada post ('top-left', 'top-right', 'bottom-left', 'bottom-right' ou 'center').
4. CONCISÃO DAS HEADLINES:
   - Títulos de no máximo 2 A 4 PALAVRAS em MAIÚSCULAS rigorosas (ex: 'SOBERANIA B2B', 'TELEMETRIA TOTAL', 'BLACK LINK OS'). Sem frases longas nem pontuação!
5. Preencha 'gridAudit' com notas e diagnósticos detalhados para cada uma das 9 posições da grade.`;
    } else if (action === "sync_crm_telemetry") {
      actionDirective = "AÇÃO EXPRESSA: SINCRONIZAÇÃO COM A TELEMETRIA VIVA DO CRM. Conecte as pautas e copys do marketing às dores e negócios reais presentes no pipeline do CRM. Use os dados de leads e deal score para propor um ataque comercial focado em destravar o pipeline com os produtos digitais da Black Link (CRM OS, Automações com IA, Branding Soberano). Mostre que o marketing foi moldado com base no comportamento do funil de vendas.";
    } else if (action === "generate_campaign_from_telemetry") {
      actionDirective = "AÇÃO EXPRESSA: GERAÇÃO DE CAMPANHA COMPLETA BASEADA NA TELEMETRIA DO CRM. Analise minuciosamente os gargalos do pipeline (leads travados, deal scores baixos ou altos, atritos registrados nas notas). Gere no array 'suggestedUpdates' exatamente 9 atualizações coordenadas para TODOS os posts da grade (de 'post-bl-01' a 'post-bl-09'). Cada post deve atacar uma objeção real e direcionar para uma solução digital concreta da Black Link (CRM OS, Automações, Branding, Protocolo). Headlines de 2 a 4 palavras em maiúsculas rigorosas no padrão suíço.";
    } else if (action === "align_crm_os") {
      actionDirective = "AÇÃO EXPRESSA: Realinhe os posts prioritários da grade para venderem o 'Black Link CRM OS' (Software Sob Medida e Telemetria B2B). Foco prático: eliminar planilhas, organizar pipeline e dar telemetria a holdings e empresas B2B.";
    } else if (action === "align_automacoes") {
      actionDirective = "AÇÃO EXPRESSA: Realinhe os posts prioritários da grade para venderem a 'Engenharia de Automações & I.A. Operacional', mostrando que trabalho braçal e mensagens manuais atrasadas custam receita e margem.";
    } else if (action === "sharpen_brutalist") {
      actionDirective = "AÇÃO EXPRESSA: Eleve o padrão das headlines: títulos curtos de 2 a 4 palavras, impactantes, em caixa alta, sem enrolação e sem clichês de marketing genérico.";
    }

    const hasVisualInput = imageParts.length > 0;

    const digitalPresenceContext = `
ATUAÇÃO DIGITAL REAL DA BLACK LINK (OBSERVADA VIA blklnk.com & REDES):
- Website Oficial: ${companyProfile?.website || "https://blklnk.com"}
- Instagram: ${companyProfile?.instagramUrl || "https://instagram.com/blacklink.tech"} (${companyProfile?.instagram || "@blacklink.tech"})
- LinkedIn: ${companyProfile?.linkedinUrl || "https://linkedin.com/company/blacklink-holding"}
- Síntese da Atuação Digital Atual:
${companyProfile?.digitalFootprintNotes || "Holding de tecnologia e inteligência comercial para grandes contas B2B. Posicionamento minimalista brutalista ('Engenharia da Ausência'). Produtos principais: CRM OS proprietário, IA operacional sob medida, Captação de autoridade em megaeventos e feiras de negócios, Protocolo Comercial de Vendas Consultivas (blklnk.com/protocolo). Proibido jargões de marketing digital amador, promessas irreais ou depoimentos falsos."}
- Canal Selecionado no Painel: ${String(activeChannel).toUpperCase()}
`;

    const systemPrompt = `
${BLACKLINK_BRAND_PROMPT_CONTEXT}
${digitalPresenceContext}
${crmTelemetryContext}

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
   - Canais: se estiver gerando para Instagram, priorize impacto estético e headlines de 2 a 4 palavras; se estiver gerando para LinkedIn, priorize teses de negócios B2B e distribuição de carrosséis PDF.
5. REGRA DE OURO VISUAL — PROIBIDO BALÕES QUADRADOS OU CAIXAS SOBRE A ARTE:
   - A identidade visual da Black Link usa TIPOGRAFIA PURA MONUMENTAL flutuando diretamente sobre a arte, com drop-shadow limpo.
   - NUNCA use caixas retangulares, molduras, bordas com handles (alças) ou balões cobrindo os modelos ou o centro da imagem. O usuário DETESTA esses balões.
   - Se o usuário falar "balão", "caixa", "quadrado", "feio", "tira o balão", "remover caixa", "limpar":
     * Confirme imediatamente que o balão foi eliminado e a arte agora tem tipografia pura e desobstruída.
     * Envie em 'suggestedUpdates' com "hasScrimBackdrop": false, e posicione a copy em 'bottom-left' ou 'top-left' para deixar o centro da imagem respirar livremente.

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
  "gridAudit": {
    "visualScore": <número de 0 a 100 indicando harmonia visual da grade 3x3>,
    "colorRhythmDiagnosis": "<avaliação da alternância de tons claros e escuros na grade>",
    "contrastDiagnosis": "<avaliação do contraste e legibilidade de texto sobre imagem>",
    "postDiagnostics": [
      {
        "postId": "<ID do post, ex: 'post-bl-01'>",
        "position": <número de 1 a 9>,
        "variant": "<variante gráfica>",
        "tone": "<'Claro (Porcelana)' ou 'Escuro (Noir)'>",
        "contrastStatus": "<'Perfeito' ou 'Corrigido com Scrim'>",
        "copyPosition": "<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>",
        "status": "<'Harmonizado' ou 'Ajustado'>"
      }
    ]
  },
  "suggestedUpdates": [
    {
      "postId": "<ID exato do post, ex: 'post-bl-01'>",
      "headline": "<nova headline monumental de NO MÁXIMO 2 A 4 PALAVRAS em MAIÚSCULAS, padrão suíço limpo Arina TVA (ex: 'SOBERANIA B2B', 'TELEMETRIA TOTAL', 'BLACK LINK OS'). NUNCA crie frases longas ou orações inteiras com ponto final!>",
      "bodyText": "<apoio ultra-curto de 1 frase concisa de até 8 a 10 palavras>",
      "tag": "<tag suíça, ex: '01 // TELEMETRIA'>",
      "caption": "<legenda completa para o Instagram com quebras de linha e CTA>",
      "linkedinPostText": "<artigo executivo thought leadership estruturado para LinkedIn B2B (tese clara, desafio de negócio, sem jargões de afiliado, tom executivo de C-level, menção a blklnk.com)>",
      "blackLinkVariant": "<variante harmonizada: '3d-keycap' | '3d-crystal' | 'pure-monumental' | '3d-cursor' | '3d-liquid' | '3d-sculpture' | 'clean-ice'>",
      "contrastMode": "<'auto' | 'light' | 'dark'>",
      "copyPosition": "<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>",
      "hasScrimBackdrop": false,
      "rationale": "<1 frase explicando a melhoria visual e estratégica>"
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
