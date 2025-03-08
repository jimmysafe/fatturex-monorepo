import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import * as schema from "./schema";

export type DrizzleDB = LibSQLDatabase<typeof schema>;

export function createDb<E extends { url: string, authToken?: string }>(env: E) {
  const client = createClient({
    url: env.url,
    authToken: env.authToken,
  });

  const db = drizzle(client, {
    schema,
  });

  return { db, client };
}
