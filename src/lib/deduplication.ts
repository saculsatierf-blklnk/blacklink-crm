/**
 * MOTOR ANTI-DUPLICIDADE RIGOROSO (SÉRIE REA-DESCONSTRUÇÃO)
 * Trava tripla de integridade de dados para o Data Warehouse (Google Sheets + CRM):
 * A) CNPJ (14 dígitos numéricos limpos)
 * B) Domínio Raiz Corporativo (extraído de site ou e-mail, ex: 'empresa.com.br')
 * C) Telefone / WhatsApp (higienizado no formato E.164 puro: 5511999999999)
 */

const FREEMAIL_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.com.br",
  "outlook.com",
  "outlook.com.br",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "me.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "ig.com.br",
  "globo.com",
  "r7.com",
  "protonmail.com",
  "proton.me",
]);

/**
 * A) Higieniza CNPJ removendo pontos, barras, traços e espaços.
 * Retorna string de 14 dígitos ou string vazia se inválido.
 */
export function sanitizeCnpj(raw?: string | null): string {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 14) return digits;
  return "";
}

/**
 * Formata um CNPJ de 14 dígitos para exibição padrão: 00.000.000/0001-00
 */
export function formatCnpjDisplay(raw?: string | null): string {
  const clean = sanitizeCnpj(raw);
  if (!clean) return raw?.trim() || "";
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
}

/**
 * B) Isola o domínio principal corporativo a partir de um e-mail ou URL de site.
 * Ex: 'https://www.portal.lafaete.com.br/contato' -> 'lafaete.com.br'
 * Ex: 'marketing@lafaete.com.br' -> 'lafaete.com.br'
 * Se for provedor de e-mail gratuito (ex: gmail.com), retorna o e-mail completo como chave única.
 */
export function extractCanonicalDomain(
  email?: string | null,
  website?: string | null
): string {
  const extractHost = (input: string): string => {
    let cleaned = input.trim().toLowerCase();
    if (!cleaned) return "";

    if (cleaned.includes("@")) {
      const parts = cleaned.split("@");
      const domainPart = parts[parts.length - 1]?.replace(/[^a-z0-9.-]/g, "") || "";
      if (!domainPart) return "";
      if (FREEMAIL_PROVIDERS.has(domainPart)) {
        // Para Gmail/Hotmail, o identificador único é o endereço completo
        return `freemail:${cleaned}`;
      }
      cleaned = domainPart;
    } else {
      try {
        const urlObj = new URL(
          cleaned.startsWith("http") ? cleaned : `https://${cleaned}`
        );
        cleaned = urlObj.hostname.toLowerCase();
      } catch {
        cleaned = cleaned
          .replace(/^https?:\/\//, "")
          .split("/")[0]
          .toLowerCase();
      }
    }

    cleaned = cleaned.replace(/^www\d*\./, "");

    // Reduz subdomínios mantendo domínio principal (.com.br, .ind.br, .eng.br, .net.br, .org.br ou .com/.net)
    const segments = cleaned.split(".").filter(Boolean);
    if (segments.length >= 3) {
      const lastTwo = segments.slice(-2).join(".");
      const brCompoundTlds = new Set([
        "com.br",
        "ind.br",
        "eng.br",
        "net.br",
        "org.br",
        "arq.br",
        "srv.br",
        "etc.br",
      ]);
      if (brCompoundTlds.has(lastTwo) && segments.length >= 3) {
        return segments.slice(-3).join(".");
      }
      return segments.slice(-2).join(".");
    }

    return cleaned;
  };

  if (website && website.trim()) {
    const fromSite = extractHost(website);
    if (fromSite && !fromSite.startsWith("freemail:")) return fromSite;
  }

  if (email && email.trim()) {
    return extractHost(email);
  }

  return "";
}

/**
 * Decodifica entidades HTML comuns vindas de títulos de páginas web (ex: &#8211;, &amp;, &#038;)
 */
export function decodeHtmlEntities(raw?: string | null): string {
  if (!raw) return "";
  return String(raw)
    .replace(/&#8211;|&ndash;/gi, "–")
    .replace(/&#8212;|&mdash;/gi, "—")
    .replace(/&#038;|&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#039;|&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      return !isNaN(code) ? String.fromCharCode(code) : "";
    })
    .trim();
}

/**
 * C) Higieniza Telefone / WhatsApp para o formato limpo de dígitos com DDI 55:
 * Ex: '(11) 96909-3975' -> '5511969093975'
 * Ex: '47 3439-1666'   -> '554734391666'
 */
export function sanitizePhoneE164(raw?: string | null): string {
  if (!raw) return "";
  const firstNumberPart = String(raw).split("/")[0]?.trim() || String(raw);
  let digits = firstNumberPart.replace(/\D/g, "");
  if (!digits) return "";

  // Remove zero inicial de operadora/DDD (ex: 011999999999 -> 11999999999)
  if (digits.startsWith("0") && (digits.length === 11 || digits.length === 12)) {
    digits = digits.slice(1);
  }

  // Se já começa com 55 e tem 12 ou 13 dígitos, mantém
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Se já tem 10 ou 11 dígitos (DDD + número), prefixa com 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits.length >= 10 ? digits : "";
}

/**
 * Formata o telefone para leitura humana completa no padrão brasileiro (DDD) XXXXX-XXXX ou (DDD) XXXX-XXXX,
 * sem exibir o prefixo 55 que espremia os últimos dígitos no campo visual.
 */
export function formatPhoneBrDisplay(raw?: string | null): string {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";

  // Se tiver múltiplos telefones separados por barra, formata o principal
  if (trimmed.includes("/")) {
    return trimmed
      .split("/")
      .map((part) => formatPhoneBrDisplay(part))
      .filter(Boolean)
      .join(" / ");
  }

  const e164 = sanitizePhoneE164(trimmed);
  const digits = e164 || trimmed.replace(/\D/g, "");

  // Caso padrão com DDI 55 + DDD (2) + 9 dígitos = 13 dígitos
  if (digits.startsWith("55") && digits.length === 13) {
    const ddd = digits.slice(2, 4);
    const part1 = digits.slice(4, 9);
    const part2 = digits.slice(9, 13);
    return `(${ddd}) ${part1}-${part2}`;
  }

  // Caso padrão com DDI 55 + DDD (2) + 8 dígitos (fixo) = 12 dígitos
  if (digits.startsWith("55") && digits.length === 12) {
    const ddd = digits.slice(2, 4);
    const part1 = digits.slice(4, 8);
    const part2 = digits.slice(8, 12);
    return `(${ddd}) ${part1}-${part2}`;
  }

  // Caso 11 dígitos sem 55 (DDD + 9 dígitos)
  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const part1 = digits.slice(2, 7);
    const part2 = digits.slice(7, 11);
    return `(${ddd}) ${part1}-${part2}`;
  }

  // Caso 10 dígitos sem 55 (DDD + 8 dígitos)
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const part1 = digits.slice(2, 6);
    const part2 = digits.slice(6, 10);
    return `(${ddd}) ${part1}-${part2}`;
  }

  return trimmed;
}

/**
 * Gera chave tronco do telefone (DDD + 8 últimos dígitos) para detectar duplicidade
 * mesmo quando um registro tem o 9º dígito e outro não.
 */
export function getPhoneTrunkKey(raw?: string | null): string {
  const e164 = sanitizePhoneE164(raw);
  if (!e164.startsWith("55") || e164.length < 12) return e164;
  const ddd = e164.slice(2, 4);
  const last8 = e164.slice(-8);
  return `55${ddd}${last8}`;
}

export interface DeduplicationCandidate {
  id?: string;
  empresa: string;
  cnpj?: string;
  responsavel?: string;
  email?: string;
  contato?: string;
  website?: string;
  nivelProspeccao?: string;
  observacoes?: string;
  campanha?: string;
  scriptAbordagem?: string;
  highlighted?: boolean;
  tab?: string;
}

export interface DeduplicationAuditEntry {
  timestamp: string;
  action: "inserted" | "merged_complementary" | "blocked_duplicate";
  empresa: string;
  matchedBy?: "CNPJ" | "DOMINIO" | "TELEFONE" | "NOME_EXATO";
  matchedValue?: string;
  updatedFields?: string[];
  details: string;
}

/**
 * Executa o cruzamento rigoroso de uma lista de novos leads contra a base atual da planilha.
 * - Se colidir em CNPJ, Domínio ou Telefone:
 *   - Atualiza apenas campos vazios da linha existente (merge complementar)
 *   - Ou bloqueia a inserção se já estiver completo
 * - Se for inédito, aprova para inserção com dados higienizados.
 */
export function deduplicateAndMergeLeads<T extends DeduplicationCandidate>(
  existingRows: T[],
  incomingLeads: T[]
): {
  updatedExistingRows: T[];
  newUniqueLeads: T[];
  insertedCount: number;
  mergedCount: number;
  blockedCount: number;
  auditLogs: DeduplicationAuditEntry[];
} {
  const workingRows = existingRows.map((r) => ({ ...r }));
  const newUniqueLeads: T[] = [];
  const auditLogs: DeduplicationAuditEntry[] = [];

  // Índices de busca O(1) apontando para a posição em workingRows
  const cnpjIndex = new Map<string, number>();
  const domainIndex = new Map<string, number>();
  const phoneE164Index = new Map<string, number>();
  const phoneTrunkIndex = new Map<string, number>();
  const nameIndex = new Map<string, number>();

  const indexRow = (row: T, idx: number) => {
    const cnpj = sanitizeCnpj(row.cnpj);
    if (cnpj) cnpjIndex.set(cnpj, idx);

    const domain = extractCanonicalDomain(row.email, row.website);
    if (domain) domainIndex.set(domain, idx);

    const phone = sanitizePhoneE164(row.contato);
    if (phone) phoneE164Index.set(phone, idx);

    const trunk = getPhoneTrunkKey(row.contato);
    if (trunk) phoneTrunkIndex.set(trunk, idx);

    const cleanName = (row.empresa || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanName) nameIndex.set(cleanName, idx);
  };

  workingRows.forEach((row, idx) => indexRow(row, idx));

  let insertedCount = 0;
  let mergedCount = 0;
  let blockedCount = 0;

  for (const incoming of incomingLeads) {
    const incCnpj = sanitizeCnpj(incoming.cnpj);
    const incDomain = extractCanonicalDomain(incoming.email, incoming.website);
    const incPhone = sanitizePhoneE164(incoming.contato);
    const incTrunk = getPhoneTrunkKey(incoming.contato);
    const incName = (incoming.empresa || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    let matchedIdx: number | undefined;
    let matchedBy: "CNPJ" | "DOMINIO" | "TELEFONE" | "NOME_EXATO" | undefined;
    let matchedValue = "";

    if (incCnpj && cnpjIndex.has(incCnpj)) {
      matchedIdx = cnpjIndex.get(incCnpj);
      matchedBy = "CNPJ";
      matchedValue = incCnpj;
    } else if (incDomain && domainIndex.has(incDomain)) {
      matchedIdx = domainIndex.get(incDomain);
      matchedBy = "DOMINIO";
      matchedValue = incDomain;
    } else if (incPhone && phoneE164Index.has(incPhone)) {
      matchedIdx = phoneE164Index.get(incPhone);
      matchedBy = "TELEFONE";
      matchedValue = incPhone;
    } else if (incTrunk && phoneTrunkIndex.has(incTrunk)) {
      matchedIdx = phoneTrunkIndex.get(incTrunk);
      matchedBy = "TELEFONE";
      matchedValue = incPhone || incTrunk;
    } else if (incName && nameIndex.has(incName)) {
      matchedIdx = nameIndex.get(incName);
      matchedBy = "NOME_EXATO";
      matchedValue = incoming.empresa;
    }

    if (matchedIdx !== undefined && matchedBy) {
      const target = workingRows[matchedIdx];
      const updatedFields: string[] = [];

      if (!target.cnpj?.trim() && incCnpj) {
        target.cnpj = formatCnpjDisplay(incCnpj);
        updatedFields.push("CNPJ");
      }
      if (!target.responsavel?.trim() && incoming.responsavel?.trim()) {
        target.responsavel = incoming.responsavel.trim();
        updatedFields.push("Responsável");
      }
      if (!target.email?.trim() && incoming.email?.trim()) {
        target.email = incoming.email.trim().toLowerCase();
        updatedFields.push("E-mail");
      }
      if (!target.contato?.trim() && incoming.contato?.trim()) {
        target.contato =
          formatPhoneBrDisplay(incoming.contato) || incoming.contato.trim();
        updatedFields.push("Contato");
      }
      if (!target.observacoes?.trim() && incoming.observacoes?.trim()) {
        target.observacoes = incoming.observacoes.trim();
        updatedFields.push("Observações");
      }
      if (!target.scriptAbordagem?.trim() && incoming.scriptAbordagem?.trim()) {
        target.scriptAbordagem = incoming.scriptAbordagem.trim();
        updatedFields.push("Script IA");
      }

      // Re-indexa caso tenha ganhado novos identificadores
      indexRow(target, matchedIdx);

      if (updatedFields.length > 0) {
        mergedCount++;
        auditLogs.push({
          timestamp: new Date().toISOString(),
          action: "merged_complementary",
          empresa: target.empresa,
          matchedBy,
          matchedValue,
          updatedFields,
          details: `Duplicata bloqueada por ${matchedBy} (${matchedValue}). Enriquecido com: ${updatedFields.join(", ")}.`,
        });
      } else {
        blockedCount++;
        auditLogs.push({
          timestamp: new Date().toISOString(),
          action: "blocked_duplicate",
          empresa: incoming.empresa,
          matchedBy,
          matchedValue,
          details: `Inserção travada por colisão exata de ${matchedBy} (${matchedValue}) com '${target.empresa}'.`,
        });
      }
      continue;
    }

    // Lead 100% inédito: higieniza campos canônicos e formata telefone completo (DD) XXXXX-XXXX
    const sanitizedLead: T = {
      ...incoming,
      empresa: decodeHtmlEntities(incoming.empresa),
      cnpj: incCnpj ? formatCnpjDisplay(incCnpj) : incoming.cnpj || "",
      email: (incoming.email || "").trim().toLowerCase(),
      contato:
        formatPhoneBrDisplay(incoming.contato) || (incoming.contato || "").trim(),
    };

    const newIndex = workingRows.length;
    workingRows.push(sanitizedLead);
    newUniqueLeads.push(sanitizedLead);
    indexRow(sanitizedLead, newIndex);
    insertedCount++;

    auditLogs.push({
      timestamp: new Date().toISOString(),
      action: "inserted",
      empresa: sanitizedLead.empresa,
      details: `Novo lead validado (Domínio: ${incDomain || "N/A"} | Tel: ${incPhone || "N/A"} | CNPJ: ${incCnpj || "N/A"}).`,
    });
  }

  return {
    updatedExistingRows: workingRows,
    newUniqueLeads,
    insertedCount,
    mergedCount,
    blockedCount,
    auditLogs,
  };
}
