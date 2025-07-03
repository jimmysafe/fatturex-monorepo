import type { UserCassaType, UserRolesType } from "@repo/database/lib/enums";

import { UserCassa, UserCassaValues, UserRoles, UserRolesValues } from "@repo/database/lib/enums";
import { textEnum } from "@repo/database/lib/utils";
import { document } from "@repo/database/schemas/document.schema";
import { partitaIva } from "@repo/database/schemas/partita-iva.schema";
import { subscription } from "@repo/database/schemas/subscription.schema";
import { PRIMARY_COLOR } from "@repo/shared/const";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  name: text("name").notNull(), //  better auth display name
  nome: text("nome"),
  cognome: text("cognome"),
  telefono: text("telefono"),
  onboarded: integer("onboarded", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  dataDiNascita: integer("data_di_nascita", { mode: "timestamp" }),
  role: textEnum("role", UserRolesValues).$type<UserRolesType>().notNull().default(UserRoles.USER),
  cassa: textEnum("cassa", UserCassaValues).$type<UserCassaType>(),
  logoPath: text("logo_path"),
  themeColor: text("theme_color").default(PRIMARY_COLOR),
  customerId: text("customer_id"),
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const usersRelations = relations(user, ({ one, many }) => ({
  partitaIva: one(partitaIva),
  subscription: one(subscription),
  documents: many(document),
}));

export const UserSchema = createSelectSchema(user, {
  role: z.nativeEnum(UserRoles),
  cassa: z.nativeEnum(UserCassa),
});

export const CreateUserSchema = createInsertSchema(user, {
  role: z.nativeEnum(UserRoles).optional(),
  cassa: z.nativeEnum(UserCassa),
}).omit({ id: true });

export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type UserCreateDto = z.infer<typeof CreateUserSchema>;
export type UserUpdateDto = z.infer<typeof UpdateUserSchema>;

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  impersonatedBy: text("impersonated_by"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
