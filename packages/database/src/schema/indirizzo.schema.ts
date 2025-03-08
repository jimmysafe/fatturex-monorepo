import type { z } from "zod";

import { user } from "@repo/database/schemas/auth.schema";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";

export const indirizzo = sqliteTable("indirizzi", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  indirizzo: text("indirizzo").notNull(),
  comune: text("comune").notNull(),
  cap: text("cap").notNull(),
  provincia: text("provincia").notNull(),
  paese: text("paese").notNull().default("IT"),
  default: integer("default", { mode: "boolean" }).notNull().default(false),
});

export const indirizzoRelations = relations(indirizzo, ({ one }) => ({
  user: one(user, {
    fields: [indirizzo.userId],
    references: [user.id],
  }),
}));

export const IndirizzoSchema = createSelectSchema(indirizzo);
export const CreateIndirizzoSchema = createInsertSchema(indirizzo).omit({ id: true, userId: true });
export const UpdateIndirizzoSchema = CreateIndirizzoSchema.partial();

export type Indirizzo = z.infer<typeof IndirizzoSchema>;
export type IndirizzoCreateDto = z.infer<typeof CreateIndirizzoSchema>;
export type IndirizzoUpdateDto = z.infer<typeof UpdateIndirizzoSchema>;
