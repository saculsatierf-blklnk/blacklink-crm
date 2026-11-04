export interface Operator {
  id: string;
  name: string;
  shortName: string;
  role: string;
  badgeClass: string;
  email?: string;
}

/**
 * Operadores padrão vinculados à operação comercial Gofer Metais
 * IDs sincronizados com a tabela users e sessions no PostgreSQL
 */
export const OPERATORS: Operator[] = [
  {
    id: "461bb110-2af3-47eb-9d1d-d4516997e150",
    name: "Lucas de Freitas Leite (Gofer Metais)",
    shortName: "Lucas",
    role: "Comercial Gofer",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    email: "lucas@gofermetais.com.br",
  },
  {
    id: "070af81b-047d-480a-8207-10d93b1a3c38",
    name: "Lucas Leite (Hunter Comercial)",
    shortName: "Hunter",
    role: "Comercial Gofer",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    email: "comercial@gofermetais.com.br",
  },
  {
    id: "8ceda3ae-ba24-4545-9e75-2e9f88e0de74",
    name: "Administrador Gofer",
    shortName: "Admin",
    role: "Administrador",
    badgeClass: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    email: "adm@gofermetais.com.br",
  },
];

export function getOperator(id?: string | null): Operator {
  if (!id) return OPERATORS[0];
  const found = OPERATORS.find((op) => op.id === id);
  if (found) return found;

  // Fallbacks para compatibilidade com registros legados
  if (id === "lucas.leite" || id === "commercial" || id === "lucas") {
    return OPERATORS[0];
  }
  if (id === "admin") {
    return OPERATORS[2];
  }

  // Se o ID for um UUID de usuário autenticado no banco, exibe nome humano limpo
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const displayName = isUuid ? "Lucas (Gofer Metais)" : id;

  return {
    id,
    name: displayName,
    shortName: isUuid ? "Lucas" : id.length > 12 ? id.slice(0, 8) + "..." : id,
    role: "Comercial Gofer",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  };
}

/**
 * Sanitiza qualquer string de autor de anotação, removendo UUIDs crus da tela
 */
export function formatNoteAuthor(author: string | null | undefined): string {
  if (!author) return "Lucas (Gofer Metais)";
  // Substitui qualquer UUID cru por nome humano
  let cleaned = author.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    "Lucas (Gofer Metais)"
  );
  // Limpa sufixos redundantes como "(Operador)" quando já tem nome
  if (cleaned.includes("Lucas (Gofer Metais) (Operador)")) {
    cleaned = "Lucas (Gofer Metais)";
  }
  return cleaned.trim() || "Lucas (Gofer Metais)";
}
