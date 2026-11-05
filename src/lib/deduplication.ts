import type { Lead } from "@/db/schema";

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

/**
 * Normaliza o nome da empresa para detecção de colisão fonética/textual:
 * - Remove acentos
 * - Remove pontuação e caracteres especiais
 * - Remove sufixos societários comuns (Ltda, ME, EPP, Eireli, SA, etc.) e termos genéricos
 */
export function normalizeLeadCompanyName(raw?: string | null): string {
  if (!raw) return "";
  return String(raw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(ltda|me|epp|eireli|sa|s\/a|s\.a|industria|comercio|do brasil|brasil|empresa b2b|empresa|grupo)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrai todas as chaves de telefone (E.164, últimos 8 dígitos e últimos 9 dígitos)
 * a partir de qualquer campo de lead ou estado de cadência.
 */
export function extractLeadPhoneKeys(lead: {
  leadPhone?: string | null;
  cadenceState?: { phone?: string; whatsapp?: string } | null;
  phone?: string | null;
  contato?: string | null;
}): { fullE164: string[]; trunk8: string[]; trunk9: string[] } {
  const rawList: (string | null | undefined)[] = [
    lead.leadPhone,
    lead.cadenceState?.phone,
    lead.cadenceState?.whatsapp,
    lead.phone,
    lead.contato,
  ];

  const fullE164: string[] = [];
  const trunk8: string[] = [];
  const trunk9: string[] = [];

  for (const raw of rawList) {
    if (!raw) continue;
    const digits = String(raw).replace(/\D/g, "");
    if (digits.length >= 8) {
      trunk8.push(digits.slice(-8));
      if (digits.length >= 9) trunk9.push(digits.slice(-9));
      const e164 = sanitizePhoneE164(raw);
      if (e164) fullE164.push(e164);
    }
  }

  return {
    fullE164: Array.from(new Set(fullE164)),
    trunk8: Array.from(new Set(trunk8)),
    trunk9: Array.from(new Set(trunk9)),
  };
}

export interface InMemoryCollisionResult {
  collision: boolean;
  matchedLead?: Lead;
  matchedBy?: "id" | "telefone" | "email" | "dominio" | "empresa";
  matchedValue?: string;
}

/**
 * Radar Anti-Colisão em memória: Varre uma lista de Leads em busca de duplicações
 * por ID, Telefone (E.164 ou últimos 8/9 dígitos), E-mail, Domínio Corporativo ou Razão Social normalizada.
 */
export function checkLeadCollisionInMemory(
  candidate: Partial<Lead> | any,
  existingList: Lead[]
): InMemoryCollisionResult {
  if (!candidate || !existingList || existingList.length === 0) {
    return { collision: false };
  }

  const candPhones = extractLeadPhoneKeys(candidate);
  const candEmail = (candidate.leadEmail || candidate.email || "").trim().toLowerCase();
  const candDomain = candEmail ? extractCanonicalDomain(candEmail) : "";
  const candCompanyRaw =
    candidate.cadenceState?.companyName ||
    candidate.company ||
    candidate.empresa ||
    candidate.leadName ||
    "";
  const candCompanyNorm = normalizeLeadCompanyName(candCompanyRaw);
  const candNameRaw = candidate.leadName || candidate.name || "";
  const candNameNorm = normalizeLeadCompanyName(candNameRaw);

  for (const existing of existingList) {
    // 0. Mesmo ID
    if (candidate.id && existing.id && candidate.id === existing.id) {
      return {
        collision: true,
        matchedLead: existing,
        matchedBy: "id",
        matchedValue: existing.id,
      };
    }

    // 1. Colisão por Telefone / WhatsApp (8 ou 9 dígitos finais ou E.164 puro)
    if (candPhones.trunk8.length > 0) {
      const existPhones = extractLeadPhoneKeys(existing);
      const matchedT8 = candPhones.trunk8.find((t8) => existPhones.trunk8.includes(t8));
      if (matchedT8) {
        return {
          collision: true,
          matchedLead: existing,
          matchedBy: "telefone",
          matchedValue: matchedT8,
        };
      }
      const matchedE164 = candPhones.fullE164.find((e) => existPhones.fullE164.includes(e));
      if (matchedE164) {
        return {
          collision: true,
          matchedLead: existing,
          matchedBy: "telefone",
          matchedValue: matchedE164,
        };
      }
    }

    // 2. Colisão por E-mail idêntico
    if (candEmail && candEmail.includes("@")) {
      const existEmail = (existing.leadEmail || "").trim().toLowerCase();
      if (existEmail && existEmail === candEmail) {
        return {
          collision: true,
          matchedLead: existing,
          matchedBy: "email",
          matchedValue: candEmail,
        };
      }
    }

    // 3. Colisão por Domínio Corporativo (ex: '@empresa.com.br', desconsiderando freemails como gmail)
    if (candDomain && !candDomain.startsWith("freemail:")) {
      const existEmail = (existing.leadEmail || "").trim().toLowerCase();
      const existDomain = extractCanonicalDomain(existEmail);
      if (existDomain && existDomain === candDomain) {
        return {
          collision: true,
          matchedLead: existing,
          matchedBy: "dominio",
          matchedValue: candDomain,
        };
      }
    }

    // 4. Colisão por Nome da Empresa (se tiver 5+ caracteres significativos)
    const existCompanyRaw =
      existing.cadenceState?.companyName || existing.leadName || "";
    const existCompanyNorm = normalizeLeadCompanyName(existCompanyRaw);
    const existNameNorm = normalizeLeadCompanyName(existing.leadName || "");

    const candKeys = [candCompanyNorm, candNameNorm].filter((n) => n.length >= 5);
    const existKeys = [existCompanyNorm, existNameNorm].filter((n) => n.length >= 5);

    for (const ck of candKeys) {
      for (const ek of existKeys) {
        if (ck === ek) {
          return {
            collision: true,
            matchedLead: existing,
            matchedBy: "empresa",
            matchedValue: ck,
          };
        }
        // Substring mútua para variações com prefixo ou código (ex: 'Hidrocromo' e 'Hidrocromo - 8')
        if (ck.length >= 7 && ek.length >= 7 && (ck.includes(ek) || ek.includes(ck))) {
          return {
            collision: true,
            matchedLead: existing,
            matchedBy: "empresa",
            matchedValue: `${ck} ~ ${ek}`,
          };
        }
      }
    }
  }

  return { collision: false };
}

const STATUS_PRECEDENCE: Record<string, number> = {
  closed: 3,
  negotiation: 2,
  new: 1,
};

/**
 * Funde dois leads duplicados em um único registro preservando o estágio mais avançado
 * do pipeline, histórico de anotações, passos completados da cadência e dados mais ricos.
 */
export function mergeTwoKanbanLeads(leadA: Lead, leadB: Lead): Lead {
  const rankA = STATUS_PRECEDENCE[leadA.status] || 1;
  const rankB = STATUS_PRECEDENCE[leadB.status] || 1;

  let primary = leadA;
  let secondary = leadB;

  if (rankB > rankA) {
    primary = leadB;
    secondary = leadA;
  } else if (rankA === rankB) {
    const notesA = leadA.notes?.length || 0;
    const notesB = leadB.notes?.length || 0;
    if (notesB > notesA) {
      primary = leadB;
      secondary = leadA;
    }
  }

  const primCad = (primary.cadenceState as any) || {};
  const secCad = (secondary.cadenceState as any) || {};

  // Resolve melhor nome da empresa (evita "Empresa B2B" ou números puros como "8")
  const isGeneric = (name?: string | null) => {
    if (!name) return true;
    const t = name.trim().toLowerCase();
    return !t || t === "empresa b2b" || /^\d+$/.test(t);
  };

  let bestCompanyName = primCad.companyName || primary.leadName;
  if (isGeneric(bestCompanyName)) {
    if (!isGeneric(secCad.companyName)) {
      bestCompanyName = secCad.companyName;
    } else if (!isGeneric(secondary.leadName)) {
      bestCompanyName = secondary.leadName;
    }
  }

  const bestContactPerson = primCad.contactPerson || secCad.contactPerson || "";
  const bestPhone =
    primCad.phone ||
    secCad.phone ||
    primary.leadPhone ||
    secondary.leadPhone ||
    "";
  const bestWhatsapp =
    primCad.whatsapp ||
    secCad.whatsapp ||
    bestPhone;
  const bestEmail =
    primary.leadEmail?.trim() ||
    secondary.leadEmail?.trim() ||
    null;
  const bestLocation = primCad.location || secCad.location || "";

  // Combina anotações sem duplicação de texto
  const combinedNotes = [...(primary.notes || [])];
  const seenTexts = new Set(combinedNotes.map((n) => n.text.trim()));
  for (const n of secondary.notes || []) {
    if (n && n.text && !seenTexts.has(n.text.trim())) {
      combinedNotes.push(n);
      seenTexts.add(n.text.trim());
    }
  }

  // Combina passos concluídos da cadência
  const stepsA: string[] = primCad.completedSteps || [];
  const stepsB: string[] = secCad.completedSteps || [];
  const mergedSteps = Array.from(new Set([...stepsA, ...stepsB]));

  // Combina eventos de telemetria
  const telemA = primary.telemetryEvents || [];
  const telemB = secondary.telemetryEvents || [];
  const mergedTelem = [...telemA];
  const seenTelem = new Set(telemA.map((t) => `${t.type}-${t.timestamp}`));
  for (const t of telemB) {
    const k = `${t.type}-${t.timestamp}`;
    if (!seenTelem.has(k)) {
      mergedTelem.push(t);
      seenTelem.add(k);
    }
  }

  // Resolução inteligente e ultra-estrita de desativação:
  // Se qualquer uma das cópias estiver desativada, o lead DEVE permanecer desativado,
  // a menos que a outra cópia tenha um registro explícito de reativação posterior.
  const historyA: any[] = Array.isArray(primCad.deactivationHistory) ? primCad.deactivationHistory : [];
  const historyB: any[] = Array.isArray(secCad.deactivationHistory) ? secCad.deactivationHistory : [];
  
  const mergedHistory: any[] = [...historyA];
  const seenHistory = new Set(historyA.map((h) => `${h.deactivatedAt || h.date}-${h.reason}`));
  for (const h of historyB) {
    const k = `${h.deactivatedAt || h.date}-${h.reason}`;
    if (!seenHistory.has(k)) {
      mergedHistory.push(h);
      seenHistory.add(k);
    }
  }
  mergedHistory.sort((a, b) => {
    const timeA = new Date(a.deactivatedAt || a.date || 0).getTime();
    const timeB = new Date(b.deactivatedAt || b.date || 0).getTime();
    return timeB - timeA;
  });

  const isDeactA = Boolean(primCad.isDeactivated);
  const isDeactB = Boolean(secCad.isDeactivated);

  let finalIsDeactivated = false;
  let finalReason = primCad.deactivationReason || secCad.deactivationReason || "";
  let finalAt = primCad.deactivatedAt || secCad.deactivatedAt;
  let finalBy = primCad.deactivatedBy || secCad.deactivatedBy;

  if (isDeactA && isDeactB) {
    finalIsDeactivated = true;
  } else if (isDeactA || isDeactB) {
    const deactCopy = isDeactA ? primCad : secCad;
    const activeCopy = isDeactA ? secCad : primCad;

    // Verifica se a cópia ativa possui reativação posterior documentada no histórico
    const lastReactivation = activeCopy.deactivationHistory?.[0]?.reactivatedAt;
    const deactTime = deactCopy.deactivatedAt ? new Date(deactCopy.deactivatedAt).getTime() : 0;
    const reactTime = lastReactivation ? new Date(lastReactivation).getTime() : 0;

    if (reactTime > deactTime && reactTime > 0) {
      finalIsDeactivated = false;
    } else {
      finalIsDeactivated = true;
      finalReason = deactCopy.deactivationReason || finalReason;
      finalAt = deactCopy.deactivatedAt || finalAt;
      finalBy = deactCopy.deactivatedBy || finalBy;
    }
  }

  return {
    ...primary,
    leadName: bestCompanyName || primary.leadName,
    leadEmail: bestEmail,
    leadPhone: bestPhone || primary.leadPhone,
    status: primary.status, // Preserva estágio mais avançado (ex: Em Prospecção)
    dealScore: Math.max(primary.dealScore || 50, secondary.dealScore || 50),
    notes: combinedNotes,
    telemetryEvents: mergedTelem,
    cadenceState: {
      ...secCad,
      ...primCad,
      completedSteps: mergedSteps,
      companyName: bestCompanyName,
      contactPerson: bestContactPerson,
      phone: bestPhone,
      whatsapp: bestWhatsapp,
      location: bestLocation,
      roleTitle: primCad.roleTitle || secCad.roleTitle || "",
      estimatedValue: primCad.estimatedValue || secCad.estimatedValue || "",
      website: primCad.website || secCad.website || "",
      isDeactivated: finalIsDeactivated,
      deactivationReason: finalIsDeactivated ? finalReason : undefined,
      deactivatedAt: finalIsDeactivated ? finalAt : undefined,
      deactivatedBy: finalIsDeactivated ? finalBy : undefined,
      deactivationHistory: mergedHistory,
    },
    nextActivityDate: primary.nextActivityDate || secondary.nextActivityDate || null,
    nextActivityType: primary.nextActivityType || secondary.nextActivityType || null,
  };
}

/**
 * Deduplica e consolida uma lista inteira de Leads do Kanban.
 * Garante que duplicatas (mesmo telefone, email, domínio ou empresa) sejam mescladas em 1 único card.
 */
export function deduplicateKanbanLeadsList(leads: Lead[]): {
  deduplicated: Lead[];
  mergedCount: number;
} {
  if (!Array.isArray(leads) || leads.length <= 1) {
    return { deduplicated: leads || [], mergedCount: 0 };
  }

  const result: Lead[] = [];
  let mergedCount = 0;

  for (const candidate of leads) {
    const collision = checkLeadCollisionInMemory(candidate, result);
    if (collision.collision && collision.matchedLead) {
      const matchIdx = result.findIndex((l) => l.id === collision.matchedLead!.id);
      if (matchIdx !== -1) {
        result[matchIdx] = mergeTwoKanbanLeads(result[matchIdx], candidate);
        mergedCount++;
      }
    } else {
      result.push(candidate);
    }
  }

  return { deduplicated: result, mergedCount };
}
