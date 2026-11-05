import type { Lead } from "@/db/schema";

export type TemplatePhaseKey =
  | "contato_1"
  | "contato_2"
  | "promocao"
  | "orcamento_base"
  | "pos_orcamento";

export type TemplateChannel = "email" | "whatsapp";

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
      body: `Olá, {Person},

Sou o Lucas, da Gofer Metais. O meu objetivo com este e-mail é simples: queremos ter a oportunidade de participar na vossa próxima cotação de tubos, chapas e perfis de aço.

Segue em anexo a nossa apresentação e o catálogo completo. Garantimos máxima agilidade e preços altamente competitivos.

Podemos enviar os nossos valores sem compromisso na vossa próxima necessidade?

Um abraço e ótimo trabalho,

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Quebrar o gelo, entregar catálogo e pedir permissão para cotar",
      text: `Olá, {Person}! Aqui é o Lucas da Gofer Metais.
Somos distribuidores de aço e o meu objetivo hoje é claro: quero ter a oportunidade de participar da sua próxima cotação de tubos, chapas e perfis.
Segue o nosso catálogo em anexo. Podemos enviar os nossos valores sem compromisso na sua próxima demanda?`,
    },
  },
  {
    key: "contato_2",
    title: "2º Contato (Follow-up Catálogo)",
    badge: "Follow-up (2 a 3 dias)",
    subtitle: "Confirmar recebimento e puxar cotação em andamento",
    defaultForStatus: "negotiation",
    email: {
      subject: "Re: Apresentação e Catálogo - Gofer Metais (Fornecimento de Aço)",
      body: `Olá, {Person}! Tudo bem?

Passando apenas para confirmar se conseguiram analisar o nosso catálogo enviado anteriormente.

Têm alguma lista de materiais ou cotação em andamento neste momento para eu vos preparar um orçamento base, sem qualquer compromisso?

Fico à disposição.

Um abraço!

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Confirmar recebimento e tentar puxar lista de materiais atual",
      text: `Fala, {Person}! Tudo bem? Passando rapidinho só para confirmar se você conseguiu dar uma olhada no nosso catálogo que enviei ontem.
Vocês têm alguma lista de materiais ou cotação em andamento por aí hoje para eu montar um orçamento base sem compromisso? Um abraço!`,
    },
  },
  {
    key: "promocao",
    title: "3º Contato (Gatilho de Promoção)",
    badge: "Promoção 20x20",
    subtitle: "Urgência e oportunidade: Tubos galvanizados 20x20 a R$ 40,60",
    defaultForStatus: "negotiation",
    email: {
      subject: "Oportunidade: Promoção em Tubos Galvanizados - Gofer Metais",
      body: `Olá, {Person}! Tudo ótimo por aí?

Queria avisar-vos em primeira mão que estamos com uma promoção excelente nos tubos galvanizados quadrados 20x20, a sair a R$ 40,60 (valor de retalho).

Lembro que, para compras em quantidade para a {Empresa}, consigo negociar e chegar a um preço ainda melhor.

Se precisarem deste ou de outros materiais para repor o stock, respondam a este e-mail.

Um abraço!

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Gerar senso de oportunidade com item de alto giro",
      text: `Olá, {Person}! Tudo ótimo por aí?
Queria te avisar em primeira mão que estamos com uma promoção excelente nos tubos galvanizados quadrados 20x20, saindo a R$ 40,60 (valor de varejo). Para compras em quantidade da {Empresa}, consigo negociar e chegar a um preço ainda melhor!
Se precisarem desse ou de outros materiais para repor o estoque, me dá um toque aqui.`,
    },
  },
  {
    key: "orcamento_base",
    title: "Orçamento Base (Proatividade)",
    badge: "Orçamento Base",
    subtitle: "Mix dos itens mais vendidos para quando o cliente não tem lista",
    defaultForStatus: "closed",
    email: {
      subject: "O seu Orçamento Base - Gofer Metais",
      body: `Olá, {Person}! Tudo bem?

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
      text: `Olá, {Person}! Tudo bem? Como você ainda não tinha a lista exata, tomei a liberdade de montar um orçamento base (em anexo no PDF) com um mix dos itens que mais saem.
Esse pacote inicial ficou num total competitivo. Dê uma olhada no arquivo! O que acha de ajustarmos as quantidades para a sua realidade e fecharmos essa primeira parceria?`,
    },
  },
  {
    key: "pos_orcamento",
    title: "Pós-Orçamento (Ajuste de Medida)",
    badge: "Pós-Orçamento",
    subtitle: "Transparência total e oferta de pronta-entrega para fechar",
    defaultForStatus: "closed",
    email: {
      subject: "O seu Orçamento de Aço - Gofer Metais",
      body: `Olá, {Person}! Tudo bem?

O seu orçamento segue em anexo no PDF!

Só para sermos super transparentes: os únicos itens que não tínhamos na espessura exata que pediu foram {Itens em falta}. Eu incluí no orçamento a medida mais próxima que temos a pronta entrega ({Medida substituta}). Há algum problema em usar esta espessura na sua produção?

Os restantes materiais estão certinhos, conforme pediu.

Diga-me o que achou das nossas ofertas!

Lucas de Freitas Leite
Gofer Metais
https://gofermetais.com.br/`,
    },
    whatsapp: {
      objective: "Salvar a venda focando nos itens disponíveis a pronta entrega",
      text: `Fala, {Person}! Orçamento na mão no PDF acima! 🚀
Só para sermos super transparentes: os únicos itens que não tínhamos na espessura exata que pediu foram ajustados. Eu incluí a medida mais próxima que temos a pronta entrega. Tem algum problema para você usar essa espessura na sua produção?
Os outros tubos estão certinhos conforme você pediu! Me diz o que achou das nossas ofertas!`,
    },
  },
];

/**
 * Extrai decisor/contato e empresa inteligentemente do lead
 */
export function extractLeadContext(lead?: Lead | null): {
  person: string;
  company: string;
  email: string;
  phone: string;
  cleanPhone: string;
  estimatedValue: string;
  location: string;
} {
  if (!lead) {
    return {
      person: "Cliente",
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
  let person = cadenceState.contactPerson || "";
  let company = cadenceState.companyName || "";

  if (!company || !person) {
    // 1. Tenta formato "Contato (Empresa)" ou "Empresa (Contato)"
    const parenMatch = rawName.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      const part1 = parenMatch[1].trim();
      const part2 = parenMatch[2].trim();

      const companyKeywords = ["redes", "metais", "aço", "estruturas", "serralheria", "ltda", "me", "eireli", "industria", "indústria", "comércio", "soluções", "construtora", "engenharia"];
      const isP1Company = companyKeywords.some((k) => part1.toLowerCase().includes(k));
      const isP2Company = companyKeywords.some((k) => part2.toLowerCase().includes(k));

      if (isP1Company && !isP2Company) {
        if (!company) company = part1;
        if (!person) person = part2;
      } else {
        if (!person) person = part1;
        if (!company) company = part2;
      }
    } else {
      if (!company) company = rawName;
    }
  }

  // 2. Procura menção ao contato nas anotações (ex: "mundialredes@hotmail.com (Daiane);")
  if (!person || person === company) {
    if (Array.isArray(lead.notes)) {
      for (const n of lead.notes) {
        if (!n?.text) continue;
        const noteMatch = n.text.match(/\(([A-Za-zÀ-ÖØ-öø-ÿ\s]{2,20})\)/);
        if (noteMatch && noteMatch[1]) {
          const candidate = noteMatch[1].trim();
          if (
            !candidate.toLowerCase().includes("plano") &&
            !candidate.toLowerCase().includes("operador") &&
            !candidate.toLowerCase().includes("lead")
          ) {
            person = candidate;
            break;
          }
        }
      }
    }
  }

  // 3. Fallback limpo: se não tiver nome de pessoa, usa a empresa
  if (!person) {
    person = company || "Cliente";
  }

  // Normaliza telefone para WhatsApp (apenas dígitos, garantindo DDI 55)
  let cleanPhone = (lead.leadPhone || "").replace(/\D/g, "");
  if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
    cleanPhone = `55${cleanPhone}`;
  }

  // Valor estimado
  const estimatedValue =
    cadenceState.estimatedValue ||
    (lead as any).estimatedValue ||
    "1.850,00";

  return {
    person,
    company: company || person,
    email: (lead.leadEmail || "").trim(),
    phone: lead.leadPhone || "",
    cleanPhone,
    estimatedValue,
    location: cadenceState.location || "",
  };
}

/**
 * Interpola um template substituindo as variáveis {Person}, {Empresa}, etc.
 */
export function interpolateGoferTemplateText(
  text: string,
  context: {
    person: string;
    company: string;
    estimatedValue?: string;
    itensEmFalta?: string;
    medidaSubstituta?: string;
  }
): string {
  return text
    .replace(/{Person}/g, context.person || "Cliente")
    .replace(/{Empresa}/g, context.company || "sua empresa")
    .replace(/{Valor}/g, context.estimatedValue || "1.850,00")
    .replace(/{Itens em falta}/g, context.itensEmFalta || "alguns tubos específicos")
    .replace(/{Medida substituta}/g, context.medidaSubstituta || "a medida mais próxima a pronta entrega");
}
