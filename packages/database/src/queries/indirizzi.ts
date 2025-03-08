import type { PaginationParamsSchema } from "@repo/database/pagination/schema";
import type { SQL } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@repo/database/client";
import { getMeta } from "@repo/database/pagination/get-meta";
import { indirizzo as indirizzoSchema } from "@repo/database/schema";
import { and, eq } from "drizzle-orm";

type GetIndirizziArgs = z.infer<typeof PaginationParamsSchema> & { userId: string };
export async function getIndirizzi({ userId, ...input }: GetIndirizziArgs) {
  const { page, per_page, sort } = input;
  const where: SQL | undefined = eq(indirizzoSchema.userId, userId);

  const meta = await getMeta(indirizzoSchema, where, {
    page,
    per_page,
    sort,
  });

  const data = await db
    .select()
    .from(indirizzoSchema)
    .where(where)
    .limit(meta.data.perPage)
    .offset(meta.skip);

  return { data, meta: meta.data };
}

export async function getIndirizzo(id: string, userId: string) {
  const where = and(eq(indirizzoSchema.id, id), eq(indirizzoSchema.userId, userId));

  const data = await db.query.indirizzo.findFirst({ where });

  if (!data)
    return null;

  return data;
}
