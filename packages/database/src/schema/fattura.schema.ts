import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";
import { z } from "zod";

import type { FatturaMetodoPagamentoType, FatturaPreferenzaDataSaldoType, FatturaStatoType, FteStatoType, StsStatoType } from "@/lib/enums";

import {
  FatturaMetodoPagamento,
  FatturaMetodoPagamentoValues,
  FatturaPreferenzaDataSaldo,
  FatturaPreferenzaDataSaldoValues,
  FatturaStato,
  FatturaStatoValues,
  FteStato,
  FteStatoValues,
  StsStato,
  StsStatoValues,
} from "@/lib/enums";

import { decimal, textEnum } from "@/lib/utils";
import { user } from "./auth.schema";
import { cliente } from "./cliente.schema";
import { indirizzo } from "./indirizzo.schema";

export const fattura = sqliteTable("fatture", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  clienteId: text("cliente_id").notNull().references(() => cliente.id),
  indirizzoId: text("indirizzo_id").notNull().references(() => indirizzo.id),

  numeroProgressivo: integer("numero_progressivo").notNull(),
  numeroProgressivoNotaCredito: integer("numero_progressivo_nota_credito"),

  dataEmissione: integer("data_emissione", { mode: "timestamp" }).notNull(),
  dataSaldo: integer("data_saldo", { mode: "timestamp" }),
  dataNotaCredito: integer("data_nota_credito", { mode: "timestamp" }),

  dataInvioEmail: integer("data_invio_email", { mode: "timestamp" }),
  stato: textEnum("stato", FatturaStatoValues).$type<FatturaStatoType>().notNull(),

  addebitaContributo: integer("addebita_contributo", { mode: "boolean" }).default(false),
  addebitaMarcaDaBollo: integer("addebita_marca_da_bollo", { mode: "boolean" }).default(false),

  totaleFattura: decimal("totale_fattura").notNull().default(0),
  parzialeFattura: decimal("parziale_fattura").notNull().default(0),
  contributo: decimal("contributo").default(0),
  saldoGs: decimal("saldo_gs").notNull().default(0),
  accontoGs: decimal("acconto_gs").notNull().default(0),
  residuoGs: decimal("residuo_gs").notNull().default(0),
  totaleGs: decimal("totale_gs").notNull().default(0),
  daPagareGs: decimal("da_pagare_gs").notNull().default(0),

  netto: decimal("netto").notNull().default(0),
  ricavo: decimal("ricavo").notNull().default(0),
  ricavoTassabile: decimal("ricavo_tassabile").notNull().default(0),
  ril: decimal("ril").notNull().default(0),

  saldoIs: decimal("saldo_is").default(0),
  rilIs: decimal("ril_is").default(0),
  accontoIs: decimal("acconto_is").default(0),
  residuoIs: decimal("residuo_is").default(0),
  totaleIs: decimal("totale_is").default(0),
  daPagareIs: decimal("da_pagare_is").default(0),

  totaleTasse: decimal("totale_tasse").notNull().default(0),
  integrativo: decimal("integrativo").notNull().default(0),
  modulare: decimal("modulare").notNull().default(0),
  soggettivo: decimal("soggettivo").notNull().default(0),

  idMarcaDaBollo: text("id_marca_da_bollo"),
  metodoPagamento: textEnum("metodo_pagamento", FatturaMetodoPagamentoValues).$type<FatturaMetodoPagamentoType>().notNull(),
  preferenzaDataSaldo: textEnum("preferenza_data_saldo", FatturaPreferenzaDataSaldoValues).$type<FatturaPreferenzaDataSaldoType>().notNull().default(FatturaPreferenzaDataSaldo.IMMEDIATO),

  stsStato: textEnum("sts_stato", StsStatoValues).$type<StsStatoType>().notNull().default(StsStato.NON_INVIATA),
  stsProtocollo: text("sts_protocollo"),

  fteStato: textEnum("fte_stato", FteStatoValues).$type<FteStatoType>().notNull().default(FteStato.NON_INVIATA),
  fteId: text("fte_id", { length: 36 }),
  fteError: text("fte_error"),

  lingua: text("lingua").notNull().default("IT"),
});

export const fatturaArticolo = sqliteTable("fattura_articoli", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  descrizione: text("descrizione").notNull(),
  quantita: integer("quantita").notNull().default(1),
  prezzo: decimal("prezzo").notNull(),

  fatturaId: text("fattura_id")
    .notNull()
    .references(() => fattura.id, { onDelete: "cascade" }),
});

export const fatturaArticoloRelations = relations(fatturaArticolo, ({ one }) => ({
  fattura: one(fattura, {
    fields: [fatturaArticolo.fatturaId],
    references: [fattura.id],
  }),
}));

export const fatturaRelations = relations(fattura, ({ many, one }) => ({
  articoli: many(fatturaArticolo),
  user: one(user, {
    fields: [fattura.userId],
    references: [user.id],
  }),
  cliente: one(cliente, {
    fields: [fattura.clienteId],
    references: [cliente.id],
  }),
  indirizzo: one(indirizzo, {
    fields: [fattura.indirizzoId],
    references: [indirizzo.id],
  }),
}));

export const FatturaArticoloSchema = createSelectSchema(fatturaArticolo, { prezzo: z.coerce.number(), quantita: z.coerce.number() });
export const CreateFatturaArticoloSchema = createInsertSchema(fatturaArticolo, { prezzo: z.coerce.number(), quantita: z.coerce.number(), fatturaId: z.string().uuid().optional() }).omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateFatturaArticoloSchema = CreateFatturaArticoloSchema.partial().extend({ id: z.string().uuid().optional() });

export type FatturaArticolo = z.infer<typeof FatturaArticoloSchema>;
export type FatturaArticoloCreateDto = z.infer<typeof CreateFatturaArticoloSchema>;
export type FatturaArticoloUpdateDto = z.infer<typeof UpdateFatturaArticoloSchema>;

export const FatturaSchema = createSelectSchema(fattura, {
  metodoPagamento: z.nativeEnum(FatturaMetodoPagamento),
  preferenzaDataSaldo: z.nativeEnum(FatturaPreferenzaDataSaldo),
  stato: z.nativeEnum(FatturaStato),
  stsStato: z.nativeEnum(StsStato),
  fteStato: z.nativeEnum(FteStato),
}).extend({ articoli: z.array(FatturaArticoloSchema) });

export const CreateFatturaSchema = createInsertSchema(fattura, {
  numeroProgressivo: z.coerce.number(),
  dataSaldo: z.coerce.date().nullish(),
  dataEmissione: z.coerce.date(),
  metodoPagamento: z.nativeEnum(FatturaMetodoPagamento),
  fteStato: z.nativeEnum(FteStato).optional(),
  preferenzaDataSaldo: z.nativeEnum(FatturaPreferenzaDataSaldo).optional(),
  stato: z.nativeEnum(FatturaStato),
  stsStato: z.nativeEnum(StsStato).optional(),
}).omit({ id: true, userId: true, createdAt: true, updatedAt: true }).extend({ articoli: z.array(CreateFatturaArticoloSchema).default([]) });

export const UpdateFatturaSchema = CreateFatturaSchema.partial().extend({ articoli: z.array(UpdateFatturaArticoloSchema).default([]) });

export const FatturaFilterSchema = z.object({
  stato: z.nativeEnum(FatturaStato).optional(),
  annoEmissione: z.string().length(4).optional(),
  annoSaldo: z.string().length(4).optional(),
});

export const FattureExportSchema = z.object({
  anno: z.string().length(4),
  stato: z.nativeEnum(FatturaStato),
});

export type Fattura = z.infer<typeof FatturaSchema>;
export type FatturaCreateDto = z.infer<typeof CreateFatturaSchema>;
export type FatturaUpdateDto = z.infer<typeof UpdateFatturaSchema>;

export const StsInvioSchema = z.object({
  username: z.string(),
  pincode: z.string(),
  password: z.string(),
  flagOpposizione: z.boolean().default(false),
});

export const StsCancellazioneSchema = StsInvioSchema.omit({ flagOpposizione: true });
