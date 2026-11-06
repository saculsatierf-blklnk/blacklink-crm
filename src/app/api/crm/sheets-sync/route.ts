import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";
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

export function isValidAppsScriptUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.trim();
  return (
    clean.startsWith("https://script.google.com/macros/s/") ||
    clean.startsWith("https://script.googleusercontent.com/")
  );
}

export function extractSpreadsheetId(urlOrId?: string): string {
  if (!urlOrId) return DEFAULT_SPREADSHEET_ID;
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  if (urlOrId.startsWith("http")) return DEFAULT_SPREADSHEET_ID;
  return urlOrId.trim() || DEFAULT_SPREADSHEET_ID;
}

interface StoredCrmSnapshot {
  spreadsheetId: string;
  title: string;
  batches: Array<{
    tabName: string;
    leads: ExtractedSheetLead[];
    replaceAllInTab?: boolean;
  }>;
  updatedAt: string;
}

const memorySnapshots: Map<string, StoredCrmSnapshot> =
  (globalThis as any).__crmSheetsSnapshots ||
  ((globalThis as any).__crmSheetsSnapshots = new Map<
    string,
    StoredCrmSnapshot
  >());

async function saveCrmSnapshot(
  spreadsheetId: string,
  title: string,
  batches: Array<{
    tabName: string;
    leads: ExtractedSheetLead[];
    replaceAllInTab?: boolean;
  }>
): Promise<void> {
  const existing = await getCrmSnapshot(spreadsheetId);
  const mergedTabMap = new Map<
    string,
    { tabName: string; leads: ExtractedSheetLead[]; replaceAllInTab?: boolean }
  >();

  if (existing && Array.isArray(existing.batches)) {
    for (const b of existing.batches) {
      if (b?.tabName) mergedTabMap.set(b.tabName, b);
    }
  }
  for (const b of batches) {
    if (!b?.tabName) continue;
    const prev = mergedTabMap.get(b.tabName);
    if (prev && !b.replaceAllInTab && prev.leads.length > 0 && b.leads.length > 0) {
      const seenKeys = new Set<string>();
      const combined: ExtractedSheetLead[] = [];
      for (const item of [...b.leads, ...prev.leads]) {
        const key = `${(item.empresa || "").toLowerCase().trim()}|${sanitizePhoneE164(
          item.contato || ""
        )}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          combined.push(item);
        }
      }
      mergedTabMap.set(b.tabName, {
        tabName: b.tabName,
        leads: combined,
        replaceAllInTab: false,
      });
    } else {
      mergedTabMap.set(b.tabName, b);
    }
  }

  const finalSnapshot: StoredCrmSnapshot = {
    spreadsheetId,
    title: title || existing?.title || "Leads",
    batches: Array.from(mergedTabMap.values()),
    updatedAt: new Date().toISOString(),
  };

  memorySnapshots.set(spreadsheetId, finalSnapshot);

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS crm_sheets_snapshots (
        spreadsheet_id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'Leads',
        batches JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const batchesJson = JSON.stringify(finalSnapshot.batches);
    await db.execute(sql`
      INSERT INTO crm_sheets_snapshots (spreadsheet_id, title, batches, updated_at)
      VALUES (${spreadsheetId}, ${finalSnapshot.title}, ${batchesJson}::jsonb, NOW())
      ON CONFLICT (spreadsheet_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        batches = EXCLUDED.batches,
        updated_at = NOW()
    `);
  } catch {}
}

async function getCrmSnapshot(
  spreadsheetId: string
): Promise<StoredCrmSnapshot | null> {
  try {
    const res: any = await db.execute(sql`
      SELECT spreadsheet_id, title, batches, updated_at
      FROM crm_sheets_snapshots
      WHERE spreadsheet_id = ${spreadsheetId}
      LIMIT 1
    `);
    const rows = Array.isArray(res) ? res : res?.rows || [];
    if (rows.length > 0 && rows[0]) {
      const row = rows[0];
      const parsedBatches =
        typeof row.batches === "string"
          ? JSON.parse(row.batches)
          : row.batches || [];
      const snap: StoredCrmSnapshot = {
        spreadsheetId: String(row.spreadsheet_id || spreadsheetId),
        title: String(row.title || "Leads"),
        batches: Array.isArray(parsedBatches) ? parsedBatches : [],
        updatedAt: String(row.updated_at || new Date().toISOString()),
      };
      memorySnapshots.set(spreadsheetId, snap);
      return snap;
    }
  } catch {}

  return memorySnapshots.get(spreadsheetId) || null;
}

async function discoverGoogleSheetMetadata(spreadsheetId: string): Promise<{
  title: string | null;
  tabs: string[];
  rawTabByDisplayTab: Record<string, string>;
}> {
  const discoveredTabs: string[] = [];
  const rawTabByDisplayTab: Record<string, string> = {};
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
        title = decodeHtmlEntities(
          titleMatch[1]
            .replace(/\s*-\s*Google\s*(Planilhas|Sheets|Drive).*$/i, "")
            .trim()
        );
      }
      // Extrai nomes das abas do menu do htmlview: items.push({name: "Casas Modulares", ...})
      const nameMatches = html.matchAll(/name:\s*"([^"]+)"/g);
      for (const m of nameMatches) {
        const rawName = m[1] || "";
        const display = rawName.trim();
        if (display && !discoveredTabs.includes(display)) {
          discoveredTabs.push(display);
          rawTabByDisplayTab[display] = rawName;
        }
      }
      // Fallback: <li id="sheet-button-..."><a>Nome da Aba</a>
      if (discoveredTabs.length === 0) {
        const tabBtnMatches = html.matchAll(
          /id="sheet-button-[^"]*"[^>]*>\s*<a[^>]*>([^<]+)<\/a>/gi
        );
        for (const m of tabBtnMatches) {
          const rawName = m[1] || "";
          const display = rawName.trim();
          if (display && !discoveredTabs.includes(display)) {
            discoveredTabs.push(display);
            rawTabByDisplayTab[display] = rawName;
          }
        }
      }
    }
  } catch {}

  return { title, tabs: discoveredTabs, rawTabByDisplayTab };
}

type ColumnSemanticRole =
  | "empresa"
  | "cidadeRegiao"
  | "contato"
  | "website"
  | "linhaProdutos"
  | "materiaisAco"
  | "argumentoHunter"
  | "statusOriginal"
  | "responsavel"
  | "email"
  | "observacoes"
  | "cnpj"
  | "unknown";

function classifyHeaderLabel(rawLabel: string): ColumnSemanticRole {
  const norm = rawLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (!norm) return "unknown";
  if (norm.includes("cnpj") || norm.includes("documento")) return "cnpj";
  if (
    norm === "empresa" ||
    norm.includes("nome da empresa") ||
    norm.includes("razao social") ||
    norm === "cliente"
  ) {
    return "empresa";
  }
  if (
    norm.includes("cidade") ||
    norm.includes("regiao") ||
    norm.includes("localizacao") ||
    norm.includes("municipio") ||
    norm === "uf" ||
    norm === "estado"
  ) {
    return "cidadeRegiao";
  }
  if (
    norm.includes("telefone") ||
    norm.includes("whatsapp") ||
    norm.includes("celular") ||
    norm.includes("fone") ||
    norm === "contato" ||
    norm === "tel"
  ) {
    return "contato";
  }
  if (
    norm.includes("site") ||
    norm.includes("website") ||
    norm.includes("dominio") ||
    norm === "url"
  ) {
    return "website";
  }
  if (
    norm.includes("linha principal") ||
    norm.includes("linha de produto") ||
    norm.includes("produtos") ||
    norm.includes("atuacao")
  ) {
    return "linhaProdutos";
  }
  if (
    norm.includes("materiais de aco") ||
    norm.includes("aco consumido") ||
    norm.includes("materiais") ||
    norm.includes("insumos")
  ) {
    return "materiaisAco";
  }
  if (
    norm.includes("argumento") ||
    norm.includes("abordagem hunter") ||
    norm.includes("pitch") ||
    norm.includes("script")
  ) {
    return "argumentoHunter";
  }
  if (
    norm.includes("status da prospeccao") ||
    norm.includes("nivel de prospeccao") ||
    norm.includes("status") ||
    norm.includes("nivel") ||
    norm.includes("etapa")
  ) {
    return "statusOriginal";
  }
  if (
    norm.includes("responsavel") ||
    norm.includes("decisor") ||
    norm.includes("comprador") ||
    norm.includes("pessoa")
  ) {
    return "responsavel";
  }
  if (norm.includes("e-mail") || norm.includes("email")) {
    return "email";
  }
  if (norm.includes("observac") || norm === "obs" || norm.includes("notas")) {
    return "observacoes";
  }
  return "unknown";
}

function mapRawStatusToProspectionLevel(rawStatus: string): ProspectionLevel {
  const s = (rawStatus || "").toLowerCase().trim();
  if (s.includes("reuni")) return "Reunião agendada";
  if (s.includes("em contato") || s.includes("negocia")) return "Em contato";
  if (s.includes("atendeu")) return "Atendeu";
  if (s.includes("catalogo") || s.includes("catálogo")) return "Catálogo enviado";
  return "Tentativa de contato";
}

async function fetchSingleTabViaGviz(
  spreadsheetId: string,
  displayTabName: string,
  rawTabName?: string,
  spreadsheetTitle?: string | null
): Promise<{ ok: boolean; cols: string[]; rows: ExtractedSheetLead[] }> {
  try {
    const queryTab = rawTabName || displayTabName;
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
      queryTab
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
    const rawCols: string[] = (parsed?.table?.cols || []).map((c: any) =>
      String(c?.label || "").trim()
    );

    const rawRows: any[] = parsed?.table?.rows || [];
    if (rawRows.length === 0) return { ok: true, cols: rawCols.filter(Boolean), rows: [] };

    const extractRowStrings = (rowObj: any): string[] => {
      const cells = rowObj?.c || [];
      return cells.map((cell: any) => {
        if (!cell) return "";
        const val = cell.f !== undefined && cell.f !== null ? cell.f : cell.v;
        return val !== undefined && val !== null ? String(val).trim() : "";
      });
    };

    const firstRowStrings = extractRowStrings(rawRows[0]);
    const colsHaveHeaders =
      rawCols.filter((l) => classifyHeaderLabel(l) !== "unknown").length >= 2;
    const firstRowIsHeader =
      firstRowStrings.filter((cell) => classifyHeaderLabel(cell) !== "unknown").length >= 2;

    const effectiveHeaders: string[] = firstRowIsHeader
      ? firstRowStrings
      : colsHaveHeaders
      ? rawCols
      : [];

    const startRowIdx = firstRowIsHeader ? 1 : 0;
    const roleByColIndex: ColumnSemanticRole[] = effectiveHeaders.map((h) =>
      classifyHeaderLabel(h)
    );

    const hasRecognizedHeader = roleByColIndex.some((r) => r !== "unknown");
    const cleanDisplayTab = displayTabName.trim();
    const mappedRows: ExtractedSheetLead[] = [];

    for (let i = startRowIdx; i < rawRows.length; i++) {
      const rowVals = extractRowStrings(rawRows[i]);
      if (rowVals.every((v) => !v)) continue;

      let empresa = "";
      let cidadeRegiao = "";
      let contato = "";
      let website = "";
      let linhaProdutos = "";
      let materiaisAco = "";
      let argumentoHunter = "";
      let statusOriginal = "";
      let responsavel = "";
      let email = "";
      let observacoes = "";
      let cnpj = "";

      if (hasRecognizedHeader) {
        for (let cIdx = 0; cIdx < rowVals.length; cIdx++) {
          const val = rowVals[cIdx];
          if (!val) continue;
          const role = roleByColIndex[cIdx] || "unknown";
          switch (role) {
            case "empresa":
              if (!empresa) empresa = val;
              break;
            case "cidadeRegiao":
              if (!cidadeRegiao) cidadeRegiao = val;
              break;
            case "contato":
              if (!contato) contato = val;
              break;
            case "website":
              if (!website) website = val;
              break;
            case "linhaProdutos":
              if (!linhaProdutos) linhaProdutos = val;
              break;
            case "materiaisAco":
              if (!materiaisAco) materiaisAco = val;
              break;
            case "argumentoHunter":
              if (!argumentoHunter) argumentoHunter = val;
              break;
            case "statusOriginal":
              if (!statusOriginal) statusOriginal = val;
              break;
            case "responsavel":
              if (!responsavel) responsavel = val;
              break;
            case "email":
              if (!email && val.includes("@")) email = val.toLowerCase();
              break;
            case "observacoes":
              if (!observacoes) observacoes = val;
              break;
            case "cnpj":
              if (!cnpj) cnpj = sanitizeCnpj(val);
              break;
            default:
              break;
          }
        }
      } else {
        // Fallback inteligente por heurística de conteúdo quando a planilha não tem linha de cabeçalho
        empresa = rowVals[0] || "";
        const col1 = rowVals[1] || "";
        const col2 = rowVals[2] || "";
        const col3 = rowVals[3] || "";
        const col4 = rowVals[4] || "";
        const col5 = rowVals[5] || "";
        const col6 = rowVals[6] || "";
        const col7 = rowVals[7] || "";

        // Detecta formato Clientes Âncora (Col 1 = Cidade - UF, Col 2 = Telefone, Col 3 = Site)
        const col1LooksLikeCity = /\s[-–]\s*[A-Z]{2}$/.test(col1);
        const col2LooksLikePhone = Boolean(sanitizePhoneE164(col2));
        const col3LooksLikeSite =
          col3.toLowerCase().startsWith("www.") || col3.toLowerCase().includes(".com");

        if (col1LooksLikeCity || (col2LooksLikePhone && col3LooksLikeSite)) {
          cidadeRegiao = col1;
          contato = col2;
          website = col3;
          linhaProdutos = col4;
          materiaisAco = col5;
          argumentoHunter = col6;
          statusOriginal = col7 || "A Ligar";
        } else {
          // Formato clássico 6 colunas: Empresa, Responsável, E-mail, Contato, Nível, Observações
          if (/\s[-–]\s*[A-Z]{2}$/.test(col1)) {
            cidadeRegiao = col1;
          } else {
            responsavel = col1;
          }
          if (col2.includes("@")) {
            email = col2.toLowerCase();
          } else if (Boolean(sanitizePhoneE164(col2))) {
            contato = col2;
          }
          if (Boolean(sanitizePhoneE164(col3))) {
            contato = col3;
          } else if (col3.toLowerCase().startsWith("www.") || col3.toLowerCase().includes(".com")) {
            website = col3;
          }
          statusOriginal = col4;
          observacoes = col5;
          cnpj = sanitizeCnpj(col6);
        }
      }

      if (
        !empresa ||
        empresa.toLowerCase() === "empresa" ||
        empresa.toLowerCase() === "nome da empresa"
      ) {
        continue;
      }

      // Garante que nunca um site fique no campo de telefone ou uma cidade fique em responsável
      if (responsavel && /\s[-–]\s*[A-Z]{2}$/.test(responsavel)) {
        if (!cidadeRegiao) cidadeRegiao = responsavel;
        responsavel = "";
      }
      if (
        contato &&
        !sanitizePhoneE164(contato) &&
        (contato.toLowerCase().startsWith("www.") || contato.toLowerCase().includes(".com"))
      ) {
        if (!website) website = contato;
        contato = "";
      }

      const canonicalSite =
        website.trim() || extractCanonicalDomain(email, "");

      // Se não houver observações manuais, compõe um resumo rico a partir dos dados técnicos
      const composedObs =
        observacoes ||
        [
          cidadeRegiao ? `[${cidadeRegiao}]` : "",
          materiaisAco ? `Materiais: ${materiaisAco}` : "",
          argumentoHunter ? `Abordagem: ${argumentoHunter}` : "",
        ]
          .filter(Boolean)
          .join(" · ");

      mappedRows.push({
        id: `gviz-${spreadsheetId.slice(0, 6)}-${cleanDisplayTab}-${i}`,
        empresa: decodeHtmlEntities(empresa),
        cnpj,
        responsavel,
        email,
        contato: formatPhoneBrDisplay(contato) || sanitizePhoneE164(contato) || contato,
        nivelProspeccao: mapRawStatusToProspectionLevel(statusOriginal),
        observacoes: composedObs,
        website: canonicalSite,
        scriptAbordagem: argumentoHunter || undefined,
        highlighted: Boolean(argumentoHunter || materiaisAco),
        tab: cleanDisplayTab,
        cidadeRegiao: cidadeRegiao || undefined,
        linhaProdutos: linhaProdutos || undefined,
        materiaisAco: materiaisAco || undefined,
        argumentoHunter: argumentoHunter || undefined,
        statusOriginal: statusOriginal || undefined,
        spreadsheetId,
        spreadsheetTitle: spreadsheetTitle || undefined,
      });
    }

    return {
      ok: true,
      cols: effectiveHeaders.filter(Boolean),
      rows: mappedRows,
    };
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
    const action = searchParams.get("action") || "";
    const sheetUrl =
      searchParams.get("sheetUrl") ||
      searchParams.get("spreadsheetId") ||
      DEFAULT_SPREADSHEET_ID;
    const tabName = searchParams.get("tabName") || "Casas Modulares";
    const readAllTabs = searchParams.get("readAllTabs") !== "false";
    const knownTabsParam = searchParams.get("knownTabs") || "";
    const rawWebhookUrl = (
      searchParams.get("webhookUrl") ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      ""
    ).trim();
    const webhookUrl = isValidAppsScriptUrl(rawWebhookUrl) ? rawWebhookUrl : "";

    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    const validSpreadsheetId = spreadsheetId || DEFAULT_SPREADSHEET_ID;

    // Endpoint de Ponte Direta CRM -> Google Sheets (chamado pelo script sincronizarAgora() dentro da planilha)
    if (action === "pull_crm_snapshot") {
      const snap = await getCrmSnapshot(validSpreadsheetId);
      return NextResponse.json(
        {
          ok: true,
          spreadsheetId: validSpreadsheetId,
          title: snap?.title || "Leads",
          batches: snap?.batches || [],
          updatedAt: snap?.updatedAt || null,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // 1. Se houver Apps Script Webhook válido com doGet configurado, lê todas as abas e planilhas via Webhook
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
    const storedSnap = await getCrmSnapshot(validSpreadsheetId);
    const resolvedTitle = metadata.title || storedSnap?.title || "Planilha Conectada";
    const snapshotTabNames = (storedSnap?.batches || [])
      .map((b) => b.tabName)
      .filter(Boolean);

    const knownTabs = knownTabsParam
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const tabsToRead = readAllTabs
      ? metadata.tabs.length > 0
        ? metadata.tabs
        : Array.from(new Set([...knownTabs, ...snapshotTabNames, tabName]))
      : [tabName];

    const tabResults = await Promise.all(
      tabsToRead.map(async (tName) => {
        const rawTab = metadata.rawTabByDisplayTab[tName] || tName;
        let res = await fetchSingleTabViaGviz(
          validSpreadsheetId,
          tName,
          rawTab,
          resolvedTitle
        );
        // Se a aba tinha um espaço à esquerda na planilha (ex: " Baús") e o nome passado veio sem espaço
        if (res.ok && tName !== tabsToRead[0] && rawTab === tName) {
          const firstTabRows = res.rows.slice(0, 2).map((r) => r.empresa).join("|");
          if (firstTabRows.includes("Truckvan Indústria")) {
            const retryWithSpace = await fetchSingleTabViaGviz(
              validSpreadsheetId,
              tName,
              ` ${tName}`,
              resolvedTitle
            );
            if (retryWithSpace.ok && retryWithSpace.rows.length > 0) {
              res = retryWithSpace;
            }
          }
        }
        return { tabName: tName.trim(), ...res };
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

    // Combina as abas da planilha Google com eventuais abas salvas no snapshot do CRM
    const remoteTabs =
      metadata.tabs.length > 0
        ? metadata.tabs
        : successfulTabs.map((t) => t.tabName);
    const finalTabs = Array.from(new Set([...remoteTabs, ...snapshotTabNames]));

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

    // Adiciona leads de abas criadas no CRM que ainda estão aguardando execução no Google Sheets
    if (storedSnap && Array.isArray(storedSnap.batches)) {
      for (const batch of storedSnap.batches) {
        if (!remoteTabs.includes(batch.tabName) && Array.isArray(batch.leads)) {
          allMappedRows.push(
            ...batch.leads.map((l) => ({
              ...l,
              tab: batch.tabName,
              spreadsheetId: validSpreadsheetId,
              spreadsheetTitle: resolvedTitle,
            }))
          );
        }
      }
    }

    const detectedCols =
      successfulTabs.find((t) => t.cols && t.cols.length > 0)?.cols || [
        "Empresa",
        "Responsável",
        "E-mail",
        "Contato",
        "Nível de Prospecção",
        "Observações",
      ];

    return NextResponse.json({
      success: true,
      source: "google_gviz_live",
      title: resolvedTitle,
      spreadsheetId: validSpreadsheetId,
      tabs: finalTabs,
      tabName,
      columns: detectedCols,
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
 * Salva o snapshot completo no servidor CRM e grava no Google Sheets
 * via Google Sheets API v4 (OAuth 1 Clique) OU Google Apps Script.
 */
export async function POST(req: NextRequest) {
  try {
    const body: SheetsSyncRequestBody = await req.json();
    const rawWebhookUrl = (
      body.webhookUrl ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      ""
    ).trim();
    const webhookUrl = isValidAppsScriptUrl(rawWebhookUrl) ? rawWebhookUrl : "";

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

    // Sempre salva o snapshot atualizado no servidor CRM (PostgreSQL + Memória)
    // Assim o script sincronizarAgora() na planilha Google puxa todas as abas e leads sem precisar de URL!
    await saveCrmSnapshot(
      validSpreadsheetId,
      body.spreadsheetTitle || "Leads",
      batches
    );

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
    }

    // Se não há Apps Script Web App válido configurado, informa que o snapshot já está salvo e pronto
    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          needsSetup: true,
          snapshotSaved: true,
          spreadsheetId: validSpreadsheetId,
          tabsSaved: batches.map((b) => b.tabName),
          error:
            rawWebhookUrl && !isValidAppsScriptUrl(rawWebhookUrl)
              ? "Você colou o link normal da planilha no campo do Apps Script (por isso deu erro 405). Agora ficou muito mais fácil: clique em '1. Copiar Código Sincronizador' abaixo, cole em Extensões -> Apps Script na sua planilha Leads e clique apenas em '▷ Executar' no topo!"
              : "Para inserir todas as abas e leads dentro da planilha 'Leads' do Google agora mesmo: clique em '1. Copiar Código Sincronizador' abaixo, cole em Extensões -> Apps Script na sua planilha e clique em '▷ Executar'!",
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
