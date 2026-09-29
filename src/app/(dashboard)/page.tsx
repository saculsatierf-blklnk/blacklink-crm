import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Filter,
  Layers,
  PhoneCall,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { leads, socialContents } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { StartTourButton } from "@/components/tour/StartTourButton";

export default async function DashboardPage() {
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
      {/* Cabeçalho da Página Apple Glass */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Painel Executivo B2B
            </h1>
            {isTabulaRasa && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono font-semibold text-emerald-300">
                Tabula Rasa Ativa
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Monitoramento central de inteligência, pipeline de contas e esteira de conteúdos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StartTourButton variant="secondary" label="Tutorial Guiado" />
          <Link
            data-tour="dashboard-new-lead"
            href="/leads"
            className="flex h-9.5 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Lead</span>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Executivas Apple Glass */}
      <section data-tour="metrics-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Métrica 1: Leads Ativos */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-7 space-y-3.5 transition-all duration-300 hover:border-white/20 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold">Leads Ativos</span>
            <Users className="h-4 w-4 text-white" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-white font-mono">
              {totalLeads}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
              {totalLeads === 0 ? (
                <span>Nenhuma conta em esteira</span>
              ) : (
                <span className="text-emerald-400">
                  {inNegotiation} em prospecção ativa
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Métrica 2: Taxa de Conversão */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-7 space-y-3.5 transition-all duration-300 hover:border-white/20 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold">Taxa de Conversão</span>
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-white font-mono">
              {conversionRate}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
              {closedLeads === 0 ? (
                <span>0 fechamentos realizados</span>
              ) : (
                <span className="text-emerald-400">{closedLeads} contas fechadas</span>
              )}
            </div>
          </div>
        </div>

        {/* Métrica 3: Conteúdos em Esteira */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-7 space-y-3.5 transition-all duration-300 hover:border-white/20 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold">
              Conteúdos & Criativos
            </span>
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-white font-mono">
              {realContents.length} Peças
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
              <Clock className="h-3 w-3 text-zinc-500" />
              <span>{realContents.length === 0 ? "Fila editorial limpa" : "Em esteira editorial"}</span>
            </div>
          </div>
        </div>

        {/* Métrica 4: Pipeline Financeiro */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-7 space-y-3.5 transition-all duration-300 hover:border-white/20 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold">Pipeline Estimado</span>
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-white font-mono">
              {totalLeads === 0 ? "R$ 0,00" : "A Definir"}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
              <span>{totalLeads} contratos no radar</span>
            </div>
          </div>
        </div>
      </section>

      {/* TUTORIAL DE USABILIDADE DA PLATAFORMA (ONBOARDING EXECUTIVO APPLE GLASS) */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-10 space-y-8 shadow-2xl shadow-black/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white">
                Tutorial de Usabilidade da Plataforma
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Guia operacional passo a passo para dominar a máquina de conversão da Black Link.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StartTourButton variant="primary" label="Iniciar Tour Interativo" />
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Ambiente Pronto
            </span>
          </div>
        </div>

        {/* Grid de 4 Passos do Tutorial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Passo 1 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3.5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white bg-white/[0.08] px-2.5 py-1 rounded-full border border-white/15 font-semibold">
                Passo 01 &bull; Prospecção
              </span>
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Radar Anti-Colisão & Cadastro de Contas
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cadastre novos decisores corporativos com blindagem total. O sistema realiza varredura instantânea de e-mail e domínio corporativo para evitar que dois hunters abordem o mesmo lead. Inclui máscara com DDI internacional.
            </p>
            <div className="pt-2">
              <Link
                href="/leads"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:underline"
              >
                <span>Acessar Cadastro de Leads</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3.5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 font-semibold">
                Passo 02 &bull; Execução
              </span>
              <Layers className="h-4 w-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Cadência Temporal estilo Apple Tarefas
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cada conta possui uma esteira com 6 etapas operacionais estruturadas pelo tempo de entrada (Cold Call, E-mail, LinkedIn, Follow-up). Alterne entre as visões <strong>Hoje</strong>, <strong>Semanal</strong>, <strong>Mensal</strong> ou <strong>Cadeia Completa</strong> com checkboxes circulares no estilo iPhone.
            </p>
            <div className="pt-2">
              <Link
                href="/leads"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:underline"
              >
                <span>Visualizar Cadência no Kanban</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3.5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 font-semibold">
                Passo 03 &bull; Transição
              </span>
              <Calendar className="h-4 w-4 text-amber-300" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Agendamentos & Passagem de Bastão (Hand-off)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Agende reuniões diretamente no dossiê do lead. Ao selecionar um operador responsável diferente do usuário atual, o sistema sobrescreve a titularidade da conta, transferindo automaticamente o lead para o Closer.
            </p>
            <div className="pt-2">
              <span className="text-xs text-zinc-500">
                Disponível dentro do dossiê lateral de cada lead.
              </span>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3.5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30 font-semibold">
                Passo 04 &bull; Governança
              </span>
              <UserCheck className="h-4 w-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Gestão da Equipe & Permissões (RBAC)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Como Administrador, você pode cadastrar outros membros da equipe com perfis específicos: <strong>Comercial</strong> (focado em vendas e prospecção) ou <strong>Administrador</strong> (acesso completo à empresa). Novos operadores aparecem imediatamente no seletor de responsáveis.
            </p>
            <div className="pt-2">
              <span className="text-xs text-purple-300">
                Gerencie pelo botão &quot;Equipe&quot; no topo da página.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabelas de Gestão de Dados B2B Reais Apple Glass */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tabela de Leads Recentes */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 sm:p-8 space-y-6 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-white" />
              <h2 className="text-xs font-semibold uppercase tracking-widest font-mono text-white">
                Leads B2B da Organização
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {realLeads.length} registros
            </span>
          </div>

          {realLeads.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">
                  Tabula Rasa: Nenhuma conta cadastrada ainda
                </p>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                  Cadastre o seu primeiro lead para iniciar a telemetria preditiva, cadência de contatos e esteira de conversão.
                </p>
              </div>
              <Link
                href="/leads"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Cadastrar Primeiro Lead</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="pb-3 font-medium">EMPRESA / CONTATO</th>
                    <th className="pb-3 font-medium">ORIGEM</th>
                    <th className="pb-3 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white font-mono">
                  {realLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5">
                        <div className="font-semibold text-white font-sans text-xs">{lead.leadName}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{lead.leadEmail || "Sem e-mail"}</div>
                      </td>
                      <td className="py-3.5 text-zinc-400 text-[11px]">
                        {lead.origin || "Direto"}
                      </td>
                      <td className="py-3.5 text-right">
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

        {/* Tabela de Conteúdos e Aprovação */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-7 sm:p-8 space-y-6 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-white" />
              <h2 className="text-xs font-semibold uppercase tracking-widest font-mono text-white">
                Esteira de Conteúdos & Mídia
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Moderação Editorial</span>
          </div>

          {realContents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">Fila Editorial Limpa</p>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                  Nenhum conteúdo ou criativo aguardando moderação. Estruture novas publicações no módulo de marketing.
                </p>
              </div>
              <Link
                href="/marketing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
              >
                <span>Acessar Módulo de Marketing</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="pb-3 font-medium">TÍTULO DA PEÇA</th>
                    <th className="pb-3 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white font-mono">
                  {realContents.map((content) => (
                    <tr key={content.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 font-semibold text-white font-sans text-xs">
                        {content.title}
                      </td>
                      <td className="py-3.5 text-right">
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
