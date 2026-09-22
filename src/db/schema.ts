import { relations } from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar, vector } from "drizzle-orm/pg-core";

// ==========================================
// 1. ENUMS
// ==========================================

export const userRoleEnum = pgEnum("user_role", ["admin", "editor", "viewer"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "negotiation", "closed"]);
export const socialContentStatusEnum = pgEnum("social_content_status", ["draft", "pending", "approved"]);

// ==========================================
// 2. MULTI-TENANT TABLES
// ==========================================

/**
 * Entidade Raiz do Tenant: Empresa / Organização
 */
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  corporateName: varchar("corporate_name", { length: 255 }).notNull(),
  documentCnpj: varchar("document_cnpj", { length: 18 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Usuários Vinculados à Empresa (Isolamento por company_id)
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("viewer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export interface CadenceState {
  completedSteps: string[];
  roleTitle?: string;
  estimatedValue?: string;
  customScript?: string;
}

export interface NoteEntry {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface TelemetryEvent {
  type: string;
  weight: number;
  timestamp: string;
  details?: string;
}

/**
 * Leads Comerciais (Isolamento por company_id)
 */
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  leadName: varchar("lead_name", { length: 255 }).notNull(),
  leadEmail: varchar("lead_email", { length: 255 }),
  leadPhone: varchar("lead_phone", { length: 50 }),
  origin: varchar("origin", { length: 100 }).default("direct"),
  status: leadStatusEnum("status").default("new").notNull(),
  dealScore: integer("deal_score").default(50).notNull(),
  telemetryEvents: jsonb("telemetry_events")
    .$type<TelemetryEvent[]>()
    .default([])
    .notNull(),
  cadenceState: jsonb("cadence_state")
    .$type<CadenceState>()
    .default({ completedSteps: [] })
    .notNull(),
  notes: jsonb("notes")
    .$type<NoteEntry[]>()
    .default([])
    .notNull(),
  scriptVersion: varchar("script_version", { length: 50 })
    .default("v1_direct")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Embeddings e Telemetria Preditiva de Negócios (pgvector 1536 dimensões)
 */
export const dealTelemetryEmbeddings = pgTable("deal_telemetry_embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'objection' | 'call_transcript' | 'meeting_summary' | 'proposal_feedback'
  rawContent: text("raw_content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Conteúdos Sociais e Peças de Marketing (Isolamento por company_id)
 */
export const socialContents = pgTable("social_contents", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  copyText: text("copy_text").notNull(),
  status: socialContentStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 3. RELATIONS & MULTI-TENANCY CONSTRAINTS
// ==========================================

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  leads: many(leads),
  socialContents: many(socialContents),
}));

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  company: one(companies, {
    fields: [leads.companyId],
    references: [companies.id],
  }),
  telemetryEmbeddings: many(dealTelemetryEmbeddings),
}));

export const dealTelemetryEmbeddingsRelations = relations(
  dealTelemetryEmbeddings,
  ({ one }) => ({
    lead: one(leads, {
      fields: [dealTelemetryEmbeddings.leadId],
      references: [leads.id],
    }),
  })
);

export const socialContentsRelations = relations(socialContents, ({ one }) => ({
  company: one(companies, {
    fields: [socialContents.companyId],
    references: [companies.id],
  }),
}));

// ==========================================
// 4. TYPE INFERENCE
// ==========================================

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type DealTelemetryEmbedding = typeof dealTelemetryEmbeddings.$inferSelect;
export type NewDealTelemetryEmbedding = typeof dealTelemetryEmbeddings.$inferInsert;

export type SocialContent = typeof socialContents.$inferSelect;
export type NewSocialContent = typeof socialContents.$inferInsert;
