import { user } from "@repo/database/schemas/auth.schema";
import { codiceFiscaleRegex, partitaIvaRegex } from "@repo/shared/regex";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";
import { z } from "zod";

export const cliente = sqliteTable("clienti", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  ragioneSociale: text("ragione_sociale"),
  nome: text("nome"),
  cognome: text("cognome"),
  telefono: text("telefono"),
  telefonoFisso: text("telefono_fisso"),
  indirizzoEmail: text("indirizzo_email").notNull(),
  indirizzoPec: text("indirizzo_pec"),
  indirizzo: text("indirizzo").notNull(),
  cap: text("cap").notNull(),
  comune: text("comune").notNull(),
  provincia: text("provincia"),
  paese: text("paese").notNull().default("IT"),
  partitaIva: text("partita_iva"),
  codiceFiscale: text("codice_fiscale"),
  codiceDestinatario: text("codice_destinatario").default("0000000"),

  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const ClienteSchema = createSelectSchema(cliente);

export const CreateClienteSchema = createInsertSchema(cliente, {
  partitaIva: z.string().regex(partitaIvaRegex, "Partita IVA non valida").nullable(),
  codiceFiscale: z.union([
    z.string().regex(codiceFiscaleRegex).toUpperCase(),
    z.string().regex(partitaIvaRegex).toUpperCase(),
  ]).nullable(),
}).omit({ id: true, createdAt: true, updatedAt: true, userId: true });

export const UpdateClienteSchema = CreateClienteSchema.partial();

export const ClienteFilterSchema = z.object({
  search: z.string().optional(),
});

export type Cliente = z.infer<typeof ClienteSchema>;
export type ClienteCreateDto = z.infer<typeof CreateClienteSchema>;
export type ClienteUpdateDto = z.infer<typeof UpdateClienteSchema>;
