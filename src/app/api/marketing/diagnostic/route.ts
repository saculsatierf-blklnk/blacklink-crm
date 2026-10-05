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
 * Consulta a API do Google Gemini com fallback inteligente de modelos para garantia de alta disponibilidade
 */
async function callGeminiDiagnostic(
  apiKey: string,
  body: DiagnosticRequestBody
): Promise<ParsedGeminiDiagnostic | null> {
  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.8-flash",
  ];

  const brandName = body.name?.trim() || "Black Link";
  const brandHandle = body.instagram?.trim() || "@blklnk.com.br";
  const brandSite = body.website?.trim() || "https://blklnk.com";
  const brandNiche = body.niche?.trim() || "CRM Enterprise, Automação de Vendas e Inteligência Comercial B2B";
  const brandProducts = body.products?.trim() || "Plataforma CRM, Radar Anti-Colisão de Hunters, Estúdio de IA para Carrosséis";
  const targetAudience = body.targetAudience?.trim() || "CEOs, Diretores Comerciais, Heads de Growth e Líderes B2B";

  const prompt = `Você é o Estrategista-Chefe de Inteligência Competitiva e Crescimento B2B da Black Link.
Sua missão é realizar um diagnóstico executivo PROFUNDO, hiper-personalizado e fundamentado no Instagram corporativo e ecossistema digital para a seguinte empresa:

DADOS DA EMPRESA:
- Nome da Empresa / Marca: "${brandName}"
- @Instagram Institucional: "${brandHandle}"
- Website Oficial: "${brandSite}"
- Nicho / Setor: "${brandNiche}"
- Produtos & Soluções: "${brandProducts}"
- Público-Alvo: "${targetAudience}"

DIRETRIZES DA ANÁLISE:
1. SE NENHUM PRODUTO OU NICHO ESPECÍFICO TIVER SIDO DIGITADO, DEDUZA COM BASE NO NOME, INSTAGRAM E DOMÍNIO (${brandName}, ${brandHandle}, ${brandSite}).
2. IDENTIFIQUE CONCORRENTES REAIS NO INSTAGRAM EM 3 NÍVEIS:
   - Nível 1 (leader): Líder de mercado global ou incumbente consolidado da categoria.
   - Nível 2 (direct): Concorrente direto no mercado nacional ou nicho de atuação com perfil no Instagram.
   - Nível 3 (indirect): Alternativa indireta / métodos manuais (planilhas, agências de outbound tradicionais, etc.).
   Para cada concorrente, aponte a força real, a vulnerabilidade/clichê que eles cometem no feed do Instagram e como a "${brandName}" se posiciona e vence com autoridade.
3. MÉTODOS VIRALIZÁVEIS: Crie 3 padrões de ganchos virais específicos para os produtos da empresa, explicando o mecanismo psicológico que faz tomadores de decisão (C-Level) salvarem e compartilharem.
4. CRONOGRAMA EDITORIAL: Crie 4 pautas estratégicas estruturadas (Topo, Meio, Fundo de funil) prontas para publicação no Instagram.
5. BIO DO INSTAGRAM: Formate uma bio de alto impacto, minimalista e persuasiva com emojis e chamada para ação (CTA).

Responda ESTRITAMENTE em formato JSON puro:
{
  "niche": "nicho refinado e articulado com clareza",
  "products": "produtos e soluções principais detalhados",
  "bio": "Bio executiva pronta para o perfil com quebras de linha e CTA",
  "tagline": "Frase de posicionamento de alto impacto",
  "executiveSummary": "Dossiê executivo e tese de contra-posicionamento da marca contra clichês de mercado",
  "competitors": [
    {
      "id": "comp-1",
      "name": "Nome do Concorrente Líder",
      "handle": "@handle_concorrente",
      "level": "leader",
      "strength": "Ponto forte do concorrente",
      "vulnerabilityOrCliché": "Clichê ou ponto fraco visível nas postagens",
      "differentiator": "Diferencial concreto e contra-posicionamento da ${brandName}"
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
      "hookPattern": "Gancho provocativo entre aspas",
      "viralMechanism": "Nome do mecanismo psicológico",
      "whyItWorks": "Por que decisores B2B salvam e compartilham",
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
      "theme": "Tema do Post 1",
      "hookHeadline": "Headline provocativa",
      "format": "carousel",
      "funnelStage": "topo",
      "objective": "Objetivo estratégico do conteúdo",
      "viralAngle": "Ângulo de atração",
      "ctaText": "CTA para engajamento ou direct",
      "status": "planejado"
    },
    {
      "id": "plan-2",
      "dayNumber": 2,
      "dayLabel": "Quarta • 08/Out",
      "theme": "Tema do Post 2",
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
      "theme": "Tema do Post 3",
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
      "theme": "Tema do Post 4",
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
      const timeoutId = setTimeout(() => controller.abort(), 14000);

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
function synthesizeDynamicDiagnostic(body: DiagnosticRequestBody): ParsedGeminiDiagnostic {
  const brandName = body.name?.trim() || "Black Link";
  const brandHandle = body.instagram?.trim() || "@blklnk.com.br";
  const brandSite = body.website?.trim() || "https://blklnk.com";

  const lowerName = brandName.toLowerCase();
  const lowerProducts = (body.products || "").toLowerCase();

  const isSoftwareOrCRM =
    lowerName.includes("crm") ||
    lowerName.includes("link") ||
    lowerProducts.includes("crm") ||
    lowerProducts.includes("vendas") ||
    lowerProducts.includes("software");

  const refinedNiche =
    body.niche?.trim() ||
    (isSoftwareOrCRM
      ? "SaaS Enterprise & Inteligência Comercial B2B"
      : `Soluções Corporativas de Alta Performance em ${brandName}`);

  const refinedProducts =
    body.products?.trim() ||
    (isSoftwareOrCRM
      ? "Plataforma CRM Enterprise, Radar Anti-Colisão de Hunters, Estúdio Autônomo de Carrosséis B2B"
      : `Plataforma e Serviços Estratégicos de Alta Conversão da ${brandName}`);

  const bio = `⚡ ${brandName} | Inteligência Comercial & Escala B2B
🛡️ Eficiência operacional e conversão previsível
🚀 Agende um diagnóstico exclusivo pelo link abaixo`;

  const tagline = `${brandName}: Transformando Processos Comerciais em Máquinas Previsíveis de Receita`;

  const executiveSummary = `Diagnóstico Estratégico para ${brandName} (${brandHandle}): O mercado no nicho ${refinedNiche} sofre com saturação de mensagens genéricas e templates superficiais de Canva no Instagram. Para ${brandName} consolidar autoridade executiva e romper o algoritmo, a estratégia mestra reside em contra-posicionar dados reais de esteira, métricas densas e autoridade técnica contra o discurso raso da concorrência tradicional.`;

  const competitors: CompetitorItem[] = [
    {
      id: `comp-1`,
      name: "HubSpot / Salesforce Ecosystem",
      handle: "@salesforce @hubspot",
      level: "leader",
      strength: "Reconhecimento global massivo de marca e infraestrutura corporativa.",
      vulnerabilityOrCliché:
        "Custos proibitivos em moeda estrangeira, burocracia de implantação e comunicação institucional fria sem apelo direto a times ágeis.",
      differentiator: `${brandName}: Velocidade cirúrgica de implantação, interface Dark Industrial focada no operador e estúdio criativo nativo integrado.`,
    },
    {
      id: `comp-2`,
      name: "CRMs Nacionais Legados",
      handle: "@rdstation @ploomescrm",
      level: "direct",
      strength: "Presença consolidada no mercado brasileiro e canais amplos de distribuição.",
      vulnerabilityOrCliché:
        "Interfaces convencionais, ausência de radar anti-colisão em tempo real e criativos pasteurizados no feed.",
      differentiator: `${brandName}: Arquitetura de esteira blindada, zero atrito entre hunters e geração automatizada de criativos de alta densidade.`,
    },
    {
      id: `comp-3`,
      name: "Agências Tradicionais de Outbound",
      handle: "@growth_agency_br",
      level: "indirect",
      strength: "Promessas agressivas de volume de reuniões.",
      vulnerabilityOrCliché:
        "Disparos em massa não personalizados que desgastam domínios e posts superficiais de 'dicas de prospecção'.",
      differentiator: `${brandName}: Governança de dados, cadência com telemetria preditiva e preservação da reputação institucional.`,
    },
  ];

  const viralMethods: ViralMethodAngle[] = [
    {
      id: `vm-1`,
      hookPattern: `Os 5 Erros Invisíveis que Fazem Empresas em ${refinedNiche} Queimar Margem`,
      viralMechanism: "Diagnóstico de Fricção Oculta",
      whyItWorks: "Decisores B2B param o feed imediatamente ao confrontar vazamentos de receita e ineficiências operacionais.",
      suggestedFormat: "carousel",
    },
    {
      id: `vm-2`,
      hookPattern: `Por que Times Comerciais de Elite Estão Abandonando Métodos Tradicionais`,
      viralMechanism: "Contra-Consenso & Tendência Oculta",
      whyItWorks: "Gera curiosidade imediata e quebra de paradigma entre líderes e executivos.",
      suggestedFormat: "carousel",
    },
    {
      id: `vm-3`,
      hookPattern: `O Framework de Esteira que Multiplicou a Tração da ${brandName} (Passo a Passo)`,
      viralMechanism: "Engenharia Reversa de Sucesso Real",
      whyItWorks: "Profissionais corporativos salvam postagens densas com processos práticos para replicar internamente.",
      suggestedFormat: "carousel",
    },
  ];

  const editorialPlan: EditorialPlanItem[] = [
    {
      id: `plan-1`,
      dayNumber: 1,
      dayLabel: "Segunda • 06/Out",
      theme: `O Diagnóstico Real do Funil em ${brandName}`,
      hookHeadline: "Por que 80% das empresas erram na estruturação comercial e como virar o jogo.",
      format: "carousel",
      funnelStage: "topo",
      objective: "Atrair decisores com quebra de mitos e análise diagnóstica do setor.",
      viralAngle: "Contraste entre métodos amadores e processos de alta performance.",
      ctaText: "Salve este post para analisar na próxima reunião estratégica.",
      status: "planejado",
    },
    {
      id: `plan-2`,
      dayNumber: 2,
      dayLabel: "Quarta • 08/Out",
      theme: `Como Eliminar Conflitos e Silos Operacionais em ${refinedNiche}`,
      hookHeadline: "O custo silencioso de equipes operando sem alinhamento e telemetria em tempo real.",
      format: "carousel",
      funnelStage: "meio",
      objective: "Demonstrar a importância da governança e da tecnologia de ponta.",
      viralAngle: "Storytelling executivo com números reais de impacto em margem.",
      ctaText: "Compartilhe este carrossel com sua liderança de operações.",
      status: "planejado",
    },
    {
      id: `plan-3`,
      dayNumber: 3,
      dayLabel: "Sexta • 10/Out",
      theme: `Arquitetura Visual B2B: Por que Templates Genéricos Não Convertem Decisores`,
      hookHeadline: "Carrosséis amadores afastam clientes qualificados. Esta é a estrutura estética que gera autoridade.",
      format: "carousel",
      funnelStage: "meio",
      objective: "Educação estética e valorização da presença digital da marca.",
      viralAngle: "Desconstrução de frameworks visuais com contraste executivo.",
      ctaText: "Comente 'ESTRUTURA' para receber o checklist de design B2B.",
      status: "planejado",
    },
    {
      id: `plan-4`,
      dayNumber: 4,
      dayLabel: "Terça • 14/Out",
      theme: `Demonstração Executiva: A Tecnologia por Trás da ${brandName}`,
      hookHeadline: "Veja na prática como nossa plataforma transforma esforço manual em receita previsível.",
      format: "carousel",
      funnelStage: "fundo",
      objective: "Conversão direta e geração de oportunidades qualificadas.",
      viralAngle: "Telas de alta fidelidade e dados reais do ecossistema.",
      ctaText: "Toque no link da bio para solicitar um diagnóstico corporativo.",
      status: "planejado",
    },
  ];

  return {
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
 * Constrói posts sincronizados com o novo perfil da marca para o Feed do Instagram
 */
function buildSynchronizedFeedPosts(
  brandName: string,
  brandHandle: string,
  plan: EditorialPlanItem[]
): ScheduledPost[] {
  return plan.map((item, idx) => {
    const slideHeadline = item.hookHeadline;
    const slides: CreativeSlide[] = [
      {
        slideNumber: 1,
        headline: slideHeadline,
        bodyText: `Como líderes e executivos estruturam ${item.theme} com excelência prática.`,
        imageUrl: `/api/marketing/render-slide?slide=1&total=5&headline=${encodeURIComponent(
          slideHeadline
        )}&body=${encodeURIComponent(
          `Estratégia executiva desenvolvida para ${brandName}.`
        )}&format=carousel`,
        tag: "DIAGNÓSTICO",
      },
      {
        slideNumber: 2,
        headline: "O Ponto Crítico da Operação",
        bodyText:
          "Sem processos desenhados e telemetria clara, sua equipe gasta energia em gargalos evitáveis.",
        imageUrl: `/api/marketing/render-slide?slide=2&total=5&headline=${encodeURIComponent(
          "O Ponto Critico da Operacao"
        )}&body=${encodeURIComponent(
          "Sem processos desenhados e telemetria clara sua equipe perde tracao."
        )}&format=carousel`,
        tag: "GARGALO",
      },
      {
        slideNumber: 3,
        headline: "O Método de Alavancagem",
        bodyText:
          "Substitua abordagens genéricas por cadências rigorosas e tecnologia que blinda o resultado.",
        imageUrl: `/api/marketing/render-slide?slide=3&total=5&headline=${encodeURIComponent(
          "O Metodo de Alavancagem"
        )}&body=${encodeURIComponent(
          "Substitua abordagens genericas por tecnologia de alta conversao."
        )}&format=carousel`,
        tag: "FRAMEWORK",
      },
      {
        slideNumber: 4,
        headline: "Execução Tática no Terreno",
        bodyText:
          "Implemente indicadores de progresso diários e elimine ruídos na transição de tarefas.",
        imageUrl: `/api/marketing/render-slide?slide=4&total=5&headline=${encodeURIComponent(
          "Execucao Tatica no Terreno"
        )}&body=${encodeURIComponent(
          "Implemente indicadores de progresso diarios e elimine ruidos."
        )}&format=carousel`,
        tag: "EXECUÇÃO",
      },
      {
        slideNumber: 5,
        headline: "Ação Estratégica Imediata",
        bodyText: `Conecte-se com a ${brandName} e acelere a transformação da sua esteira comercial.`,
        imageUrl: `/api/marketing/render-slide?slide=5&total=5&headline=${encodeURIComponent(
          "Acao Estrategica Imediata"
        )}&body=${encodeURIComponent(
          `Conecte-se com a ${brandName} para alcancar resultados de elite.`
        )}&format=carousel`,
        tag: "DECISÃO",
      },
    ];

    const cleanTag = brandName.replace(/[^a-zA-Z0-9]/g, "");

    return {
      id: `post-synced-${idx + 1}-${Date.now()}`,
      theme: item.theme,
      format: item.format,
      targetAudience: "Decisores B2B, CEOs e Diretores Comerciais",
      scheduledDate: item.dayLabel,
      status: idx === 0 ? "awaiting_approval" : "scheduled",
      hookHeadline: item.hookHeadline,
      bodyCopy: `${item.hookHeadline}\n\nNo mercado B2B moderno, o diferencial competitivo está na clareza dos processos e na consistência da entrega.\n\nConfira as lâminas deste carrossel preparadas pela ${brandName}.\n\n${item.ctaText}`,
      ctaText: item.ctaText,
      hashtags: [`#${cleanTag}`, "#EstrategiaB2B", "#GestaoExecutiva", "#Crescimento"],
      postCaption: `${item.hookHeadline}\n\nNo mercado corporativo, o que separa os líderes dos retardatários é a velocidade com que transformam diagnóstico em execução.\n\nArraste para o lado e confira os pontos críticos.\n\n${item.ctaText}\n\n#${cleanTag} #EstrategiaB2B #BlackLink`,
      slides,
      imageUrls: slides.map((s) => s.imageUrl || ""),
      createdAt: new Date().toISOString(),
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: DiagnosticRequestBody = await request.json();

    const brandName = body.name?.trim() || "Black Link";
    const brandHandle = body.instagram?.trim() || "@blklnk.com.br";
    const brandSite = body.website?.trim() || "https://blklnk.com";

    const geminiKey = process.env.GEMINI_API_KEY;
    let diagnosticResult: ParsedGeminiDiagnostic | null = null;
    let engineSource: "gemini_ai" | "synthetic_engine" = "synthetic_engine";

    // 1. Tenta análise real via Gemini com fallback inteligente entre os modelos
    if (geminiKey) {
      diagnosticResult = await callGeminiDiagnostic(geminiKey, {
        ...body,
        name: brandName,
        instagram: brandHandle,
        website: brandSite,
      });

      if (diagnosticResult) {
        engineSource = "gemini_ai";
      }
    }

    // 2. Se Gemini indisponível ou throttled, aciona o sintetizador dinâmico personalizado
    if (!diagnosticResult) {
      diagnosticResult = synthesizeDynamicDiagnostic({
        ...body,
        name: brandName,
        instagram: brandHandle,
        website: brandSite,
      });
      engineSource = "synthetic_engine";
    }

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
        `Análise executiva gerada para ${brandName} (${brandHandle}): Foco prioritário em contra-posicionamento de autoridade no feed do Instagram contra a média dos concorrentes.`,
      competitors: diagnosticResult.competitors || [],
      viralMethods: diagnosticResult.viralMethods || [],
      lastAnalyzedAt: nowFormatted,
    };

    const finalEditorialPlan = diagnosticResult.editorialPlan || [];

    // Constrói posts sincronizados para o feed do Instagram
    const synchronizedPosts = buildSynchronizedFeedPosts(
      brandName,
      brandHandle,
      finalEditorialPlan
    );

    return NextResponse.json({
      success: true,
      source: engineSource,
      companyProfile: {
        name: brandName,
        instagram: brandHandle,
        website: brandSite,
        niche: diagnosticResult.niche || body.niche || "SaaS Enterprise & Inteligência Comercial B2B",
        products:
          diagnosticResult.products ||
          body.products ||
          "CRM Enterprise, Radar Anti-Colisão, Estúdio de IA para Carrosséis",
        targetAudience:
          body.targetAudience || "CEOs, Diretores Comerciais e Líderes B2B",
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
        error: "Falha ao processar diagnóstico de inteligência competitiva.",
      },
      { status: 500 }
    );
  }
}
