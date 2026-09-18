import { desc } from "drizzle-orm";
import { Filter, PenTool, Plus } from "lucide-react";
import { db } from "@/db";
import { socialContents, type SocialContent } from "@/db/schema";
import { ContentsTable } from "@/components/contents/ContentsTable";

export const dynamic = "force-dynamic";

async function getContents(): Promise<SocialContent[]> {
  try {
    const data = await db
      .select()
      .from(socialContents)
      .orderBy(desc(socialContents.createdAt));

    if (data && data.length > 0) {
      return data;
    }
  } catch (error) {
    // Modo de contingência e resiliência: utilizado caso a base externa do Postgres não esteja conectada
    console.warn(
      "Base de dados externa não conectada. Carregando dados de contingência para esteira editorial."
    );
  }

  // Fallback de alta fidelidade focado em marketing B2B de alta conversão
  return [
    {
      id: "c-11111111-2222-3333-4444-555555555555",
      companyId: "c-0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      title: "Dossiê Estratégico: O Impacto da Automação na Redução do CAC B2B",
      copyText:
        "Análise técnica demonstrando como a unificação de pipelines de dados e fluxos de qualificação automatizados reduzem o ciclo de fechamento comercial em até 40% em contas corporativas de tecnologia.",
      status: "pending",
      createdAt: new Date("2026-09-17T09:30:00Z"),
    },
    {
      id: "c-22222222-3333-4444-5555-666666666666",
      companyId: "c-0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      title: "Case Enterprise: Modernização de Infraestrutura Digital e Escala",
      copyText:
        "Estudo de caso detalhando a transição de um ecossistema operacional para uma arquitetura moderna orientada a microsserviços e isolamento multi-tenant de alta performance.",
      status: "approved",
      createdAt: new Date("2026-09-16T15:45:00Z"),
    },
    {
      id: "c-33333333-4444-5555-6666-777777777777",
      companyId: "c-0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      title: "Framework de Conversão: Nutrição Baseada em Gatilhos de Intenção",
      copyText:
        "Estratégia prática para equipes comerciais capturarem sinais de interesse em contas corporativas antes do primeiro contato direto, elevando as taxas de conversão no funil.",
      status: "draft",
      createdAt: new Date("2026-09-15T18:20:00Z"),
    },
  ];
}

export default async function ConteudosPage() {
  const contentsData = await getContents();

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-platinum">
              Conteúdos
            </h1>
            <span className="rounded-full border border-glass-border bg-carbon-muted px-2.5 py-0.5 text-[11px] font-mono text-platinum">
              {contentsData.length} publicações
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Gestão editorial, moderação de copies e esteira de publicações estratégicas B2B.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-9 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-3 text-xs text-sub hover:text-platinum transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtrar Status</span>
          </button>
          <button className="flex h-9 items-center gap-1.5 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer shadow-md">
            <Plus className="h-3.5 w-3.5" />
            <span>Nova Publicação</span>
          </button>
        </div>
      </div>

      {/* Tabela de Conteúdos */}
      <ContentsTable contents={contentsData} />
    </div>
  );
}
