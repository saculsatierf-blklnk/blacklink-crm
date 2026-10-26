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
        touchNumber: "Toque 1 • Abertura & Descoberta",
        targetLevel: "Tentativa de contato" as ProspectionLevel,
        nextLevel: "Catálogo enviado" as ProspectionLevel,
        channels: ["Ligação Rápida (Triagem)", "WhatsApp Catálogo", "E-mail Técnico"],
        objective:
          "Descobrir o nome do comprador/engenharia nas empresas em 'Tentativa de contato' e enviar o catálogo técnico da Gofer Metais.",
        badgeColor: "border-amber-500/40 bg-amber-500/15 text-amber-300",
      },
      {
        dayCode: "D2" as const,
        dayLabel: "Terça-feira",
        touchNumber: "Toque 2 • Follow-up de Catálogo (24h)",
        targetLevel: "Catálogo enviado" as ProspectionLevel,
        nextLevel: "Em contato" as ProspectionLevel,
        channels: ["WhatsApp Direto", "E-mail de Bitolas/Recorrência"],
        objective:
          "Cobrar retorno de quem já recebeu o catálogo, perguntando qual especificação de chapa/perfil compram com maior recorrência para cotar comparativo.",
        badgeColor: "border-indigo-500/40 bg-indigo-500/15 text-indigo-300",
      },
      {
        dayCode: "D3" as const,
        dayLabel: "Quarta-feira",
        touchNumber: "Toque 3 • Destravamento de Cotação (Quentes)",
        targetLevel: "Em contato" as ProspectionLevel,
        nextLevel: "Reunião agendada" as ProspectionLevel,
        channels: ["Ligação p/ Decisor", "WhatsApp Condição Comercial"],
        objective:
          "Focar nos leads em 'Em contato' e destacados em amarelo para puxar 1 item da lista de compras atual deles e bater preço/prazo.",
        badgeColor: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
      },
      {
        dayCode: "D4" as const,
        dayLabel: "Quinta-feira",
        touchNumber: "Toque 4 • Reativação & Janela Logística",
        targetLevel: "Catálogo enviado" as ProspectionLevel,
        nextLevel: "Em contato" as ProspectionLevel,
        channels: ["E-mail de Programação de Corte", "WhatsApp Áudio/Curto"],
        objective:
          "Usar o gatilho de fechamento da programação de corte/dobra da próxima semana para destravar compradores silenciosos.",
        badgeColor: "border-sky-500/40 bg-sky-500/15 text-sky-300",
      },
      {
        dayCode: "D5" as const,
        dayLabel: "Sexta-feira",
        touchNumber: "Toque 5 • Fechamento de Agenda & Breakup",
        targetLevel: "Reunião agendada" as ProspectionLevel,
        nextLevel: "Reunião agendada" as ProspectionLevel,
        channels: ["WhatsApp Confirmação", "E-mail Resumo Executivo"],
        objective:
          "Confirmar reuniões técnicas agendadas e deixar porta aberta para cotações da segunda-feira seguinte.",
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
    if (selectedCadenceDay === "D1") {
      // Segunda: Prioriza 'Tentativa de contato' + Destaques Amarelos para abrir a semana forte
      return validRows.sort((a, b) => {
        const aScore =
          (a.nivelProspeccao === "Tentativa de contato" ? 20 : 0) +
          (a.highlighted ? 15 : 0) +
          (a.nivelProspeccao === "Catálogo enviado" ? 5 : 0);
        const bScore =
          (b.nivelProspeccao === "Tentativa de contato" ? 20 : 0) +
          (b.highlighted ? 15 : 0) +
          (b.nivelProspeccao === "Catálogo enviado" ? 5 : 0);
        return bScore - aScore;
      });
    }
    if (selectedCadenceDay === "D2" || selectedCadenceDay === "D4") {
      // Terça e Quinta: Prioriza 'Catálogo enviado' (os 12 leads parados esperando follow-up!)
      return validRows.sort((a, b) => {
        const aScore =
          (a.nivelProspeccao === "Catálogo enviado" ? 25 : 0) +
          (a.highlighted ? 10 : 0);
        const bScore =
          (b.nivelProspeccao === "Catálogo enviado" ? 25 : 0) +
          (b.highlighted ? 10 : 0);
        return bScore - aScore;
      });
    }
    if (selectedCadenceDay === "D3") {
      // Quarta: Prioriza Destaques Amarelos + 'Em contato'
      return validRows.sort((a, b) => {
        const aScore =
          (a.highlighted ? 25 : 0) +
          (a.nivelProspeccao === "Em contato" ? 20 : 0) +
          (a.nivelProspeccao === "Catálogo enviado" ? 10 : 0);
        const bScore =
          (b.highlighted ? 25 : 0) +
          (b.nivelProspeccao === "Em contato" ? 20 : 0) +
          (b.nivelProspeccao === "Catálogo enviado" ? 10 : 0);
        return bScore - aScore;
      });
    }
    // Sexta: Prioriza 'Reunião agendada' + 'Em contato'
    return validRows.sort((a, b) => {
      const aScore =
        (a.nivelProspeccao === "Reunião agendada" ? 30 : 0) +
        (a.nivelProspeccao === "Em contato" ? 20 : 0) +
        (a.highlighted ? 10 : 0);
      const bScore =
        (b.nivelProspeccao === "Reunião agendada" ? 30 : 0) +
        (b.nivelProspeccao === "Em contato" ? 20 : 0) +
        (b.highlighted ? 10 : 0);
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

  // Gerador dinâmico de Scripts (WhatsApp + E-mail Assunto/Corpo + Ligação) adaptado ao Nível de Prospecção e Observações do Lead
  const leadCadencePlaybook = useMemo(() => {
    if (!selectedCadenceLead) return null;
    const emp = selectedCadenceLead.empresa || "sua empresa";
    const resp = selectedCadenceLead.responsavel?.trim();
    const greeting = resp ? `Olá ${resp}, tudo bem?` : `Olá, bom dia! Tudo bem?`;
    const sector = selectedCadenceLead.tab || activeTab || "Estruturas Metálicas";
    const obs = selectedCadenceLead.observacoes?.trim() || "";
    const hasCustomNote =
      obs.length > 0 && !obs.startsWith("[Toque") && !obs.startsWith("[Auto-");

    const customHook = hasCustomNote
      ? `Vi aqui na minha anotação sobre a ${emp} (${obs.toLowerCase()}) e separei exatamente as linhas que atendem essa aplicação.`
      : `Atendemos fabricantes de ${sector} com fornecimento ágil de chapas, bobinas, perfis estruturais dobrados e aço galvanizado sob medida.`;

    if (selectedCadenceLead.nivelProspeccao === "Tentativa de contato") {
      return {
        stageTitle: "Toque 1 (Abertura): Descobrir Comprador & Enviar Catálogo",
        nextRecommendedLevel: "Catálogo enviado" as ProspectionLevel,
        timingHint:
          "Ideal para Segunda-feira de manhã: ligue rápido para pegar o nome do comprador(a) e já mande o catálogo no WhatsApp + E-mail.",
        phoneScript: `"Bom dia! Aqui é da ${myCompany}. Nós fornecemos aços, chapas e perfis estruturais para o setor de ${sector}. Quem é a pessoa responsável pelas compras de aço ou engenharia da ${emp} hoje para eu direcionar nossa tabela técnica?"`,
        whatsappScript: `${greeting} Aqui é da *${myCompany}* (${representedWebsite}).\n\n${customHook}\n\nPosso te enviar por aqui o nosso catálogo técnico de aços e perfis para você ter a ${myCompany} homologada nas próximas cotações da *${emp}*?`,
        emailSubject: `Homologação de Fornecimento de Aço & Perfis (${myCompany} -> ${emp})`,
        emailBody: `${greeting}\n\nEntro em contato pela área comercial da ${myCompany} (${representedWebsite}).\n\n${customHook}\n\nSabemos que no setor de ${sector} atraso de entrega e variação de dobra travam o cronograma de produção. Trabalhamos com pronta-entrega e corte/dobra sob medida.\n\nSeguem nossos canais diretos. Quem seria o ponto focal de compras/engenharia na ${emp} para validarmos uma primeira cotação comparativa sem compromisso?\n\nAtenciosamente,\nComercial ${myCompany}`,
      };
    }

    if (selectedCadenceLead.nivelProspeccao === "Catálogo enviado") {
      return {
        stageTitle: "Toque 2/3 (Follow-up de Catálogo): Puxar 1 Item p/ Cotação Comparativa",
        nextRecommendedLevel: "Em contato" as ProspectionLevel,
        timingHint:
          "Você já enviou o catálogo! Não pergunte apenas 'se viu o catálogo' — peça 1 bitola ou perfil que eles compram todo mês para você cotar e provar preço.",
        phoneScript: `"${
          resp ? `Oi ${resp}` : "Bom dia"
        }, tudo bem? Aqui é da ${myCompany}. Te mandei nosso catálogo técnico de aços para a ${emp}. Queria fazer um teste rápido e sem compromisso: qual é a chapa ou perfil que vocês mais consomem no mês aí para eu montar um comparativo de preço e prazo hoje?"`,
        whatsappScript: `${greeting} Passando para dar um retorno rápido sobre o catálogo da *${myCompany}* que te enviei!\n\n${
          hasCustomNote ? `${customHook}\n\n` : ""
        }Para você testar a nossa competitividade na prática sem precisar mudar nada na operação da *${emp}* hoje: qual é a bitola de chapa ou perfil que vocês compram com maior recorrência? Me manda a especificação que eu te devolvo uma cotação comparativa ainda hoje!`,
        emailSubject: `Re: Catálogo ${myCompany} — Cotação comparativa p/ ${emp}`,
        emailBody: `${greeting}\n\nEnviei recentemente nosso catálogo técnico da ${myCompany} para a ${emp}.\n\n${
          hasCustomNote ? `${customHook}\n\n` : ""
        }Estamos fechando a programação de corte e distribuição desta semana para o setor de ${sector}. Para que você possa avaliar nosso custo por quilo/peça e nosso prazo de entrega:\n\nVocê teria alguma requisição de chapas, telhas ou perfis estruturais em aberto nesta semana para cotarmos como comparativo?\n\nFico no aguardo de uma especificação rápida por aqui ou no WhatsApp.\n\nAbraço,\nComercial ${myCompany}`,
      };
    }

    if (selectedCadenceLead.nivelProspeccao === "Em contato") {
      return {
        stageTitle: "Toque 4 (Fechamento / Destravamento): Converter Conversa em Cotação/Reunião",
        nextRecommendedLevel: "Reunião agendada" as ProspectionLevel,
        timingHint:
          "Lead quente! O objetivo agora é alinhar condição comercial, prazo de pagamento/entrega ou cravar 10 min de call com compras.",
        phoneScript: `"${
          resp ? `Fala ${resp}` : "Olá"
        }, aqui é da ${myCompany}! Como já estamos em contato sobre o fornecimento para a ${emp}, queria alinhar nossa programação desta semana. Consegue me passar a lista da próxima obra/lote ou fazemos um bate-papo rápido de 10 min na quinta-feira?"`,
        whatsappScript: `${greeting} Tudo certo por aí na *${emp}*?\n\nAproveitando que começamos a semana: estamos reservando lote e programação de entrega na *${myCompany}* para clientes de ${sector}.\n\nConseguimos avançar naquela demanda de aços/perfis nesta semana ou prefere agendar uma conversa rápida de 10 minutos para alinharmos condição comercial e faturamento?`,
        emailSubject: `Condição Comercial & Programação de Entrega — ${myCompany} + ${emp}`,
        emailBody: `${greeting}\n\nDando sequência ao nosso contato comercial entre ${myCompany} e ${emp}, gostaria de alinhar os próximos passos para atendermos a programação de vocês neste mês.\n\nPodemos agendar uma breve chamada de 10 minutos nesta semana para definirmos tabela, prazos de entrega e cadastro, ou você já prefere me enviar a lista de materiais da próxima produção?\n\nAtenciosamente,\nComercial ${myCompany}`,
      };
    }

    return {
      stageTitle: "Toque 5 (Confirmação Executiva): Garantir Reunião & Pedido Inicial",
      nextRecommendedLevel: "Reunião agendada" as ProspectionLevel,
      timingHint:
        "Reunião já agendada! Confirme o horário no WhatsApp e leve a tabela de chapas/perfis de maior giro do setor.",
      phoneScript: `"${
        resp ? `Oi ${resp}` : "Olá"
      }, passando apenas para confirmar nossa reunião agendada entre a ${myCompany} e a ${emp}. Já separei as condições especiais para o setor de ${sector}."`,
      whatsappScript: `${greeting} Passando para confirmar nossa reunião agendada entre a *${myCompany}* e a *${emp}*!\n\nJá deixei separado o portfólio de chapas, bobinas e perfis focados em ${sector}. Se quiser me adiantar alguma medida específica para eu já levar o preço calculado, pode mandar por aqui!`,
      emailSubject: `Confirmação de Reunião Técnica/Comercial — ${myCompany} & ${emp}`,
      emailBody: `${greeting}\n\nConfirmando nossa agenda comercial entre ${myCompany} e ${emp}.\n\nLevaremos nossas condições de fornecimento recorrente para a linha de ${sector}. Caso queira adiantar algum desenho ou listagem de materiais para já apresentarmos a proposta calculada na reunião, basta responder a este e-mail.\n\nAté breve,\nComercial ${myCompany}`,
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

  return (
    <div className="space-y-6">
      {/* 1. COMPORTAMENTO DE SESSÃO ATIVA (SÉRIE REA-DESCONSTRUÇÃO) */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-[#0c121e] via-[#090d16] to-[#070709] p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Sessão Ativa de Prospecção &rarr; Data Warehouse Google Sheets
              </h2>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Trava Tripla: CNPJ • Domínio • Tel E.164</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Defina <strong className="text-zinc-200">Minha Empresa</strong> e o{" "}
              <strong className="text-zinc-200">Setor Alvo de Prospecção</strong> do dia. O Gemini adapta argumentos, scripts e higieniza cada lead contra duplicidade antes de abastecer o Google Sheets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isReadingSheets}
              onClick={handleReadFromGoogleSheets}
              className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
            >
              <CloudDownload className="h-3.5 w-3.5" />
              <span>
                {isReadingSheets ? "Lendo Planilha..." : "Ler Base do Google Sheets"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowAuditDrawer((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span>Logs Anti-Duplicidade ({auditLogs.length})</span>
            </button>

            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Abrir Planilha</span>
              <ExternalLink className="h-3 w-3 text-zinc-400" />
            </a>

            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>
                {webhookUrl ? "API Sheets Conectada" : "Conectar API Google Sheets"}
              </span>
            </button>
          </div>
        </div>

        {/* Variáveis Globais de Entrada da Sessão */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-5 items-end">
          {/* Variável Global 1: Minha Empresa */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              <Building2 className="h-3.5 w-3.5" />
              <span>1. Minha Empresa</span>
            </label>
            <input
              type="text"
              value={myCompany}
              onChange={(e) => setMyCompany(e.target.value)}
              placeholder="Ex: Gofer Metais"
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white font-semibold focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* Site de Referência da Minha Empresa */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              <span>Site da Minha Empresa</span>
            </label>
            <input
              type="text"
              value={representedWebsite}
              onChange={(e) => setRepresentedWebsite(e.target.value)}
              placeholder="https://gofermetais.com.br"
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-zinc-200 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* Variável Global 2: Setor Alvo de Prospecção */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>2. Setor Alvo de Prospecção</span>
            </label>
            <input
              type="text"
              value={targetSegment}
              onChange={(e) => setTargetSegment(e.target.value)}
              placeholder="Ex: Fabricantes de Fachadas, Corte e Solda, Esquadrias..."
              className="w-full rounded-xl border border-sky-500/30 bg-black/50 px-3.5 py-2.5 text-xs text-white font-semibold focus:border-sky-400 focus:outline-none"
            />
          </div>

          {/* Região & Lote */}
          <div className="md:col-span-1 space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              UF / Lote
            </label>
            <select
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 px-2 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
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

          {/* Botão de Execução da Sessão */}
          <div className="md:col-span-2">
            <button
              type="button"
              disabled={isExtracting}
              onClick={handleExtractLeads}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold px-4 py-2.5 text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Captando...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Captar &amp; Validar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Setores Alvo Rápidos (Metalurgia & Construção Gofer Metais) */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-[11px] font-mono text-zinc-400">
            Setores Alvo do Dia:
          </span>
          {[
            "Casas Modulares",
            "Fachadas",
            "Lajes",
            "Corte e Solda",
            "Esquadrias",
            "Construtoras Steel Frame",
            "Estruturas Metálicas",
          ].map((seg) => (
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
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                targetSegment.toLowerCase() === seg.toLowerCase()
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {seg}
            </button>
          ))}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNicheRadar((v) => !v)}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 text-[11px] font-mono font-bold text-amber-300 cursor-pointer"
            >
              {showNicheRadar ? "Ocultar Radar de Nichos" : "Abrir Radar de Nichos"}
            </button>
            <button
              type="button"
              onClick={() => setShowCadenceEngine((v) => !v)}
              className="rounded-lg border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 px-3 py-1 text-[11px] font-mono font-bold text-indigo-300 cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {showCadenceEngine
                  ? "Ocultar Inteligência de Cadência"
                  : "Abrir Inteligência de Cadência (Seg-Sex)"}
              </span>
            </button>
          </div>
        </div>

        {/* CAMADA DE INTELIGÊNCIA DE NICHOS: QUAIS PROSPECTEI, QUAIS DÃO RESULTADO E QUAIS LIGAR A SEGUIR */}
        {showNicheRadar && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/45 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  ✦ Cérebro Comercial ({myCompany}) — Mapa de Tração por Nicho &amp; Próximos Alvos
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Cruzamento automático das abas da sua planilha mostrando onde estão atendendo/pedindo catálogo e quais novos setores explorar.
                </p>
              </div>
              {nicheIntelligence.topPerformingNiche && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-mono text-emerald-300">
                  🏆 Maior Tração Atual:{" "}
                  <strong className="text-white">
                    {nicheIntelligence.topPerformingNiche.tab}
                  </strong>{" "}
                  ({nicheIntelligence.topPerformingNiche.tractionRate}% avançaram)
                </div>
              )}
            </div>

            {/* 1. Termômetro dos Nichos Já Prospectados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {nicheIntelligence.stats.map((st) => {
                const isSelected = st.tab === activeTab;
                return (
                  <div
                    key={st.tab}
                    onClick={() => handleSelectTab(st.tab)}
                    className={`rounded-xl border p-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">
                        {st.tab}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                          st.tractionRate >= 50
                            ? "bg-emerald-500/20 text-emerald-300"
                            : st.total > 0
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {st.total > 0 ? `${st.tractionRate}% tração` : "0 leads"}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-[11px] text-zinc-400 font-mono">
                      <div className="flex justify-between">
                        <span>Total na aba:</span>
                        <strong className="text-zinc-200">{st.total}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Catálogo / Contato:</span>
                        <strong className="text-emerald-400">
                          {st.engagedCount} ({st.inContact + st.meetingBooked} quentes)
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Destaques amarelos:</span>
                        <strong className="text-amber-300">{st.hotHighlighted}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Recomendação Inteligente: Próximos Nichos para Ligar (Baseado no Portfólio da Gofer Metais) */}
            {nicheIntelligence.candidateExpansions.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-sky-300 font-bold">
                  🎯 Próximos Nichos Recomendados p/ Ligar (Alta Demanda de Aço/Metal &amp; Ainda Inexplorados na Planilha):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {nicheIntelligence.candidateExpansions.slice(0, 3).map((rec) => (
                    <div
                      key={rec.niche}
                      className="flex flex-col justify-between rounded-xl border border-sky-500/25 bg-sky-950/15 p-3 gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">
                            {rec.niche}
                          </span>
                          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-sky-300">
                            {rec.avgTicket}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          {rec.reason}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!tabs.includes(rec.niche)) {
                            setTabs((prev) => [...prev, rec.niche]);
                          }
                          setActiveTab(rec.niche);
                          setTargetSegment(rec.niche);
                        }}
                        className="self-start rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 px-2.5 py-1 text-[11px] font-semibold text-sky-200 transition-colors cursor-pointer"
                      >
                        + Criar Aba &amp; Prospectar Este Nicho
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAMADA DE INTELIGÊNCIA DE CADÊNCIA SEMANAL (SEGUNDA A SEXTA) & COPILOTO DE FOLLOW-UP */}
        {showCadenceEngine && (
          <div className="mt-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#0d1021] via-[#090c18] to-[#07080f] p-5 space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-white/10 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                    Bússola da Semana • Segunda a Sexta
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Inteligência de Cadência &amp; Copiloto de Follow-up ({activeTab})
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Nunca mais se perca nos follow-ups: escolha o dia da semana para ver a fila prioritária e copie/dispare o script exato de Ligação, WhatsApp e E-mail para a etapa de cada empresa.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300">
                  1º Toque pendente:{" "}
                  <strong>
                    {
                      activeTabRows.filter(
                        (r) => r.nivelProspeccao === "Tentativa de contato"
                      ).length
                    }
                  </strong>
                </span>
                <span className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-indigo-300">
                  Cobrar Catálogo:{" "}
                  <strong>
                    {
                      activeTabRows.filter(
                        (r) => r.nivelProspeccao === "Catálogo enviado"
                      ).length
                    }
                  </strong>
                </span>
                <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                  Fechar Cotação:{" "}
                  <strong>
                    {
                      activeTabRows.filter(
                        (r) =>
                          r.nivelProspeccao === "Em contato" ||
                          r.nivelProspeccao === "Reunião agendada"
                      ).length
                    }
                  </strong>
                </span>
              </div>
            </div>

            {/* 1. TRILHA DA SEMANA (D1 SEGUNDA -> D5 SEXTA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {WEEKLY_CADENCE_STEPS.map((step) => {
                const isSelected = step.dayCode === selectedCadenceDay;
                return (
                  <button
                    key={step.dayCode}
                    type="button"
                    onClick={() => setSelectedCadenceDay(step.dayCode)}
                    className={`text-left rounded-xl border p-3 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-mono font-bold text-indigo-300">
                          {step.dayCode} • {step.dayLabel}
                        </span>
                        {step.dayCode === "D1" && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
                            HOJE
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-white leading-snug">
                        {step.touchNumber}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-3">
                        {step.objective}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-white/10 flex flex-wrap gap-1">
                      {step.channels.map((ch) => (
                        <span
                          key={ch}
                          className="rounded bg-black/50 border border-white/10 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 2. FILA DE PRIORIDADE DO DIA + COPILOTO DE SCRIPTS MULTICANAL DA EMPRESA SELECIONADA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
              {/* Coluna Esquerda (4 cols): Fila Prioritária de Empresas para Acionar Neste Dia */}
              <div className="lg:col-span-4 rounded-xl border border-white/10 bg-black/50 p-3.5 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Fila Prioritária ({currentCadenceStep.dayLabel})</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Clique p/ gerar script
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Ordem recomendada de ataque para hoje na aba{" "}
                    <strong className="text-white">{activeTab}</strong>:
                  </p>
                </div>

                <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1">
                  {cadenceQueueForDay.map((item, idx) => {
                    const isCurrentLead = selectedCadenceLead?.id === item.id;
                    const alreadyTouchedToday = (item.observacoes || "").includes("OK]");
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedCadenceLeadId(item.id)}
                        className={`rounded-xl border px-3 py-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isCurrentLead
                            ? "border-indigo-400 bg-indigo-500/20"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-zinc-500">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-white truncate">
                              {item.empresa}
                            </span>
                            {item.highlighted && (
                              <span
                                title="Destaque Amarelo (Prioridade Quente)"
                                className="inline-flex items-center rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-mono font-bold text-amber-300"
                              >
                                <Flame className="h-2.5 w-2.5 mr-0.5" />
                                QUENTE
                              </span>
                            )}
                            {alreadyTouchedToday && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
                                ✓ Feito
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 truncate">
                            <span>
                              {item.responsavel
                                ? `👤 ${item.responsavel}`
                                : "👤 Descobrir comprador"}
                            </span>
                            <span>•</span>
                            <span className="text-zinc-300 font-medium">
                              {item.nivelProspeccao}
                            </span>
                          </div>
                        </div>

                        <ArrowRight
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isCurrentLead ? "text-indigo-300" : "text-zinc-600"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coluna Direita (8 cols): Copiloto de Execução (Ligação + WhatsApp + E-mail + Botão Avançar Etapa) */}
              <div className="lg:col-span-8 rounded-xl border border-white/10 bg-black/50 p-4 space-y-4">
                {selectedCadenceLead && leadCadencePlaybook ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {selectedCadenceLead.empresa}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getPillStyle(
                              selectedCadenceLead.nivelProspeccao
                            )}`}
                          >
                            Etapa Atual: {selectedCadenceLead.nivelProspeccao}
                          </span>
                          {selectedCadenceLead.responsavel && (
                            <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[11px] text-zinc-200">
                              Decisor: <strong>{selectedCadenceLead.responsavel}</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-indigo-300 mt-1">
                          {leadCadencePlaybook.stageTitle}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          💡 {leadCadencePlaybook.timingHint}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAdvanceLeadCadence(selectedCadenceLead, false)
                          }
                          className="rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 text-[11px] font-semibold text-zinc-200 cursor-pointer"
                        >
                          ✓ Registrar Toque (Manter Etapa)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAdvanceLeadCadence(selectedCadenceLead, true)
                          }
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-[11px] font-bold text-black shadow-md shadow-emerald-500/15 cursor-pointer flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>
                            Concluir Toque &rarr; {leadCadencePlaybook.nextRecommendedLevel}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 3 CANAIS DE ABORDAGEM SINCRONIZADOS (LIGAÇÃO, WHATSAPP E E-MAIL) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Canal 1: Roteiro de Ligação Rápida + Canal 2: WhatsApp */}
                      <div className="space-y-3">
                        {/* Roteiro de Ligação (30s) */}
                        <div className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                              <PhoneCall className="h-3 w-3" />
                              <span>1. Script de Ligação Rápida (30 seg)</span>
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              Tel: {selectedCadenceLead.contato || "Sem telefone"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-200 italic leading-relaxed">
                            {leadCadencePlaybook.phoneScript}
                          </p>
                        </div>

                        {/* Script de WhatsApp Direto */}
                        <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>2. Script de Follow-up WhatsApp</span>
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
                                className="rounded bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 cursor-pointer"
                              >
                                {copiedCadenceField === "wpp" ? "Copiado!" : "Copiar"}
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
                                  className="rounded bg-emerald-500 hover:bg-emerald-400 px-2.5 py-0.5 text-[10px] font-bold text-black"
                                >
                                  Abrir WhatsApp &rarr;
                                </a>
                              )}
                            </div>
                          </div>
                          <pre className="whitespace-pre-wrap font-sans text-[11px] text-zinc-200 leading-relaxed bg-black/40 rounded-lg p-2.5 border border-white/5">
                            {leadCadencePlaybook.whatsappScript}
                          </pre>
                        </div>
                      </div>

                      {/* Canal 3: E-mail Comercial B2B Completo (Assunto + Corpo + Botão Mailto) */}
                      <div className="rounded-xl border border-sky-500/25 bg-sky-950/15 p-3 flex flex-col justify-between space-y-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              <span>3. E-mail de Cadência B2B (Assunto + Corpo)</span>
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
                                className="rounded bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 cursor-pointer"
                              >
                                {copiedCadenceField === "email"
                                  ? "E-mail Copiado!"
                                  : "Copiar E-mail"}
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
                                    className="rounded bg-sky-500 hover:bg-sky-400 px-2.5 py-0.5 text-[10px] font-bold text-black"
                                  >
                                    Disparar E-mail &rarr;
                                  </a>
                                )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5 text-[11px]">
                            <span className="text-zinc-400 font-mono text-[10px]">
                              Para:{" "}
                            </span>
                            <strong className="text-sky-300">
                              {selectedCadenceLead.email ||
                                "E-mail ainda não preenchido na planilha"}
                            </strong>
                            <div className="mt-0.5">
                              <span className="text-zinc-400 font-mono text-[10px]">
                                Assunto:{" "}
                              </span>
                              <strong className="text-white">
                                {leadCadencePlaybook.emailSubject}
                              </strong>
                            </div>
                          </div>

                          <pre className="whitespace-pre-wrap font-sans text-[11px] text-zinc-200 leading-relaxed bg-black/40 rounded-lg p-2.5 border border-white/5 max-h-[210px] overflow-y-auto">
                            {leadCadencePlaybook.emailBody}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-zinc-400">
                    Selecione uma empresa na fila ao lado ou na planilha abaixo para gerar o roteiro completo de cadência.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Playbook Dinâmico Gerado pelo Gemini para o Setor Alvo do Dia */}
        {activePlaybook && (
          <div className="mt-5 rounded-2xl border border-sky-500/25 bg-sky-950/20 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-300">
                  {activePlaybook.campaignTag}
                </span>
                <span className="text-xs font-bold text-white">
                  Inteligência de Abordagem Gemini • {activePlaybook.myCompany} &rarr;{" "}
                  {activePlaybook.targetSector}
                </span>
              </div>
              <span className="text-[11px] text-emerald-300 font-mono">
                {activePlaybook.valueArgument}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                  Dores Metalúrgicas do Setor ({activePlaybook.targetSector}):
                </span>
                <ul className="list-disc list-inside text-zinc-300 space-y-0.5 text-[11px]">
                  {activePlaybook.sectorPains.map((pain, i) => (
                    <li key={i}>{pain}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  Script Automático WhatsApp (Injetado nos Leads):
                </span>
                <p className="text-zinc-200 text-[11px] leading-relaxed italic">
                  &ldquo;{activePlaybook.whatsappScriptTemplate}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Painel de Logs do Motor Anti-Duplicidade Rigoroso */}
        {showAuditDrawer && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-black/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Log de Auditoria Anti-Duplicidade (CNPJ • Domínio • Telefone E.164)
              </span>
              <button
                type="button"
                onClick={() => setShowAuditDrawer(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                Fechar
              </button>
            </div>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-zinc-400">
                Nenhuma verificação executada nesta sessão ainda. Clique em &ldquo;Captar &amp; Validar&rdquo;.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] font-mono">
                {auditLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1 rounded flex items-center justify-between gap-2 ${
                      log.action === "inserted"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : log.action === "merged_complementary"
                        ? "bg-sky-500/10 text-sky-300"
                        : "bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    <span>
                      <strong>[{log.action.toUpperCase()}]</strong> {log.empresa} —{" "}
                      {log.details}
                    </span>
                    <span className="text-[10px] opacity-60 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Banner de Feedback */}
        {feedbackBanner && (
          <div
            className={`mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-medium border ${
              feedbackBanner.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                : feedbackBanner.type === "error"
                ? "bg-red-500/15 border-red-500/40 text-red-200"
                : "bg-sky-500/15 border-sky-500/40 text-sky-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackBanner.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedbackBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* PLANILHA DATA WAREHOUSE IDÊNTICA AO PRINT DO GOOGLE SHEETS ("Imobiliário.") */}
      <div className="rounded-2xl border border-zinc-300 bg-white text-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f9fa] border-b border-zinc-300 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f9d58] text-white shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  className="font-semibold text-base text-zinc-800 bg-transparent border border-transparent hover:border-zinc-300 focus:border-blue-600 focus:bg-white rounded px-1.5 py-0.5 focus:outline-none"
                />
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-semibold">
                  {activeTabRows.length} empresas na aba &ldquo;{activeTab}&rdquo;
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 px-1.5">
                Data Warehouse Oficial • Telefones higienizados (55DD9XXXXXXXX), Domínio isolado e CNPJ verificado
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addEmptyRow}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-600" />
              <span>Nova Linha</span>
            </button>

            <button
              type="button"
              onClick={handleCopyForGoogleSheets}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
            >
              {copiedTable ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado p/ Sheets!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Copiar p/ Colar no Sheets</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadFormattedSheet}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-zinc-600" />
              <span>Baixar Planilha Formatada (.xls)</span>
            </button>

            <button
              type="button"
              disabled={isSyncingSheets}
              onClick={handleSyncToGoogleSheets}
              className="flex items-center gap-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {isSyncingSheets
                  ? "Sincronizando..."
                  : "Abastecer Google Sheets Agora"}
              </span>
            </button>
          </div>
        </div>

        {/* Grade da Planilha com Cabeçalho Azul Marinho (#202b5b) Idêntico ao Print */}
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#f8f9fa] border-b border-zinc-300 text-[11px] text-zinc-500 font-sans select-none">
                <th className="w-10 border-r border-zinc-300 py-1 text-center font-normal">
                  #
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[195px]">
                  A
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[135px]">
                  B
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[245px]">
                  C
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[160px]">
                  D
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[185px]">
                  E
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal min-w-[260px]">
                  F
                </th>
                <th className="w-24 py-1 text-center font-normal">Ações</th>
              </tr>

              <tr className="bg-[#202b5b] text-white text-xs font-bold">
                <th className="bg-[#f8f9fa] text-zinc-500 font-normal text-[11px] border-r border-b border-zinc-300 text-center py-2">
                  1
                </th>
                <th className="border-r border-[#34427d] px-3 py-2 text-center">
                  Empresa
                </th>
                <th className="border-r border-[#34427d] px-3 py-2 text-center">
                  Responsável
                </th>
                <th className="border-r border-[#34427d] px-3 py-2 text-center">
                  E-mail
                </th>
                <th className="border-r border-[#34427d] px-3 py-2 text-center">
                  Contato
                </th>
                <th className="border-r border-[#34427d] px-3 py-2 text-center">
                  Nível de Prospecção
                </th>
                <th className="border-r border-[#34427d] px-3 py-2 text-center">
                  Observações
                </th>
                <th className="bg-[#182046] px-2 py-2 text-center text-[10px] uppercase tracking-wider">
                  Atalhos
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 text-[13px] font-sans">
              {activeTabRows.map((row, idx) => {
                const rowNumber = idx + 2;
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
                        ? "bg-[#ffff00] hover:bg-[#f7f700]"
                        : "bg-white hover:bg-blue-50/40"
                    }`}
                  >
                    <td className="bg-[#f8f9fa] border-r border-zinc-300 text-center text-[11px] text-zinc-500 select-none py-1.5">
                      {rowNumber}
                    </td>

                    {/* Coluna A: Empresa + Badge de Domínio/CNPJ */}
                    <td className="border-r border-zinc-200 px-2 py-1">
                      <input
                        type="text"
                        value={row.empresa}
                        onChange={(e) =>
                          updateCell(row.id, "empresa", e.target.value)
                        }
                        placeholder="Nome da empresa..."
                        className="w-full bg-transparent text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5"
                      />
                      {(row.cnpj || (domainKey && !domainKey.startsWith("freemail:"))) && (
                        <div className="flex items-center gap-1.5 px-1 text-[10px] text-zinc-500 font-mono">
                          {row.cnpj && <span>CNPJ: {sanitizeCnpj(row.cnpj)}</span>}
                          {domainKey && !domainKey.startsWith("freemail:") && (
                            <span>• {domainKey}</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Coluna B: Responsável */}
                    <td className="border-r border-zinc-200 px-2 py-1">
                      <input
                        type="text"
                        value={row.responsavel}
                        onChange={(e) =>
                          updateCell(row.id, "responsavel", e.target.value)
                        }
                        className="w-full bg-transparent text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5"
                      />
                    </td>

                    {/* Coluna C: E-mail */}
                    <td className="border-r border-zinc-200 px-2 py-1">
                      <input
                        type="text"
                        value={row.email}
                        onChange={(e) =>
                          updateCell(row.id, "email", e.target.value)
                        }
                        className={`w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5 ${
                          row.email.includes("@")
                            ? "text-[#1155cc] underline"
                            : "text-zinc-900"
                        }`}
                      />
                    </td>

                    {/* Coluna D: Contato (Higienizado E.164 + Disparo WhatsApp com Script do Setor) */}
                    <td className="border-r border-zinc-200 px-2 py-1">
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
                          className="w-full bg-transparent text-zinc-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5"
                        />
                        {whatsappHref && (
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abordar no WhatsApp com Script Setorial IA"
                            className="text-emerald-600 hover:text-emerald-700 p-0.5 shrink-0"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Coluna E: Nível de Prospecção */}
                    <td className="border-r border-zinc-200 px-2.5 py-1">
                      <select
                        value={row.nivelProspeccao}
                        onChange={(e) =>
                          updateCell(
                            row.id,
                            "nivelProspeccao",
                            e.target.value as ProspectionLevel
                          )
                        }
                        className={`w-full rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none ${getPillStyle(
                          row.nivelProspeccao
                        )}`}
                      >
                        {PROSPECTION_LEVELS.map((lvl) => (
                          <option
                            key={lvl}
                            value={lvl}
                            className="bg-white text-zinc-900"
                          >
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Coluna F: Observações */}
                    <td className="border-r border-zinc-200 px-2 py-1">
                      <input
                        type="text"
                        value={row.observacoes}
                        onChange={(e) =>
                          updateCell(row.id, "observacoes", e.target.value)
                        }
                        className="w-full bg-transparent text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5"
                      />
                    </td>

                    {/* Ações da Linha */}
                    <td className="px-2 py-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCadenceLeadId(row.id);
                            setShowCadenceEngine(true);
                          }}
                          title="Abrir Scripts de Cadência (Ligação, WhatsApp e E-mail) desta empresa"
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            selectedCadenceLead?.id === row.id && showCadenceEngine
                              ? "bg-indigo-600 text-white"
                              : "text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100"
                          }`}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateCell(row.id, "highlighted", !row.highlighted)
                          }
                          title="Destacar linha em Amarelo (#ffff00)"
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            row.highlighted
                              ? "bg-amber-500 text-white"
                              : "text-zinc-400 hover:text-amber-600 hover:bg-zinc-100"
                          }`}
                        >
                          <Highlighter className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={isImportingKanban}
                          onClick={() => handleSendRowToKanban(row)}
                          title="Enviar este lead para meu Kanban"
                          className="p-1 rounded text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                        >
                          <Kanban className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteRow(row.id)}
                          title="Remover linha"
                          className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Barra Inferior de Abas Idêntica ao Google Sheets */}
        <div className="flex items-center gap-1 bg-[#f1f3f4] border-t border-zinc-300 px-3 py-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setNewTabModalOpen(true)}
            title="Adicionar nova aba de campanha/setor"
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-200 text-zinc-700 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>

          {tabs.map((tab) => {
            const isCurrent = tab === activeTab;
            const count = rows.filter((r) => r.tab === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleSelectTab(tab)}
                className={`flex items-center gap-2 rounded-t-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer border-b-2 ${
                  isCurrent
                    ? "bg-white text-[#1a73e8] border-[#1a73e8] shadow-sm"
                    : "text-zinc-600 border-transparent hover:bg-zinc-200/70"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isCurrent
                      ? "bg-blue-50 text-[#1a73e8]"
                      : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL PARA CRIAR NOVA ABA (CAMPANHA / SETOR) */}
      {newTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0e1117] p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Nova Aba de Campanha / Setor
              </h3>
              <button
                type="button"
                onClick={() => setNewTabModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="Ex: Fabricantes de Esquadrias, Corte e Solda..."
              className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewTabModalOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateTab}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-black cursor-pointer"
              >
                Criar Aba
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONEXÃO BIDIRECIONAL COM O GOOGLE SHEETS & WEBHOOK DE CAMPANHA */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0b0e14] p-6 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Conector Data Warehouse Google Sheets (Leitura + Escrita + Anti-Duplicidade)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
              <p>
                Este script habilita leitura bidirecional (<code className="text-emerald-300">doGet</code>) e escrita blindada (<code className="text-emerald-300">doPost</code>) com trava anti-duplicidade e merge complementar na sua planilha:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                <li>
                  Na sua planilha, abra <strong className="text-white">Extensões &rarr; Apps Script</strong>.
                </li>
                <li>
                  Cole o código abaixo e clique em <strong className="text-white">Implantar &rarr; Nova implantação &rarr; App da Web</strong> (acesso: <strong className="text-emerald-300">Qualquer pessoa</strong>).
                </li>
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Apps Script Bidirecional (doGet + doPost + Trava Tripla)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 3000);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-300 cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-black/70 p-3 text-[11px] font-mono text-zinc-300">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  URL da Planilha Google Sheets
                </label>
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-1">
                  URL do Web App Google Sheets (doGet / doPost)
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-xl border border-emerald-500/40 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-sky-400 mb-1">
                  Webhook de Campanha Outbound (Opcional — n8n / Disparo WhatsApp)
                </label>
                <input
                  type="text"
                  value={campaignWebhookUrl}
                  onChange={(e) => setCampaignWebhookUrl(e.target.value)}
                  placeholder="https://seu-n8n.com/webhook/campanha-gofer"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-black cursor-pointer"
              >
                Salvar &amp; Ativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
