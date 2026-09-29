import { MarketingTabsWrapper } from "@/components/marketing/MarketingTabsWrapper";

export const metadata = {
  title: "Marketing, Cronograma & Criativos Autônomos • Black Link CRM",
  description:
    "Geração autônoma de criativos B2B, cronograma de aprovação multi-tenant e orquestração de tráfego pago integrada à Meta Graph API.",
};

export default function MarketingPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho Oficial do Módulo de Marketing Apple Glass */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Marketing & Criativos Autônomos
            </h1>
            <span className="rounded-full border border-white/20 bg-white/[0.08] px-3 py-0.5 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Pipeline n8n & Meta Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Geração de criativos estratégicos (Carrosséis, Stories e Posts), cronograma de aprovação e escala de tráfego pago.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-mono text-zinc-300 flex items-center gap-2.5 shadow-sm">
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
