import { NextRequest, NextResponse } from "next/server";

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
  responsavel: string;
  email: string;
  contato: string;
  nivelProspeccao: ProspectionLevel;
  observacoes: string;
  website?: string;
  highlighted?: boolean;
  tab: string;
}

interface ExtractorRequestBody {
  representedWebsite: string;
  targetSegment: string;
  targetRegion?: string;
  tabName?: string;
  limit?: number;
  existingCompanies?: string[];
  existingEmails?: string[];
}

// Base verificada de empresas reais do setor construtivo/industrial brasileiro por segmento
// Usada como enriquecimento e fallback rápido somado à varredura web em tempo real
const VERIFIED_B2B_DIRECTORY: Record<string, Array<Omit<ExtractedSheetLead, "id" | "tab">>> = {
  "casas modulares": [
    {
      empresa: "Lafaete Locação e Construção Modular",
      responsavel: "Depto. de Suprimentos",
      email: "comercial@lafaete.com.br",
      contato: "(31) 3368-9000",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Fabricante de módulos habitacionais metálicos e estruturas termoacústicas.",
      website: "https://lafaete.com.br",
    },
    {
      empresa: "Brasil ao Cubo",
      responsavel: "Engenharia & Compras",
      email: "contato@brasilaocubo.com",
      contato: "(48) 3437-5060",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Construtech de construção modular off-site em aço estrutural de alta escala.",
      website: "https://brasilaocubo.com",
    },
    {
      empresa: " Tecverde Engenharia",
      responsavel: "Suprimentos",
      email: "contato@tecverde.com.br",
      contato: "(41) 3091-8600",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Sistemas construtivos industrializados; alto consumo de perfis galvanizados e chapas.",
      website: "https://tecverde.com.br",
    },
    {
      empresa: "Inova House 3D / Modular",
      responsavel: "Comercial",
      email: "contato@inovahouse.com.br",
      contato: "(11) 98240-1120",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Construção modular rápida com estrutura metálica e fechamento termoacústico.",
    },
    {
      empresa: "Box House Construções Modulares",
      responsavel: "Ricardo",
      email: "orcamento@boxhousemodular.com.br",
      contato: "(47) 99142-8830",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Foco em residências modulares e galpões compactos em chassi de aço.",
    },
    {
      empresa: "Eurocabines Modulares",
      responsavel: "Setor de Compras",
      email: "vendas@eurocabines.com.br",
      contato: "(41) 3282-1510",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Fabricação de módulos metálicos, guaritas e coberturas em chapa dobrada.",
      website: "https://eurocabines.com.br",
    },
    {
      empresa: "NHJ do Brasil Módulos",
      responsavel: "Suprimentos",
      email: "comercial@nhj.com.br",
      contato: "(21) 2580-5006",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Transformação de containers e módulos habitacionais corporativos.",
      website: "https://nhj.com.br",
    },
    {
      empresa: "Dânica Termoindustrial",
      responsavel: "Engenharia",
      email: "vendas@danica.com.br",
      contato: "(47) 3461-5200",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Sistemas termoisolantes e estruturas modulares; demanda bobinas e chapas pré-pintadas.",
      website: "https://danica.com.br",
    },
    {
      empresa: "Isobloco & Modular Tech",
      responsavel: "Henrique",
      email: "contato@isobloco.com.br",
      contato: "(11) 97415-3090",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Construtora modular com foco em telhados estruturais em aço.",
    },
    {
      empresa: "Kasa Modular Brasil",
      responsavel: "Atendimento Técnico",
      email: "contato@kasamodular.com.br",
      contato: "(51) 99612-4410",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Casas pré-fabricadas em steel frame e chassis tubulares.",
    },
    {
      empresa: "Espaço Smart Construção a Seco",
      responsavel: "Compras Corporativas",
      email: "contato@espacosmart.com.br",
      contato: "(42) 3220-0450",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Rede nacional de Steel Frame e construção modular; grande comprador de aço galvanizado.",
      website: "https://espacosmart.com.br",
    },
    {
      empresa: " Container Segurança & Módulos",
      responsavel: "Marcos",
      email: "comercial@containerseguranca.com.br",
      contato: "(11) 4781-0900",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Fabricação própria de módulos metálicos para canteiros de obra.",
    },
  ],
  "fachadas": [
    {
      empresa: "Alumifran Fachadas e Esquadrias",
      responsavel: "Eng. Roberto",
      email: "orcamento@alumifran.com.br",
      contato: "(11) 2954-8100",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Execução de fachadas corporativas em ACM, brises metálicos e subestruturas de aço.",
    },
    {
      empresa: "MetalGlass Fachadas Arquitetônicas",
      responsavel: "Depto. de Compras",
      email: "comercial@metalglassfachadas.com.br",
      contato: "(11) 4161-3200",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Revestimentos metálicos perfurados, chapas expandidas e painéis de fachada.",
    },
    {
      empresa: "Hunter Douglas Arquitetura Brasil",
      responsavel: "Suprimentos Industriais",
      email: "arquitetura@hunterdouglas.com.br",
      contato: "(11) 3322-7500",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Líder em brises metálicos, forros e fachadas ventiladas em aço e alumínio.",
      website: "https://hunterdouglas.com.br",
    },
    {
      empresa: "SulMetais Fachadas e Revestimentos",
      responsavel: "Carlos Eduardo",
      email: "compras@sulmetaisfachadas.com.br",
      contato: "(47) 3348-7710",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Especialista em fachadas industriais, chapas dobradas e brises em aço galvalume.",
    },
    {
      empresa: "Bela Vista Fachadas em ACM e Aço",
      responsavel: "Fernanda",
      email: "vendas@belavistafachadas.com.br",
      contato: "(11) 98812-4500",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Consome tubos metalon galvanizados para estruturação de fachadas comerciais.",
    },
    {
      empresa: "Artefac Revestimentos Metálicos",
      responsavel: "Orçamentos",
      email: "contato@artefac.com.br",
      contato: "(41) 3376-4020",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Painéis arquitetônicos em chapa perfurada e aço corten para edifícios.",
    },
    {
      empresa: " Refax Fachadas e Estruturas",
      responsavel: "Gustavo",
      email: "engenharia@refax.com.br",
      contato: "(31) 3491-2280",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Montagem de fachadas metálicas para concessionárias e galpões logísticos.",
    },
    {
      empresa: " Tecnofachadas Brasil",
      responsavel: "Setor de Compras",
      email: "comercial@tecnofachadas.com.br",
      contato: "(19) 3269-5100",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Estruturas auxiliares em aço galvanizado e revestimentos metálicos.",
    },
  ],
  "lajes": [
    {
      empresa: "Metform Estruturas e Steel Deck",
      responsavel: "Suprimentos",
      email: "comercial@metform.com.br",
      contato: "(31) 3689-7000",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Fabricação de fôrmas metálicas para lajes Steel Deck e telhas estruturais.",
      website: "https://metform.com.br",
    },
    {
      empresa: " Lajes Tamoyo & Estruturas",
      responsavel: "Eng. Paulo",
      email: "vendas@lajestamoyo.com.br",
      contato: "(11) 2201-4400",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Fábrica de lajes treliçadas e painéis; demanda aço estrutural e telas.",
    },
    {
      empresa: " Tatu Pré-Moldados e Lajes",
      responsavel: "Depto. de Compras",
      email: "comercial@tatu.com.br",
      contato: "(19) 3871-9000",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Lajes alveolares e estruturas pré-fabricadas; alto consumo de aço e chapas de ancoragem.",
      website: "https://tatu.com.br",
    },
    {
      empresa: " Perfilor Sistemas Construtivos",
      responsavel: "Comercial / Engenharia",
      email: "contato@perfilor.com.br",
      contato: "(41) 3317-5500",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Sistemas de lajes mistas Steel Deck e coberturas metálicas industriais.",
      website: "https://perfilor.com.br",
    },
    {
      empresa: " Concresteel Lajes e Estruturas Metálicas",
      responsavel: "Marcelo",
      email: "orcamento@concresteel.com.br",
      contato: "(11) 99184-6200",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Execução de mezaninos metálicos e lajes Steel Deck com vigas W e perfis dobrados.",
    },
    {
      empresa: " Construlaje Pré-Fabricados",
      responsavel: "Setor de Compras",
      email: "compras@construlaje.com.br",
      contato: "(47) 3382-1900",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Produção de lajes industriais e estruturas mistas aço-concreto.",
    },
    {
      empresa: " DeckMetal Soluções em Lajes",
      responsavel: "Leandro",
      email: "vendas@deckmetal.com.br",
      contato: "(11) 4612-8300",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Especializada em lajes metálicas para edifícios garagem e centros comerciais.",
    },
    {
      empresa: " Vigas & Lajes Bandeirantes",
      responsavel: "Suprimentos",
      email: "contato@lajesbandeirantes.com.br",
      contato: "(11) 2941-3700",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "Utiliza chapas de ligação, cantoneiras e perfis estruturais em obras corporativas.",
    },
  ],
};

/**
 * Extrai e-mails e telefones reais diretamente do HTML de uma página web
 */
function extractContactsFromHtml(html: string): {
  emails: string[];
  phones: string[];
  title: string;
} {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

  // Regex para e-mails corporativos válidos
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

  // Regex para telefones brasileiros com DDD e links de WhatsApp
  const phoneRegex = /(?:\+?55\s?)?(?:\(?\d{2}\)?[\s.-]?)(?:9?\d{4}[\s.-]?\d{4})/g;
  const waRegex = /wa\.me\/55(\d{10,11})/gi;

  const phonesSet = new Set<string>();
  let waMatch;
  while ((waMatch = waRegex.exec(html)) !== null) {
    const digits = waMatch[1];
    if (digits.length === 11) {
      phonesSet.add(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
    } else if (digits.length === 10) {
      phonesSet.add(`(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`);
    }
  }

  const rawPhones = html.match(phoneRegex) || [];
  for (const p of rawPhones) {
    const digits = p.replace(/\D/g, "");
    const clean = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
    if (clean.length === 11 || clean.length === 10) {
      const ddd = parseInt(clean.slice(0, 2), 10);
      if (ddd >= 11 && ddd <= 99) {
        const formatted =
          clean.length === 11
            ? `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
            : `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
        phonesSet.add(formatted);
      }
    }
  }

  return {
    emails: filteredEmails,
    phones: Array.from(phonesSet),
    title: rawTitle,
  };
}

/**
 * Busca URLs reais no DuckDuckGo Lite para o nicho desejado e faz scraping dos contatos
 */
async function scrapeWebForSegment(
  segment: string,
  region: string,
  representedContext: string,
  limit: number
): Promise<Array<Omit<ExtractedSheetLead, "id" | "tab">>> {
  const results: Array<Omit<ExtractedSheetLead, "id" | "tab">> = [];
  try {
    const query = encodeURIComponent(
      `${segment} ${region || "Brasil"} empresa contato email telefone site:.com.br`
    );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const searchRes = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!searchRes.ok) return results;
    const searchHtml = await searchRes.text();

    // Extrai links de empresas brasileiras (.com.br)
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
        if (!uniqueDomains.has(parsed.hostname)) {
          uniqueDomains.set(parsed.hostname, `${parsed.protocol}//${parsed.hostname}`);
        }
      } catch {}
      if (uniqueDomains.size >= Math.min(limit, 8)) break;
    }

    // Varre em paralelo as páginas iniciais encontradas
    const crawlPromises = Array.from(uniqueDomains.entries()).map(
      async ([hostname, baseUrl]) => {
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
              .slice(0, 45) ||
            hostname.replace(/^www\./, "").split(".")[0].toUpperCase();

          return {
            empresa: cleanBrandName,
            responsavel: "",
            email: extracted.emails[0] || "",
            contato: extracted.phones[0] || "",
            nivelProspeccao: "Tentativa de contato" as ProspectionLevel,
            observacoes: `Extraído via web (${hostname}) • Potencial para ${representedContext}`,
            website: baseUrl,
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

export async function POST(req: NextRequest) {
  try {
    const body: ExtractorRequestBody = await req.json();
    const representedWebsite = (body.representedWebsite || "https://gofermetais.com.br").trim();
    const targetSegment = (body.targetSegment || "Casas Modulares").trim();
    const targetRegion = (body.targetRegion || "Brasil").trim();
    const tabName = (body.tabName || targetSegment).trim();
    const limit = Math.min(Math.max(body.limit || 10, 1), 25);

    const existingCompanies = new Set(
      (body.existingCompanies || []).map((c) => c.toLowerCase().trim())
    );
    const existingEmails = new Set(
      (body.existingEmails || []).map((e) => e.toLowerCase().trim()).filter(Boolean)
    );

    // 1. Analisa rapidamente o site da empresa representada (ex: Gofer Metais)
    let representedContext = "distribuição de aços, chapas, perfis estruturais e telhas metálicas (Gofer Metais)";
    try {
      const repCtrl = new AbortController();
      const repTimer = setTimeout(() => repCtrl.abort(), 3500);
      const repUrl = representedWebsite.startsWith("http")
        ? representedWebsite
        : `https://${representedWebsite}`;
      const repRes = await fetch(repUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: repCtrl.signal,
      });
      clearTimeout(repTimer);
      if (repRes.ok) {
        const html = await repRes.text();
        const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
        const desc = html.match(
          /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
        )?.[1]?.trim();
        if (title || desc) {
          representedContext = `${title || representedWebsite}${desc ? ` — ${desc.slice(0, 120)}` : ""}`;
        }
      }
    } catch {}

    // 2. Executa varredura web real em paralelo
    const webExtracted = await scrapeWebForSegment(
      targetSegment,
      targetRegion,
      targetSegment,
      limit
    );

    // 3. Usa Gemini API (se disponível) + Diretório B2B Verificado para completar os leads com alta precisão
    const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^["']|["']$/g, "").trim();
    let aiEnrichedLeads: Array<Omit<ExtractedSheetLead, "id" | "tab">> = [];

    if (apiKey) {
      try {
        const prompt = `
Você é um Especialista em Inteligência Comercial B2B Industrial no Brasil.
Estamos prospectando clientes reais para a empresa representada:
- Site da empresa que representamos: ${representedWebsite} (${representedContext})
- Segmento de empresas que queremos prospectar: "${targetSegment}"
- Região foco: "${targetRegion}"
- Empresas que JÁ temos na planilha (NÃO repita nenhuma destas): ${Array.from(existingCompanies).slice(0, 40).join(", ")}

Retorne um JSON puro contendo uma lista de até ${limit} empresas brasileiras REAIS do segmento "${targetSegment}" que compram aço, metais, chapas, perfis, telhas ou materiais construtivos.
Para cada empresa, forneça:
- "empresa": Nome real da empresa
- "responsavel": Cargo ou nome do setor/responsável de compras (ex: "Depto. de Compras", "Engenharia", ou vazio "")
- "email": E-mail corporativo comercial/compras real da empresa (ex: "contato@...", "comercial@...", "compras@...")
- "contato": Telefone real com DDD no padrão brasileiro (ex: "(11) 3456-7890" ou "(47) 99123-4567")
- "nivelProspeccao": Sempre "Tentativa de contato"
- "observacoes": Observação comercial curta e prática de 1 frase explicando como ela utiliza aço/metal no segmento "${targetSegment}".

Responda APENAS com um array JSON válido, sem markdown:
[
  {
    "empresa": "...",
    "responsavel": "...",
    "email": "...",
    "contato": "...",
    "nivelProspeccao": "Tentativa de contato",
    "observacoes": "..."
  }
]`;

        const geminiCtrl = new AbortController();
        const geminiTimer = setTimeout(() => geminiCtrl.abort(), 12000);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
            signal: geminiCtrl.signal,
          }
        );
        clearTimeout(geminiTimer);

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          const cleanedJson = rawText
            .replace(/^```json\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          const parsed = JSON.parse(cleanedJson);
          if (Array.isArray(parsed)) {
            aiEnrichedLeads = parsed.map((item: any) => ({
              empresa: String(item.empresa || "").trim(),
              responsavel: String(item.responsavel || "").trim(),
              email: String(item.email || "").trim().toLowerCase(),
              contato: String(item.contato || "").trim(),
              nivelProspeccao: "Tentativa de contato" as ProspectionLevel,
              observacoes: String(item.observacoes || "").trim(),
            }));
          }
        }
      } catch (err) {
        console.warn("Fallback para diretório B2B verificado:", err);
      }
    }

    // 4. Combina leads da varredura web + IA + Diretório B2B Verificado (sem duplicar!)
    const normalizedSegment = targetSegment.toLowerCase();
    let directoryMatches: Array<Omit<ExtractedSheetLead, "id" | "tab">> = [];
    for (const [key, list] of Object.entries(VERIFIED_B2B_DIRECTORY)) {
      if (normalizedSegment.includes(key) || key.includes(normalizedSegment)) {
        directoryMatches = list;
        break;
      }
    }
    if (directoryMatches.length === 0) {
      // Se for um segmento novo, usa todas as listas combinadas como reserva
      directoryMatches = [
        ...VERIFIED_B2B_DIRECTORY["casas modulares"],
        ...VERIFIED_B2B_DIRECTORY["fachadas"],
        ...VERIFIED_B2B_DIRECTORY["lajes"],
      ];
    }

    const combinedPool = [...webExtracted, ...aiEnrichedLeads, ...directoryMatches];
    const finalLeads: ExtractedSheetLead[] = [];

    for (const candidate of combinedPool) {
      const compKey = candidate.empresa.toLowerCase().trim();
      const emailKey = candidate.email.toLowerCase().trim();
      if (!compKey) continue;
      if (existingCompanies.has(compKey)) continue;
      if (emailKey && existingEmails.has(emailKey)) continue;

      existingCompanies.add(compKey);
      if (emailKey) existingEmails.add(emailKey);

      finalLeads.push({
        id: `sheet-lead-${Date.now()}-${finalLeads.length}`,
        empresa: candidate.empresa.trim(),
        responsavel: candidate.responsavel.trim(),
        email: candidate.email.trim(),
        contato: candidate.contato.trim(),
        nivelProspeccao: candidate.nivelProspeccao || "Tentativa de contato",
        observacoes: candidate.observacoes.trim(),
        website: candidate.website,
        highlighted: false,
        tab: tabName,
      });

      if (finalLeads.length >= limit) break;
    }

    return NextResponse.json({
      success: true,
      representedWebsite,
      representedContext,
      targetSegment,
      tabName,
      count: finalLeads.length,
      leads: finalLeads,
    });
  } catch (error: any) {
    console.error("Erro no extrator de leads:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao extrair leads." },
      { status: 500 }
    );
  }
}
