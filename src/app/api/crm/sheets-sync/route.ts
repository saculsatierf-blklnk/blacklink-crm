import { NextRequest, NextResponse } from "next/server";
import type { ExtractedSheetLead, ProspectionLevel } from "../lead-extractor/route";
import {
  sanitizeCnpj,
  extractCanonicalDomain,
  sanitizePhoneE164,
} from "@/lib/deduplication";

export const dynamic = "force-dynamic";

const DEFAULT_SPREADSHEET_ID = "1m9Gjeb9UxLJ1aDgPOWOLmKzCqRf7CPkFFyXSGDJpUXA";

export function extractSpreadsheetId(urlOrId?: string): string {
  if (!urlOrId) return DEFAULT_SPREADSHEET_ID;
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return urlOrId.trim() || DEFAULT_SPREADSHEET_ID;
}

async function discoverGoogleSheetMetadata(spreadsheetId: string): Promise<{
  title: string | null;
  tabs: string[];
}> {
  const discoveredTabs: string[] = [];
  let title: string | null = null;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const htmlRes = await fetch(
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/htmlview`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: ctrl.signal,
      }
    );
    clearTimeout(timer);

    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch?.[1]) {
        title = titleMatch[1]
          .replace(/\s*-\s*Google\s*(Planilhas|Sheets|Drive).*$/i, "")
          .trim();
      }
      // Extrai nomes das abas do menu do htmlview: items.push({name: "Casas Modulares", ...})
      const nameMatches = html.matchAll(/name:\s*"([^"]+)"/g);
      for (const m of nameMatches) {
        const candidate = m[1]?.trim();
        if (candidate && !discoveredTabs.includes(candidate)) {
          discoveredTabs.push(candidate);
        }
      }
      // Fallback: <li id="sheet-button-..."><a>Nome da Aba</a>
      if (discoveredTabs.length === 0) {
        const tabBtnMatches = html.matchAll(
          /id="sheet-button-[^"]*"[^>]*>\s*<a[^>]*>([^<]+)<\/a>/gi
        );
        for (const m of tabBtnMatches) {
          const candidate = m[1]?.trim();
          if (candidate && !discoveredTabs.includes(candidate)) {
            discoveredTabs.push(candidate);
          }
        }
      }
    }
  } catch {}

  return { title, tabs: discoveredTabs };
}

async function fetchSingleTabViaGviz(
  spreadsheetId: string,
  tabName: string
): Promise<{ ok: boolean; cols: string[]; rows: ExtractedSheetLead[] }> {
  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&headers=1&sheet=${encodeURIComponent(
      tabName
    )}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);

    const res = await fetch(gvizUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return { ok: false, cols: [], rows: [] };

    const rawText = await res.text();
    const jsonMatch = rawText.match(
      /google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/
    );
    if (!jsonMatch || !jsonMatch[1]) return { ok: false, cols: [], rows: [] };

    const parsed = JSON.parse(jsonMatch[1]);
    const cols: string[] = (parsed?.table?.cols || [])
      .map((c: any) => String(c?.label || "").trim())
      .filter(Boolean);

    const rawRows: any[] = parsed?.table?.rows || [];
    const mappedRows: ExtractedSheetLead[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const cells = rawRows[i]?.c || [];
      const getVal = (idx: number) =>
        cells[idx]?.v !== null && cells[idx]?.v !== undefined
          ? String(cells[idx].v).trim()
          : "";

      const empresa = getVal(0);
      if (!empresa || empresa.toLowerCase() === "empresa") continue;

      const responsavel = getVal(1);
      const rawEmail = getVal(2).toLowerCase();
      const email = rawEmail.includes("@") ? rawEmail : "";
      const rawPhone = getVal(3) || (!rawEmail.includes("@") ? rawEmail : "");
      const nivel = (getVal(4) || "Tentativa de contato") as ProspectionLevel;
      const observacoes = getVal(5);
      const cnpj = sanitizeCnpj(getVal(6));

      mappedRows.push({
        id: `gviz-${tabName}-${i}`,
        empresa,
        cnpj,
        responsavel,
        email,
        contato: sanitizePhoneE164(rawPhone) || rawPhone,
        nivelProspeccao: nivel,
        observacoes,
        website: extractCanonicalDomain(email, ""),
        highlighted: false,
        tab: tabName,
      });
    }

    return { ok: true, cols, rows: mappedRows };
  } catch {
    return { ok: false, cols: [], rows: [] };
  }
}

/**
 * GET /api/crm/sheets-sync
 * Lê em tempo real TODAS as abas e linhas existentes na planilha do Google Sheets
 * (via Apps Script ou Google Visualization API) para que o usuário navegue entre todas as abas e planilhas.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheetUrl = searchParams.get("sheetUrl") || DEFAULT_SPREADSHEET_ID;
    const tabName = searchParams.get("tabName") || "Casas Modulares";
    const readAllTabs = searchParams.get("readAllTabs") !== "false";
    const knownTabsParam = searchParams.get("knownTabs") || "";
    const webhookUrl = (
      searchParams.get("webhookUrl") ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      ""
    ).trim();

    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    const validSpreadsheetId = spreadsheetId || DEFAULT_SPREADSHEET_ID;

    // 1. Se houver Apps Script Webhook com doGet configurado, lê todas as abas e planilhas via Webhook
    if (webhookUrl) {
      try {
        const whCtrl = new AbortController();
        const whTimer = setTimeout(() => whCtrl.abort(), 9000);
        const query = `tabName=${encodeURIComponent(
          tabName
        )}&readAllTabs=${readAllTabs ? "true" : "false"}${
          validSpreadsheetId
            ? `&spreadsheetId=${encodeURIComponent(validSpreadsheetId)}`
            : ""
        }`;
        const whRes = await fetch(
          `${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}${query}`,
          { method: "GET", redirect: "follow", signal: whCtrl.signal }
        );
        clearTimeout(whTimer);

        if (whRes.ok) {
          const whJson = await whRes.json();
          if (whJson && Array.isArray(whJson.rows)) {
            return NextResponse.json({
              success: true,
              source: "apps_script_webhook",
              title: whJson.title || null,
              spreadsheetId: whJson.spreadsheetId || validSpreadsheetId,
              spreadsheetUrl: whJson.spreadsheetUrl || "",
              tabs: Array.isArray(whJson.tabs) ? whJson.tabs : undefined,
              driveSpreadsheets: Array.isArray(whJson.driveSpreadsheets)
                ? whJson.driveSpreadsheets
                : undefined,
              tabName,
              columns: whJson.columns || [
                "Empresa",
                "Responsável",
                "E-mail",
                "Contato",
                "Nível de Prospecção",
                "Observações",
              ],
              rows: whJson.rows,
            });
          }
        }
      } catch {}
    }

    if (!validSpreadsheetId) {
      return NextResponse.json({
        success: false,
        needsSetup: true,
        error:
          "Cole o link da sua planilha do Google Sheets ou conecte o Apps Script na aba 'Conectar Google Sheets'.",
      });
    }

    // 2. Descobre automaticamente o título e TODAS as abas da planilha Google Sheets
    const metadata = await discoverGoogleSheetMetadata(validSpreadsheetId);
    const knownTabs = knownTabsParam
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const tabsToRead = readAllTabs
      ? metadata.tabs.length > 0
        ? metadata.tabs
        : Array.from(new Set([...knownTabs, tabName]))
      : [tabName];

    const tabResults = await Promise.all(
      tabsToRead.map(async (tName) => {
        const res = await fetchSingleTabViaGviz(validSpreadsheetId, tName);
        return { tabName: tName, ...res };
      })
    );

    const successfulTabs = tabResults.filter((r) => r.ok);
    if (successfulTabs.length === 0) {
      return NextResponse.json({
        success: false,
        spreadsheetId: validSpreadsheetId,
        tabName,
        error:
          "Sua planilha está restrita. No Google Sheets, clique no botão azul 'Compartilhar' (canto superior direito) -> mude para 'Qualquer pessoa com o link' OU conecte o Apps Script.",
      });
    }

    // Se uma aba conhecida não existe na planilha remota, o gviz retorna a 1ª aba repetida; deduplicamos se não veio do htmlview
    const finalTabs =
      metadata.tabs.length > 0
        ? metadata.tabs
        : successfulTabs.map((t) => t.tabName);

    const allMappedRows: ExtractedSheetLead[] = [];
    const seenPerTabSignature = new Set<string>();

    for (const tabRes of successfulTabs) {
      if (
        metadata.tabs.length > 0 &&
        !metadata.tabs.includes(tabRes.tabName)
      ) {
        continue;
      }
      // Evita duplicar a primeira aba quando uma aba pesquisada não existe no documento e o Google retorna a aba 0
      const signature = tabRes.rows
        .slice(0, 3)
        .map((r) => `${r.empresa}:${r.contato}`)
        .join("|");
      if (
        metadata.tabs.length === 0 &&
        tabRes.tabName !== tabName &&
        signature &&
        seenPerTabSignature.has(signature)
      ) {
        continue;
      }
      if (signature) seenPerTabSignature.add(signature);
      allMappedRows.push(...tabRes.rows);
    }

    return NextResponse.json({
      success: true,
      source: "google_gviz_live",
      title: metadata.title || null,
      spreadsheetId: validSpreadsheetId,
      tabs: finalTabs,
      tabName,
      columns: [
        "Empresa",
        "Responsável",
        "E-mail",
        "Contato",
        "Nível de Prospecção",
        "Observações",
      ],
      rows: allMappedRows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro ao ler planilha do Google Sheets.",
      },
      { status: 500 }
    );
  }
}

interface SheetsSyncRequestBody {
  action?: "sync" | "create_spreadsheet";
  spreadsheetTitle?: string;
  initialTabs?: string[];
  webhookUrl?: string;
  sheetUrl?: string;
  spreadsheetId?: string;
  tabName: string;
  myCompany?: string;
  targetSector?: string;
  leads: ExtractedSheetLead[];
  replaceAllInTab?: boolean;
  campaignWebhookUrl?: string;
}

/**
 * POST /api/crm/sheets-sync
 * Sincroniza leads ou cria novas planilhas no Google Sheets aplicando higienização canônica (CNPJ, Domínio e Telefone 5511999999999)
 */
export async function POST(req: NextRequest) {
  try {
    const body: SheetsSyncRequestBody = await req.json();
    const webhookUrl = (
      body.webhookUrl ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      ""
    ).trim();
    const campaignWebhookUrl = (
      body.campaignWebhookUrl ||
      process.env.CAMPAIGN_OUTBOUND_WEBHOOK_URL ||
      ""
    ).trim();
    const tabName = (body.tabName || "Casas Modulares").trim();
    const leads = Array.isArray(body.leads) ? body.leads : [];
    const extractedId = body.spreadsheetId || (body.sheetUrl ? extractSpreadsheetId(body.sheetUrl) : "");
    const validSpreadsheetId =
      extractedId && extractedId !== DEFAULT_SPREADSHEET_ID ? extractedId : "";

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          needsSetup: true,
          error:
            "Conecte a URL do Google Apps Script na aba 'Conectar Google Sheets' para sincronizar e criar planilhas automaticamente.",
        },
        { status: 400 }
      );
    }

    const payload = {
      action: body.action || "sync",
      spreadsheetTitle: body.spreadsheetTitle || "Nova Planilha Prospecção",
      initialTabs: body.initialTabs || [tabName],
      spreadsheetId: validSpreadsheetId,
      tabName,
      myCompany: body.myCompany || "Gofer Metais",
      targetSector: body.targetSector || tabName,
      replaceAllInTab: Boolean(body.replaceAllInTab),
      rows: leads.map((l) => ({
        empresa: (l.empresa || "").trim(),
        cnpj: sanitizeCnpj(l.cnpj),
        domain: extractCanonicalDomain(l.email, l.website),
        responsavel: (l.responsavel || "").trim(),
        email: (l.email || "").trim().toLowerCase(),
        contato: sanitizePhoneE164(l.contato) || (l.contato || "").trim(),
        nivelProspeccao: l.nivelProspeccao || "Tentativa de contato",
        observacoes: (l.observacoes || "").trim(),
        campanha: l.campanha || `${body.myCompany || "Gofer Metais"} • ${tabName}`,
        scriptAbordagem: l.scriptAbordagem || "",
        highlighted: Boolean(l.highlighted),
      })),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Google Sheets retornou status ${res.status}. Verifique se o Web App está publicado como 'Qualquer pessoa'.`,
          details: parsed,
        },
        { status: 502 }
      );
    }

    // Dispara Webhook de Campanha (n8n / WhatsApp / Automação) se configurado
    let campaignDispatched = false;
    if (campaignWebhookUrl) {
      try {
        await fetch(campaignWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "campaign.leads.synced",
            myCompany: body.myCompany || "Gofer Metais",
            targetSector: body.targetSector || tabName,
            tabName,
            count: payload.rows.length,
            leads: payload.rows,
            timestamp: new Date().toISOString(),
          }),
        });
        campaignDispatched = true;
      } catch (whErr) {
        console.warn("Aviso ao disparar webhook de campanha:", whErr);
      }
    }

    return NextResponse.json({
      success: true,
      tabName,
      syncedCount: leads.length,
      campaignDispatched,
      details: parsed,
    });
  } catch (error: any) {
    console.error("Erro ao sincronizar com Google Sheets:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Não foi possível conectar ao Web App do Google Sheets.",
      },
      { status: 500 }
    );
  }
}
