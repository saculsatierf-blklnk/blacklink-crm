import { desc } from "drizzle-orm";
import { Download, Filter } from "lucide-react";
import { db } from "@/db";
import { leads, type Lead } from "@/db/schema";
import { LeadsTable } from "@/components/leads/LeadsTable";

export const dynamic = "force-dynamic";

async function getLeads(): Promise<Lead[]> {
  try {
    const data = await db.select().from(leads).orderBy(desc(leads.createdAt));
    if (data && data.length > 0) {
      return data;
    }
  } catch (error) {
    // Modo de contingência e resiliência: utilizado caso a string externa do Postgres não esteja ativa
    console.warn(
      "Base de dados externa não conectada. Carregando dados de contingência corporativa."
    );
  }

  // Fallback de alta fidelidade com 3 leads fictícios
  return [
    {
      id: "l-a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      companyId: "c-0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      leadName: "Carlos Eduardo Mendes (Horizon Tech S.A.)",
      leadEmail: "carlos.mendes@horizontech.com.br",
      leadPhone: "+55 (11) 98765-4321",
      origin: "n8n / Webhook Automations",
      status: "negotiation",
      createdAt: new Date("2026-09-17T10:15:00Z"),
    },
    {
      id: "l-b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      companyId: "c-0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      leadName: "Mariana Alencar (Vanguard Logistics)",
      leadEmail: "m.alencar@vanguardlog.com",
      leadPhone: "+55 (21) 99887-1122",
      origin: "Inbound Enterprise",
      status: "new",
      createdAt: new Date("2026-09-17T11:42:00Z"),
    },
    {
      id: "l-c3d4e5f6-a78b-9c0d-1e2f-3a4b5c6d7e8f",
      companyId: "c-0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      leadName: "Roberto Silveira (Apex Capital Holding)",
      leadEmail: "roberto@apexcapital.io",
      leadPhone: "+55 (11) 97123-8899",
      origin: "Campanhas B2B / LinkedIn",
      status: "closed",
      createdAt: new Date("2026-09-16T17:30:00Z"),
    },
  ];
}

export default async function LeadsPage() {
  const leadsData = await getLeads();

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-platinum">
              Leads B2B
            </h1>
            <span className="rounded-full border border-glass-border bg-carbon-muted px-2.5 py-0.5 text-[11px] font-mono text-platinum">
              {leadsData.length} registros
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Gestão executiva de contas e oportunidades qualificadas injetadas no ecossistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-9 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-3 text-xs text-sub hover:text-platinum transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtros</span>
          </button>
          <button className="flex h-9 items-center gap-1.5 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer shadow-md">
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Tabela de Leads */}
      <LeadsTable leads={leadsData} />
    </div>
  );
}
