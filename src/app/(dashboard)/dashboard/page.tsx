import { cookies } from "next/headers";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { db } from "@/db";
import { leads, socialContents } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { StartTourButton } from "@/components/tour/StartTourButton";

export const metadata = {
  title: "Dashboard Executivo • Black Link CRM Enterprise",
  description: "Cockpit executivo consolidado com KPIs em tempo real, telemetria preditiva e feed cronológico.",
};

export default async function DashboardCockpitPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("blacklink_session")?.value;

  let companyId: string | null = null;
  let userName = "Operador";
  let userRole = "admin";

  if (sessionToken) {
    try {
      const decoded = JSON.parse(
        Buffer.from(sessionToken, "base64url").toString("utf-8")
      );
      companyId = decoded.company_id || null;
      userName = decoded.name || "Operador";
      userRole = decoded.role || "admin";
    } catch {}
  }

  // Busca de dados reais da organização no PostgreSQL
  let realLeads: (typeof leads.$inferSelect)[] = [];
  let realContents: (typeof socialContents.$inferSelect)[] = [];

  if (companyId) {
    try {
      realLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.companyId, companyId))
        .orderBy(desc(leads.createdAt))
        .limit(10);

      realContents = await db
        .select()
        .from(socialContents)
        .where(eq(socialContents.companyId, companyId))
        .orderBy(desc(socialContents.createdAt))
        .limit(5);
    } catch (err) {
      console.warn("Falha ao carregar dados do dashboard do tenant:", err);
    }
  }

  const totalLeads = realLeads.length;
  const closedLeads = realLeads.filter((l) => l.status === "closed").length;
  const inNegotiation = realLeads.filter((l) => l.status === "negotiation").length;
  const conversionRate =
    totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) + "%" : "0.0%";

  const isTabulaRasa = totalLeads === 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Cabeçalho do Cockpit Executivo Glassmorphism */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white font-heading">
              Cockpit Executivo B2B
            </h1>
            {isTabulaRasa ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[10px] font-mono font-semibold text-amber-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Tabula Rasa (Novo Tenant)
              </span>
            ) : (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Telemetria em Tempo Real
              </span>
            )}
          </div>
          <p className="text-xs lg:text-sm text-zinc-400 mt-1.5 leading-relaxed font-sans">
            Visão consolidada de oportunidades corporativas, métricas de conversão e esteira operacional.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StartTourButton variant="secondary" label="Tutorial Guiado" />
          <Link
            data-tour="dashboard-new-lead"
            href="/vendas"
            className="flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-black transition-all hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Lead B2B</span>
          </Link>
        </div>
      </div>

      {/* Grid de KPIs em Tempo Real */}
      <section data-tour="metrics-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Contas no Radar */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.04]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
                Contas no Radar
              </span>
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold tracking-tight text-white font-mono">
                {totalLeads}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                {totalLeads === 0 ? (
                  <span>Nenhuma conta em esteira</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {inNegotiation} em prospecção ativa
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: Taxa de Conversão */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.04]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
                Conversão Fechada
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold tracking-tight text-white font-mono">
                {conversionRate}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                {closedLeads === 0 ? (
                  <span>0 contratos assinados</span>
                ) : (
                  <span className="text-emerald-400">{closedLeads} contas ganhas</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Criativos em Esteira */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.04]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
                Criativos &amp; Peças
              </span>
              <FileText className="h-4 w-4 text-sky-400" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold tracking-tight text-white font-mono">
                {realContents.length}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                <Clock className="h-3 w-3 text-zinc-500" />
                <span>{realContents.length === 0 ? "Fila editorial limpa" : "Em esteira editorial"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4: Telemetria de Pipeline */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.04]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
                Pipeline Financeiro
              </span>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold tracking-tight text-white font-mono">
                {totalLeads === 0 ? "R$ 0,00" : `R$ ${(totalLeads * 12500).toLocaleString("pt-BR")}`}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                <span>{totalLeads} oportunidades ativas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESTADO VAZIO ESTRUTURADO (TABULA RASA) COM ONBOARDING CLARO */}
      {isTabulaRasa && (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 p-8 lg:p-10 shadow-2xl backdrop-blur-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white font-heading">
                  Primeiros Passos: Onboarding do Tenant Black Link
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Seu ambiente corporativo está pronto. Complete os 3 passos fundamentais para acelerar seu pipeline B2B.
                </p>
              </div>
            </div>

            <Link
              href="/vendas"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all shadow-md self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Primeiro Lead</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Onboarding Passo 1 */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-3.5 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                  Etapa 01
                </span>
                <Target className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight font-heading">
                Cadastrar Oportunidades &amp; Contas
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Adicione empresas alvo e decisores com verificação de duplicidade instantânea e máscara telefônica internacional.
              </p>
              <Link
                href="/vendas"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:underline pt-1"
              >
                <span>Ir para Vendas B2B</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Onboarding Passo 2 */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-3.5 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/30 font-bold">
                  Etapa 02
                </span>
                <Sparkles className="h-4 w-4 text-sky-400" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight font-heading">
                Gerar Carrosséis no Estúdio de IA
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Co-crie carrosséis de 1080px de alto impacto institucional com renderização instantânea a 60fps e download direto.
              </p>
              <Link
                href="/estudio"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300 hover:underline pt-1"
              >
                <span>Acessar Estúdio de IA</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Onboarding Passo 3 */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-3.5 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 font-bold">
                  Etapa 03
                </span>
                <UserCheck className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight font-heading">
                Configurar Equipe &amp; Brand Memory
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Convide operadores com perfis Comercial ou Administrador e defina a identidade de marca e tom de voz da IA.
              </p>
              <Link
                href="/configuracoes"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:underline pt-1"
              >
                <span>Acessar Configurações</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FEED CRONOLÓGICO DE ATIVIDADES E CONTAS DO TENANT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feed Cronológico de Contas B2B */}
        <section className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-7 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-white" />
              <h2 className="text-lg font-semibold tracking-tight text-white font-heading">
                Feed de Contas &amp; Pipeline
              </h2>
            </div>
            <Link
              href="/vendas"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <span>Ver Kanban Completo</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {realLeads.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-white">Nenhum registro ainda</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                Assim que você adicionar leads no módulo de vendas, o histórico cronológico de interações aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-wider bg-white/[0.02]">
                    <th className="py-3 px-4 font-medium">EMPRESA / CONTATO</th>
                    <th className="py-3 px-4 font-medium">ORIGEM</th>
                    <th className="py-3 px-4 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white font-mono">
                  {realLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white font-sans text-xs">{lead.leadName}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{lead.leadEmail || "Sem e-mail cadastrado"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                        {lead.origin || "Direto"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10px] text-white">
                          {lead.status === "closed"
                            ? "Fechado"
                            : lead.status === "negotiation"
                            ? "Em Prospecção"
                            : "Novo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Feed de Criativos e Esteira Editorial */}
        <section className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-7 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-white" />
              <h2 className="text-lg font-semibold tracking-tight text-white font-heading">
                Esteira de Criativos &amp; Publicações
              </h2>
            </div>
            <Link
              href="/estudio"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <span>Abrir Estúdio</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {realContents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-white">Nenhum criativo em esteira</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                Crie lâminas de carrossel ou aprove campanhas para visualizar a esteira editorial em tempo real.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-wider bg-white/[0.02]">
                    <th className="py-3 px-4 font-medium">TÍTULO DA PEÇA</th>
                    <th className="py-3 px-4 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white font-mono">
                  {realContents.map((content) => (
                    <tr key={content.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white font-sans text-xs">
                        {content.title}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] text-amber-300">
                          {content.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
