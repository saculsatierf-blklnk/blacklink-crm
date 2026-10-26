import { NextRequest, NextResponse } from "next/server";
import type { ExtractedSheetLead, ProspectionLevel } from "../lead-extractor/route";
import {
  sanitizeCnpj,
  extractCanonicalDomain,
  sanitizePhoneE164,
} from "@/lib/deduplication";

export const dynamic = "force-dynamic";

const DEFAULT_SPREADSHEET_ID = "1m9Gjeb9UxLJ1aDgPOWOLmKzCqRf7CPkFfYXSGDJpUXA";

export function extractSpreadsheetId(urlOrId?: string): string {
  if (!urlOrId) return DEFAULT_SPREADSHEET_ID;
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return urlOrId.trim() || DEFAULT_SPREADSHEET_ID;
}

/**
 * GET /api/crm/sheets-sync
 * Lê em tempo real as colunas e linhas existentes na aba da planilha do Google Sheets (Data Warehouse)
 * para contextualizar buscas e alimentar o motor anti-duplicidade antes de novos inputs.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheetUrl = searchParams.get("sheetUrl") || DEFAULT_SPREADSHEET_ID;
    const tabName = searchParams.get("tabName") || "Casas Modulares";
    const webhookUrl = (
      searchParams.get("webhookUrl") ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      ""
    ).trim();

    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    const validSpreadsheetId =
      spreadsheetId && spreadsheetId !== DEFAULT_SPREADSHEET_ID
        ? spreadsheetId
        : "";

    // 1. Se houver Apps Script Webhook com doGet configurado, tenta ler via Webhook primeiro
    if (webhookUrl) {
      try {
        const whCtrl = new AbortController();
        const whTimer = setTimeout(() => whCtrl.abort(), 7000);
        const query = `tabName=${encodeURIComponent(tabName)}${
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
              spreadsheetId: whJson.spreadsheetId || validSpreadsheetId,
              spreadsheetUrl: whJson.spreadsheetUrl || "",
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

    // 2. Leitura direta via Google Visualization API (gviz/tq) para planilhas acessíveis por link
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${validSpreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);

    const res = await fetch(gvizUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        spreadsheetId: validSpreadsheetId,
        tabName,
        error:
          "Sua planilha está privada para leitura por link. No Google Sheets, clique em 'Compartilhar -> Qualquer pessoa com o link' ou conecte o Apps Script.",
      });
    }

    const rawText = await res.text();
    const jsonMatch = rawText.match(
      /google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/
    );

    if (!jsonMatch || !jsonMatch[1]) {
      return NextResponse.json({
        success: false,
        spreadsheetId,
        tabName,
        error: "Formato inesperado ao ler planilha.",
      });
    }

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
      const email = getVal(2).toLowerCase();
      const rawPhone = getVal(3);
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

    return NextResponse.json({
      success: true,
      source: "google_gviz_live",
      spreadsheetId,
      tabName,
      columns:
        cols.length > 0
          ? cols
          : [
              "Empresa",
              "Responsável",
              "E-mail",
              "Contato",
              "Nível de Prospecção",
              "Observações",
            ],
      rows: mappedRows,
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
