import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-platinum">
            Painel Executivo B2B
          </h1>
          <p className="text-xs text-sub">
            Monitoramento central de inteligência de dados, conversão de contas e esteira de conteúdos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-9 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-3 text-xs text-sub hover:text-platinum transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtrar Período</span>
          </button>
          <button className="flex h-9 items-center gap-1.5 rounded-md bg-accent px-3.5 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Registro</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas Executivas */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Métrica 1: Leads Ativos */}
        <div className="rounded-xl border border-glass-border bg-carbon p-6 space-y-3 transition-all hover:border-glass-highlight">
          <div className="flex items-center justify-between text-sub">
            <span className="text-xs font-mono uppercase tracking-wider">Leads Ativos</span>
            <Users className="h-4 w-4 text-platinum" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-platinum font-mono">
              312
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ArrowUpRight className="h-3 w-3" />
              <span>+18 novas contas esta semana</span>
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
              32.8%
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ArrowUpRight className="h-3 w-3" />
              <span>+4.2% acima da meta trimestral</span>
            </div>
          </div>
        </div>

        {/* Métrica 3: Conteúdos Aguardando Aprovação */}
        <div className="rounded-xl border border-glass-border bg-carbon p-6 space-y-3 transition-all hover:border-glass-highlight">
          <div className="flex items-center justify-between text-sub">
            <span className="text-xs font-mono uppercase tracking-wider">
              Aguardando Aprovação
            </span>
            <FileText className="h-4 w-4 text-platinum" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-platinum font-mono">
              14 Peças
            </div>
            <div className="flex items-center gap-1 text-[11px] text-sub font-mono">
              <Clock className="h-3 w-3 text-sub" />
              <span>Fila editorial ativa no funil</span>
            </div>
          </div>
        </div>

        {/* Métrica 4: Receita Projetada */}
        <div className="rounded-xl border border-glass-border bg-carbon p-6 space-y-3 transition-all hover:border-glass-highlight">
          <div className="flex items-center justify-between text-sub">
            <span className="text-xs font-mono uppercase tracking-wider">Pipeline Financeiro</span>
            <BarChart3 className="h-4 w-4 text-platinum" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-semibold tracking-tight text-platinum font-mono">
              R$ 2.450.000
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ArrowUpRight className="h-3 w-3" />
              <span>48 contratos corporativos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabelas de Gestão de Dados B2B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela de Leads Recentes */}
        <section className="rounded-xl border border-glass-border bg-carbon p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-glass-border pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-platinum" />
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-platinum">
                Leads B2B em Negociação
              </h2>
            </div>
            <span className="text-[10px] font-mono text-sub">Últimas 24h</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-glass-border text-sub font-mono">
                  <th className="pb-2.5 font-medium">EMPRESA / CONTATO</th>
                  <th className="pb-2.5 font-medium">VALOR</th>
                  <th className="pb-2.5 font-medium text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40 text-platinum">
                <tr className="hover:bg-carbon-muted/40 transition-colors">
                  <td className="py-3">
                    <div className="font-medium text-platinum">Nexus Data Systems</div>
                    <div className="text-[11px] text-sub">diretoria@nexusdata.io</div>
                  </td>
                  <td className="py-3 font-mono text-platinum">R$ 180.000</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-platinum">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                      Negociação
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-carbon-muted/40 transition-colors">
                  <td className="py-3">
                    <div className="font-medium text-platinum">Atlas Logística Global</div>
                    <div className="text-[11px] text-sub">comercial@atlaslog.com.br</div>
                  </td>
                  <td className="py-3 font-mono text-platinum">R$ 340.000</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-accent">
                      <CheckCircle2 className="h-2.5 w-2.5 text-accent" />
                      Fechamento
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-carbon-muted/40 transition-colors">
                  <td className="py-3">
                    <div className="font-medium text-platinum">Vanguard Health Tech</div>
                    <div className="text-[11px] text-sub">operacoes@vanguardhealth.com</div>
                  </td>
                  <td className="py-3 font-mono text-platinum">R$ 520.000</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-platinum">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                      Negociação
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-glass-border text-sub font-mono">
                  <th className="pb-2.5 font-medium">TÍTULO DA PEÇA</th>
                  <th className="pb-2.5 font-medium">AUTOR / CARGO</th>
                  <th className="pb-2.5 font-medium text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40 text-platinum">
                <tr className="hover:bg-carbon-muted/40 transition-colors">
                  <td className="py-3">
                    <div className="font-medium text-platinum">Estudo de Caso: Arquitetura SaaS B2B</div>
                    <div className="text-[11px] text-sub">Copy Estratégica &bull; LinkedIn</div>
                  </td>
                  <td className="py-3 text-sub">Redação Enterprise</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                      <Clock className="h-2.5 w-2.5 text-amber-300" />
                      Aguardando Aprovação
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-carbon-muted/40 transition-colors">
                  <td className="py-3">
                    <div className="font-medium text-platinum">Análise de Métricas de Retenção Q3</div>
                    <div className="text-[11px] text-sub">Newsletter Corporativa</div>
                  </td>
                  <td className="py-3 text-sub">Growth & Data Team</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-platinum">
                      <CheckCircle2 className="h-2.5 w-2.5 text-platinum" />
                      Aprovado
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-carbon-muted/40 transition-colors">
                  <td className="py-3">
                    <div className="font-medium text-platinum">Posicionamento de Marca & Conversão</div>
                    <div className="text-[11px] text-sub">Whitepaper Executivo</div>
                  </td>
                  <td className="py-3 text-sub">Estrategista B2B</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                      <Clock className="h-2.5 w-2.5 text-amber-300" />
                      Aguardando Aprovação
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
