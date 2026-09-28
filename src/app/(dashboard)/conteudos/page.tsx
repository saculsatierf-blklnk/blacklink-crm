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

    return data;
  } catch (error) {
    console.warn("Base de dados externa não conectada.");
    return [];
  }
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
