import { decimal } from "@repo/database/lib/utils";
import { user } from "@repo/database/schemas/auth.schema";
import { codiceFiscaleRegex } from "@repo/shared/regex";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";
import { z } from "zod";

export const partitaIva = sqliteTable("partita_iva", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  codiceFiscale: text("codice_fiscale").notNull(),
  numero: text("numero").notNull().unique(),
  codiceAteco: text("codice_ateco").notNull(),
  dataApertura: integer("data_apertura", { mode: "timestamp" }).notNull(),
  indirizzo: text("indirizzo").notNull(),
  cap: text("cap").notNull(),
  comune: text("comune").notNull(),
  provincia: text("provincia").notNull(),
  paese: text("paese").notNull().default("IT"),
  coefficienteRedditivita: decimal("coefficiente_redditivita").notNull(),
  iban: text("iban"),
  ibanIntestatario: text("iban_intestatario"),
  ibanBanca: text("iban_banca"),
  dataIscrizioneCassa: integer("data_iscrizione_cassa", { mode: "timestamp" }),
  fteConfigurationId: text("fte_configuration_id"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const partitaIvaRelations = relations(partitaIva, ({ one }) => ({
  user: one(user, {
    fields: [partitaIva.userId],
    references: [user.id],
  }),
}));

export const PartitaIvaSchema = createSelectSchema(partitaIva, { coefficienteRedditivita: z.number() });
export const CreatePartitaIvaSchema = createInsertSchema(partitaIva, { coefficienteRedditivita: z.number(), codiceFiscale: z.string().regex(codiceFiscaleRegex).toUpperCase() }).omit({ id: true, createdAt: true, updatedAt: true });
export const UpdatePartitaIvaSchema = CreatePartitaIvaSchema.partial();

export type PartitaIva = z.infer<typeof PartitaIvaSchema>;
export type PartitaIvaCreateDto = z.infer<typeof CreatePartitaIvaSchema>;
export type PartitaIvaUpdateDto = z.infer<typeof UpdatePartitaIvaSchema>;
