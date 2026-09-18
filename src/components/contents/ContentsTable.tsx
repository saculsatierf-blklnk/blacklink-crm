import {
  CheckCircle2,
  Clock,
  FileEdit,
  FileText,
  Sparkles,
} from "lucide-react";
import type { SocialContent } from "@/db/schema";

interface ContentsTableProps {
  contents: SocialContent[];
}

export function ContentsTable({ contents }: ContentsTableProps) {
  const getStatusBadge = (status: SocialContent["status"]) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-sub border border-glass-border">
            <FileEdit className="h-2.5 w-2.5 text-sub" />
            Rascunho
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-500/20">
            <Clock className="h-2.5 w-2.5 text-amber-300" />
            Aguardando Aprovação
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-accent px-2.5 py-0.5 text-[10px] font-mono text-void font-semibold">
            <CheckCircle2 className="h-2.5 w-2.5 text-void" />
            Aprovado
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

  if (!contents || contents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-glass-border bg-carbon p-12 text-center">
        <FileText className="h-10 w-10 text-sub mb-3 opacity-40" />
        <h3 className="text-sm font-semibold text-platinum">Nenhum conteúdo registrado</h3>
        <p className="text-xs text-sub mt-1 max-w-sm">
          A esteira editorial está vazia. Crie uma nova publicação para iniciar o ciclo de revisão e conversão.
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
              <th className="py-3.5 px-6 font-medium tracking-wider w-1/4">Título da Peça</th>
              <th className="py-3.5 px-6 font-medium tracking-wider w-1/2">Resumo do Copy</th>
              <th className="py-3.5 px-6 font-medium tracking-wider">Status</th>
              <th className="py-3.5 px-6 font-medium tracking-wider text-right">Data de Criação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border/40 text-platinum">
            {contents.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-carbon-muted/40 transition-colors group cursor-default"
              >
                {/* Título da Peça */}
                <td className="py-4 px-6 align-top">
                  <div className="font-semibold text-platinum group-hover:text-accent transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] font-mono text-sub mt-0.5">
                    ID: {item.id.slice(0, 8)}...
                  </div>
                </td>

                {/* Resumo do Copy */}
                <td className="py-4 px-6 align-top">
                  <p className="text-xs text-sub line-clamp-2 leading-relaxed font-sans">
                    {item.copyText}
                  </p>
                </td>

                {/* Status */}
                <td className="py-4 px-6 align-top whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>

                {/* Data de Criação */}
                <td className="py-4 px-6 text-right font-mono text-[11px] text-sub align-top whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
