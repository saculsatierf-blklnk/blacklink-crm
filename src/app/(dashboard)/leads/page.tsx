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
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Cabeçalho do Módulo Apple Glass */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white">
              Leads B2B
            </h1>
            <span className="rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              {leadsData.length} contas
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-400 mt-2 leading-relaxed">
            Gestão executiva de contas e oportunidades qualificadas injetadas no ecossistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-9.5 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtros</span>
          </button>
          <button className="flex h-9.5 items-center gap-2 rounded-xl bg-white px-4.5 text-xs font-semibold text-black transition-all hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]">
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
