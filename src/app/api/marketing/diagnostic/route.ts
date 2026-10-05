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
 * Consulta a API do Google Gemini com fallback inteligente de modelos e suporte a extração apenas por site
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

  const hasInstagram = Boolean(body.instagram && body.instagram.trim() && body.instagram.trim() !== "@");
  let providedName = body.name?.trim() || "";

  // Se o site foi lido e o nome do formulário não bate com o site (ex: resquício de "Black Link CRM" no formulário e site "gofermetais.com.br")
  if (scraped.title && providedName) {
    const lowerTitle = scraped.title.toLowerCase();
    const lowerName = providedName.toLowerCase();
    if (!lowerTitle.includes(lowerName) && !lowerName.includes(lowerTitle)) {
      providedName = ""; // Prioriza o site como fonte primária
    }
  }

  const prompt = `Você é o Estrategista-Chefe de Inteligência Competitiva, Análise de Mercado B2B e Growth da Black Link.
Sua missão é realizar um diagnóstico corporativo PROFUNDO, hiper-personalizado e fundamentado no negócio real da empresa abaixo:

${websiteSummary}

INFORMAÇÕES ADICIONAIS FORNECIDAS PELO OPERADOR:
- Nome da Empresa Informado: "${providedName || "NÃO INFORMADO (Extraia do site)"}"
- @Instagram Informado: "${hasInstagram ? body.instagram?.trim() : "NÃO INFORMADO / NÃO POSSUI (Instagram é Opcional)"}"
- Nicho / Setor Informado: "${body.niche?.trim() || "NÃO INFORMADO (Extraia do site)"}"
- Produtos & Soluções Informados: "${body.products?.trim() || "NÃO INFORMADO (Extraia do site)"}"
- Público-Alvo Informado: "${body.targetAudience?.trim() || "NÃO INFORMADO (Deduza com base no mercado da empresa)"}"

DIRETRIZES FUNDAMENTAIS:
1. EXTRAÇÃO CIRÚRGICA DA IDENTIDADE:
   - Se o usuário forneceu apenas o site (ou se o nome e Instagram não foram preenchidos), extraia com total fidelidade o NOME REAL DA EMPRESA, o NICHO e os PRODUTOS/SOLUÇÕES a partir do site analisado.
   - NÃO presuma que a empresa é uma empresa de software/CRM a menos que o site realmente seja de software/CRM. Se o site for de engenharia metálica (ex: Gofer Metais), construção pesada, saúde, logística, indústria ou serviços, adapte 100% da análise para esse segmento.
2. O INSTAGRAM É 100% OPCIONAL:
   - Se o Instagram não foi informado ou a empresa não possui, crie e sugira um @handle limpo e profissional (ex: @nome_da_empresa) para estruturar a presença da marca na rede, e crie uma proposta de Bio e posicionamento que faça a empresa se destacar.
3. CONCORRENTES REAIS NO MERCADO ESPECÍFICO (3 NÍVEIS):
   - Nível 1 (leader): Líder global ou grande player nacional consolidado do setor dessa empresa.
   - Nível 2 (direct): Concorrente direto no Brasil ou no mesmo nicho de mercado.
   - Nível 3 (indirect): Alternativas indiretas, concorrentes substitutos ou processos manuais/tradicionais.
   Para cada concorrente, indique força, fraqueza/clichê e como a empresa analisada se diferencia.
4. MÉTODOS VIRALIZÁVEIS E CRONOGRAMA:
   - Crie 3 métodos com ganchos virais específicos para os produtos/obras/serviços reais da empresa.
   - Crie 4 pautas de carrossel de alto impacto para o cronograma editorial (Topo, Meio, Fundo de funil).

Responda ESTRITAMENTE em formato JSON puro (sem marcação de bloco de código):
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
 * Sintetizador Dinâmico Baseado no Core Business (Fallback de Alta Fidelidade)
 */
function synthesizeDynamicDiagnostic(
  body: DiagnosticRequestBody,
  scraped: { title?: string; description?: string; bodyText: string; normalizedUrl: string }
): ParsedGeminiDiagnostic {
  // Dedução de Nome: se fornecido usa o fornecido; senão extrai do título ou da URL
  let brandName = body.name?.trim();
  if (!brandName || brandName === "Black Link CRM" || brandName === "Black Link") {
    if (scraped.title) {
      // Ex: "Gofer Metais | Estruturas Metálicas..." -> "Gofer Metais"
      const titleClean = scraped.title.split(/[|\-–•]/)[0].trim();
      if (titleClean.length > 1 && titleClean.length < 50) {
        brandName = titleClean;
      }
    }
    if (!brandName && body.website) {
      const match = body.website.match(/(?:https?:\/\/)?(?:www\.)?([^/.]+)/i);
      if (match && match[1]) {
        brandName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      }
    }
  }
  if (!brandName) brandName = "Empresa Corporativa";

  // Dedução de Handle: se não tiver ou for vazio, gera com base no nome
  let brandHandle = body.instagram?.trim();
  if (!brandHandle || brandHandle === "@" || brandHandle === "@blacklink.b2b" || brandHandle === "@blklnk.com.br") {
    const slug = brandName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    brandHandle = `@${slug || "oficial"}`;
  }

  const brandSite = scraped.normalizedUrl || body.website?.trim() || "https://empresa.com.br";

  const lowerName = brandName.toLowerCase();
  const lowerText = (scraped.bodyText + " " + (scraped.title || "") + " " + (scraped.description || "")).toLowerCase();

  const isMetalOrSteel =
    lowerText.includes("metal") ||
    lowerText.includes("aço") ||
    lowerText.includes("aco") ||
    lowerText.includes("estrutur") ||
    lowerText.includes("construção") ||
    lowerText.includes("obra");

  const isSoftwareOrTech =
    lowerText.includes("software") ||
    lowerText.includes("tecnologia") ||
    lowerText.includes("crm") ||
    lowerText.includes("ia") ||
    lowerText.includes("automação");

  let refinedNiche = body.niche?.trim() || "";
  let refinedProducts = body.products?.trim() || "";

  if (!refinedNiche) {
    if (isMetalOrSteel) {
      refinedNiche = "Engenharia Estrutural & Fabricação de Estruturas Metálicas para Obras de Grande Porte";
    } else if (isSoftwareOrTech) {
      refinedNiche = "Tecnologia B2B & Inteligência Digital Corporativa";
    } else {
      refinedNiche = `Soluções Corporativas Especializadas em ${brandName}`;
    }
  }

  if (!refinedProducts) {
    if (isMetalOrSteel) {
      refinedProducts = "Estruturas Metálicas de Alta Performance, Kits Estruturais Padronizados e Projetos de Infraestrutura";
    } else if (isSoftwareOrTech) {
      refinedProducts = "Plataforma de Gestão, Automação de Processos e Inteligência Comercial";
    } else {
      refinedProducts = `Linha de Soluções e Atendimento Corporativo da ${brandName}`;
    }
  }

  const bio = `🏗️ ${brandName} | Excelência e Precisão B2B
⚙️ Soluções de alta performance e rigor técnico
👇 Solicite seu atendimento executivo:
${brandSite}`;

  const tagline = `${brandName}: Soluções Confiáveis com Precisão e Alta Performance`;

  const executiveSummary = `Diagnóstico Estratégico para ${brandName} (${brandHandle}): Análise baseada no ecossistema ${brandSite}. No mercado de ${refinedNiche}, a maioria das empresas foca em mensagens genéricas sem comprovar rigor técnico ou diferenciais de entrega. Para a ${brandName} liderar e viralizar com alta autoridade, a estratégia mestra reside em contra-posicionar prazos rápidos, rastreabilidade técnica e portfólio comprovado contra players tradicionais.`;

  const competitors: CompetitorItem[] = isMetalOrSteel
    ? [
        {
          id: "comp-1",
          name: "Líderes Siderúrgicos & Grandes Fabricantes",
          handle: "@usiminas @gerdau",
          level: "leader",
          strength: "Capacidade de fornecimento massivo de matéria-prima e escala global.",
          vulnerabilityOrCliché: "Burocracia contratual excessiva e lentidão para projetos customizados.",
          differentiator: `${brandName}: Agilidade técnica, atendimento consultivo direto e flexibilidade na execução de projetos especiais.`,
        },
        {
          id: "comp-2",
          name: "Metalúrgicas Regionais Tradicionais",
          handle: "@estruturas_metalicas_brasil",
          level: "direct",
          strength: "Proximidade geográfica e preços de entrada concorrenciais.",
          vulnerabilityOrCliché: "Falta de controle de qualidade rigoroso, atrasos em cronogramas e ausência de presença digital executiva.",
          differentiator: `${brandName}: Rastreabilidade completa, certificações de qualidade e garantia estrita de cumprimento de cronogramas.`,
        },
        {
          id: "comp-3",
          name: "Métodos Construtivos em Concreto Armado",
          handle: "@construcao_tradicional",
          level: "indirect",
          strength: "Cultura tradicional de construção civil enraizada no mercado brasileiro.",
          vulnerabilityOrCliché: "Obras mais lentas, maior desperdício de insumos no canteiro e custo operacional imprevisto.",
          differentiator: `${brandName}: Redução de até 40% no tempo de montagem da obra, precisão milimétrica e menor custo total de instalação.`,
        },
      ]
    : [
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
      hookPattern: `Os 3 Erros Críticos que Encarecem Obras e Projetos em ${refinedNiche}`,
      viralMechanism: "Diagnóstico de Sangria Financeira",
      whyItWorks: "Decisores corporativos param o feed ao identificar custos invisíveis e riscos de execução.",
      suggestedFormat: "carousel",
    },
    {
      id: "vm-2",
      hookPattern: `Estudo de Caso: Como Reduzir em 40% o Cronograma de Entrega com a ${brandName}`,
      viralMechanism: "Engenharia Reversa de Sucesso Real",
      whyItWorks: "Casos reais com números práticos geram alto volume de salvamentos por engenheiros e diretores.",
      suggestedFormat: "carousel",
    },
    {
      id: "vm-3",
      hookPattern: `O que Grandes Empresas Fazem de Diferente na Escolha de Parceiros Estratégicos`,
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
      ctaText: "Compartilhe este material com a sua equipe de engenharia e operações.",
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
      hookHeadline: "Descubra como estruturar sua próxima demanda com máxima segurança e agilidade.",
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
 * Constrói posts sincronizados com o perfil da marca para o Feed do Instagram
 */
function buildSynchronizedFeedPosts(
  brandName: string,
  brandHandle: string,
  plan: EditorialPlanItem[]
): ScheduledPost[] {
  return plan.map((item, idx) => {
    const slideHeadline = item.hookHeadline;
    const cleanTag = brandName.replace(/[^a-zA-Z0-9]/g, "");

    const slides: CreativeSlide[] = [
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
          "Com padroes tecnicos e precisao você blinda seu cronograma."
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
      targetAudience: "Gestores, Diretores e Tomadores de Decisão",
      scheduledDate: item.dayLabel,
      status: idx === 0 ? "awaiting_approval" : "scheduled",
      hookHeadline: item.hookHeadline,
      bodyCopy: `${item.hookHeadline}\n\nPara liderar no mercado moderno, precisão técnica e compromisso com o cronograma são inegociáveis.\n\nConfira as lâminas deste carrossel preparadas pela ${brandName}.\n\n${item.ctaText}`,
      ctaText: item.ctaText,
      hashtags: [`#${cleanTag}`, "#GestaoB2B", "#ExcelenciaOperacional", "#AltaPerformance"],
      postCaption: `${item.hookHeadline}\n\nNo mercado B2B, o que separa os líderes é a segurança na entrega e a capacidade de transformar projetos em resultados concretos.\n\nArraste para o lado e confira os pontos essenciais.\n\n${item.ctaText}\n\n#${cleanTag} #${brandHandle.replace(/^@/, "")}`,
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

    const geminiKey = process.env.GEMINI_API_KEY;
    let diagnosticResult: ParsedGeminiDiagnostic | null = null;
    let engineSource: "gemini_ai" | "synthetic_engine" = "synthetic_engine";

    // 2. Consulta a IA Gemini alimentando com o site rastreado e dados do usuário
    if (geminiKey) {
      diagnosticResult = await callGeminiDiagnostic(geminiKey, body, scraped);
      if (diagnosticResult) {
        engineSource = "gemini_ai";
      }
    }

    // 3. Fallback inteligente personalizado baseado no site caso a IA falhe
    if (!diagnosticResult) {
      diagnosticResult = synthesizeDynamicDiagnostic(body, scraped);
      engineSource = "synthetic_engine";
    }

    const resolvedName =
      diagnosticResult.name ||
      body.name?.trim() ||
      (scraped.title ? scraped.title.split(/[|\-–]/)[0].trim() : "Empresa Analisada");

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
      "Soluções Corporativas Especializadas";

    const resolvedProducts =
      diagnosticResult.products ||
      body.products?.trim() ||
      "Soluções e Serviços de Alta Performance";

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
        `Diagnóstico Estratégico para ${resolvedName} (${resolvedInstagram}): Foco em autoridade e contra-posicionamento fundamentado nas soluções da empresa.`,
      competitors: diagnosticResult.competitors || [],
      viralMethods: diagnosticResult.viralMethods || [],
      lastAnalyzedAt: nowFormatted,
    };

    const finalEditorialPlan = diagnosticResult.editorialPlan || [];

    const synchronizedPosts = buildSynchronizedFeedPosts(
      resolvedName,
      resolvedInstagram,
      finalEditorialPlan
    );

    return NextResponse.json({
      success: true,
      source: engineSource,
      scrapedSite: Boolean(scraped.bodyText),
      companyProfile: {
        name: resolvedName,
        instagram: resolvedInstagram,
        website: resolvedWebsite,
        niche: resolvedNiche,
        products: resolvedProducts,
        targetAudience:
          body.targetAudience || "Gestores, Diretores e Tomadores de Decisão",
        bio: diagnosticResult.bio,
        tagline: diagnosticResult.tagline,
      },
      diagnostic: finalDiagnostic,
      editorialPlan: finalEditorialPlan,
      scheduledPosts: synchronizedPosts,
    });
  } catch (err: unknown) {
    console.error("Erro interno no endpoint de diagnóstico:", err);
    return NextResponse.json(
      {
        error: "Falha ao processar diagnóstico de inteligência corporativa.",
      },
      { status: 500 }
    );
  }
}
