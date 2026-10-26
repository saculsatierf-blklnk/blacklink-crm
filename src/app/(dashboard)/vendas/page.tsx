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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho Editorial na estética irvo.com.br */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#2e2e2e] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex h-6 items-center rounded-full bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 text-xs font-semibold text-white">
              {companyName}
            </span>
            <span className="inline-flex h-6 items-center rounded-full bg-[#0f1b33] px-3 text-xs font-semibold text-[#7fa9f7] tabular-nums">
              {leadsData.length} {leadsData.length === 1 ? "conta ativa" : "contas ativas"}
            </span>
          </div>
          <h1 className="mt-3 text-3xl lg:text-4xl font-semibold tracking-[-0.035em] text-white leading-[1.08]">
            Operação Comercial &amp; Inteligência de Prospecção
          </h1>
          <p className="text-sm text-[#afafaf] mt-2 max-w-2xl leading-relaxed">
            Mapeamento de nichos, cadência semanal de segunda a sexta e abastecimento direto da planilha oficial sem duplicidade.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3.5 py-2 text-xs font-medium text-[#afafaf] flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#14d06e]" />
            <span>Trava anti-duplicidade ativa</span>
          </div>
        </div>
      </div>

      {/* Board Kanban & Data Warehouse */}
      <LeadsKanban
        initialLeads={leadsData}
        initialOperators={operators}
        currentUser={session}
        companyName={companyName}
      />
    </div>
  );
}
