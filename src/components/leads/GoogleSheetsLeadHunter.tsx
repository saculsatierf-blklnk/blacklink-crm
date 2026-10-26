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

const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1m9Gjeb9UxLJ1aDgPOWOLmKzCqRf7CPkFfYXSGDJpUXA/edit?gid=0#gid=0";

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

// Script Google Apps Script Bidirecional (doGet + doPost) com Trava Tripla (CNPJ, Domínio e Telefone E.164)
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

// 1. LEITURA EM TEMPO REAL DAS COLUNAS E LINHAS DA PLANILHA
function doGet(e) {
  var tabName = (e && e.parameter && e.parameter.tabName) || "Casas Modulares";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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

// 2. INSERÇÃO E MERGE COMPLEMENTAR COM TRAVA ANTI-DUPLICIDADE TRIPLA (CNPJ + DOMÍNIO + TELEFONE)
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabName = data.tabName || "Casas Modulares";
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) sheet = ss.insertSheet(tabName);

  var headers = [["Empresa", "Responsável", "E-mail", "Contato", "Nível de Prospecção", "Observações"]];
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
  for (var j = 0; j < data.rows.length; j++) {
    var r = data.rows[j];
    var rDom = cleanDomain(r.email, r.domain);
    var rPh = cleanPhoneE164(r.contato);
    var rNm = String(r.empresa || "").toLowerCase().trim();
    var matchRow = (rDom && domainMap[rDom]) || (rPh && phoneMap[rPh]) || (rNm && nameMap[rNm]);

    if (!data.replaceAllInTab && matchRow) {
      // Atualiza apenas dados complementares vazios na linha já existente
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

interface GoogleSheetsLeadHunterProps {
  onLeadImportedToKanban?: (newLead: Lead) => void;
  companyName?: string;
}

export function GoogleSheetsLeadHunter({
  onLeadImportedToKanban,
  companyName = "Gofer Metais",
}: GoogleSheetsLeadHunterProps) {
  const [sheetTitle, setSheetTitle] = useState("Imobiliário.");
  const [tabs, setTabs] = useState<string[]>([
    "Casas Modulares",
    "Fachadas",
    "Lajes",
    "Corte e Solda",
    "Esquadrias",
  ]);
  const [activeTab, setActiveTab] = useState<string>("Casas Modulares");
  const [rows, setRows] = useState<ExtractedSheetLead[]>(INITIAL_PRINT_LEADS);

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

  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
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
      const savedWebhook = localStorage.getItem("gofer_sheets_webhook_v1");
      const savedCampWebhook = localStorage.getItem("gofer_campaign_webhook_v1");
      const savedSheetUrl = localStorage.getItem("gofer_sheets_url_v1");
      const savedMyCompany = localStorage.getItem("gofer_my_company_v1");
      const savedRepSite = localStorage.getItem("gofer_represented_site_v1");

      if (savedRows) {
        const parsed = JSON.parse(savedRows);
        if (Array.isArray(parsed) && parsed.length > 0) setRows(parsed);
      }
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) setTabs(parsedTabs);
      }
      if (savedWebhook) setWebhookUrl(savedWebhook);
      if (savedCampWebhook) setCampaignWebhookUrl(savedCampWebhook);
      if (savedSheetUrl) setSheetUrl(savedSheetUrl);
      if (savedMyCompany) setMyCompany(savedMyCompany);
      if (savedRepSite) setRepresentedWebsite(savedRepSite);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("gofer_sheets_leads_v2", JSON.stringify(rows));
      localStorage.setItem("gofer_sheets_tabs_v2", JSON.stringify(tabs));
      localStorage.setItem("gofer_my_company_v1", myCompany);
      localStorage.setItem("gofer_represented_site_v1", representedWebsite);
      if (webhookUrl) localStorage.setItem("gofer_sheets_webhook_v1", webhookUrl);
      if (campaignWebhookUrl)
        localStorage.setItem("gofer_campaign_webhook_v1", campaignWebhookUrl);
      if (sheetUrl) localStorage.setItem("gofer_sheets_url_v1", sheetUrl);
    } catch {}
  }, [rows, tabs, myCompany, representedWebsite, webhookUrl, campaignWebhookUrl, sheetUrl]);

  const [showNicheRadar, setShowNicheRadar] = useState<boolean>(true);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setTargetSegment(tab);
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
  };

  // Lê colunas e leads existentes diretamente do Google Sheets antes de novos inputs
  const handleReadFromGoogleSheets = async () => {
    setIsReadingSheets(true);
    setFeedbackBanner(null);
    try {
      const params = new URLSearchParams({
        sheetUrl,
        tabName: activeTab,
        webhookUrl,
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
            text: `✦ ${dedup.insertedCount} novos leads únicos validados (${dedup.blockedCount} duplicatas travadas). Clique em 'Abastecer Google Sheets' para enviar à nuvem.`,
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
      setIsSetupModalOpen(true);
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
        text: `✦ Aba "${activeTab}" sincronizada com Google Sheets (Trava Anti-Duplicidade Tripla ativa)!`,
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
    a.download = `Imobiliario-${activeTab.replace(/\s+/g, "-")}-${myCompany.replace(/\s+/g, "")}.xls`;
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

  const handleSendRowToKanban = async (row: ExtractedSheetLead) => {
    if (!row.empresa.trim()) return;
    setIsImportingKanban(true);
    try {
      const res = await createLeadAction({
        name: row.responsavel.trim() || `Contato ${row.empresa.trim()}`,
        company: row.empresa.trim(),
        roleTitle: row.tab,
        email:
          row.email.trim() ||
          `contato@${row.empresa.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.br`,
        phone: sanitizePhoneE164(row.contato) || row.contato.trim(),
        initialNote: `[${row.campanha || row.tab} • ${row.nivelProspeccao}] ${row.observacoes || `Prospecção ${myCompany}`}`,
      });
      if (res.success && res.lead) {
        onLeadImportedToKanban?.(res.lead);
        setFeedbackBanner({
          type: "success",
          text: `✦ "${row.empresa}" enviado para a sua carteira no Kanban!`,
        });
      } else {
        setFeedbackBanner({
          type: "info",
          text: res.error || "Empresa já cadastrada no Kanban.",
        });
      }
    } catch {
      setFeedbackBanner({
        type: "error",
        text: "Erro ao enviar para o Kanban.",
      });
    } finally {
      setIsImportingKanban(false);
    }
  };

  const handleCreateTab = () => {
    const clean = newTabName.trim();
    if (!clean) return;
    if (!tabs.includes(clean)) {
      setTabs((prev) => [...prev, clean]);
    }
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
    <div className="space-y-10 text-white">
      {/* 1. CABEÇALHO & CONFIGURAÇÃO DA SESSÃO ATIVA (ESTÉTICA IRVO.COM.BR) */}
      <section className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 md:p-7 border-b border-[#2e2e2e]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex h-6 items-center rounded-full bg-[#0f1b33] px-3 text-xs font-semibold text-[#7fa9f7]">
                Data Warehouse · Google Sheets
              </span>
              <span className="inline-flex h-6 items-center rounded-full bg-[#0c2b1c] px-3 text-xs font-semibold text-[#14d06e]">
                CNPJ · Domínio · E.164
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.03em] text-white">
              Prospecção B2B &amp; Inteligência de Cadência
            </h2>
            <p className="text-sm text-[#afafaf] max-w-2xl">
              Configure a empresa representada e o setor alvo. O sistema valida cada contato contra duplicidade antes de abastecer a planilha.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isReadingSheets}
              onClick={handleReadFromGoogleSheets}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <CloudDownload className="size-3.5 text-[#afafaf]" />
              <span>
                {isReadingSheets ? "Lendo planilha..." : "Ler Google Sheets"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowAuditDrawer((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer tabular-nums"
            >
              <Terminal className="size-3.5 text-[#afafaf]" />
              <span>Auditoria ({auditLogs.length})</span>
            </button>

            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3.5 py-2 text-xs font-semibold text-white transition-colors"
            >
              <FileSpreadsheet className="size-3.5 text-[#afafaf]" />
              <span>Abrir Planilha</span>
              <ExternalLink className="size-3 text-[#757575]" />
            </a>

            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white text-[#0d0d0d] hover:bg-white/90 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Link2 className="size-3.5" />
              <span>
                {webhookUrl ? "Ponte Conectada" : "Conectar Google Sheets"}
              </span>
            </button>
          </div>
        </div>

        {/* Grade de Inputs Globais no padrão de linhas divisórias irvo.com.br */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#2e2e2e]">
          <div className="md:col-span-3 p-4 md:p-5 border-b md:border-b-0 md:border-r border-[#2e2e2e] space-y-1.5">
            <label className="block text-xs font-medium text-[#afafaf]">
              Minha empresa
            </label>
            <input
              type="text"
              value={myCompany}
              onChange={(e) => setMyCompany(e.target.value)}
              placeholder="Gofer Metais"
              className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-sm text-white font-semibold placeholder:text-[#757575] focus:ring-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-3 p-4 md:p-5 border-b md:border-b-0 md:border-r border-[#2e2e2e] space-y-1.5">
            <label className="block text-xs font-medium text-[#afafaf]">
              Site institucional
            </label>
            <input
              type="text"
              value={representedWebsite}
              onChange={(e) => setRepresentedWebsite(e.target.value)}
              placeholder="https://gofermetais.com.br"
              className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-sm text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-3 p-4 md:p-5 border-b md:border-b-0 md:border-r border-[#2e2e2e] space-y-1.5">
            <label className="block text-xs font-medium text-[#afafaf]">
              Setor alvo de prospecção
            </label>
            <input
              type="text"
              value={targetSegment}
              onChange={(e) => setTargetSegment(e.target.value)}
              placeholder="Casas Modulares, Fachadas, Esquadrias..."
              className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-sm text-white font-semibold placeholder:text-[#757575] focus:ring-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-1 p-4 md:p-5 border-b md:border-b-0 md:border-r border-[#2e2e2e] space-y-1.5">
            <label className="block text-xs font-medium text-[#afafaf]">
              Região
            </label>
            <select
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              className="w-full rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-2.5 py-2 text-sm text-white focus:ring-white focus:outline-none"
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

          <div className="md:col-span-2 p-4 md:p-5 flex items-end">
            <button
              type="button"
              disabled={isExtracting}
              onClick={handleExtractLeads}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-white/90 disabled:opacity-50 text-[#0d0d0d] font-semibold px-4 py-2.5 text-sm transition-colors cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Captando...</span>
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  <span>Captar Leads</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barra de Setores Rápidos e Alternadores de Painéis */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#000000]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#afafaf] mr-1">Setores:</span>
            {[
              "Casas Modulares",
              "Fachadas",
              "Lajes",
              "Corte e Solda",
              "Esquadrias",
              "Construtoras Steel Frame",
              "Estruturas Metálicas",
            ].map((seg) => {
              const active = targetSegment.toLowerCase() === seg.toLowerCase();
              return (
                <button
                  key={seg}
                  type="button"
                  onClick={() => {
                    setTargetSegment(seg);
                    if (!tabs.includes(seg)) {
                      setTabs((prev) => [...prev, seg]);
                    }
                    setActiveTab(seg);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-white text-[#0d0d0d] font-semibold"
                      : "bg-[#1a1a1a] text-[#afafaf] hover:text-white ring-1 ring-[#2e2e2e]"
                  }`}
                >
                  {seg}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNicheRadar((v) => !v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ring-1 ${
                showNicheRadar
                  ? "bg-[#262626] text-white ring-[#7fa9f7]/60"
                  : "bg-[#1a1a1a] text-[#afafaf] ring-[#2e2e2e] hover:text-white"
              }`}
            >
              Mapa de Nichos
            </button>
            <button
              type="button"
              onClick={() => setShowCadenceEngine((v) => !v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ring-1 flex items-center gap-1.5 ${
                showCadenceEngine
                  ? "bg-[#262626] text-white ring-[#7fa9f7]/60"
                  : "bg-[#1a1a1a] text-[#afafaf] ring-[#2e2e2e] hover:text-white"
              }`}
            >
              <Calendar className="size-3.5" />
              <span>Cadência Semanal</span>
            </button>
          </div>
        </div>

        {/* Feedback Banner Sóbrio (Padrão irvo.com.br) */}
        {feedbackBanner && (
          <div
            className={`flex items-center justify-between gap-3 px-5 py-3 text-xs font-medium border-t border-[#2e2e2e] ${
              feedbackBanner.type === "success"
                ? "bg-[#0c2b1c] text-[#14d06e]"
                : feedbackBanner.type === "error"
                ? "bg-[#2b1310] text-[#ff5d48]"
                : "bg-[#0f1b33] text-[#7fa9f7]"
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

        {/* Gaveta de Auditoria Anti-Duplicidade */}
        {showAuditDrawer && (
          <div className="border-t border-[#2e2e2e] bg-[#0d0d0d] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Registro de Auditoria Anti-Duplicidade (CNPJ · Domínio · E.164)
              </span>
              <button
                type="button"
                onClick={() => setShowAuditDrawer(false)}
                className="text-xs text-[#afafaf] hover:text-white cursor-pointer"
              >
                Fechar
              </button>
            </div>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-[#afafaf]">
                Nenhuma verificação executada nesta sessão. Clique em &ldquo;Captar Leads&rdquo;.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto divide-y divide-[#2e2e2e] rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-xs">
                {auditLogs.map((log, i) => (
                  <div
                    key={i}
                    className="px-3.5 py-2 flex items-center justify-between gap-2"
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
        )}
      </section>

      {/* 2. MAPA DE TRAÇÃO POR NICHO & NOVOS SETORES (GRADE ARQUITETÔNICA IRVO.COM.BR) */}
      {showNicheRadar && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#afafaf] uppercase tracking-wider">
                Inteligência de Portfólio · {myCompany}
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
                  className={`flex min-h-44 flex-col justify-between border-r border-b border-[#2e2e2e] p-5 md:p-6 transition-colors cursor-pointer ${
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

                  <div className="mt-auto pt-6">
                    <p className="text-base font-semibold text-white">
                      {st.tab}
                    </p>
                    <div className="mt-2 flex items-baseline justify-between text-xs text-[#afafaf] tabular-nums">
                      <span>{st.total} empresas</span>
                      <span>
                        {st.engagedCount} c/ catálogo · {st.hotHighlighted} destaque
                      </span>
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
                        Criar aba na planilha
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!tabs.includes(rec.niche)) {
                            setTabs((prev) => [...prev, rec.niche]);
                          }
                          setActiveTab(rec.niche);
                          setTargetSegment(rec.niche);
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

      {/* 3. INTELIGÊNCIA DE CADÊNCIA SEMANAL (SEGUNDA A SEXTA) & COPILOTO DE SCRIPTS */}
      {showCadenceEngine && (
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#afafaf] uppercase tracking-wider">
                Roteiro Semanal · Segunda a Sexta
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                Cadência comercial &amp; entrega do catálogo em PDF
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums">
              <span className="inline-flex h-7 items-center rounded-full bg-[#2b2410] px-3 font-semibold text-[#e8c267]">
                {
                  activeTabRows.filter(
                    (r) => r.nivelProspeccao === "Tentativa de contato"
                  ).length
                }{" "}
                aguardando 1º contato
              </span>
              <span className="inline-flex h-7 items-center rounded-full bg-[#0f1b33] px-3 font-semibold text-[#7fa9f7]">
                {
                  activeTabRows.filter(
                    (r) => r.nivelProspeccao === "Catálogo enviado"
                  ).length
                }{" "}
                com PDF enviado
              </span>
              <span className="inline-flex h-7 items-center rounded-full bg-[#0c2b1c] px-3 font-semibold text-[#14d06e]">
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

          {/* Grade de 5 Dias (Segunda a Sexta) na estética arquitetônica irvo.com.br */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-[#2e2e2e]">
            {WEEKLY_CADENCE_STEPS.map((step) => {
              const isSelected = step.dayCode === selectedCadenceDay;
              return (
                <button
                  key={step.dayCode}
                  type="button"
                  onClick={() => setSelectedCadenceDay(step.dayCode)}
                  className={`flex min-h-44 flex-col justify-between border-r border-b border-[#2e2e2e] p-5 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#1a1a1a]"
                      : "bg-[#000000] hover:bg-[#0d0d0d]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span
                      className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold ${
                        isSelected
                          ? "bg-white text-[#0d0d0d]"
                          : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e]"
                      }`}
                    >
                      {step.dayLabel}
                    </span>
                    {step.dayCode === "D1" && (
                      <span className="text-xs font-semibold text-[#14d06e]">
                        Hoje
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-white">
                      {step.touchNumber}
                    </p>
                    <p className="mt-2 text-xs text-[#afafaf] leading-relaxed">
                      {step.objective}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bloco Operacional de Segunda-Feira (D1): Abastecimento das Abas da Planilha */}
          {selectedCadenceDay === "D1" && (
            <div className="rounded-lg bg-[#1a1a1a] p-5 ring-1 ring-[#2e2e2e] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2e2e2e] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 items-center rounded-full bg-[#0c2b1c] px-2.5 text-xs font-semibold text-[#14d06e]">
                      Planejamento de Segunda-feira
                    </span>
                    <span className="text-sm font-semibold text-white">
                      Mapeamento de Setores &amp; Abastecimento da Semana
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#afafaf]">
                    Garanta pelo menos 15 a 20 empresas em cada aba hoje para trabalhar os disparos e envios de PDF de terça a sexta-feira.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={handleExtractLeads}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#0d0d0d] hover:bg-white/90 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  <Search className="size-3.5" />
                  <span>
                    {isExtracting
                      ? "Abastecendo..."
                      : `Abastecer "${activeTab}" (+${batchLimit} leads)`}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {nicheIntelligence.stats.map((st) => {
                  const needsSupply = st.total < 15;
                  const active = activeTab === st.tab;
                  return (
                    <div
                      key={st.tab}
                      onClick={() => handleSelectTab(st.tab)}
                      className={`rounded-md p-3.5 transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                        active
                          ? "bg-[#262626] ring-1 ring-[#7fa9f7]/60"
                          : "bg-[#0d0d0d] ring-1 ring-[#2e2e2e] hover:bg-[#262626]/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {st.tab}
                          </span>
                          <span
                            className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${
                              needsSupply
                                ? "bg-[#2b2410] text-[#e8c267]"
                                : "bg-[#0c2b1c] text-[#14d06e]"
                            }`}
                          >
                            {needsSupply ? "Abastecer" : "Pronta"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold tabular-nums text-white">
                          {st.total}{" "}
                          <span className="font-normal text-xs text-[#afafaf]">
                            empresas
                          </span>
                        </p>
                      </div>

                      <span className="text-[11px] text-[#afafaf]">
                        {active ? "Aba selecionada" : "Selecionar aba"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fila Prioritária + Copiloto de Scripts da Empresa (Design data-ui da irvo.com.br) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Coluna Esquerda: Fila Prioritária do Dia */}
            <div className="lg:col-span-4 rounded-lg bg-[#1a1a1a] p-4 ring-1 ring-[#2e2e2e] flex flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-[#afafaf]">
                    Fila de prioridade · {currentCadenceStep.dayLabel}
                  </p>
                  <span className="text-xs font-semibold text-white tabular-nums">
                    {cadenceQueueForDay.length} empresas
                  </span>
                </div>

                <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1">
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
                            <p className="text-sm font-semibold text-white truncate">
                              {item.empresa}
                            </p>
                          </div>
                          <span
                            className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold whitespace-nowrap ${getIrvoLevelBadge(
                              item.nivelProspeccao
                            )}`}
                          >
                            {item.nivelProspeccao}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-[#afafaf]">
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

              <div className="mt-4 flex items-baseline justify-between border-t border-[#2e2e2e] pt-3 text-xs text-[#afafaf]">
                <span>Aba em foco</span>
                <span className="font-semibold text-white">{activeTab}</span>
              </div>
            </div>

            {/* Coluna Direita: Copiloto de Scripts e Entrega do PDF */}
            <div className="lg:col-span-8 rounded-lg bg-[#1a1a1a] p-5 ring-1 ring-[#2e2e2e] space-y-5">
              {selectedCadenceLead && leadCadencePlaybook ? (
                <>
                  <div className="rounded-md bg-[#262626] p-4 ring-1 ring-[#7fa9f7]/60">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold whitespace-nowrap ${getIrvoLevelBadge(
                            selectedCadenceLead.nivelProspeccao
                          )}`}
                        >
                          {selectedCadenceLead.nivelProspeccao}
                        </span>
                        <span className="text-xs text-[#afafaf]">
                          {selectedCadenceLead.responsavel
                            ? `Responsável: ${selectedCadenceLead.responsavel}`
                            : "Responsável pendente de confirmação"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAdvanceLeadCadence(selectedCadenceLead, false)
                          }
                          className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#0d0d0d] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                        >
                          Registrar toque
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAdvanceLeadCadence(selectedCadenceLead, true)
                          }
                          className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                        >
                          <Check className="size-3.5" />
                          <span>
                            Avançar para {leadCadencePlaybook.nextRecommendedLevel}
                          </span>
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-base font-semibold text-white">
                      {selectedCadenceLead.empresa}{" "}
                      <span className="font-normal text-sm text-[#afafaf]">
                        · {leadCadencePlaybook.stageTitle}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[#afafaf]">
                      {leadCadencePlaybook.timingHint}
                    </p>
                  </div>

                  {/* Canais: Ligação, WhatsApp e E-mail */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      {/* 1. Roteiro de Ligação */}
                      <div className="rounded-md bg-[#0d0d0d] p-4 ring-1 ring-[#2e2e2e] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white flex items-center gap-2">
                            <PhoneCall className="size-3.5 text-[#afafaf]" />
                            <span>Ligação rápida (30s)</span>
                          </span>
                          <span className="text-xs text-[#afafaf] tabular-nums">
                            {selectedCadenceLead.contato || "Sem telefone"}
                          </span>
                        </div>
                        <p className="text-xs text-[#afafaf] leading-relaxed">
                          {leadCadencePlaybook.phoneScript}
                        </p>
                      </div>

                      {/* 2. Script WhatsApp */}
                      <div className="rounded-md bg-[#0d0d0d] p-4 ring-1 ring-[#2e2e2e] space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white flex items-center gap-2">
                            <MessageCircle className="size-3.5 text-[#afafaf]" />
                            <span>Mensagem WhatsApp</span>
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
                        <pre className="whitespace-pre-wrap font-sans text-xs text-[#afafaf] leading-relaxed bg-[#1a1a1a] rounded p-3 ring-1 ring-[#2e2e2e]">
                          {leadCadencePlaybook.whatsappScript}
                        </pre>
                      </div>
                    </div>

                    {/* 3. E-mail B2B Completo */}
                    <div className="rounded-md bg-[#0d0d0d] p-4 ring-1 ring-[#2e2e2e] flex flex-col justify-between space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white flex items-center gap-2">
                            <Mail className="size-3.5 text-[#afafaf]" />
                            <span>E-mail comercial</span>
                          </span>
                          <div className="flex items-center gap-1.5">
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

                        <div className="rounded bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-xs space-y-1">
                          <div className="flex justify-between gap-2">
                            <span className="text-[#757575]">Para:</span>
                            <span className="text-white font-medium truncate">
                              {selectedCadenceLead.email || "Não informado"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-[#757575]">Assunto:</span>
                            <span className="text-white font-medium truncate">
                              {leadCadencePlaybook.emailSubject}
                            </span>
                          </div>
                        </div>

                        <pre className="whitespace-pre-wrap font-sans text-xs text-[#afafaf] leading-relaxed bg-[#1a1a1a] rounded p-3 ring-1 ring-[#2e2e2e] max-h-[210px] overflow-y-auto">
                          {leadCadencePlaybook.emailBody}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 4. Entrega do Catálogo em PDF (Quando o lead responde pedindo o catálogo) */}
                  <div className="rounded-md bg-[#0d0d0d] p-4 ring-1 ring-[#2e2e2e] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-white text-[#0d0d0d]">
                          <Check className="size-3.5 stroke-[3]" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            Resposta ao pedido de catálogo (Envio do arquivo PDF)
                          </p>
                          <p className="text-xs text-[#afafaf]">
                            Quando o cliente pedir o catálogo, envie o PDF junto com esta mensagem e marque como enviado.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              leadCadencePlaybook.pdfDeliveryWhatsapp
                            );
                            setCopiedCadenceField("pdf_wpp");
                            setTimeout(() => setCopiedCadenceField(null), 2500);
                          }}
                          className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-medium text-white cursor-pointer"
                        >
                          {copiedCadenceField === "pdf_wpp"
                            ? "Texto copiado"
                            : "Copiar mensagem PDF"}
                        </button>

                        {sanitizePhoneE164(selectedCadenceLead.contato).length >=
                          12 && (
                          <a
                            href={`https://wa.me/${sanitizePhoneE164(
                              selectedCadenceLead.contato
                            )}?text=${encodeURIComponent(
                              leadCadencePlaybook.pdfDeliveryWhatsapp
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Abrir WhatsApp p/ anexar PDF
                          </a>
                        )}

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
                          className="rounded-md bg-white hover:bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                        >
                          Marcar PDF enviado
                        </button>
                      </div>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs text-[#afafaf] leading-relaxed bg-[#1a1a1a] rounded p-3 ring-1 ring-[#2e2e2e]">
                      {leadCadencePlaybook.pdfDeliveryWhatsapp}
                    </pre>
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

      {/* 4. PLANILHA DATA WAREHOUSE (GRADE ARQUITETÔNICA IRVO.COM.BR + SINCRONIZAÇÃO GOOGLE SHEETS) */}
      <section className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-white">
              <FileSpreadsheet className="size-4" />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  className="font-semibold text-base text-white bg-transparent border border-transparent hover:border-[#2e2e2e] focus:border-white focus:bg-[#1a1a1a] rounded px-1.5 py-0.5 focus:outline-none"
                />
                <span className="inline-flex h-6 items-center rounded-full bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-2.5 text-xs font-semibold text-[#afafaf] tabular-nums">
                  {activeTabRows.length} empresas em {activeTab}
                </span>
              </div>
              <p className="text-xs text-[#afafaf] px-1.5">
                Espelho sincronizado com o Google Sheets · Telefones no padrão E.164 e verificação de domínio/CNPJ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addEmptyRow}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Nova linha</span>
            </button>

            <button
              type="button"
              onClick={handleCopyForGoogleSheets}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {copiedTable ? (
                <>
                  <Check className="size-3.5 text-[#14d06e]" />
                  <span className="text-[#14d06e]">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-[#afafaf]" />
                  <span>Copiar tabela</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadFormattedSheet}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Download className="size-3.5 text-[#afafaf]" />
              <span>Exportar .xls</span>
            </button>

            <button
              type="button"
              disabled={isSyncingSheets}
              onClick={handleSyncToGoogleSheets}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-white/90 text-[#0d0d0d] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
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

        {/* Grade de Dados com Linhas Divisórias #2e2e2e */}
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-[#1a1a1a] border-b border-[#2e2e2e]">
              <tr className="text-xs font-semibold text-[#afafaf]">
                <th className="w-12 border-r border-[#2e2e2e] py-3 text-center tabular-nums">
                  #
                </th>
                <th className="border-r border-[#2e2e2e] px-3.5 py-3 w-[210px]">
                  Empresa
                </th>
                <th className="border-r border-[#2e2e2e] px-3.5 py-3 w-[150px]">
                  Responsável
                </th>
                <th className="border-r border-[#2e2e2e] px-3.5 py-3 w-[240px]">
                  E-mail
                </th>
                <th className="border-r border-[#2e2e2e] px-3.5 py-3 w-[165px]">
                  Contato
                </th>
                <th className="border-r border-[#2e2e2e] px-3.5 py-3 w-[185px]">
                  Nível de Prospecção
                </th>
                <th className="border-r border-[#2e2e2e] px-3.5 py-3 min-w-[260px]">
                  Observações
                </th>
                <th className="w-28 px-3 py-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2e2e2e] text-xs">
              {activeTabRows.map((row, idx) => {
                const rowNumber = idx + 1;
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
                      row.highlighted
                        ? "bg-[#2b2410]/60 hover:bg-[#2b2410]"
                        : "bg-[#000000] hover:bg-[#1a1a1a]/60"
                    }`}
                  >
                    <td className="border-r border-[#2e2e2e] text-center text-[#757575] tabular-nums py-2.5 select-none">
                      {rowNumber}
                    </td>

                    {/* Empresa */}
                    <td className="border-r border-[#2e2e2e] px-3 py-2">
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
                        <div className="flex items-center gap-1.5 px-1.5 text-[11px] text-[#757575] tabular-nums">
                          {row.cnpj && <span>{sanitizeCnpj(row.cnpj)}</span>}
                          {domainKey && !domainKey.startsWith("freemail:") && (
                            <span>· {domainKey}</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Responsável */}
                    <td className="border-r border-[#2e2e2e] px-3 py-2">
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
                    <td className="border-r border-[#2e2e2e] px-3 py-2">
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
                    <td className="border-r border-[#2e2e2e] px-3 py-2">
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
                    <td className="border-r border-[#2e2e2e] px-3 py-2">
                      <select
                        value={row.nivelProspeccao}
                        onChange={(e) =>
                          updateCell(
                            row.id,
                            "nivelProspeccao",
                            e.target.value as ProspectionLevel
                          )
                        }
                        className={`w-full rounded-full px-3 py-1 text-xs font-semibold cursor-pointer focus:outline-none ${getIrvoLevelBadge(
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
                    <td className="border-r border-[#2e2e2e] px-3 py-2">
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

                    {/* Ações */}
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCadenceLeadId(row.id);
                            setShowCadenceEngine(true);
                          }}
                          title="Abrir scripts de cadência desta empresa"
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            selectedCadenceLead?.id === row.id && showCadenceEngine
                              ? "bg-white text-[#0d0d0d]"
                              : "text-[#afafaf] hover:text-white hover:bg-[#1a1a1a]"
                          }`}
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
                          disabled={isImportingKanban}
                          onClick={() => handleSendRowToKanban(row)}
                          title="Enviar para o Kanban"
                          className="p-1.5 rounded text-[#afafaf] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                        >
                          <Kanban className="size-3.5" />
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

        {/* Barra Inferior de Abas na estética irvo.com.br */}
        <div className="flex items-center gap-1.5 bg-[#0d0d0d] border-t border-[#2e2e2e] px-4 py-2.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setNewTabModalOpen(true)}
            title="Nova aba de setor"
            className="inline-flex size-7 items-center justify-center rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] text-white cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" />
          </button>

          {tabs.map((tab) => {
            const isCurrent = tab === activeTab;
            const count = rows.filter((r) => r.tab === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleSelectTab(tab)}
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
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
      </section>

      {/* MODAL PARA CRIAR NOVA ABA (ESTÉTICA IRVO.COM.BR) */}
      {newTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                Nova aba de setor
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

      {/* MODAL DE CONEXÃO COM GOOGLE SHEETS (ESTÉTICA IRVO.COM.BR) */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-4">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="size-5 text-white" />
                <h3 className="text-base font-semibold text-white">
                  Conector Google Sheets (Leitura + Escrita sem Login OAuth)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="text-[#afafaf] hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#afafaf] leading-relaxed">
              <p>
                Cole o script abaixo dentro de <strong className="text-white">Extensões &rarr; Apps Script</strong> na sua planilha e implante como <strong className="text-white">App da Web</strong> (acesso: <em>Qualquer pessoa</em>). Ele executa em nome da sua conta Google com trava anti-duplicidade.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#afafaf]">
                  Código Google Apps Script
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
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copiar código</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-40 overflow-y-auto rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3 text-[11px] font-mono text-[#afafaf]">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#afafaf] mb-1">
                  URL da planilha Google Sheets
                </label>
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-xs text-white focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  URL do App da Web (Apps Script)
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2.5 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
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
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#2e2e2e]">
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="rounded-lg bg-white hover:bg-white/90 px-5 py-2 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
              >
                Salvar configuração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
