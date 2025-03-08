import type { z } from "zod";

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";

import type { UserCassaType } from "@/lib/enums";

import { UserCassaValues } from "@/lib/enums";

import { decimal, textEnum } from "@/lib/utils";

export const tassaMaternita = sqliteTable("tassa_maternita", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),

  anno: integer("anno").notNull(),
  cassa: textEnum("cassa", UserCassaValues).$type<UserCassaType>().notNull(),
  prezzo: decimal("prezzo").notNull(),
});

export const TassaMaternitaSchema = createSelectSchema(tassaMaternita);
export const CreateTassaMaternitaSchema = createInsertSchema(tassaMaternita).omit({ id: true });
export const UpdateTassaMaternitaSchema = CreateTassaMaternitaSchema.partial();

export type TassaMaternita = z.infer<typeof TassaMaternitaSchema>;
export type TassaMaternitaCreateDto = z.infer<typeof CreateTassaMaternitaSchema>;
export type TassaMaternitaUpdateDto = z.infer<typeof UpdateTassaMaternitaSchema>;
