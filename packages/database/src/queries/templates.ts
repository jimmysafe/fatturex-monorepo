import type { PaginationParamsSchema } from "@repo/database/pagination/schema";
import type { SQL } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@repo/database/client";
import { getMeta } from "@repo/database/pagination/get-meta";
import { template, template as templateSchema } from "@repo/database/schema";
import { and, eq } from "drizzle-orm";

export async function getTemplates({ userId, ...input }: z.infer<typeof PaginationParamsSchema> & { userId: string }) {
  const { page, per_page, sort } = input;

  const where: SQL | undefined = eq(templateSchema.userId, userId);

  const meta = await getMeta(templateSchema, where, {
    page,
    per_page,
    sort,
  });

  const data = await db.query.template.findMany({
    with: {
      articoli: true,
    },
    where,
    limit: meta.data.perPage,
    offset: meta.skip,
  });

  return { data, meta: meta.data };
}

export async function getTemplate(id: string, userId: string) {
  const where = and(eq(template.id, id), eq(template.userId, userId));
  const data = await db.query.template.findFirst({
    where,
    with: {
      articoli: true,
    },
  });

  if (!data)
    return null;
  return data;
}
