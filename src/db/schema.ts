import { pgTable, serial, integer, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

/** Singleton row (id = 1) holding the authored "about" knowledge. */
export const siteKnowledge = pgTable('site_knowledge', {
  id: integer('id').primaryKey().default(1),
  bio: text('bio').notNull(),
  experience: text('experience').notNull(),
  skills: jsonb('skills').$type<string[]>().notNull(),
  availability: text('availability').notNull(),
  flagshipProject: text('flagship_project').notNull(),
  contactEmail: text('contact_email').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

/** One row per portfolio project. `derived` is owned by the nightly refresh cron. */
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  sortOrder: integer('sort_order').notNull(),
  name: text('name').notNull(),
  year: text('year').notNull(),
  url: text('url').notNull(),
  handle: text('handle').notNull().unique(),
  tech: jsonb('tech').$type<string[]>().notNull(),
  briefEn: text('brief_en').notNull(),
  briefTr: text('brief_tr').notNull(),
  derived: jsonb('derived').$type<{ liveSummary?: string; lastCheckedAt?: string; status?: 'ok' | 'unreachable' }>(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type SiteKnowledgeRow = typeof siteKnowledge.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
