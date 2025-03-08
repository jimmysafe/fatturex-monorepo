import type { SubscriptionStatoType } from "../lib/enums";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v4 as randomUUID } from "uuid";

import { z } from "zod";

import { SubscriptionStato, SubscriptionStatoValues } from "../lib/enums";
import { textEnum } from "../lib/utils";
import { user } from "./auth.schema";

export const subscription = sqliteTable("subscription", {
  id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  stato: textEnum("stato", SubscriptionStatoValues).$type<SubscriptionStatoType>().notNull().default(SubscriptionStato.ATTIVO),
  plan: text("plan").notNull(),
  planId: text("plan_id").notNull(),
  subscriptionId: text("subscription_id").notNull(),
  email: text("email"),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  invoicesLimit: integer("invoices_limit").notNull().default(0),
  invoicesCount: integer("invoices_count").notNull().default(0),
  searchesLimit: integer("searches_limit").notNull().default(0),
  searchesCount: integer("searches_count").notNull().default(0),
  fteEnabled: integer("fte_enabled", { mode: "boolean" }).notNull().default(false),
}, table => [
  index("email_idx").on(table.email),
  index("plan_idx").on(table.plan),
]);

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}));

export const SubscriptionSchema = createSelectSchema(subscription, {
  stato: z.nativeEnum(SubscriptionStato),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const CreateSubscriptionSchema = createInsertSchema(subscription, {
  stato: z.nativeEnum(SubscriptionStato),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).omit({ id: true, updatedAt: true, createdAt: true });

export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type SubscriptionCreateDto = z.infer<typeof CreateSubscriptionSchema>;
export type SubscriptionUpdateDto = z.infer<typeof UpdateSubscriptionSchema>;
