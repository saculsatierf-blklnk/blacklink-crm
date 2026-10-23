import { NextRequest, NextResponse } from "next/server";
import type { ExtractedSheetLead } from "../lead-extractor/route";

export const dynamic = "force-dynamic";

interface SheetsSyncRequestBody {
  webhookUrl?: string;
  spreadsheetId?: string;
  tabName: string;
  leads: ExtractedSheetLead[];
  replaceAllInTab?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: SheetsSyncRequestBody = await req.json();
    const webhookUrl = (
      body.webhookUrl ||
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      ""
    ).trim();
    const tabName = (body.tabName || "Casas Modulares").trim();
    const leads = Array.isArray(body.leads) ? body.leads : [];

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          needsSetup: true,
          error:
            "Cole a URL do Web App do Google Apps Script da sua planilha para sincronizar automaticamente.",
        },
        { status: 400 }
      );
    }

    const payload = {
      tabName,
      replaceAllInTab: Boolean(body.replaceAllInTab),
      rows: leads.map((l) => ({
        empresa: l.empresa || "",
        responsavel: l.responsavel || "",
        email: l.email || "",
        contato: l.contato || "",
        nivelProspeccao: l.nivelProspeccao || "Tentativa de contato",
        observacoes: l.observacoes || "",
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

    return NextResponse.json({
      success: true,
      tabName,
      syncedCount: leads.length,
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
