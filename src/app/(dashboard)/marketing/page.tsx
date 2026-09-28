import { Sparkles, Megaphone, Zap } from "lucide-react";
import { CreativeGeneratorForm } from "@/components/marketing/CreativeGeneratorForm";
import { CreativeAssetViewer } from "@/components/marketing/CreativeAssetViewer";
import { AdPerformanceTable } from "@/components/marketing/AdPerformanceTable";

export const metadata = {
  title: "Marketing & Criativos Autônomos • Black Link CRM",
  description:
    "Geração autônoma de criativos B2B (carrosséis, stories e posts) integrada a automações n8n e pipeline de tráfego pago.",
};

export default function MarketingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho do Módulo de Marketing */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-platinum">
              Marketing & Criativos Autônomos
            </h1>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-mono text-accent font-semibold">
              Pipeline n8n Ativo
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Geração de criativos estratégicos (Carrosséis, Stories e Posts) integrada a tráfego pago e automações de escala.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-md border border-glass-border bg-carbon px-3 py-1.5 text-xs font-mono text-sub flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agente de Geração Pronto</span>
          </div>
        </div>
      </div>

      {/* ÁREA SUPERIOR: DIVISÃO EM DUAS COLUNAS (SPLIT VIEW) */}
      {/* Esquerda: Configuração e Parâmetros da Campanha | Direita: Visualização de Ativos & Copywriting */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-5">
          <CreativeGeneratorForm />
        </div>

        <div className="xl:col-span-7">
          <CreativeAssetViewer />
        </div>
      </div>

      {/* ÁREA INFERIOR: INTERFACE DO AGENTE DE TRÁFEGO PAGO */}
      <div className="pt-2">
        <AdPerformanceTable />
      </div>
    </div>
  );
}
