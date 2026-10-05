import { NextRequest, NextResponse } from "next/server";
import type {
  CompetitorItem,
  ViralMethodAngle,
  EditorialPlanItem,
  ScheduledPost,
  CreativeSlide,
} from "@/store/useMarketingStore";

export const dynamic = "force-dynamic";

interface DiagnosticRequestBody {
  name?: string;
  instagram?: string;
  website?: string;
  niche?: string;
  products?: string;
  targetAudience?: string;
  profileType?: "company" | "influencer";
}

interface ParsedGeminiDiagnostic {
  name?: string;
  instagram?: string;
  website?: string;
  niche?: string;
  products?: string;
  bio?: string;
  tagline?: string;
  executiveSummary?: string;
  competitors?: CompetitorItem[];
  viralMethods?: ViralMethodAngle[];
  editorialPlan?: EditorialPlanItem[];
}

/**
 * Normaliza e busca o conteúdo do site oficial da empresa em tempo real
 */
async function scrapeWebsiteText(url: string): Promise<{
  title?: string;
  description?: string;
  bodyText: string;
  normalizedUrl: string;
}> {
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { bodyText: "", normalizedUrl };
    }

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : undefined;

    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4500);

    return { title, description, bodyText: cleanText, normalizedUrl };
  } catch (err) {
    console.warn("Aviso ao extrair texto do site:", err);
    return { bodyText: "", normalizedUrl };
  }
}

/**
 * Consulta a API do Google Gemini com inteligência adaptada tanto para Empresas (com ou sem site) quanto para Influencers/Creators no Instagram
 */
async function callGeminiDiagnostic(
  apiKey: string,
  body: DiagnosticRequestBody,
  scraped: { title?: string; description?: string; bodyText: string; normalizedUrl: string }
): Promise<ParsedGeminiDiagnostic | null> {
  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-flash-lite-latest",
    "gemini-3.8-flash",
  ];

  const hasWebsiteContent = Boolean(scraped.bodyText && scraped.bodyText.length > 50);
  const rawInstagram = body.instagram?.trim() || "";
  const hasInstagram = Boolean(rawInstagram && rawInstagram !== "@");
  let providedName = body.name?.trim() || "";

  // Se o site foi lido e o nome do formulário não bate com o site
  if (scraped.title && providedName) {
    const lowerTitle = scraped.title.toLowerCase();
    const lowerName = providedName.toLowerCase();
    if (!lowerTitle.includes(lowerName) && !lowerName.includes(lowerTitle)) {
      providedName = "";
    }
  }

  // Detecta se é perfil de Creator / Influencer ou Empresa
  const isInfluencer =
    body.profileType === "influencer" ||
    (!body.website?.trim() && hasInstagram) ||
    (body.niche && /influencer|creator|humor|criador|lifestyle|artista/i.test(body.niche));

  let prompt = "";

  if (isInfluencer) {
    // PROMPT DEDICADO PARA INFLUENCER / CREATOR / MARCA PESSOAL
    prompt = `Você é o Estrategista-Chefe de Crescimento de Influencers, Creators e Marcas Pessoais no Instagram da Black Link.
Sua missão é realizar uma análise aprofundada para o seguinte Criador de Conteúdo / Influenciador no Instagram:

DADOS INFORMADOS:
- @Instagram do Criador: "${rawInstagram || "@creator"}"
- Nome Informado: "${providedName || "NÃO INFORMADO (Identifique pela persona/handle)"}"
- Nicho Informado: "${body.niche?.trim() || "NÃO INFORMADO (Identifique pela persona/conteúdo)"}"
- Fontes de Receita / Produtos: "${body.products?.trim() || "NÃO INFORMADO (Identifique parcerias, publis, YouTube, shows, etc.)"}"
- Público-Alvo: "${body.targetAudience?.trim() || "Audiência engajada do nicho de conteúdo"}"

DIRETRIZES CRÍTICAS PARA CREATORS & INFLUENCERS:
1. PERFIL SEM SITE OBRIGATÓRIO:
   - Este perfil é de um INFLUENCER / CRIADOR DE CONTEÚDO (ex: Diogo Defante, criador de humor, entretenimento, fitness, moda, lifestyle, games, etc.).
   - NÃO tente tratar como uma empresa B2B tradicional de software a menos que o perfil seja especificamente de um criador do setor B2B.
2. IDENTIDADE & PERSONA:
   - Identifique quem é essa figura pública ou perfil de criador no Instagram, qual é seu estilo autoral de comunicação, tom de voz e o que faz a audiência segui-lo.
3. CONCORRENTES / PARES NO INSTAGRAM (3 NÍVEIS):
   - Nível 1 (leader): Maior criador de conteúdo ou referência nacional/global do nicho desse influenciador.
   - Nível 2 (direct): Criador rival ou par direto que disputa a mesma atenção no feed/Reels.
   - Nível 3 (indirect): Outros formatos de mídia/entretenimento que competem pela atenção do público.
   Para cada concorrente/par, indique força, clichê/vulnerabilidade e o diferencial autoral do criador analisado.
4. MÉTODOS VIRALIZÁVEIS PARA O INSTAGRAM:
   - Crie 3 padrões de ganchos de retenção (primeiros 3 segundos de parada de rolagem), mecânica de compartilhamento em Stories/Directs e gatilho de viralização no Instagram.
5. CRONOGRAMA EDITORIAL DE ENGAGAMENTO:
   - Crie 4 pautas de carrosséis/posts prontas para publicação (Top of Funnel: viralização/humor/bastidores, Middle: identificação/relatabilidade, Bottom: publipost/monetização/comunidade).
6. BIO MAGNÉTICA:
   - Formate uma bio magnética, autoral e com forte personalidade para o perfil do Instagram com emojis e links.

Responda ESTRITAMENTE em formato JSON puro:
{
  "name": "Nome Real do Influencer / Criador",
  "instagram": "${rawInstagram || "@creator"}",
  "website": "${body.website?.trim() || ""}",
  "niche": "Nicho do Criador (ex: Humor Caótico, Entretenimento & Jornalismo Nonsense)",
  "products": "Publis de marcas, parcerias, canal no YouTube, eventos e merchandising",
  "bio": "Bio magnética e divertida do perfil com emojis e CTA",
  "tagline": "Slogan ou frase de efeito marcante da persona",
  "executiveSummary": "Dossiê completo de posicionamento do influencer no Instagram",
  "competitors": [
    {
      "id": "comp-1",
      "name": "Nome do Creator Rival/Par",
      "handle": "@handle_concorrente",
      "level": "leader",
      "strength": "Ponto forte do criador",
      "vulnerabilityOrCliché": "Clichê ou fraqueza do conteúdo dele",
      "differentiator": "O que torna o perfil analisado único"
    },
    {
      "id": "comp-2",
      "name": "Nome do Creator Rival 2",
      "handle": "@handle_direto",
      "level": "direct",
      "strength": "Ponto forte",
      "vulnerabilityOrCliché": "Vulnerabilidade",
      "differentiator": "Diferencial autoral"
    },
    {
      "id": "comp-3",
      "name": "Nome do Creator Rival 3",
      "handle": "@handle_indireto",
      "level": "indirect",
      "strength": "Ponto forte",
      "vulnerabilityOrCliché": "Vulnerabilidade",
      "differentiator": "Diferencial autoral"
    }
  ],
  "viralMethods": [
    {
      "id": "vm-1",
      "hookPattern": "Gancho dos primeiros 3 segundos",
      "viralMechanism": "Gatilho de curiosidade e choque",
      "whyItWorks": "Por que o público compartilha em massa",
      "suggestedFormat": "carousel"
    },
    {
      "id": "vm-2",
      "hookPattern": "Gancho 2",
      "viralMechanism": "Mecanismo 2",
      "whyItWorks": "Explicação 2",
      "suggestedFormat": "carousel"
    },
    {
      "id": "vm-3",
      "hookPattern": "Gancho 3",
      "viralMechanism": "Mecanismo 3",
      "whyItWorks": "Explicação 3",
      "suggestedFormat": "carousel"
    }
  ],
  "editorialPlan": [
    {
      "id": "plan-1",
      "dayNumber": 1,
      "dayLabel": "Segunda • 06/Out",
      "theme": "Tema da Pauta 1",
      "hookHeadline": "Headline de Parada de Rolagem",
      "format": "carousel",
      "funnelStage": "topo",
      "objective": "Viralização e atração de novos seguidores",
      "viralAngle": "Storytelling de bastidores",
      "ctaText": "CTA para comentários ou direct",
      "status": "planejado"
    },
    {
      "id": "plan-2",
      "dayNumber": 2,
      "dayLabel": "Quarta • 08/Out",
      "theme": "Tema da Pauta 2",
      "hookHeadline": "Headline 2",
      "format": "carousel",
      "funnelStage": "meio",
      "objective": "Engajamento da comunidade",
      "viralAngle": "Humor e identificação",
      "ctaText": "CTA 2",
      "status": "planejado"
    },
    {
      "id": "plan-3",
      "dayNumber": 3,
      "dayLabel": "Sexta • 10/Out",
      "theme": "Tema da Pauta 3",
      "hookHeadline": "Headline 3",
      "format": "carousel",
      "funnelStage": "meio",
      "objective": "Retenção e salvamentos",
      "viralAngle": "Conteúdo autoral de alta afinidade",
      "ctaText": "CTA 3",
      "status": "planejado"
    },
    {
      "id": "plan-4",
      "dayNumber": 4,
      "dayLabel": "Domingo • 12/Out",
      "theme": "Tema da Pauta 4",
      "hookHeadline": "Headline 4",
      "format": "carousel",
      "funnelStage": "fundo",
      "objective": "Monetização / Ativação de parceiros",
      "viralAngle": "Publipost orgânico e nativo",
      "ctaText": "CTA 4",
      "status": "planejado"
    }
  ]
}`;
  } else {
    // PROMPT PARA EMPRESA / B2B / INDÚSTRIA (COM SITE OU DADOS CORPORATIVOS)
    const websiteSummary = hasWebsiteContent
      ? `DADOS EXTRAÍDOS DO SITE OFICIAL EM TEMPO REAL:
- URL Oficial: "${scraped.normalizedUrl}"
- Título da Página: "${scraped.title || "N/A"}"
- Meta Descrição: "${scraped.description || "N/A"}"
- Conteúdo Textual Resumido do Site:
"""
${scraped.bodyText}
"""`
      : `URL Informada: "${body.website || "N/A"}" (Sem conteúdo textual extraído diretamente)`;

    prompt = `Você é o Estrategista-Chefe de Inteligência Competitiva, Análise de Mercado e Growth da Black Link.
Sua missão é realizar um diagnóstico corporativo PROFUNDO, hiper-personalizado e fundamentado no negócio real da empresa abaixo:

${websiteSummary}

INFORMAÇÕES ADICIONAIS FORNECIDAS PELO OPERADOR:
- Nome da Empresa Informado: "${providedName || "NÃO INFORMADO (Extraia do site)"}"
- @Instagram Informado: "${hasInstagram ? rawInstagram : "NÃO INFORMADO / NÃO POSSUI (Instagram é Opcional)"}"
- Nicho / Setor Informado: "${body.niche?.trim() || "NÃO INFORMADO (Extraia do site)"}"
- Produtos & Soluções Informados: "${body.products?.trim() || "NÃO INFORMADO (Extraia do site)"}"
- Público-Alvo Informado: "${body.targetAudience?.trim() || "NÃO INFORMADO (Deduza com base no mercado da empresa)"}"

DIRETRIZES FUNDAMENTAIS:
1. EXTRAÇÃO CIRÚRGICA DA IDENTIDADE:
   - Se o usuário forneceu apenas o site (ou se o nome e Instagram não foram preenchidos), extraia com total fidelidade o NOME REAL DA EMPRESA, o NICHO e os PRODUTOS/SOLUÇÕES a partir do site analisado.
   - Adapte 100% da análise para o segmento real da empresa (indústria, engenharia metálica, saúde, varejo, tecnologia, etc.).
2. O INSTAGRAM É 100% OPCIONAL:
   - Se o Instagram não foi informado ou a empresa não possui, crie e sugira um @handle limpo e profissional (ex: @nome_da_empresa) para planejar a presença digital da marca.
3. CONCORRENTES REAIS NO MERCADO ESPECÍFICO (3 NÍVEIS):
   - Nível 1 (leader): Líder global ou grande player nacional consolidado do setor dessa empresa.
   - Nível 2 (direct): Concorrente direto no Brasil ou no mesmo nicho de mercado.
   - Nível 3 (indirect): Alternativas indiretas, concorrentes substitutos ou processos manuais/tradicionais.
4. MÉTODOS VIRALIZÁVEIS E CRONOGRAMA:
   - 3 métodos com ganchos virais específicos para os produtos/serviços reais da empresa.
   - 4 pautas de carrossel de alto impacto para o cronograma editorial (Topo, Meio, Fundo de funil).

Responda ESTRITAMENTE em formato JSON puro:
{
  "name": "Nome Real da Empresa Extraído do Site ou Fornecido",
  "instagram": "@handle_real_ou_sugerido",
  "website": "${scraped.normalizedUrl || body.website || ""}",
  "niche": "Nicho detalhado e refinado da empresa",
  "products": "Produtos, serviços e soluções centrais identificados",
  "bio": "Bio profissional de alto impacto pronta para o Instagram com emojis e CTA",
  "tagline": "Slogan ou frase de impacto da empresa",
  "executiveSummary": "Dossiê executivo e contra-posicionamento da marca contra clichês e competidores",
  "competitors": [
    {
      "id": "comp-1",
      "name": "Nome do Concorrente Líder",
      "handle": "@handle_concorrente",
      "level": "leader",
      "strength": "Ponto forte do concorrente",
      "vulnerabilityOrCliché": "Clichê ou ponto fraco visível",
      "differentiator": "Diferencial concreto e contra-posicionamento da empresa"
    },
    {
      "id": "comp-2",
      "name": "Nome do Concorrente Direto",
      "handle": "@handle_direto",
      "level": "direct",
      "strength": "Ponto forte",
      "vulnerabilityOrCliché": "Vulnerabilidade ou clichê",
      "differentiator": "Diferencial de posicionamento"
    },
    {
      "id": "comp-3",
      "name": "Nome do Concorrente Indireto",
      "handle": "@handle_indireto",
      "level": "indirect",
      "strength": "Ponto forte",
      "vulnerabilityOrCliché": "Vulnerabilidade ou clichê",
      "differentiator": "Diferencial de posicionamento"
    }
  ],
  "viralMethods": [
    {
      "id": "vm-1",
      "hookPattern": "Gancho provocativo específico do nicho da empresa",
      "viralMechanism": "Nome do mecanismo psicológico",
      "whyItWorks": "Por que decisores salvam e compartilham",
      "suggestedFormat": "carousel"
    },
    {
      "id": "vm-2",
      "hookPattern": "Gancho 2",
      "viralMechanism": "Mecanismo 2",
      "whyItWorks": "Explicação 2",
      "suggestedFormat": "carousel"
    },
    {
      "id": "vm-3",
      "hookPattern": "Gancho 3",
      "viralMechanism": "Mecanismo 3",
      "whyItWorks": "Explicação 3",
      "suggestedFormat": "carousel"
    }
  ],
  "editorialPlan": [
    {
      "id": "plan-1",
      "dayNumber": 1,
      "dayLabel": "Segunda • 06/Out",
      "theme": "Tema da Pauta 1",
      "hookHeadline": "Headline de Parada de Rolagem",
      "format": "carousel",
      "funnelStage": "topo",
      "objective": "Objetivo estratégico",
      "viralAngle": "Ângulo de atração",
      "ctaText": "CTA sugerida",
      "status": "planejado"
    },
    {
      "id": "plan-2",
      "dayNumber": 2,
      "dayLabel": "Quarta • 08/Out",
      "theme": "Tema da Pauta 2",
      "hookHeadline": "Headline 2",
      "format": "carousel",
      "funnelStage": "meio",
      "objective": "Objetivo 2",
      "viralAngle": "Ângulo 2",
      "ctaText": "CTA 2",
      "status": "planejado"
    },
    {
      "id": "plan-3",
      "dayNumber": 3,
      "dayLabel": "Sexta • 10/Out",
      "theme": "Tema da Pauta 3",
      "hookHeadline": "Headline 3",
      "format": "carousel",
      "funnelStage": "meio",
      "objective": "Objetivo 3",
      "viralAngle": "Ângulo 3",
      "ctaText": "CTA 3",
      "status": "planejado"
    },
    {
      "id": "plan-4",
      "dayNumber": 4,
      "dayLabel": "Terça • 14/Out",
      "theme": "Tema da Pauta 4",
      "hookHeadline": "Headline 4",
      "format": "carousel",
      "funnelStage": "fundo",
      "objective": "Objetivo 4",
      "viralAngle": "Ângulo 4",
      "ctaText": "CTA 4",
      "status": "planejado"
    }
  ]
}`;
  }

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3000,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Tentativa Gemini [${model}] retornou status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!text) continue;

      const cleanJson = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanJson) as ParsedGeminiDiagnostic;
      if (
        parsed &&
        Array.isArray(parsed.competitors) &&
        parsed.competitors.length > 0 &&
        parsed.executiveSummary
      ) {
        return parsed;
      }
    } catch (err) {
      console.warn(`Erro no modelo Gemini ${model}:`, err);
    }
  }

  return null;
}

/**
 * Sintetizador Dinâmico (Fallback de Alta Fidelidade)
 */
function synthesizeDynamicDiagnostic(
  body: DiagnosticRequestBody,
  scraped: { title?: string; description?: string; bodyText: string; normalizedUrl: string }
): ParsedGeminiDiagnostic {
  const isInfluencer =
    body.profileType === "influencer" ||
    (!body.website?.trim() && Boolean(body.instagram?.trim()));

  // Dedução de Nome
  let brandName = body.name?.trim();
  if (!brandName || brandName === "Black Link CRM" || brandName === "Black Link") {
    if (isInfluencer && body.instagram) {
      const clean = body.instagram.replace("@", "").trim();
      brandName = clean.charAt(0).toUpperCase() + clean.slice(1);
    } else if (scraped.title) {
      const titleClean = scraped.title.split(/[|\-–•]/)[0].trim();
      if (titleClean.length > 1 && titleClean.length < 50) {
        brandName = titleClean;
      }
    } else if (body.website) {
      const match = body.website.match(/(?:https?:\/\/)?(?:www\.)?([^/.]+)/i);
      if (match && match[1]) {
        brandName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      }
    }
  }
  if (!brandName) brandName = isInfluencer ? "Criador de Conteúdo" : "Empresa Corporativa";

  // Dedução de Handle
  let brandHandle = body.instagram?.trim();
  if (!brandHandle || brandHandle === "@" || brandHandle === "@blacklink.b2b" || brandHandle === "@blklnk.com.br") {
    const slug = brandName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    brandHandle = `@${slug || "oficial"}`;
  }

  const brandSite = scraped.normalizedUrl || body.website?.trim() || "";

  if (isInfluencer) {
    // FALLBACK PARA INFLUENCER
    const bio = `✨ ${brandName} | Criador de Conteúdo & Entretenimento
🎬 Bastidores, histórias e humor sem filtro
📩 Parcerias e contato via direct`;

    const tagline = `${brandName}: Onde a autenticidade encontra o engajamento de verdade`;

    const executiveSummary = `Dossiê do Criador para ${brandName} (${brandHandle}): Análise focada na presença do Instagram. Como creator, o maior ativo é a retenção e identificação com o público. O posicionamento deve explorar a quebra de rotina, o humor de identificação e bastidores autênticos contra criadores que apenas copiam tendências batidas.`;

    const competitors: CompetitorItem[] = [
      {
        id: "comp-1",
        name: "Líder de Audiência do Segmento",
        handle: "@top_creator_br",
        level: "leader",
        strength: "Base massiva de seguidores e presença consolidada em múltiplas redes.",
        vulnerabilityOrCliché: "Conteúdo excessivamente comercial e distante da realidade da audiência.",
        differentiator: `${brandName}: Proximidade com o público, espontaneidade e alta interação nos comentários.`,
      },
      {
        id: "comp-2",
        name: "Criadores Rivais de Formato Curto",
        handle: "@reels_creator_viral",
        level: "direct",
        strength: "Publicações frequentes e velocidade de replicação de memes.",
        vulnerabilityOrCliché: "Falta de identidade própria e dependência de áudios em alta sem storytelling autoral.",
        differentiator: `${brandName}: Estilo autoral marcante e comunidade fiel que acompanha pela personalidade.`,
      },
      {
        id: "comp-3",
        name: "Canais de Mídia Tradicional & Podcasts",
        handle: "@canal_entretenimento",
        level: "indirect",
        strength: "Orçamentos altos de produção.",
        vulnerabilityOrCliché: "Formatos engessados que não geram conexão genuína no feed.",
        differentiator: `${brandName}: Agilidade de gravação, resposta imediata ao algoritmo e conexão íntima com o seguidor.`,
      },
    ];

    const viralMethods: ViralMethodAngle[] = [
      {
        id: "vm-1",
        hookPattern: "O dia que tudo deu errado e ninguém me avisou...",
        viralMechanism: "Curiosidade & Storytelling Vulnerável",
        whyItWorks: "A audiência não resiste a histórias reais de caos e situações inusitadas contadas com humor.",
        suggestedFormat: "carousel",
      },
      {
        id: "vm-2",
        hookPattern: "A verdade que ninguém tem coragem de falar sobre...",
        viralMechanism: "Contra-Consenso & Identificação Imediata",
        whyItWorks: "Provoca debates nos comentários e compartilhamento maciço em grupos de WhatsApp e Directs.",
        suggestedFormat: "carousel",
      },
      {
        id: "vm-3",
        hookPattern: "Slide 1: Expectativa vs Realidade no meu dia a dia",
        viralMechanism: "Relatabilidade Visual",
        whyItWorks: "Gera identificação instantânea e atua como meme compartilhável em Stories.",
        suggestedFormat: "carousel",
      },
    ];

    const editorialPlan: EditorialPlanItem[] = [
      {
        id: "plan-1",
        dayNumber: 1,
        dayLabel: "Segunda • 06/Out",
        theme: "Bastidores & Relatabilidade",
        hookHeadline: "Como começar a semana quando a vontade é zero",
        format: "carousel",
        funnelStage: "topo",
        objective: "Viralização e conexão com o público de segunda-feira.",
        viralAngle: "Humor de identificação e memes autorais.",
        ctaText: "Manda pra aquele amigo que está no mesmo barco.",
        status: "planejado",
      },
      {
        id: "plan-2",
        dayNumber: 2,
        dayLabel: "Quarta • 08/Out",
        theme: "História Pessoal / Situação Inusitada",
        hookHeadline: "Quase fui banido por causa dessa ideia...",
        format: "carousel",
        funnelStage: "meio",
        objective: "Retenção de leitura e engajamento nos comentários.",
        viralAngle: "Storytelling autêntico de 5 lâminas.",
        ctaText: "Comenta qual parte você achou mais absurda.",
        status: "planejado",
      },
      {
        id: "plan-3",
        dayNumber: 3,
        dayLabel: "Sexta • 10/Out",
        theme: "Carrossel de Imagens & Bastidores",
        hookHeadline: "Minha galeria do celular deveria ser censurada",
        format: "carousel",
        funnelStage: "meio",
        objective: "Salvamentos e compartilhamentos espontâneos.",
        viralAngle: "Estética despretensiosa e de alta identificação.",
        ctaText: "Qual foto te representa hoje? 1, 2 ou 3?",
        status: "planejado",
      },
      {
        id: "plan-4",
        dayNumber: 4,
        dayLabel: "Domingo • 12/Out",
        theme: "Comunidade & Ativação de Parceiros",
        hookHeadline: "O teste definitivo que eu fiz essa semana",
        format: "carousel",
        funnelStage: "fundo",
        objective: "Demonstração de produto ou parceria de forma 100% orgânica.",
        viralAngle: "Opinião sincera e recomendação nativa.",
        ctaText: "Toque no link da bio para conferir.",
        status: "planejado",
      },
    ];

    return {
      name: brandName,
      instagram: brandHandle,
      website: "",
      niche: body.niche?.trim() || "Entretenimento & Conteúdo Digital",
      products: body.products?.trim() || "Publis de Marcas, Parcerias Comerciais e Projetos Autorais",
      bio,
      tagline,
      executiveSummary,
      competitors,
      viralMethods,
      editorialPlan,
    };
  }

  // FALLBACK PARA EMPRESA
  const lowerText = (scraped.bodyText + " " + (scraped.title || "") + " " + (scraped.description || "")).toLowerCase();
  const isMetalOrSteel =
    lowerText.includes("metal") ||
    lowerText.includes("aço") ||
    lowerText.includes("aco") ||
    lowerText.includes("estrutur") ||
    lowerText.includes("construção") ||
    lowerText.includes("obra");

  const refinedNiche =
    body.niche?.trim() ||
    (isMetalOrSteel
      ? "Engenharia Estrutural & Fabricação de Estruturas Metálicas para Obras de Grande Porte"
      : `Soluções Corporativas Especializadas em ${brandName}`);

  const refinedProducts =
    body.products?.trim() ||
    (isMetalOrSteel
      ? "Estruturas Metálicas de Alta Performance, Kits Estruturais Padronizados e Projetos de Infraestrutura"
      : `Linha de Soluções e Atendimento Corporativo da ${brandName}`);

  const bio = `🏢 ${brandName} | Soluções Corporativas de Precisão
⚙️ Alta performance, rastreabilidade e segurança
👇 Fale com nossos especialistas pelo link abaixo:
${brandSite}`;

  const tagline = `${brandName}: Excelência e Eficiência Operacional`;

  const executiveSummary = `Diagnóstico Estratégico para ${brandName} (${brandHandle}): Foco em autoridade e contra-posicionamento fundamentado nas soluções da empresa.`;

  const competitors: CompetitorItem[] = [
    {
      id: "comp-1",
      name: "Líder Global do Segmento",
      handle: "@lider_global",
      level: "leader",
      strength: "Reconhecimento massivo de marca e infraestrutura consolidada.",
      vulnerabilityOrCliché: "Custos elevados e soluções engessadas que não atendem demandas ágeis.",
      differentiator: `${brandName}: Atendimento cirúrgico, implementação acelerada e maior proximidade com os tomadores de decisão.`,
    },
    {
      id: "comp-2",
      name: "Concorrentes Nacionais Estabelecidos",
      handle: "@concorrente_nacional",
      level: "direct",
      strength: "Presença consolidada no mercado regional.",
      vulnerabilityOrCliché: "Comunicação antiquada e processos que não evoluíram com a demanda moderna.",
      differentiator: `${brandName}: Tecnologia de ponta, processos eficientes e diferenciação visual marcante.`,
    },
    {
      id: "comp-3",
      name: "Processos Tradicionais e Manuais",
      handle: "@metodos_antigos",
      level: "indirect",
      strength: "Resistência à mudança e familiaridade de operações antigas.",
      vulnerabilityOrCliché: "Erros operacionais frequentes e retrabalho silencioso que drena margem.",
      differentiator: `${brandName}: Modernização completa e previsibilidade com métricas de resultado claras.`,
    },
  ];

  const viralMethods: ViralMethodAngle[] = [
    {
      id: "vm-1",
      hookPattern: `Os 3 Erros Críticos que Encarecem Operações em ${refinedNiche}`,
      viralMechanism: "Diagnóstico de Sangria Financeira",
      whyItWorks: "Decisores corporativos param o feed ao identificar custos invisíveis e riscos de execução.",
      suggestedFormat: "carousel",
    },
    {
      id: "vm-2",
      hookPattern: `Estudo de Caso: Como Reduzir em 40% o Cronograma com a ${brandName}`,
      viralMechanism: "Engenharia Reversa de Sucesso Real",
      whyItWorks: "Casos reais com números práticos geram alto volume de salvamentos.",
      suggestedFormat: "carousel",
    },
    {
      id: "vm-3",
      hookPattern: `O que Grandes Empresas Fazem de Diferente na Escolha de Fornecedores`,
      viralMechanism: "Contra-Consenso & Tendência Oculta",
      whyItWorks: "Desafia o senso comum e posiciona a marca como autoridade técnica indiscutível.",
      suggestedFormat: "carousel",
    },
  ];

  const editorialPlan: EditorialPlanItem[] = [
    {
      id: "plan-1",
      dayNumber: 1,
      dayLabel: "Segunda • 06/Out",
      theme: `O Impacto da Escolha Certa de Fornecedores em ${refinedNiche}`,
      hookHeadline: "Por que economizar na fase inicial pode dobrar o custo total do seu projeto.",
      format: "carousel",
      funnelStage: "topo",
      objective: "Atração e conscientização de diretores e gestores sobre custos ocultos.",
      viralAngle: "Contraste direto entre preço aparente e custo real de ciclo de vida.",
      ctaText: "Salve este carrossel para consultar na sua próxima cotação.",
      status: "planejado",
    },
    {
      id: "plan-2",
      dayNumber: 2,
      dayLabel: "Quarta • 08/Out",
      theme: `Bastidores Técnicos: Como a ${brandName} Garante Precisão Absoluta`,
      hookHeadline: "Conheça o protocolo de qualidade e rastreabilidade que protege nossos clientes.",
      format: "carousel",
      funnelStage: "meio",
      objective: "Educação técnica e comprovação de autoridade operacional.",
      viralAngle: "Imagens técnicas e dados densos de conformidade.",
      ctaText: "Compartilhe este material com a sua equipe.",
      status: "planejado",
    },
    {
      id: "plan-3",
      dayNumber: 3,
      dayLabel: "Sexta • 10/Out",
      theme: `Comparativo de Performance: Métodos Ágeis vs Abordagens Convencionais`,
      hookHeadline: "Veja a diferença real de produtividade entre soluções modernas e legadas.",
      format: "carousel",
      funnelStage: "meio",
      objective: "Quebra de objeções e consolidação da tese de superioridade técnica.",
      viralAngle: "Tabela comparativa com métricas de tempo e desperdício zero.",
      ctaText: "Comente 'DIAGNÓSTICO' para receber nossa planilha comparativa.",
      status: "planejado",
    },
    {
      id: "plan-4",
      dayNumber: 4,
      dayLabel: "Terça • 14/Out",
      theme: `Apresentação Executiva: Como Iniciar uma Parceria com a ${brandName}`,
      hookHeadline: "Descubra como estruturar sua próxima demanda com máxima segurança.",
      format: "carousel",
      funnelStage: "fundo",
      objective: "Geração de orçamentos e contato direto com o time comercial.",
      viralAngle: "Apresentação dos canais diretos e prazos de atendimento.",
      ctaText: "Toque no link da bio para solicitar um orçamento corporativo.",
      status: "planejado",
    },
  ];

  return {
    name: brandName,
    instagram: brandHandle,
    website: brandSite,
    niche: refinedNiche,
    products: refinedProducts,
    bio,
    tagline,
    executiveSummary,
    competitors,
    viralMethods,
    editorialPlan,
  };
}

/**
 * Constrói posts sincronizados para o Feed do Instagram
 */
function buildSynchronizedFeedPosts(
  brandName: string,
  brandHandle: string,
  plan: EditorialPlanItem[],
  isInfluencer: boolean
): ScheduledPost[] {
  return plan.map((item, idx) => {
    const slideHeadline = item.hookHeadline;
    const cleanTag = brandName.replace(/[^a-zA-Z0-9]/g, "");

    const slides: CreativeSlide[] = isInfluencer
      ? [
          {
            slideNumber: 1,
            headline: slideHeadline,
            bodyText: `Conteúdo autoral e reflexões sem filtro de ${brandName}.`,
            imageUrl: `/api/marketing/render-slide?slide=1&total=5&headline=${encodeURIComponent(
              slideHeadline
            )}&body=${encodeURIComponent(
              `Conteudo autoral de ${brandName}. Arraste para o lado.`
            )}&format=carousel`,
            tag: "DESTAQUE",
          },
          {
            slideNumber: 2,
            headline: "O Ponto Crítico da História",
            bodyText: "A maioria das pessoas tenta esconder as falhas, mas é no caos que a mágica acontece.",
            imageUrl: `/api/marketing/render-slide?slide=2&total=5&headline=${encodeURIComponent(
              "O Ponto Critico da Historia"
            )}&body=${encodeURIComponent(
              "A maioria tenta esconder as falhas mas e no caos que a magica acontece."
            )}&format=carousel`,
            tag: "BASTIDORES",
          },
          {
            slideNumber: 3,
            headline: "A Virada de Chave",
            bodyText: "Quando você desapega da perfeição, o engajamento e a conexão com a galera disparam.",
            imageUrl: `/api/marketing/render-slide?slide=3&total=5&headline=${encodeURIComponent(
              "A Virada de Chave"
            )}&body=${encodeURIComponent(
              "Quando voce desapega da perfeicao a conexao real com o publico dispara."
            )}&format=carousel`,
            tag: "IDENTIFICAÇÃO",
          },
          {
            slideNumber: 4,
            headline: "Visão sem Filtro",
            bodyText: "Faça o teste você mesmo. A vida é curta demais para postar o que todo mundo posta.",
            imageUrl: `/api/marketing/render-slide?slide=4&total=5&headline=${encodeURIComponent(
              "Visao sem Filtro"
            )}&body=${encodeURIComponent(
              "Faca o teste voce mesmo. A vida e curta demais para ser generico."
            )}&format=carousel`,
            tag: "AUTORAL",
          },
          {
            slideNumber: 5,
            headline: "Comente o que você achou",
            bodyText: `Siga ${brandHandle} para mais conteúdos diários e comente sua opinião abaixo!`,
            imageUrl: `/api/marketing/render-slide?slide=5&total=5&headline=${encodeURIComponent(
              "Comente o que voce achou"
            )}&body=${encodeURIComponent(
              `Siga ${brandHandle} para mais conteudos diarios.`
            )}&format=carousel`,
            tag: "INTERAÇÃO",
          },
        ]
      : [
          {
            slideNumber: 1,
            headline: slideHeadline,
            bodyText: `Diretrizes estratégicas elaboradas para ${brandName}.`,
            imageUrl: `/api/marketing/render-slide?slide=1&total=5&headline=${encodeURIComponent(
              slideHeadline
            )}&body=${encodeURIComponent(
              `Soluções de alta performance e rigor técnico com a ${brandName}.`
            )}&format=carousel`,
            tag: "DIAGNÓSTICO",
          },
          {
            slideNumber: 2,
            headline: "O Gargalo do Modelo Tradicional",
            bodyText: "Processos sem rastreabilidade geram atrasos críticos e encarecem o projeto.",
            imageUrl: `/api/marketing/render-slide?slide=2&total=5&headline=${encodeURIComponent(
              "O Gargalo do Modelo Tradicional"
            )}&body=${encodeURIComponent(
              "Processos sem rastreabilidade geram atrasos criticos e encarecem o projeto."
            )}&format=carousel`,
            tag: "ANÁLISE",
          },
          {
            slideNumber: 3,
            headline: "A Engenharia de Alavancagem",
            bodyText: "Com padrões técnicos e fornecimento de precisão, você blinda seu cronograma.",
            imageUrl: `/api/marketing/render-slide?slide=3&total=5&headline=${encodeURIComponent(
              "A Engenharia de Alavancagem"
            )}&body=${encodeURIComponent(
              "Com padroes tecnicos e precisao voce blinda seu cronograma."
            )}&format=carousel`,
            tag: "SOLUÇÃO",
          },
          {
            slideNumber: 4,
            headline: "Execução Prática no Terreno",
            bodyText: "Elimine imprevistos através de controle de qualidade e comunicação transparente.",
            imageUrl: `/api/marketing/render-slide?slide=4&total=5&headline=${encodeURIComponent(
              "Execucao Pratica no Terreno"
            )}&body=${encodeURIComponent(
              "Elimine imprevistos atraves de controle de qualidade rigoroso."
            )}&format=carousel`,
            tag: "EXECUÇÃO",
          },
          {
            slideNumber: 5,
            headline: "Próximo Passo Estratégico",
            bodyText: `Consulte os especialistas da ${brandName} e garanta os melhores resultados para sua demanda.`,
            imageUrl: `/api/marketing/render-slide?slide=5&total=5&headline=${encodeURIComponent(
              "Proximo Passo Estrategico"
            )}&body=${encodeURIComponent(
              `Consulte os especialistas da ${brandName} para alcancar resultados de elite.`
            )}&format=carousel`,
            tag: "DECISÃO",
          },
        ];

    return {
      id: `post-synced-${idx + 1}-${Date.now()}`,
      theme: item.theme,
      format: item.format,
      targetAudience: isInfluencer
        ? "Seguidores e audiência do criador"
        : "Gestores, Diretores e Tomadores de Decisão",
      scheduledDate: item.dayLabel,
      status: idx === 0 ? "awaiting_approval" : "scheduled",
      hookHeadline: item.hookHeadline,
      bodyCopy: `${item.hookHeadline}\n\n${item.objective}\n\nConfira as lâminas deste carrossel preparadas para ${brandName}.\n\n${item.ctaText}`,
      ctaText: item.ctaText,
      hashtags: [`#${cleanTag}`, `#${brandHandle.replace(/^@/, "")}`, "#CriadorDeConteudo", "#Viral"],
      postCaption: `${item.hookHeadline}\n\nArraste para o lado e confira os pontos essenciais.\n\n${item.ctaText}\n\n#${cleanTag} #${brandHandle.replace(/^@/, "")}`,
      slides,
      imageUrls: slides.map((s) => s.imageUrl || ""),
      createdAt: new Date().toISOString(),
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: DiagnosticRequestBody = await request.json();

    // 1. Rastreia o site se informado
    let scraped: {
      title?: string;
      description?: string;
      bodyText: string;
      normalizedUrl: string;
    } = { bodyText: "", normalizedUrl: "" };

    if (body.website && body.website.trim()) {
      scraped = await scrapeWebsiteText(body.website);
    }

    const isInfluencer =
      body.profileType === "influencer" ||
      (!body.website?.trim() && Boolean(body.instagram?.trim())) ||
      (body.niche && /influencer|creator|humor|criador|lifestyle|artista/i.test(body.niche));

    const geminiKey = process.env.GEMINI_API_KEY;
    let diagnosticResult: ParsedGeminiDiagnostic | null = null;
    let engineSource: "gemini_ai" | "synthetic_engine" = "synthetic_engine";

    // 2. Consulta a IA Gemini
    if (geminiKey) {
      diagnosticResult = await callGeminiDiagnostic(geminiKey, body, scraped);
      if (diagnosticResult) {
        engineSource = "gemini_ai";
      }
    }

    // 3. Fallback inteligente personalizado
    if (!diagnosticResult) {
      diagnosticResult = synthesizeDynamicDiagnostic(body, scraped);
      engineSource = "synthetic_engine";
    }

    const resolvedName =
      diagnosticResult.name ||
      (scraped.title ? scraped.title.split(/[|\-–]/)[0].trim() : body.name?.trim()) ||
      (isInfluencer && body.instagram
        ? body.instagram.replace("@", "").charAt(0).toUpperCase() + body.instagram.replace("@", "").slice(1)
        : "Perfil Analisado");

    const resolvedInstagram =
      diagnosticResult.instagram ||
      (body.instagram && body.instagram.trim() !== "@" ? body.instagram.trim() : "") ||
      `@${resolvedName.toLowerCase().replace(/[^a-z0-9]/g, "") || "oficial"}`;

    const resolvedWebsite =
      diagnosticResult.website ||
      scraped.normalizedUrl ||
      body.website?.trim() ||
      "";

    const resolvedNiche =
      diagnosticResult.niche ||
      body.niche?.trim() ||
      (isInfluencer ? "Criador de Conteúdo & Entretenimento" : "Soluções Corporativas Especializadas");

    const resolvedProducts =
      diagnosticResult.products ||
      body.products?.trim() ||
      (isInfluencer ? "Publis de Marcas, Parcerias e Projetos Autorais" : "Soluções e Serviços de Alta Performance");

    const nowFormatted = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const finalDiagnostic = {
      executiveSummary:
        diagnosticResult.executiveSummary ||
        `Diagnóstico Estratégico para ${resolvedName} (${resolvedInstagram}): Foco em autoridade e engajamento no Instagram.`,
      competitors: diagnosticResult.competitors || [],
      viralMethods: diagnosticResult.viralMethods || [],
      lastAnalyzedAt: nowFormatted,
    };

    const finalEditorialPlan = diagnosticResult.editorialPlan || [];

    const synchronizedPosts = buildSynchronizedFeedPosts(
      resolvedName,
      resolvedInstagram,
      finalEditorialPlan,
      Boolean(isInfluencer)
    );

    return NextResponse.json({
      success: true,
      source: engineSource,
      scrapedSite: Boolean(scraped.bodyText),
      isInfluencer: Boolean(isInfluencer),
      companyProfile: {
        name: resolvedName,
        instagram: resolvedInstagram,
        website: resolvedWebsite,
        niche: resolvedNiche,
        products: resolvedProducts,
        targetAudience:
          body.targetAudience ||
          (isInfluencer ? "Seguidores e audiência do nicho no Instagram" : "Gestores, Diretores e Tomadores de Decisão"),
        bio: diagnosticResult.bio,
        tagline: diagnosticResult.tagline,
        profileType: isInfluencer ? "influencer" : "company",
      },
      diagnostic: finalDiagnostic,
      editorialPlan: finalEditorialPlan,
      scheduledPosts: synchronizedPosts,
    });
  } catch (err: unknown) {
    console.error("Erro interno no endpoint de diagnóstico:", err);
    return NextResponse.json(
      {
        error: "Falha ao processar diagnóstico de inteligência no Instagram.",
      },
      { status: 500 }
    );
  }
}
