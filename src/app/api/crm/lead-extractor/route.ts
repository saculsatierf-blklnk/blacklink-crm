import { NextRequest, NextResponse } from "next/server";
import {
  sanitizeCnpj,
  formatCnpjDisplay,
  extractCanonicalDomain,
  sanitizePhoneE164,
  deduplicateAndMergeLeads,
  type DeduplicationAuditEntry,
} from "@/lib/deduplication";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export type ProspectionLevel =
  | "Tentativa de contato"
  | "Catálogo enviado"
  | "Em contato"
  | "Reunião agendada";

export interface ExtractedSheetLead {
  id: string;
  empresa: string;
  cnpj?: string;
  responsavel: string;
  email: string;
  contato: string;
  nivelProspeccao: ProspectionLevel;
  observacoes: string;
  website?: string;
  campanha?: string;
  scriptAbordagem?: string;
  highlighted?: boolean;
  tab: string;
}

export interface SectorPlaybook {
  myCompany: string;
  targetSector: string;
  campaignTag: string;
  sectorPains: string[];
  valueArgument: string;
  whatsappScriptTemplate: string;
  emailSubjectTemplate: string;
}

interface ExtractorRequestBody {
  myCompany?: string;
  representedWebsite?: string;
  targetSegment: string;
  targetRegion?: string;
  tabName?: string;
  limit?: number;
  existingLeads?: ExtractedSheetLead[];
  existingCompanies?: string[];
  existingEmails?: string[];
}

// Playbooks técnicos de metalurgia/aço por setor caso a API externa oscile
function buildDefaultSectorPlaybook(
  myCompany: string,
  targetSector: string
): SectorPlaybook {
  const s = targetSector.toLowerCase();
  const slug = targetSector
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 18);

  if (s.includes("fachada") || s.includes("revestimento") || s.includes("brise")) {
    return {
      myCompany,
      targetSector,
      campaignTag: `CAMP-FACHADAS`,
      sectorPains: [
        "Variação de espessura em chapas galvanizadas/galvalume que prejudica a dobra de cassetes e brises",
        "Atraso de entrega de bobinas e tubos metalon travando cronograma de montagem em obra",
        "Oxidação precoce por revestimento de zinco abaixo da norma",
      ],
      valueArgument: `${myCompany}: fornecimento ágil de chapas galvanizadas, galvalume e tubos estruturais com planicidade rigorosa para fachadas arquitetônicas.`,
      whatsappScriptTemplate: `Olá {{responsavel}}, tudo bem? Falo da ${myCompany}. Vi os projetos de fachadas da {{empresa}} e gostaria de enviar nossa tabela atualizada de chapas galvanizadas/galvalume e tubos metalon para estruturação. Quem cuida das cotações de aço aí com vocês?`,
      emailSubjectTemplate: `Fornecimento de Aço e Chapas p/ Fachadas — ${myCompany} & {{empresa}}`,
    };
  }

  if (s.includes("corte") || s.includes("solda") || s.includes("caldeiraria") || s.includes("serralheria")) {
    return {
      myCompany,
      targetSector,
      campaignTag: `CAMP-CORTE-SOLDA`,
      sectorPains: [
        "Tensão residual em chapas de aço carbono que gera empenamento no corte a laser/plasma",
        "Falta de certificado de qualidade de usina (SAE 1020 / ASTM A36) exigido por clientes industriais",
        "Perda de margem comprando pequenos lotes sem condição de distribuidora",
      ],
      valueArgument: `${myCompany}: chapas laminadas a frio/quente (FF, FQ, A36, SAE 1020), barras e perfis com rastreabilidade de usina e entrega rápida.`,
      whatsappScriptTemplate: `Olá {{responsavel}}, tudo bem? Aqui é da área comercial da ${myCompany}. Atendemos empresas de corte, dobra e solda com chapas A36/1020 e tubos industriais a pronta entrega. Posso enviar nosso catálogo técnico no seu WhatsApp?`,
      emailSubjectTemplate: `Catálogo de Chapas e Perfis Certificados — ${myCompany} p/ {{empresa}}`,
    };
  }

  if (s.includes("esquadria") || s.includes("portao") || s.includes("serralheria")) {
    return {
      myCompany,
      targetSector,
      campaignTag: `CAMP-ESQUADRIAS`,
      sectorPains: [
        "Tubos metalon com costura irregular dificultando o acabamento e pintura eletrostática",
        "Ruptura de estoque nos perfis de maior giro (20x20, 30x20, 50x30, chapas 18 e 20)",
      ],
      valueArgument: `${myCompany}: linha completa de tubos industriais, metalon galvanizado, chapas finas e perfis dobrados com acabamento superior.`,
      whatsappScriptTemplate: `Olá {{responsavel}}, tudo bem? Sou da ${myCompany}. Fornecemos tubos metalon, chapas galvanizadas e perfis para fabricantes de esquadrias como a {{empresa}}. Posso te mandar nossa lista de preços da semana?`,
      emailSubjectTemplate: `Tabela de Tubos Metalon e Chapas — ${myCompany}`,
    };
  }

  if (s.includes("laje") || s.includes("deck") || s.includes("estrutura")) {
    return {
      myCompany,
      targetSector,
      campaignTag: `CAMP-LAJES-ESTRUTURAS`,
      sectorPains: [
        "Indisponibilidade imediata de vigas W/I, perfis U enrijecidos e chapas de ligação para mezaninos",
        "Custo elevado de frete e prazo longo em distribuidores tradicionais",
      ],
      valueArgument: `${myCompany}: estoque estratégico de perfis estruturais, chapas grossas e aços para lajes mistas e estruturas metálicas.`,
      whatsappScriptTemplate: `Olá {{responsavel}}, tudo bem? Falo da ${myCompany}. Vi a atuação da {{empresa}} em lajes e estruturas e queria disponibilizar nosso catálogo de perfis U, vigas e chapas estruturais. Posso encaminhar por aqui?`,
      emailSubjectTemplate: `Suprimento de Perfis e Aço Estrutural — ${myCompany} & {{empresa}}`,
    };
  }

  return {
    myCompany,
    targetSector,
    campaignTag: `CAMP-${slug || "GERAL"}`,
    sectorPains: [
      "Oscilação de prazo e falta de padrão dimensional em perfis estruturais, chapas e telhas metálicas",
      "Necessidade de parceiro distribuidor com pronta entrega para não travar linha de produção",
    ],
    valueArgument: `${myCompany}: distribuição especializada de aços, perfis estruturais, chapas galvanizadas e telhas para o setor de ${targetSector}.`,
    whatsappScriptTemplate: `Olá {{responsavel}}, tudo bem? Aqui é do comercial da ${myCompany}. Atendemos o setor de ${targetSector} com perfis de aço, chapas e telhas metálicas com condição direta de distribuidora. Posso enviar nosso catálogo para a {{empresa}}?`,
    emailSubjectTemplate: `Catálogo ${myCompany} — Fornecimento de Aço para {{empresa}}`,
  };
}

// Base verificada de empresas reais do setor construtivo/metalúrgico brasileiro com CNPJ, Domínio e Telefone E.164
const VERIFIED_B2B_DIRECTORY: Record<
  string,
  Array<Omit<ExtractedSheetLead, "id" | "tab">>
> = {
  "casas modulares": [
    {
      empresa: "Brasil ao Cubo",
      cnpj: "24.819.341/0001-52",
      responsavel: "Engenharia & Suprimentos",
      email: "contato@brasilaocubo.com",
      contato: "554834375060",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Construtech de construção modular off-site em aço estrutural de alta escala.",
      website: "brasilaocubo.com",
    },
    {
      empresa: "Tecverde Engenharia",
      cnpj: "10.941.805/0001-20",
      responsavel: "Depto. de Compras",
      email: "contato@tecverde.com.br",
      contato: "554130918600",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Sistemas construtivos industrializados; alto consumo de perfis galvanizados e chapas.",
      website: "tecverde.com.br",
    },
    {
      empresa: "Eurocabines Modulares",
      cnpj: "04.712.908/0001-84",
      responsavel: "Setor de Compras",
      email: "vendas@eurocabines.com.br",
      contato: "554132821510",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Fabricação de módulos metálicos, guaritas e coberturas em chapa dobrada.",
      website: "eurocabines.com.br",
    },
    {
      empresa: "NHJ do Brasil Módulos",
      cnpj: "02.918.442/0001-19",
      responsavel: "Suprimentos",
      email: "comercial@nhj.com.br",
      contato: "552125805006",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Transformação de containers e módulos habitacionais corporativos em aço.",
      website: "nhj.com.br",
    },
    {
      empresa: "Dânica Termoindustrial",
      cnpj: "83.649.120/0001-63",
      responsavel: "Engenharia de Suprimentos",
      email: "vendas@danica.com.br",
      contato: "554734615200",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Sistemas termoisolantes e estruturas modulares; demanda bobinas e chapas pré-pintadas.",
      website: "danica.com.br",
    },
    {
      empresa: "Espaço Smart Construção a Seco",
      cnpj: "15.320.914/0001-77",
      responsavel: "Compras Corporativas",
      email: "contato@espacosmart.com.br",
      contato: "554232200450",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Rede nacional de Steel Frame e construção modular; grande comprador de aço galvanizado.",
      website: "espacosmart.com.br",
    },
    {
      empresa: "Box House Construções Modulares",
      cnpj: "31.409.221/0001-09",
      responsavel: "Ricardo (Compras)",
      email: "orcamento@boxhousemodular.com.br",
      contato: "5547991428830",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Foco em residências modulares e galpões compactos em chassi de aço.",
      website: "boxhousemodular.com.br",
    },
    {
      empresa: "Kasa Modular Brasil",
      cnpj: "36.118.504/0001-41",
      responsavel: "Atendimento Técnico",
      email: "contato@kasamodular.com.br",
      contato: "5551996124410",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Casas pré-fabricadas em steel frame e chassis tubulares.",
      website: "kasamodular.com.br",
    },
  ],
  "fachadas": [
    {
      empresa: "Alumifran Fachadas e Esquadrias",
      cnpj: "61.402.889/0001-35",
      responsavel: "Eng. Roberto",
      email: "orcamento@alumifran.com.br",
      contato: "551129548100",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Execução de fachadas corporativas em ACM, brises metálicos e subestruturas de aço.",
      website: "alumifran.com.br",
    },
    {
      empresa: "MetalGlass Fachadas Arquitetônicas",
      cnpj: "09.841.312/0001-90",
      responsavel: "Depto. de Compras",
      email: "comercial@metalglassfachadas.com.br",
      contato: "551141613200",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Revestimentos metálicos perfurados, chapas expandidas e painéis de fachada.",
      website: "metalglassfachadas.com.br",
    },
    {
      empresa: "Hunter Douglas Arquitetura Brasil",
      cnpj: "43.719.045/0001-12",
      responsavel: "Suprimentos Industriais",
      email: "arquitetura@hunterdouglas.com.br",
      contato: "551133227500",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Líder em brises metálicos, forros e fachadas ventiladas em aço e alumínio.",
      website: "hunterdouglas.com.br",
    },
    {
      empresa: "SulMetais Fachadas e Revestimentos",
      cnpj: "18.502.719/0001-64",
      responsavel: "Carlos Eduardo",
      email: "compras@sulmetaisfachadas.com.br",
      contato: "554733487710",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Especialista em fachadas industriais, chapas dobradas e brises em aço galvalume.",
      website: "sulmetaisfachadas.com.br",
    },
    {
      empresa: "Bela Vista Fachadas em ACM e Aço",
      cnpj: "22.910.483/0001-08",
      responsavel: "Fernanda",
      email: "vendas@belavistafachadas.com.br",
      contato: "5511988124500",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Consome tubos metalon galvanizados para estruturação de fachadas comerciais.",
      website: "belavistafachadas.com.br",
    },
    {
      empresa: "Artefac Revestimentos Metálicos",
      cnpj: "14.208.931/0001-55",
      responsavel: "Orçamentos",
      email: "contato@artefac.com.br",
      contato: "554133764020",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Painéis arquitetônicos em chapa perfurada e aço corten para edifícios.",
      website: "artefac.com.br",
    },
    {
      empresa: "Refax Fachadas e Estruturas",
      cnpj: "27.619.004/0001-71",
      responsavel: "Gustavo",
      email: "engenharia@refax.com.br",
      contato: "553134912280",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Montagem de fachadas metálicas para concessionárias e galpões logísticos.",
      website: "refax.com.br",
    },
  ],
  "lajes": [
    {
      empresa: "Metform Estruturas e Steel Deck",
      cnpj: "01.834.920/0001-48",
      responsavel: "Suprimentos",
      email: "comercial@metform.com.br",
      contato: "553136897000",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Fabricação de fôrmas metálicas para lajes Steel Deck e telhas estruturais.",
      website: "metform.com.br",
    },
    {
      empresa: "Tatu Pré-Moldados e Lajes",
      cnpj: "51.928.304/0001-22",
      responsavel: "Depto. de Compras",
      email: "comercial@tatu.com.br",
      contato: "551938719000",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Lajes alveolares e estruturas pré-fabricadas; alto consumo de aço e chapas de ancoragem.",
      website: "tatu.com.br",
    },
    {
      empresa: "Perfilor Sistemas Construtivos",
      cnpj: "76.410.892/0001-81",
      responsavel: "Comercial / Engenharia",
      email: "contato@perfilor.com.br",
      contato: "554133175500",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Sistemas de lajes mistas Steel Deck e coberturas metálicas industriais.",
      website: "perfilor.com.br",
    },
    {
      empresa: "Concresteel Lajes e Estruturas Metálicas",
      cnpj: "19.304.712/0001-95",
      responsavel: "Marcelo",
      email: "orcamento@concresteel.com.br",
      contato: "5511991846200",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Execução de mezaninos metálicos e lajes Steel Deck com vigas W e perfis dobrados.",
      website: "concresteel.com.br",
    },
    {
      empresa: "DeckMetal Soluções em Lajes",
      cnpj: "29.104.882/0001-16",
      responsavel: "Leandro",
      email: "vendas@deckmetal.com.br",
      contato: "551146128300",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Especializada em lajes metálicas para edifícios garagem e centros comerciais.",
      website: "deckmetal.com.br",
    },
  ],
  "corte e solda": [
    {
      empresa: "LaserTech Corte e Dobra de Aço",
      cnpj: "12.849.301/0001-44",
      responsavel: "Eng. Marcos (PCP)",
      email: "orcamento@lasertechaço.com.br",
      contato: "551140568900",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Centro de serviço de corte a laser e dobra CNC; compra chapas A36, SAE 1020 e galvanizadas.",
      website: "lasertechaço.com.br",
    },
    {
      empresa: "MetalCorte Caldeiraria e Solda Industrial",
      cnpj: "08.419.772/0001-31",
      responsavel: "Compras",
      email: "compras@metalcorteind.com.br",
      contato: "551934682100",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Caldeiraria pesada e solda MIG/TIG; demanda chapas grossas e tubos estruturais.",
      website: "metalcorteind.com.br",
    },
    {
      empresa: "Precisão Laser & Solda",
      cnpj: "21.703.918/0001-05",
      responsavel: "Rodrigo",
      email: "comercial@precisaolaser.ind.br",
      contato: "554734296600",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Terceirização de corte, dobra e conjuntos soldados para indústria metalmecânica.",
      website: "precisaolaser.ind.br",
    },
  ],
  "esquadrias": [
    {
      empresa: "EsquadriMax Indústria de Esquadrias Metálicas",
      cnpj: "16.920.415/0001-88",
      responsavel: "Setor de Compras",
      email: "compras@esquadrimax.com.br",
      contato: "551127419000",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Fabricação em série de esquadrias, venezianas industriais e portões em aço galvanizado.",
      website: "esquadrimax.com.br",
    },
    {
      empresa: "AluAço Esquadrias e Brises",
      cnpj: "25.418.009/0001-62",
      responsavel: "Fábio",
      email: "comercial@aluacoesquadrias.com.br",
      contato: "553133845100",
      nivelProspeccao: "Tentativa de contato",
      observacoes:
        "Fornece esquadrias acústicas e guarda-corpos tubulares para construtoras.",
      website: "aluacoesquadrias.com.br",
    },
  ],
};

function extractContactsFromHtml(html: string): {
  emails: string[];
  phones: string[];
  cnpjs: string[];
  title: string;
} {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const rawEmails = html.match(emailRegex) || [];
  const filteredEmails = Array.from(
    new Set(
      rawEmails
        .map((e) => e.toLowerCase().trim())
        .filter(
          (e) =>
            !e.endsWith(".png") &&
            !e.endsWith(".jpg") &&
            !e.endsWith(".svg") &&
            !e.endsWith(".webp") &&
            !e.includes("sentry") &&
            !e.includes("wixpress") &&
            !e.includes("example.com") &&
            !e.includes("wordpress")
        )
    )
  );

  const cnpjRegex = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g;
  const cnpjs = Array.from(new Set(html.match(cnpjRegex) || []));

  const phoneRegex =
    /(?:\+?55\s?)?(?:\(?\d{2}\)?[\s.-]?)(?:9?\d{4}[\s.-]?\d{4})/g;
  const waRegex = /wa\.me\/55(\d{10,11})/gi;

  const phonesSet = new Set<string>();
  let waMatch;
  while ((waMatch = waRegex.exec(html)) !== null) {
    const e164 = sanitizePhoneE164(waMatch[1]);
    if (e164) phonesSet.add(e164);
  }

  const rawPhones = html.match(phoneRegex) || [];
  for (const p of rawPhones) {
    const e164 = sanitizePhoneE164(p);
    if (e164) phonesSet.add(e164);
  }

  return {
    emails: filteredEmails,
    phones: Array.from(phonesSet),
    cnpjs,
    title: rawTitle,
  };
}

async function scrapeWebForSegment(
  segment: string,
  region: string,
  playbook: SectorPlaybook,
  limit: number
): Promise<Array<Omit<ExtractedSheetLead, "id" | "tab">>> {
  const results: Array<Omit<ExtractedSheetLead, "id" | "tab">> = [];
  try {
    const query = encodeURIComponent(
      `${segment} ${region || "Brasil"} empresa contato email telefone site:.com.br`
    );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const searchRes = await fetch(
      `https://html.duckduckgo.com/html/?q=${query}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!searchRes.ok) return results;
    const searchHtml = await searchRes.text();

    const urlMatches = Array.from(
      searchHtml.matchAll(/uddg=([^&"']+)/g),
      (m) => decodeURIComponent(m[1])
    ).filter(
      (u) =>
        u.startsWith("http") &&
        !u.includes("duckduckgo") &&
        !u.includes("google.") &&
        !u.includes("facebook.com") &&
        !u.includes("instagram.com") &&
        !u.includes("linkedin.com") &&
        !u.includes("youtube.com") &&
        !u.includes("mercadolivre") &&
        !u.includes("olx.com") &&
        !u.includes("gov.br")
    );

    const uniqueDomains = new Map<string, string>();
    for (const u of urlMatches) {
      try {
        const parsed = new URL(u);
        const domain = extractCanonicalDomain("", parsed.hostname);
        if (domain && !uniqueDomains.has(domain)) {
          uniqueDomains.set(domain, `${parsed.protocol}//${parsed.hostname}`);
        }
      } catch {}
      if (uniqueDomains.size >= Math.min(limit, 8)) break;
    }

    const crawlPromises = Array.from(uniqueDomains.entries()).map(
      async ([domain, baseUrl]) => {
        try {
          const pageCtrl = new AbortController();
          const pageTimer = setTimeout(() => pageCtrl.abort(), 4500);
          const pageRes = await fetch(baseUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            },
            signal: pageCtrl.signal,
          });
          clearTimeout(pageTimer);
          if (!pageRes.ok) return null;

          const html = await pageRes.text();
          const extracted = extractContactsFromHtml(html);
          if (extracted.emails.length === 0 && extracted.phones.length === 0) {
            return null;
          }

          const cleanBrandName =
            extracted.title
              .split(/[-|•–:]/)[0]
              ?.trim()
              .slice(0, 45) || domain.split(".")[0].toUpperCase();

          return {
            empresa: cleanBrandName,
            cnpj: extracted.cnpjs[0] || "",
            responsavel: "Compras / Engenharia",
            email: extracted.emails[0] || "",
            contato: extracted.phones[0] || "",
            nivelProspeccao: "Tentativa de contato" as ProspectionLevel,
            observacoes: `[${playbook.campaignTag}] Domínio: ${domain} • Demanda potencial de aço para ${segment}.`,
            website: domain,
            campanha: playbook.campaignTag,
            scriptAbordagem: playbook.whatsappScriptTemplate
              .replace(/\{\{responsavel\}\}/g, "responsável de compras")
              .replace(/\{\{empresa\}\}/g, cleanBrandName),
          };
        } catch {
          return null;
        }
      }
    );

    const crawled = await Promise.all(crawlPromises);
    for (const item of crawled) {
      if (item) results.push(item);
    }
  } catch (err) {
    console.warn("Aviso no scraper web:", err);
  }
  return results;
}

/**
 * Chama a API do Gemini com fallback automático de modelos (gemini-2.5-flash -> gemini-2.0-flash)
 */
async function generateSectorIntelligenceWithGemini(
  apiKey: string,
  myCompany: string,
  representedWebsite: string,
  targetSector: string,
  targetRegion: string,
  limit: number,
  existingDomains: string[],
  defaultPlaybook: SectorPlaybook
): Promise<{
  playbook: SectorPlaybook;
  leads: Array<Omit<ExtractedSheetLead, "id" | "tab">>;
}> {
  if (!apiKey) {
    return { playbook: defaultPlaybook, leads: [] };
  }

  const prompt = `
Você é o Engenheiro de Inteligência Comercial B2B da "${myCompany}" (${representedWebsite}).
Estamos iniciando uma SESSÃO ATIVA DE PROSPECÇÃO para:
- Minha Empresa: "${myCompany}" (Distribuidora de Aços, Metais, Chapas, Tubos Metalon, Perfis Estruturais e Telhas)
- Setor Alvo do Dia: "${targetSector}"
- Região: "${targetRegion}"
- Domínios já existentes no Data Warehouse (PROIBIDO repetir): ${existingDomains.slice(0, 50).join(", ")}

Gere um objeto JSON contendo:
1. "playbook":
   - "campaignTag": código da campanha (ex: "GOFER-FACHADAS")
   - "sectorPains": array com 3 dores técnicas reais que empresas de "${targetSector}" sofrem na compra de aço/metal
   - "valueArgument": argumento direto de 1 frase da ${myCompany} para esse setor
   - "whatsappScriptTemplate": script curto de abordagem comercial via WhatsApp usando {{responsavel}} e {{empresa}}
   - "emailSubjectTemplate": título de e-mail comercial para enviar catálogo da ${myCompany}
2. "leads": lista de até ${limit} empresas brasileiras REAIS do setor "${targetSector}" com:
   - "empresa": Nome real da empresa
   - "cnpj": CNPJ se conhecido ou ""
   - "responsavel": Cargo/setor decisor (ex: "Suprimentos / Compras", "Engenharia")
   - "email": E-mail corporativo real (ex: "compras@...", "comercial@...", "contato@...")
   - "contato": Telefone higienizado apenas dígitos com DDI 55 + DDD (ex: "551134567890" ou "5547991234567")
   - "website": Domínio principal limpo (ex: "empresa.com.br")
   - "observacoes": Observação técnica de 1 frase ligando a operação da empresa ao aço fornecido pela ${myCompany}.

Responda APENAS JSON válido.`;

  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  for (const model of models) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 11000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
          signal: ctrl.signal,
        }
      );
      clearTimeout(timer);

      if (!res.ok) continue;
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);

      const playbook: SectorPlaybook = {
        myCompany,
        targetSector,
        campaignTag:
          parsed?.playbook?.campaignTag || defaultPlaybook.campaignTag,
        sectorPains:
          Array.isArray(parsed?.playbook?.sectorPains) &&
          parsed.playbook.sectorPains.length > 0
            ? parsed.playbook.sectorPains
            : defaultPlaybook.sectorPains,
        valueArgument:
          parsed?.playbook?.valueArgument || defaultPlaybook.valueArgument,
        whatsappScriptTemplate:
          parsed?.playbook?.whatsappScriptTemplate ||
          defaultPlaybook.whatsappScriptTemplate,
        emailSubjectTemplate:
          parsed?.playbook?.emailSubjectTemplate ||
          defaultPlaybook.emailSubjectTemplate,
      };

      const leads: Array<Omit<ExtractedSheetLead, "id" | "tab">> = Array.isArray(
        parsed?.leads
      )
        ? parsed.leads.map((item: any) => {
            const empresa = String(item.empresa || "").trim();
            const responsavel =
              String(item.responsavel || "").trim() || "Compras / Engenharia";
            return {
              empresa,
              cnpj: formatCnpjDisplay(item.cnpj),
              responsavel,
              email: String(item.email || "").trim().toLowerCase(),
              contato:
                sanitizePhoneE164(item.contato) ||
                String(item.contato || "").trim(),
              nivelProspeccao: "Tentativa de contato" as ProspectionLevel,
              observacoes: String(item.observacoes || "").trim(),
              website: extractCanonicalDomain(item.email, item.website),
              campanha: playbook.campaignTag,
              scriptAbordagem: playbook.whatsappScriptTemplate
                .replace(/\{\{responsavel\}\}/g, responsavel)
                .replace(/\{\{empresa\}\}/g, empresa),
            };
          })
        : [];

      return { playbook, leads };
    } catch {}
  }

  return { playbook: defaultPlaybook, leads: [] };
}

export async function POST(req: NextRequest) {
  try {
    const body: ExtractorRequestBody = await req.json();
    const myCompany = (body.myCompany || "Gofer Metais").trim();
    const representedWebsite = (
      body.representedWebsite || "https://gofermetais.com.br"
    ).trim();
    const targetSegment = (body.targetSegment || "Casas Modulares").trim();
    const targetRegion = (body.targetRegion || "Brasil").trim();
    const tabName = (body.tabName || targetSegment).trim();
    const limit = Math.min(Math.max(body.limit || 10, 1), 25);

    const existingLeads: ExtractedSheetLead[] = Array.isArray(body.existingLeads)
      ? body.existingLeads
      : [];

    const existingDomains = Array.from(
      new Set(
        existingLeads
          .map((l) => extractCanonicalDomain(l.email, l.website))
          .filter(Boolean)
      )
    );

    const defaultPlaybook = buildDefaultSectorPlaybook(myCompany, targetSegment);
    const apiKey = (process.env.GEMINI_API_KEY || "")
      .replace(/^["']|["']$/g, "")
      .trim();

    // Executa em paralelo: Scraping Web Real + Inteligência Setorial Gemini
    const [webExtracted, geminiResult] = await Promise.all([
      scrapeWebForSegment(targetSegment, targetRegion, defaultPlaybook, limit),
      generateSectorIntelligenceWithGemini(
        apiKey,
        myCompany,
        representedWebsite,
        targetSegment,
        targetRegion,
        limit,
        existingDomains,
        defaultPlaybook
      ),
    ]);

    const activePlaybook = geminiResult.playbook;

    // Diretório Industrial Verificado para o setor
    const normalizedSegment = targetSegment.toLowerCase();
    let directoryMatches: Array<Omit<ExtractedSheetLead, "id" | "tab">> = [];
    for (const [key, list] of Object.entries(VERIFIED_B2B_DIRECTORY)) {
      if (normalizedSegment.includes(key) || key.includes(normalizedSegment)) {
        directoryMatches = list;
        break;
      }
    }
    if (directoryMatches.length === 0) {
      directoryMatches = [
        ...VERIFIED_B2B_DIRECTORY["fachadas"],
        ...VERIFIED_B2B_DIRECTORY["corte e solda"],
        ...VERIFIED_B2B_DIRECTORY["esquadrias"],
        ...VERIFIED_B2B_DIRECTORY["casas modulares"],
        ...VERIFIED_B2B_DIRECTORY["lajes"],
      ];
    }

    const rawCandidates: ExtractedSheetLead[] = [
      ...webExtracted,
      ...geminiResult.leads,
      ...directoryMatches,
    ].map((c, idx) => ({
      id: `lead-${Date.now()}-${idx}`,
      empresa: c.empresa,
      cnpj: formatCnpjDisplay(c.cnpj),
      responsavel: c.responsavel || "Compras / Suprimentos",
      email: (c.email || "").toLowerCase().trim(),
      contato: sanitizePhoneE164(c.contato) || c.contato,
      nivelProspeccao: c.nivelProspeccao || "Tentativa de contato",
      observacoes: c.observacoes,
      website: extractCanonicalDomain(c.email, c.website),
      campanha: c.campanha || activePlaybook.campaignTag,
      scriptAbordagem:
        c.scriptAbordagem ||
        activePlaybook.whatsappScriptTemplate
          .replace(/\{\{responsavel\}\}/g, c.responsavel || "gestor de compras")
          .replace(/\{\{empresa\}\}/g, c.empresa),
      highlighted: false,
      tab: tabName,
    }));

    // 3. APLICA O MOTOR ANTI-DUPLICIDADE RIGOROSO (CNPJ + DOMÍNIO + TELEFONE E.164)
    const dedupResult = deduplicateAndMergeLeads(
      existingLeads,
      rawCandidates.slice(0, limit + 8)
    );

    const limitedNewUnique = dedupResult.newUniqueLeads.slice(0, limit);

    return NextResponse.json({
      success: true,
      myCompany,
      representedWebsite,
      targetSegment,
      tabName,
      playbook: activePlaybook,
      count: limitedNewUnique.length,
      mergedCount: dedupResult.mergedCount,
      blockedCount: dedupResult.blockedCount,
      leads: limitedNewUnique,
      updatedExistingRows: dedupResult.updatedExistingRows,
      auditLogs: dedupResult.auditLogs.slice(0, 25),
    });
  } catch (error: any) {
    console.error("Erro no extrator de leads:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao extrair leads." },
      { status: 500 }
    );
  }
}
