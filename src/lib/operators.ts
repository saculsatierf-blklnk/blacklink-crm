export interface Operator {
  id: string;
  name: string;
  shortName: string;
  role: string;
  badgeClass: string;
  email?: string;
}

/**
 * Operadores padrão vinculados ao tenant principal (Black Link Enterprise)
 * IDs sincronizados com a tabela users no PostgreSQL
 */
export const OPERATORS: Operator[] = [
  {
    id: "8ceda3ae-ba24-4545-9e75-2e9f88e0de74",
    name: "Administrador Black Link",
    shortName: "Admin",
    role: "Administrador",
    badgeClass: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    email: "adm@blacklink.com",
  },
  {
    id: "070af81b-047d-480a-8207-10d93b1a3c38",
    name: "Operador Comercial (Hunter)",
    shortName: "Hunter",
    role: "Hunter Comercial",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    email: "comercial@blacklink.com",
  },
];

export function getOperator(id?: string | null): Operator {
  if (!id) return OPERATORS[0];
  const found = OPERATORS.find((op) => op.id === id);
  if (found) return found;

  // Fallbacks para compatibilidade com registros legados
  if (id === "lucas.leite" || id === "commercial") {
    return OPERATORS[1];
  }
  if (id === "admin") {
    return OPERATORS[0];
  }

  return {
    id,
    name: id,
    shortName: id.length > 12 ? id.slice(0, 8) + "..." : id,
    role: "Operador",
    badgeClass: "border-glass-border bg-void/50 text-sub",
  };
}
