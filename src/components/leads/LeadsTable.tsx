import {
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  Phone,
  Sparkles,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const getStatusBadge = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2.5 py-0.5 text-[10px] font-mono text-platinum border border-glass-border">
            <Sparkles className="h-2.5 w-2.5 text-platinum" />
            Novo Lead
          </span>
        );
      case "negotiation":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
            <Clock className="h-2.5 w-2.5 text-emerald-400" />
            Em Negociação
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-accent px-2.5 py-0.5 text-[10px] font-mono text-void font-semibold">
            <CheckCircle2 className="h-2.5 w-2.5 text-void" />
            Fechado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-carbon-muted px-2 py-0.5 text-[10px] font-mono text-sub">
            {status}
          </span>
        );
    }
  };

  const getOriginBadge = (origin: string | null) => {
    const isAutomation =
      origin?.toLowerCase().includes("n8n") ||
      origin?.toLowerCase().includes("webhook");

    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-sub">
        {isAutomation ? (
          <Zap className="h-3.5 w-3.5 text-amber-300 shrink-0" />
        ) : (
          <Globe className="h-3.5 w-3.5 text-sub shrink-0" />
        )}
        <span>{origin || "Direto"}</span>
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-glass-border bg-carbon p-12 text-center">
        <Building2 className="h-10 w-10 text-sub mb-3 opacity-40" />
        <h3 className="text-sm font-semibold text-platinum">Nenhum lead encontrado</h3>
        <p className="text-xs text-sub mt-1 max-w-sm">
          Aguardando injeção de novas oportunidades corporativas via webhook do n8n ou inserção manual.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-glass-border bg-carbon overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-glass-border text-sub font-mono uppercase text-[11px] bg-carbon-muted/50">
              <th className="py-3.5 px-6 font-medium tracking-wider">Nome do Lead / Empresa</th>
              <th className="py-3.5 px-6 font-medium tracking-wider">Contato</th>
              <th className="py-3.5 px-6 font-medium tracking-wider">Origem</th>
              <th className="py-3.5 px-6 font-medium tracking-wider">Status</th>
              <th className="py-3.5 px-6 font-medium tracking-wider text-right">Data de Entrada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40 text-platinum">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-carbon-muted/40 transition-colors group cursor-default"
              >
                {/* Nome do Lead */}
                <td className="py-4 px-6">
                  <div className="font-semibold text-platinum group-hover:text-accent transition-colors">
                    {lead.leadName}
                  </div>
                  <div className="text-[10px] font-mono text-sub mt-0.5">
                    ID: {lead.id.slice(0, 8)}...
                  </div>
                </td>

                {/* Contato (Email / Telefone) */}
                <td className="py-4 px-6 space-y-1">
                  {lead.leadEmail ? (
                    <div className="flex items-center gap-1.5 text-xs text-platinum font-mono">
                      <Mail className="h-3 w-3 text-sub shrink-0" />
                      <span>{lead.leadEmail}</span>
                    </div>
                  ) : (
                    <span className="text-sub italic text-[11px]">Sem e-mail</span>
                  )}
                  {lead.leadPhone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-sub font-mono">
                      <Phone className="h-2.5 w-2.5 text-sub shrink-0" />
                      <span>{lead.leadPhone}</span>
                    </div>
                  )}
                </td>

                {/* Origem */}
                <td className="py-4 px-6">{getOriginBadge(lead.origin)}</td>

                {/* Status */}
                <td className="py-4 px-6">{getStatusBadge(lead.status)}</td>

                {/* Data de Entrada */}
                <td className="py-4 px-6 text-right font-mono text-[11px] text-sub">
                  {formatDate(lead.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
