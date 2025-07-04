import type { FteStatoType } from "@repo/database/lib/enums";

import {
  FteStato,
  FteStatoValues,
} from "@repo/database/lib/enums";
import { decimal, textEnum } from "@repo/database/lib/utils";
import { user } from "@repo/database/schemas/auth.schema";
import { fattura } from "@repo/database/schemas/fattura.schema";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";
import { z } from "zod";

export const notaDiCredito = sqliteTable("nota_di_credito", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  mode: text("mode").notNull(),

  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),

  numeroProgressivo: integer("numero_progressivo").notNull(),

  dataNotaCredito: integer("data_nota_credito", { mode: "timestamp" }),

  totale: decimal("totale_fattura").notNull().default(0),

  fteStato: textEnum("fte_stato", FteStatoValues).$type<FteStatoType>().notNull().default(FteStato.NON_INVIATA),
  fteId: text("fte_id", { length: 36 }),
  fteError: text("fte_error"),

  fatturaId: text("fattura_id")
    .notNull()
    .references(() => fattura.id, { onDelete: "cascade" }),

  lingua: text("lingua").notNull().default("IT"),
});

export const notaDiCreditoRelations = relations(notaDiCredito, ({ one }) => ({
  fattura: one(fattura, {
    fields: [notaDiCredito.fatturaId],
    references: [fattura.id],
  }),
}));

export const NotaDiCreditoSchema = createSelectSchema(notaDiCredito, {
  fteStato: z.nativeEnum(FteStato),
});

export const CreateNotaDiCreditoSchema = createInsertSchema(notaDiCredito, {
  numeroProgressivo: z.coerce.number(),
  fteStato: z.nativeEnum(FteStato).optional(),
}).omit({ id: true, userId: true, createdAt: true, updatedAt: true });

export const UpdateNotaDiCreditoSchema = CreateNotaDiCreditoSchema.partial();
