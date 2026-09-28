import { MarketingTabsWrapper } from "@/components/marketing/MarketingTabsWrapper";

export const metadata = {
  title: "Marketing, Cronograma & Criativos Autônomos • Black Link CRM",
  description:
    "Geração autônoma de criativos B2B, cronograma de aprovação multi-tenant e orquestração de tráfego pago integrada à Meta Graph API.",
};

export default function MarketingPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho Oficial do Módulo de Marketing */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-platinum">
              Marketing & Criativos Autônomos
            </h1>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-mono text-accent font-semibold">
              Pipeline n8n & Meta Ready
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Geração de criativos estratégicos (Carrosséis, Stories e Posts), cronograma de aprovação e escala de tráfego pago.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-md border border-glass-border bg-carbon px-3 py-1.5 text-xs font-mono text-sub flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mesa de Aprovação Ativa</span>
          </div>
        </div>
      </div>

      {/* Conteúdo com Alternância entre Estúdio de Geração e Cronograma */}
      <MarketingTabsWrapper />
    </div>
  );
}
