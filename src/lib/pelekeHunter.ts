/**
 * MOTOR HUNTER PELEKE • GOFER METAIS B2B
 * Arquitetura de prospecção outbound de alta conversão para distribuição de aço:
 * Baseado na metodologia de relevância imediata e atrito zero de Peleke Sengstacke (https://github.com/Peleke)
 *
 * Princípios do Hunter Peleke:
 * 1. Hook de 15 segundos: relevância instantânea sem enrolação comercial.
 * 2. Pergunta de fechamento binária e sem compromisso (low-friction CTA).
 * 3. Adaptação precisa ao tom de decisores industriais (compradores, serralheiros, engenheiros).
 * 4. Quebra de objeções clássicas de fornecimento de aço ("já tenho fornecedor", "manda por e-mail").
 */

import type { Lead } from "@/db/schema";
import { extractLeadContext } from "./templates-gofer";

export interface PelekePlaybook {
  phase: string;
  channel: "email" | "whatsapp" | "ligacao";
  headline: string;
  tacticalObjective: string;
  content: string;
  objectionKiller: string;
  pelekeNote: string;
}

export function generatePelekeCustomScript({
  lead,
  channel,
  phaseKey,
}: {
  lead?: Lead | null;
  channel: "email" | "whatsapp" | "ligacao";
  phaseKey: string;
}): PelekePlaybook {
  const ctx = extractLeadContext(lead);
  const firstName = ctx.person && ctx.person !== ctx.company && !/ltda|eireli|s\/a|me\b/i.test(ctx.person)
    ? ctx.person.split(" ")[0].trim()
    : "";

  const greeting = firstName ? `Olá, ${firstName}` : `Olá, equipe da ${ctx.company}`;

  if (channel === "ligacao") {
    if (phaseKey === "contato_1") {
      return {
        phase: "Cold Call de Abertura (15s Hook)",
        channel: "ligacao",
        headline: "Abertura Direta para Comprador / Serralheiro",
        tacticalObjective: "Pegar o decisor e validar se tem cotação de tubos ou perfis aberta.",
        content: `— Alô, ${firstName || "quem cuida das compras de aço na " + ctx.company}? Aqui é o Lucas da Gofer Metais.
— O motivo da minha ligação é bem rápido: somos distribuidores de tubos, chapas e perfis de aço, e quero ter a oportunidade de participar da sua próxima cotação.
— Vocês têm alguma lista de materiais rodando aí hoje ou previsão para esta semana?`,
        objectionKiller: `Se disser "Já temos fornecedor fixo":
— "Com certeza, ${firstName || "parceiro"}! Nosso papel não é tirar o seu fornecedor, mas ser a sua segunda via de cotação para garantir que você não pare obra por falta de material e sempre pague o melhor preço. Posso te mandar o catálogo no WhatsApp agora?"`,
        pelekeNote: "Hunter Peleke: Nunca pergunte 'tudo bem?'. Vá direto ao ponto de negócio nos primeiros 7 segundos.",
      };
    }

    if (phaseKey === "contato_2") {
      return {
        phase: "Cold Call de Follow-up (48h após envio)",
        channel: "ligacao",
        headline: "Cobrança Amigável de Cotação",
        tacticalObjective: "Destravar a lista de peças para orçar.",
        content: `— Fala, ${firstName || "tudo bem"}! Aqui é o Lucas da Gofer Metais.
— Liguei rapidinho só para confirmar se você conseguiu dar uma olhada no catálogo que te enviei no WhatsApp.
— Tem alguma demanda de tubos ou vigas aí na ${ctx.company} hoje para eu cotar sem compromisso para você ver nosso valor?`,
        objectionKiller: `Se disser "Ainda não olhei":
— "Sem problema nenhum! Vou te mandar um áudio de 15 segundos no WhatsApp destacando só as medidas que mais saem na sua região para facilitar. Combinado?"`,
        pelekeNote: "Hunter Peleke: Reduza a carga cognitiva do decisor. Não peça para ele ler 20 páginas, peça a lista dele.",
      };
    }

    return {
      phase: "Ligação de Cotação & Fechamento",
      channel: "ligacao",
      headline: "Fechamento de Orçamento com Pronta-Entrega",
      tacticalObjective: "Confirmar quantidades e travar o carregamento do caminhão.",
      content: `— ${firstName || "Tudo bem"}! Lucas da Gofer Metais.
— Estou com o seu orçamento de ${ctx.company} na tela no valor de R$ ${ctx.estimatedValue}. O material está separado no nosso pátio.
— Se fecharmos agora, consigo colocar na rota de entrega já para o próximo dia útil. Posso emitir o pedido?`,
      objectionKiller: `Se falar de preço da concorrência:
— "Me passa a diferença por quilo que vou bater na gerência agora para igualar ou cobrir e já liberar a sua carga."`,
      pelekeNote: "Hunter Peleke: Em B2B de aço, velocidade de entrega ganha de centavos por quilo. Destaque o prazo.",
    };
  }

  if (channel === "whatsapp") {
    if (phaseKey === "promocao") {
      return {
        phase: "Gatilho de Promoção Tubos 20x20",
        channel: "whatsapp",
        headline: "Oportunidade de Alto Giro",
        tacticalObjective: "Ativar compras com tubo quadrado galvanizado campeão de vendas.",
        content: `${greeting}! Tudo ótimo por aí?
Queria te avisar em primeira mão: estamos com um lote promocional excelente em tubos galvanizados quadrados 20x20 saindo a R$ 40,60 (valor de varejo). Para compras em volume da ${ctx.company}, consigo puxar ainda mais para baixo!
Se precisarem desse ou de outros perfis para reposição de estoque, me dá um toque aqui que já seguro o lote para vocês.`,
        objectionKiller: `Se o cliente visualizar e não responder:
Mande em seguida: "Consigo segurar essa condição até amanhã às 12h, tá bem? Um abraço!"`,
        pelekeNote: "Hunter Peleke: Urgência real de estoque gera resposta imediata.",
      };
    }

    return {
      phase: "Mensagem Direta de WhatsApp",
      channel: "whatsapp",
      headline: "Quebra de Gelo com Catálogo Instantâneo",
      tacticalObjective: "Obter permissão para participar da próxima cotação.",
      content: `${greeting}! Aqui é o Lucas da Gofer Metais.
Somos distribuidores de aço e meu objetivo é simples: quero ter a oportunidade de participar da próxima cotação de tubos, chapas e perfis da ${ctx.company}.
Segue nosso catálogo completo. Podemos enviar os nossos valores sem compromisso na sua próxima demanda?`,
      objectionKiller: `Pergunta de fechamento sem atrito: cliente só precisa responder 'Sim' para avançar.`,
      pelekeNote: "Hunter Peleke: Menos de 4 linhas no WhatsApp garantem 85%+ de taxa de leitura no mobile.",
    };
  }

  // E-mail
  return {
    phase: "E-mail Executivo Direto",
    channel: "email",
    headline: "Apresentação e Catálogo sem Fricção",
    tacticalObjective: "Colocar a Gofer Metais na lista de cotação do departamento de compras.",
    content: `${greeting},

Sou o Lucas, da Gofer Metais. O meu objetivo com este e-mail é simples: queremos ter a oportunidade de participar na próxima cotação de tubos, chapas e perfis de aço da ${ctx.company}.

Segue em anexo a nossa apresentação e catálogo completo. Garantimos agilidade de expedição e preços altamente competitivos.

Podemos enviar os nossos valores sem compromisso na vossa próxima necessidade?

Um abraço e ótimo trabalho,

Lucas de Freitas Leite
Gofer Metais — Distribuição de Aço
https://gofermetais.com.br/`,
    objectionKiller: `Assunto limpo e corporativo: 'Apresentação e Catálogo - Gofer Metais (Fornecimento de Aço)'`,
    pelekeNote: "Hunter Peleke: Assuntos que parecem comunicações internas têm 3x mais abertura do que marketing tradicional.",
  };
}
