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

  // Busca de dados reais da organização no PostgreSQL (Tabula Rasa dinâmica)
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
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-platinum">
              Painel Executivo B2B
            </h1>
            {isTabulaRasa && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                Tabula Rasa Ativa
              </span>
            )}
          </div>
          <p className="text-xs text-sub">
            Monitoramento central de inteligência, pipeline de contas e esteira de conteúdos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="flex h-9 items-center gap-1.5 rounded-md bg-accent px-3.5 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Lead</span>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Executivas Reais */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Métrica 1: Leads Ativos */}
        <div className="rounded-xl border border-glass-border bg-carbon p-6 space-y-3 transition-all hover:border-glass-highlight">
          <div className="flex items-center justify-between text-sub">
            <span className="text-xs font-mono uppercase tracking-wider">Leads Ativos</span>
            <Users className="h-4 w-4 text-platinum" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-platinum font-mono">
              {totalLeads}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-sub font-mono">
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
        <div className="rounded-xl border border-glass-border bg-carbon p-6 space-y-3 transition-all hover:border-glass-highlight">
          <div className="flex items-center justify-between text-sub">
            <span className="text-xs font-mono uppercase tracking-wider">Taxa de Conversão</span>
            <TrendingUp className="h-4 w-4 text-platinum" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-platinum font-mono">
              {conversionRate}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-sub font-mono">
              {closedLeads === 0 ? (
                <span>0 fechamentos realizados</span>
              ) : (
                <span className="text-emerald-400">{closedLeads} contas fechadas</span>
              )}
            </div>
          </div>
        </div>

        {/* Métrica 3: Conteúdos em Esteira */}
        <div className="rounded-xl border border-glass-border bg-carbon p-6 space-y-3 transition-all hover:border-glass-highlight">
          <div className="flex items-center justify-between text-sub">
            <span className="text-xs font-mono uppercase tracking-wider">
              Conteúdos & Criativos
            </span>
            <FileText className="h-4 w-4 text-platinum" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-platinum font-mono">
              {realContents.length} Peças
            </div>
            <div className="flex items-center gap-1 text-[11px] text-sub font-mono">
              <Clock className="h-3 w-3 text-sub" />
              <span>{realContents.length === 0 ? "Fila editorial limpa" : "Em esteira editorial"}</span>
            </div>
          </div>
        </div>

        {/* Métrica 4: Pipeline Financeiro */}
        <div className="rounded-xl border border-glass-border bg-carbon p-6 space-y-3 transition-all hover:border-glass-highlight">
          <div className="flex items-center justify-between text-sub">
            <span className="text-xs font-mono uppercase tracking-wider">Pipeline Estimado</span>
            <BarChart3 className="h-4 w-4 text-platinum" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-platinum font-mono">
              {totalLeads === 0 ? "R$ 0,00" : "A Definir"}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-sub font-mono">
              <span>{totalLeads} contratos no radar</span>
            </div>
          </div>
        </div>
      </section>

      {/* TUTORIAL DE USABILIDADE DA PLATAFORMA (ONBOARDING EXECUTIVO) */}
      <section className="rounded-xl border border-glass-border bg-carbon p-6 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-glass-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-void">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
                Tutorial de Usabilidade da Plataforma
              </h2>
              <p className="text-xs text-sub">
                Guia operacional passo a passo para dominar a máquina de conversão da Black Link.
              </p>
            </div>
          </div>
          <span className="rounded bg-accent/10 border border-accent/20 px-2 py-1 text-[11px] font-mono text-accent shrink-0">
            Ambiente Pronto para Operação
          </span>
        </div>

        {/* Grid de 4 Passos do Tutorial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Passo 1 */}
          <div className="rounded-xl border border-glass-border bg-void/60 p-5 space-y-3 hover:border-glass-highlight transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent bg-carbon px-2 py-0.5 rounded border border-glass-border">
                Passo 01 &bull; Prospecção
              </span>
              <ShieldCheck className="h-4 w-4 text-accent" />
            </div>
            <h3 className="text-xs font-bold text-platinum">
              Radar Anti-Colisão & Cadastro de Contas
            </h3>
            <p className="text-xs text-sub leading-relaxed">
              Cadastre novos decisores corporativos com blindagem total. O sistema realiza varredura instantânea de e-mail e domínio corporativo para evitar que dois hunters abordem o mesmo lead. Inclui máscara com DDI internacional.
            </p>
            <div className="pt-2">
              <Link
                href="/leads"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline"
              >
                <span>Acessar Cadastro de Leads</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="rounded-xl border border-glass-border bg-void/60 p-5 space-y-3 hover:border-glass-highlight transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-carbon px-2 py-0.5 rounded border border-glass-border">
                Passo 02 &bull; Execução
              </span>
              <Layers className="h-4 w-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-platinum">
              Cadência Temporal estilo Apple Tarefas
            </h3>
            <p className="text-xs text-sub leading-relaxed">
              Cada conta possui uma esteira com 6 etapas operacionais estruturadas pelo tempo de entrada (Cold Call, E-mail, LinkedIn, Follow-up). Alterne entre as visões <strong>Hoje</strong>, <strong>Semanal</strong>, <strong>Mensal</strong> ou <strong>Cadeia Completa</strong> com checkboxes circulares no estilo iPhone.
            </p>
            <div className="pt-2">
              <Link
                href="/leads"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline"
              >
                <span>Visualizar Cadência no Kanban</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="rounded-xl border border-glass-border bg-void/60 p-5 space-y-3 hover:border-glass-highlight transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 bg-carbon px-2 py-0.5 rounded border border-glass-border">
                Passo 03 &bull; Transição
              </span>
              <Calendar className="h-4 w-4 text-amber-300" />
            </div>
            <h3 className="text-xs font-bold text-platinum">
              Agendamentos & Passagem de Bastão (Hand-off)
            </h3>
            <p className="text-xs text-sub leading-relaxed">
              Agende reuniões diretamente no dossiê do lead. Ao selecionar um operador responsável diferente do usuário atual, o sistema sobrescreve a titularidade da conta, transferindo automaticamente o lead para o Closer.
            </p>
            <div className="pt-2">
              <span className="text-xs font-mono text-sub">
                Disponível dentro do dossiê lateral de cada lead.
              </span>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="rounded-xl border border-glass-border bg-void/60 p-5 space-y-3 hover:border-glass-highlight transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-carbon px-2 py-0.5 rounded border border-glass-border">
                Passo 04 &bull; Governança
              </span>
              <UserCheck className="h-4 w-4 text-purple-400" />
            </div>
            <h3 className="text-xs font-bold text-platinum">
              Gestão da Equipe & Permissões (RBAC)
            </h3>
            <p className="text-xs text-sub leading-relaxed">
              Como Administrador, você pode cadastrar outros membros da equipe com perfis específicos: <strong>Comercial</strong> (focado em vendas e prospecção) ou <strong>Administrador</strong> (acesso completo à empresa). Novos operadores aparecem imediatamente no seletor de responsáveis.
            </p>
            <div className="pt-2">
              <span className="text-xs font-mono text-purple-400">
                Gerencie pelo botão &quot;Equipe&quot; no topo da página.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabelas de Gestão de Dados B2B Reais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela de Leads Recentes */}
        <section className="rounded-xl border border-glass-border bg-carbon p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-glass-border pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-platinum" />
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-platinum">
                Leads B2B da Organização
              </h2>
            </div>
            <span className="text-[10px] font-mono text-sub">
              {realLeads.length} registros
            </span>
          </div>

          {realLeads.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-void text-sub">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-platinum">
                  Tabula Rasa: Nenhuma conta cadastrada ainda
                </p>
                <p className="text-[11px] text-sub max-w-sm mx-auto">
                  Cadastre o seu primeiro lead para iniciar a telemetria preditiva, cadência de contatos e esteira de conversão.
                </p>
              </div>
              <Link
                href="/leads"
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-void hover:bg-accent-hover transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Cadastrar Primeiro Lead</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-glass-border text-sub font-mono">
                    <th className="pb-2.5 font-medium">EMPRESA / CONTATO</th>
                    <th className="pb-2.5 font-medium">ORIGEM</th>
                    <th className="pb-2.5 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40 text-platinum">
                  {realLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-carbon-muted/40 transition-colors">
                      <td className="py-3">
                        <div className="font-medium text-platinum">{lead.leadName}</div>
                        <div className="text-[11px] text-sub">{lead.leadEmail || "Sem e-mail"}</div>
                      </td>
                      <td className="py-3 font-mono text-sub text-[11px]">
                        {lead.origin || "Direto"}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-platinum">
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
        <section className="rounded-xl border border-glass-border bg-carbon p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-glass-border pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-platinum" />
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-platinum">
                Esteira de Conteúdos & Mídia
              </h2>
            </div>
            <span className="text-[10px] font-mono text-sub">Moderação Editorial</span>
          </div>

          {realContents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-void text-sub">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-platinum">Fila Editorial Limpa</p>
                <p className="text-[11px] text-sub max-w-sm mx-auto">
                  Nenhum conteúdo ou criativo aguardando moderação. Estruture novas publicações no módulo de conteúdo.
                </p>
              </div>
              <Link
                href="/conteudos"
                className="inline-flex items-center gap-1.5 rounded-md border border-glass-border bg-carbon-muted px-3 py-1.5 text-xs font-semibold text-platinum hover:border-accent/40 transition-colors"
              >
                <span>Acessar Módulo de Conteúdo</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-glass-border text-sub font-mono">
                    <th className="pb-2.5 font-medium">TÍTULO DA PEÇA</th>
                    <th className="pb-2.5 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40 text-platinum">
                  {realContents.map((content) => (
                    <tr key={content.id} className="hover:bg-carbon-muted/40 transition-colors">
                      <td className="py-3 font-medium text-platinum">
                        {content.title}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">
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
