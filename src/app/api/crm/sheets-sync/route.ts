import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ExtractedSheetLead, ProspectionLevel } from "../lead-extractor/route";
import {
  sanitizeCnpj,
  extractCanonicalDomain,
  sanitizePhoneE164,
  formatPhoneBrDisplay,
  decodeHtmlEntities,
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
        empresa: decodeHtmlEntities(empresa),
        cnpj,
        responsavel,
        email,
        contato: formatPhoneBrDisplay(rawPhone) || sanitizePhoneE164(rawPhone) || rawPhone,
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

interface TabBatchPayload {
  tabName: string;
  leads: ExtractedSheetLead[];
  replaceAllInTab?: boolean;
}

interface SheetsSyncRequestBody {
  action?: "sync" | "create_spreadsheet";
  spreadsheetTitle?: string;
  initialTabs?: string[];
  webhookUrl?: string;
  sheetUrl?: string;
  spreadsheetId?: string;
  tabName?: string;
  myCompany?: string;
  targetSector?: string;
  leads?: ExtractedSheetLead[];
  batches?: TabBatchPayload[];
  replaceAllInTab?: boolean;
  campaignWebhookUrl?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
}

async function resolveGoogleOAuthToken(
  reqAccessToken?: string,
  reqRefreshToken?: string
): Promise<string | null> {
  let accessToken = (reqAccessToken || "").trim();
  let refreshToken = (reqRefreshToken || "").trim();

  try {
    const cookieStore = await cookies();
    if (!accessToken) {
      accessToken = cookieStore.get("google_sheets_access_token")?.value || "";
    }
    if (!refreshToken) {
      refreshToken =
        cookieStore.get("google_sheets_refresh_token")?.value || "";
    }
  } catch {}

  if (!accessToken && refreshToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (clientId && clientSecret) {
      try {
        const res = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
          }),
        });
        const data = await res.json();
        if (res.ok && data.access_token) {
          return String(data.access_token);
        }
      } catch {}
    }
  }

  return accessToken || null;
}

async function syncViaGoogleSheetsApiV4(
  accessToken: string,
  spreadsheetId: string,
  batches: TabBatchPayload[]
): Promise<{
  ok: boolean;
  added: number;
  merged: number;
  tabsSynced: string[];
  error?: string;
}> {
  try {
    // 1. Descobre abas atuais na planilha via Google Sheets API v4
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}?fields=sheets.properties`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!metaRes.ok) {
      const errData = await metaRes.json().catch(() => ({}));
      return {
        ok: false,
        added: 0,
        merged: 0,
        tabsSynced: [],
        error:
          errData?.error?.message ||
          `Google Sheets API retornou status ${metaRes.status}.`,
      };
    }

    const metaJson = await metaRes.json();
    const existingSheetNames = new Set<string>(
      (metaJson?.sheets || [])
        .map((s: any) => String(s?.properties?.title || "").trim())
        .filter(Boolean)
    );

    // 2. Cria automaticamente qualquer aba que ainda não exista na planilha Google Sheets
    const missingTabs = batches
      .map((b) => b.tabName.trim())
      .filter((t) => t && !existingSheetNames.has(t));

    if (missingTabs.length > 0) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
          spreadsheetId
        )}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: missingTabs.map((title) => ({
              addSheet: { properties: { title } },
            })),
          }),
        }
      );
    }

    let totalAdded = 0;
    let totalMerged = 0;
    const tabsSynced: string[] = [];

    // 3. Para cada aba, lê as linhas atuais, faz o merge anti-duplicidade e grava no Google Sheets
    for (const batch of batches) {
      const tName = batch.tabName.trim();
      if (!tName) continue;

      const getRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
          spreadsheetId
        )}/values/${encodeURIComponent(tName)}!A1:F500`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      let existingValues: string[][] = [];
      if (getRes.ok) {
        const getJson = await getRes.json();
        if (Array.isArray(getJson?.values)) {
          existingValues = getJson.values;
        }
      }

      const headerRow = [
        "Empresa",
        "Responsável",
        "E-mail",
        "Contato",
        "Nível de Prospecção",
        "Observações",
      ];

      const dataRows: string[][] = batch.replaceAllInTab
        ? []
        : existingValues
            .slice(1)
            .filter(
              (r) =>
                r &&
                r[0] &&
                String(r[0]).trim().toLowerCase() !== "empresa"
            )
            .map((r) => [
              String(r[0] || ""),
              String(r[1] || ""),
              String(r[2] || ""),
              String(r[3] || ""),
              String(r[4] || "Tentativa de contato"),
              String(r[5] || ""),
            ]);

      const domainIdx = new Map<string, number>();
      const phoneIdx = new Map<string, number>();
      const nameIdx = new Map<string, number>();

      dataRows.forEach((r, idx) => {
        const dom = extractCanonicalDomain(r[2], "");
        const ph = sanitizePhoneE164(r[3]);
        const nm = r[0].toLowerCase().trim();
        if (dom && !dom.startsWith("freemail:")) domainIdx.set(dom, idx);
        if (ph) phoneIdx.set(ph, idx);
        if (nm) nameIdx.set(nm, idx);
      });

      for (const lead of batch.leads) {
        const emp = decodeHtmlEntities((lead.empresa || "").trim());
        if (!emp) continue;
        const resp = (lead.responsavel || "").trim();
        const em = (lead.email || "").trim().toLowerCase();
        const cont =
          formatPhoneBrDisplay(lead.contato) ||
          sanitizePhoneE164(lead.contato) ||
          (lead.contato || "").trim();
        const niv = lead.nivelProspeccao || "Tentativa de contato";
        const obs = (lead.observacoes || "").trim();

        const dom = extractCanonicalDomain(em, lead.website);
        const ph = sanitizePhoneE164(cont);
        const nm = emp.toLowerCase();

        const matchIndex =
          (dom && !dom.startsWith("freemail:") ? domainIdx.get(dom) : undefined) ??
          (ph ? phoneIdx.get(ph) : undefined) ??
          nameIdx.get(nm);

        if (matchIndex !== undefined && !batch.replaceAllInTab) {
          const cur = dataRows[matchIndex];
          let changed = false;
          if (!cur[1] && resp) {
            cur[1] = resp;
            changed = true;
          }
          if (!cur[2] && em) {
            cur[2] = em;
            changed = true;
          }
          if (!cur[3] && cont) {
            cur[3] = cont;
            changed = true;
          }
          if (niv && cur[4] !== niv && niv !== "Tentativa de contato") {
            cur[4] = niv;
            changed = true;
          }
          if (obs && cur[5] !== obs) {
            cur[5] = obs;
            changed = true;
          }
          if (changed) totalMerged++;
        } else {
          const newIdx = dataRows.length;
          dataRows.push([emp, resp, em, cont, niv, obs]);
          if (dom && !dom.startsWith("freemail:")) domainIdx.set(dom, newIdx);
          if (ph) phoneIdx.set(ph, newIdx);
          nameIdx.set(nm, newIdx);
          totalAdded++;
        }
      }

      const finalValues = [headerRow, ...dataRows];
      const putRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
          spreadsheetId
        )}/values/${encodeURIComponent(
          tName
        )}!A1:F${finalValues.length}?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            range: `${tName}!A1:F${finalValues.length}`,
            majorDimension: "ROWS",
            values: finalValues,
          }),
        }
      );

      if (putRes.ok) {
        tabsSynced.push(tName);
      }
    }

    return {
      ok: tabsSynced.length > 0,
      added: totalAdded,
      merged: totalMerged,
      tabsSynced,
    };
  } catch (err: any) {
    return {
      ok: false,
      added: 0,
      merged: 0,
      tabsSynced: [],
      error: err?.message || "Erro na API do Google Sheets.",
    };
  }
}

/**
 * POST /api/crm/sheets-sync
 * Sincroniza todas as abas e leads ou cria novas planilhas no Google Sheets
 * via Google Sheets API v4 (OAuth 1 Clique) OU Google Apps Script Webhook.
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
    const extractedId =
      body.spreadsheetId ||
      (body.sheetUrl ? extractSpreadsheetId(body.sheetUrl) : "");
    const validSpreadsheetId = extractedId || DEFAULT_SPREADSHEET_ID;

    const batches: TabBatchPayload[] =
      Array.isArray(body.batches) && body.batches.length > 0
        ? body.batches
        : [{ tabName, leads, replaceAllInTab: Boolean(body.replaceAllInTab) }];

    // 1. Tenta gravar diretamente via Google Sheets REST API v4 (OAuth 1 Clique)
    const oauthToken = await resolveGoogleOAuthToken(
      body.googleAccessToken,
      body.googleRefreshToken
    );

    if (oauthToken && body.action !== "create_spreadsheet") {
      const apiResult = await syncViaGoogleSheetsApiV4(
        oauthToken,
        validSpreadsheetId,
        batches
      );
      if (apiResult.ok) {
        return NextResponse.json({
          success: true,
          source: "google_sheets_api_v4",
          tabName,
          tabsSynced: apiResult.tabsSynced,
          added: apiResult.added,
          merged: apiResult.merged,
          syncedCount: batches.reduce((acc, b) => acc + b.leads.length, 0),
        });
      }
      // Se falhou e não há webhookUrl, retorna o motivo exato
      if (!webhookUrl) {
        return NextResponse.json(
          {
            success: false,
            needsSetup: true,
            error:
              apiResult.error ||
              "Sua sessão Google OAuth não tem permissão de escrita nesta planilha. Conecte o Apps Script ou autorize o Google Sheets.",
          },
          { status: 400 }
        );
      }
    }

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          needsSetup: true,
          error:
            "Para o CRM inserir abas e leads diretamente dentro do seu Google Sheets ('Leads'), ative a Gravação no botão 'Ativar Gravação Direta no Google Sheets' (leva 30 segundos).",
        },
        { status: 400 }
      );
    }

    // 2. Grava via Google Apps Script Web App (suporta múltiplas abas em lote ou chamada por aba)
    let totalSyncedCount = 0;
    const syncedTabsList: string[] = [];
    let lastDetails: any = null;

    if (body.action === "create_spreadsheet") {
      const createPayload = {
        action: "create_spreadsheet",
        spreadsheetTitle: body.spreadsheetTitle || "Leads",
        initialTabs: body.initialTabs || [tabName],
        spreadsheetId: validSpreadsheetId,
      };
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
        redirect: "follow",
      });
      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
      return NextResponse.json({
        success: res.ok,
        ...parsed,
      });
    }

    // Sincroniza cada aba do lote para garantir compatibilidade total com qualquer versão do Apps Script instalada
    for (const batch of batches) {
      const currentTab = (batch.tabName || tabName).trim();
      const currentLeads = Array.isArray(batch.leads) ? batch.leads : [];

      const payload = {
        action: "sync",
        spreadsheetTitle: body.spreadsheetTitle || "Leads",
        initialTabs: batches.map((b) => b.tabName),
        spreadsheetId: validSpreadsheetId,
        tabName: currentTab,
        myCompany: body.myCompany || "Gofer Metais",
        targetSector: body.targetSector || currentTab,
        replaceAllInTab: Boolean(batch.replaceAllInTab),
        rows: currentLeads.map((l) => ({
          empresa: decodeHtmlEntities((l.empresa || "").trim()),
          cnpj: sanitizeCnpj(l.cnpj),
          domain: extractCanonicalDomain(l.email, l.website),
          responsavel: (l.responsavel || "").trim(),
          email: (l.email || "").trim().toLowerCase(),
          contato:
            formatPhoneBrDisplay(l.contato) ||
            sanitizePhoneE164(l.contato) ||
            (l.contato || "").trim(),
          nivelProspeccao: l.nivelProspeccao || "Tentativa de contato",
          observacoes: (l.observacoes || "").trim(),
          campanha:
            l.campanha || `${body.myCompany || "Gofer Metais"} • ${currentTab}`,
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
      try {
        lastDetails = JSON.parse(text);
      } catch {
        lastDetails = { raw: text };
      }

      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Google Sheets retornou status ${res.status}. Verifique se o Web App está publicado como 'Qualquer pessoa'.`,
            details: lastDetails,
          },
          { status: 502 }
        );
      }

      totalSyncedCount += currentLeads.length;
      syncedTabsList.push(currentTab);
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
            tabsSynced: syncedTabsList,
            count: totalSyncedCount,
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
      source: "apps_script_webhook",
      tabName,
      tabsSynced: syncedTabsList,
      syncedCount: totalSyncedCount,
      campaignDispatched,
      details: lastDetails,
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
