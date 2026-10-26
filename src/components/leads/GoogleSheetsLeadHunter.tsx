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

const PLACEHOLDER_SHEET_ID = "PLACEHOLDER_NONE";
const DEFAULT_USER_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1m9Gjeb9UxLJ1aDgPOWOLmKzCqRf7CPkFFyXSGDJpUXA/edit?usp=sharing";

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
    sheetUrl: DEFAULT_USER_SHEET_URL,
    tabs: ["Casas Modulares", "Fachadas", "Lajes"],
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
  "Atendeu",
  "Em contato",
  "Reunião agendada",
];

// Os 49 leads reais das 3 abas ("Casas Modulares", "Fachadas" e "Lajes") da planilha do Google Sheets
const INITIAL_PRINT_LEADS: ExtractedSheetLead[] = [
  // === ABA 1: CASAS MODULARES (19 leads) ===
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
    nivelProspeccao: "Catálogo enviado",
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

  // === ABA 2: FACHADAS (23 leads reais da planilha) ===
  {
    id: "fach-1",
    empresa: "Pissk",
    cnpj: "",
    responsavel: "Cassia",
    email: "compras@pissk.com.br",
    contato: "5511991351028",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "pissk.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-2",
    empresa: "Grupo Mais",
    cnpj: "",
    responsavel: "",
    email: "vendas@grupomaissp.com.br",
    contato: "5511932912005",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "grupomaissp.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-3",
    empresa: "kortinox",
    cnpj: "",
    responsavel: "Joice",
    email: "financeiro@kortinox.com.br",
    contato: "551127695917",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "kortinox.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-4",
    empresa: "Alfatech",
    cnpj: "",
    responsavel: "",
    email: "orcamento@alfatechbr.com.br",
    contato: "551149023918",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "alfatechbr.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-5",
    empresa: "Wall Design",
    cnpj: "",
    responsavel: "",
    email: "sac@walldesign.com.br",
    contato: "5511992443939",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "walldesign.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-6",
    empresa: "Alu Composto",
    cnpj: "",
    responsavel: "",
    email: "projeto@alucomposto.com.br",
    contato: "5515991980115",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "alucomposto.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-7",
    empresa: "Milenio Fachadas",
    cnpj: "",
    responsavel: "juliana",
    email: "juliana@mileniofachadas.com.br",
    contato: "5511973855751",
    nivelProspeccao: "Atendeu",
    observacoes: "Retornar via wpp/email.",
    website: "mileniofachadas.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: true,
    tab: "Fachadas",
  },
  {
    id: "fach-8",
    empresa: "Sto Brasil",
    cnpj: "",
    responsavel: "durvan",
    email: "dgomes@stobrasil.com.br",
    contato: "551121450011",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "apenas via email",
    website: "stobrasil.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-9",
    empresa: "JRM",
    cnpj: "",
    responsavel: "",
    email: "contato@jrmsolucoes.com.br",
    contato: "5511978534700",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "jrmsolucoes.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-10",
    empresa: "itefal",
    cnpj: "",
    responsavel: "Thais ou Amanda",
    email: "compras1@itefal.com.br",
    contato: "551133822500",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "apenas via email",
    website: "itefal.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-11",
    empresa: "Alubond",
    cnpj: "",
    responsavel: "Brenda ou Pedro",
    email: "compras@alubond.com.br",
    contato: "551133924466",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "Enviar proposta via email.",
    website: "alubond.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-12",
    empresa: "Fachada Premium",
    cnpj: "",
    responsavel: "",
    email: "contato@fachadapremium.com.br",
    contato: "5511940876688",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "fachadapremium.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-13",
    empresa: "rb revestimentos",
    cnpj: "",
    responsavel: "",
    email: "contato@rbrevestimentos.com.br",
    contato: "551128974635",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "rbrevestimentos.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-14",
    empresa: "guarusign",
    cnpj: "",
    responsavel: "elcio",
    email: "elcioadesivos@gmail.com",
    contato: "551149696006",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "apenas via email",
    website: "freemail:elcioadesivos@gmail.com",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-15",
    empresa: "novacm revestimentos",
    cnpj: "",
    responsavel: "",
    email: "douglas@novacmrevestimentos.com.br",
    contato: "5511976898772",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "essse é o nmr dele!!!",
    website: "novacmrevestimentos.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: true,
    tab: "Fachadas",
  },
  {
    id: "fach-16",
    empresa: "bepex",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "551130424225",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-17",
    empresa: "aludim",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "554836264900",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-18",
    empresa: "acrinel",
    cnpj: "",
    responsavel: "valeria",
    email: "valeria@acrinel.com.br",
    contato: "551126519230",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "apenas via email",
    website: "acrinel.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-19",
    empresa: "pizzinatto",
    cnpj: "",
    responsavel: "",
    email: "contato@grupopizzinatto.com.br",
    contato: "551934378300",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "grupopizzinatto.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-20",
    empresa: "gfmvisual",
    cnpj: "",
    responsavel: "",
    email: "contato@gfmvisual.com.br",
    contato: "5511914848152",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "gfmvisual.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-21",
    empresa: "evolve",
    cnpj: "",
    responsavel: "",
    email: "comercial@evolvecomunicacao.com.br",
    contato: "551125266550",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "chamar no wpp",
    website: "evolvecomunicacao.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-22",
    empresa: "nomen",
    cnpj: "",
    responsavel: "",
    email: "vendas@nomen.com.br",
    contato: "551936241413",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "Tel alternativo: 11 97140-8101",
    website: "nomen.com.br",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },
  {
    id: "fach-23",
    empresa: "hunterdouglas",
    cnpj: "",
    responsavel: "",
    email: "",
    contato: "551937084000",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "",
    campanha: "CAMP-FACHADAS",
    highlighted: false,
    tab: "Fachadas",
  },

  // === ABA 3: LAJES (7 leads reais da planilha) ===
  {
    id: "laj-1",
    empresa: "Fortec Lajes",
    cnpj: "",
    responsavel: "Mikael",
    email: "",
    contato: "5511940290662",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "contato via wpp — (11) 3988-5012 / (11) 94029-0662",
    website: "",
    campanha: "CAMP-LAJES",
    highlighted: false,
    tab: "Lajes",
  },
  {
    id: "laj-2",
    empresa: "Cassol",
    cnpj: "",
    responsavel: "",
    email: "contato@cassol.ind.br",
    contato: "554136415900",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "cassol.ind.br",
    campanha: "CAMP-LAJES",
    highlighted: false,
    tab: "Lajes",
  },
  {
    id: "laj-3",
    empresa: "Tijolage",
    cnpj: "",
    responsavel: "Samara",
    email: "falecom@tijolaje.com.br",
    contato: "551144792424",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "tijolaje.com.br",
    campanha: "CAMP-LAJES",
    highlighted: false,
    tab: "Lajes",
  },
  {
    id: "laj-4",
    empresa: "Isobloco",
    cnpj: "",
    responsavel: "",
    email: "tecnico@isobloco.com.br",
    contato: "5582981799779",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    website: "isobloco.com.br",
    campanha: "CAMP-LAJES",
    highlighted: false,
    tab: "Lajes",
  },
  {
    id: "laj-5",
    empresa: "Mta Engenharia",
    cnpj: "",
    responsavel: "",
    email: "eng.bruno@mtagrupo.com.br",
    contato: "551120127001",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "mtagrupo.com.br",
    campanha: "CAMP-LAJES",
    highlighted: false,
    tab: "Lajes",
  },
  {
    id: "laj-6",
    empresa: "Amplo Ferros",
    cnpj: "",
    responsavel: "",
    email: "gustavo@mtagrupo.com.br",
    contato: "551120129620",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "",
    campanha: "CAMP-LAJES",
    highlighted: false,
    tab: "Lajes",
  },
  {
    id: "laj-7",
    empresa: "Lajes Masteo | Lajes Tolstoi",
    cnpj: "",
    responsavel: "Angelo",
    email: "angelo@mtagrupo.com.br",
    contato: "551120127001",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    website: "",
    campanha: "CAMP-LAJES",
    highlighted: false,
    tab: "Lajes",
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

// 1. LEITURA EM TEMPO REAL DE TODAS AS ABAS E LINHAS DA PLANILHA
function doGet(e) {
  var tabName = (e && e.parameter && e.parameter.tabName) || "Casas Modulares";
  var readAllTabs = !e || !e.parameter || e.parameter.readAllTabs !== "false";
  var spreadsheetId = (e && e.parameter && e.parameter.spreadsheetId) || "";
  var ss = resolveSpreadsheet(spreadsheetId);
  var allSheets = ss.getSheets();
  var allTabNames = [];
  for (var s = 0; s < allSheets.length; s++) {
    allTabNames.push(allSheets[s].getName());
  }

  var targetSheets = readAllTabs
    ? allSheets
    : [ss.getSheetByName(tabName) || allSheets[0]];

  var headers = ["Empresa","Responsável","E-mail","Contato","Nível de Prospecção","Observações"];
  var rows = [];

  for (var t = 0; t < targetSheets.length; t++) {
    var sheet = targetSheets[t];
    if (!sheet) continue;
    var currentTabName = sheet.getName();
    var range = sheet.getDataRange();
    var data = range.getValues();
    var bgs = range.getBackgrounds();
    if (data.length > 0 && t === 0) headers = data[0];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0] || String(data[i][0]).toLowerCase() === "empresa") continue;
      var bg = (bgs[i] && bgs[i][0]) ? String(bgs[i][0]).toLowerCase() : "";
      rows.push({
        id: "sheet-" + currentTabName + "-" + i,
        empresa: String(data[i][0] || ""),
        responsavel: String(data[i][1] || ""),
        email: String(data[i][2] || ""),
        contato: cleanPhoneE164(data[i][3]) || String(data[i][3] || ""),
        nivelProspeccao: String(data[i][4] || "Tentativa de contato"),
        observacoes: String(data[i][5] || ""),
        cnpj: String(data[i][6] || ""),
        highlighted: bg === "#ffff00" || bg === "#fff2cc",
        tab: currentTabName
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    title: ss.getName(),
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    tabs: allTabNames,
    columns: headers,
    rows: rows
  })).setMimeType(ContentService.MimeType.JSON);
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
    case "Atendeu":
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

  const [sheetUrl, setSheetUrl] = useState(DEFAULT_USER_SHEET_URL);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [campaignWebhookUrl, setCampaignWebhookUrl] = useState("");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [newTabModalOpen, setNewTabModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState("");

  useEffect(() => {
    try {
      const savedRows = localStorage.getItem("gofer_sheets_leads_v3");
      const savedTabs = localStorage.getItem("gofer_sheets_tabs_v3");
      const savedSpreadsheets = localStorage.getItem("gofer_spreadsheets_v3");
      const savedActiveSheetId = localStorage.getItem("gofer_active_spreadsheet_id_v3");
      const savedWebhook = localStorage.getItem("gofer_sheets_webhook_v1");
      const savedCampWebhook = localStorage.getItem("gofer_campaign_webhook_v1");
      const savedSheetUrl = localStorage.getItem("gofer_sheets_url_v3");
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
      const cleanSavedUrl = isRealGoogleSheetUrl(savedSheetUrl)
        ? savedSheetUrl!
        : DEFAULT_USER_SHEET_URL;
      setSheetUrl(cleanSavedUrl);

      if (savedSpreadsheets) {
        const parsedSheets: ManagedSpreadsheet[] = JSON.parse(savedSpreadsheets);
        if (Array.isArray(parsedSheets) && parsedSheets.length > 0) {
          const sanitized = parsedSheets.map((s) => ({
            ...s,
            sheetUrl: isRealGoogleSheetUrl(s.sheetUrl)
              ? s.sheetUrl
              : DEFAULT_USER_SHEET_URL,
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
      localStorage.setItem("gofer_sheets_leads_v3", JSON.stringify(rows));
      localStorage.setItem("gofer_sheets_tabs_v3", JSON.stringify(tabs));
      localStorage.setItem("gofer_spreadsheets_v3", JSON.stringify(spreadsheets));
      localStorage.setItem("gofer_active_spreadsheet_id_v3", activeSpreadsheetId);
      localStorage.setItem("gofer_kanban_sent_rows_v1", JSON.stringify(kanbanSentRowIds));
      localStorage.setItem("gofer_my_company_v1", myCompany);
      localStorage.setItem("gofer_represented_site_v1", representedWebsite);
      if (webhookUrl) localStorage.setItem("gofer_sheets_webhook_v1", webhookUrl);
      if (campaignWebhookUrl)
        localStorage.setItem("gofer_campaign_webhook_v1", campaignWebhookUrl);
      localStorage.setItem(
        "gofer_sheets_url_v3",
        isRealGoogleSheetUrl(sheetUrl) ? sheetUrl : DEFAULT_USER_SHEET_URL
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
    const hasValidUrl = isRealGoogleSheetUrl(newSpreadsheetUrl);
    if (!cleanTitle && !hasValidUrl) return;

    const firstTab = newSpreadsheetFirstTab.trim() || "Geral";
    let finalSheetUrl = hasValidUrl ? newSpreadsheetUrl.trim() : "";
    let discoveredTitle = cleanTitle || "Planilha Conectada";
    let discoveredTabs: string[] = [firstTab];

    setIsCreatingRemoteSheet(true);
    try {
      // Caso 1: O usuário colou o link de uma planilha que JÁ EXISTE no Google Sheets -> descobre todas as abas e importa os leads!
      if (finalSheetUrl) {
        const params = new URLSearchParams({
          sheetUrl: finalSheetUrl,
          tabName: firstTab,
          readAllTabs: "true",
          knownTabs: firstTab,
          webhookUrl: webhookUrl.trim(),
          spreadsheetId: extractSheetIdFromUrl(finalSheetUrl) || "",
        });
        const res = await fetch(`/api/crm/sheets-sync?${params.toString()}`);
        const data = await res.json();
        if (res.ok && data.success) {
          if (!cleanTitle && typeof data.title === "string" && data.title.trim()) {
            discoveredTitle = data.title.trim();
          }
          if (Array.isArray(data.tabs) && data.tabs.length > 0) {
            discoveredTabs = Array.from(
              new Set(
                newSpreadsheetFirstTab.trim()
                  ? [...data.tabs, firstTab]
                  : data.tabs
              )
            );
          }
          const incomingFromSheet: ExtractedSheetLead[] = data.rows || [];
          if (incomingFromSheet.length > 0) {
            const touchedTabs = Array.from(
              new Set(incomingFromSheet.map((r) => r.tab || discoveredTabs[0]))
            );
            let updatedRows = [...rows];
            for (const tName of touchedTabs) {
              const incomingForTab = incomingFromSheet.filter(
                (r) => (r.tab || discoveredTabs[0]) === tName
              );
              const existingForTab = updatedRows.filter((r) => r.tab === tName);
              const otherTabsRows = updatedRows.filter((r) => r.tab !== tName);
              const dedup = deduplicateAndMergeLeads(existingForTab, incomingForTab);
              updatedRows = [...otherTabsRows, ...dedup.updatedExistingRows];
            }
            setRows(updatedRows);
          }
        }
      } else if (webhookUrl.trim()) {
        // Caso 2: Sem link manual, mas com Apps Script conectado -> cria planilha nova no Google Drive
        const res = await fetch("/api/crm/sheets-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_spreadsheet",
            webhookUrl: webhookUrl.trim(),
            spreadsheetTitle: discoveredTitle,
            initialTabs: [firstTab],
          }),
        });
        const data = await res.json();
        if (res.ok && data.spreadsheetUrl) {
          finalSheetUrl = data.spreadsheetUrl;
        }
      }
    } catch {
      // Segue com a vinculação local mesmo se a leitura remota exigir permissão de compartilhamento
    } finally {
      setIsCreatingRemoteSheet(false);
    }

    const primaryTab = discoveredTabs[0] || firstTab;
    const newSheet: ManagedSpreadsheet = {
      id: `sheet-${Date.now()}`,
      title: discoveredTitle,
      sheetUrl: finalSheetUrl,
      tabs: discoveredTabs,
    };

    setSpreadsheets((prev) => [...prev, newSheet]);
    setActiveSpreadsheetId(newSheet.id);
    setSheetTitle(newSheet.title);
    setTabs(newSheet.tabs);
    setActiveTab(primaryTab);
    setTargetSegment(primaryTab);
    setSheetUrl(finalSheetUrl);
    setSelectedRowIds([]);

    setNewSpreadsheetTitle("");
    setNewSpreadsheetFirstTab("");
    setNewSpreadsheetUrl("");
    setNewSpreadsheetModalOpen(false);

    setFeedbackBanner({
      type: "success",
      text: finalSheetUrl
        ? `✦ Planilha "${discoveredTitle}" conectada com ${discoveredTabs.length} aba(s) (${discoveredTabs.join(", ")})!`
        : `✦ Nova planilha "${discoveredTitle}" criada com a aba "${primaryTab}"! Cole o link do Google Sheets para sincronizar na nuvem.`,
    });
  };

  const activeTabRows = useMemo(
    () => rows.filter((r) => r.tab === activeTab),
    [rows, activeTab]
  );

  // Estado do Laboratório & Estudo de Setores para Atacar
  const [selectedMacroCategory, setSelectedMacroCategory] = useState<string>("all");
  const [selectedStudyNiche, setSelectedStudyNiche] = useState<string>(
    "Canteiros e Alojamentos Metálicos"
  );
  const [customSectorInput, setCustomSectorInput] = useState<string>("");
  const [customStudiedSectors, setCustomStudiedSectors] = useState<
    Array<{
      niche: string;
      macroCategory: string;
      recommendedSpreadsheet: string;
      fitScore: number;
      avgTicket: string;
      salesCycle: string;
      synergyWithExisting: string;
      reason: string;
      productsBought: string[];
      buyerPersona: string;
      mainPainPoint: string;
      openingHook: string;
      qualificationQuestion: string;
    }>
  >([]);

  // CAMADA DE INTELIGÊNCIA & ESTUDO PROFUNDO DE SETORES B2B
  const nicheIntelligence = useMemo(() => {
    const stats = tabs.map((tab) => {
      const tabLeads = rows.filter((r) => r.tab === tab && r.empresa.trim());
      const total = tabLeads.length;
      const waitingFirstTouch = tabLeads.filter(
        (r) => r.nivelProspeccao === "Tentativa de contato"
      ).length;
      const catalogSent = tabLeads.filter(
        (r) => r.nivelProspeccao === "Catálogo enviado"
      ).length;
      const answered = tabLeads.filter(
        (r) => r.nivelProspeccao === "Atendeu"
      ).length;
      const inContact = tabLeads.filter(
        (r) => r.nivelProspeccao === "Em contato"
      ).length;
      const meetingBooked = tabLeads.filter(
        (r) => r.nivelProspeccao === "Reunião agendada"
      ).length;
      const hotHighlighted = tabLeads.filter((r) => r.highlighted).length;
      const emailOnlyCount = tabLeads.filter((r) =>
        (r.observacoes || "").toLowerCase().includes("email")
      ).length;

      const engagedCount = catalogSent + answered + inContact + meetingBooked;
      const tractionRate = total > 0 ? Math.round((engagedCount / total) * 100) : 0;

      let diagnosticSummary = "";
      if (total === 0) {
        diagnosticSummary =
          "Aba criada sem leads ainda. Use 'Captar Leads' na Planilha para abastecer 15–20 empresas.";
      } else if (tractionRate >= 70) {
        diagnosticSummary = `Alta aderência (${tractionRate}% já pediram catálogo ou avançaram). Priorize cobrar cotação em cima do PDF enviado.`;
      } else if (waitingFirstTouch >= Math.ceil(total * 0.4)) {
        diagnosticSummary = `${waitingFirstTouch} de ${total} empresas ainda estão em 'Tentativa de contato'${
          emailOnlyCount > 0 ? ` (${emailOnlyCount} pedem envio por e-mail)` : ""
        }. Oportunidade imediata de disparo.`;
      } else {
        diagnosticSummary = `${engagedCount} empresas com catálogo/contato ativo. Foque nos destaques amarelos para puxar orçamento.`;
      }

      return {
        tab,
        total,
        waitingFirstTouch,
        catalogSent,
        answered,
        inContact,
        meetingBooked,
        hotHighlighted,
        emailOnlyCount,
        engagedCount,
        tractionRate,
        diagnosticSummary,
      };
    });

    const sortedByTraction = [...stats].sort(
      (a, b) => b.tractionRate - a.tractionRate || b.total - a.total
    );
    const topPerformingNiche = sortedByTraction[0];

    const builtInStudies = [
      {
        niche: "Canteiros e Alojamentos Metálicos",
        macroCategory: "Imobiliário & Construção Modular",
        recommendedSpreadsheet: "Imobiliário.",
        fitScore: 97,
        avgTicket: "Alto Recorrente",
        salesCycle: "12 a 25 dias",
        synergyWithExisting: "Irmão direto de Casas Modulares (79% de tração)",
        reason:
          "Fabricantes e locadores de módulos habitacionais, refeitórios de obras e containers compram exatamente a mesma família de aços que Casas Modulares, porém com giro de produção semanal.",
        productsBought: [
          "Chapas galvanizadas e galvalume",
          "Perfis U/Z dobrados para chassis e colunas",
          "Telhas termoacústicas (sanduíche PIR/EPS)",
          "Tubos metalon retangulares e quadrados",
        ],
        buyerPersona: "Gerente de Compras / Engenheiro de Produção / Sócio Industrial",
        mainPainPoint:
          "Prazo de entrega travado em grandes distribuidoras quando fecham contratos emergenciais de obras e mineração.",
        openingHook:
          "Atendemos fabricantes de módulos habitacionais com perfis dobrados, chapas galvanizadas e telhas com corte sob medida e entrega rápida. Posso enviar nosso catálogo técnico em PDF no seu WhatsApp?",
        qualificationQuestion:
          "Vocês compram os perfis de estrutura já dobrados na medida do módulo ou dobram internamente na fábrica?",
      },
      {
        niche: "Esquadrias Industriais, Brises & Pele de Vidro",
        macroCategory: "Imobiliário & Construção Modular",
        recommendedSpreadsheet: "Imobiliário.",
        fitScore: 95,
        avgTicket: "Médio/Alto Mensal",
        salesCycle: "10 a 20 dias",
        synergyWithExisting: "Complementar direto da sua aba Fachadas (23 empresas)",
        reason:
          "Empresas que executam fachadas comerciais, brises metálicos e revestimentos arquitetônicos compram chapas, perfis de fixação, insertos metálicos e corte/dobra a cada nova fachada contratada.",
        productsBought: [
          "Chapas finas a frio, galvanizadas e alumínio/ACM",
          "Bandejas e cassetes metálicos dobrados",
          "Tubos industriais e cantoneiras de ancoragem",
          "Chapas perfuradas e expandidas para brises",
        ],
        buyerPersona: "Orçamentista Técnico / Comprador de Obras / Diretor Técnico",
        mainPainPoint:
          "Precisam de cotação rápida na fase de orçamento da obra e sofrem com fornecedores que demoram 3 dias para responder preço.",
        openingHook:
          "Já fornecemos metais e perfis para empresas de fachadas em SP. Queria deixar nossa tabela/catálogo em PDF com o setor de orçamentos de vocês para quando precisarem cotar obra nova.",
        qualificationQuestion:
          "Hoje quem cuida da cotação de chapas, tubos e perfis metálicos quando entra projeto novo de fachada?",
      },
      {
        niche: "Galpões Metálicos & Estruturas Pré-Fabricadas",
        macroCategory: "Imobiliário & Construção Modular",
        recommendedSpreadsheet: "Imobiliário.",
        fitScore: 94,
        avgTicket: "Muito Alto (Por Obra)",
        salesCycle: "20 a 40 dias",
        synergyWithExisting: "Sinergia com Lajes (71% tração) e Casas Modulares",
        reason:
          "Construtoras de galpões industriais e estruturas metálicas compram toneladas de terças (Perfil U enrijecido), chapas grossas para sapatas/ligações e telhas metálicas.",
        productsBought: [
          "Terças em Perfil U simples e enrijecido",
          "Chapas grossas A36 para placas de base e flanges",
          "Telhas trapezoidais e zipadas",
          "Barras chatas, cantoneiras e chumbadores",
        ],
        buyerPersona: "Engenheiro de Suprimentos / Diretor de Engenharia",
        mainPainPoint:
          "Ruptura de estoque de bitolas específicas de perfil U enrijecido e chapas de ligação no meio da montagem do galpão.",
        openingHook:
          "Trabalhamos com linha completa de perfis estruturais, chapas A36 e coberturas para estruturas metálicas. Posso encaminhar nosso catálogo em PDF para vocês homologarem como fornecedor?",
        qualificationQuestion:
          "Vocês estão com alguma estrutura ou cobertura em fase de compra de aço para este mês?",
      },
      {
        niche: "Fôrmas Metálicas, Steel Deck & Escoramentos",
        macroCategory: "Imobiliário & Construção Modular",
        recommendedSpreadsheet: "Imobiliário.",
        fitScore: 92,
        avgTicket: "Alto Recorrente",
        salesCycle: "15 a 30 dias",
        synergyWithExisting: "Expansão direta da sua aba Lajes",
        reason:
          "Ao lado dos fabricantes de lajes treliçadas e pré-moldadas, empresas de fôrmas metálicas, lajes Steel Deck e escoramentos consomem bobinas e chapas galvanizadas estruturais o ano inteiro.",
        productsBought: [
          "Chapas galvanizadas estruturais (ZAR)",
          "Perfis conformados a frio e cantoneiras",
          "Tubos estruturais de parede grossa",
          "Telas, treliças e acessórios de concretagem",
        ],
        buyerPersona: "Comprador Industrial / Gerente de Suprimentos",
        mainPainPoint:
          "Oscilação de preço e exigência de certificado de qualidade fluência/zincagem do material.",
        openingHook:
          "Atendemos o setor de lajes e estruturas com chapas galvanizadas, tubos e perfis certificados. Posso enviar nosso catálogo em PDF para o setor de compras?",
        qualificationQuestion:
          "Quais espessuras de chapa ou tubo estrutural vocês mais consomem na linha de produção hoje?",
      },
      {
        niche: "Mezaninos e Porta-Pallets Logísticos",
        macroCategory: "Logística & Armazenagem Industrial",
        recommendedSpreadsheet: "Logística & Galpões",
        fitScore: 96,
        avgTicket: "Alto Ticket Recorrente",
        salesCycle: "15 a 25 dias",
        synergyWithExisting: "Consumo intensivo de perfis dobrados e piso metálico",
        reason:
          "Com o boom de centros de distribuição (e-commerce/3PL), fabricantes de sistemas de armazenagem, porta-pallets e mezaninos industriais compram aço toda semana sem sazonalidade.",
        productsBought: [
          "Perfis estruturais dobrados e perfurados (colunas/longarinas)",
          "Chapas xadrez e piso metálico antiderrapante",
          "Tubos estruturais e vigas laminadas",
          "Bobinas slitadas fina frio e galvanizadas",
        ],
        buyerPersona: "Gerente de Compras / Diretor Industrial",
        mainPainPoint:
          "Necessidade de regularidade dimensional nas chapas/bobinas para perfiladeiras e dobra seriada.",
        openingHook:
          "Fornecemos chapas de piso, bobinas e perfis estruturais para fabricantes de mezaninos e sistemas de armazenagem. Posso enviar nosso catálogo técnico em PDF para avaliação?",
        qualificationQuestion:
          "Vocês compram bobina/chapa para perfilar internamente ou também compram perfis e pisos já cortados/dobrados?",
      },
      {
        niche: "Docas, Niveladoras e Portas Seccionais Industriais",
        macroCategory: "Logística & Armazenagem Industrial",
        recommendedSpreadsheet: "Logística & Galpões",
        fitScore: 90,
        avgTicket: "Médio/Alto Mensal",
        salesCycle: "10 a 20 dias",
        synergyWithExisting: "Mesmos clientes finais de Galpões e Fachadas",
        reason:
          "Fabricantes de niveladoras de doca, portas rápidas/seccionais e abrigos para centros logísticos utilizam chapas xadrez grossas, perfis U, tubos e chapas galvanizadas em série.",
        productsBought: [
          "Chapas xadrez de alta resistência (pestanas e plataformas)",
          "Perfis U laminados e dobrados",
          "Chapas galvanizadas para painéis de portas",
          "Eixos, barras redondas e tubos mecânicos",
        ],
        buyerPersona: "Comprador Técnico / PCP (Planejamento e Controle de Produção)",
        mainPainPoint:
          "Falta de fornecedor ágil que entregue tanto a chapa xadrez pesada quanto os perfis e chapas finas no mesmo pedido.",
        openingHook:
          "Trabalhamos com a linha completa de chapas xadrez, perfis U e chapas galvanizadas para fabricantes de docas e portas industriais. Posso enviar nosso catálogo PDF?",
        qualificationQuestion:
          "Hoje vocês concentram a compra de chapas xadrez e perfis em um único distribuidor ou dividem por item?",
      },
      {
        niche: "Suportes e Estruturas Fotovoltaicas",
        macroCategory: "Energia Solar & Infraestrutura",
        recommendedSpreadsheet: "Energia & Infra",
        fitScore: 97,
        avgTicket: "Escala Industrial",
        salesCycle: "15 a 30 dias",
        synergyWithExisting: "Altíssimo volume de perfis galvanizados e alumínio",
        reason:
          "Fabricantes de estruturas de solo para usinas solares, carports solares e suportes de telhado têm demanda contínua de perfis conformados, aço galvanizado a fogo e alumínio.",
        productsBought: [
          "Perfis C/U/Z em aço galvanizado / Magnelis / Galvalume",
          "Perfis estruturais para estacas cravadas de usinas solares",
          "Cantoneiras, barras chatas e suportes estampados",
          "Perfis de alumínio estrutural",
        ],
        buyerPersona: "Diretor de Supply Chain / Engenheiro de Produto / Comprador Sênior",
        mainPainPoint:
          "Exigência de resistência à corrosão e cumprimento rigoroso de cronograma de entrega para usinas GD.",
        openingHook:
          "Atendemos o segmento de estruturas solares e carports com perfis estruturais e aços revestidos. Posso enviar nosso catálogo em PDF para o time de suprimentos?",
        qualificationQuestion:
          "O foco maior de fabricação de vocês hoje é estrutura de solo para usinas/carports ou suportes para telhado?",
      },
      {
        niche: "Fabricantes de Eletrocentros e Quadros Elétricos",
        macroCategory: "Energia Solar & Infraestrutura",
        recommendedSpreadsheet: "Energia & Infra",
        fitScore: 93,
        avgTicket: "Compra Mensal Fiel",
        salesCycle: "14 a 25 dias",
        synergyWithExisting: "Mesma engenharia modular de Casas Modulares + WEG",
        reason:
          "Você já tem a WEG na aba Casas Modulares! Fabricantes de eletrocentros metálicos, subestações compactas (skids) e painéis elétricos compram chapas finas, perfis estruturais e bases metálicas todo mês.",
        productsBought: [
          "Chapas finas a frio e galvanizadas (painéis e invólucros)",
          "Vigas W/I e perfis U pesados para base (Skid metálico)",
          "Telhas e painéis termoacústicos para salas elétricas",
          "Chapas de alumínio e cobre/inox para barramentos e flanges",
        ],
        buyerPersona: "Comprador Industrial / Coordenador de Engenharia Mecânica",
        mainPainPoint:
          "Planicidade da chapa para corte a laser e dobra CNC sem empenamento nos painéis e eletrocentros.",
        openingHook:
          "Fornecemos chapas selecionadas para corte/dobra e perfis pesados para skids e eletrocentros. Posso enviar nosso catálogo em PDF para o setor de compras?",
        qualificationQuestion:
          "Vocês fazem a caldeiraria do skid/painel internamente ou terceirizam parte do corte e dobra?",
      },
      {
        niche: "Implementos Rodoviários, Baús e Carrocerias",
        macroCategory: "Implementos Rodoviários & Agro",
        recommendedSpreadsheet: "Agro & Rodoviário",
        fitScore: 95,
        avgTicket: "Compra Semanal/Mensal",
        salesCycle: "10 a 20 dias",
        synergyWithExisting: "Consumo pesado de chapas, perfis dobrados e ACM/Alumínio",
        reason:
          "Fabricantes e reformadoras de baús frigoríficos/carga seca, caçambas basculantes, pranchas e carretas consomem aço estrutural, chapas de piso e revestimento toda semana.",
        productsBought: [
          "Perfis U e ômega dobrados para longarinas e travessas",
          "Chapas grossas A36 e chapas de alta resistência ao desgaste",
          "Chapas xadrez para piso de carroceria e plataforma",
          "Bobinas e chapas pré-pintadas / alumínio para baús",
        ],
        buyerPersona: "Sócio-Proprietário / Gerente de Compras / Chefe de Fábrica",
        mainPainPoint:
          "Necessidade de reposição rápida de chapas e perfis dobrados na medida do chassi sem empate de capital em estoque gigante.",
        openingHook:
          "Atendemos fabricantes de implementos e baús com perfis dobrados, chapas de piso e estruturais. Posso mandar nosso catálogo em PDF no seu WhatsApp para você comparar preços?",
        qualificationQuestion:
          "Qual item pesa mais na sua compra mensal hoje: chapas estruturais/piso ou perfis dobrados para chassi e caixa?",
      },
      {
        niche: "Silos, Secadores e Equipamentos Agrícolas",
        macroCategory: "Implementos Rodoviários & Agro",
        recommendedSpreadsheet: "Agro & Rodoviário",
        fitScore: 91,
        avgTicket: "Muito Alto",
        salesCycle: "20 a 35 dias",
        synergyWithExisting: "Alto volume de chapas galvanizadas e perfis estruturais",
        reason:
          "Indústrias de equipamentos para armazenagem de grãos, elevadores de canecas, roscas transportadoras e estruturas agroindustriais compram grandes lotes de aço galvanizado e carbono.",
        productsBought: [
          "Chapas galvanizadas e bobinas de alta camada de zinco",
          "Cantoneiras, barras chatas e perfis estruturais",
          "Tubos mecânicos e chapas A36",
          "Chapas perfuradas para aeração e peneiras",
        ],
        buyerPersona: "Gerente de Suprimentos / Diretor Industrial",
        mainPainPoint:
          "Picos de produção pré-safra onde as usinas pedem 60+ dias de lead time e eles precisam de pronta entrega.",
        openingHook:
          "Trabalhamos com pronta entrega de chapas galvanizadas, carbono e perfis para indústrias de equipamentos agrícolas. Posso enviar nosso catálogo em PDF?",
        qualificationQuestion:
          "Como está a programação de compras de chapas e perfis de vocês para os próximos 30 dias?",
      },
      {
        niche: "Totens, Pórticos Metálicos e Comunicação Visual Pesada",
        macroCategory: "Comunicação Visual, ACM & Varejo",
        recommendedSpreadsheet: "Imobiliário.",
        fitScore: 94,
        avgTicket: "Giro Rápido Semanal",
        salesCycle: "7 a 15 dias",
        synergyWithExisting: "Mesmo perfil de Guarusign, GFMVisual e Evolve (aba Fachadas)",
        reason:
          "Na sua aba Fachadas, empresas de comunicação visual e revestimento (como Guarusign, GFMVisual, Novacm) já pediram catálogo! Expandir para fabricantes de totens de postos/redes, pórticos e fachadas de redes de varejo tem conversão rapidíssima.",
        productsBought: [
          "Chapas de ACM, alumínio e chapas galvanizadas para letras/totens",
          "Tubos metalon (20x20, 30x30, 40x40, 50x30) para quadros internos",
          "Perfis estruturais pesados para colunas de totens",
          "Cantoneiras e barras de acabamento",
        ],
        buyerPersona: "Dono da Indústria Visual / Comprador / Gerente de Produção",
        mainPainPoint:
          "Precisam de entrega em 24h–48h quando aprovam rollout de fachadas para redes de farmácias, postos, bancos ou concessionárias.",
        openingHook:
          "Já fornecemos metalon, chapas galvanizadas e materiais de fachada para empresas de comunicação visual e revestimentos. Posso te mandar nosso catálogo em PDF aqui no WhatsApp?",
        qualificationQuestion:
          "Vocês estão comprando mais estrutura metálica (metalon/perfis) ou chapas e revestimentos nesta semana?",
      },
      {
        niche: "Gôndolas, Checkouts e Instalações para Supermercados",
        macroCategory: "Comunicação Visual, ACM & Varejo",
        recommendedSpreadsheet: "Logística & Galpões",
        fitScore: 93,
        avgTicket: "Compra Mensal Contínua",
        salesCycle: "15 a 25 dias",
        synergyWithExisting: "Produção seriada em aço fino, tubos e perfis",
        reason:
          "Fabricantes de expositores metálicos, gôndolas de supermercado/atacarejo, balcões refrigerados e mobiliário comercial em aço compram bobinas, chapas finas e tubos todos os meses sem parar.",
        productsBought: [
          "Chapas finas a frio (FF) e galvanizadas para prateleiras e colunas",
          "Tubos industriais redondos, quadrados e retangulares",
          "Arames, telas e perfis conformados",
          "Chapas de aço inox (para linha de refrigeração/gastronomia)",
        ],
        buyerPersona: "Gerente de Compras / PCP Industrial",
        mainPainPoint:
          "Qualidade superficial da chapa fina a frio para pintura eletrostática a pó (epóxi) sem manchas ou ondulações.",
        openingHook:
          "Fornecemos chapas finas a frio, galvanizadas e tubos com padrão ideal para pintura eletrostática e mobiliário comercial. Posso enviar nosso catálogo em PDF?",
        qualificationQuestion:
          "Qual é a espessura de chapa fina e medida de tubo que mais roda na fábrica de vocês todo mês?",
      },
    ];

    const allStudies = [...customStudiedSectors, ...builtInStudies];
    const candidateExpansions = allStudies.filter(
      (item) => !tabs.some((t) => t.toLowerCase() === item.niche.toLowerCase())
    );

    const macroCategories = [
      "Imobiliário & Construção Modular",
      "Logística & Armazenagem Industrial",
      "Energia Solar & Infraestrutura",
      "Implementos Rodoviários & Agro",
      "Comunicação Visual, ACM & Varejo",
    ];

    return {
      stats,
      topPerformingNiche,
      candidateExpansions,
      allStudies,
      macroCategories,
    };
  }, [rows, tabs, customStudiedSectors]);

  // Gera estudo de viabilidade instantâneo para qualquer setor digitado pelo usuário
  const handleGenerateCustomSectorStudy = () => {
    const clean = customSectorInput.trim();
    if (!clean) return;

    const lower = clean.toLowerCase();
    const isAgroOrTruck =
      lower.includes("agro") ||
      lower.includes("implemento") ||
      lower.includes("carreta") ||
      lower.includes("reboque") ||
      lower.includes("silo") ||
      lower.includes("máquina");
    const isSolarOrEnergy =
      lower.includes("solar") ||
      lower.includes("energia") ||
      lower.includes("elétric") ||
      lower.includes("painel") ||
      lower.includes("torre");
    const isLogistics =
      lower.includes("logístic") ||
      lower.includes("pallet") ||
      lower.includes("armazen") ||
      lower.includes("mezanino") ||
      lower.includes("elevador") ||
      lower.includes("gôndola");

    const macroCategory = isAgroOrTruck
      ? "Implementos Rodoviários & Agro"
      : isSolarOrEnergy
      ? "Energia Solar & Infraestrutura"
      : isLogistics
      ? "Logística & Armazenagem Industrial"
      : "Imobiliário & Construção Modular";

    const recommendedSpreadsheet = isAgroOrTruck
      ? "Agro & Rodoviário"
      : isSolarOrEnergy
      ? "Energia & Infra"
      : isLogistics
      ? "Logística & Galpões"
      : sheetTitle || "Imobiliário.";

    const newStudy = {
      niche: clean,
      macroCategory,
      recommendedSpreadsheet,
      fitScore: 92,
      avgTicket: "Alto Potencial B2B",
      salesCycle: "12 a 25 dias",
      synergyWithExisting: `Expansão mapeada para ${myCompany} a partir da tração de ${
        nicheIntelligence.topPerformingNiche?.tab || "Casas Modulares"
      }`,
      reason: `Empresas do setor de "${clean}" demandam fornecimento recorrente de chapas metálicas, tubos estruturais e perfis dobrados sob medida, buscando fornecedores ágeis com pronta entrega e corte na medida.`,
      productsBought: [
        `Chapas de aço carbono, galvanizadas ou inox aplicadas em ${clean}`,
        "Perfis U/Z dobrados e estruturais sob medida",
        "Tubos metalon industriais (quadrados, retangulares e redondos)",
        "Corte, dobra e bobinas slitadas para produção seriada",
      ],
      buyerPersona: `Comprador Técnico / Gerente Industrial / Sócio-Diretor em empresas de ${clean}`,
      mainPainPoint:
        "Demora na resposta de cotação dos distribuidores tradicionais e falta de flexibilidade em lotes fracionados ou medidas especiais.",
      openingHook: `Olá! Falo da ${myCompany}. Já fornecemos chapas, tubos e perfis metálicos para indústrias do segmento de ${clean}. Posso te enviar nosso catálogo técnico em PDF no WhatsApp para vocês terem como opção de cotação rápida?`,
      qualificationQuestion: `Hoje na linha de ${clean}, vocês compram o material já cortado/dobrado na medida ou compram chapas e barras padrão?`,
    };

    setCustomStudiedSectors((prev) => [
      newStudy,
      ...prev.filter((s) => s.niche.toLowerCase() !== clean.toLowerCase()),
    ]);
    setSelectedStudyNiche(clean);
    setSelectedMacroCategory("all");
    setCustomSectorInput("");
    setFeedbackBanner({
      type: "success",
      text: `✦ Estudo de viabilidade gerado para o setor "${clean}"! Veja o Dossiê Estratégico ao lado para decidir se cria uma aba ou planilha nova.`,
    });
  };

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
      "Atendeu": "Em contato",
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

  // Lê TODAS as abas e leads existentes diretamente do Google Sheets
  const handleReadFromGoogleSheets = async () => {
    if (!isRealGoogleSheetUrl(sheetUrl) && !webhookUrl.trim()) {
      setFeedbackBanner({
        type: "info",
        text: "Cole o link da sua planilha Google Sheets no Campo 1 abaixo (com acesso 'Qualquer pessoa com o link') ou cole a URL do Apps Script no Campo 2.",
      });
      return;
    }

    setIsReadingSheets(true);
    setFeedbackBanner(null);
    try {
      const params = new URLSearchParams({
        sheetUrl: sheetUrl.trim(),
        tabName: activeTab,
        readAllTabs: "true",
        knownTabs: tabs.join(","),
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

      // Atualiza automaticamente todas as abas descobertas na planilha Google Sheets (ex: Casas Modulares, Fachadas, Lajes...)
      const discoveredTabs: string[] =
        Array.isArray(data.tabs) && data.tabs.length > 0 ? data.tabs : [];
      const mergedTabs = discoveredTabs.length > 0 ? discoveredTabs : tabs;
      const discoveredTitle =
        typeof data.title === "string" && data.title.trim()
          ? data.title.trim()
          : sheetTitle;

      if (mergedTabs.length > 0) {
        setTabs(mergedTabs);
        if (!mergedTabs.includes(activeTab)) {
          setActiveTab(mergedTabs[0]);
          setTargetSegment(mergedTabs[0]);
        }
        setSheetTitle(discoveredTitle);
        setSpreadsheets((prev) =>
          prev.map((s) =>
            s.id === activeSpreadsheet.id
              ? { ...s, title: discoveredTitle, tabs: mergedTabs, sheetUrl: sheetUrl.trim() || s.sheetUrl }
              : s
          )
        );
      }

      const incomingFromSheet: ExtractedSheetLead[] = data.rows || [];
      const touchedTabs = Array.from(
        new Set(incomingFromSheet.map((r) => r.tab || activeTab))
      );

      let updatedRows = [...rows];
      let totalInserted = 0;
      let totalMerged = 0;
      let totalBlocked = 0;
      const newLogs: DeduplicationAuditEntry[] = [];

      for (const tName of touchedTabs) {
        const incomingForTab = incomingFromSheet.filter(
          (r) => (r.tab || activeTab) === tName
        );
        const existingForTab = updatedRows.filter((r) => r.tab === tName);
        const otherTabsRows = updatedRows.filter((r) => r.tab !== tName);

        const dedup = deduplicateAndMergeLeads(existingForTab, incomingForTab);
        updatedRows = [...otherTabsRows, ...dedup.updatedExistingRows];
        totalInserted += dedup.insertedCount;
        totalMerged += dedup.mergedCount;
        totalBlocked += dedup.blockedCount;
        newLogs.push(...dedup.auditLogs);
      }

      setRows(updatedRows);
      setAuditLogs((prev) => [...newLogs, ...prev].slice(0, 50));

      setFeedbackBanner({
        type: "success",
        text: `✦ Planilha "${discoveredTitle}" sincronizada (${mergedTabs.length} abas: ${mergedTabs.join(", ")}): ${totalInserted} novos leads importados, ${totalMerged} complementados e ${totalBlocked} já existentes mantidos!`,
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
          <div className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mr-1 shrink-0">
                Planilhas Conectadas ({spreadsheets.length}):
              </span>
              {spreadsheets.map((sheet) => {
                const isCurrentSheet = sheet.id === activeSpreadsheet.id;
                const sheetLeadsCount = rows.filter(
                  (r) => sheet.tabs.includes(r.tab) && r.empresa.trim()
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
                      {sheet.tabs.length} abas · {sheetLeadsCount} leads
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
                <span>+ Nova Planilha</span>
              </button>

              <button
                type="button"
                onClick={() => setNewTabModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
              >
                <Plus className="size-3.5 text-[#afafaf]" />
                <span>+ Nova Aba em {sheetTitle}</span>
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

          {/* =================================================================
              PARTE 1: RAIO-X DOS SETORES JÁ ATACADOS NA PLANILHA ATIVA
             ================================================================= */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#afafaf] uppercase tracking-wider">
                  1. Diagnóstico do que você já prospectou · Planilha "{sheetTitle}"
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
                  Desempenho e gargalos das abas atuais ({tabs.length} setores ativos)
                </h3>
              </div>
              {nicheIntelligence.topPerformingNiche && (
                <div className="inline-flex items-center gap-2.5 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-xs">
                  <span className="inline-flex h-6 items-center rounded-full bg-[#0c2b1c] px-2.5 font-semibold text-[#14d06e] tabular-nums">
                    {nicheIntelligence.topPerformingNiche.tractionRate}% tração
                  </span>
                  <span className="text-[#afafaf]">
                    Setor campeão atual:{" "}
                    <strong className="text-white">
                      {nicheIntelligence.topPerformingNiche.tab}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#2e2e2e]">
              {nicheIntelligence.stats.map((st) => {
                const isSelected = st.tab === activeTab;
                return (
                  <li
                    key={st.tab}
                    onClick={() => handleSelectTab(st.tab)}
                    className={`flex flex-col justify-between border-r border-b border-[#2e2e2e] p-5 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#1a1a1a]"
                        : "bg-[#000000] hover:bg-[#0d0d0d]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold tabular-nums ${
                            st.tractionRate >= 65
                              ? "bg-[#0c2b1c] text-[#14d06e]"
                              : st.total > 0
                              ? "bg-[#0f1b33] text-[#7fa9f7]"
                              : "bg-[#1a1a1a] text-[#afafaf]"
                          }`}
                        >
                          {st.total > 0
                            ? `${st.tractionRate}% pediram catálogo / atenderam`
                            : "Aba sem leads"}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-semibold text-[#7fa9f7]">
                            Aba Selecionada
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <p className="text-lg font-semibold text-white">
                          {st.tab}
                        </p>
                        <span className="text-sm font-semibold text-white tabular-nums">
                          {st.total} empresas
                        </span>
                      </div>

                      {/* Mini Funil Real da Aba */}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-2">
                          <p className="text-[10px] text-[#afafaf]">1º Toque Pendente</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#e8c267] tabular-nums">
                            {st.waitingFirstTouch}
                          </p>
                        </div>
                        <div className="rounded bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-2">
                          <p className="text-[10px] text-[#afafaf]">Catálogo Enviado</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#7fa9f7] tabular-nums">
                            {st.catalogSent}
                          </p>
                        </div>
                        <div className="rounded bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-2">
                          <p className="text-[10px] text-[#afafaf]">Atendeu / Quentes</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#14d06e] tabular-nums">
                            {st.answered + st.inContact + st.meetingBooked}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-[#afafaf] leading-relaxed">
                        {st.diagnosticSummary}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#2e2e2e]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTab(st.tab);
                          onWorkspaceTabChange?.("planilha");
                        }}
                        className="flex-1 rounded bg-white hover:bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-[#0d0d0d] transition-colors cursor-pointer text-center"
                      >
                        Ver {st.total} Leads na Planilha &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTab(st.tab);
                          onWorkspaceTabChange?.("cadencia");
                        }}
                        className="rounded bg-[#0d0d0d] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-[#afafaf] hover:text-white transition-colors cursor-pointer text-center"
                      >
                        Cadência
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* =================================================================
              PARTE 2: LABORATÓRIO & ESTUDO DE QUAIS SETORES ATACAR AGORA
             ================================================================= */}
          <div className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#2e2e2e] pb-4">
              <div>
                <span className="inline-flex h-6 items-center rounded-full bg-[#0f1b33] px-2.5 text-xs font-semibold text-[#7fa9f7]">
                  2. Inteligência de Expansão Comercial · {myCompany}
                </span>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                  Estudo de Quais Setores Atacar (Matriz de Viabilidade & Dossiê Tático)
                </h3>
                <p className="mt-1 text-xs text-[#afafaf]">
                  Estude o que cada setor compra, quem é o decisor, qual é a dor deles e o gancho de abordagem antes de criar a aba ou planilha.
                </p>
              </div>

              {/* Simulador de Qualquer Setor Novo */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <input
                  type="text"
                  value={customSectorInput}
                  onChange={(e) => setCustomSectorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGenerateCustomSectorStudy();
                  }}
                  placeholder="Testar outro setor (ex: Cozinhas Industriais, Elevadores...)"
                  className="w-full sm:w-72 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateCustomSectorStudy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white hover:bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#0d0d0d] shrink-0 cursor-pointer"
                >
                  <Sparkles className="size-3.5" />
                  <span>Gerar Estudo do Setor</span>
                </button>
              </div>
            </div>

            {/* Filtros por Macro-Mercado (Cada Macro-Mercado pode ser uma Planilha separada!) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mr-1">
                Filtrar por Macro-Mercado:
              </span>
              <button
                type="button"
                onClick={() => setSelectedMacroCategory("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedMacroCategory === "all"
                    ? "bg-white text-[#0d0d0d]"
                    : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:text-white"
                }`}
              >
                Todos os Setores Mapeados ({nicheIntelligence.candidateExpansions.length})
              </button>
              {nicheIntelligence.macroCategories.map((macro) => {
                const count = nicheIntelligence.candidateExpansions.filter(
                  (c) => c.macroCategory === macro
                ).length;
                const isSelected = selectedMacroCategory === macro;
                return (
                  <button
                    key={macro}
                    type="button"
                    onClick={() => setSelectedMacroCategory(macro)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white text-[#0d0d0d]"
                        : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:text-white"
                    }`}
                  >
                    {macro} ({count})
                  </button>
                );
              })}
            </div>

            {/* Matriz 12 Colunas: Lista de Setores (Esquerda) + Dossiê Profundo de Ataque (Direita) */}
            {(() => {
              const filteredStudies =
                selectedMacroCategory === "all"
                  ? nicheIntelligence.candidateExpansions
                  : nicheIntelligence.candidateExpansions.filter(
                      (item) => item.macroCategory === selectedMacroCategory
                    );

              const activeStudy =
                filteredStudies.find((s) => s.niche === selectedStudyNiche) ||
                filteredStudies[0] ||
                nicheIntelligence.allStudies[0];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Coluna Esquerda (5 cols): Ranking de Setores para Estudar */}
                  <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                    {filteredStudies.map((study, index) => {
                      const isCurrentStudy = activeStudy?.niche === study.niche;
                      return (
                        <div
                          key={study.niche}
                          onClick={() => setSelectedStudyNiche(study.niche)}
                          className={`rounded-lg p-4 transition-all cursor-pointer ${
                            isCurrentStudy
                              ? "bg-[#1a1a1a] ring-1 ring-white"
                              : "bg-[#000000] ring-1 ring-[#2e2e2e] hover:bg-[#1a1a1a]/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex h-5 items-center rounded-full bg-[#0c2b1c] px-2 text-[11px] font-semibold text-[#14d06e] tabular-nums">
                              #{index + 1} · Aderência {study.fitScore}%
                            </span>
                            <span className="text-[11px] font-medium text-[#7fa9f7]">
                              {study.avgTicket}
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-white">
                            {study.niche}
                          </p>
                          <p className="mt-1 text-[11px] text-[#afafaf]">
                            Macro-Mercado:{" "}
                            <strong className="text-white">
                              {study.macroCategory}
                            </strong>{" "}
                            · Planilha sugerida:{" "}
                            <strong className="text-[#14d06e]">
                              {study.recommendedSpreadsheet}
                            </strong>
                          </p>
                          <p className="mt-1.5 text-xs text-[#afafaf] line-clamp-2 leading-relaxed">
                            {study.reason}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coluna Direita (7 cols): Dossiê Estratégico Completo do Setor Selecionado */}
                  {activeStudy && (
                    <div className="lg:col-span-7 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-5 flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2e2e2e] pb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex h-6 items-center rounded-full bg-[#0c2b1c] px-2.5 text-xs font-semibold text-[#14d06e] tabular-nums">
                                Score de Ataque: {activeStudy.fitScore}/100
                              </span>
                              <span className="inline-flex h-6 items-center rounded-full bg-[#0f1b33] px-2.5 text-xs font-semibold text-[#7fa9f7]">
                                {activeStudy.macroCategory}
                              </span>
                              <span className="inline-flex h-6 items-center rounded-full bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-2.5 text-xs font-medium text-[#afafaf]">
                                Ciclo: {activeStudy.salesCycle}
                              </span>
                            </div>
                            <h4 className="mt-2.5 text-xl font-semibold tracking-[-0.03em] text-white">
                              Dossiê de Ataque: {activeStudy.niche}
                            </h4>
                            <p className="mt-1 text-xs text-[#14d06e] font-medium">
                              ✦ {activeStudy.synergyWithExisting}
                            </p>
                          </div>
                        </div>

                        {/* Bloco 1: Por que atacar + O que eles compram */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div className="rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3.5 space-y-1.5">
                            <p className="text-xs font-semibold text-white">
                              1. Por que atacar este setor agora?
                            </p>
                            <p className="text-xs text-[#afafaf] leading-relaxed">
                              {activeStudy.reason}
                            </p>
                          </div>

                          <div className="rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3.5 space-y-1.5">
                            <p className="text-xs font-semibold text-white">
                              2. O que eles compram da {myCompany}?
                            </p>
                            <ul className="space-y-1 text-xs text-[#afafaf]">
                              {activeStudy.productsBought.map((prod) => (
                                <li key={prod} className="flex items-start gap-1.5">
                                  <span className="text-[#14d06e] font-bold">·</span>
                                  <span>{prod}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Bloco 2: Quem é o Decisor + Qual é a Dor Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div className="rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3.5 space-y-1.5">
                            <p className="text-xs font-semibold text-white">
                              3. Quem procurar na empresa (Decisor)
                            </p>
                            <p className="text-xs text-[#7fa9f7] font-semibold">
                              {activeStudy.buyerPersona}
                            </p>
                            <p className="text-[11px] text-[#afafaf] leading-relaxed mt-1">
                              <strong className="text-white">Pergunta de Triagem (30s):</strong>{" "}
                              "{activeStudy.qualificationQuestion}"
                            </p>
                          </div>

                          <div className="rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3.5 space-y-1.5">
                            <p className="text-xs font-semibold text-white">
                              4. Dor principal que faz eles trocarem de fornecedor
                            </p>
                            <p className="text-xs text-[#afafaf] leading-relaxed">
                              {activeStudy.mainPainPoint}
                            </p>
                          </div>
                        </div>

                        {/* Bloco 3: Gancho de Abertura pronto para oferecer o Catálogo PDF */}
                        <div className="rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3.5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white">
                              5. Script de Abertura (Gancho para enviar o Catálogo PDF)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(activeStudy.openingHook);
                                setFeedbackBanner({
                                  type: "success",
                                  text: `✦ Script de abertura do setor "${activeStudy.niche}" copiado!`,
                                });
                              }}
                              className="inline-flex items-center gap-1 rounded bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1 text-[11px] font-semibold text-white cursor-pointer"
                            >
                              <Copy className="size-3" />
                              <span>Copiar Script</span>
                            </button>
                          </div>
                          <p className="text-xs text-[#afafaf] italic leading-relaxed">
                            "{activeStudy.openingHook}"
                          </p>
                        </div>
                      </div>

                      {/* Rodapé de Decisão: Criar Aba na Planilha Atual OU Criar Nova Planilha */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#2e2e2e] pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedTabs = tabs.includes(activeStudy.niche)
                              ? tabs
                              : [...tabs, activeStudy.niche];
                            setTabs(updatedTabs);
                            setSpreadsheets((prev) =>
                              prev.map((s) =>
                                s.id === activeSpreadsheet.id
                                  ? { ...s, tabs: updatedTabs }
                                  : s
                              )
                            );
                            setActiveTab(activeStudy.niche);
                            setTargetSegment(activeStudy.niche);
                            onWorkspaceTabChange?.("planilha");
                            setFeedbackBanner({
                              type: "success",
                              text: `✦ Aba "${activeStudy.niche}" adicionada em "${sheetTitle}"! Clique em 'Captar Leads' para abastecer 15–20 empresas deste setor.`,
                            });
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-white/90 px-4 py-2.5 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          <span>
                            Atacar na Planilha "{sheetTitle}" (Criar Aba &amp; Captar Leads) &rarr;
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNewSpreadsheetTitle(activeStudy.recommendedSpreadsheet);
                            setNewSpreadsheetFirstTab(activeStudy.niche);
                            setNewSpreadsheetModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3.5 py-2.5 text-xs font-semibold text-white cursor-pointer"
                        >
                          <FileSpreadsheet className="size-3.5 text-[#14d06e]" />
                          <span>
                            Criar Nova Planilha "{activeStudy.recommendedSpreadsheet}"
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* =====================================================================
          ABA: CONEXÃO GOOGLE SHEETS & AUDITORIA ANTI-DUPLICIDADE
         ===================================================================== */}
      {activeWorkspaceTab === "integracao" && (
        <section className="space-y-5">
          {/* BARRA SUPERIOR: SELETOR DE MÚLTIPLAS PLANILHAS + VISUALIZADOR DE TODAS AS ABAS */}
          <div className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2e2e2e] pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mr-1">
                  Minhas Planilhas ({spreadsheets.length}):
                </span>
                {spreadsheets.map((sheet) => {
                  const isCurrent = sheet.id === activeSpreadsheet.id;
                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      onClick={() => handleSelectSpreadsheet(sheet.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-white text-[#0d0d0d]"
                          : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:bg-[#262626] hover:text-white"
                      }`}
                    >
                      <FileSpreadsheet
                        className={`size-3.5 ${
                          isCurrent ? "text-[#0d0d0d]" : "text-[#14d06e]"
                        }`}
                      />
                      <span>{sheet.title}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                          isCurrent
                            ? "bg-[#0d0d0d]/15 text-[#0d0d0d]"
                            : "bg-[#0d0d0d] text-[#757575]"
                        }`}
                      >
                        {sheet.tabs.length} abas
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setNewSpreadsheetModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  <Plus className="size-3.5 text-[#14d06e]" />
                  <span>+ Conectar Outra Planilha que Já Tenho / Criar Nova</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onWorkspaceTabChange?.("planilha")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                >
                  <span>Abrir Aba "{activeTab}" na Tabela &rarr;</span>
                </button>
              </div>
            </div>

            {/* NAVEGADOR ENTRE AS ABAS DA PLANILHA ATIVA (Ex: Casas Modulares, Fachadas, Lajes...) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mr-1">
                  Abas de "{sheetTitle}" ({tabs.length}):
                </span>
                {tabs.map((tab) => {
                  const isSelected = tab === activeTab;
                  const count = rows.filter(
                    (r) => r.tab === tab && r.empresa.trim()
                  ).length;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab);
                        setTargetSegment(tab);
                      }}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0f1b33] text-[#7fa9f7] ring-1 ring-[#7fa9f7]/50"
                          : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:bg-[#262626] hover:text-white"
                      }`}
                    >
                      <span>{tab}</span>
                      <span className="rounded-full bg-[#0d0d0d] px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                        {count} leads
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setNewTabModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-2.5 py-1.5 text-xs font-semibold text-[#afafaf] hover:text-white cursor-pointer"
                >
                  <Plus className="size-3" />
                  <span>Nova Aba</span>
                </button>
              </div>

              <span className="text-[11px] text-[#afafaf]">
                Clique em qualquer aba acima para alternar ou clique em{" "}
                <strong className="text-white">Importar Todas as Abas</strong>{" "}
                abaixo para puxar novas abas do Google Sheets.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Coluna Esquerda: Conector Google Sheets Passo a Passo */}
            <div className="lg:col-span-6 rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2e2e2e] pb-4">
                <div>
                  <span className="inline-flex h-6 items-center rounded-full bg-[#0f1b33] px-2.5 text-xs font-semibold text-[#7fa9f7]">
                    Ponte Google Sheets · Planilha "{sheetTitle}"
                  </span>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                    Conectar e sincronizar todas as abas do seu Google Sheets
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSpreadsheetModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-white/90 px-3 py-2 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Adicionar Outra Planilha</span>
                  </button>
                  {isRealGoogleSheetUrl(sheetUrl) && (
                    <a
                      href={sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-2 text-xs font-semibold text-white"
                    >
                      <FileSpreadsheet className="size-3.5 text-[#14d06e]" />
                      <span>Abrir no Google</span>
                      <ExternalLink className="size-3 text-[#757575]" />
                    </a>
                  )}
                </div>
              </div>

              {/* Passo a Passo Direto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-3">
                  <span className="font-semibold text-white">
                    1. Compartilhe e cole o link
                  </span>
                  <p className="mt-1 text-[11px] text-[#afafaf]">
                    Na sua planilha Google (ex: <em>Imobiliário.</em>), clique em{" "}
                    <strong>Compartilhar &rarr; Qualquer pessoa com o link</strong>{" "}
                    e cole o link no Campo 1 abaixo.
                  </p>
                </div>
                <div className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-3">
                  <span className="font-semibold text-white">
                    2. Importe todas as abas
                  </span>
                  <p className="mt-1 text-[11px] text-[#afafaf]">
                    Clique em <strong>Importar Todas as Abas &amp; Leads</strong>{" "}
                    ao lado do link. O CRM descobre todas as abas (<em>Casas Modulares</em>,{" "}
                    <em>Fachadas</em>, <em>Lajes</em>...) de uma só vez.
                  </p>
                </div>
                <div className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-3">
                  <span className="font-semibold text-white">
                    3. Gravação automática (Opcional)
                  </span>
                  <p className="mt-1 text-[11px] text-[#afafaf]">
                    Para o CRM também escrever novos leads e criar abas na sua planilha, cole o{" "}
                    <strong>Apps Script</strong> em{" "}
                    <em>Extensões &rarr; Apps Script</em>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    1. Link da sua planilha Google Sheets ({sheetTitle})
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={sheetUrl}
                      onChange={(e) => handleUpdateActiveSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit"
                      className="flex-1 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-2 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isReadingSheets}
                      onClick={handleReadFromGoogleSheets}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white hover:bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#0d0d0d] shrink-0 cursor-pointer"
                    >
                      <CloudDownload className="size-3.5" />
                      <span>
                        {isReadingSheets
                          ? "Importando abas..."
                          : "Importar Todas as Abas & Leads"}
                      </span>
                    </button>
                  </div>
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
                    <p className="text-[11px] text-[#afafaf]">Planilhas Conectadas</p>
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
                        ? "Multi-Abas Ativo"
                        : "Aguardando Link"}
                    </p>
                  </div>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-6 text-center text-xs text-[#afafaf]">
                    Nenhuma colisão registrada ainda nesta sessão. Quando você captar leads ou importar as abas da sua planilha, cada validação de CNPJ, domínio e telefone aparecerá aqui.
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
                    {isReadingSheets
                      ? "Lendo todas as abas..."
                      : "Ler Todas as Abas Agora"}
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
          </div>
        </section>
      )}

      {/* MODAL PARA CONECTAR PLANILHA JÁ EXISTENTE OU CRIAR NOVA (ESTÉTICA IRVO.COM.BR) */}
      {newSpreadsheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                Conectar planilha existente ou criar nova
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-white">
                    Link da planilha no Google Sheets (já existente ou nova)
                  </label>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#7fa9f7] hover:underline"
                  >
                    + Criar em sheets.new
                  </a>
                </div>
                <input
                  type="text"
                  value={newSpreadsheetUrl}
                  onChange={(e) => setNewSpreadsheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit"
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-xs text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#afafaf]">
                  Se a planilha já tiver várias abas (ex: <em>Casas Modulares</em>, <em>Fachadas</em>, <em>Lajes</em>), todas serão importadas automaticamente.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#afafaf] mb-1">
                  Nome da planilha (opcional se colar o link acima)
                </label>
                <input
                  type="text"
                  value={newSpreadsheetTitle}
                  onChange={(e) => setNewSpreadsheetTitle(e.target.value)}
                  placeholder="Ex: Imobiliário., Metalúrgicas SP, Energia Solar..."
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-sm text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#afafaf] mb-1">
                  Aba inicial (opcional — para planilhas novas)
                </label>
                <input
                  type="text"
                  value={newSpreadsheetFirstTab}
                  onChange={(e) => setNewSpreadsheetFirstTab(e.target.value)}
                  placeholder="Ex: Casas Modulares, Estruturas Fotovoltaicas..."
                  className="w-full rounded-md bg-[#0d0d0d] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-sm text-white placeholder:text-[#757575] focus:ring-white focus:outline-none"
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
                {isCreatingRemoteSheet
                  ? "Importando abas..."
                  : "Conectar & Importar Abas"}
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
