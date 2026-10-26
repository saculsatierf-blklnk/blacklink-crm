"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Sparkles,
  ExternalLink,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Highlighter,
  RefreshCw,
  FileSpreadsheet,
  Send,
  Globe,
  Building2,
  Link2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Kanban,
  ShieldCheck,
  Terminal,
  CloudDownload,
  Calendar,
  Mail,
  PhoneCall,
  Clock,
  ArrowRight,
  Flame,
  X,
} from "lucide-react";
import type {
  ExtractedSheetLead,
  ProspectionLevel,
  SectorPlaybook,
} from "@/app/api/crm/lead-extractor/route";
import {
  sanitizeCnpj,
  extractCanonicalDomain,
  sanitizePhoneE164,
  deduplicateAndMergeLeads,
  type DeduplicationAuditEntry,
} from "@/lib/deduplication";
import { createLeadAction } from "@/actions/leads";
import type { Lead } from "@/db/schema";

const PLACEHOLDER_SHEET_ID = "1m9Gjeb9UxLJ1aDgPOWOLmKzCqRf7CPkFfYXSGDJpUXA";

export interface ManagedSpreadsheet {
  id: string;
  title: string;
  sheetUrl: string;
  tabs: string[];
}

const DEFAULT_SPREADSHEETS: ManagedSpreadsheet[] = [
  {
    id: "sheet-imobiliario",
    title: "Imobiliário.",
    sheetUrl: "",
    tabs: [
      "Casas Modulares",
      "Fachadas",
      "Lajes",
      "Corte e Solda",
      "Esquadrias",
    ],
  },
];

function isRealGoogleSheetUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes(PLACEHOLDER_SHEET_ID)) return false;
  return trimmed.includes("docs.google.com/spreadsheets/d/");
}

function extractSheetIdFromUrl(url: string | undefined | null): string | null {
  if (!isRealGoogleSheetUrl(url)) return null;
  const match = String(url).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] || null;
}

const PROSPECTION_LEVELS: ProspectionLevel[] = [
  "Tentativa de contato",
  "Catálogo enviado",
  "Em contato",
  "Reunião agendada",
];

// Os 19 leads reais do print da planilha "Imobiliário." (com telefones higienizados E.164 e domínios)
const INITIAL_PRINT_LEADS: ExtractedSheetLead[] = [
  {
    id: "row-1",
    empresa: "Cmc Modular",
    cnpj: "18.592.410/0001-12",
    responsavel: "Edison Tateishi",
    email: "marketing@lafaete.com.br",
    contato: "5511997365543",
    nivelProspeccao: "Em contato",
    observacoes: "",
    website: "lafaete.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: true,
    tab: "Casas Modulares",
  },
  {
    id: "row-2",
    empresa: "Casa Cubo",
    cnpj: "",
    responsavel: "",
    email: "contato@casacubo.com.br",
    contato: "551136041863",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "casacubo.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-3",
    empresa: "Arka Conteiner",
    cnpj: "",
    responsavel: "Bruno",
    email: "",
    contato: "5527997373660",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-4",
    empresa: "Modular",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "553198554462",
    nivelProspeccao: "Reunião agendada",
    observacoes: "",
    website: "",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-5",
    empresa: "Minha Casa Box",
    cnpj: "",
    responsavel: "",
    email: "minhacasabox@gmail.com",
    contato: "5581983650178",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "freemail:minhacasabox@gmail.com",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-6",
    empresa: "Arquitetizze",
    cnpj: "",
    responsavel: "",
    email: "comercial@arquitetizze.com.br",
    contato: "554734391666",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "arquitetizze.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-7",
    empresa: "Smart House",
    cnpj: "",
    responsavel: "Bianca",
    email: "vendas@smarthousecontainer.com.br",
    contato: "5511969093975",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "Solicitou wpp esse nmr",
    website: "smarthousecontainer.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-8",
    empresa: "Minha Casa Pré-Fabricada",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "5512991583875",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-9",
    empresa: "Sombra e Mix",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "5547988273504",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-10",
    empresa: "Modulife",
    cnpj: "",
    responsavel: "Antonio",
    email: "compras@modulifecm.com.br",
    contato: "5531990887607",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "modulifecm.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: true,
    tab: "Casas Modulares",
  },
  {
    id: "row-11",
    empresa: "Nagawa",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "5511971345864",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-12",
    empresa: "nomad modular",
    cnpj: "",
    responsavel: "",
    email: "contato@construtoranomad.com.br",
    contato: "5537999450604",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "construtoranomad.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-13",
    empresa: "Fabrilar",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "551141063200",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-14",
    empresa: "Atualle Modular",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "554199900447",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-15",
    empresa: "Modular Fisher",
    cnpj: "",
    responsavel: "",
    email: "vendas_scm@fischer.com.br",
    contato: "5547997261115",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "fischer.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-16",
    empresa: "JPG Empreendimentos",
    cnpj: "",
    responsavel: "João",
    email: "",
    contato: "5511942721130",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "Utiliza alvenaria convencional, aço em foco nos telhados.",
    website: "",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: true,
    tab: "Casas Modulares",
  },
  {
    id: "row-17",
    empresa: "Arch Valor",
    cnpj: "",
    responsavel: "",
    email: "alexandre.paschoal@engenhariavalor.com.br",
    contato: "5511914205663",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "engenhariavalor.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-18",
    empresa: "Simonetto",
    cnpj: "",
    responsavel: "",
    email: "contato@simonetto.com.br",
    contato: "5511981928510",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "simonetto.com.br",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-19",
    empresa: "WEG",
    cnpj: "84.429.695/0001-11",
    responsavel: "",
    email: "info-br@weg.net",
    contato: "554732764000",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "weg.net",
    campanha: "CAMP-CASAS-MODULARES",
    highlighted: false,
    tab: "Casas Modulares",
  },
];

// Script Google Apps Script Bidirecional (doGet + doPost + Criação de Novas Planilhas) com Trava Tripla
const GOOGLE_APPS_SCRIPT_CODE = `// CONECTOR BIDIRECIONAL DATA WAREHOUSE — GOFER METAIS (REA-DESCONSTRUÇÃO)
function cleanDigits(v) { return String(v || "").replace(/\\D/g, ""); }
function cleanDomain(email, site) {
  var raw = String(site || email || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw.indexOf("@") !== -1) {
    var d = raw.split("@").pop();
    if (["gmail.com","hotmail.com","outlook.com","yahoo.com","uol.com.br"].indexOf(d) !== -1) return "free:" + raw;
    raw = d;
  }
  return raw.replace(/^https?:\\/\\//, "").replace(/^www\\./, "").split("/")[0];
}
function cleanPhoneE164(v) {
  var d = cleanDigits(v);
  if (!d) return "";
  if (d.length === 10 || d.length === 11) return "55" + d;
  return d;
}
function resolveSpreadsheet(spreadsheetId) {
  if (spreadsheetId && String(spreadsheetId).length > 10) {
    try { return SpreadsheetApp.openById(String(spreadsheetId)); } catch (e) {}
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// 1. LEITURA EM TEMPO REAL DAS COLUNAS E LINHAS DA PLANILHA
function doGet(e) {
  var tabName = (e && e.parameter && e.parameter.tabName) || "Casas Modulares";
  var spreadsheetId = (e && e.parameter && e.parameter.spreadsheetId) || "";
  var ss = resolveSpreadsheet(spreadsheetId);
  var sheet = ss.getSheetByName(tabName) || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var headers = data.length > 0 ? data[0] : ["Empresa","Responsável","E-mail","Contato","Nível de Prospecção","Observações"];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    rows.push({
      id: "sheet-" + i,
      empresa: String(data[i][0] || ""),
      responsavel: String(data[i][1] || ""),
      email: String(data[i][2] || ""),
      contato: cleanPhoneE164(data[i][3]),
      nivelProspeccao: String(data[i][4] || "Tentativa de contato"),
      observacoes: String(data[i][5] || ""),
      cnpj: String(data[i][6] || ""),
      tab: tabName
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, columns: headers, rows: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 2. CRIAÇÃO DE NOVAS PLANILHAS + INSERÇÃO E MERGE COM TRAVA ANTI-DUPLICIDADE TRIPLA
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var headers = [["Empresa", "Responsável", "E-mail", "Contato", "Nível de Prospecção", "Observações"]];

  // Permite criar uma planilha nova diretamente no Google Drive do usuário
  if (data.action === "create_spreadsheet") {
    var newSs = SpreadsheetApp.create(data.spreadsheetTitle || "Nova Planilha Gofer Metais");
    var tabs = data.initialTabs && data.initialTabs.length ? data.initialTabs : ["Casas Modulares"];
    var firstSheet = newSs.getSheets()[0];
    firstSheet.setName(tabs[0]);
    for (var t = 0; t < tabs.length; t++) {
      var sh = t === 0 ? firstSheet : (newSs.getSheetByName(tabs[t]) || newSs.insertSheet(tabs[t]));
      sh.getRange(1, 1, 1, 6).setValues(headers)
        .setBackground("#202b5b").setFontColor("#ffffff").setFontWeight("bold")
        .setHorizontalAlignment("center").setVerticalAlignment("middle");
      sh.setRowHeight(1, 32);
    }
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      spreadsheetId: newSs.getId(),
      spreadsheetUrl: newSs.getUrl(),
      title: newSs.getName(),
      tabs: tabs
    })).setMimeType(ContentService.MimeType.JSON);
  }

  var ss = resolveSpreadsheet(data.spreadsheetId);
  var tabName = data.tabName || "Casas Modulares";
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) sheet = ss.insertSheet(tabName);

  sheet.getRange(1, 1, 1, 6).setValues(headers)
    .setBackground("#202b5b").setFontColor("#ffffff").setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 32);

  if (data.replaceAllInTab && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).clearContent().setBackground(null);
  }

  var existing = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues() : [];
  var domainMap = {}, phoneMap = {}, nameMap = {};
  for (var i = 0; i < existing.length; i++) {
    var dom = cleanDomain(existing[i][2], "");
    var ph = cleanPhoneE164(existing[i][3]);
    var nm = String(existing[i][0] || "").toLowerCase().trim();
    if (dom) domainMap[dom] = i + 2;
    if (ph) phoneMap[ph] = i + 2;
    if (nm) nameMap[nm] = i + 2;
  }

  var rowsToAdd = [], highlights = [], merged = 0, blocked = 0;
  for (var j = 0; j < (data.rows || []).length; j++) {
    var r = data.rows[j];
    var rDom = cleanDomain(r.email, r.domain);
    var rPh = cleanPhoneE164(r.contato);
    var rNm = String(r.empresa || "").toLowerCase().trim();
    var matchRow = (rDom && domainMap[rDom]) || (rPh && phoneMap[rPh]) || (rNm && nameMap[rNm]);

    if (!data.replaceAllInTab && matchRow) {
      var curRow = sheet.getRange(matchRow, 1, 1, 6).getValues()[0];
      var changed = false;
      if (!curRow[1] && r.responsavel) { curRow[1] = r.responsavel; changed = true; }
      if (!curRow[2] && r.email) { curRow[2] = r.email; changed = true; }
      if (!curRow[3] && rPh) { curRow[3] = rPh; changed = true; }
      if (!curRow[5] && r.observacoes) { curRow[5] = r.observacoes; changed = true; }
      if (changed) { sheet.getRange(matchRow, 1, 1, 6).setValues([curRow]); merged++; }
      else { blocked++; }
      continue;
    }

    rowsToAdd.push([r.empresa, r.responsavel, r.email, rPh || r.contato, r.nivelProspeccao || "Tentativa de contato", r.observacoes]);
    highlights.push(Boolean(r.highlighted));
  }

  if (rowsToAdd.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToAdd.length, 6).setValues(rowsToAdd).setVerticalAlignment("middle");
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Tentativa de contato", "Catálogo enviado", "Em contato", "Reunião agendada"], true)
      .setAllowInvalid(true).build();
    sheet.getRange(startRow, 5, rowsToAdd.length, 1).setDataValidation(rule);
    for (var k = 0; k < highlights.length; k++) {
      if (highlights[k]) sheet.getRange(startRow + k, 1, 1, 6).setBackground("#ffff00");
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true, added: rowsToAdd.length, merged: merged, blocked: blocked }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

function getPillStyle(level: ProspectionLevel): string {
  switch (level) {
    case "Em contato":
      return "bg-[#d9ead3] text-[#137333] border-[#b6d7a8]";
    case "Tentativa de contato":
      return "bg-[#fce5cd] text-[#b45f06] border-[#f9cb9c]";
    case "Catálogo enviado":
      return "bg-[#d9d2e9] text-[#283566] border-[#b4a7d6]";
    case "Reunião agendada":
      return "bg-[#ead1dc] text-[#4c1130] border-[#d5a6bd]";
    default:
      return "bg-[#fce5cd] text-[#b45f06] border-[#f9cb9c]";
  }
}

export type VendasWorkspaceTab =
  | "planilha"
  | "cadencia"
  | "nichos"
  | "kanban"
  | "integracao";

interface GoogleSheetsLeadHunterProps {
  onLeadImportedToKanban?: (newLead: Lead) => void;
  companyName?: string;
  activeWorkspaceTab?: VendasWorkspaceTab;
  onWorkspaceTabChange?: (tab: VendasWorkspaceTab) => void;
  currentUserId?: string;
  currentCompanyId?: string;
}

export function GoogleSheetsLeadHunter({
  onLeadImportedToKanban,
  companyName = "Gofer Metais",
  activeWorkspaceTab = "integracao",
  onWorkspaceTabChange,
  currentUserId,
  currentCompanyId,
}: GoogleSheetsLeadHunterProps) {
  // Gestão de Múltiplas Planilhas (Ex: "Imobiliário.", "Metalúrgicas SP", "Energia Solar")
  const [spreadsheets, setSpreadsheets] =
    useState<ManagedSpreadsheet[]>(DEFAULT_SPREADSHEETS);
  const [activeSpreadsheetId, setActiveSpreadsheetId] =
    useState<string>("sheet-imobiliario");

  const activeSpreadsheet = useMemo(
    () =>
      spreadsheets.find((s) => s.id === activeSpreadsheetId) ||
      spreadsheets[0] ||
      DEFAULT_SPREADSHEETS[0],
    [spreadsheets, activeSpreadsheetId]
  );

  const [sheetTitle, setSheetTitle] = useState("Imobiliário.");
  const [tabs, setTabs] = useState<string[]>(DEFAULT_SPREADSHEETS[0].tabs);
  const [activeTab, setActiveTab] = useState<string>("Casas Modulares");
  const [rows, setRows] = useState<ExtractedSheetLead[]>(INITIAL_PRINT_LEADS);

  // Seleção de Leads na Planilha para enviar em lote ou individualmente ao Kanban
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [kanbanSentRowIds, setKanbanSentRowIds] = useState<string[]>([]);

  // Modal de Criar Nova Planilha
  const [newSpreadsheetModalOpen, setNewSpreadsheetModalOpen] = useState(false);
  const [newSpreadsheetTitle, setNewSpreadsheetTitle] = useState("");
  const [newSpreadsheetFirstTab, setNewSpreadsheetFirstTab] = useState("");
  const [newSpreadsheetUrl, setNewSpreadsheetUrl] = useState("");
  const [isCreatingRemoteSheet, setIsCreatingRemoteSheet] = useState(false);

  // 1. VARIÁVEIS GLOBAIS DE SESSÃO ATIVA (SÉRIE REA-DESCONSTRUÇÃO)
  const [myCompany, setMyCompany] = useState<string>(companyName || "Gofer Metais");
  const [representedWebsite, setRepresentedWebsite] = useState(
    "https://gofermetais.com.br"
  );
  const [targetSegment, setTargetSegment] = useState("Casas Modulares");
  const [targetRegion, setTargetRegion] = useState("Brasil");
  const [batchLimit, setBatchLimit] = useState<number>(10);

  // Playbook Dinâmico do Setor Alvo + Logs de Auditoria Anti-Duplicidade
  const [activePlaybook, setActivePlaybook] = useState<SectorPlaybook | null>(null);
  const [auditLogs, setAuditLogs] = useState<DeduplicationAuditEntry[]>([]);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  // Estados de Execução e Sincronização Google Sheets
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isReadingSheets, setIsReadingSheets] = useState(false);
  const [isImportingKanban, setIsImportingKanban] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "info" | "error";
    text: string;
  } | null>(null);

  const [sheetUrl, setSheetUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [campaignWebhookUrl, setCampaignWebhookUrl] = useState("");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [newTabModalOpen, setNewTabModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState("");

  useEffect(() => {
    try {
      const savedRows = localStorage.getItem("gofer_sheets_leads_v2");
      const savedTabs = localStorage.getItem("gofer_sheets_tabs_v2");
      const savedSpreadsheets = localStorage.getItem("gofer_spreadsheets_v1");
      const savedActiveSheetId = localStorage.getItem("gofer_active_spreadsheet_id_v1");
      const savedWebhook = localStorage.getItem("gofer_sheets_webhook_v1");
      const savedCampWebhook = localStorage.getItem("gofer_campaign_webhook_v1");
      const savedSheetUrl = localStorage.getItem("gofer_sheets_url_v1");
      const savedMyCompany = localStorage.getItem("gofer_my_company_v1");
      const savedRepSite = localStorage.getItem("gofer_represented_site_v1");
      const savedKanbanSent = localStorage.getItem("gofer_kanban_sent_rows_v1");

      if (savedRows) {
        const parsed = JSON.parse(savedRows);
        if (Array.isArray(parsed) && parsed.length > 0) setRows(parsed);
      }
      if (savedKanbanSent) {
        const parsedSent = JSON.parse(savedKanbanSent);
        if (Array.isArray(parsedSent)) setKanbanSentRowIds(parsedSent);
      }
      const cleanSavedUrl = isRealGoogleSheetUrl(savedSheetUrl) ? savedSheetUrl! : "";
      if (cleanSavedUrl) setSheetUrl(cleanSavedUrl);

      if (savedSpreadsheets) {
        const parsedSheets: ManagedSpreadsheet[] = JSON.parse(savedSpreadsheets);
        if (Array.isArray(parsedSheets) && parsedSheets.length > 0) {
          const sanitized = parsedSheets.map((s) => ({
            ...s,
            sheetUrl: isRealGoogleSheetUrl(s.sheetUrl) ? s.sheetUrl : "",
          }));
          setSpreadsheets(sanitized);
          const targetId =
            savedActiveSheetId && sanitized.some((s) => s.id === savedActiveSheetId)
              ? savedActiveSheetId
              : sanitized[0].id;
          setActiveSpreadsheetId(targetId);
          const current = sanitized.find((s) => s.id === targetId) || sanitized[0];
          setSheetTitle(current.title);
          setTabs(current.tabs);
          setActiveTab(current.tabs[0] || "Casas Modulares");
          setTargetSegment(current.tabs[0] || "Casas Modulares");
          if (current.sheetUrl) setSheetUrl(current.sheetUrl);
        }
      } else if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
          setTabs(parsedTabs);
          setSpreadsheets([
            {
              id: "sheet-imobiliario",
              title: "Imobiliário.",
              sheetUrl: cleanSavedUrl,
              tabs: parsedTabs,
            },
          ]);
        }
      }

      if (savedWebhook) setWebhookUrl(savedWebhook);
      if (savedCampWebhook) setCampaignWebhookUrl(savedCampWebhook);
      if (savedMyCompany) setMyCompany(savedMyCompany);
      if (savedRepSite) setRepresentedWebsite(savedRepSite);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("gofer_sheets_leads_v2", JSON.stringify(rows));
      localStorage.setItem("gofer_sheets_tabs_v2", JSON.stringify(tabs));
      localStorage.setItem("gofer_spreadsheets_v1", JSON.stringify(spreadsheets));
      localStorage.setItem("gofer_active_spreadsheet_id_v1", activeSpreadsheetId);
      localStorage.setItem("gofer_kanban_sent_rows_v1", JSON.stringify(kanbanSentRowIds));
      localStorage.setItem("gofer_my_company_v1", myCompany);
      localStorage.setItem("gofer_represented_site_v1", representedWebsite);
      if (webhookUrl) localStorage.setItem("gofer_sheets_webhook_v1", webhookUrl);
      if (campaignWebhookUrl)
        localStorage.setItem("gofer_campaign_webhook_v1", campaignWebhookUrl);
      localStorage.setItem(
        "gofer_sheets_url_v1",
        isRealGoogleSheetUrl(sheetUrl) ? sheetUrl : ""
      );
    } catch {}
  }, [
    rows,
    tabs,
    spreadsheets,
    activeSpreadsheetId,
    kanbanSentRowIds,
    myCompany,
    representedWebsite,
    webhookUrl,
    campaignWebhookUrl,
    sheetUrl,
  ]);

  const [showNicheRadar, setShowNicheRadar] = useState<boolean>(true);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setTargetSegment(tab);
    setSelectedRowIds([]);
  };

  const handleSelectSpreadsheet = (sheetId: string) => {
    const found = spreadsheets.find((s) => s.id === sheetId);
    if (!found) return;
    setActiveSpreadsheetId(found.id);
    setSheetTitle(found.title);
    setTabs(found.tabs);
    const firstTab = found.tabs[0] || "Geral";
    setActiveTab(firstTab);
    setTargetSegment(firstTab);
    setSheetUrl(found.sheetUrl || "");
    setSelectedRowIds([]);
  };

  const handleUpdateActiveSheetUrl = (urlValue: string) => {
    setSheetUrl(urlValue);
    setSpreadsheets((prev) =>
      prev.map((s) =>
        s.id === activeSpreadsheet.id ? { ...s, sheetUrl: urlValue } : s
      )
    );
  };

  const handleUpdateActiveSheetTitle = (titleValue: string) => {
    setSheetTitle(titleValue);
    setSpreadsheets((prev) =>
      prev.map((s) =>
        s.id === activeSpreadsheet.id ? { ...s, title: titleValue } : s
      )
    );
  };

  const handleCreateNewSpreadsheet = async () => {
    const cleanTitle = newSpreadsheetTitle.trim();
    if (!cleanTitle) return;
    const firstTab = newSpreadsheetFirstTab.trim() || "Geral";
    let finalSheetUrl = isRealGoogleSheetUrl(newSpreadsheetUrl)
      ? newSpreadsheetUrl.trim()
      : "";

    setIsCreatingRemoteSheet(true);
    try {
      // Se o Apps Script estiver conectado e o usuário não colou um link manual, cria a planilha real no Google Drive!
      if (!finalSheetUrl && webhookUrl.trim()) {
        const res = await fetch("/api/crm/sheets-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_spreadsheet",
            webhookUrl: webhookUrl.trim(),
            spreadsheetTitle: cleanTitle,
            initialTabs: [firstTab],
          }),
        });
        const data = await res.json();
        if (res.ok && data.spreadsheetUrl) {
          finalSheetUrl = data.spreadsheetUrl;
        }
      }
    } catch {
      // Segue com a criação local mesmo se o webhook falhar
    } finally {
      setIsCreatingRemoteSheet(false);
    }

    const newSheet: ManagedSpreadsheet = {
      id: `sheet-${Date.now()}`,
      title: cleanTitle,
      sheetUrl: finalSheetUrl,
      tabs: [firstTab],
    };

    setSpreadsheets((prev) => [...prev, newSheet]);
    setActiveSpreadsheetId(newSheet.id);
    setSheetTitle(newSheet.title);
    setTabs(newSheet.tabs);
    setActiveTab(firstTab);
    setTargetSegment(firstTab);
    setSheetUrl(finalSheetUrl);
    setSelectedRowIds([]);

    setNewSpreadsheetTitle("");
    setNewSpreadsheetFirstTab("");
    setNewSpreadsheetUrl("");
    setNewSpreadsheetModalOpen(false);

    setFeedbackBanner({
      type: "success",
      text: finalSheetUrl
        ? `✦ Nova planilha "${cleanTitle}" criada e vinculada ao seu Google Sheets com a aba "${firstTab}"!`
        : `✦ Nova planilha "${cleanTitle}" criada com a aba "${firstTab}"! Cole o link do Google Sheets ou conecte o Apps Script para sincronizar na nuvem.`,
    });
  };

  const activeTabRows = useMemo(
    () => rows.filter((r) => r.tab === activeTab),
    [rows, activeTab]
  );

  // CAMADA DE INTELIGÊNCIA DE NICHOS: Analisa quais abas/setores estão atendendo e convertendo mais
  const nicheIntelligence = useMemo(() => {
    const stats = tabs.map((tab) => {
      const tabLeads = rows.filter((r) => r.tab === tab && r.empresa.trim());
      const total = tabLeads.length;
      const catalogSent = tabLeads.filter(
        (r) => r.nivelProspeccao === "Catálogo enviado"
      ).length;
      const inContact = tabLeads.filter(
        (r) => r.nivelProspeccao === "Em contato"
      ).length;
      const meetingBooked = tabLeads.filter(
        (r) => r.nivelProspeccao === "Reunião agendada"
      ).length;
      const hotHighlighted = tabLeads.filter((r) => r.highlighted).length;

      const engagedCount = catalogSent + inContact + meetingBooked;
      const tractionRate = total > 0 ? Math.round((engagedCount / total) * 100) : 0;

      return {
        tab,
        total,
        catalogSent,
        inContact,
        meetingBooked,
        hotHighlighted,
        engagedCount,
        tractionRate,
      };
    });

    const sortedByTraction = [...stats].sort(
      (a, b) => b.tractionRate - a.tractionRate || b.total - a.total
    );
    const topPerformingNiche = sortedByTraction[0];

    // Sugestões inteligentes de novos nichos baseadas no setor de Aço/Metalurgia (Gofer Metais)
    const candidateExpansions = [
      {
        niche: "Canteiros e Alojamentos Metálicos",
        reason: "Nicho irmão de Casas Modulares (73%+ de tração) — compra contínua de chapas galvanizadas, telhas termoacústicas e perfis U.",
        avgTicket: "Alto Recorrente",
      },
      {
        niche: "Mezaninos e Porta-Pallets Logísticos",
        reason: "Consome alto volume de vigas, perfis estruturais dobrados e chapas de piso xadrez.",
        avgTicket: "Alto Ticket",
      },
      {
        niche: "Implementos Rodoviários e Carrocerias",
        reason: "Demanda semanal de chapas grossas A36, tubos estruturais e perfis dobrados sem sazonalidade.",
        avgTicket: "Compra Mensal",
      },
      {
        niche: "Suportes e Estruturas Fotovoltaicas",
        reason: "Setor em expansão acelerada que exige perfis galvanizados a fogo e aço estrutural.",
        avgTicket: "Escala Industrial",
      },
      {
        niche: "Fabricantes de Guaritas e Eletrocentros",
        reason: "Mesma cadeia de fornecedores dos fabricantes de módulos e contêineres.",
        avgTicket: "Giro Rápido",
      },
    ].filter(
      (item) =>
        !tabs.some((t) => t.toLowerCase() === item.niche.toLowerCase())
    );

    return {
      stats,
      topPerformingNiche,
      candidateExpansions,
    };
  }, [rows, tabs]);

  // CAMADA DE INTELIGÊNCIA DE CADÊNCIA SEMANAL (SEGUNDA A SEXTA — 5 TOQUES B2B)
  const [showCadenceEngine, setShowCadenceEngine] = useState<boolean>(true);
  const [selectedCadenceDay, setSelectedCadenceDay] = useState<
    "D1" | "D2" | "D3" | "D4" | "D5"
  >("D1");
  const [selectedCadenceLeadId, setSelectedCadenceLeadId] = useState<string>("row-10");
  const [copiedCadenceField, setCopiedCadenceField] = useState<string | null>(null);

  const WEEKLY_CADENCE_STEPS = useMemo(
    () => [
      {
        dayCode: "D1" as const,
        dayLabel: "Segunda-feira (Hoje)",
        touchNumber: "Dia 1 • Mapear Setores & Abastecer Planilhas",
        targetLevel: "Tentativa de contato" as ProspectionLevel,
        nextLevel: "Tentativa de contato" as ProspectionLevel,
        channels: ["Cérebro de Nichos", "Captar & Validar Leads", "Sync Google Sheets"],
        objective:
          "Mapear os setores da semana, extrair novos leads verificados (CNPJ/Domínio/Tel) e abastecer as abas da planilha para ter munição de Terça a Sexta.",
        badgeColor: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
      },
      {
        dayCode: "D2" as const,
        dayLabel: "Terça-feira",
        touchNumber: "Dia 2 • Disparo de Abertura (Oferecer Catálogo)",
        targetLevel: "Tentativa de contato" as ProspectionLevel,
        nextLevel: "Catálogo enviado" as ProspectionLevel,
        channels: ["WhatsApp Abertura", "E-mail Apresentação", "Ligação Triagem"],
        objective:
          "Abordar a lista abastecida na segunda-feira ('Tentativa de contato') para descobrir o comprador e fazer eles pedirem o Catálogo em PDF.",
        badgeColor: "border-amber-500/40 bg-amber-500/15 text-amber-300",
      },
      {
        dayCode: "D3" as const,
        dayLabel: "Quarta-feira",
        touchNumber: "Dia 3 • Envio do Catálogo em PDF (Pós-Resposta)",
        targetLevel: "Tentativa de contato" as ProspectionLevel,
        nextLevel: "Catálogo enviado" as ProspectionLevel,
        channels: ["Anexo PDF no WhatsApp", "Anexo PDF no E-mail"],
        objective:
          "Responder quem pediu o catálogo enviando o arquivo PDF da Gofer Metais + mensagem destacando os aços/perfis do setor deles.",
        badgeColor: "border-indigo-500/40 bg-indigo-500/15 text-indigo-300",
      },
      {
        dayCode: "D4" as const,
        dayLabel: "Quinta-feira",
        touchNumber: "Dia 4 • Follow-up Pós-PDF (Puxar Cotação)",
        targetLevel: "Catálogo enviado" as ProspectionLevel,
        nextLevel: "Em contato" as ProspectionLevel,
        channels: ["WhatsApp Pós-PDF", "E-mail Comparativo de Preço"],
        objective:
          "Cobrar quem já recebeu o PDF ('Catálogo enviado'), perguntando se conseguiram abrir o arquivo e qual bitola/perfil podemos cotar hoje.",
        badgeColor: "border-sky-500/40 bg-sky-500/15 text-sky-300",
      },
      {
        dayCode: "D5" as const,
        dayLabel: "Sexta-feira",
        touchNumber: "Dia 5 • Fechamento de Cotação & Reunião",
        targetLevel: "Em contato" as ProspectionLevel,
        nextLevel: "Reunião agendada" as ProspectionLevel,
        channels: ["Ligação p/ Decisor", "WhatsApp Fechamento"],
        objective:
          "Focar nos leads quentes ('Em contato' e Destaques Amarelos) que interagiram após o PDF para fechar pedido ou agendar reunião técnica.",
        badgeColor: "border-pink-500/40 bg-pink-500/15 text-pink-300",
      },
    ],
    []
  );

  const currentCadenceStep = useMemo(
    () =>
      WEEKLY_CADENCE_STEPS.find((s) => s.dayCode === selectedCadenceDay) ||
      WEEKLY_CADENCE_STEPS[0],
    [WEEKLY_CADENCE_STEPS, selectedCadenceDay]
  );

  // Fila inteligente de leads para o dia selecionado da cadência
  const cadenceQueueForDay = useMemo(() => {
    const validRows = activeTabRows.filter((r) => r.empresa.trim());
    if (selectedCadenceDay === "D1" || selectedCadenceDay === "D2" || selectedCadenceDay === "D3") {
      // Segunda (Preparação), Terça (Abertura) e Quarta (Envio do PDF): Prioriza 'Tentativa de contato' + Destaques Amarelos
      return validRows.sort((a, b) => {
        const aScore =
          (a.nivelProspeccao === "Tentativa de contato" ? 25 : 0) +
          (a.highlighted ? 15 : 0) +
          (a.nivelProspeccao === "Catálogo enviado" ? 5 : 0);
        const bScore =
          (b.nivelProspeccao === "Tentativa de contato" ? 25 : 0) +
          (b.highlighted ? 15 : 0) +
          (b.nivelProspeccao === "Catálogo enviado" ? 5 : 0);
        return bScore - aScore;
      });
    }
    if (selectedCadenceDay === "D4") {
      // Quinta (Follow-up Pós-PDF): Prioriza 'Catálogo enviado' (quem já recebeu o PDF e precisa ser cobrado)
      return validRows.sort((a, b) => {
        const aScore =
          (a.nivelProspeccao === "Catálogo enviado" ? 25 : 0) +
          (a.highlighted ? 15 : 0);
        const bScore =
          (b.nivelProspeccao === "Catálogo enviado" ? 25 : 0) +
          (b.highlighted ? 15 : 0);
        return bScore - aScore;
      });
    }
    // Sexta (Fechamento): Prioriza Destaques Amarelos + 'Em contato' + 'Reunião agendada'
    return validRows.sort((a, b) => {
      const aScore =
        (a.highlighted ? 25 : 0) +
        (a.nivelProspeccao === "Em contato" ? 25 : 0) +
        (a.nivelProspeccao === "Reunião agendada" ? 20 : 0);
      const bScore =
        (b.highlighted ? 25 : 0) +
        (b.nivelProspeccao === "Em contato" ? 25 : 0) +
        (b.nivelProspeccao === "Reunião agendada" ? 20 : 0);
      return bScore - aScore;
    });
  }, [activeTabRows, selectedCadenceDay]);

  const selectedCadenceLead = useMemo(() => {
    return (
      activeTabRows.find((r) => r.id === selectedCadenceLeadId) ||
      cadenceQueueForDay[0] ||
      activeTabRows[0] ||
      null
    );
  }, [activeTabRows, selectedCadenceLeadId, cadenceQueueForDay]);

  // Gerador dinâmico de Scripts (1º Contato -> Entrega do Catálogo em PDF -> Follow-up Pós-PDF -> Fechamento)
  const leadCadencePlaybook = useMemo(() => {
    if (!selectedCadenceLead) return null;
    const emp = selectedCadenceLead.empresa || "sua empresa";
    const resp = selectedCadenceLead.responsavel?.trim();
    const greeting = resp ? `Olá ${resp}, tudo bem?` : `Olá, bom dia! Tudo bem?`;
    const sector = selectedCadenceLead.tab || activeTab || "Estruturas Metálicas";
    const obs = selectedCadenceLead.observacoes?.trim() || "";
    const hasCustomNote =
      obs.length > 0 && !obs.startsWith("[D") && !obs.startsWith("[Auto-");

    const customHook = hasCustomNote
      ? `Vi aqui na minha anotação sobre a ${emp} (${obs.toLowerCase()}) e separei exatamente as nossas linhas de aço que atendem essa aplicação.`
      : `Atendemos fabricantes do setor de ${sector} com fornecimento ágil de chapas, bobinas, perfis estruturais dobrados e aço galvanizado sob medida.`;

    // Script universal de Entrega do Catálogo em PDF (para quando o lead responde "Pode mandar o catálogo")
    const pdfDeliveryWhatsapp = `${greeting} Perfeito! Segue em anexo aqui no WhatsApp o **Catálogo Técnico em PDF da ${myCompany}** atualizado.\n\n📌 Para a operação da *${emp}* (${sector}), recomendo dar uma olhada especial na nossa linha de chapas estruturais, aço galvanizado e perfis dobrados sob medida.\n\nDepois que der uma olhada no PDF, me avisa se tiver alguma bitola ou perfil que vocês compram com recorrência para eu montar uma cotação comparativa sem compromisso!`;
    const pdfDeliveryEmailSubject = `Catálogo Técnico em PDF — ${myCompany} (${emp})`;
    const pdfDeliveryEmailBody = `${greeting}\n\nConforme conversamos, envio em anexo o Catálogo Técnico em PDF da ${myCompany} (${representedWebsite}).\n\nPara o segmento de ${sector} da ${emp}, destacamos no PDF nossas linhas de:\n- Chapas de aço carbono, galvanizadas e xadrez;\n- Bobinas e slitter sob medida;\n- Perfis estruturais dobrados (U, UDC, Cartola e especiais).\n\nFico à disposição! Caso tenha alguma requisição aberta nesta semana, pode responder a este e-mail com as medidas/quantidades para montarmos um comparativo de preço e prazo.\n\nAtenciosamente,\nComercial ${myCompany}`;

    if (selectedCadenceLead.nivelProspeccao === "Tentativa de contato") {
      return {
        stageTitle:
          "Passo 1 (Abertura): Despertar Interesse & Fazer Pedirem o Catálogo em PDF",
        nextRecommendedLevel: "Catálogo enviado" as ProspectionLevel,
        timingHint:
          "Mande o 1º contato abaixo para fazer o comprador pedir o catálogo. Assim que ele responder 'Pode mandar', copie o Script de Entrega do PDF (caixa roxa abaixo), anexe o PDF e clique em 'Concluir -> Catálogo enviado'.",
        phoneScript: `"Bom dia! Aqui é da ${myCompany}. Nós fornecemos aços, chapas e perfis estruturais para o setor de ${sector}. Quem cuida das compras de aço da ${emp} para eu enviar o nosso Catálogo Técnico em PDF no WhatsApp ou e-mail?"`,
        whatsappScript: `${greeting} Aqui é da *${myCompany}* (${representedWebsite}).\n\n${customHook}\n\nPosso te enviar por aqui o nosso **Catálogo Técnico em PDF** com a linha completa de chapas e perfis para você ter a ${myCompany} como opção nas cotações da *${emp}*?`,
        emailSubject: `Catálogo Técnico de Aços & Perfis (${myCompany} -> ${emp})`,
        emailBody: `${greeting}\n\nEntro em contato pela área comercial da ${myCompany} (${representedWebsite}).\n\n${customHook}\n\nTrabalhamos com pronta-entrega e corte/dobra sob medida para não travar seu cronograma de produção.\n\nPosso encaminhar nosso Catálogo Técnico em PDF por aqui (ou no WhatsApp do setor de compras) para homologação na ${emp}?\n\nAtenciosamente,\nComercial ${myCompany}`,
        pdfDeliveryWhatsapp,
        pdfDeliveryEmailSubject,
        pdfDeliveryEmailBody,
      };
    }

    if (selectedCadenceLead.nivelProspeccao === "Catálogo enviado") {
      return {
        stageTitle:
          "Passo 2 (Follow-up Pós-PDF): Cobrar Leitura do PDF & Puxar 1 Item p/ Cotar",
        nextRecommendedLevel: "Em contato" as ProspectionLevel,
        timingHint:
          "Você já enviou o PDF do catálogo! Agora o segredo é perguntar se conseguiram abrir o PDF e pedir 1 única bitola/perfil de compra recorrente para você cotar e provar preço.",
        phoneScript: `"${
          resp ? `Oi ${resp}` : "Bom dia"
        }, tudo bem? Aqui é da ${myCompany}. Conseguiu abrir aquele PDF do nosso catálogo técnico que te mandei? Queria fazer um teste rápido: qual daquelas chapas ou perfis do PDF vocês mais consomem no mês na ${emp} para eu te passar nosso preço atualizado hoje?"`,
        whatsappScript: `${greeting} Tudo certo por aí?\n\nConseguiu dar uma olhada no **PDF do catálogo da ${myCompany}** que te enviei por aqui?\n\n${
          hasCustomNote ? `${customHook}\n\n` : ""
        }Para você testar nosso preço e prazo na prática: qual daquelas chapas ou perfis do PDF vocês compram com maior recorrência na *${emp}*? Me manda a medida/bitola que eu te devolvo uma cotação comparativa ainda hoje!`,
        emailSubject: `Re: Catálogo em PDF ${myCompany} — Cotação comparativa p/ ${emp}`,
        emailBody: `${greeting}\n\nPassando para confirmar se você conseguiu receber e abrir o Catálogo Técnico em PDF da ${myCompany} que encaminhei para a ${emp}.\n\n${
          hasCustomNote ? `${customHook}\n\n` : ""
        }Estamos fechando a programação de corte e distribuição desta semana para o setor de ${sector}. Você teria alguma requisição dos itens do catálogo em aberto nesta semana para fazermos uma cotação comparativa sem compromisso?\n\nAbraço,\nComercial ${myCompany}`,
        pdfDeliveryWhatsapp,
        pdfDeliveryEmailSubject,
        pdfDeliveryEmailBody,
      };
    }

    if (selectedCadenceLead.nivelProspeccao === "Em contato") {
      return {
        stageTitle:
          "Passo 3 (Destravamento Pós-PDF): Converter Conversa em Cotação / Reunião",
        nextRecommendedLevel: "Reunião agendada" as ProspectionLevel,
        timingHint:
          "O lead já recebeu o PDF e respondeu! Agora puxe a lista de materiais da próxima obra ou agende 10 min de conversa.",
        phoneScript: `"${
          resp ? `Fala ${resp}` : "Olá"
        }, aqui é da ${myCompany}! Como já estamos conversando sobre o fornecimento para a ${emp}, queria alinhar nossa programação desta semana. Consegue me passar a lista da próxima obra/lote ou fazemos um bate-papo rápido de 10 min?"`,
        whatsappScript: `${greeting} Tudo certo na *${emp}*?\n\nAproveitando a programação da semana na *${myCompany}*: conseguimos orçar aqueles itens do nosso catálogo para a próxima produção de vocês ou prefere agendar uma conversa rápida de 10 minutos para alinharmos condição comercial e prazo de faturamento?`,
        emailSubject: `Condição Comercial & Programação de Entrega — ${myCompany} + ${emp}`,
        emailBody: `${greeting}\n\nDando sequência ao nosso contato comercial após o envio do catálogo da ${myCompany}, gostaria de alinhar os próximos passos para atendermos a programação da ${emp} neste mês.\n\nPodemos agendar uma breve chamada de 10 minutos nesta semana para definirmos tabela, prazos de entrega e cadastro, ou você já prefere me enviar a lista de materiais da próxima produção?\n\nAtenciosamente,\nComercial ${myCompany}`,
        pdfDeliveryWhatsapp,
        pdfDeliveryEmailSubject,
        pdfDeliveryEmailBody,
      };
    }

    return {
      stageTitle: "Passo 4 (Confirmação Executiva): Garantir Reunião & Pedido Inicial",
      nextRecommendedLevel: "Reunião agendada" as ProspectionLevel,
      timingHint:
        "Reunião já agendada! Confirme o horário no WhatsApp e leve a tabela de chapas/perfis de maior giro do catálogo PDF.",
      phoneScript: `"${
        resp ? `Oi ${resp}` : "Olá"
      }, passando apenas para confirmar nossa reunião agendada entre a ${myCompany} e a ${emp}. Já separei as condições especiais dos itens do catálogo para o setor de ${sector}."`,
      whatsappScript: `${greeting} Passando para confirmar nossa reunião agendada entre a *${myCompany}* e a *${emp}*!\n\nJá deixei separado o nosso catálogo em PDF e a tabela comercial focada em ${sector}. Se quiser me adiantar alguma medida específica para eu já levar o preço calculado, pode mandar por aqui!`,
      emailSubject: `Confirmação de Reunião Técnica/Comercial — ${myCompany} & ${emp}`,
      emailBody: `${greeting}\n\nConfirmando nossa agenda comercial entre ${myCompany} e ${emp}.\n\nLevaremos nossas condições de fornecimento recorrente baseadas no catálogo técnico para a linha de ${sector}. Caso queira adiantar algum desenho ou listagem de materiais para já apresentarmos a proposta calculada na reunião, basta responder a este e-mail.\n\nAté breve,\nComercial ${myCompany}`,
      pdfDeliveryWhatsapp,
      pdfDeliveryEmailSubject,
      pdfDeliveryEmailBody,
    };
  }, [selectedCadenceLead, activeTab, myCompany, representedWebsite]);

  // Marca o toque como executado na planilha e avança o lead para o próximo degrau da cadência
  const handleAdvanceLeadCadence = (lead: ExtractedSheetLead, advanceStage: boolean) => {
    const todayStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const nextLevelMap: Record<ProspectionLevel, ProspectionLevel> = {
      "Tentativa de contato": "Catálogo enviado",
      "Catálogo enviado": "Em contato",
      "Em contato": "Reunião agendada",
      "Reunião agendada": "Reunião agendada",
    };

    const newLevel = advanceStage
      ? nextLevelMap[lead.nivelProspeccao]
      : lead.nivelProspeccao;
    const tag = `[${selectedCadenceDay} ${todayStr} OK]`;
    const cleanObs = (lead.observacoes || "").replace(/\[D\d\s\d{2}\/\d{2}\sOK\]\s*/g, "").trim();
    const updatedObs = cleanObs ? `${tag} ${cleanObs}` : `${tag} Follow-up realizado`;

    setRows((prev) =>
      prev.map((r) =>
        r.id === lead.id
          ? {
              ...r,
              nivelProspeccao: newLevel,
              observacoes: updatedObs,
            }
          : r
      )
    );

    setFeedbackBanner({
      type: "success",
      text: `✦ Cadência registrada para "${lead.empresa}": anotado "${tag}" nas Observações${
        advanceStage && newLevel !== lead.nivelProspeccao
          ? ` e avançado de "${lead.nivelProspeccao}" para "${newLevel}"!`
          : "!"
      }`,
    });
  };

  const updateCell = (
    id: string,
    field: keyof ExtractedSheetLead,
    value: string | boolean
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addEmptyRow = () => {
    const newRow: ExtractedSheetLead = {
      id: `manual-${Date.now()}`,
      empresa: "",
      cnpj: "",
      responsavel: "",
      email: "",
      contato: "",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "",
      website: "",
      campanha: activePlaybook?.campaignTag || `CAMP-${activeTab.toUpperCase()}`,
      highlighted: false,
      tab: activeTab,
    };
    setRows((prev) => [...prev, newRow]);
  };

  const deleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelectedRowIds((prev) => prev.filter((item) => item !== id));
  };

  const toggleRowSelection = (rowId: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  const toggleSelectAllActiveTab = () => {
    const validIds = activeTabRows
      .filter((r) => r.empresa.trim())
      .map((r) => r.id);
    if (
      validIds.length > 0 &&
      validIds.every((id) => selectedRowIds.includes(id))
    ) {
      setSelectedRowIds((prev) => prev.filter((id) => !validIds.includes(id)));
    } else {
      setSelectedRowIds((prev) =>
        Array.from(new Set([...prev, ...validIds]))
      );
    }
  };

  // Lê colunas e leads existentes diretamente do Google Sheets antes de novos inputs
  const handleReadFromGoogleSheets = async () => {
    if (!isRealGoogleSheetUrl(sheetUrl) && !webhookUrl.trim()) {
      setFeedbackBanner({
        type: "info",
        text: "Para ler sua planilha do Google Sheets, cole o link real da sua planilha na barra abaixo ou conecte o Apps Script na aba 'Conectar Google Sheets'.",
      });
      return;
    }

    setIsReadingSheets(true);
    setFeedbackBanner(null);
    try {
      const params = new URLSearchParams({
        sheetUrl: sheetUrl.trim(),
        tabName: activeTab,
        webhookUrl: webhookUrl.trim(),
        spreadsheetId: extractSheetIdFromUrl(sheetUrl) || "",
      });
      const res = await fetch(`/api/crm/sheets-sync?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "Não foi possível ler a planilha diretamente. Verifique o link ou conecte o Apps Script."
        );
      }

      const incomingFromSheet: ExtractedSheetLead[] = data.rows || [];
      const currentTabRows = rows.filter((r) => r.tab === activeTab);
      const otherTabRows = rows.filter((r) => r.tab !== activeTab);

      const dedup = deduplicateAndMergeLeads(currentTabRows, incomingFromSheet);
      setRows([...otherTabRows, ...dedup.updatedExistingRows]);
      setAuditLogs((prev) => [...dedup.auditLogs, ...prev].slice(0, 50));

      setFeedbackBanner({
        type: "success",
        text: `✦ Leitura do Google Sheets concluída (${data.source}): ${dedup.insertedCount} novos, ${dedup.mergedCount} complementados e ${dedup.blockedCount} duplicados travados.`,
      });
    } catch (err: any) {
      setFeedbackBanner({
        type: "error",
        text: err?.message || "Falha ao ler planilha do Google Sheets.",
      });
    } finally {
      setIsReadingSheets(false);
    }
  };

  // Executa Sessão Ativa: Contexto Setorial Gemini + Extração Web + Trava Anti-Duplicidade Tripla + Sync Google Sheets
  const handleExtractLeads = async () => {
    if (!targetSegment.trim()) return;
    setIsExtracting(true);
    setFeedbackBanner(null);

    try {
      const targetTab = activeTab;

      const res = await fetch("/api/crm/lead-extractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myCompany,
          representedWebsite,
          targetSegment,
          targetRegion,
          tabName: targetTab,
          limit: batchLimit,
          existingLeads: rows,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao buscar leads.");
      }

      if (data.playbook) {
        setActivePlaybook(data.playbook);
      }
      if (Array.isArray(data.auditLogs)) {
        setAuditLogs((prev) => [...data.auditLogs, ...prev].slice(0, 60));
      }

      // Aplica o cruzamento rigoroso (CNPJ, Domínio e Telefone E.164) sobre o estado local
      const extracted: ExtractedSheetLead[] = data.leads || [];
      const dedup = deduplicateAndMergeLeads(rows, extracted);
      setRows(dedup.updatedExistingRows);

      if (dedup.insertedCount === 0 && dedup.mergedCount === 0) {
        setFeedbackBanner({
          type: "info",
          text: `Trava Anti-Duplicidade Ativa: Todas as empresas encontradas para "${targetSegment}" colidiram por CNPJ, Domínio ou Telefone (${dedup.blockedCount} bloqueadas).`,
        });
        setIsExtracting(false);
        return;
      }

      // Sincroniza em tempo real com o Google Sheets se o Webhook estiver conectado
      if (webhookUrl.trim()) {
        const syncRes = await fetch("/api/crm/sheets-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl: webhookUrl.trim(),
            campaignWebhookUrl: campaignWebhookUrl.trim(),
            spreadsheetId: extractSheetIdFromUrl(sheetUrl) || "",
            myCompany,
            targetSector: targetSegment,
            tabName: targetTab,
            leads: dedup.newUniqueLeads,
            replaceAllInTab: false,
          }),
        });
        if (syncRes.ok) {
          setFeedbackBanner({
            type: "success",
            text: `✦ ${dedup.insertedCount} novos leads únicos inseridos, ${dedup.mergedCount} complementados e ${dedup.blockedCount} duplicatas travadas — sincronizado em tempo real no Google Sheets!`,
          });
        } else {
          setFeedbackBanner({
            type: "success",
            text: `✦ ${dedup.insertedCount} novos leads únicos validados (${dedup.blockedCount} duplicatas travadas). Clique em 'Sincronizar Google Sheets' para enviar à nuvem.`,
          });
        }
      } else {
        setFeedbackBanner({
          type: "success",
          text: `✦ ${dedup.insertedCount} novos leads únicos adicionados (${dedup.mergedCount} enriquecidos | ${dedup.blockedCount} duplicatas travadas por CNPJ/Domínio/Telefone)!`,
        });
      }
    } catch (err: any) {
      setFeedbackBanner({
        type: "error",
        text: err?.message || "Falha ao buscar empresas no Google.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSyncToGoogleSheets = async () => {
    if (!webhookUrl.trim()) {
      if (onWorkspaceTabChange) {
        onWorkspaceTabChange("integracao");
      }
      setFeedbackBanner({
        type: "info",
        text: "Conecte a URL do Google Apps Script abaixo (leva 1 minuto) para sincronizar automaticamente suas planilhas com o Google Sheets.",
      });
      return;
    }

    setIsSyncingSheets(true);
    setFeedbackBanner(null);

    try {
      const res = await fetch("/api/crm/sheets-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          campaignWebhookUrl: campaignWebhookUrl.trim(),
          spreadsheetId: extractSheetIdFromUrl(sheetUrl) || "",
          myCompany,
          targetSector: targetSegment,
          tabName: activeTab,
          leads: activeTabRows.filter((r) => r.empresa.trim()),
          replaceAllInTab: false,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao sincronizar planilha.");
      }

      setFeedbackBanner({
        type: "success",
        text: `✦ Aba "${activeTab}" da planilha "${sheetTitle}" sincronizada com Google Sheets!`,
      });
    } catch (err: any) {
      setFeedbackBanner({
        type: "error",
        text: err?.message || "Erro na sincronização com o Google Sheets.",
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleDownloadFormattedSheet = () => {
    const htmlRows = activeTabRows
      .filter((r) => r.empresa.trim())
      .map((r) => {
        const rowBg = r.highlighted ? ' style="background-color:#ffff00;"' : "";
        let levelBg = "#fce5cd";
        let levelColor = "#b45f06";
        if (r.nivelProspeccao === "Em contato") {
          levelBg = "#d9ead3";
          levelColor = "#137333";
        } else if (r.nivelProspeccao === "Catálogo enviado") {
          levelBg = "#d9d2e9";
          levelColor = "#1c4587";
        } else if (r.nivelProspeccao === "Reunião agendada") {
          levelBg = "#ead1dc";
          levelColor = "#4c1130";
        }

        const cleanPhone = sanitizePhoneE164(r.contato) || r.contato;

        return `<tr${rowBg}>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;">${r.empresa}</td>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;">${r.responsavel}</td>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;color:#1155cc;text-decoration:underline;">${r.email}</td>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;">${cleanPhone}</td>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;background-color:${levelBg};color:${levelColor};font-weight:bold;text-align:center;">${r.nivelProspeccao}</td>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;">${r.observacoes}</td>
        </tr>`;
      })
      .join("");

    const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table>
          <thead>
            <tr>
              <th style="background-color:#202b5b;color:#ffffff;font-weight:bold;padding:8px 14px;border:1px solid #151d3f;font-family:Arial,sans-serif;font-size:10pt;">Empresa</th>
              <th style="background-color:#202b5b;color:#ffffff;font-weight:bold;padding:8px 14px;border:1px solid #151d3f;font-family:Arial,sans-serif;font-size:10pt;">Responsável</th>
              <th style="background-color:#202b5b;color:#ffffff;font-weight:bold;padding:8px 14px;border:1px solid #151d3f;font-family:Arial,sans-serif;font-size:10pt;">E-mail</th>
              <th style="background-color:#202b5b;color:#ffffff;font-weight:bold;padding:8px 14px;border:1px solid #151d3f;font-family:Arial,sans-serif;font-size:10pt;">Contato</th>
              <th style="background-color:#202b5b;color:#ffffff;font-weight:bold;padding:8px 14px;border:1px solid #151d3f;font-family:Arial,sans-serif;font-size:10pt;">Nível de Prospecção</th>
              <th style="background-color:#202b5b;color:#ffffff;font-weight:bold;padding:8px 14px;border:1px solid #151d3f;font-family:Arial,sans-serif;font-size:10pt;">Observações</th>
            </tr>
          </thead>
          <tbody>${htmlRows}</tbody>
        </table>
      </body>
    </html>`;

    const blob = new Blob([excelHtml], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sheetTitle.replace(/\s+/g, "-")}-${activeTab.replace(/\s+/g, "-")}-${myCompany.replace(/\s+/g, "")}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyForGoogleSheets = () => {
    const header = [
      "Empresa",
      "Responsável",
      "E-mail",
      "Contato",
      "Nível de Prospecção",
      "Observações",
    ].join("\t");
    const lines = activeTabRows
      .filter((r) => r.empresa.trim())
      .map((r) =>
        [
          r.empresa,
          r.responsavel,
          r.email,
          sanitizePhoneE164(r.contato) || r.contato,
          r.nivelProspeccao,
          r.observacoes,
        ].join("\t")
      );
    navigator.clipboard.writeText([header, ...lines].join("\n"));
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 3000);
  };

  const buildOptimisticLeadFromRow = (row: ExtractedSheetLead): Lead => {
    const cleanPhone = sanitizePhoneE164(row.contato) || row.contato.trim();
    const cleanEmail =
      row.email.trim() ||
      `contato@${row.empresa.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.br`;
    const contactName = row.responsavel.trim() || "Compras / Engenharia";
    const companyLabel = row.empresa.trim();
    const mappedStatus: "new" | "negotiation" | "closed" =
      row.nivelProspeccao === "Reunião agendada" ||
      row.nivelProspeccao === "Em contato"
        ? "negotiation"
        : "new";

    return {
      id: `kanban-${row.id}-${Date.now()}`,
      companyId: currentCompanyId || "default-company-id",
      leadName: `${contactName} - ${companyLabel}`,
      leadEmail: cleanEmail,
      leadPhone: cleanPhone || null,
      origin: `${sheetTitle} · ${row.tab}`,
      status: mappedStatus,
      dealScore: row.highlighted ? 92 : 78,
      telemetryEvents: [],
      cadenceState: {
        completedSteps:
          row.nivelProspeccao === "Catálogo enviado" ? ["D1", "D2"] : [],
        roleTitle: `${sheetTitle} · ${row.tab}`,
      },
      notes: [
        {
          id: `note-${Date.now()}`,
          text: `[Planilha ${sheetTitle} • ${row.tab} • ${row.nivelProspeccao}] ${
            row.observacoes || `Prospecção ${myCompany}`
          }`,
          createdAt: new Date().toISOString(),
          author: myCompany,
        },
      ],
      scriptVersion: "v1_direct",
      ownerId: currentUserId || "070af81b-047d-480a-8207-10d93b1a3c38",
      nextActivityDate: null,
      nextActivityType: null,
      createdAt: new Date(),
    };
  };

  const importSingleRowToKanban = async (
    row: ExtractedSheetLead
  ): Promise<Lead | null> => {
    if (!row.empresa.trim()) return null;
    const optimisticLead = buildOptimisticLeadFromRow(row);
    const contactName = row.responsavel.trim() || "Compras / Engenharia";
    try {
      const res = await createLeadAction({
        name: contactName,
        company: row.empresa.trim(),
        roleTitle: `${sheetTitle} · ${row.tab}`,
        email: optimisticLead.leadEmail || "",
        phone: optimisticLead.leadPhone || undefined,
        initialNote:
          optimisticLead.notes?.[0]?.text ||
          `[${row.tab}] Prospecção ${myCompany}`,
      });
      if (res.success && res.lead) {
        return res.lead;
      }
      return optimisticLead;
    } catch {
      return optimisticLead;
    }
  };

  const handleSendRowToKanban = async (row: ExtractedSheetLead) => {
    if (!row.empresa.trim()) return;
    setIsImportingKanban(true);
    try {
      const createdLead = await importSingleRowToKanban(row);
      if (createdLead) {
        onLeadImportedToKanban?.(createdLead);
        setKanbanSentRowIds((prev) =>
          prev.includes(row.id) ? prev : [...prev, row.id]
        );
        setFeedbackBanner({
          type: "success",
          text: `✦ "${row.empresa}" enviado para o Pipeline Kanban!`,
        });
        onWorkspaceTabChange?.("kanban");
      }
    } finally {
      setIsImportingKanban(false);
    }
  };

  const handleSendSelectedToKanban = async () => {
    const selectedRows = activeTabRows.filter(
      (r) => selectedRowIds.includes(r.id) && r.empresa.trim()
    );
    if (selectedRows.length === 0) return;

    setIsImportingKanban(true);
    try {
      const importedIds: string[] = [];
      for (const row of selectedRows) {
        const createdLead = await importSingleRowToKanban(row);
        if (createdLead) {
          onLeadImportedToKanban?.(createdLead);
          importedIds.push(row.id);
        }
      }
      setKanbanSentRowIds((prev) =>
        Array.from(new Set([...prev, ...importedIds]))
      );
      setSelectedRowIds([]);
      setFeedbackBanner({
        type: "success",
        text: `✦ ${importedIds.length} ${
          importedIds.length === 1 ? "lead enviado" : "leads enviados"
        } para o Pipeline Kanban!`,
      });
      onWorkspaceTabChange?.("kanban");
    } finally {
      setIsImportingKanban(false);
    }
  };

  const handleCreateTab = () => {
    const clean = newTabName.trim();
    if (!clean) return;
    const updatedTabs = tabs.includes(clean) ? tabs : [...tabs, clean];
    setTabs(updatedTabs);
    setSpreadsheets((prev) =>
      prev.map((s) =>
        s.id === activeSpreadsheet.id ? { ...s, tabs: updatedTabs } : s
      )
    );
    setActiveTab(clean);
    setTargetSegment(clean);
    setNewTabName("");
    setNewTabModalOpen(false);
  };

  const getIrvoLevelBadge = (level: ProspectionLevel) => {
    switch (level) {
      case "Em contato":
        return "bg-[#0c2b1c] text-[#14d06e]";
      case "Catálogo enviado":
        return "bg-[#0f1b33] text-[#7fa9f7]";
      case "Reunião agendada":
        return "bg-white text-[#0d0d0d]";
      case "Tentativa de contato":
      default:
        return "bg-[#2b2410] text-[#e8c267]";
    }
  };

  return (
    <div className="space-y-4 text-white">
      {/* Banner Global de Feedback (Visível em qualquer aba quando acionado) */}
      {feedbackBanner && (
        <div
          className={`flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-xs font-medium ring-1 ${
            feedbackBanner.type === "success"
              ? "bg-[#0c2b1c] text-[#14d06e] ring-[#14d06e]/30"
              : feedbackBanner.type === "error"
              ? "bg-[#2b1310] text-[#ff5d48] ring-[#ff5d48]/30"
              : "bg-[#0f1b33] text-[#7fa9f7] ring-[#7fa9f7]/30"
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="size-4 shrink-0" />
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* =====================================================================
          ABA: PLANILHA & CAPTAÇÃO (MÚLTIPLAS PLANILHAS + SELEÇÃO P/ KANBAN + SYNC)
         ===================================================================== */}
      {activeWorkspaceTab === "planilha" && (
        <div className="space-y-4">
          {/* 1. Barra de Múltiplas Planilhas + Conexão Direta Google Sheets */}
          <section className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2e2e2e] pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mr-1 shrink-0">
                  Planilhas:
                </span>
                {spreadsheets.map((sheet) => {
                  const isCurrentSheet = sheet.id === activeSpreadsheet.id;
                  const sheetLeadsCount = rows.filter((r) =>
                    sheet.tabs.includes(r.tab)
                  ).length;
                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      onClick={() => handleSelectSpreadsheet(sheet.id)}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                        isCurrentSheet
                          ? "bg-white text-[#0d0d0d]"
                          : "bg-[#1a1a1a] text-[#afafaf] hover:text-white ring-1 ring-[#2e2e2e]"
                      }`}
                    >
                      <FileSpreadsheet className="size-3.5" />
                      <span>{sheet.title}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                          isCurrentSheet
                            ? "bg-[#0d0d0d]/15 text-[#0d0d0d]"
                            : "bg-[#262626] text-[#afafaf]"
                        }`}
                      >
                        {sheetLeadsCount}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setNewSpreadsheetModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="size-3.5 text-[#14d06e]" />
                  <span>Nova Planilha</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold ${
                    webhookUrl.trim() || isRealGoogleSheetUrl(sheetUrl)
                      ? "bg-[#0c2b1c] text-[#14d06e]"
                      : "bg-[#2b2410] text-[#e8c267]"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      webhookUrl.trim() || isRealGoogleSheetUrl(sheetUrl)
                        ? "bg-[#14d06e]"
                        : "bg-[#e8c267]"
                    }`}
                  />
                  {webhookUrl.trim()
                    ? "Google Sheets Sincronizado (Apps Script)"
                    : isRealGoogleSheetUrl(sheetUrl)
                    ? "Planilha Google Vinculada"
                    : "Google Sheets não conectado"}
                </span>

                <button
                  type="button"
                  onClick={() => onWorkspaceTabChange?.("integracao")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1 text-xs font-semibold text-[#7fa9f7] cursor-pointer"
                >
                  <Link2 className="size-3.5" />
                  <span>Configurar Sincronização</span>
                </button>
              </div>
            </div>

            {/* Linha de Link Direto do Google Sheets da Planilha Ativa */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-1.5">
                <Link2 className="size-3.5 text-[#afafaf] shrink-0" />
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => handleUpdateActiveSheetUrl(e.target.value)}
                  placeholder={`Cole aqui o link real do Google Sheets para "${sheetTitle}" (https://docs.google.com/spreadsheets/d/...)`}
                  className="w-full bg-transparent text-xs text-white placeholder:text-[#757575] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Cria uma planilha em branco diretamente na sua conta Google e abre em nova guia"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors"
                >
                  <Plus className="size-3.5 text-[#14d06e]" />
                  <span>Criar no Google Sheets</span>
                </a>

                <button
                  type="button"
                  disabled={isReadingSheets}
                  onClick={handleReadFromGoogleSheets}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <CloudDownload className="size-3.5 text-[#afafaf]" />
                  <span>{isReadingSheets ? "Lendo..." : "Ler Sheets"}</span>
                </button>

                {isRealGoogleSheetUrl(sheetUrl) ? (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors"
                  >
                    <FileSpreadsheet className="size-3.5 text-[#14d06e]" />
                    <span>Abrir Google Sheets</span>
                    <ExternalLink className="size-3 text-[#757575]" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => onWorkspaceTabChange?.("integracao")}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-[#e8c267] transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="size-3.5" />
                    <span>Conectar Google Sheets</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 2. Barra Compacta de Captação de Leads por Setor */}
          <section className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#2e2e2e]">
              <div className="md:col-span-2 p-3.5 border-b md:border-b-0 md:border-r border-[#2e2e2e] space-y-1">
                <label className="block text-[11px] font-medium text-[#afafaf]">
                  Minha empresa
                </label>
                <input
                  type="text"
                  value={myCompany}
                  onChange={(e) => setMyCompany(e.target.value)}
                  placeholder="Gofer Metais"
                  className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-2.5 py-1.5 text-xs text-white font-semibold placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 p-3.5 border-b md:border-b-0 md:border-r border-[#2e2e2e] space-y-1">
                <label className="block text-[11px] font-medium text-[#afafaf]">
                  Site institucional
                </label>
                <input
                  type="text"
                  value={representedWebsite}
                  onChange={(e) => setRepresentedWebsite(e.target.value)}
                  placeholder="https://gofermetais.com.br"
                  className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-2.5 py-1.5 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-4 p-3.5 border-b md:border-b-0 md:border-r border-[#2e2e2e] space-y-1">
                <label className="block text-[11px] font-medium text-[#afafaf]">
                  Setor alvo de prospecção (abastece a aba ativa)
                </label>
                <input
                  type="text"
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  placeholder="Casas Modulares, Fachadas, Esquadrias..."
                  className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-2.5 py-1.5 text-xs text-white font-semibold placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-1 p-3.5 border-b md:border-b-0 md:border-r border-[#2e2e2e] space-y-1">
                <label className="block text-[11px] font-medium text-[#afafaf]">
                  Região
                </label>
                <select
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-2 py-1.5 text-xs text-white focus:ring-white focus:outline-none"
                >
                  <option value="Brasil">BR</option>
                  <option value="São Paulo SP">SP</option>
                  <option value="Santa Catarina SC">SC</option>
                  <option value="Paraná PR">PR</option>
                  <option value="Minas Gerais MG">MG</option>
                  <option value="Rio Grande do Sul RS">RS</option>
                  <option value="Espírito Santo ES">ES</option>
                </select>
              </div>

              <div className="md:col-span-2 p-3.5 flex items-end">
                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={handleExtractLeads}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-white/90 disabled:opacity-50 text-[#0d0d0d] font-semibold px-3 py-2 text-xs transition-colors cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Captando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="size-3.5" />
                      <span>Captar Leads</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Linha de Abas da Planilha Ativa */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#000000]">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-medium text-[#afafaf] mr-1 shrink-0">
                  Abas de {sheetTitle}:
                </span>
                {tabs.map((tab) => {
                  const isCurrent = tab === activeTab;
                  const count = rows.filter((r) => r.tab === tab).length;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleSelectTab(tab)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                        isCurrent
                          ? "bg-white text-[#0d0d0d]"
                          : "bg-[#1a1a1a] text-[#afafaf] hover:text-white ring-1 ring-[#2e2e2e]"
                      }`}
                    >
                      <span>{tab}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                          isCurrent
                            ? "bg-[#0d0d0d]/15 text-[#0d0d0d]"
                            : "bg-[#262626] text-[#afafaf]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setNewTabModalOpen(true)}
                  title="Criar nova aba de setor nesta planilha"
                  className="inline-flex items-center gap-1 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1 text-xs font-medium text-[#afafaf] hover:text-white cursor-pointer shrink-0"
                >
                  <Plus className="size-3" />
                  <span>Nova aba</span>
                </button>
              </div>

              <div className="text-[11px] text-[#afafaf]">
                Marque os leads abaixo que você decidiu começar e clique em{" "}
                <strong className="text-white">Enviar para o Kanban</strong>
              </div>
            </div>
          </section>

          {/* 3. Tabela Data Warehouse com Seleção de Leads para o Kanban */}
          <section className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#2e2e2e]">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-7 items-center justify-center rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-white">
                  <FileSpreadsheet className="size-3.5" />
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sheetTitle}
                    onChange={(e) => handleUpdateActiveSheetTitle(e.target.value)}
                    className="font-semibold text-sm text-white bg-transparent border border-transparent hover:border-[#2e2e2e] focus:border-white focus:bg-[#1a1a1a] rounded px-1.5 py-0.5 focus:outline-none w-36"
                  />
                  <span className="inline-flex h-5 items-center rounded-full bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-2.5 text-[11px] font-semibold text-[#afafaf] tabular-nums">
                    {activeTabRows.length} empresas em {activeTab}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Botão Principal: Enviar leads decididos para o Kanban */}
                <button
                  type="button"
                  disabled={isImportingKanban}
                  onClick={() => {
                    if (selectedRowIds.length === 0) {
                      toggleSelectAllActiveTab();
                      return;
                    }
                    handleSendSelectedToKanban();
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    selectedRowIds.length > 0
                      ? "bg-[#14d06e] text-[#0d0d0d] hover:bg-[#14d06e]/90"
                      : "bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-white hover:bg-[#262626]"
                  }`}
                >
                  <Kanban className="size-3.5" />
                  <span>
                    {isImportingKanban
                      ? "Enviando ao Kanban..."
                      : selectedRowIds.length > 0
                      ? `Enviar selecionados para o Kanban (${selectedRowIds.length}) →`
                      : "Selecionar todos p/ Kanban"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={addEmptyRow}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Nova linha</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyForGoogleSheets}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {copiedTable ? (
                    <>
                      <Check className="size-3.5 text-[#14d06e]" />
                      <span className="text-[#14d06e]">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 text-[#afafaf]" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFormattedSheet}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Download className="size-3.5 text-[#afafaf]" />
                  <span>Exportar .xls</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingSheets}
                  onClick={handleSyncToGoogleSheets}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-white/90 text-[#0d0d0d] px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>
                    {isSyncingSheets
                      ? "Sincronizando..."
                      : "Sincronizar Google Sheets"}
                  </span>
                </button>
              </div>
            </div>

            {/* Grade de Dados com Altura Controlada */}
            <div className="overflow-x-auto max-h-[calc(100vh-350px)] min-h-[420px] overflow-y-auto">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-[#2e2e2e]">
                  <tr className="text-xs font-semibold text-[#afafaf]">
                    <th className="w-10 border-r border-[#2e2e2e] py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={
                          activeTabRows.filter((r) => r.empresa.trim()).length > 0 &&
                          activeTabRows
                            .filter((r) => r.empresa.trim())
                            .every((r) => selectedRowIds.includes(r.id))
                        }
                        onChange={toggleSelectAllActiveTab}
                        title="Selecionar todos os leads desta aba para enviar ao Kanban"
                        className="size-3.5 rounded accent-white cursor-pointer"
                      />
                    </th>
                    <th className="w-9 border-r border-[#2e2e2e] py-2.5 text-center tabular-nums">
                      #
                    </th>
                    <th className="border-r border-[#2e2e2e] px-3 py-2.5 w-[210px]">
                      Empresa
                    </th>
                    <th className="border-r border-[#2e2e2e] px-3 py-2.5 w-[140px]">
                      Responsável
                    </th>
                    <th className="border-r border-[#2e2e2e] px-3 py-2.5 w-[220px]">
                      E-mail
                    </th>
                    <th className="border-r border-[#2e2e2e] px-3 py-2.5 w-[155px]">
                      Contato
                    </th>
                    <th className="border-r border-[#2e2e2e] px-3 py-2.5 w-[175px]">
                      Nível de Prospecção
                    </th>
                    <th className="border-r border-[#2e2e2e] px-3 py-2.5 min-w-[210px]">
                      Observações
                    </th>
                    <th className="w-40 px-2 py-2.5 text-center">
                      Iniciar / Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2e2e2e] text-xs">
                  {activeTabRows.map((row, idx) => {
                    const rowNumber = idx + 1;
                    const isSelected = selectedRowIds.includes(row.id);
                    const isAlreadyInKanban = kanbanSentRowIds.includes(row.id);
                    const cleanE164 = sanitizePhoneE164(row.contato);
                    const domainKey = extractCanonicalDomain(row.email, row.website);
                    const defaultMsg =
                      row.scriptAbordagem ||
                      `Olá ${row.responsavel || "tudo bem"}? Falo da ${myCompany}. Gostaria de enviar nosso catálogo de aços e perfis para a ${row.empresa}.`;
                    const whatsappHref =
                      cleanE164.length >= 12
                        ? `https://wa.me/${cleanE164}?text=${encodeURIComponent(defaultMsg)}`
                        : null;

                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-[#1a1a1a]"
                            : row.highlighted
                            ? "bg-[#2b2410]/60 hover:bg-[#2b2410]"
                            : "bg-[#000000] hover:bg-[#1a1a1a]/60"
                        }`}
                      >
                        <td className="border-r border-[#2e2e2e] text-center py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelection(row.id)}
                            className="size-3.5 rounded accent-white cursor-pointer"
                          />
                        </td>

                        <td className="border-r border-[#2e2e2e] text-center text-[#757575] tabular-nums py-2 select-none">
                          {rowNumber}
                        </td>

                        {/* Empresa */}
                        <td className="border-r border-[#2e2e2e] px-3 py-1.5">
                          <input
                            type="text"
                            value={row.empresa}
                            onChange={(e) =>
                              updateCell(row.id, "empresa", e.target.value)
                            }
                            placeholder="Nome da empresa..."
                            className="w-full bg-transparent text-white font-semibold focus:outline-none focus:ring-1 focus:ring-white rounded px-1.5 py-0.5"
                          />
                          {(row.cnpj ||
                            (domainKey && !domainKey.startsWith("freemail:"))) && (
                            <div className="flex items-center gap-1.5 px-1.5 text-[10px] text-[#757575] tabular-nums">
                              {row.cnpj && <span>{sanitizeCnpj(row.cnpj)}</span>}
                              {domainKey && !domainKey.startsWith("freemail:") && (
                                <span>· {domainKey}</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Responsável */}
                        <td className="border-r border-[#2e2e2e] px-3 py-1.5">
                          <input
                            type="text"
                            value={row.responsavel}
                            onChange={(e) =>
                              updateCell(row.id, "responsavel", e.target.value)
                            }
                            placeholder="—"
                            className="w-full bg-transparent text-white placeholder:text-[#757575] focus:outline-none focus:ring-1 focus:ring-white rounded px-1.5 py-0.5"
                          />
                        </td>

                        {/* E-mail */}
                        <td className="border-r border-[#2e2e2e] px-3 py-1.5">
                          <input
                            type="text"
                            value={row.email}
                            onChange={(e) =>
                              updateCell(row.id, "email", e.target.value)
                            }
                            placeholder="—"
                            className={`w-full bg-transparent placeholder:text-[#757575] focus:outline-none focus:ring-1 focus:ring-white rounded px-1.5 py-0.5 ${
                              row.email.includes("@")
                                ? "text-[#7fa9f7]"
                                : "text-white"
                            }`}
                          />
                        </td>

                        {/* Contato */}
                        <td className="border-r border-[#2e2e2e] px-3 py-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <input
                              type="text"
                              value={row.contato}
                              onChange={(e) =>
                                updateCell(row.id, "contato", e.target.value)
                              }
                              onBlur={(e) => {
                                const cleaned = sanitizePhoneE164(e.target.value);
                                if (cleaned) updateCell(row.id, "contato", cleaned);
                              }}
                              className="w-full bg-transparent text-white tabular-nums focus:outline-none focus:ring-1 focus:ring-white rounded px-1.5 py-0.5"
                            />
                            {whatsappHref && (
                              <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir conversa no WhatsApp"
                                className="text-[#14d06e] hover:opacity-80 p-1 shrink-0"
                              >
                                <MessageCircle className="size-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Nível de Prospecção */}
                        <td className="border-r border-[#2e2e2e] px-3 py-1.5">
                          <select
                            value={row.nivelProspeccao}
                            onChange={(e) =>
                              updateCell(
                                row.id,
                                "nivelProspeccao",
                                e.target.value as ProspectionLevel
                              )
                            }
                            className={`w-full rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer focus:outline-none ${getIrvoLevelBadge(
                              row.nivelProspeccao
                            )}`}
                          >
                            {PROSPECTION_LEVELS.map((lvl) => (
                              <option
                                key={lvl}
                                value={lvl}
                                className="bg-[#1a1a1a] text-white"
                              >
                                {lvl}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Observações */}
                        <td className="border-r border-[#2e2e2e] px-3 py-1.5">
                          <input
                            type="text"
                            value={row.observacoes}
                            onChange={(e) =>
                              updateCell(row.id, "observacoes", e.target.value)
                            }
                            placeholder="Adicionar observação..."
                            className="w-full bg-transparent text-[#afafaf] placeholder:text-[#757575] focus:text-white focus:outline-none focus:ring-1 focus:ring-white rounded px-1.5 py-0.5"
                          />
                        </td>

                        {/* Ações: Botão explícito p/ enviar ao Kanban */}
                        <td className="px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={isImportingKanban}
                              onClick={() => handleSendRowToKanban(row)}
                              title="Iniciar prospecção deste lead no Pipeline Kanban"
                              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                isAlreadyInKanban
                                  ? "bg-[#0c2b1c] text-[#14d06e]"
                                  : "bg-white text-[#0d0d0d] hover:bg-white/90"
                              }`}
                            >
                              <Kanban className="size-3" />
                              <span>{isAlreadyInKanban ? "No Kanban" : "+ Kanban"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCadenceLeadId(row.id);
                                onWorkspaceTabChange?.("cadencia");
                              }}
                              title="Abrir scripts e PDF desta empresa na aba Cadência"
                              className="p-1.5 rounded text-[#afafaf] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                            >
                              <Calendar className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateCell(row.id, "highlighted", !row.highlighted)
                              }
                              title="Destacar como prioridade"
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                row.highlighted
                                  ? "bg-[#2b2410] text-[#e8c267]"
                                  : "text-[#afafaf] hover:text-white hover:bg-[#1a1a1a]"
                              }`}
                            >
                              <Highlighter className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteRow(row.id)}
                              title="Remover linha"
                              className="p-1.5 rounded text-[#afafaf] hover:text-[#ff5d48] hover:bg-[#2b1310] transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          ABA: CADÊNCIA SEMANAL (SEGUNDA A SEXTA) & CATÁLOGO EM PDF
         ===================================================================== */}
      {activeWorkspaceTab === "cadencia" && (
        <section className="space-y-4">
          {/* Barra Superior da Cadência: Seletor de Setor + Contadores */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-4 py-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-medium text-[#afafaf] mr-1 shrink-0">
                Setor em execução:
              </span>
              {tabs.map((tab) => {
                const isCurrent = tab === activeTab;
                const count = rows.filter((r) => r.tab === tab).length;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleSelectTab(tab)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                      isCurrent
                        ? "bg-white text-[#0d0d0d]"
                        : "bg-[#1a1a1a] text-[#afafaf] hover:text-white ring-1 ring-[#2e2e2e]"
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                        isCurrent
                          ? "bg-[#0d0d0d]/15 text-[#0d0d0d]"
                          : "bg-[#262626] text-[#afafaf]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums">
              <span className="inline-flex h-6 items-center rounded-full bg-[#2b2410] px-2.5 font-semibold text-[#e8c267]">
                {
                  activeTabRows.filter(
                    (r) => r.nivelProspeccao === "Tentativa de contato"
                  ).length
                }{" "}
                aguardando 1º contato
              </span>
              <span className="inline-flex h-6 items-center rounded-full bg-[#0f1b33] px-2.5 font-semibold text-[#7fa9f7]">
                {
                  activeTabRows.filter(
                    (r) => r.nivelProspeccao === "Catálogo enviado"
                  ).length
                }{" "}
                com PDF enviado
              </span>
              <span className="inline-flex h-6 items-center rounded-full bg-[#0c2b1c] px-2.5 font-semibold text-[#14d06e]">
                {
                  activeTabRows.filter(
                    (r) =>
                      r.nivelProspeccao === "Em contato" ||
                      r.nivelProspeccao === "Reunião agendada"
                  ).length
                }{" "}
                em negociação
              </span>
            </div>
          </div>

          {/* Grade Compacta de 5 Dias (Segunda a Sexta) na estética irvo.com.br */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-[#2e2e2e]">
            {WEEKLY_CADENCE_STEPS.map((step) => {
              const isSelected = step.dayCode === selectedCadenceDay;
              return (
                <button
                  key={step.dayCode}
                  type="button"
                  onClick={() => setSelectedCadenceDay(step.dayCode)}
                  className={`flex flex-col justify-between border-r border-b border-[#2e2e2e] p-4 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#1a1a1a]"
                      : "bg-[#000000] hover:bg-[#0d0d0d]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span
                      className={`inline-flex h-5 items-center rounded-full px-2.5 text-[11px] font-semibold ${
                        isSelected
                          ? "bg-white text-[#0d0d0d]"
                          : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e]"
                      }`}
                    >
                      {step.dayLabel}
                    </span>
                    {step.dayCode === "D1" && (
                      <span className="text-[11px] font-semibold text-[#14d06e]">
                        Hoje
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-white leading-snug">
                      {step.touchNumber}
                    </p>
                    <p className="mt-1 text-[11px] text-[#afafaf] line-clamp-2 leading-relaxed">
                      {step.objective}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Barra de Abastecimento Rápido de Segunda-feira (D1) */}
          {selectedCadenceDay === "D1" && (
            <div className="rounded-lg bg-[#0d0d0d] px-4 py-3 ring-1 ring-[#2e2e2e] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex h-6 items-center rounded-full bg-[#0c2b1c] px-2.5 text-xs font-semibold text-[#14d06e]">
                  Meta de Segunda-feira
                </span>
                <span className="text-xs text-[#afafaf]">
                  Garanta 15 a 20 leads em <strong className="text-white">{activeTab}</strong> (atual:{" "}
                  <strong className="text-white tabular-nums">{activeTabRows.length}</strong>) antes de iniciar os disparos de terça-feira.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onWorkspaceTabChange?.("planilha")}
                  className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  Ver na Planilha
                </button>
                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={handleExtractLeads}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0d0d0d] hover:bg-white/90 disabled:opacity-50 cursor-pointer"
                >
                  <Search className="size-3.5" />
                  <span>
                    {isExtracting
                      ? "Abastecendo..."
                      : `Abastecer "${activeTab}" (+${batchLimit} leads)`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Fila Prioritária + Copiloto de Scripts & Entrega de PDF */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Coluna Esquerda: Fila Prioritária do Dia */}
            <div className="lg:col-span-4 rounded-lg bg-[#1a1a1a] p-4 ring-1 ring-[#2e2e2e] flex flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[#afafaf]">
                    Fila de prioridade · {currentCadenceStep.dayLabel}
                  </p>
                  <span className="text-xs font-semibold text-white tabular-nums">
                    {cadenceQueueForDay.length} empresas
                  </span>
                </div>

                <div className="max-h-[430px] overflow-y-auto space-y-2 pr-1">
                  {cadenceQueueForDay.map((item, idx) => {
                    const isCurrentLead = selectedCadenceLead?.id === item.id;
                    const alreadyTouchedToday =
                      (item.observacoes || "").includes("OK]") ||
                      (item.observacoes || "").includes("[PDF Enviado");
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedCadenceLeadId(item.id)}
                        className={`rounded-md p-3 transition-colors cursor-pointer ${
                          isCurrentLead
                            ? "bg-[#262626] ring-1 ring-[#7fa9f7]/60"
                            : "bg-[#0d0d0d] ring-1 ring-[#2e2e2e] hover:bg-[#262626]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-[#757575] tabular-nums">
                              {idx + 1}.
                            </span>
                            <p className="text-xs font-semibold text-white truncate">
                              {item.empresa}
                            </p>
                          </div>
                          <span
                            className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold whitespace-nowrap ${getIrvoLevelBadge(
                              item.nivelProspeccao
                            )}`}
                          >
                            {item.nivelProspeccao}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#afafaf]">
                          <span className="truncate">
                            {item.responsavel
                              ? item.responsavel
                              : "Comprador não identificado"}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.highlighted && (
                              <span className="text-[#e8c267] font-semibold">
                                Prioridade
                              </span>
                            )}
                            {alreadyTouchedToday && (
                              <span className="text-[#14d06e] font-semibold">
                                Concluído
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-[#2e2e2e] pt-2.5 text-xs text-[#afafaf]">
                <span>Aba em foco</span>
                <span className="font-semibold text-white">{activeTab}</span>
              </div>
            </div>

            {/* Coluna Direita: Copiloto de Scripts e Entrega do PDF */}
            <div className="lg:col-span-8 rounded-lg bg-[#1a1a1a] p-4 ring-1 ring-[#2e2e2e] space-y-4">
              {selectedCadenceLead && leadCadencePlaybook ? (
                <>
                  <div className="rounded-md bg-[#262626] p-3.5 ring-1 ring-[#7fa9f7]/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap ${getIrvoLevelBadge(
                            selectedCadenceLead.nivelProspeccao
                          )}`}
                        >
                          {selectedCadenceLead.nivelProspeccao}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {selectedCadenceLead.empresa}
                        </span>
                        <span className="text-xs text-[#afafaf]">
                          ·{" "}
                          {selectedCadenceLead.responsavel
                            ? selectedCadenceLead.responsavel
                            : "Comprador pendente"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendRowToKanban(selectedCadenceLead)}
                          className="inline-flex items-center gap-1 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#0d0d0d] px-2.5 py-1 text-xs font-semibold text-[#14d06e] cursor-pointer"
                        >
                          <Kanban className="size-3.5" />
                          <span>Enviar p/ Kanban</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAdvanceLeadCadence(selectedCadenceLead, false)
                          }
                          className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#0d0d0d] px-2.5 py-1 text-xs font-semibold text-white cursor-pointer"
                        >
                          Registrar toque
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAdvanceLeadCadence(selectedCadenceLead, true)
                          }
                          className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-white/90 px-3 py-1 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                        >
                          <Check className="size-3.5" />
                          <span>
                            Avançar p/ {leadCadencePlaybook.nextRecommendedLevel}
                          </span>
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-[#afafaf]">
                      <strong className="text-white">
                        {leadCadencePlaybook.stageTitle}:
                      </strong>{" "}
                      {leadCadencePlaybook.timingHint}
                    </p>
                  </div>

                  {/* Grade 2x2 de Execução Rápida sem Scroll */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* 1. Roteiro de Ligação + WhatsApp */}
                    <div className="space-y-3.5">
                      <div className="rounded-md bg-[#0d0d0d] p-3.5 ring-1 ring-[#2e2e2e] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <PhoneCall className="size-3.5 text-[#afafaf]" />
                            <span>Ligação (30s)</span>
                          </span>
                          <span className="text-xs text-[#afafaf] tabular-nums">
                            {selectedCadenceLead.contato || "Sem telefone"}
                          </span>
                        </div>
                        <p className="text-xs text-[#afafaf] leading-relaxed">
                          {leadCadencePlaybook.phoneScript}
                        </p>
                      </div>

                      <div className="rounded-md bg-[#0d0d0d] p-3.5 ring-1 ring-[#2e2e2e] space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <MessageCircle className="size-3.5 text-[#afafaf]" />
                            <span>WhatsApp da etapa</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  leadCadencePlaybook.whatsappScript
                                );
                                setCopiedCadenceField("wpp");
                                setTimeout(() => setCopiedCadenceField(null), 2500);
                              }}
                              className="rounded bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1 text-xs font-medium text-white cursor-pointer"
                            >
                              {copiedCadenceField === "wpp" ? "Copiado" : "Copiar"}
                            </button>
                            {sanitizePhoneE164(selectedCadenceLead.contato).length >=
                              12 && (
                              <a
                                href={`https://wa.me/${sanitizePhoneE164(
                                  selectedCadenceLead.contato
                                )}?text=${encodeURIComponent(
                                  leadCadencePlaybook.whatsappScript
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-white hover:bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#0d0d0d]"
                              >
                                Abrir WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-xs text-[#afafaf] leading-relaxed bg-[#1a1a1a] rounded p-2.5 ring-1 ring-[#2e2e2e] max-h-36 overflow-y-auto">
                          {leadCadencePlaybook.whatsappScript}
                        </pre>
                      </div>
                    </div>

                    {/* 2. Entrega do Catálogo em PDF + E-mail Comercial */}
                    <div className="space-y-3.5">
                      <div className="rounded-md bg-[#0d0d0d] p-3.5 ring-1 ring-[#2e2e2e] space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-white text-[#0d0d0d]">
                              <Check className="size-3 stroke-[3]" />
                            </span>
                            <span>Entrega do Catálogo PDF</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  leadCadencePlaybook.pdfDeliveryWhatsapp
                                );
                                setCopiedCadenceField("pdf_wpp");
                                setTimeout(() => setCopiedCadenceField(null), 2500);
                              }}
                              className="rounded bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2 py-1 text-xs font-medium text-white cursor-pointer"
                            >
                              {copiedCadenceField === "pdf_wpp"
                                ? "Copiado"
                                : "Copiar"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                updateCell(
                                  selectedCadenceLead.id,
                                  "nivelProspeccao",
                                  "Catálogo enviado"
                                );
                                const todayStr = new Date().toLocaleDateString(
                                  "pt-BR",
                                  { day: "2-digit", month: "2-digit" }
                                );
                                updateCell(
                                  selectedCadenceLead.id,
                                  "observacoes",
                                  `[PDF Enviado ${todayStr}] ${
                                    selectedCadenceLead.observacoes || ""
                                  }`.trim()
                                );
                                setFeedbackBanner({
                                  type: "success",
                                  text: `Catálogo em PDF registrado como enviado para "${selectedCadenceLead.empresa}".`,
                                });
                              }}
                              className="rounded bg-white hover:bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                            >
                              Marcar PDF enviado
                            </button>
                          </div>
                        </div>

                        <pre className="whitespace-pre-wrap font-sans text-xs text-[#afafaf] leading-relaxed bg-[#1a1a1a] rounded p-2.5 ring-1 ring-[#2e2e2e] max-h-28 overflow-y-auto">
                          {leadCadencePlaybook.pdfDeliveryWhatsapp}
                        </pre>
                      </div>

                      <div className="rounded-md bg-[#0d0d0d] p-3.5 ring-1 ring-[#2e2e2e] space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <Mail className="size-3.5 text-[#afafaf]" />
                            <span className="truncate">
                              E-mail ({selectedCadenceLead.email || "sem e-mail"})
                            </span>
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `Assunto: ${leadCadencePlaybook.emailSubject}\n\n${leadCadencePlaybook.emailBody}`
                                );
                                setCopiedCadenceField("email");
                                setTimeout(() => setCopiedCadenceField(null), 2500);
                              }}
                              className="rounded bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1 text-xs font-medium text-white cursor-pointer"
                            >
                              {copiedCadenceField === "email"
                                ? "Copiado"
                                : "Copiar"}
                            </button>
                            {selectedCadenceLead.email &&
                              selectedCadenceLead.email.includes("@") && (
                                <a
                                  href={`mailto:${
                                    selectedCadenceLead.email
                                  }?subject=${encodeURIComponent(
                                    leadCadencePlaybook.emailSubject
                                  )}&body=${encodeURIComponent(
                                    leadCadencePlaybook.emailBody
                                  )}`}
                                  className="rounded bg-white hover:bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#0d0d0d]"
                                >
                                  Abrir E-mail
                                </a>
                              )}
                          </div>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-xs text-[#afafaf] leading-relaxed bg-[#1a1a1a] rounded p-2.5 ring-1 ring-[#2e2e2e] max-h-28 overflow-y-auto">
                          {leadCadencePlaybook.emailBody}
                        </pre>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-[#afafaf]">
                  Selecione uma empresa na fila ao lado para abrir os scripts.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          1ª ABA (PADRÃO): MAPA DE SETORES & PLANILHAS (GRADE IRVO.COM.BR)
         ===================================================================== */}
      {activeWorkspaceTab === "nichos" && (
        <section className="space-y-6">
          {/* Barra Superior de Planilhas no Mapa de Setores */}
          <div className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mr-1 shrink-0">
                Planilhas de Prospecção:
              </span>
              {spreadsheets.map((sheet) => {
                const isCurrentSheet = sheet.id === activeSpreadsheet.id;
                const sheetLeadsCount = rows.filter((r) =>
                  sheet.tabs.includes(r.tab)
                ).length;
                return (
                  <button
                    key={sheet.id}
                    type="button"
                    onClick={() => handleSelectSpreadsheet(sheet.id)}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                      isCurrentSheet
                        ? "bg-white text-[#0d0d0d]"
                        : "bg-[#1a1a1a] text-[#afafaf] hover:text-white ring-1 ring-[#2e2e2e]"
                    }`}
                  >
                    <FileSpreadsheet className="size-3.5" />
                    <span>{sheet.title}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                        isCurrentSheet
                          ? "bg-[#0d0d0d]/15 text-[#0d0d0d]"
                          : "bg-[#262626] text-[#afafaf]"
                      }`}
                    >
                      {sheetLeadsCount}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setNewSpreadsheetModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#0d0d0d] transition-colors cursor-pointer shrink-0"
              >
                <Plus className="size-3.5" />
                <span>Criar Nova Planilha</span>
              </button>

              <button
                type="button"
                onClick={() => setNewTabModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
              >
                <Plus className="size-3.5 text-[#afafaf]" />
                <span>Nova Aba em {sheetTitle}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onWorkspaceTabChange?.("integracao")}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-[#7fa9f7] cursor-pointer"
            >
              <Link2 className="size-3.5" />
              <span>
                {webhookUrl.trim() || isRealGoogleSheetUrl(sheetUrl)
                  ? "Google Sheets Conectado"
                  : "Conectar Google Sheets"}
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#afafaf] uppercase tracking-wider">
                Mapa de Setores · Planilha {sheetTitle} ({myCompany})
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Tração por nicho prospectado
              </h3>
            </div>
            {nicheIntelligence.topPerformingNiche && (
              <div className="inline-flex items-center gap-2.5 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-xs">
                <span className="inline-flex h-6 items-center rounded-full bg-[#0c2b1c] px-2.5 font-semibold text-[#14d06e] tabular-nums">
                  {nicheIntelligence.topPerformingNiche.tractionRate}% tração
                </span>
                <span className="text-[#afafaf]">
                  Melhor resposta em{" "}
                  <strong className="text-white">
                    {nicheIntelligence.topPerformingNiche.tab}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Grade com bordas compartilhadas idêntica ao catálogo de categorias da irvo.com.br */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-[#2e2e2e]">
            {nicheIntelligence.stats.map((st) => {
              const isSelected = st.tab === activeTab;
              return (
                <li
                  key={st.tab}
                  onClick={() => handleSelectTab(st.tab)}
                  className={`flex min-h-48 flex-col justify-between border-r border-b border-[#2e2e2e] p-5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#1a1a1a]"
                      : "bg-[#000000] hover:bg-[#0d0d0d]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold tabular-nums ${
                        st.tractionRate >= 50
                          ? "bg-[#0c2b1c] text-[#14d06e]"
                          : st.total > 0
                          ? "bg-[#0f1b33] text-[#7fa9f7]"
                          : "bg-[#1a1a1a] text-[#afafaf]"
                      }`}
                    >
                      {st.total > 0 ? `${st.tractionRate}% engajamento` : "Vazia"}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-medium text-[#7fa9f7]">
                        Ativa
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-base font-semibold text-white">
                      {st.tab}
                    </p>
                    <div className="mt-1.5 flex items-baseline justify-between text-xs text-[#afafaf] tabular-nums">
                      <span>{st.total} empresas</span>
                      <span>
                        {st.engagedCount} c/ PDF · {st.hotHighlighted} destaque
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#2e2e2e]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTab(st.tab);
                          onWorkspaceTabChange?.("planilha");
                        }}
                        className="flex-1 rounded bg-[#262626] hover:bg-white hover:text-[#0d0d0d] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors cursor-pointer text-center"
                      >
                        Abrir Planilha
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTab(st.tab);
                          onWorkspaceTabChange?.("cadencia");
                        }}
                        className="flex-1 rounded bg-[#0d0d0d] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-[11px] font-semibold text-[#afafaf] hover:text-white transition-colors cursor-pointer text-center"
                      >
                        Cadência
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Expansão de Novos Setores Recomendados */}
          {nicheIntelligence.candidateExpansions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#afafaf]">
                Próximos setores recomendados para prospecção ({myCompany}):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {nicheIntelligence.candidateExpansions.slice(0, 3).map((rec) => (
                  <div
                    key={rec.niche}
                    className="rounded-lg bg-[#1a1a1a] p-4 text-left ring-1 ring-[#2e2e2e] flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex h-6 items-center rounded-full bg-[#0f1b33] px-2.5 text-xs font-semibold text-[#7fa9f7]">
                          {rec.avgTicket}
                        </span>
                        <span className="text-xs text-[#afafaf]">
                          Novo nicho
                        </span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-white">
                        {rec.niche}
                      </p>
                      <p className="mt-1.5 text-xs text-[#afafaf] leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#2e2e2e] pt-3">
                      <span className="text-xs text-[#afafaf]">
                        Criar aba e prospectar
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedTabs = tabs.includes(rec.niche)
                            ? tabs
                            : [...tabs, rec.niche];
                          setTabs(updatedTabs);
                          setSpreadsheets((prev) =>
                            prev.map((s) =>
                              s.id === activeSpreadsheet.id
                                ? { ...s, tabs: updatedTabs }
                                : s
                            )
                          );
                          setActiveTab(rec.niche);
                          setTargetSegment(rec.niche);
                          onWorkspaceTabChange?.("planilha");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#0d0d0d] hover:bg-white/90 transition-colors cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Explorar setor</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          ABA: CONEXÃO GOOGLE SHEETS & AUDITORIA ANTI-DUPLICIDADE
         ===================================================================== */}
      {activeWorkspaceTab === "integracao" && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Coluna Esquerda: Conector Google Sheets Passo a Passo */}
          <div className="lg:col-span-6 rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2e2e2e] pb-4">
              <div>
                <span className="inline-flex h-6 items-center rounded-full bg-[#0f1b33] px-2.5 text-xs font-semibold text-[#7fa9f7]">
                  Ponte Google Sheets · Planilha "{sheetTitle}"
                </span>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                  Conectar e sincronizar seu Google Sheets
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-white/90 px-3 py-2 text-xs font-semibold text-[#0d0d0d]"
                >
                  <Plus className="size-3.5" />
                  <span>Criar Planilha no Google</span>
                </a>
                {isRealGoogleSheetUrl(sheetUrl) && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-2 text-xs font-semibold text-white"
                  >
                    <FileSpreadsheet className="size-3.5 text-[#14d06e]" />
                    <span>Abrir Planilha</span>
                    <ExternalLink className="size-3 text-[#757575]" />
                  </a>
                )}
              </div>
            </div>

            {/* Passo a Passo Direto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-3">
                <span className="font-semibold text-white">1. Crie ou abra a planilha</span>
                <p className="mt-1 text-[11px] text-[#afafaf]">
                  Clique em <strong>Criar Planilha no Google</strong> acima (ou abra uma já existente) e cole o link abaixo.
                </p>
              </div>
              <div className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-3">
                <span className="font-semibold text-white">2. Cole o Apps Script</span>
                <p className="mt-1 text-[11px] text-[#afafaf]">
                  Na planilha Google, vá em <strong>Extensões &rarr; Apps Script</strong>, cole o código abaixo e clique em <strong>Implantar &rarr; App da Web</strong> (Acesso: <em>Qualquer pessoa</em>).
                </p>
              </div>
              <div className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-3">
                <span className="font-semibold text-white">3. Sincronize em 1 clique</span>
                <p className="mt-1 text-[11px] text-[#afafaf]">
                  Cole a URL <code>/exec</code> gerada pelo Google no campo abaixo e clique em <strong>Sincronizar Agora</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  1. Link da sua planilha Google Sheets ({sheetTitle})
                </label>
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => handleUpdateActiveSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit"
                  className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  2. URL do App da Web (Google Apps Script — permite criar abas e gravar automático)
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#afafaf] mb-1">
                  Webhook externo de campanha (opcional)
                </label>
                <input
                  type="text"
                  value={campaignWebhookUrl}
                  onChange={(e) => setCampaignWebhookUrl(e.target.value)}
                  placeholder="https://seu-n8n.com/webhook/campanha-gofer"
                  className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#afafaf]">
                  Código para Extensões &rarr; Apps Script
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="size-3.5" />
                      <span>Código copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copiar Apps Script</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-40 overflow-y-auto rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-3 text-[11px] font-mono text-[#afafaf]">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>

          {/* Coluna Direita: Registro de Auditoria Anti-Duplicidade */}
          <div className="lg:col-span-6 rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-4">
                <div>
                  <span className="inline-flex h-6 items-center rounded-full bg-[#0c2b1c] px-2.5 text-xs font-semibold text-[#14d06e]">
                    Integridade de Dados
                  </span>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                    Auditoria Anti-Duplicidade (CNPJ · Domínio · E.164)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#afafaf] tabular-nums">
                  {auditLogs.length} eventos
                </span>
              </div>

              <div className="grid grid-cols-3 border-t border-l border-[#2e2e2e]">
                <div className="border-r border-b border-[#2e2e2e] p-3.5 bg-[#1a1a1a]">
                  <p className="text-[11px] text-[#afafaf]">Planilhas Criadas</p>
                  <p className="mt-1 text-xl font-semibold text-white tabular-nums">
                    {spreadsheets.length}
                  </p>
                </div>
                <div className="border-r border-b border-[#2e2e2e] p-3.5 bg-[#1a1a1a]">
                  <p className="text-[11px] text-[#afafaf]">Abas em {sheetTitle}</p>
                  <p className="mt-1 text-xl font-semibold text-white tabular-nums">
                    {tabs.length}
                  </p>
                </div>
                <div className="border-r border-b border-[#2e2e2e] p-3.5 bg-[#1a1a1a]">
                  <p className="text-[11px] text-[#afafaf]">Status da Ponte</p>
                  <p className="mt-1 text-sm font-semibold text-[#14d06e]">
                    {webhookUrl.trim()
                      ? "Bidirecional Ativa"
                      : isRealGoogleSheetUrl(sheetUrl)
                      ? "Leitura CSV Ativa"
                      : "Aguardando Link"}
                  </p>
                </div>
              </div>

              {auditLogs.length === 0 ? (
                <div className="rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-6 text-center text-xs text-[#afafaf]">
                  Nenhuma colisão registrada ainda nesta sessão. Quando você captar leads ou ler a planilha, cada validação de CNPJ, domínio e telefone aparecerá aqui.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-[#2e2e2e] rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-xs">
                  {auditLogs.map((log, i) => (
                    <div
                      key={i}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-2"
                    >
                      <span className="text-white">
                        <strong className="text-[#7fa9f7] mr-1.5">
                          [{log.action.toUpperCase()}]
                        </strong>
                        {log.empresa} —{" "}
                        <span className="text-[#afafaf]">{log.details}</span>
                      </span>
                      <span className="text-[11px] text-[#757575] tabular-nums shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#2e2e2e] pt-4">
              <button
                type="button"
                disabled={isReadingSheets}
                onClick={handleReadFromGoogleSheets}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                <CloudDownload className="size-3.5 text-[#afafaf]" />
                <span>
                  {isReadingSheets ? "Lendo planilha..." : "Ler Google Sheets Agora"}
                </span>
              </button>

              <button
                type="button"
                disabled={isSyncingSheets}
                onClick={handleSyncToGoogleSheets}
                className="inline-flex items-center gap-2 rounded-lg bg-white hover:bg-white/90 text-[#0d0d0d] px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                <Send className="size-3.5" />
                <span>
                  {isSyncingSheets
                    ? "Sincronizando..."
                    : `Testar & Sincronizar Aba "${activeTab}"`}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MODAL PARA CRIAR NOVA PLANILHA (ESTÉTICA IRVO.COM.BR) */}
      {newSpreadsheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                Criar nova planilha de prospecção
              </h3>
              <button
                type="button"
                onClick={() => setNewSpreadsheetModalOpen(false)}
                className="text-[#afafaf] hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#afafaf] mb-1">
                  Nome da nova planilha
                </label>
                <input
                  type="text"
                  value={newSpreadsheetTitle}
                  onChange={(e) => setNewSpreadsheetTitle(e.target.value)}
                  placeholder="Ex: Metalúrgicas SP, Energia Solar, Agronegócio..."
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-sm text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#afafaf] mb-1">
                  Primeira aba de setor
                </label>
                <input
                  type="text"
                  value={newSpreadsheetFirstTab}
                  onChange={(e) => setNewSpreadsheetFirstTab(e.target.value)}
                  placeholder="Ex: Estruturas Fotovoltaicas, Galpões Metálicos..."
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-sm text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-[#afafaf]">
                    Link no Google Sheets (opcional)
                  </label>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#7fa9f7] hover:underline"
                  >
                    + Abrir sheets.new
                  </a>
                </div>
                <input
                  type="text"
                  value={newSpreadsheetUrl}
                  onChange={(e) => setNewSpreadsheetUrl(e.target.value)}
                  placeholder={
                    webhookUrl.trim()
                      ? "Deixe em branco p/ criar automático via Apps Script"
                      : "Cole o link da planilha criada no Google Sheets"
                  }
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewSpreadsheetModalOpen(false)}
                className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-4 py-2 text-xs font-semibold text-[#afafaf] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isCreatingRemoteSheet}
                onClick={handleCreateNewSpreadsheet}
                className="rounded-lg bg-white hover:bg-white/90 px-4 py-2 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
              >
                {isCreatingRemoteSheet ? "Criando..." : "Criar Planilha"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CRIAR NOVA ABA (ESTÉTICA IRVO.COM.BR) */}
      {newTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                Nova aba de setor em {sheetTitle}
              </h3>
              <button
                type="button"
                onClick={() => setNewTabModalOpen(false)}
                className="text-[#afafaf] hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <input
              type="text"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="Ex: Fabricantes de Esquadrias, Corte e Solda..."
              className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2.5 text-sm text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewTabModalOpen(false)}
                className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-4 py-2 text-xs font-semibold text-[#afafaf] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateTab}
                className="rounded-lg bg-white hover:bg-white/90 px-4 py-2 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
              >
                Criar aba
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
