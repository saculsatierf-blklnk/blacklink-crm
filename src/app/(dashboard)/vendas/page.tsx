import { cookies } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { leads, companies, type Lead } from "@/db/schema";
import { LeadsKanban } from "@/components/leads/LeadsKanban";
import { getCompanyOperatorsAction } from "@/actions/leads";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vendas B2B & Pipeline Comercial • Black Link CRM",
  description: "Pipeline comercial de alta fidelidade, cadência temporal de prospecção e dossiê executivo lateral.",
};

async function getLeads(companyId?: string): Promise<Lead[]> {
  try {
    if (!companyId) {
      // Se não há empresa na sessão, retorna lista vazia (limpa)
      return [];
    }
    const data = await db
      .select()
      .from(leads)
      .where(eq(leads.companyId, companyId))
      .orderBy(desc(leads.createdAt));
    return data;
  } catch (error) {
    console.warn("Base de dados externa não conectada. Retornando lista limpa.");
    return [];
  }
}

async function getCompanyName(companyId?: string): Promise<string> {
  if (!companyId) return "Gofer Metais";
  try {
    const [comp] = await db
      .select({ corporateName: companies.corporateName })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);
    return comp?.corporateName || "Gofer Metais";
  } catch {
    return "Gofer Metais";
  }
}

export default async function VendasPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("blacklink_session")?.value;
  let session: {
    id: string;
    company_id: string;
    role: "admin" | "commercial";
    name: string;
    email: string;
  } | null = null;

  if (sessionToken) {
    try {
      session = JSON.parse(Buffer.from(sessionToken, "base64url").toString("utf-8"));
    } catch {}
  }

  const [leadsData, operators, companyName] = await Promise.all([
    getLeads(session?.company_id),
    getCompanyOperatorsAction(),
    getCompanyName(session?.company_id),
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Cabeçalho do Pipeline de Vendas Apple Glass */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white font-heading">
              Pipeline de Vendas B2B
            </h1>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-mono tracking-widest text-emerald-400 font-semibold uppercase">
              {companyName}
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.08] px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              {leadsData.length} {leadsData.length === 1 ? "conta" : "contas"}
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-400 mt-1.5 leading-relaxed font-sans">
            Gestão executiva de contas corporativas da {companyName} com telemetria, cadência de abordagem e carteira individual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-xs font-mono text-zinc-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Radar Anti-Colisão Ativo</span>
          </div>
        </div>
      </div>

      {/* Board Kanban de Leads B2B com Slide-over Lateral sem Reload */}
      <LeadsKanban
        initialLeads={leadsData}
        initialOperators={operators}
        currentUser={session}
        companyName={companyName}
      />
    </div>
  );
}
