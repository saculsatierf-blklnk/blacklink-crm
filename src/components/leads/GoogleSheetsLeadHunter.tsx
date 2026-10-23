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
  X,
} from "lucide-react";
import type {
  ExtractedSheetLead,
  ProspectionLevel,
} from "@/app/api/crm/lead-extractor/route";
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

// Os 19 leads exatos do print da planilha "Imobiliário." (aba Casas Modulares)
const INITIAL_PRINT_LEADS: ExtractedSheetLead[] = [
  {
    id: "row-1",
    empresa: "Cmc Modular",
    responsavel: "Edison Tateishi",
    email: "marketing@lafaete.com.br",
    contato: "11 997365543",
    nivelProspeccao: "Em contato",
    observacoes: "",
    highlighted: true,
    tab: "Casas Modulares",
  },
  {
    id: "row-2",
    empresa: "Casa Cubo",
    responsavel: "",
    email: "contato@casacubo.com.br",
    contato: "(11)3604.1863",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-3",
    empresa: "Arka Conteiner",
    responsavel: "Bruno",
    email: "",
    contato: "27997373660",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-4",
    empresa: "Modular",
    responsavel: "",
    email: "",
    contato: "31 9855-4462",
    nivelProspeccao: "Reunião agendada",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-5",
    empresa: "Minha Casa Box",
    responsavel: "",
    email: "MINHACASABOX@GMAIL.COM",
    contato: "81 983650178",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-6",
    empresa: "Arquitetizze",
    responsavel: "",
    email: "comercial@arquitetizze.com.br",
    contato: "(47) 3439-1666",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-7",
    empresa: "Smart House",
    responsavel: "Bianca",
    email: "vendas@smarthousecontainer.com.br",
    contato: "(11) 96909-3975",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "Solicitou wpp esse nmr",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-8",
    empresa: "Minha Casa Pré-Fabricada",
    responsavel: "",
    email: "",
    contato: "12991583875",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-9",
    empresa: "Sombra e Mix",
    responsavel: "",
    email: "",
    contato: "(47) 98827-3504",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-10",
    empresa: "Modulife",
    responsavel: "Antonio",
    email: "compras@modulifecm.com.br",
    contato: "31990887607",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: true,
    tab: "Casas Modulares",
  },
  {
    id: "row-11",
    empresa: "Nagawa",
    responsavel: "",
    email: "",
    contato: "11971345864",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-12",
    empresa: "nomad modular",
    responsavel: "",
    email: "contato@construtoranomad.com.br",
    contato: "(37) 99945-0604",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-13",
    empresa: "Fabrilar",
    responsavel: "",
    email: "",
    contato: "11 4106-3200",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-14",
    empresa: "Atualle Modular",
    responsavel: "",
    email: "",
    contato: "41 9990-0447",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-15",
    empresa: "Modular Fisher",
    responsavel: "",
    email: "vendas_scm@fischer.com.br",
    contato: "(47) 99726-1115",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-16",
    empresa: "JPG Empreendimentos",
    responsavel: "João",
    email: "",
    contato: "(11) 94272-1130",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "Utiliza alvenaria convencional, aço em foco nos telhados.",
    highlighted: true,
    tab: "Casas Modulares",
  },
  {
    id: "row-17",
    empresa: "Arch Valor",
    responsavel: "",
    email: "alexandre.paschoal@engenhariavalor.com.br",
    contato: "(11) 91420-5663",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-18",
    empresa: "Simonetto",
    responsavel: "",
    email: "contato@simonetto.com.br",
    contato: "(11) 98192-8510",
    nivelProspeccao: "Catálogo enviado",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
  {
    id: "row-19",
    empresa: "WEG",
    responsavel: "",
    email: "info-br@weg.net",
    contato: "47 3276-4000",
    nivelProspeccao: "Tentativa de contato",
    observacoes: "",
    highlighted: false,
    tab: "Casas Modulares",
  },
];

// Script Google Apps Script pronto para colar na planilha e formatar exatamente como o print
const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabName = data.tabName || "Casas Modulares";
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  // 1. Formata Cabeçalho Azul Marinho (#202b5b) idêntico ao padrão Imobiliário/Gofer
  var headers = [["Empresa", "Responsável", "E-mail", "Contato", "Nível de Prospecção", "Observações"]];
  var headerRange = sheet.getRange(1, 1, 1, 6);
  headerRange.setValues(headers)
    .setBackground("#202b5b")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 32);

  if (data.replaceAllInTab && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).clearContent().setBackground(null);
  }

  // Evita duplicar empresas que já estão na aba
  var existingValues = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues() : [];
  var existingNames = {};
  for (var i = 0; i < existingValues.length; i++) {
    var name = String(existingValues[i][0] || "").toLowerCase().trim();
    if (name) existingNames[name] = true;
  }

  var rowsToAdd = [];
  var highlightFlags = [];
  for (var j = 0; j < data.rows.length; j++) {
    var r = data.rows[j];
    var key = String(r.empresa || "").toLowerCase().trim();
    if (!data.replaceAllInTab && existingNames[key]) continue;
    rowsToAdd.push([r.empresa, r.responsavel, r.email, r.contato, r.nivelProspeccao || "Tentativa de contato", r.observacoes]);
    highlightFlags.push(Boolean(r.highlighted));
  }

  if (rowsToAdd.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    var targetRange = sheet.getRange(startRow, 1, rowsToAdd.length, 6);
    targetRange.setValues(rowsToAdd).setVerticalAlignment("middle");

    // 2. Validação de Dados (Dropdown Nível de Prospecção) na Coluna E
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Tentativa de contato", "Catálogo enviado", "Em contato", "Reunião agendada"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(startRow, 5, rowsToAdd.length, 1).setDataValidation(rule);

    // 3. Aplica destaque amarelo (#ffff00) nas linhas marcadas
    for (var k = 0; k < highlightFlags.length; k++) {
      if (highlightFlags[k]) {
        sheet.getRange(startRow + k, 1, 1, 6).setBackground("#ffff00");
      }
    }
  }

  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 250);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 175);
  sheet.setColumnWidth(6, 340);

  return ContentService.createTextOutput(JSON.stringify({ ok: true, added: rowsToAdd.length }))
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
  ]);
  const [activeTab, setActiveTab] = useState<string>("Casas Modulares");
  const [rows, setRows] = useState<ExtractedSheetLead[]>(INITIAL_PRINT_LEADS);

  // Inputs do Motor de Prospecção
  const [representedWebsite, setRepresentedWebsite] = useState(
    "https://gofermetais.com.br"
  );
  const [targetSegment, setTargetSegment] = useState("Casas Modulares");
  const [targetRegion, setTargetRegion] = useState("Brasil (Nacional)");
  const [batchLimit, setBatchLimit] = useState<number>(10);

  // Estados de Execução e Sincronização Google Sheets
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isImportingKanban, setIsImportingKanban] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "info" | "error";
    text: string;
  } | null>(null);

  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [newTabModalOpen, setNewTabModalOpen] = useState(false);
  const [newTabName, setNewTabName] = useState("");

  // Carrega dados persistidos no navegador
  useEffect(() => {
    try {
      const savedRows = localStorage.getItem("gofer_sheets_leads_v1");
      const savedTabs = localStorage.getItem("gofer_sheets_tabs_v1");
      const savedWebhook = localStorage.getItem("gofer_sheets_webhook_v1");
      const savedSheetUrl = localStorage.getItem("gofer_sheets_url_v1");
      const savedRepSite = localStorage.getItem("gofer_represented_site_v1");

      if (savedRows) {
        const parsed = JSON.parse(savedRows);
        if (Array.isArray(parsed) && parsed.length > 0) setRows(parsed);
      }
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0)
          setTabs(parsedTabs);
      }
      if (savedWebhook) setWebhookUrl(savedWebhook);
      if (savedSheetUrl) setSheetUrl(savedSheetUrl);
      if (savedRepSite) setRepresentedWebsite(savedRepSite);
    } catch {}
  }, []);

  // Salva automaticamente alterações na planilha local
  useEffect(() => {
    try {
      localStorage.setItem("gofer_sheets_leads_v1", JSON.stringify(rows));
      localStorage.setItem("gofer_sheets_tabs_v1", JSON.stringify(tabs));
      localStorage.setItem("gofer_represented_site_v1", representedWebsite);
      if (webhookUrl)
        localStorage.setItem("gofer_sheets_webhook_v1", webhookUrl);
      if (sheetUrl) localStorage.setItem("gofer_sheets_url_v1", sheetUrl);
    } catch {}
  }, [rows, tabs, representedWebsite, webhookUrl, sheetUrl]);

  // Quando troca a aba, sugere o nome da aba como segmento de busca
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setTargetSegment(tab);
  };

  const activeTabRows = useMemo(
    () => rows.filter((r) => r.tab === activeTab),
    [rows, activeTab]
  );

  // Atualiza qualquer célula inline igual ao Google Sheets
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
      responsavel: "",
      email: "",
      contato: "",
      nivelProspeccao: "Tentativa de contato",
      observacoes: "",
      highlighted: false,
      tab: activeTab,
    };
    setRows((prev) => [...prev, newRow]);
  };

  const deleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Dispara busca automática no Google + IA e abastece a planilha
  const handleExtractLeads = async () => {
    if (!targetSegment.trim()) return;
    setIsExtracting(true);
    setFeedbackBanner(null);

    try {
      const targetTab = activeTab;
      const existingCompanies = rows.map((r) => r.empresa).filter(Boolean);
      const existingEmails = rows.map((r) => r.email).filter(Boolean);

      const res = await fetch("/api/crm/lead-extractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          representedWebsite,
          targetSegment,
          targetRegion,
          tabName: targetTab,
          limit: batchLimit,
          existingCompanies,
          existingEmails,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao buscar leads.");
      }

      const extracted: ExtractedSheetLead[] = data.leads || [];
      if (extracted.length === 0) {
        setFeedbackBanner({
          type: "info",
          text: `Todas as empresas encontradas para "${targetSegment}" já constam na sua planilha (zero duplicidade).`,
        });
        setIsExtracting(false);
        return;
      }

      const updatedRows = [...rows, ...extracted];
      setRows(updatedRows);

      // Se o usuário já configurou o Webhook do Google Sheets, abastece a planilha na nuvem automaticamente!
      if (webhookUrl.trim()) {
        const syncRes = await fetch("/api/crm/sheets-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl: webhookUrl.trim(),
            tabName: targetTab,
            leads: extracted,
            replaceAllInTab: false,
          }),
        });
        if (syncRes.ok) {
          setFeedbackBanner({
            type: "success",
            text: `✦ ${extracted.length} novas empresas de "${targetSegment}" extraídas e abastecidas automaticamente na aba "${targetTab}" do seu Google Sheets!`,
          });
        } else {
          setFeedbackBanner({
            type: "success",
            text: `✦ ${extracted.length} novas empresas de "${targetSegment}" adicionadas à planilha! (Clique em 'Abastecer Google Sheets' para enviar à nuvem).`,
          });
        }
      } else {
        setFeedbackBanner({
          type: "success",
          text: `✦ ${extracted.length} novas empresas de "${targetSegment}" extraídas com sucesso na aba "${targetTab}"!`,
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

  // Envia toda a aba atual para o Google Sheets oficial
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
          tabName: activeTab,
          leads: activeTabRows.filter((r) => r.empresa.trim()),
          replaceAllInTab: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao sincronizar planilha.");
      }

      setFeedbackBanner({
        type: "success",
        text: `✦ Aba "${activeTab}" (${activeTabRows.length} empresas) sincronizada e formatada no Google Sheets com sucesso!`,
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

  // Exporta arquivo .xls formatado com cabeçalho #202b5b, pílulas coloridas e linhas amarelas #ffff00
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

        return `<tr${rowBg}>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;">${r.empresa}</td>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;">${r.responsavel}</td>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;color:#1155cc;text-decoration:underline;">${r.email}</td>
          <td style="border:1px solid #d0d7de;padding:6px 10px;font-family:Arial,sans-serif;font-size:10pt;">${r.contato}</td>
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
    a.download = `Imobiliario-${activeTab.replace(/\s+/g, "-")}-Gofer.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copia as linhas em formato TSV para colar direto no Google Sheets (Ctrl+V / Cmd+V)
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
          r.contato,
          r.nivelProspeccao,
          r.observacoes,
        ].join("\t")
      );
    navigator.clipboard.writeText([header, ...lines].join("\n"));
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 3000);
  };

  // Importa uma linha para o Kanban individual do operador
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
        phone: row.contato.trim() || "",
        initialNote: `[Planilha ${row.tab} • ${row.nivelProspeccao}] ${row.observacoes || "Prospecção Gofer Metais"}`,
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
      {/* PAINEL DE AUTOMAÇÃO: SITE REPRESENTADO + SEGMENTO ALVO -> GOOGLE SHEETS */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-[#0c121e] via-[#090d16] to-[#070709] p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Extrator Automático Google &rarr; Planilha Google Sheets
              </h2>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                {companyName}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Informe o site da empresa que você representa e o tipo de empresa que deseja buscar. O sistema varre a web atrás de Nome, E-mail e Telefone e abastece sua planilha no padrão exato do Google Sheets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Abrir Planilha no Google</span>
              <ExternalLink className="h-3 w-3 text-zinc-400" />
            </a>

            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>
                {webhookUrl ? "Google Sheets Conectado" : "Conectar Google Sheets Automático"}
              </span>
            </button>
          </div>
        </div>

        {/* Formulário de Busca Automática */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-5 items-end">
          {/* 1. Site da Empresa Representada */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>1. Site da Empresa que Representamos</span>
            </label>
            <input
              type="text"
              value={representedWebsite}
              onChange={(e) => setRepresentedWebsite(e.target.value)}
              placeholder="Ex: https://gofermetais.com.br"
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* 2. Tipo de Empresa / Segmento para Buscar Leads */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              <Building2 className="h-3.5 w-3.5 text-sky-400" />
              <span>2. Tipo de Empresa p/ Buscar Leads (Nicho)</span>
            </label>
            <input
              type="text"
              value={targetSegment}
              onChange={(e) => setTargetSegment(e.target.value)}
              placeholder="Ex: Casas Modulares, Fachadas, Lajes, Steel Frame..."
              className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-sky-400 focus:outline-none"
            />
          </div>

          {/* 3. Região / Quantidade */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              3. Região / Lote
            </label>
            <div className="flex gap-1.5">
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-2.5 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="Brasil">Brasil (Todos)</option>
                <option value="São Paulo SP">São Paulo (SP)</option>
                <option value="Santa Catarina SC">Santa Catarina (SC)</option>
                <option value="Paraná PR">Paraná (PR)</option>
                <option value="Minas Gerais MG">Minas Gerais (MG)</option>
                <option value="Rio Grande do Sul RS">Rio Grande do Sul (RS)</option>
                <option value="Espírito Santo ES">Espírito Santo (ES)</option>
              </select>
              <select
                value={batchLimit}
                onChange={(e) => setBatchLimit(Number(e.target.value))}
                className="w-20 rounded-xl border border-white/15 bg-black/50 px-2 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value={5}>+5</option>
                <option value={10}>+10</option>
                <option value={15}>+15</option>
              </select>
            </div>
          </div>

          {/* 4. Botão de Disparo */}
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
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Buscar &amp; Abastecer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Atalhos Rápidos de Segmentos para a Gofer Metais */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-[11px] font-mono text-zinc-400">
            Segmentos rápidos Gofer:
          </span>
          {[
            "Casas Modulares",
            "Fachadas",
            "Lajes",
            "Construtoras Steel Frame",
            "Estruturas Metálicas",
            "Galpões Industriais",
            "Fábricas de Contêineres",
          ].map((seg) => (
            <button
              key={seg}
              type="button"
              onClick={() => {
                setTargetSegment(seg);
                if (tabs.includes(seg)) setActiveTab(seg);
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
        </div>

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

      {/* PLANILHA IDÊNTICA AO PRINT DO GOOGLE SHEETS ("Imobiliário.") */}
      <div className="rounded-2xl border border-zinc-300 bg-white text-zinc-900 shadow-2xl overflow-hidden">
        {/* Barra de Topo Estilo Google Sheets */}
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
                Formato Oficial Google Sheets • Clique em qualquer célula para editar ou use o ícone de marca-texto para pintar a linha de amarelo
              </p>
            </div>
          </div>

          {/* Botões de Ação da Planilha */}
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
                  ? "Enviando ao Google Sheets..."
                  : "Abastecer Google Sheets Agora"}
              </span>
            </button>
          </div>
        </div>

        {/* Grade da Planilha com Cabeçalho Azul Marinho (#202b5b) Idêntico ao Print */}
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20">
              {/* Letras das Colunas igual ao Google Sheets (A, B, C, D, E, F) */}
              <tr className="bg-[#f8f9fa] border-b border-zinc-300 text-[11px] text-zinc-500 font-sans select-none">
                <th className="w-10 border-r border-zinc-300 py-1 text-center font-normal">
                  #
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[190px]">
                  A
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[140px]">
                  B
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[250px]">
                  C
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[165px]">
                  D
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal w-[190px]">
                  E
                </th>
                <th className="border-r border-zinc-300 py-1 text-center font-normal min-w-[260px]">
                  F
                </th>
                <th className="w-24 py-1 text-center font-normal">Ações</th>
              </tr>

              {/* Linha 1: Cabeçalho Azul Marinho (#202b5b) com Fonte Branca Negrito */}
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
                const cleanPhoneDigits = row.contato.replace(/\D/g, "");
                const whatsappHref =
                  cleanPhoneDigits.length >= 10
                    ? `https://wa.me/55${cleanPhoneDigits}`
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
                    {/* Número da Linha */}
                    <td className="bg-[#f8f9fa] border-r border-zinc-300 text-center text-[11px] text-zinc-500 select-none py-1.5">
                      {rowNumber}
                    </td>

                    {/* Coluna A: Empresa */}
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
                    </td>

                    {/* Coluna B: Responsável */}
                    <td className="border-r border-zinc-200 px-2 py-1">
                      <input
                        type="text"
                        value={row.responsavel}
                        onChange={(e) =>
                          updateCell(row.id, "responsavel", e.target.value)
                        }
                        placeholder=""
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
                        placeholder=""
                        className={`w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5 ${
                          row.email.includes("@")
                            ? "text-[#1155cc] underline"
                            : "text-zinc-900"
                        }`}
                      />
                    </td>

                    {/* Coluna D: Contato */}
                    <td className="border-r border-zinc-200 px-2 py-1">
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={row.contato}
                          onChange={(e) =>
                            updateCell(row.id, "contato", e.target.value)
                          }
                          placeholder=""
                          className="w-full bg-transparent text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5"
                        />
                        {whatsappHref && (
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chamar no WhatsApp"
                            className="text-emerald-600 hover:text-emerald-700 p-0.5 shrink-0"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Coluna E: Nível de Prospecção (Pílula Colorida igual ao Google Sheets) */}
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
                        placeholder=""
                        className="w-full bg-transparent text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5"
                      />
                    </td>

                    {/* Ações da Linha: Destacar em Amarelo (#ffff00), Enviar pro Kanban ou Excluir */}
                    <td className="px-2 py-1 text-center">
                      <div className="flex items-center justify-center gap-1">
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

        {/* Barra Inferior de Abas Idêntica ao Google Sheets (Casas Modulares | Fachadas | Lajes | +) */}
        <div className="flex items-center gap-1 bg-[#f1f3f4] border-t border-zinc-300 px-3 py-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setNewTabModalOpen(true)}
            title="Adicionar nova aba de prospecção"
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

      {/* MODAL PARA CRIAR NOVA ABA (SEGMENTO) */}
      {newTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0e1117] p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Nova Aba de Prospecção
              </h3>
              <button
                type="button"
                onClick={() => setNewTabModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Crie uma nova aba temática (ex: Galpões Metálicos, Telhados, Construtoras) para separar seus leads igual no Google Sheets.
            </p>
            <input
              type="text"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="Nome da nova aba..."
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

      {/* MODAL DE CONEXÃO DIRETA COM O GOOGLE SHEETS */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0b0e14] p-6 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Conectar Abastecimento Automático no Google Sheets
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

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Para o CRM escrever e formatar automaticamente dentro da sua planilha{" "}
                <strong className="text-white">Imobiliário.</strong> (com cabeçalho azul{" "}
                <code className="text-emerald-300">#202b5b</code>, dropdowns de{" "}
                <em>Nível de Prospecção</em> e linhas amarelas):
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                <li>
                  Abra sua planilha no Google Sheets e clique no menu superior em{" "}
                  <strong className="text-white">Extensões &rarr; Apps Script</strong>.
                </li>
                <li>
                  Apague o que estiver lá, cole o código abaixo e clique em{" "}
                  <strong className="text-white">Implantar &rarr; Nova implantação</strong>.
                </li>
                <li>
                  Escolha o tipo <strong className="text-white">App da Web</strong>, em{" "}
                  <em>Quem pode acessar</em> selecione{" "}
                  <strong className="text-emerald-300">Qualquer pessoa</strong> e copie a URL gerada.
                </li>
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Código Formatador Oficial (Apps Script)
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
                      <span>Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-black/70 p-3 text-[11px] font-mono text-zinc-300">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  URL da sua Planilha Google Sheets
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
                  URL do App da Web (Gerada no Apps Script)
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-xl border border-emerald-500/40 bg-black/60 px-3.5 py-2.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-black cursor-pointer"
              >
                Salvar Conexão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
