import { NextRequest, NextResponse } from "next/server";
import type { GeneratedCreativeResult, CreativeSlide } from "@/store/useMarketingStore";
import { db } from "@/db/db";
import { scheduledPosts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { resolveTenantCompanyId } from "@/lib/auth/tenant";

export const dynamic = "force-dynamic";

/**
 * Interface auxiliar para extrair dados brutos de IA (n8n, Gemini ou gerador algorítmico)
 */
interface ParsedAICopy {
  hookHeadline?: string;
  bodyCopy?: string;
  ctaText?: string;
  hashtags?: string[];
  postCaption?: string;
  suggestedLayout?: string;
  suggestedFont?: string;
  suggestedTheme?: string;
  competitorInsight?: {
    competitorCliché: string;
    ourDifferentiator: string;
    layoutRationale: string;
  };
  slides?: Array<{
    slideNumber?: number;
    headline?: string;
    bodyText?: string;
    visualPrompt?: string;
    imageUrl?: string;
    tag?: string;
  }>;
}

/**
 * Gerador Direto via Google Gemini API (Multi-model fallback & Baixa Latência)
 * Equipado com Motor de Reconhecimento Competitivo no Instagram & Contra-Posicionamento
 */
async function generateWithGeminiDirect(
  apiKey: string,
  theme: string,
  targetAudience: string,
  format: string,
  recentContext: string,
  competitorsReferences?: string,
  positioningStrategy?: string
): Promise<ParsedAICopy | null> {
  const candidateModels = [
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-flash-latest",
  ];

  const slideCount = format === "story" ? 3 : format === "post" ? 1 : 5;

  const prompt = `Você é o Diretor Criativo e Estrategista Chefe de Posicionamento da Black Link (ecossistema premium B2B).
Sua missão é desenvolver um carrossel / peça de marketing de altíssima conversão sobre o tema informado, com foco cirúrgico em CONTRA-POSICIONAMENTO e ANÁLISE COMPETITIVA no Instagram.

DIRETRIZES DE INTELIGÊNCIA COMPETITIVA & CONTRA-POSICIONAMENTO NO INSTAGRAM:
1. ANÁLISE DE CONCORRENTES NO INSTAGRAM:
   - Diagnostique o que a média dos concorrentes / perfis do nicho posta sobre esse tema no feed do Instagram: conselhos rasos ("5 dicas para...", "o segredo do sucesso"), posts com templates batidos do Canva, definições teóricas que não geram resultado de negócios.
   - Referências de Concorrentes informadas: "${competitorsReferences || "Perfis convencionais e tradicionais do nicho no Instagram"}"
   - Ângulo de Posicionamento solicitado: "${positioningStrategy || "Anti-Consenso / Quebra de Mitos"}"

2. CONTRA-POSICIONAMENTO (COPIES & NARRATIVA DE ALTO IMPACTO):
   - Adote uma postura provocativa, pragmática e fundamentada em autoridade executiva (C-Level).
   - Use palavras-chave com destaque tipográfico entre asteriscos duplos (ex: **alavancagem**, **métrica de vaidade**) para renderização com a cor de destaque da marca.
   - Construa um carrossel progressivo de ${slideCount} lâminas:
     * Lâmina 1 (Gancho Provocativo): Destrua a premissa rasa ou o conselho clichê dos concorrentes com uma verdade desconfortável.
     * Lâmina 2 (O Gargalo Oculto): Mostre o custo invisível ou o erro estrutural que as outras contas ignoram.
     * Lâmina 3 (O Método Superior): Apresente o framework analítico ou tese proprietária que coloca o leitor à frente.
     * Lâmina 4 (Execução Tática): Passo a passo denso e acionável sem enrolação.
     * Lâmina 5 (Conclusão & CTA): Síntese executiva e chamada para ação clara.

3. RECOMENDAÇÃO DE LAYOUT GRÁFICO (QUEBRA DE PADRÃO NO FEED):
   - Escolha o modelo visual que mais se diferencia esteticamente da concorrência no feed entre:
     "bento-grid", "dashboard-analytics", "minimal", "brutalista", "glass-floating", "aura-gradient", "terminal", "magazine-cover", "apple-mockup".
   - Indique em "suggestedLayout" e explique em "layoutRationale" porque essa estética vence visualmente os concorrentes no feed.

BRIEFING EXECUTIVO:
- Tema: "${theme}"
- Público-Alvo: "${targetAudience}"
- Formato: "${format}"
- Concorrentes / Referências: "${competitorsReferences || "Concorrentes tradicionais do Instagram"}"
- Estratégia de Posicionamento: "${positioningStrategy || "Anti-Consenso"}"
- Contexto de Campanhas Anteriores: "${recentContext}"

Responda ESTRITAMENTE em formato JSON (sem blocos de markdown em volta, apenas o JSON puro) com este formato exato:
{
  "suggestedLayout": "bento-grid",
  "suggestedFont": "space-grotesk",
  "suggestedTheme": "dark-industrial",
  "competitorInsight": {
    "competitorCliché": "A maioria dos concorrentes no Instagram apenas recomenda...",
    "ourDifferentiator": "Nós nos contra-posicionamos revelando que...",
    "layoutRationale": "O layout Bento Grid rompe o feed com blocos visuais de alta densidade e acabamento executivo superior aos templates amadores dos concorrentes."
  },
  "hookHeadline": "Título de alto impacto da peça com **destaque**",
  "bodyCopy": "Texto persuasivo completo para a legenda do post com quebras de linha",
  "ctaText": "Chamada para ação clara e direta",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
  "postCaption": "Legenda completa formatada pronta para publicação com hashtags",
  "slides": [
    {
      "slideNumber": 1,
      "tag": "DIAGNOSTICO",
      "headline": "Título da lâmina com **destaque**",
      "bodyText": "Explicação densa e objetiva de 2 a 3 linhas",
      "visualPrompt": "Diretriz estética dark minimalista"
    }
  ]
}`;

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`Tentativa Gemini [${model}] falhou com status ${res.status}`);
        continue;
      }

      const resData = await res.json();
      const rawText =
        resData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!rawText) continue;

      const cleanJson = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ParsedAICopy;
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`Erro ao consultar modelo Gemini ${model}:`, err);
    }
  }

  return null;
}

/**
 * Sintetizador Estratégico Dinâmico (Fallback Resiliente e Customizado)
 * Constrói 5 lâminas específicas com base nas palavras-chave e essência do tema informado,
 * integrando motor de contra-posicionamento vs concorrentes do Instagram e sugestão de layout.
 */
function generateDynamicStrategicCopy(
  theme: string,
  targetAudience: string,
  format: string,
  competitorsReferences?: string,
  positioningStrategy?: string
): ParsedAICopy {
  const cleanTheme = theme.trim();
  const audience =
    targetAudience?.trim() || "Decisores B2B, Gestores e Líderes de Negócios";

  // Identificação temática de palavras-chave para modulação do tom
  const lowerTheme = cleanTheme.toLowerCase();
  const isTechOrAI =
    lowerTheme.includes("inteligência") ||
    lowerTheme.includes("ia") ||
    lowerTheme.includes("software") ||
    lowerTheme.includes("tech") ||
    lowerTheme.includes("automação") ||
    lowerTheme.includes("dados");
  const isFinance =
    lowerTheme.includes("caixa") ||
    lowerTheme.includes("financeir") ||
    lowerTheme.includes("margem") ||
    lowerTheme.includes("investiment") ||
    lowerTheme.includes("capital");
  const isHealth =
    lowerTheme.includes("saúde") ||
    lowerTheme.includes("médic") ||
    lowerTheme.includes("clínic") ||
    lowerTheme.includes("hospital");
  const isMindset =
    lowerTheme.includes("ilusão") ||
    lowerTheme.includes("mentalidade") ||
    lowerTheme.includes("trabalho duro") ||
    lowerTheme.includes("hábito") ||
    lowerTheme.includes("carreira");

  let hookHeadline = "";
  let bodyCopy = "";
  let ctaText = "";
  let suggestedLayout = "bento-grid";
  let suggestedFont = "space-grotesk";
  let suggestedTheme = "dark-industrial";
  let competitorInsight = {
    competitorCliché: "A maioria dos concorrentes no Instagram publica listas superficiais de dicas ou conselhos teóricos sem comprovação em dados.",
    ourDifferentiator: "Contra-posicionamento estruturado em esteiras corporativas, mitigação de riscos e alavancagem de receita comprovável.",
    layoutRationale: "O layout Bento Grid rompe o feed com blocos visuais de alta densidade e acabamento executivo superior aos templates amadores dos concorrentes.",
  };

  let slideList: Array<{
    slideNumber: number;
    tag: string;
    headline: string;
    bodyText: string;
    visualPrompt: string;
  }> = [];

  if (isMindset) {
    suggestedLayout = "minimal";
    suggestedFont = "syne";
    competitorInsight = {
      competitorCliché: "Perfis tradicionais do Instagram exaltam a 'cultura da exaustão' e postam frases motivacionais batidas sem alavancagem real.",
      ourDifferentiator: "Nosso posicionamento desconstrói o esforço cego e ensina sistemas de alto impacto onde 20% das decisões geram 80% do resultado.",
      layoutRationale: "O layout Minimalista Suíço cria um contraste imenso no feed carregado do Instagram, gerando parada de rolagem imediata pela elegância e espaço negativo.",
    };
    hookHeadline = `${cleanTheme}: A Fronteira entre **Esforço Cego** e Resultados de Elite`;
    bodyCopy = `O mercado glorifica a exaustão, mas grandes conquistas são desenhadas com alavancagem e discernimento.\n\nQuando você troca o volume desordenado por posicionamento cirúrgico, o retorno sobre a sua energia multiplica exponencialmente.\n\nConfira as lâminas deste carrossel para recalibrar a sua trajetória.`;
    ctaText = "Salve esta reflexão e compartilhe com quem precisa ajustar o foco estratégico.";

    slideList = [
      {
        slideNumber: 1,
        tag: "O PARADOXO",
        headline: `O Mito do **Volume Infinito** em ${cleanTheme}`,
        bodyText: "Gastar mais horas em uma direção desalinhada apenas acelera a distância do seu objetivo principal.",
        visualPrompt: "Monochrome architectural symmetry, minimal dark contrast, high-end editorial",
      },
      {
        slideNumber: 2,
        tag: "DIAGNÓSTICO",
        headline: "O Gargalo do **Esforço sem Alavanca**",
        bodyText: "Quando a sua produtividade depende exclusivamente do seu tempo presente, você constrói uma esteira frágil e estressante.",
        visualPrompt: "Subtle rays of ambient light cutting through titanium textures, dark backdrop",
      },
      {
        slideNumber: 3,
        tag: "FRAMEWORK",
        headline: "A Regra da **Alavancagem Crítica**",
        bodyText: "Identifique a alavanca que gera 80% do valor com 20% do atrito: sistemas, processos e decisões de alta clareza.",
        visualPrompt: "Clean geometric dark grid, sharp typography, refined graphite minimalism",
      },
      {
        slideNumber: 4,
        tag: "EXECUÇÃO",
        headline: "Execução com Foco e **Ritmo Sustentável**",
        bodyText: "Elimine o ruído superficial da rotina. Defina uma única prioridade não negociável por dia e proteja sua energia criativa.",
        visualPrompt: "Minimal modern workspace, matte dark slate surfaces, subtle focus lighting",
      },
      {
        slideNumber: 5,
        tag: "DECISÃO C-LEVEL",
        headline: "Sua Decisão para **Virar a Chave**",
        bodyText: "Qual tarefa do seu dia existe apenas para alimentar a sensação de ocupação sem gerar valor real?",
        visualPrompt: "Deep black background, bold contrasting typography, executive brand presence",
      },
    ];
  } else if (isHealth) {
    suggestedLayout = "glass-floating";
    suggestedFont = "jakarta";
    competitorInsight = {
      competitorCliché: "Contas de saúde no Instagram usam fotos saturadas de banco de imagem e textos técnicos excessivamente herméticos.",
      ourDifferentiator: "Posicionamento executivo que une velocidade diagnóstica, telemetria clínica moderna e respeito ao tempo do paciente.",
      layoutRationale: "O layout Glass 3D Flutuante projeta precisão biomédica e modernidade tecnológica sem o aspecto frio ou burocrático de clínicas convencionais.",
    };
    hookHeadline = `${cleanTheme}: Inovação Clínica sem Perder o **Toque Humano**`;
    bodyCopy = `A transformação no setor de saúde não é sobre substituir profissionais, mas sim empoderar decisões clínicas com máxima acurácia.\n\nAo integrar dados integrados e protocolos modernos, sua operação ganha velocidade diagnóstica e eleva a satisfação do paciente.\n\nArraste para o lado para conferir os pilares essenciais.`;
    ctaText = "Comente 'SAÚDE' para receber os estudos de caso mais recentes da área.";

    slideList = [
      {
        slideNumber: 1,
        tag: "CENÁRIO CLÍNICO",
        headline: `A Nova Realidade sobre **${cleanTheme}**`,
        bodyText: "A sobrecarga operacional e a fragmentação de registros drenam o tempo que deveria ser dedicado aos pacientes.",
        visualPrompt: "Futuristic clinical environment, dark navy and glass textures, clean minimal lighting",
      },
      {
        slideNumber: 2,
        tag: "GARGALO OCULTO",
        headline: "Onde as Operações Tradicionais **Colapsam**",
        bodyText: "Sistemas desconectados geram retrabalho administrativo e lentidão crítica no fluxo de atendimento.",
        visualPrompt: "Abstract data visualization in dark space, deep blues and titanium accents",
      },
      {
        slideNumber: 3,
        tag: "PROTOCOLO MODERNO",
        headline: "Interoperabilidade e **Telemetria Ágil**",
        bodyText: "A unificação de históricos e telemetria preditiva reduz erros e concede segurança imediata à equipe.",
        visualPrompt: "Sleek medical interface geometry, dark contrast, high precision graphic layout",
      },
      {
        slideNumber: 4,
        tag: "ROADMAP",
        headline: "Implementação em **Etapas Blindadas**",
        bodyText: "Inicie pelas triagens e tarefas repetitivas de agendamento antes de expandir para fluxos de média complexidade.",
        visualPrompt: "Minimal clinical workstation, ambient cyan edge light, matte dark materials",
      },
      {
        slideNumber: 5,
        tag: "DIRETORIA MÉDICA",
        headline: "O Próximo Salto da **Sua Instituição**",
        bodyText: "A sua estrutura está preparada para liderar ou continuará refém de métodos manuais do passado?",
        visualPrompt: "Executive medical branding layout, sharp typography on pure dark background",
      },
    ];
  } else if (isFinance) {
    suggestedLayout = "dashboard-analytics";
    suggestedFont = "jetbrains-mono";
    competitorInsight = {
      competitorCliché: "Concorrentes de finanças no Instagram postam fórmulas básicas de planilha e conselhos genéricos sobre 'cortar cafezinho'.",
      ourDifferentiator: "Posicionamento voltado para governança de liquidez, alocação cirúrgica de capital e proteção impiedosa da margem líquida B2B.",
      layoutRationale: "O layout Dashboard Analytics confere autoridade instantânea com KPIs, telemetria visual de dados e estética de terminal Bloomberg.",
    };
    hookHeadline = `${cleanTheme}: Protegendo a Margem e **Maximizando o Retorno**`;
    bodyCopy = `Crescimento acelerado sem previsibilidade de caixa é uma armadilha silenciosa.\n\nA verdadeira solidez corporativa reside na governança de fluxo e na alocação cirúrgica de recursos em canais validados.\n\nVeja neste carrossel os 5 passos para blindar sua operação financeira.`;
    ctaText = "Salve este carrossel para sua próxima reunião de diretoria financeira.";

    slideList = [
      {
        slideNumber: 1,
        tag: "RADIOGRAFIA",
        headline: `A Verdade sobre **${cleanTheme}**`,
        bodyText: "Receita é vaidade, lucro é sanidade e caixa é a única garantia de soberania no mercado corporativo.",
        visualPrompt: "Monochrome architectural vault, deep shadows and golden metallic hairline accents",
      },
      {
        slideNumber: 2,
        tag: "SANGRIA DE CAIXA",
        headline: "A Sangria Oculta de **Recursos e Margem**",
        bodyText: "Despesas fragmentadas e falta de clareza no CAC real distorcem a percepção de rentabilidade da liderança.",
        visualPrompt: "Minimalist dark dashboard geometry, precision chart lines on graphite surface",
      },
      {
        slideNumber: 3,
        tag: "PRINCÍPIO DE ELITE",
        headline: "A Regra da **Reserva Estratégica**",
        bodyText: "Manter tração com disciplina de alocação transforma períodos voláteis em janelas de expansão agressiva.",
        visualPrompt: "Dark luxury brutalist stone, precise typography, executive elegance",
      },
      {
        slideNumber: 4,
        tag: "TELEMETRIA",
        headline: "Controle de Indicadores em **Tempo Real**",
        bodyText: "Automatize a conciliação e monitore indicadores vitais diariamente, eliminando surpresas ao fechar o mês.",
        visualPrompt: "Cybersecurity datacenter panels, matte black finish with crisp typography",
      },
      {
        slideNumber: 5,
        tag: "PAUTA DE DIRETORIA",
        headline: "Ação Financeira **Imediata**",
        bodyText: "Revise hoje sua esteira de custos fixos e garanta autonomia financeira para os próximos trimestres.",
        visualPrompt: "High-contrast corporate signature slide, dark minimal branding",
      },
    ];
  } else if (isTechOrAI) {
    suggestedLayout = "bento-grid";
    suggestedFont = "space-grotesk";
    competitorInsight = {
      competitorCliché: "Contas de tecnologia no Instagram apenas compartilham listas genéricas de ferramentas de IA ou novidades superficiais.",
      ourDifferentiator: "Contra-posicionamento técnico de liderança: conectamos orquestração autônoma a ganhos reais de margem e redução de overhead.",
      layoutRationale: "O layout Bento Grid transmite densidade arquitetural de ponta (estilo Linear/Vercel), distanciando o criativo dos posts genéricos do feed.",
    };
    hookHeadline = `${cleanTheme}: Como Escalar Tecnologia com **Eficiência Real**`;
    bodyCopy = `Adotar ferramentas de última geração sem redesenhar os processos fundamentais apenas automatiza o caos.\n\nA liderança técnica precisa conectar inteligência de dados a ganhos reais de produtividade e margem comercial.\n\nAcompanhe os 5 passos estratégicos neste carrossel.`;
    ctaText = "Compartilhe este post com seu time de engenharia e produto.";

    slideList = [
      {
        slideNumber: 1,
        tag: "RADAR TECH",
        headline: `O Cenário Crítico em **${cleanTheme}**`,
        bodyText: "A rapidez com que novas soluções surgem exige filtros rigorosos para separar hype de impacto real nos negócios.",
        visualPrompt: "Dark matte computing architecture, subtle glowing conduits, titanium aesthetic",
      },
      {
        slideNumber: 2,
        tag: "O ERRO COMUM",
        headline: "O Gargalo da **Adoção Desordenada**",
        bodyText: "Acumular dezenas de ferramentas isoladas cria silos de informação e eleva custos sem resolver o problema raiz.",
        visualPrompt: "Monochrome industrial concrete and dark glass, high-end tech branding",
      },
      {
        slideNumber: 3,
        tag: "ARQUITETURA",
        headline: "Orquestração e **Fluxos Autônomos**",
        bodyText: "A virada de jogo ocorre ao integrar modelos de linguagem diretamente aos bancos de dados e esteiras operacionais.",
        visualPrompt: "Clean structured circuit-inspired lines on deep charcoal backdrop",
      },
      {
        slideNumber: 4,
        tag: "GOVERNANÇA",
        headline: "Garantia de Qualidade e **Governança**",
        bodyText: "Defina verificações automáticas e esteiras de contingência para manter estabilidade operacional contínua.",
        visualPrompt: "Minimal dark command terminal aesthetic, sharp modern sans-serif typography",
      },
      {
        slideNumber: 5,
        tag: "VISÃO DE CTO",
        headline: "O Futuro da sua **Infraestrutura**",
        bodyText: "Sua operação técnica trabalha para o seu crescimento ou você trabalha para manter a tecnologia funcionando?",
        visualPrompt: "Bold black-on-black aesthetic with crisp white typography and accent markers",
      },
    ];
  } else {
    // Domínio geral de negócios e alta performance B2B
    suggestedLayout = "bento-grid";
    suggestedFont = "bricolage";
    competitorInsight = {
      competitorCliché: "A maioria dos concorrentes de vendas e consultoria no Instagram posta conselhos rasos e recicla ideias batidas de 2020.",
      ourDifferentiator: "Nosso posicionamento trata fechamento corporativo como engenharia de receita: cadência estrita, sem achismos e com margem preservada.",
      layoutRationale: "O layout Bento Grid apresenta múltiplos blocos de informação hierarquizados, demonstrando autoridade visual inalcançável para concorrentes amadores.",
    };
    hookHeadline = `${cleanTheme}: O Dossiê Estratégico para **${audience}**`;
    bodyCopy = `O mercado corporativo moderno não tolera amadorismo ou execuções genéricas.\n\nPara liderar seu segmento em ${cleanTheme}, é indispensável combinar precisão tática, inteligência de posicionamento e processos previsíveis.\n\nConfira as diretrizes práticas detalhadas nas lâminas a seguir.`;
    ctaText = "Salve este carrossel e revise com sua equipe na próxima sessão de planejamento.";

    slideList = [
      {
        slideNumber: 1,
        tag: "TESE CENTRAL",
        headline: `O Desafio Central de **${cleanTheme}**`,
        bodyText: `Por que as abordagens convencionais estão perdendo fôlego e o que os líderes de mercado fazem de diferente.`,
        visualPrompt: "Minimal dark architectural structure, high-contrast typography, premium editorial",
      },
      {
        slideNumber: 2,
        tag: "DIAGNÓSTICO",
        headline: "A Fricção que **Impede a Tração**",
        bodyText: "Identifique onde a energia do time é desperdiçada em tarefas manuais que não geram diferenciação competitiva.",
        visualPrompt: "Dark stone surface with crisp ambient side-lighting and elegant geometric frames",
      },
      {
        slideNumber: 3,
        tag: "FRAMEWORK B2B",
        headline: "A Estrutura de **Domínio de Mercado**",
        bodyText: "Alinhe posicionamento de autoridade com esteiras de entrega consistentes para consolidar valor percebido.",
        visualPrompt: "Sleek dark layout with refined spacing, modern Swiss typography inspiration",
      },
      {
        slideNumber: 4,
        tag: "EXECUÇÃO CIRÚRGICA",
        headline: "Execução Consistente no **Terreno**",
        bodyText: "Transforme ideias estratégicas em rotinas diárias com métricas claras de progresso e alinhamento de equipe.",
        visualPrompt: "Matte graphite texture, minimalist line elements, executive visual tone",
      },
      {
        slideNumber: 5,
        tag: "CONVOCAÇÃO",
        headline: "A Próxima Fronteira de **Resultados**",
        bodyText: "Aplique este roteiro no seu negócio e acelere o alcance dos seus objetivos com máxima segurança.",
        visualPrompt: "Pure black background #030303, bold contrasting typography, Black Link signature",
      },
    ];
  }

  const cleanTagTheme = cleanTheme.replace(/[^a-zA-Z0-9]/g, "");
  const hashtags = [
    `#${cleanTagTheme}`,
    "#EstrategiaB2B",
    "#AltaPerformance",
    "#BlackLink",
    "#GestaoCorporativa",
  ];

  const postCaption = `${bodyCopy}\n\n${ctaText}\n\n${hashtags.join(" ")}`;

  return {
    hookHeadline,
    bodyCopy,
    ctaText,
    hashtags,
    postCaption,
    suggestedLayout,
    suggestedFont,
    suggestedTheme,
    competitorInsight,
    slides: slideList,
  };
}

/**
 * Endpoint de integração com o webhook do n8n e IA Direta para geração autônoma de criativos e copies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      theme,
      targetAudience,
      audience,
      competitorsReferences,
      positioningStrategy,
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

    const cleanTheme = theme.trim();
    const cleanAudience =
      (targetAudience || audience || "").trim() ||
      "Decisores B2B, Gestores e Líderes de Negócios";

    // 1. Resgate de Contexto Recente do Tenant para evitar amnésia da IA
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
            .map(
              (c, i) =>
                `${i + 1}. Tema: "${c.theme}" (Headline: "${c.hookHeadline}")`
            )
            .join(" | ");
        }
      }
    } catch (historyErr) {
      console.warn("Aviso ao resgatar histórico recente para contexto:", historyErr);
    }

    let resolvedCopy: ParsedAICopy | null = null;
    let sourceEngine: "n8n" | "gemini_direct" | "dynamic_synthesizer" =
      "dynamic_synthesizer";

    // 2. Tentativa Primária: Webhook do n8n (caso configurado e ativo)
    const rawWebhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      "http://localhost:5678/webhook/blacklink-marketing-generate";
    const n8nWebhookUrl = rawWebhookUrl.replace("/webhook-test/", "/webhook/");

    if (n8nWebhookUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8 segundos para evitar travamento da UI

        const n8nPayload = {
          theme: cleanTheme,
          recentContext,
          nicheValueProposition:
            nicheValueProposition || "Inteligência comercial e conversão B2B",
          targetAudience: cleanAudience,
          competitorsReferences: competitorsReferences || "Nenhuma informada",
          positioningStrategy: positioningStrategy || "anti-consenso",
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
          const rawResponseText = await n8nResponse.text();
          if (rawResponseText && rawResponseText.trim()) {
            let n8nData: any = null;
            try {
              n8nData = JSON.parse(rawResponseText);
            } catch {
              n8nData = null;
            }

            if (n8nData) {
              // Suporta tanto resposta direta do n8n quanto payloads aninhados
              const incomingSlides =
                n8nData.slides ||
                n8nData.carouselSlides ||
                n8nData.data?.slides;

              if (Array.isArray(incomingSlides) && incomingSlides.length > 0) {
                resolvedCopy = {
                  hookHeadline:
                    n8nData.hookHeadline ||
                    incomingSlides[0]?.headline ||
                    cleanTheme,
                  bodyCopy:
                    n8nData.bodyCopy ||
                    n8nData.postCaption ||
                    "Estratégia completa no carrossel.",
                  ctaText:
                    n8nData.ctaText ||
                    "Salve este conteúdo para consultar depois.",
                  hashtags: Array.isArray(n8nData.hashtags)
                    ? n8nData.hashtags
                    : ["#VendasB2B", "#BlackLink", "#AltaPerformance"],
                  postCaption:
                    n8nData.postCaption ||
                    `${n8nData.bodyCopy || ""}\n\n${n8nData.ctaText || ""}`.trim(),
                  suggestedLayout: n8nData.suggestedLayout,
                  suggestedFont: n8nData.suggestedFont,
                  suggestedTheme: n8nData.suggestedTheme,
                  competitorInsight: n8nData.competitorInsight,
                  slides: incomingSlides,
                };
                sourceEngine = "n8n";
              }
            }
          }
        } else {
          console.warn("Webhook n8n retornou status diferente de 200:", n8nResponse.status);
        }
      } catch (webhookErr) {
        console.warn("n8n indisponível ou com timeout, acionando gerador direto:", webhookErr);
      }
    }

    // 3. Tentativa Secundária: IA Direta (Google Gemini) se n8n não respondeu
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!resolvedCopy && geminiKey) {
      try {
        const directResult = await generateWithGeminiDirect(
          geminiKey,
          cleanTheme,
          cleanAudience,
          format,
          recentContext,
          competitorsReferences,
          positioningStrategy
        );

        if (directResult && directResult.slides && directResult.slides.length > 0) {
          resolvedCopy = directResult;
          sourceEngine = "gemini_direct";
        }
      } catch (directErr) {
        console.warn("Falha ao gerar diretamente via Gemini:", directErr);
      }
    }

    // 4. Tentativa Terciária: Sintetizador Estratégico Dinâmico (Offline / Fallback Resiliente)
    if (!resolvedCopy) {
      resolvedCopy = generateDynamicStrategicCopy(
        cleanTheme,
        cleanAudience,
        format,
        competitorsReferences,
        positioningStrategy
      );
      sourceEngine = "dynamic_synthesizer";
    }

    // 4.1 Enriquecimento Garantido de Inteligência Competitiva e Layout de Feed
    if (resolvedCopy && !resolvedCopy.competitorInsight) {
      const enrichment = generateDynamicStrategicCopy(
        cleanTheme,
        cleanAudience,
        format,
        competitorsReferences,
        positioningStrategy
      );
      resolvedCopy.competitorInsight = enrichment.competitorInsight;
      if (!resolvedCopy.suggestedLayout) {
        resolvedCopy.suggestedLayout = enrichment.suggestedLayout;
      }
      if (!resolvedCopy.suggestedFont) {
        resolvedCopy.suggestedFont = enrichment.suggestedFont;
      }
      if (!resolvedCopy.suggestedTheme) {
        resolvedCopy.suggestedTheme = enrichment.suggestedTheme;
      }
    }

    // 5. Construção e Normalização Final do Objeto do Carrossel
    const finalSlides: CreativeSlide[] = (resolvedCopy.slides || []).map(
      (slide, index) => {
        const slideNum = slide.slideNumber || index + 1;
        const total = resolvedCopy?.slides?.length || 5;
        const headline = slide.headline || `Insight ${slideNum}`;
        const bodyText = slide.bodyText || "";
        const tag = slide.tag || `LÂMINA ${slideNum}`;

        const query = new URLSearchParams({
          slide: String(slideNum),
          total: String(total),
          headline,
          body: bodyText,
          format,
        });

        const fallbackImages = [
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        ];

        return {
          slideNumber: slideNum,
          headline,
          bodyText,
          tag,
          visualPrompt:
            slide.visualPrompt ||
            "Dark minimal architectural contrast, high-resolution aesthetic",
          imageUrl:
            slide.imageUrl ||
            `/api/marketing/render-slide?${query.toString()}` ||
            fallbackImages[index % fallbackImages.length],
        };
      }
    );

    const hookHeadline =
      resolvedCopy.hookHeadline ||
      finalSlides[0]?.headline ||
      `Estratégia: ${cleanTheme}`;
    const bodyCopy =
      resolvedCopy.bodyCopy ||
      `Confira as diretrizes completas sobre ${cleanTheme} no carrossel.`;
    const ctaText =
      resolvedCopy.ctaText ||
      "Salve este conteúdo para consultar em suas próximas decisões estratégicas.";
    const hashtags = Array.isArray(resolvedCopy.hashtags)
      ? resolvedCopy.hashtags
      : [
          `#${cleanTheme.replace(/[^a-zA-Z0-9]/g, "")}`,
          "#EstrategiaB2B",
          "#BlackLink",
          "#AltaPerformance",
        ];
    const postCaption =
      resolvedCopy.postCaption ||
      `${bodyCopy}\n\n${ctaText}\n\n${hashtags.join(" ")}`;

    const result: GeneratedCreativeResult = {
      id: `cr-${Date.now()}`,
      theme: cleanTheme,
      format,
      targetAudience: cleanAudience,
      competitorsReferences: competitorsReferences || undefined,
      positioningStrategy: positioningStrategy || undefined,
      suggestedLayout: resolvedCopy.suggestedLayout || "bento-grid",
      suggestedFont: resolvedCopy.suggestedFont || "space-grotesk",
      suggestedTheme: resolvedCopy.suggestedTheme || "dark-industrial",
      competitorInsight: resolvedCopy.competitorInsight,
      hookHeadline,
      bodyCopy,
      ctaText,
      hashtags,
      postCaption,
      slides: finalSlides,
      imageUrls: finalSlides.map((s) => s.imageUrl || ""),
      createdAt: new Date().toISOString(),
      source: sourceEngine,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Erro interno no processamento de marketing:", err);
    return NextResponse.json(
      { error: "Falha interna ao processar o criativo de marketing." },
      { status: 500 }
    );
  }
}
