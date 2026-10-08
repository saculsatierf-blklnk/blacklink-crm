import { NextRequest, NextResponse } from "next/server";
import type {
  DailyActivityItem,
  CreativeFormat,
} from "@/store/useMarketingStore";

export const dynamic = "force-dynamic";

export interface CadenceStrategyData {
  agentRole: string;
  strategyName: string;
  rationale: string;
  peakEngagementWindows: string[];
  recommendedVolume: string;
  targetPersonaHabits: string;
  lastOptimizedAt: string;
}

export interface AgendaDayData {
  index: number;
  shortName: string;
  fullName: string;
  dateNumber: string;
  monthStr: string;
  fullDateLabel: string;
  dayLabel: string;
  isToday: boolean;
  strategicFocus: string;
  activities: DailyActivityItem[];
}

export interface CadenceApiResponse {
  success: boolean;
  cadenceStrategy: CadenceStrategyData;
  weeklyAgenda: AgendaDayData[];
  source: "gemini_cadence_agent" | "dynamic_specialist_agent";
}

interface CadenceRequestBody {
  name?: string;
  instagram?: string;
  website?: string;
  niche?: string;
  products?: string;
  targetAudience?: string;
  profileType?: "company" | "influencer";
  accountStage?: "lancamento_zero" | "tracao" | "escala";
}

/**
 * Agente Especialista de IA em Cadência & Algoritmo Editorial do Instagram
 */
async function callGeminiCadenceAgent(
  body: CadenceRequestBody
): Promise<{ cadenceStrategy: CadenceStrategyData; weeklyAgenda: AgendaDayData[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const candidateModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ];

  const brandName = body.name?.trim() || "Empresa / Marca";
  const niche = body.niche?.trim() || "Mercado B2B / Geral";
  const products = body.products?.trim() || "Soluções e produtos da empresa";
  const audience = body.targetAudience?.trim() || "Tomadores de decisão e clientes ideais";
  const isCreator = body.profileType === "influencer";

  const isLaunchZero =
    body.accountStage === "lancamento_zero" ||
    !body.accountStage ||
    (brandName.toLowerCase().includes("black link") && (!body.instagram || body.instagram.includes("blacklink")));

  const prompt = `Você é o Agente Especialista em Cadência Editorial, Comportamento Algorítmico do Instagram e Engenharia de Atenção da Black Link.
Sua especialidade exclusiva é analisar o perfil da empresa ou criador e CALCULAR, PRESCREVER E DETERMINAR A CADÊNCIA IDEAL DE POSTAGENS PARA A SEMANA.

NÃO USE HORÁRIOS FIXOS GENÉRICOS (ex: 08:30, 12:00, 18:00 para todo mundo). 
VOCÊ É UM AGENTE ESPECIALISTA: Você deve calcular os horários exatos de pico de atenção, intervalos de leitura, momentos de menor concorrência no feed e rotina de consumo digital para ESTE segmento e persona específicos.

DADOS DO PERFIL ANALISADO:
- Nome: "${brandName}"
- Instagram: "${body.instagram || "N/A"}"
- Website: "${body.website || "N/A"}"
- Nicho / Mercado: "${niche}"
- Principais Produtos / Soluções: "${products}"
- Público-Alvo: "${audience}"
- Tipo de Perfil: "${isCreator ? "Criador de Conteúdo / Influencer" : "Empresa / Corporativo / B2B"}"
- Fase da Conta: "${isLaunchZero ? "MARCO ZERO (LANÇAMENTO DO ZERO • CONTA NOVA)" : body.accountStage || "Tração"}"

${
  isLaunchZero
    ? `
⚠️ DIRETRIZ CRÍTICA INEGOCIÁVEL — CONTA NOVA NO MARCO ZERO:
O perfil do Instagram está sendo INICIADO AGORA (0 seguidores prévios, começando do zero absoluto).
O conteúdo desta semana de largada DEVE SER ESTRITAMENTE DE LANÇAMENTO, FUNDAÇÃO E AUTORIDADE INICIAL:
1. Quarta (HOJE): O MANIFESTO DA MARCA (Por que a empresa existe, qual grande dor oculta do mercado veio resolver e declaração de princípios).
2. Quinta: A GRANDE TESE / O INIMIGO COMUM (Desmistificando o paradigma antigo do mercado e o erro que todos cometem).
3. Sexta: O NOVO PADRÃO / FRAMEWORK PROPRIETÁRIO (Apresentando a nova arquitetura e diferenciais da solução).
4. Sábado e Domingo: BASTIDORES & CULTURA DOS FUNDADORES (Por trás da engenharia e visão de futuro).
5. Início de semana: PARA QUEM É (E para quem NÃO é) + Convite para Membros Fundadores.
NUNCA prescreva rotinas operacionais avançadas ou casos de uso cotidianos que pressupõem audiência preexistente. O objetivo é construir a fundação da marca a partir do marco zero!
`
    : ""
}

RESPONSABILIDADES DO AGENTE:
1. Definir o Racional Estratégico da Cadência ("cadenceStrategy"):
   - Explique por que esses horários e formatos foram prescritos para esse nicho.
   - Defina as janelas de pico de engajamento (peakEngagementWindows).
   - Defina o volume recomendado na semana (recommendedVolume).
   - Analise os hábitos da persona (targetPersonaHabits).
2. Construir a Agenda Semanal Completa de 7 Dias ("weeklyAgenda"):
   - Dias: Segunda (06/Out), Terça (07/Out), Quarta (08/Out - HOJE), Quinta (09/Out), Sexta (10/Out), Sábado (11/Out), Domingo (12/Out).
   - Para cada dia, prescreva de 2 a 3 atividades estratégicas no Instagram.
   - Para CADA atividade, determine:
     * "time": Horário cirúrgico calculado pela IA (ex: "07:45", "11:35", "13:10", "17:40", "19:15", "20:30", etc.).
     * "period": "manha" | "tarde" | "noite".
     * "format": "story" | "carousel" | "post".
     * "funnelStage": "topo" | "meio" | "fundo".
     * "theme": Tema específico alinhado aos produtos da empresa.
     * "hookHeadline": Gancho magnético de retenção da 1ª tela/lâmina.
     * "objective": Objetivo estratégico no funil.
     * "ctaText": Chamada para ação.
     * "aiRationale": O motivo algorítmico pelo qual VOCÊ (o Agente de IA) escolheu este horário e este formato específico para este dia da semana.

Responda ESTRITAMENTE em formato JSON puro com esta estrutura:
{
  "cadenceStrategy": {
    "agentRole": "Agente Especialista em Cadência & Algoritmo Editorial",
    "strategyName": "Nome da Estratégia de Cadência Definida pelo Agente",
    "rationale": "Dossiê explicativo do Agente de IA justificando a distribuição de horários e formatos...",
    "peakEngagementWindows": [
      "07:45 - 08:30 • Janela Matinal",
      "11:45 - 13:00 • Pausa de Almoço",
      "17:30 - 19:00 • Retorno & Directs"
    ],
    "recommendedVolume": "14 Stories + 4 Carrosséis + 1 Post Único",
    "targetPersonaHabits": "Hábitos digitais mapeados da persona analisada...",
    "lastOptimizedAt": "08/10/2026 11:45"
  },
  "weeklyAgenda": [
    {
      "index": 0,
      "shortName": "SEG",
      "fullName": "Segunda-feira",
      "dateNumber": "06",
      "monthStr": "Out",
      "fullDateLabel": "Segunda-feira, 06 de Outubro de 2026",
      "dayLabel": "Segunda • 06/Out",
      "isToday": false,
      "strategicFocus": "Ativação & Quebra de Padrão Semanal",
      "activities": [
        {
          "id": "act-seg-1",
          "time": "07:45",
          "period": "manha",
          "format": "story",
          "funnelStage": "topo",
          "theme": "Tema...",
          "hookHeadline": "Gancho...",
          "objective": "Objetivo...",
          "ctaText": "CTA...",
          "aiRationale": "Horário com menor ruído no feed e pico de visualização antes das reuniões de alinhamento.",
          "status": "planejado"
        }
      ]
    }
  ]
}

Responda apenas com o JSON puro, sem markdown antes ou depois.`;

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 3500,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (!text) continue;

      const cleanJson = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (
        parsed &&
        parsed.cadenceStrategy &&
        Array.isArray(parsed.weeklyAgenda) &&
        parsed.weeklyAgenda.length >= 7
      ) {
        return parsed;
      }
    } catch (err) {
      console.warn(`Erro no modelo Gemini ${model} para cadência:`, err);
    }
  }

  return null;
}

/**
 * Sintetizador Especialista Dinâmico (Fallback Algorítmico do Agente)
 * Calibra horários e cadência de acordo com as características do nicho e persona
 */
function synthesizeCadenceSpecialist(body: CadenceRequestBody): {
  cadenceStrategy: CadenceStrategyData;
  weeklyAgenda: AgendaDayData[];
} {
  const brandName = body.name?.trim() || "Black Link";
  const niche = (body.niche || "").toLowerCase();
  const isCreator = body.profileType === "influencer";

  const isIndustrial =
    niche.includes("siderurg") ||
    niche.includes("metal") ||
    niche.includes("aço") ||
    niche.includes("obra") ||
    niche.includes("indústria");

  const isHealth =
    niche.includes("saúde") ||
    niche.includes("médic") ||
    niche.includes("clínica") ||
    niche.includes("odonto");

  // Calibração de Horários Ótimos pelo Agente de IA
  const morningTime = isIndustrial ? "07:15" : isCreator ? "09:45" : isHealth ? "08:15" : "07:50";
  const middayTime = isIndustrial ? "11:30" : isCreator ? "12:45" : isHealth ? "12:15" : "11:55";
  const eveningTime = isIndustrial ? "16:45" : isCreator ? "20:15" : isHealth ? "18:45" : "17:45";

  const isLaunchZero =
    body.accountStage === "lancamento_zero" ||
    !body.accountStage ||
    (brandName.toLowerCase().includes("black link") && (!body.instagram || body.instagram.includes("blacklink")));

  const strategyName = isLaunchZero
    ? "Estratégia de Lançamento & Marco Zero • Construção de Autoridade do Zero"
    : isCreator
    ? "Cadência Dinâmica de Retenção & Conexão Orgânica (Creator Focus)"
    : isIndustrial
    ? "Cadência Industrial B2B • Turno de Operação & Janela de Cotações"
    : isHealth
    ? "Cadência Clínica de Autoridade & Esclarecimento Médico"
    : "Cadência Executiva B2B • Retenção de Tomadores de Decisão";

  const rationale = isLaunchZero
    ? `Como o Instagram da ${brandName} está sendo iniciado agora (Marco Zero), a esteira desta primeira semana não assume audiência consolidada ou pautas hiper-operacionais de rotina. A estratégia prioriza a construção da fundação: o Manifesto oficial da marca, a Grande Tese contra o mercado tradicional, a Nova Arquitetura de telemetria e o convite exclusivo para os Primeiros Membros Fundadores.`
    : isCreator
    ? `O algoritmo do Instagram favorece criadores que ativam os Stories por volta das ${morningTime} e alimentam o feed às ${middayTime}, quando a audiência está no almoço. À noite (${eveningTime}), a taxa de interação e envio de Directs atinge o pico máximo.`
    : isIndustrial
    ? `Compradores, engenheiros e gestores de obras iniciam a checagem de suprimentos muito cedo (por volta das ${morningTime}). O pico de tomada de decisão de cotação ocorre às ${middayTime}. No final da tarde (${eveningTime}), as equipes revisam o cronograma do dia seguinte.`
    : `Líderes e executivos C-Level possuem janelas restritas de atenção: checam o feed antes do primeiro compromisso às ${morningTime}, consomem carrosséis densos e técnicos no intervalo do meio-dia às ${middayTime}, e respondem a abordagens e materiais às ${eveningTime}.`;

  const peakWindows = isLaunchZero
    ? [
        "08:15 • Abertura Matinal & Anúncio de Fundação",
        "11:45 • Post Principal do Feed (Pico de Atenção)",
        "18:00 • Bastidores & Conexão no Direct",
      ]
    : isIndustrial
    ? [
        `${morningTime} • Abertura de Turno & Verificação de Estoque`,
        `${middayTime} • Janela Decisória de Cotação de Materiais`,
        `${eveningTime} • Encerramento de Obras & Planejamento`,
      ]
    : isCreator
    ? [
        `${morningTime} • Quebra de Rotina & Stories Autoriais`,
        `${middayTime} • Pico de Rolagem no Feed no Almoço`,
        `${eveningTime} • Noite: Maior Tempo de Retenção & Directs`,
      ]
    : [
        `${morningTime} • Leitura Rápida Pré-Expediente (Menor Ruído)`,
        `${middayTime} • Pico de Leitura de Conteúdo Técnico no Feed`,
        `${eveningTime} • Fechamento de Dia & Abertura para Directs`,
      ];

  const habits = isLaunchZero
    ? "Público inicial em fase de descoberta, valorizando teses transparentes, visão fundadora e estética de alto impacto."
    : isCreator
    ? "Audiência jovem e engajada, com consumo contínuo nos Stories ao longo da tarde e noite."
    : isIndustrial
    ? "Compradores e engenheiros técnicos focados em agilidade, pronta-entrega e dados de especificação."
    : "Diretores, CEOs e tomadores de decisão com aversão a posts genéricos e alta valorização de dados reais.";

  const nowFormatted = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cadenceStrategy: CadenceStrategyData = {
    agentRole: "Agente Especialista em Cadência & Algoritmo Editorial",
    strategyName,
    rationale,
    peakEngagementWindows: peakWindows,
    recommendedVolume: isLaunchZero
      ? "14 Stories de Fundação + 3 Carrosséis de Manifesto + 1 Post de Posicionamento"
      : "14 Stories de Engajamento + 4 Carrosséis Estratégicos + 1 Post de Impacto",
    targetPersonaHabits: habits,
    lastOptimizedAt: nowFormatted,
  };

  const dayLabels = isLaunchZero
    ? [
        { short: "SEG", full: "Segunda-feira", num: "06", focus: "Ativação Semanal • Ecossistema Black Link" },
        { short: "TER", full: "Terça-feira", num: "07", focus: "A Nova Arquitetura de Velocidade Comercial" },
        { short: "QUA", full: "Quarta-feira", num: "08", focus: "Marco Zero & Manifesto Oficial (HOJE)" },
        { short: "QUI", full: "Quinta-feira", num: "09", focus: "A Grande Tese & O Problema Invisível" },
        { short: "SEX", full: "Sexta-feira", num: "10", focus: "Para Quem É & Convite de Membro Fundador" },
        { short: "SÁB", full: "Sábado", num: "11", focus: "Cultura, Princípios & Bastidores da Engenharia" },
        { short: "DOM", full: "Domingo", num: "12", focus: "Visão de Futuro & Próxima Semana" },
      ]
    : [
        { short: "SEG", full: "Segunda-feira", num: "06", focus: "Atração & Quebra de Paradigma" },
        { short: "TER", full: "Terça-feira", num: "07", focus: "Processos & Engenharia de Solução" },
        { short: "QUA", full: "Quarta-feira", num: "08", focus: "Casos Práticos & Telemetria (HOJE)" },
        { short: "QUI", full: "Quinta-feira", num: "09", focus: "Métricas & Eficiência Operacional" },
        { short: "SEX", full: "Sexta-feira", num: "10", focus: "Autoridade Visual & Frameworks" },
        { short: "SÁB", full: "Sábado", num: "11", focus: "Cultura, Princípios & Liderança" },
        { short: "DOM", full: "Domingo", num: "12", focus: "Planejamento & Abertura da Semana" },
      ];

  const weeklyAgenda: AgendaDayData[] = dayLabels.map((d, idx) => {
    const isToday = idx === 2; // Quarta 08/Out
    const stage: "topo" | "meio" | "fundo" =
      idx === 0 || idx === 5 ? "topo" : idx === 6 ? "fundo" : "meio";

    if (isLaunchZero) {
      if (isToday) {
        return {
          index: idx,
          shortName: d.short,
          fullName: d.full,
          dateNumber: d.num,
          monthStr: "Out",
          fullDateLabel: `${d.full}, ${d.num} de Outubro de 2026 (HOJE)`,
          dayLabel: `${d.short} • ${d.num}/Out`,
          isToday: true,
          strategicFocus: d.focus,
          activities: [
            {
              id: `act-${d.short.toLowerCase()}-1`,
              time: "08:15",
              period: "manha",
              format: "story",
              funnelStage: "topo",
              theme: `Marco Zero: O Início Oficial da ${brandName} no Instagram`,
              hookHeadline: "Estamos abrindo as portas do nosso canal oficial. O que você verá por aqui a partir de hoje.",
              objective: "Boas-vindas à fundação e abertura do espaço oficial no Instagram.",
              ctaText: "Acompanhe nossos stories hoje para conhecer a visão por trás da marca.",
              aiRationale: "Calibrado para as 08:15: primeiro contato matinal da audiência com o anúncio de fundação da conta.",
              status: "planejado",
            },
            {
              id: `act-${d.short.toLowerCase()}-2`,
              time: "11:45",
              period: "tarde",
              format: "carousel",
              funnelStage: "topo",
              theme: `O MANIFESTO: Por que o mercado corporativo de CRM precisava ser reinventado`,
              hookHeadline: "Por que o mercado corporativo de CRM falhou e o que viemos construir.",
              objective: "Manifesto da marca, a tese central e a razão pela qual a Black Link foi criada.",
              ctaText: `Salve este post e siga ${body.instagram || "@blacklink.com.br"} para acompanhar a revolução desde o Marco Zero.`,
              aiRationale: "Prescrito para as 11:45 pelo Agente de IA: o post manifesto da conta nova precisa de máxima retenção no almoço de quarta-feira.",
              status: "planejado",
            },
            {
              id: `act-${d.short.toLowerCase()}-3`,
              time: "18:00",
              period: "noite",
              format: "story",
              funnelStage: "meio",
              theme: `Bastidores do Lançamento: Revelando as primeiras diretrizes da plataforma`,
              hookHeadline: "Nosso post manifesto está no ar. Veja o que preparamos para os próximos dias...",
              objective: "Direcionamento para o feed e conexão com os primeiros seguidores da conta.",
              ctaText: "Deixe sua pergunta na caixinha: qual é a maior dor comercial que sua equipe enfrenta hoje?",
              aiRationale: "Agendado para as 18:00: encerramento do expediente, momento de maior abertura para interação em caixinhas de perguntas.",
              status: "planejado",
            },
          ],
        };
      }

      if (idx === 3) {
        // Quinta
        return {
          index: idx,
          shortName: d.short,
          fullName: d.full,
          dateNumber: d.num,
          monthStr: "Out",
          fullDateLabel: `${d.full}, ${d.num} de Outubro de 2026`,
          dayLabel: `${d.short} • ${d.num}/Out`,
          isToday: false,
          strategicFocus: d.focus,
          activities: [
            {
              id: `act-${d.short.toLowerCase()}-1`,
              time: "08:30",
              period: "manha",
              format: "story",
              funnelStage: "topo",
              theme: "Enquete de Fundação: Qual o maior gargalo da sua operação comercial hoje?",
              hookHeadline: "Planilhas lentas, follow-ups perdidos ou falta de previsão de receita?",
              objective: "Coleta de dados da audiência e engajamento inicial.",
              ctaText: "Vote na enquete e participe do diagnóstico.",
              aiRationale: "Horário matinal excelente para quebra de rotina e interação em enquetes rápidas.",
              status: "planejado",
            },
            {
              id: `act-${d.short.toLowerCase()}-2`,
              time: "12:00",
              period: "tarde",
              format: "carousel",
              funnelStage: "meio",
              theme: "A MENTIRA DO PIPELINE: Por que entupir o CRM de reuniões não fecha contratos",
              hookHeadline: "A maior mentira que te contaram sobre vendas B2B.",
              objective: "Desmistificar volume cego e apresentar a necessidade de telemetria preditiva de fechamento.",
              ctaText: "Compartilhe com a liderança comercial da sua empresa.",
              aiRationale: "Horário nobre de consumo de carrosséis analíticos no intervalo de almoço.",
              status: "planejado",
            },
            {
              id: `act-${d.short.toLowerCase()}-3`,
              time: "18:15",
              period: "noite",
              format: "story",
              funnelStage: "meio",
              theme: "Respondendo aos primeiros feedbacks e diretos da fundação",
              hookHeadline: "Recebemos várias reflexões sobre o manifesto de ontem...",
              objective: "Construção de relacionamento próximo com os primeiros seguidores.",
              ctaText: "Mande uma mensagem no Direct.",
              aiRationale: "Janela de encerramento de expediente com alta taxa de conversão em conversas privadas.",
              status: "planejado",
            },
          ],
        };
      }
    }

    return {
      index: idx,
      shortName: d.short,
      fullName: d.full,
      dateNumber: d.num,
      monthStr: "Out",
      fullDateLabel: `${d.full}, ${d.num} de Outubro de 2026${isToday ? " (HOJE)" : ""}`,
      dayLabel: `${d.short} • ${d.num}/Out`,
      isToday,
      strategicFocus: d.focus,
      activities: [
        {
          id: `act-${d.short.toLowerCase()}-1`,
          time: morningTime,
          period: "manha",
          format: "story",
          funnelStage: stage === "fundo" ? "meio" : stage,
          theme: `Enquete de Abertura: Diagnóstico de Rotina para ${brandName}`,
          hookHeadline: `O maior desafio que você enfrenta nesta ${d.full.toLowerCase()}...`,
          objective: "Ativação de engajamento matinal sem atrito e coleta de intenção da audiência.",
          ctaText: "Vote na enquete e ative o lembrete para a pauta principal.",
          aiRationale: `Calibrado para as ${morningTime}: horário em que a persona checa o celular antes de iniciar compromissos, garantindo retenção inicial nos Stories.`,
          status: isToday ? "planejado" : "planejado",
        },
        {
          id: `act-${d.short.toLowerCase()}-2`,
          time: middayTime,
          period: "tarde",
          format: idx === 3 || idx === 5 ? "post" : "carousel",
          funnelStage: stage,
          theme: isToday
            ? `O MANIFESTO: Por que o mercado corporativo de CRM falhou e o que viemos construir`
            : `Diretriz Estratégica: Como Escalar Resultados em ${body.niche || "Operações B2B"}`,
          hookHeadline: isToday
            ? `Por que o mercado corporativo de CRM falhou e o que viemos construir.`
            : `Por que as abordagens convencionais de mercado não funcionam mais.`,
          objective: "Comprovação de autoridade, dados de retenção e posicionamento técnico superior.",
          ctaText: "Salve este carrossel para consultar com sua equipe de liderança.",
          aiRationale: `Prescrito para as ${middayTime}: momento de pausa e maior tempo médio de retenção no feed, ideal para consumo de carrosséis de 5 a 7 lâminas.`,
          status: isToday ? "planejado" : "planejado",
        },
        {
          id: `act-${d.short.toLowerCase()}-3`,
          time: eveningTime,
          period: "noite",
          format: "story",
          funnelStage: stage,
          theme: `Bastidores & Respostas às Mensagens do Dia (${brandName})`,
          hookHeadline: "Recebemos várias dúvidas sobre a solução apresentada hoje...",
          objective: "Geração de demanda qualificada e encaminhamento direto para conversas no Direct.",
          ctaText: "Envie uma mensagem no Direct para receber nosso dossiê detalhado.",
          aiRationale: `Agendado para as ${eveningTime}: encerramento do expediente, quando tomadores de decisão respondem a mensagens privadas com menor urgência corporativa.`,
          status: "planejado",
        },
      ],
    };
  });

  return { cadenceStrategy, weeklyAgenda };
}

export async function POST(req: NextRequest) {
  try {
    const body: CadenceRequestBody = await req.json();

    // 1. Tenta acionar o Agente de IA (Gemini)
    const geminiResult = await callGeminiCadenceAgent(body);
    if (geminiResult) {
      return NextResponse.json({
        success: true,
        cadenceStrategy: geminiResult.cadenceStrategy,
        weeklyAgenda: geminiResult.weeklyAgenda,
        source: "gemini_cadence_agent",
      });
    }

    // 2. Fallback inteligente do Especialista
    const specialistResult = synthesizeCadenceSpecialist(body);
    return NextResponse.json({
      success: true,
      cadenceStrategy: specialistResult.cadenceStrategy,
      weeklyAgenda: specialistResult.weeklyAgenda,
      source: "dynamic_specialist_agent",
    });
  } catch (err: any) {
    console.error("Erro na rota do Agente de Cadência:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Erro interno ao calcular cadência com IA",
      },
      { status: 500 }
    );
  }
}
