import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { decimal } from "../lib/utils";

export const codiceAteco = sqliteTable("codice_ateco", {
  codice: text("codice").primaryKey(),
  genitoreId: text("genitore_id"),
  sezione: text("sezione").notNull(),
  descrizione: text("descrizione"),
  coefficienteRedditivita: decimal("coefficiente_redditivita").notNull(),
});

export const CodiceAtecoSchema = createSelectSchema(codiceAteco, { coefficienteRedditivita: z.number() });
export const CreateCodiceAtecoSchema = createInsertSchema(codiceAteco, { coefficienteRedditivita: z.number() });
export const UpdateCodiceAtecoSchema = CreateCodiceAtecoSchema.partial();

export const CodiceAtecoFilterSchema = z.object({
  search: z.string().optional(),
});

export type CodiceAteco = z.infer<typeof CodiceAtecoSchema>;
export type CodiceAtecoCreateDto = z.infer<typeof CreateCodiceAtecoSchema>;
export type CodiceAtecoUpdateDto = z.infer<typeof UpdateCodiceAtecoSchema>;
