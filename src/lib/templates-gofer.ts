import type { Lead } from "@/db/schema";

export type TemplatePhaseKey =
  | "contato_1"
  | "contato_2"
  | "promocao"
  | "orcamento_base"
  | "pos_orcamento";

export type TemplateChannel = "email" | "whatsapp" | "ligacao";

export interface GoferTemplate {
  key: TemplatePhaseKey;
  title: string;
  badge: string;
  subtitle: string;
  defaultForStatus: "new" | "negotiation" | "closed";
  email: {
    subject: string;
    body: string;
  };
  whatsapp: {
    text: string;
    objective: string;
  };
  ligacao: {
    objective: string;
    script: string;
    objection: string;
  };
}

export const GOFER_TEMPLATES: GoferTemplate[] = [
  {
    key: "contato_1",
    title: "1º Contato (Cold / Apresentação)",
    badge: "1º Contato",
    subtitle: "Apresentação e envio de catálogo sem enrolação",
    defaultForStatus: "new",
    email: {
      subject: "Apresentação e Catálogo - Gofer Metais (Fornecimento de Aço)",
      body: `Olá{Person_Suffix},

Sou o Lucas, da Gofer Metais. O meu objetivo com este e-mail é simples: queremos ter a oportunidade de participar na vossa próxima cotação de tubos, chapas e perfis de aço.

Segue em anexo a nossa apresentação e o catálogo completo. Garantimos máxima agilidade e preços altamente competitivos.

Podemos enviar os nossos valores sem compromisso na vossa próxima necessidade?

Um abraço e ótimo trabalho,

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Quebrar o gelo, entregar valor imediato (catálogo) e pedir permissão para cotar sem enrolação",
      text: `Olá{Person_Excl}! Aqui é o Lucas da Gofer Metais.
Somos distribuidores de aço e o meu objetivo hoje é claro: quero ter a oportunidade de participar da sua próxima cotação de tubos, chapas e perfis.
Segue o nosso catálogo em anexo. Podemos enviar os nossos valores sem compromisso na sua próxima demanda?`,
    },
    ligacao: {
      objective: "Abordagem telefônica de 20 segundos direta ao decisor de compras",
      script: `— Alô{Person_Suffix}? Aqui é o Lucas da Gofer Metais.
— Estou ligando rapidinho porque somos distribuidores de aço (tubos, chapas e perfis) e quero ter a oportunidade de cotar com a {Empresa}.
— Vocês têm alguma cotação em aberto hoje ou lista rodando nesta semana?`,
      objection: `Se disser que já tem fornecedor:
— "Perfeito{Person_Suffix}! A nossa ideia não é trocar o seu parceiro, mas ser o seu fornecedor de apoio para cobrir faltas e garantir que você pague o melhor preço. Posso te mandar o catálogo no WhatsApp agora?"`,
    },
  },
  {
    key: "contato_2",
    title: "2º Contato (Follow-up - 2 a 3 dias)",
    badge: "Follow-up (2 a 3 dias)",
    subtitle: "Confirmar recebimento e tentar puxar lista de materiais atual",
    defaultForStatus: "negotiation",
    email: {
      subject: "Re: Apresentação e Catálogo - Gofer Metais (Fornecimento de Aço)",
      body: `Olá{Person_Excl}! Tudo bem?

Passando apenas para confirmar se conseguiram analisar o nosso catálogo enviado anteriormente.

Têm alguma lista de materiais ou cotação em andamento neste momento para eu vos preparar um orçamento base, sem qualquer compromisso?

Fico à disposição.

Um abraço!

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Confirmar recebimento e tentar puxar uma lista de materiais atual",
      text: `Fala{Person_Excl}! Tudo bem? Passando rapidinho só para confirmar se você conseguiu dar uma olhada no nosso catálogo que enviei ontem.
Vocês têm alguma lista de materiais ou cotação em andamento por aí hoje para eu montar um orçamento base sem compromisso? Um abraço!`,
    },
    ligacao: {
      objective: "Cold Call de Follow-up para destravar a lista de peças",
      script: `— Fala{Person_Excl}! Tudo bem? Lucas da Gofer Metais.
— Liguei só para checar se você recebeu o catálogo que te mandei.
— Conseguiu ver nossos preços? Tem alguma lista de tubos ou perfis que você precisa orçar hoje na {Empresa}?`,
      objection: `Se disser "Ainda não vi":
— "Tranquilo! Tem alguma medida específica que você mais compra aí no mês? Eu já te passo o valor de cabeça agora pelo telefone."`,
    },
  },
  {
    key: "promocao",
    title: "3º Contato (Gatilho de Promoção)",
    badge: "Promoção 20x20",
    subtitle: "Gerar urgência com tubos galvanizados 20x20 a R$ 40,60",
    defaultForStatus: "negotiation",
    email: {
      subject: "Oportunidade: Promoção em Tubos Galvanizados - Gofer Metais",
      body: `Olá{Person_Excl}! Tudo ótimo por aí?

Queria avisar-vos em primeira mão que estamos com uma promoção excelente nos tubos galvanizados quadrados 20x20, a sair a R$ 40,60 (valor de retalho).

Lembro que, para compras em quantidade para a {Empresa}, consigo negociar e chegar a um preço ainda melhor.

Se precisarem deste ou de outros materiais para repor o stock, respondam a este e-mail.

Um abraço!

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Gerar senso de oportunidade e urgência com um item de alto giro",
      text: `Olá{Person_Excl}! Tudo ótimo por aí?
Queria te avisar em primeira mão que estamos com uma promoção excelente nos tubos galvanizados quadrados 20x20, saindo a R$ 40,60 (valor de varejo). Para compras em quantidade da {Empresa}, consigo negociar e chegar a um preço ainda melhor!
Se precisarem desse ou de outros materiais para repor o estoque, me dá um toque aqui.`,
    },
    ligacao: {
      objective: "Ligação de oportunidade e queima de lote direto da usina",
      script: `— Olá{Person_Excl}! Lucas da Gofer Metais.
— Estou ligando para os nossos principais parceiros porque abriu um lote promocional de tubo quadrado 20x20 galvanizado a R$ 40,60 no balcão, e para a {Empresa} em quantidade eu consigo fechar um valor especial.
— Quantas barras você consome em média por mês desse material?`,
      objection: `Se disser "Agora não preciso de 20x20":
— "Sem problema! Qual bitola ou perfil vocês estão consumindo mais agora? Eu verifico se consigo a mesma margem promocional nessa outra medida para você."`,
    },
  },
  {
    key: "orcamento_base",
    title: "Envio de Orçamento Base (Proativo)",
    badge: "Orçamento Base",
    subtitle: "Demonstrar proatividade e ancorar preços quando o cliente não tem lista",
    defaultForStatus: "closed",
    email: {
      subject: "O seu Orçamento Base - Gofer Metais",
      body: `Olá{Person_Excl}! Tudo bem?

Como ainda não tinham a lista exata, tomei a liberdade de montar um orçamento base (em anexo no PDF) com um mix dos itens que têm mais saída.

Este pacote inicial ficou num total de R$ {Valor}, já com os nossos preços bastante competitivos. Dê uma vista de olhos no arquivo!

O que acha de analisarmos juntos, ajustarmos as quantidades para a sua realidade e fecharmos esta primeira parceria?

Fico a aguardar!

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Demonstrar proatividade e ancorar preços competitivos",
      text: `Olá{Person_Excl}! Tudo bem? Como você ainda não tinha a lista exata, tomei a liberdade de montar um orçamento base (em anexo no PDF) com um mix dos itens que mais saem.
Esse pacote inicial ficou num total competitivo de R$ {Valor}. Dê uma olhada no arquivo! O que acha de ajustarmos as quantidades para a sua realidade e fecharmos essa primeira parceria?`,
    },
    ligacao: {
      objective: "Ligação para discutir o orçamento base montado",
      script: `— {Person_Name}, Lucas da Gofer Metais!
— Como você não tinha a lista fechada, eu montei uma simulação base de R$ {Valor} com o mix de tubos de maior saída.
— Conseguiu ver o PDF que te mandei? O que você achou das nossas ofertas?`,
      objection: `Se pedir desconto adicional:
— "Ajustando as quantidades para fechar o caminhão hoje, eu consigo te dar mais 3% e o frete cortesia. Vamos fechar?"`,
    },
  },
  {
    key: "pos_orcamento",
    title: "Follow-up Pós-Orçamento (Ajuste de Estoque)",
    badge: "Pós-Orçamento",
    subtitle: "Salvar a venda focando nos itens disponíveis a pronta-entrega",
    defaultForStatus: "closed",
    email: {
      subject: "O seu Orçamento de Aço - Gofer Metais",
      body: `Olá{Person_Excl}! Tudo bem?

O seu orçamento segue em anexo no PDF!

Só para sermos super transparentes: os únicos itens que não tínhamos na espessura exata que pediu foram {Itens em falta}. Eu incluí no orçamento a medida mais próxima que temos a pronta entrega ({Medida substituta}). Há algum problema em usar esta espessura na sua produção?

Os restantes materiais estão certinhos, conforme pediu.

Diga-me o que achou das nossas ofertas!

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Salvar a venda focando nos itens disponíveis com total transparência",
      text: `Fala{Person_Excl}! Orçamento na mão no PDF acima! 🚀
Só para sermos super transparentes: os únicos itens que não tínhamos na espessura exata que pediu foram ajustados. Eu incluí a medida mais próxima que temos a pronta entrega ({Medida substituta}). Tem algum problema para você usar essa espessura na sua produção?
Os outros tubos estão certinhos conforme você pediu! Me diz o que achou das nossas ofertas!`,
    },
    ligacao: {
      objective: "Alinhamento telefônico de prontidão e validação de medida",
      script: `— Fala{Person_Excl}! Lucas da Gofer Metais.
— Te enviei o orçamento agora. Só queria alinhar contigo rapidinho: os itens estão todos prontos, só a espessura de um deles que colocamos a medida mais próxima ({Medida substituta}) para te entregar amanhã mesmo.
— Essa medida atende a sua fábrica perfeitamente, né?`,
      objection: `Se disser que precisa exatamente da medida original:
— "Entendi perfeitamente! Nesse caso eu consigo pedir para a usina com prazo de 4 dias. Mas os outros itens você quer que já enviemos no primeiro caminhão para adiantar?"`,
    },
  },
];

/**
 * Extrai decisor/contato e empresa inteligentemente do lead
 */
export function extractLeadContext(lead?: Lead | null): {
  person: string;
  firstName: string;
  company: string;
  email: string;
  phone: string;
  cleanPhone: string;
  estimatedValue: string;
  location: string;
} {
  if (!lead) {
    return {
      person: "",
      firstName: "",
      company: "sua empresa",
      email: "",
      phone: "",
      cleanPhone: "",
      estimatedValue: "1.850,00",
      location: "",
    };
  }

  const cadenceState = (lead.cadenceState as any) || {};
  const rawName = (lead.leadName || "").trim();
  let person = (cadenceState.contactPerson || "").trim();
  let company = (cadenceState.companyName || "").trim();

  // Filtra nomes falsos ou placeholders (como Person, Peterson, etc.)
  if (/^(person|peterson|cliente|lead|contato)$/i.test(person)) {
    person = "";
  }

  if (!company || !person) {
    const parenMatch = rawName.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      const part1 = parenMatch[1].trim();
      const part2 = parenMatch[2].trim();

      const companyKeywords = ["redes", "metais", "aço", "estruturas", "serralheria", "ltda", "me", "eireli", "industria", "indústria", "comércio", "soluções", "construtora", "engenharia"];
      const isP1Company = companyKeywords.some((k) => part1.toLowerCase().includes(k));
      const isP2Company = companyKeywords.some((k) => part2.toLowerCase().includes(k));

      if (isP1Company && !isP2Company) {
        if (!company) company = part1;
        if (!person && !/^(person|peterson)$/i.test(part2)) person = part2;
      } else {
        if (!person && !/^(person|peterson)$/i.test(part1)) person = part1;
        if (!company) company = part2;
      }
    } else {
      if (!company) company = rawName;
    }
  }

  // Se o nome da pessoa for idêntico à empresa ou contiver sufixos de CNPJ, limpa
  if (person && (/ltda|eireli|s\/a|me\b/i.test(person) || person.toLowerCase() === company.toLowerCase())) {
    person = "";
  }

  // Extrai primeiro nome amigável
  let firstName = "";
  if (person) {
    const parts = person.split(" ").filter(Boolean);
    firstName = parts[0] || "";
    // Se o primeiro nome ainda for algo como "Sr.", pega o segundo
    if (/^(sr|sra|dr|dra)\.?$/i.test(firstName) && parts[1]) {
      firstName = parts[1];
    }
  }

  // Normaliza telefone para WhatsApp (apenas dígitos, garantindo DDI 55)
  let cleanPhone = (cadenceState.whatsapp || cadenceState.phone || lead.leadPhone || "").replace(/\D/g, "");
  if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
    cleanPhone = `55${cleanPhone}`;
  }

  const estimatedValue =
    cadenceState.estimatedValue ||
    (lead as any).estimatedValue ||
    "1.850,00";

  return {
    person,
    firstName,
    company: company || "sua empresa",
    email: (lead.leadEmail || "").trim(),
    phone: cadenceState.phone || lead.leadPhone || "",
    cleanPhone,
    estimatedValue,
    location: cadenceState.location || "",
  };
}

/**
 * Interpola um template substituindo as variáveis {Person}, {Empresa}, etc.
 * Inteligência de texto: se o nome não for conhecido, formata sem vírgulas sobrando ou nomes estranhos.
 */
export function interpolateGoferTemplateText(
  text: string,
  context: {
    person?: string;
    firstName?: string;
    company: string;
    estimatedValue?: string;
    itensEmFalta?: string;
    medidaSubstituta?: string;
  }
): string {
  const fName = context.firstName || (context.person && !/^(person|peterson)$/i.test(context.person) ? context.person.split(" ")[0] : "");

  const personSuffix = fName ? `, ${fName}` : "";
  const personExcl = fName ? `, ${fName}` : "";
  const personName = fName || "amigo";

  return text
    .replace(/{Person_Suffix}/g, personSuffix)
    .replace(/{Person_Excl}/g, personExcl)
    .replace(/{Person_Name}/g, personName)
    .replace(/{Person}/g, fName || "")
    .replace(/Olá, ,/g, "Olá,")
    .replace(/Olá, !/g, "Olá!")
    .replace(/Fala, !/g, "Fala!")
    .replace(/{Empresa}/g, context.company || "sua empresa")
    .replace(/{Valor}/g, context.estimatedValue || "1.850,00")
    .replace(/{Itens em falta}/g, context.itensEmFalta || "algumas bitolas específicas")
    .replace(/{Medida substituta}/g, context.medidaSubstituta || "a medida mais próxima a pronta entrega");
}
