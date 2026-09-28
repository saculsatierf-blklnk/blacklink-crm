import { desc } from "drizzle-orm";
import { Download, Filter } from "lucide-react";
import { db } from "@/db";
import { leads, type Lead } from "@/db/schema";
import { LeadsKanban } from "@/components/leads/LeadsKanban";
import { getCompanyOperatorsAction } from "@/actions/leads";

export const dynamic = "force-dynamic";

async function getLeads(): Promise<Lead[]> {
  try {
    const data = await db.select().from(leads).orderBy(desc(leads.createdAt));
    return data;
  } catch (error) {
    console.warn("Base de dados externa não conectada. Retornando lista limpa.");
    return [];
  }
}

export default async function LeadsPage() {
  const [leadsData, operators] = await Promise.all([
    getLeads(),
    getCompanyOperatorsAction(),
  ]);

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

      {/* Board Kanban de Leads B2B */}
      <LeadsKanban initialLeads={leadsData} initialOperators={operators} />
    </div>
  );
}
