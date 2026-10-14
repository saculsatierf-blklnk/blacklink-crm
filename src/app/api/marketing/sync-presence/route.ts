import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface SyncPresenceRequestBody {
  website?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

const BLACKLINK_CANONICAL_FOOTPRINT = `
BLACK LINK HOLDING — DIRETRIZES OFICIAIS DE PRESENÇA DIGITAL (blklnk.com):
1. Missão & Filosofia: "Engenharia da Ausência" — Desenvolver softwares e infraestruturas comerciais de alta performance que eliminam atrito, burocracia e intervenções manuais. O objetivo é a soberania operacional e a máxima clareza técnica.
2. Portfólio de Soluções Ativas:
   - Black Link CRM OS: Plataforma de inteligência comercial sob medida para empresas B2B e holdings, substituindo planilhas e softwares genéricos por pipeline sob medida e telemetria real.
   - Engenharia de Automações & I.A. Operacional: Agentes autônomos com n8n e Python para enriquecimento de leads, follow-ups de alta precisão e eliminação de tarefas manuais.
   - Captação Cinematográfica em Megaeventos e Feiras Corporativas: Cobertura técnica de autoridade para estandes de alta visibilidade, transformando presença física em pipeline comercial duradouro.
   - Branding Soberano & Design Brutalista: Identidade visual de luxo inspirada na precisão suíça, alta moda contemporânea e renderização 3D monumental.
   - Protocolo Comercial de Vendas (blklnk.com/protocolo): Metodologia proprietária de vendas consultivas para fechamento de contratos de alto ticket.
3. Regras de Comunicação & Tom de Voz:
   - Tom: Executivo, analítico, firme, elegante e minimalista ("Engenharia da Ausência").
   - Proibições Rígidas: Sem jargões de marketing digital amador ("fature 7 dígitos", "arraste pra cima", "fórmula mágica"). Sem depoimentos forjados ou casos de clientes de terceiros.
   - Representação Humana: Estritamente modelos negros retintos quando rostos ou figuras humanas forem exibidos; posts de produto/3D são 100% livres de humanos.
4. Estratégia Bicanal Observável:
   - Instagram (@blacklink.tech): Vitrine estética de luxo e impacto monumental. Headlines de 2 a 4 palavras em caixa alta no padrão tipográfico suíço (Arina TVA). Estética 3D Octane e design brutalista.
   - LinkedIn (company/blacklink-holding): Thought leadership técnico para C-levels (CEOs, Diretores Comerciais, Fundadores). Carrosséis corporativos em Documento PDF de alta densidade analítica e artigos executivos com teses claras de negócios.
`.trim();

export async function POST(req: NextRequest) {
  try {
    const body: SyncPresenceRequestBody = await req.json().catch(() => ({}));
    const website = (body.website || "https://blklnk.com").trim();
    const instagramUrl = (body.instagramUrl || "https://instagram.com/blacklink.tech").trim();
    const linkedinUrl = (body.linkedinUrl || "https://linkedin.com/company/blacklink-holding").trim();

    // Extrai handles amigáveis a partir das URLs
    const instagramMatch = instagramUrl.match(/(?:instagram\.com\/|@)([a-zA-Z0-9._]+)/i);
    const instagramHandle = instagramMatch ? `@${instagramMatch[1].replace(/\/$/, "")}` : "@blacklink.tech";

    const linkedinMatch = linkedinUrl.match(/linkedin\.com\/(?:company|in)\/([a-zA-Z0-9-_]+)/i);
    const linkedinHandle = linkedinMatch ? linkedinMatch[1].replace(/\/$/, "") : "blacklink-holding";

    let scrapedSummary = "";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(website.startsWith("http") ? website : `https://${website}`, {
        headers: { "User-Agent": "BlackLinkPresenceBot/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        scrapedSummary = `Website detectado: ${titleMatch ? titleMatch[1].trim() : website}. ${metaDescMatch ? metaDescMatch[1].trim() : ""}`;
      }
    } catch {
      scrapedSummary = `Website oficial: ${website} (Sincronizado via infraestrutura de inteligência de marca Black Link)`;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    let digitalFootprintNotes = BLACKLINK_CANONICAL_FOOTPRINT;

    if (apiKey) {
      try {
        const prompt = `
Você é o Chief Brand Strategist da Black Link.
Analise a presença digital e canais oficiais da empresa:
- Website: ${website}
- Instagram: ${instagramUrl} (Handle: ${instagramHandle})
- LinkedIn: ${linkedinUrl} (Handle: ${linkedinHandle})
- Contexto de Varredura Web: ${scrapedSummary}
- Diretrizes Canônicas Black Link:
${BLACKLINK_CANONICAL_FOOTPRINT}

Gere uma síntese operacional executiva da atuação digital da Black Link em exatamente 2 parágrafos densos e elegantes:
1. Primeiro parágrafo: Identidade central, princípio da "Engenharia da Ausência", produtos proprietários (CRM OS, Automações de IA com n8n/Python, Captação de Autoridade em Feiras e Protocolo blklnk.com/protocolo) e público decisor C-level.
2. Segundo parágrafo: Diretrizes bicanais (Instagram para impacto estético e headlines monumentais de 2-4 palavras; LinkedIn para thought leadership executivo e carrosséis PDF corporativos). Relembre as proibições de jargões fáceis e a regra visual de modelos negros retintos.

Responda em texto puro e conciso sem markdown extravagante.
`;

        const geminiController = new AbortController();
        const geminiTimeout = setTimeout(() => geminiController.abort(), 7000);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.25,
                maxOutputTokens: 600,
                thinkingConfig: {
                  thinkingBudget: 0,
                },
              },
            }),
            signal: geminiController.signal,
          }
        );

        clearTimeout(geminiTimeout);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateParts = data?.candidates?.[0]?.content?.parts || [];
          let rawText = "";
          for (const p of candidateParts) {
            if (p.text && !p.thought) {
              rawText += p.text;
            }
          }
          if (!rawText && candidateParts[0]?.text) {
            rawText = candidateParts[0].text;
          }
          if (rawText && rawText.trim().length > 60) {
            digitalFootprintNotes = rawText.trim();
          }
        }
      } catch (e) {
        console.warn("[SyncPresence] Fallback para pegada canônica:", e);
      }
    }

    const nowIso = new Date().toISOString();

    return NextResponse.json({
      success: true,
      lastPresenceSync: nowIso,
      digitalFootprintNotes,
      companyProfile: {
        website,
        instagramUrl,
        linkedinUrl,
        instagram: instagramHandle,
        digitalFootprintNotes,
        lastPresenceSync: nowIso,
      },
      channels: {
        instagram: {
          url: instagramUrl,
          handle: instagramHandle,
          role: "Vitrine Estética Monumental & Mosaico 3x3",
          headlineFormat: "2 a 4 palavras em maiúsculas (padrão suíço)",
        },
        linkedin: {
          url: linkedinUrl,
          handle: linkedinHandle,
          role: "Thought Leadership Executivo & Carrosséis Documento PDF",
          headlineFormat: "Teses de engenharia e liderança para decisores C-Level",
        },
      },
      detectedPillars: [
        {
          id: "crm-os",
          title: "Black Link CRM OS",
          tag: "01 // SOFTWARE SOB MEDIDA",
          role: "Eliminação de planilhas e telemetria de vendas corporativas",
        },
        {
          id: "ia-automacoes",
          title: "Engenharia de Automações & IA",
          tag: "02 // AGENTES AUTÔNOMOS",
          role: "Processamento e enriquecimento automático de pipeline com n8n e Python",
        },
        {
          id: "marketing-branding",
          title: "Branding Soberano & Ausência",
          tag: "03 // LUXO BRUTALISTA",
          role: "Identidade visual suíça e autoridade estética internacional",
        },
        {
          id: "protocolo-simulador",
          title: "Protocolo de Vendas Consultivas",
          tag: "04 // FECHAMENTO HIGH-TICKET",
          role: "blklnk.com/protocolo — Engenharia comercial e negociação",
        },
        {
          id: "megaeventos",
          title: "Captação Cinematográfica em Feiras",
          tag: "05 // PRESENÇA FÍSICA VIP",
          role: "Transformação de estandes corporativos em ativos duradouros de autoridade",
        },
      ],
    });
  } catch (err: unknown) {
    console.error("[SyncPresence Error]:", err);
    return NextResponse.json(
      { error: "Erro ao sincronizar presença digital da Black Link." },
      { status: 500 }
    );
  }
}
