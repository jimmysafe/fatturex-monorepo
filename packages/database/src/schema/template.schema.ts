import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";
import { z } from "zod";

import { decimal } from "../lib/utils";
import { user } from "./auth.schema";

export const template = sqliteTable("templates", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const templateArticolo = sqliteTable("template_articoli", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  descrizione: text("descrizione").notNull(),
  quantita: integer("quantita").notNull().default(1),
  prezzo: decimal("prezzo").notNull(),

  templateId: text("template_id")
    .notNull()
    .references(() => template.id, { onDelete: "cascade" }),
});

export const templateArticoloRelations = relations(templateArticolo, ({ one }) => ({
  template: one(template, {
    fields: [templateArticolo.templateId],
    references: [template.id],
  }),
}));

export const templateRelations = relations(template, ({ many, one }) => ({
  articoli: many(templateArticolo),
  user: one(user, {
    fields: [template.userId],
    references: [user.id],
  }),
}));

export const TemplateArticoloSchema = createSelectSchema(templateArticolo, { prezzo: z.coerce.number(), quantita: z.coerce.number() });
export const CreateTemplateArticoloSchema = createInsertSchema(templateArticolo, { prezzo: z.coerce.number(), quantita: z.coerce.number(), templateId: z.string().uuid().optional() }).omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateTemplateArticoloSchema = CreateTemplateArticoloSchema.partial().extend({ id: z.string().uuid().optional() });

export type TemplateArticolo = z.infer<typeof TemplateArticoloSchema>;
export type TemplateArticoloCreateDto = z.infer<typeof CreateTemplateArticoloSchema>;
export type TemplateArticoloUpdateDto = z.infer<typeof UpdateTemplateArticoloSchema>;

export const TemplateSchema = createSelectSchema(template).extend({ articoli: z.array(TemplateArticoloSchema) });

export const CreateTemplateSchema = createInsertSchema(template).omit({ id: true, userId: true, createdAt: true, updatedAt: true }).extend({ articoli: z.array(CreateTemplateArticoloSchema).default([]) });

export const UpdateTemplateSchema = CreateTemplateSchema.partial().extend({ articoli: z.array(UpdateTemplateArticoloSchema).default([]) });

export type Template = z.infer<typeof TemplateSchema>;
export type TemplateCreateDto = z.infer<typeof CreateTemplateSchema>;
export type TemplateUpdateDto = z.infer<typeof UpdateTemplateSchema>;
