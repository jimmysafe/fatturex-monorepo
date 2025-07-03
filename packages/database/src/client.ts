/* eslint-disable node/no-process-env */
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { createClient } from "@libsql/client";
import * as schema from "@repo/database/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

export type DrizzleDB = LibSQLDatabase<typeof schema>;

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema,
});

// Function to ensure foreign key constraints are enabled
export async function enableForeignKeys() {
  await db.run(sql`PRAGMA foreign_keys = ON`);
}

// Enable foreign key constraints by default for development
if (process.env.NODE_ENV !== "production") {
  enableForeignKeys().catch(console.error);
}
