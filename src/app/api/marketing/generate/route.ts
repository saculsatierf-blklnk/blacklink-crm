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
  positioningStrategy?: string,
  brandContext?: {
    brandName?: string;
    brandHandle?: string;
    isInfluencer?: boolean;
    niche?: string;
    products?: string;
  }
): Promise<ParsedAICopy | null> {
  const candidateModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  const slideCount = format === "story" ? 3 : format === "post" ? 1 : 5;
  const brandName = brandContext?.brandName || "Black Link";
  const brandHandle = brandContext?.brandHandle || "@blacklink.b2b";
  const isInfluencer = Boolean(brandContext?.isInfluencer);

  const prompt = isInfluencer
    ? `Você é o Estrategista Criativo de Conteúdo Viral e Retenção no Instagram para o criador ${brandName} (${brandHandle}).
Sua missão é desenvolver um carrossel de ${slideCount} lâminas de alta retenção sobre o tema informado, explorando o estilo autoral, bastidores, identificação imediata e contra-posicionamento contra posts engessados.

DIRETRIZES PARA CREATOR / INFLUENCER:
1. NARRATIVA & TOM DE VOZ:
   - Foco na persona autoral, espontaneidade, histórias sem filtro e conexão humana.
   - Destaque palavras-chave de impacto entre asteriscos duplos (ex: **bastidores**, **erro bizarro**).
   - Lâmina 1 (Gancho Viral): Pare o feed com um choque, curiosidade irresistível ou relato inusitado.
   - Lâmina 2: O ponto crítico da história onde tudo fugiu do controle.
   - Lâmina 3: A virada de chave / o que ninguém conta na internet.
   - Lâmina 4: O ensinamento ou identificação com quem assiste.
   - Lâmina 5: Chamada para ação com humor e convite para interagir nos comentários.

2. RECOMENDAÇÃO DE LAYOUT:
   - Escolha entre: "tweet", "podcast-quote", "polaroid-retro", "split", "minimal".

BRIEFING:
- Criador: "${brandName}" (${brandHandle})
- Tema: "${theme}"
- Público: "${targetAudience || "Seguidores e audiência do Instagram"}"
- Nicho: "${brandContext?.niche || "Entretenimento & Criador de Conteúdo"}"

Responda ESTRITAMENTE em formato JSON puro:
{
  "suggestedLayout": "tweet",
  "suggestedFont": "syne",
  "suggestedTheme": "dark-industrial",
  "competitorInsight": {
    "competitorCliché": "Criadores concorrentes reciclam piadas batidas e vídeos sem conexão autoral.",
    "ourDifferentiator": "Autenticidade crua, situações reais de bastidores e conexão direta com a comunidade.",
    "layoutRationale": "O layout dinâmico quebra o feed com visual nativo do Instagram."
  },
  "hookHeadline": "Headline de parada de rolagem com **destaque**",
  "bodyCopy": "Legenda completa do post pronta para publicação com hashtags",
  "ctaText": "Comente o que você achou e envie para um amigo!",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
  "postCaption": "Legenda completa com quebras de linha e hashtags",
  "slides": [
    {
      "slideNumber": 1,
      "tag": "GANCHO VIRAL",
      "headline": "Título da lâmina com **destaque**",
      "bodyText": "Texto envolvente e direto de 2 a 3 linhas",
      "visualPrompt": "Aesthetic minimal visual"
    }
  ]
}`
    : `Você é o Diretor Criativo e Estrategista Chefe de Posicionamento da ${brandName} (${brandHandle}).
Sua missão é desenvolver um carrossel de marketing de altíssima conversão sobre o tema informado, com foco cirúrgico em CONTRA-POSICIONAMENTO e ANÁLISE COMPETITIVA no Instagram.

DIRETRIZES DE INTELIGÊNCIA COMPETITIVA & CONTRA-POSICIONAMENTO NO INSTAGRAM:
1. ANÁLISE DE CONCORRENTES NO INSTAGRAM:
   - Diagnostique o que a média dos concorrentes do nicho posta sobre esse tema no feed: conselhos rasos, posts com templates batidos do Canva, definições teóricas que não geram resultado de negócios.
   - Referências de Concorrentes informadas: "${competitorsReferences || "Perfis convencionais e tradicionais do setor no Instagram"}"
   - Ângulo de Posicionamento solicitado: "${positioningStrategy || "Anti-Consenso / Autoridade Prática"}"

2. CONTRA-POSICIONAMENTO:
   - Use palavras-chave com destaque tipográfico entre asteriscos duplos (ex: **alavancagem**, **precisão cirúrgica**).
   - Construa um carrossel progressivo de ${slideCount} lâminas:
     * Lâmina 1 (Gancho Provocativo): Destrua a premissa rasa ou o conselho clichê dos concorrentes com uma verdade desconfortável.
     * Lâmina 2 (O Gargalo Oculto): Mostre o custo invisível ou o erro estrutural que as outras empresas ignoram.
     * Lâmina 3 (O Método Superior): Apresente o framework analítico ou tese proprietária da ${brandName}.
     * Lâmina 4 (Execução Tática): Passo a passo denso e acionável sem enrolação.
     * Lâmina 5 (Conclusão & CTA): Síntese executiva e chamada para ação clara direcionada a ${brandHandle}.

3. RECOMENDAÇÃO DE LAYOUT GRÁFICO (QUEBRA DE PADRÃO NO FEED):
   - Escolha o modelo visual que mais se diferencia esteticamente no feed entre:
     "bento-grid", "dashboard-analytics", "minimal", "brutalista", "glass-floating", "wireframe-blueprint", "terminal", "magazine-cover", "apple-mockup".

BRIEFING EXECUTIVO:
- Marca / Empresa: "${brandName}" (${brandHandle})
- Nicho / Mercado: "${brandContext?.niche || "Soluções Corporativas Especializadas"}"
- Produtos / Soluções: "${brandContext?.products || "Linha de produtos corporativos de alta performance"}"
- Tema: "${theme}"
- Público-Alvo: "${targetAudience}"
- Formato: "${format}"
- Contexto de Campanhas Anteriores: "${recentContext}"

Responda ESTRITAMENTE em formato JSON (sem blocos de markdown em volta, apenas o JSON puro) com este formato exato:
{
  "suggestedLayout": "bento-grid",
  "suggestedFont": "space-grotesk",
  "suggestedTheme": "dark-industrial",
  "competitorInsight": {
    "competitorCliché": "A maioria dos concorrentes no Instagram apenas recomenda...",
    "ourDifferentiator": "Nós nos contra-posicionamos revelando que...",
    "layoutRationale": "O layout rompe o feed com blocos visuais de alta densidade e acabamento executivo superior aos templates amadores dos concorrentes."
  },
  "hookHeadline": "Título de alto impacto da peça com **destaque**",
  "bodyCopy": "Texto persuasivo completo para a legenda do post com quebras de linha",
  "ctaText": "Chamada para ação clara e direta",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
  "postCaption": "Legenda completa formatada pronta para publicação com hashtags",
  "slides": [
    {
      "slideNumber": 1,
      "tag": "DIAGNÓSTICO",
      "headline": "Título da lâmina com **destaque**",
      "bodyText": "Explicação densa e objetiva de 2 a 3 linhas",
      "visualPrompt": "Diretriz estética dark minimalista"
    }
  ]
}`;

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

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
  positioningStrategy?: string,
  brandContext?: {
    brandName?: string;
    brandHandle?: string;
    isInfluencer?: boolean;
    niche?: string;
    products?: string;
  }
): ParsedAICopy {
  const cleanTheme = theme.trim();
  const brandName = brandContext?.brandName || "Black Link";
  const brandHandle = brandContext?.brandHandle || "@blacklink.b2b";
  const audience =
    targetAudience?.trim() || "Decisores B2B, Gestores e Líderes de Negócios";

  // Identificação temática de palavras-chave para modulação do tom
  const lowerTheme = cleanTheme.toLowerCase();
  const contextStr = ((brandContext?.niche || "") + " " + (brandContext?.products || "") + " " + (brandContext?.brandName || "") + " " + lowerTheme).toLowerCase();

  const isMetalOrIndustry = Boolean(
    contextStr.includes("metal") ||
    contextStr.includes("aço") ||
    contextStr.includes("aco") ||
    contextStr.includes("estrutur") ||
    contextStr.includes("obra") ||
    contextStr.includes("galpão") ||
    contextStr.includes("galpao") ||
    contextStr.includes("fabricação") ||
    contextStr.includes("indústria")
  );

  const isInfluencer = Boolean(
    brandContext?.isInfluencer ||
    (!isMetalOrIndustry && (
      lowerTheme.includes("humor") ||
      lowerTheme.includes("gravac") ||
      lowerTheme.includes("meme") ||
      lowerTheme.includes("dia que") ||
      lowerTheme.includes("fui expulso") ||
      lowerTheme.includes("conteúdo sem filtro") ||
      lowerTheme.includes("bastidores sem filtro")
    ))
  );

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
    ourDifferentiator: `Contra-posicionamento estruturado pela equipe da ${brandName}: esteiras sólidas, mitigação de riscos e autoridade comprovada.`,
    layoutRationale: "O layout Bento Grid rompe o feed com blocos visuais de alta densidade e acabamento executivo superior aos templates amadores dos concorrentes.",
  };

  let slideList: Array<{
    slideNumber: number;
    tag: string;
    headline: string;
    bodyText: string;
    visualPrompt: string;
  }> = [];

  if (isInfluencer) {
    suggestedLayout = "tweet";
    suggestedFont = "syne";
    competitorInsight = {
      competitorCliché: "Criadores no Instagram apenas copiam tendências batidas de áudios em alta sem identidade própria.",
      ourDifferentiator: `${brandName}: Relatos genuínos de bastidores, histórias de choque/humor e conexão visceral com a comunidade.`,
      layoutRationale: "O layout Tweet Social confere autenticidade nativa de conversa informal, parando a rolagem pela leitura rápida.",
    };
    hookHeadline = `${cleanTheme}: O que Aconteceu nos **Bastidores**`;
    bodyCopy = `Nem tudo que acontece nas gravações vai para o ar de primeira.\n\n${cleanTheme} foi uma daquelas histórias que só quem viveu entende o nível do caos.\n\nArraste as lâminas para ver o relato completo e comente sua opinião!`;
    ctaText = `Siga ${brandHandle} e comente o que você faria nessa situação!`;

    slideList = [
      {
        slideNumber: 1,
        tag: "BASTIDORES REAIS",
        headline: `A Verdade sem Filtro sobre **${cleanTheme}**`,
        bodyText: `Relato autoral de ${brandName}: histórias de bastidores que quase ninguém tem coragem de contar na internet.`,
        visualPrompt: "Candid lifestyle photography with dramatic contrast and natural lighting",
      },
      {
        slideNumber: 2,
        tag: "O PONTO DE VIRADA",
        headline: "O Momento em que **Tudo Fugiu do Controle**",
        bodyText: "Quando você acha que tudo está correndo no padrão, acontece aquele imprevisto que muda o rumo de tudo.",
        visualPrompt: "Dynamic snapshot aesthetic, expressive visual tone",
      },
      {
        slideNumber: 3,
        tag: "A REVELAÇÃO",
        headline: "A Regra Oculta que **Poucos Entendem**",
        bodyText: "Por trás de cada post viral existe muito mais teste, erro e insistência do que perfeição planejada.",
        visualPrompt: "Authentic behind the scenes environment, retro ambient warmth",
      },
      {
        slideNumber: 4,
        tag: "O APRENDIZADO",
        headline: "O que Ficou de **Lição Real**",
        bodyText: "Manter sua autenticidade e conexão com quem te acompanha vale mais do que qualquer fórmula pronta de engajamento.",
        visualPrompt: "High-contrast clean typography on dark slate canvas",
      },
      {
        slideNumber: 5,
        tag: "INTERAÇÃO DIRETA",
        headline: "Comente Aqui: O que **Você Faria**?",
        bodyText: `Deixe seu comentário abaixo! Siga ${brandHandle} para acompanhar os bastidores e os próximos conteúdos sem censura.`,
        visualPrompt: "Bold minimalist closing slide with creator signature",
      },
    ];
  } else if (isMetalOrIndustry) {
    suggestedLayout = "wireframe-blueprint";
    suggestedFont = "jetbrains-mono";
    competitorInsight = {
      competitorCliché: "Concorrentes do setor industrial usam catálogos antiquados em PDF e publicam fotos de obras sem dados técnicos ou clareza de valor.",
      ourDifferentiator: `${brandName}: Engenharia de precisão com rastreabilidade total, tolerância milimétrica e prazos contratuais garantidos.`,
      layoutRationale: "O layout Blueprint Técnico transmite rigor de engenharia e autoridade fabril inquestionável para diretores de projetos e engenheiros.",
    };
    hookHeadline = `${cleanTheme}: Rigor Técnico e **Precisão Estrutural**`;
    bodyCopy = `Em projetos de grande porte, tolerância a imprevistos é zero.\n\nA ${brandName} projeta e fabrica soluções estruturais com controle milimétrico e rastreabilidade total de materiais.\n\nConfira as diretrizes técnicas detalhadas neste carrossel.`;
    ctaText = `Consulte a equipe da ${brandName} e solicite um estudo técnico para sua demanda.`;

    slideList = [
      {
        slideNumber: 1,
        tag: "DIAGNÓSTICO TÉCNICO",
        headline: `O Custo Oculto de Falhas em **${cleanTheme}**`,
        bodyText: `Por que fornecedores sem controle dimensional rigoroso causam atrasos em cadeia e como a ${brandName} blinda sua operação.`,
        visualPrompt: "Technical blueprint schematic, industrial precision, dark architectural lines",
      },
      {
        slideNumber: 2,
        tag: "O RISCO CRÍTICO",
        headline: "A Armadilha do **Preço Aparente vs Custo Real**",
        bodyText: "Economizar na fase inicial com fornecedores sem rastreabilidade pode dobrar o custo total com retrabalho no terreno.",
        visualPrompt: "Industrial steel components macro texture, technical contrast",
      },
      {
        slideNumber: 3,
        tag: "ENGENHARIA DE PRECISÃO",
        headline: "Padronização e **Tolerância Zero a Falhas**",
        bodyText: "Processos fabris com checagem rigorosa garantem que cada peça chegue pronta para montagem limpa e sem adaptações.",
        visualPrompt: "Sleek metallic CAD wireframe on deep dark background",
      },
      {
        slideNumber: 4,
        tag: "CRONOGRAMA BLINDADO",
        headline: "Execução no Terreno com **Prazo Assegurado**",
        bodyText: "Alinhamento contínuo entre produção industrial e equipes de campo para que o cronograma seja rigorosamente cumprido.",
        visualPrompt: "High-contrast technical documentation layout, clean typography",
      },
      {
        slideNumber: 5,
        tag: "SOLUÇÃO CORPORATIVA",
        headline: `Conecte-se com os Especialistas da **${brandName}**`,
        bodyText: `Fale com nossos engenheiros pelo link da bio em ${brandHandle} e receba um orçamento corporativo estruturado.`,
        visualPrompt: "Signature dark industrial closing card with corporate badge",
      },
    ];
  } else if (isMindset) {
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
      ourDifferentiator: `Posicionamento executivo da ${brandName}: cadência estrita, sem achismos e com margem preservada.`,
      layoutRationale: "O layout Bento Grid apresenta múltiplos blocos de informação hierarquizados, demonstrando autoridade visual inalcançável para concorrentes amadores.",
    };
    hookHeadline = `${cleanTheme}: O Dossiê Estratégico para **${audience}**`;
    bodyCopy = `O mercado corporativo moderno não tolera amadorismo ou execuções genéricas.\n\nPara liderar seu segmento em ${cleanTheme}, é indispensável combinar precisão tática, inteligência de posicionamento e processos previsíveis.\n\nConfira as diretrizes práticas detalhadas nas lâminas a seguir.`;
    ctaText = `Salve este carrossel e siga ${brandHandle} para mais análises estratégicas.`;

    slideList = [
      {
        slideNumber: 1,
        tag: "TESE CENTRAL",
        headline: `O Desafio Central de **${cleanTheme}**`,
        bodyText: `Por que as abordagens convencionais estão perdendo fôlego e o que a ${brandName} faz de diferente no mercado.`,
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
        tag: "FRAMEWORK",
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
        headline: `A Próxima Fronteira com a **${brandName}**`,
        bodyText: `Aplique este roteiro no seu negócio e acelere o alcance dos seus objetivos com máxima segurança.`,
        visualPrompt: "Pure black background #030303, bold contrasting typography, brand signature",
      },
    ];
  }

  const cleanTagTheme = cleanTheme.replace(/[^a-zA-Z0-9]/g, "");
  const cleanTagBrand = brandName.replace(/[^a-zA-Z0-9]/g, "");
  const hashtags = [
    `#${cleanTagTheme}`,
    `#${cleanTagBrand || "BlackLink"}`,
    "#AltaPerformance",
    "#InstagramGrowth",
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
      brandName,
      brandHandle,
      isInfluencer,
      niche,
      products,
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

    const rawBrand =
      body.brandContext && typeof body.brandContext === "object"
        ? body.brandContext
        : {};
    const brandContext = {
      brandName: (body.brandName || rawBrand.brandName)?.trim() || "Black Link",
      brandHandle: (body.brandHandle || rawBrand.brandHandle)?.trim() || "@blacklink.b2b",
      isInfluencer: Boolean(body.isInfluencer ?? rawBrand.isInfluencer),
      niche: (body.niche || rawBrand.niche)?.trim() || "",
      products: (body.products || rawBrand.products)?.trim() || "",
    };

    // 1. Resgate de Contexto Recente do Tenant com timeout rápido (não bloqueia a IA)
    let recentContext = explicitContext || "Nenhum histórico recente";
    try {
      const fetchHistoryWithTimeout = async () => {
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
            return recentCampaigns
              .map(
                (c, i) =>
                  `${i + 1}. Tema: "${c.theme}" (Headline: "${c.hookHeadline}")`
              )
              .join(" | ");
          }
        }
        return null;
      };

      const historyTimeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 1200)
      );
      const historyResult = await Promise.race([
        fetchHistoryWithTimeout(),
        historyTimeout,
      ]);
      if (historyResult) {
        recentContext = historyResult;
      }
    } catch (historyErr) {
      console.warn("Aviso ao resgatar histórico recente para contexto:", historyErr);
    }

    let resolvedCopy: ParsedAICopy | null = null;
    let sourceEngine: "n8n" | "gemini_direct" | "dynamic_synthesizer" =
      "dynamic_synthesizer";

    // 2. Tentativa Primária: IA Direta (Google Gemini com modelos ultra-rápidos e contexto de marca)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const directResult = await generateWithGeminiDirect(
          geminiKey,
          cleanTheme,
          cleanAudience,
          format,
          recentContext,
          competitorsReferences,
          positioningStrategy,
          brandContext
        );

        if (directResult && directResult.slides && directResult.slides.length > 0) {
          resolvedCopy = directResult;
          sourceEngine = "gemini_direct";
        }
      } catch (directErr) {
        console.warn("Falha ao gerar diretamente via Gemini:", directErr);
      }
    }

    // 3. Tentativa Secundária: Webhook do n8n (apenas se configurado explicitamente e não for o mock estático padrão)
    const rawWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const enableN8n = process.env.USE_N8N_GENERATOR === "true";
    if (!resolvedCopy && enableN8n && rawWebhookUrl && rawWebhookUrl.trim()) {
      const n8nWebhookUrl = rawWebhookUrl.replace("/webhook-test/", "/webhook/");
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);

        const n8nPayload = {
          theme: cleanTheme,
          recentContext,
          nicheValueProposition:
            nicheValueProposition || "Inteligência comercial e conversão B2B",
          targetAudience: cleanAudience,
          competitorsReferences: competitorsReferences || "Nenhuma informada",
          positioningStrategy: positioningStrategy || "anti-consenso",
          format,
          brandContext,
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
              const incomingSlides =
                n8nData.slides ||
                n8nData.carouselSlides ||
                n8nData.data?.slides;

              // Rejeita o mock estático do n8n onde o slide 2 é fixo como 'O Gargalo Invisível na Operação'
              const isStaticMock = Array.isArray(incomingSlides) && incomingSlides.some(
                (s: any) => s.headline?.includes("O Gargalo Invisível na Operação") || s.headline?.includes("A Estrutura de Domínio de Mercado")
              );

              if (Array.isArray(incomingSlides) && incomingSlides.length > 0 && !isStaticMock) {
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
        }
      } catch (webhookErr) {
        console.warn("n8n indisponível ou timeout, prosseguindo para gerador dinâmico:", webhookErr);
      }
    }

    // 4. Tentativa Terciária: Sintetizador Estratégico Dinâmico (Offline / Fallback Resiliente Instantâneo)
    if (!resolvedCopy) {
      resolvedCopy = generateDynamicStrategicCopy(
        cleanTheme,
        cleanAudience,
        format,
        competitorsReferences,
        positioningStrategy,
        brandContext
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
        positioningStrategy,
        brandContext
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
