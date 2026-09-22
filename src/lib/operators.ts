export interface Operator {
  id: string;
  name: string;
  shortName: string;
  role: string;
  badgeClass: string;
}

export const OPERATORS: Operator[] = [
  {
    id: "lucas.leite",
    name: "Lucas Leite",
    shortName: "Lucas L.",
    role: "Hunter Principal",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  {
    id: "mariana.silva",
    name: "Mariana Silva",
    shortName: "Mariana S.",
    role: "Closer Senior",
    badgeClass: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  },
  {
    id: "carlos.mendes",
    name: "Carlos Mendes",
    shortName: "Carlos M.",
    role: "SDR Enterprise",
    badgeClass: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  },
];

export function getOperator(id?: string | null): Operator {
  const found = OPERATORS.find((op) => op.id === id);
  return (
    found || {
      id: id || "desconhecido",
      name: id || "Operador",
      shortName: id || "Operador",
      role: "Vendas",
      badgeClass: "border-glass-border bg-void/50 text-sub",
    }
  );
}
