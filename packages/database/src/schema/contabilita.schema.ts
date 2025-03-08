import type { EnpapiTipoAgevolazioneType } from "../lib/enums";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";

import { z } from "zod";

import { EnpapiTipoAgevolazione, EnpapiTipoAgevolazioneValues } from "../lib/enums";
import { decimal, textEnum } from "../lib/utils";
import { user } from "./auth.schema";

export const contabilita = sqliteTable("contabilita", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  anno: integer("anno").notNull(),
  daRicalcolare: integer("da_ricalcolare", { mode: "boolean" }).notNull().default(false),
  fatturato: decimal("fatturato").notNull().default(0),
  totaleTasse: decimal("totale_tasse").notNull().default(0),
  redditoNetto: decimal("reddito_netto").notNull().default(0),
  daPagare: decimal("da_pagare").notNull().default(0),
  contributiVersati: decimal("contributi_versati").notNull().default(0),
  saldo: decimal("saldo").notNull().default(0),
  acconto: decimal("acconto").notNull().default(0),
  residuo: decimal("residuo").notNull().default(0),
  ril: decimal("ril").notNull().default(0),
  contributoSoggettivo: decimal("contributo_soggettivo").notNull().default(0),
  contributoIntegrativo: decimal("contributo_integrativo").notNull().default(0),
  contributoModulare: decimal("contributo_modulare").notNull().default(0),
  contributoSoggettivoMinimo: decimal("contributo_soggettivo_minimo").notNull().default(0),
  contributoIntegrativoMinimo: decimal("contributo_integrativo_minimo").notNull().default(0),
  contributoModulareMinimo: decimal("contributo_modulare_minimo").notNull().default(0),
  accontoIs: decimal("acconto_is").notNull().default(0),
  daPagareIs: decimal("da_pagare_is").notNull().default(0),
  residuoIs: decimal("residuo_is").notNull().default(0),
  saldoIs: decimal("saldo_is").notNull().default(0),
  percentualeModulare: decimal("percentuale_modulare").notNull().default(0),
  agevolazione: integer("agevolazione", { mode: "boolean" }).notNull().default(false),
  enpapiTipoAgevolazione: textEnum("enpapi_tipo_agevolazione", EnpapiTipoAgevolazioneValues).$type<EnpapiTipoAgevolazioneType>().notNull().default(EnpapiTipoAgevolazione.NOT_SET),
});

export const contabilitaRelations = relations(contabilita, ({ one }) => ({
  user: one(user, {
    fields: [contabilita.userId],
    references: [user.id],
  }),
}));

export const ContabilitaSchema = createSelectSchema(contabilita, {
  enpapiTipoAgevolazione: z.nativeEnum(EnpapiTipoAgevolazione).optional(),
});
export const CreateContabilitaSchema = createInsertSchema(contabilita, {
  enpapiTipoAgevolazione: z.nativeEnum(EnpapiTipoAgevolazione).optional(),
}).omit({ id: true });

export const UpdateContabilitaSchema = CreateContabilitaSchema.partial();

export type Contabilita = z.infer<typeof ContabilitaSchema>;
export type ContabilitaCreateDto = z.infer<typeof CreateContabilitaSchema>;
export type ContabilitaUpdateDto = z.infer<typeof UpdateContabilitaSchema>;
